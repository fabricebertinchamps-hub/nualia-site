/* Nualia: The scan page. Film control, technique lists, the body map.
   Progressive: with JS off, the page still reads; the body map needs JS. */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };

  /* Icons: the Nualia MRI-technique set, 24-unit grid, 1.5 stroke. */
  var IC = {
    dwi:'<circle cx="12" cy="12" r="8.5"/><path d="M7 13.5l2.2-3.6 2.2 4.6 2.2-6 2 4.2 1.4-1.6"/><circle cx="16.9" cy="11.1" r="1" fill="currentColor" stroke="none"/>',
    dixon:'<circle cx="9.3" cy="12" r="5.6"/><circle cx="14.7" cy="12" r="5.6"/><path d="M12 7.3v9.4" stroke-dasharray="1.4 1.6"/>',
    t2:'<path d="M12 3.5c3.2 4.2 5.6 7.2 5.6 10.2a5.6 5.6 0 0 1-11.2 0c0-3 2.4-6 5.6-10.2z"/><path d="M9.3 14.2a2.8 2.8 0 0 0 2.4 2.6"/>',
    stir:'<path d="M12 3.5c3.2 4.2 5.6 7.2 5.6 10.2a5.6 5.6 0 0 1-11.2 0c0-3 2.4-6 5.6-10.2z"/><path d="M4.5 19.5L19.5 4.5"/>',
    flair:'<path d="M12 5.2c-1.9-1.7-5.3-.9-5.8 1.8-2 .5-2.6 3.4-1.1 4.9-1 2 .1 4.4 2.5 4.5 1 1.8 3.4 2.1 4.4.6 1 1.5 3.4 1.2 4.4-.6 2.4-.1 3.5-2.5 2.5-4.5 1.5-1.5.9-4.4-1.1-4.9-.5-2.7-3.9-3.5-5.8-1.8z"/><path d="M12 5.2v12.6"/><circle cx="15.2" cy="10.2" r="1.1" fill="currentColor" stroke="none"/>',
    mprage:'<path d="M12 3l7.5 4.2v8.6L12 20l-7.5-4.2V7.2z"/><path d="M12 11.4l7.5-4.2M12 11.4L4.5 7.2M12 11.4V20"/>',
    liver:'<path d="M4.2 16.5a7.8 7.8 0 0 1 15.6 0"/><path d="M12 16.5l3.6-4.6"/><circle cx="12" cy="16.5" r="1.1" fill="currentColor" stroke="none"/><path d="M6.4 11.2l1 .8M12 8.7v1.3M17.6 11.2l-1 .8"/>',
    prostate:'<circle cx="12" cy="12" r="6.2"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/>',
    pelvis:'<path d="M4 6.5c0 6.8 3.6 11.5 8 11.5s8-4.7 8-11.5"/><path d="M8.6 7c.5 3 1.8 4.9 3.4 4.9s2.9-1.9 3.4-4.9"/>',
    breast:'<rect x="2.8" y="7" width="7.4" height="10" rx="1.2"/><rect x="13.8" y="7" width="7.4" height="10" rx="1.2"/><circle cx="17.5" cy="12" r="1.5" fill="currentColor" stroke="none"/><path d="M10.9 12h2.2M12.3 10.8l1.2 1.2-1.2 1.2"/>',
    contrast:'<path d="M14.2 4.2l5.6 5.6M17 7l-9.4 9.4-3.2.6.6-3.2L14.4 4.4"/><path d="M4.4 19.6l2-2M10.6 8.8l4.6 4.6"/>',
    station:'<rect x="2.5" y="9" width="19" height="6" rx="1"/><path d="M6.3 9v6M10.1 9v6M13.9 9v6M17.7 9v6"/>',
    lung:'<path d="M10.6 7.5v5.2c0 4-2 6.8-4.9 6.8-1.5 0-2.1-1.4-2.1-3.4 0-4.4 2.7-7.8 7-8.6z"/><path d="M13.4 7.5v5.2c0 4 2 6.8 4.9 6.8 1.5 0 2.1-1.4 2.1-3.4 0-4.4-2.7-7.8-7-8.6z"/><path d="M12 3.5v6"/>'
  };
  function svg(k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IC[k] || '') + '</svg>'; }
  document.querySelectorAll('[data-ic]').forEach(function (el) { el.innerHTML = svg(el.getAttribute('data-ic')); });

  /* Techniques, in member language. */
  var T = {
    dwi:{n:'Whole-body diffusion', d:'The main detector: spots where cells are packed tightly, anywhere from head to thigh.'},
    dixon:{n:'T1 Dixon', d:'Water and fat separated: the anatomy of every organ, and the bone marrow.'},
    t2:{n:'T2, breath-held', d:'Fluid made bright: cysts against solid lumps, the lungs, the bowel and the pelvis.'},
    flair:{n:'3D FLAIR brain', d:'1 mm slices with the brain fluid switched off, so small white-matter spots stand out.'},
    mprage:{n:'3D T1 brain', d:'A high-definition model of the brain, measured for volume at your first scan.'},
    stir:{n:'Spine T1 and STIR', d:'Each vertebra and its marrow, with swelling made visible.'},
    liver:{n:'Liver fat and iron', d:'Two short breath-holds give real numbers, comparable every year.'},
    prostate:{n:'Prostate pair', d:'A dedicated sharp T2 and diffusion, scored on the international PI-RADS scale. No injection.'},
    pelvis:{n:'Female pelvis', d:'A fine side view of the uterus and ovaries, with a finer diffusion of the pelvis.'},
    breast:{n:'Abbreviated breast MRI', d:'Before and after a small dose of contrast: the most sensitive breast imaging there is.'},
    lung:{n:'Lungs', d:'Read from the breath-held T2. Low-dose CT remains the lung test for smokers.'}
  };
  function li(k, extra) { return '<li><span class="icon">' + svg(k) + '</span><div><b>' + T[k].n + '</b><span>' + T[k].d + '</span>' + (extra ? '<em>' + extra + '</em>' : '') + '</div></li>'; }
  var core = $('#coreList'), blocks = $('#blockList');
  if (core) core.innerHTML = li('dwi') + li('dixon') + li('t2') + li('flair', 'Brain, every year') + li('stir', 'Spine, every year') + li('liver', 'Liver, every year');
  if (blocks) blocks.innerHTML = li('mprage', 'First scan, then on a schedule') + li('prostate', 'Men from 45, or 40 with family risk') + li('pelvis', 'Every woman') + li('breast', 'Women from 40, timed to the cycle');

  /* Film: a quiet play button over the poster. */
  var film = $('.film'), v = $('#filmVideo'), pb = $('.film__play');
  if (film && v && pb) {
    pb.addEventListener('click', function () { v.controls = true; v.play(); });
    v.addEventListener('play', function () { film.classList.add('is-playing'); });
    v.addEventListener('pause', function () { if (v.currentTime < .5) film.classList.remove('is-playing'); });
  }

  /* Body map. Coordinates are in the 1457 x 812 original illustration; the
     displayed crop starts at (100, 180). */
  var stage = $('#stage');
  if (!stage) return;
  var REG = [
    {id:'head', name:'Brain', s:{e:[292,402,62,66]}, lab:[245,318], who:'Every member, every year',
     look:['Brain tumours and meningiomas','White-matter spots linked to blood pressure and age','Old silent strokes','A brain-volume baseline to follow over the years'],
     tech:['flair','mprage','dwi']},
    {id:'neck', name:'Neck', s:{e:[395,425,40,42]}, lab:[405,300], who:'Every member, every year',
     look:['Thyroid nodules that matter (from about 1.5 cm, or if suspicious)','Lymph nodes','Throat and salivary-gland masses'],
     tech:['dwi','dixon','t2']},
    {id:'chest', name:'Chest and lungs', s:{e:[540,428,105,58]}, lab:[520,336], who:'Every member, every year',
     look:['Lung nodules from about 6 mm, compared year on year','Lymph nodes in the chest','The width of the aorta','Masses of the chest wall'],
     tech:['dwi','t2','dixon','lung'], note:'Low-dose CT remains the lung screening test for smokers; MRI does not replace it.'},
    {id:'breast', name:'Breasts', sex:'f', s:{p:'M470 402 C492 383 516 368 548 365 C580 363 608 364 630 368 C626 384 604 397 578 402 C540 408 505 407 470 402 Z'}, lab:[600,300], who:'Women from 40, timed to the cycle',
     look:['Invasive breast cancer, which takes up contrast quickly','Changes since your last scan'],
     tech:['breast','contrast'], note:'A separate block at the end, lying face down in a breast coil. Mammography continues alongside: MRI does not see micro-calcifications.'},
    {id:'spine', name:'Spine and marrow', s:{r:[360,468,460,26]}, lab:[600,620], who:'Every member, every year',
     look:['Lesions inside the vertebrae','Changes in the bone marrow','Fractures and serious narrowing (ordinary wear is not reported)'],
     tech:['stir','dixon','dwi']},
    {id:'abdomen', name:'Liver, kidneys, pancreas', s:{e:[700,428,92,54]}, lab:[740,336], who:'Every member, every year',
     look:['Liver fat and iron, as numbers','Kidney masses','Cysts against solid lumps','Pancreas and adrenal nodules','Spleen and lymph nodes'],
     tech:['liver','dwi','dixon','t2']},
    {id:'pelvis', name:'Pelvis', s:{e:[840,440,52,50]}, lab:[880,300], who:{m:'Men from 45, or 40 with family risk',f:'Every woman, every year'},
     look:{m:['Prostate cancer, scored 1 to 5 on PI-RADS','Prostate volume, read with your PSA','Bladder, lymph nodes, pelvic bones'],
           f:['Uterus, endometrium, fibroids','Ovarian masses','Bladder, lymph nodes, pelvic bones']},
     tech:{m:['prostate','dwi','t2'], f:['pelvis','dwi','t2']},
     note:{m:'No injection and no endorectal coil.', f:'It does not replace cervical screening, the HPV test.'}},
    {id:'thighs', name:'Hips and thighs', s:{e:[900,452,45,40]}, lab:[1000,336], who:'Every member, every year',
     look:['Bone tumours','Soft-tissue masses','Bone marrow'],
     tech:['dwi','dixon','t2']}
  ];
  T.contrast = {n:'Contrast agent', d:'A small dose of the most stable type, used only for the breast block.'};

  var sex = 'm', sel = null, NS = 'http://www.w3.org/2000/svg';
  var ov = $('#overlay'), panel = $('#panel'), btns = $('#regionBtns'), img = $('#bodyImg');
  function pick(v) { return (v && typeof v === 'object' && !Array.isArray(v) && (v.m || v.f)) ? v[sex] : v; }
  function visible() { return REG.filter(function (r) { return !r.sex || r.sex === sex; }); }

  function draw() {
    var h = '';
    visible().forEach(function (r) {
      var cls = 'zone' + (sel === r.id ? ' on' : (sel ? ' dim' : ' pulse'));
      var a = 'class="' + cls + '" data-r="' + r.id + '" tabindex="0" role="button" aria-label="' + r.name + '"';
      if (r.s.e) h += '<ellipse ' + a + ' cx="' + r.s.e[0] + '" cy="' + r.s.e[1] + '" rx="' + r.s.e[2] + '" ry="' + r.s.e[3] + '"/>';
      else if (r.s.r) h += '<rect ' + a + ' x="' + r.s.r[0] + '" y="' + r.s.r[1] + '" width="' + r.s.r[2] + '" height="' + r.s.r[3] + '" rx="10"/>';
      else h += '<path ' + a + ' d="' + r.s.p + '"/>';
    });
    visible().forEach(function (r) {
      if (sel !== r.id) return;
      h += '<text class="zlab" x="' + r.lab[0] + '" y="' + r.lab[1] + '" text-anchor="middle">' + r.name.toUpperCase() + '</text>';
    });
    ov.innerHTML = h;
    btns.innerHTML = visible().map(function (r) { return '<button type="button" data-r="' + r.id + '" aria-pressed="' + (sel === r.id) + '">' + r.name + '</button>'; }).join('');
  }

  function intro() {
    panel.innerHTML = '<p class="eyebrow">How to use</p><h3>Tap a region</h3>' +
      '<p style="margin-top:12px">Each shaded zone is a part of the body we examine. Tap one to see what we look for, who it is for, and which techniques do the work.</p>' +
      '<p class="note">Every member has the complete scan every year: diffusion, T1 Dixon and T2 from the top of the head to mid-thigh, plus the brain, spine and liver sequences. The prostate, pelvis and breast blocks depend on age and sex.</p>';
  }
  function show(id) {
    var r = REG.filter(function (x) { return x.id === id; })[0]; if (!r) { intro(); return; }
    var look = pick(r.look), tech = pick(r.tech), note = pick(r.note), who = pick(r.who);
    panel.innerHTML = '<div class="panel-in"><p class="eyebrow">Region</p><h3>' + r.name + '</h3><p class="who">' + who + '</p>' +
      '<h4>What we look for</h4><ul class="look">' + look.map(function (l) { return '<li>' + l + '</li>'; }).join('') + '</ul>' +
      '<h4>Techniques at work</h4><ul class="tlist">' + tech.map(function (k) { return li(k); }).join('') + '</ul>' +
      (note ? '<p class="note">' + note + '</p>' : '') + '</div>';
  }
  function refresh() {
    var want = 'assets/img/scan/body-' + sex + '.webp';
    if (img.getAttribute('src') !== want) {
      img.classList.add('swap');
      setTimeout(function () {
        img.setAttribute('src', want);
        img.alt = sex === 'f' ? 'Illustration of a woman lying on the MRI table, organs faintly visible' : 'Illustration of a man lying on the MRI table, organs faintly visible';
        img.classList.remove('swap');
      }, 220);
    }
    draw(); if (sel) show(sel); else intro();
  }
  function choose(id) { sel = (sel === id) ? null : id; refresh(); }
  ov.addEventListener('click', function (e) { var z = e.target.closest('[data-r]'); if (z) choose(z.getAttribute('data-r')); });
  ov.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { var z = e.target.closest('[data-r]'); if (z) { e.preventDefault(); choose(z.getAttribute('data-r')); } } });
  btns.addEventListener('click', function (e) { var b = e.target.closest('[data-r]'); if (b) choose(b.getAttribute('data-r')); });
  $('#sexSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; sex = b.getAttribute('data-v');
    document.querySelectorAll('#sexSeg button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    if (sel && !visible().some(function (r) { return r.id === sel; })) sel = null;
    refresh();
  });
  refresh();
})();
