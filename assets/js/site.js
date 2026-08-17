/* Nualia: interaction layer.
   Everything here is progressive: with JS off the page still reads, and every
   motion is disabled under prefers-reduced-motion. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- a real haptic tick on the primary actions, where the device allows it.
         Silent and harmless everywhere else. ------------------------------ */
  function tick(ms) {
    if (reduced) return;
    if (navigator.vibrate) { try { navigator.vibrate(ms || 8); } catch (e) {} }
  }
  document.addEventListener('pointerdown', function (e) {
    if (e.target.closest('.btn, .acc__btn, .hdr__burger')) tick(9);
  }, { passive: true });

  /* --- header: reversed over the hero, plaster once you leave it -------- */
  var hdr = document.querySelector('.hdr');
  var hero = document.querySelector('.hero');
  function onScroll() {
    if (!hdr) return;
    var past = hero ? window.scrollY > hero.offsetHeight - 90 : window.scrollY > 40;
    hdr.classList.toggle('is-stuck', past);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- mobile navigation ------------------------------------------------ */
  var burger = document.querySelector('.hdr__burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.hdr__nav a').forEach(function (a) {
      a.addEventListener('click', function () { document.body.classList.remove('nav-open'); });
    });
  }

  /* --- reveal on scroll, with a stagger inside groups ------------------- */
  var rise = document.querySelectorAll('[data-rise]');
  if (!('IntersectionObserver' in window) || reduced) {
    rise.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var d = parseFloat(el.getAttribute('data-rise')) || 0;
        el.style.transitionDelay = d + 'ms';
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    rise.forEach(function (el) { io.observe(el); });
  }

  /* --- the rings: one ring drawn per year, in sequence ------------------
         Each ring is two arcs rising from the horizon and closing at the
         apex, grouped by data-ring. The innermost ring is year one, and a
         ring closes completely before the next one begins. --------------- */
  var ringArt = document.querySelector('.rings__art');
  if (ringArt) {
    var RING_MS = 820;   // one ring, tangent point to closed. Matches the CSS.
    var GAP_MS  = 90;    // breath between one ring closing and the next
    var LINE_MS = 900;   // the horizon

    document.querySelectorAll('.rings__art .ring, .rings__art .horizon')
      .forEach(function (s) {
        var len = s.tagName === 'line'
          ? Math.abs(s.x2.baseVal.value - s.x1.baseVal.value)
          : s.getTotalLength();
        s.style.setProperty('--len', len);
      });

    // group the arcs by ring so a ring is one beat, not two
    var groups = [];
    ringArt.querySelectorAll('.ring').forEach(function (a) {
      var i = +a.getAttribute('data-ring');
      (groups[i] = groups[i] || []).push(a);
    });

    var years = document.querySelectorAll('.years li');
    var play = function () {
      var horizon = ringArt.querySelector('.horizon');
      if (horizon) horizon.classList.add('on');
      groups.forEach(function (arcs, i) {
        setTimeout(function () {
          arcs.forEach(function (a) { a.classList.add('on'); });
          if (years[i]) years[i].classList.add('on');
        }, reduced ? 0 : LINE_MS + GAP_MS + i * (RING_MS + GAP_MS));
      });
    };
    if (!('IntersectionObserver' in window) || reduced) { play(); }
    else {
      var ro = new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) { play(); ro.disconnect(); }
      }, { threshold: 0.35 });
      ro.observe(ringArt);
    }
  }

  /* --- the day: each step's hairline draws itself as it arrives --------- */
  var steps = document.querySelectorAll('.day__step');
  if (steps.length && 'IntersectionObserver' in window && !reduced) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var i = [].indexOf.call(steps, en.target);
        setTimeout(function () { en.target.classList.add('on'); }, i * 160);
        so.unobserve(en.target);
      });
    }, { threshold: 0.3 });
    steps.forEach(function (s) { so.observe(s); });
  } else {
    steps.forEach(function (s) { s.classList.add('on'); });
  }

  /* --- counting numbers ------------------------------------------------- */
  var stats = document.querySelectorAll('[data-count]');
  if (stats.length) {
    var run = function (el) {
      var to = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var dur = 1400, t0 = null;
      if (reduced) { el.textContent = to + suffix; return; }
      var frame = function (t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = (to % 1 ? (to * e).toFixed(1) : Math.round(to * e)) + suffix;
        if (p < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };
    if ('IntersectionObserver' in window) {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { run(en.target); co.unobserve(en.target); }
        });
      }, { threshold: 0.6 });
      stats.forEach(function (s) { co.observe(s); });
    } else { stats.forEach(run); }
  }

  /* --- gentle parallax on the full-width image bands -------------------- */
  var bands = document.querySelectorAll('.band img');
  if (bands.length && !reduced) {
    var ticking = false;
    var park = function () {
      bands.forEach(function (img) {
        var r = img.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
        var p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
        img.style.transform = 'translateY(' + (p * -7).toFixed(2) + '%)';
      });
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(park); }
    }, { passive: true });
    park();
  }

  /* --- accordion -------------------------------------------------------- */
  document.querySelectorAll('.acc__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.acc__item');
      var panel = item.querySelector('.acc__panel');
      var open = item.classList.contains('open');
      item.classList.toggle('open', !open);
      btn.setAttribute('aria-expanded', !open ? 'true' : 'false');
      panel.style.height = open ? '0px' : panel.firstElementChild.offsetHeight + 'px';
    });
  });

  /* --- the enquiry form is a demo: nothing is sent anywhere ------------- */
  document.querySelectorAll('form[data-demo]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      tick(14);
      var msg = f.querySelector('.form__done');
      if (msg) { msg.hidden = false; }
      f.querySelectorAll('input,textarea,select,button').forEach(function (i) { i.disabled = true; });
    });
  });
})();
