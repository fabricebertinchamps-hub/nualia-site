/* Nualia: interaction layer v2 (November 2026).
   Icon drawing, reading progress, section dots, swipe rows, the phone call
   bar and haptics. Everything is progressive and respects reduced motion. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* --- haptics on every control that changes state ---------------------- */
  document.addEventListener('pointerdown', function (e) {
    if (reduced || !navigator.vibrate) return;
    if (e.target.closest('.seg button, .regions button, .zone, .dots a, .lnk, .callbar a, .film__play, .swipe-hint i')) {
      try { navigator.vibrate(7); } catch (x) {}
    }
  }, { passive: true });

  /* --- icons draw their own line once they arrive ----------------------- */
  var icons = $$('.icon svg').map(function (s) { return s.parentElement; });
  if ('IntersectionObserver' in window && !reduced && icons.length) {
    icons.forEach(function (ic) {
      ic.classList.add('draw');
      $$('path,circle,rect,line,polyline,ellipse', ic).forEach(function (el) {
        var l = 120; try { l = Math.ceil(el.getTotalLength()) + 2; } catch (x) {}
        el.style.setProperty('--l', l);
      });
    });
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        setTimeout(function () { e.target.classList.add('drawn'); }, 150);
        io.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    icons.forEach(function (ic) { io.observe(ic); });
  }

  /* --- reading progress and section dots (long pages only) -------------- */
  var long = document.body.getAttribute('data-page') === 'home' || document.body.getAttribute('data-page') === 'scan';
  if (long) {
    var bar = document.createElement('div'); bar.className = 'progress'; bar.innerHTML = '<i></i>';
    document.body.appendChild(bar);
    var fill = bar.firstChild;
    var secs = $$('body > section').filter(function (s) { return s.querySelector('h1,h2'); });
    var nav = document.createElement('nav'); nav.className = 'dots'; nav.setAttribute('aria-label', 'Sections');
    secs.forEach(function (s, i) {
      if (!s.id) s.id = 's' + (i + 1);
      var eb = s.querySelector('.eyebrow'), h = s.querySelector('h1,h2');
      var label = eb ? eb.textContent.trim() : h.textContent.trim();
      if (label.length > 28) label = label.slice(0, 26) + '…';
      var a = document.createElement('a'); a.href = '#' + s.id; a.setAttribute('aria-label', label);
      a.innerHTML = '<span>' + label + '</span>'; nav.appendChild(a);
    });
    document.body.appendChild(nav);
    var dots = $$('a', nav);
    var ticking = false;
    var update = function () {
      var h = document.documentElement.scrollHeight - innerHeight;
      fill.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')';
      var mid = innerHeight * 0.45, cur = -1;
      secs.forEach(function (s, i) { var r = s.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid) cur = i; });
      dots.forEach(function (d, i) { d.classList.toggle('on', i === cur); });
      var under = document.elementFromPoint(innerWidth - 26, innerHeight / 2);
      var sec = under && under.closest('section,footer');
      nav.classList.toggle('on-dark', !!(sec && (sec.matches('.bg-deep,.bg-lagoon,.hero,.ftr,.band'))));
      ticking = false;
    };
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update); update();
  }

  /* --- swipe rows on phones, with a small position indicator ------------ */
  $$('.swipe').forEach(function (row) {
    var n = row.children.length; if (n < 2) return;
    var hint = document.createElement('div'); hint.className = 'swipe-hint'; hint.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < n; i++) hint.appendChild(document.createElement('i'));
    row.parentNode.insertBefore(hint, row.nextSibling);
    var mark = function () {
      var w = row.children[0].getBoundingClientRect().width + 14;
      var k = Math.round(row.scrollLeft / w);
      $$('i', hint).forEach(function (d, j) { d.classList.toggle('on', j === k); });
    };
    row.addEventListener('scroll', function () { requestAnimationFrame(mark); }, { passive: true });
    mark();
  });

  /* --- phone call bar: appears after the first screen while you read
         downward, steps aside when you scroll back up or reach the end --- */
  var page = document.body.getAttribute('data-page');
  if (page !== 'contact') {
    var cb = document.createElement('div'); cb.className = 'callbar';
    cb.innerHTML = '<span>Questions first? Talk to us.</span><a class="btn btn--light" href="contact.html">Request a call</a>';
    document.body.appendChild(cb);
    var last = scrollY;
    var foot = document.querySelector('.ftr');
    addEventListener('scroll', function () {
      var y = scrollY, down = y > last + 2, up = y < last - 2;
      var nearEnd = foot && foot.getBoundingClientRect().top < innerHeight;
      if (y < innerHeight * 0.9 || nearEnd || up) cb.classList.remove('show');
      else if (down) cb.classList.add('show');
      last = y;
    }, { passive: true });
  }
})();
