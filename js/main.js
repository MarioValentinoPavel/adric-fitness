/* Adric Fitness: del caos a un plan de 12 semanas, y una barra que se carga con tus respuestas */
gsap.registerPlugin(ScrollTrigger);
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const NS = 'http://www.w3.org/2000/svg';
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const WA = 'https://wa.me/34623938634?text=';
const EASE = 'expo.out';

/* ---------- enlaces de WhatsApp ---------- */
$$('[data-wa]').forEach(a => { a.href = WA + encodeURIComponent('¡Hola Adri! Vengo de tu web y quiero empezar mi cambio.'); });

/* ---------- rejilla de 12 semanas ---------- */
const head = $('.weeks__head');
for (let w = 1; w <= 12; w++) { const i = document.createElement('i'); i.textContent = 'S' + w; head.append(i); }
$$('.weeks__row[data-k]').forEach(row => {
  for (let w = 0; w < 12; w++) {
    const c = document.createElement('span'); c.className = 'cell'; c.innerHTML = '<b></b>';
    if (row.dataset.k === 'check') c.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>');
    row.append(c);
  }
});
const col = w => $$('.weeks__row[data-k]').map(r => r.children[w + 1]);

if (calm) {
  $$('.chaos li').forEach(li => { li.style.opacity = 0; });
  gsap.set('.weeks', { '--grid': 1 }); gsap.set('.cell b', { scaleY: 1 }); gsap.set('.cell svg', { '--tick': 0 });
  gsap.set('.plan__t1', { opacity: 0 });
} else {
  gsap.set('.plan__t2', { opacity: 0, y: 24 });
  gsap.set('.chaos li', { '--strike': 0 }); gsap.set('.weeks', { '--grid': 0 }); gsap.set('.cell svg', { '--tick': 30 });
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' }, scrollTrigger: { trigger: '.plan', start: 'top top', end: '+=230%', pin: '.plan__pin', scrub: .6 } });
  // 1. cada excusa se tacha
  tl.to('.chaos li', { '--strike': 1, duration: .5, stagger: .14 }, 0)
  // 2. y se cae
    .to('.chaos li', { y: 90, rotation: '+=12', opacity: 0, filter: 'blur(4px)', duration: .6, stagger: .05, ease: 'power2.in' }, 1.1)
    .to('.weeks', { '--grid': 1, duration: .5 }, 1.5);
  // 3. semana a semana, el plan se llena
  for (let w = 0; w < 12; w++) {
    const [t, f, c] = col(w), at = 1.9 + w * .2;
    tl.to([$('b', t), $('b', f), $('b', c)], { scaleY: 1, duration: .3, stagger: .05, ease: 'power3.out' }, at)
      .to($('svg', c), { '--tick': 0, duration: .25 }, at + .12)
      .to(head.children[w + 1], { color: '#f1efea', duration: .2 }, at);
  }
  // 4. el titular cambia de lo que no funciona a lo que sí
  tl.to('.plan__t1', { opacity: 0, y: -24, duration: .4, ease: 'power2.in' }, 3.9)
    .to('.plan__t2', { opacity: 1, y: 0, duration: .5 }, 4.15);
}

/* ---------- carga la barra ---------- */
const PL = [{ w: 46, h: 250, kg: 20 }, { w: 40, h: 216, kg: 15 }, { w: 34, h: 184, kg: 10 }];
const answers = [null, null, null];
const loaded = [false, false, false];
let kg = 20;
const kgEl = $('#kg'), lift = $('.barbell__lift');
function plateGroup(p, x) {
  const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'plate');
  const y = 160 - p.h / 2;
  g.innerHTML = `<rect x="${x}" y="${y}" width="${p.w}" height="${p.h}" rx="7" fill="url(#rubber)" stroke="rgba(241,239,234,.1)"/>
    <rect x="${x + 5}" y="${y + 12}" width="${p.w - 10}" height="${p.h - 24}" rx="4" fill="none" stroke="#3a3c40"/>
    <rect x="${x + p.w / 2 - 1.5}" y="${y + 18}" width="3" height="${p.h - 36}" rx="1.5" fill="#e8322b"/>`;
  return g;
}
function loadPlate(q) {
  const p = PL[q];
  // los discos van del collarín hacia fuera
  const offL = PL.slice(0, q).reduce((s, x) => s + x.w + 4, 0), offR = offL;
  const gl = plateGroup(p, 276 - offL - p.w - 4), gr = plateGroup(p, 724 + offR + 4);
  $('#platesL').append(gl); $('#platesR').append(gr);
  gsap.from(gl, { x: -160, opacity: 0, duration: .45, ease: EASE });
  gsap.from(gr, { x: 160, opacity: 0, duration: .45, ease: EASE });
  gsap.fromTo(lift, { rotation: 0 }, { keyframes: [{ rotation: .9, duration: .12 }, { rotation: -.5, duration: .16 }, { rotation: 0, duration: .3, ease: 'power2.out' }], svgOrigin: '500 160' });
  const o = { v: kg }; kg += p.kg * 2;
  gsap.to(o, { v: kg, duration: .5, ease: 'power2.out', onUpdate: () => { kgEl.textContent = Math.round(o.v); } });
}
$$('.q').forEach(fs => {
  const q = +fs.dataset.q;
  $$('button', fs).forEach(b => {
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => {
      $$('button', fs).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      answers[q] = b.dataset.v;
      if (!loaded[q]) { loaded[q] = true; loadPlate(q); }
      if (answers.every(Boolean)) showMatch();
    });
  });
});

const SIT = { cero: 'empiezo de cero', sinplan: 'entreno sin plan', estancado: 'entreno pero estoy estancado' };
const CASES = {
  estancado: { name: 'Tu caso se parece al de Christian.', img: 'assets/ig/p11.jpg', cap: 'Christian, antes y después.',
    story: 'Christian entrenaba sin demasiada estructura y su alimentación no estaba adaptada a su día a día. Ajustamos el entrenamiento a su nivel, adaptamos la alimentación a su estilo de vida y creamos constancia semana tras semana. Menos grasa, más músculo, más energía y más confianza.' },
  sinplan: { name: 'Tu caso se parece al de Dani.', img: 'assets/ig/p09.jpg', pos: '50% 88%', cap: 'El cambio de Dani, antes y después.',
    story: 'Dani no cambió por suerte. Pasó de entrenar sin rumbo a tener un plan claro, seguimiento y estructura. No necesitaba más motivación: necesitaba hacer las cosas bien cada semana.' },
  cero: { name: 'Empiezas donde empecé yo.', img: 'assets/frames/gym-06.jpg', pos: '50% 22%', cap: 'Adri, con 13 años y hoy.',
    story: 'Yo empecé a entrenar con 13 años sin tener ni idea. Entrenaba duro pero sin plan, y tardé mucho más de lo que debería en ver resultados. Tú vas a hacer las cosas bien desde el principio.' }
};
let shown = false;
function showMatch() {
  const [goal, sit, days] = answers, c = CASES[sit];
  $('#mImg').src = c.img; $('#mImg').alt = c.cap; $('#mImg').style.objectPosition = c.pos || '50% 50%';
  $('#mCap').textContent = c.cap; $('#mName').textContent = c.name; $('#mStory').textContent = c.story;
  $('#mPlan').textContent = `Tu plan: ${goal} en 3 meses, entrenando ${days} a la semana, con alimentación adaptada y seguimiento semana a semana.`;
  $('#mWa').href = WA + encodeURIComponent(`¡Hola Adri! He cargado la barra en tu web. Quiero ${goal}, ${SIT[sit]} y puedo entrenar ${days} a la semana. ¿Empezamos?`);
  const m = $('#match');
  if (!shown) {
    shown = true; m.hidden = false;
    gsap.timeline()
      .to(lift, { y: -34, duration: .7, ease: 'power3.inOut' })
      .fromTo(m, { opacity: 0, y: 30, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .7, ease: EASE }, '-=.2');
    setTimeout(() => m.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' }), 500);
  } else {
    gsap.fromTo('.match__txt, .match__img', { opacity: .3, filter: 'blur(4px)' }, { opacity: 1, filter: 'blur(0px)', duration: .35, ease: 'power2.out' });
  }
}

/* ---------- reels: se reproducen al pulsar, con sonido ---------- */
$$('.reel').forEach(r => {
  const v = $('video', r);
  r.addEventListener('click', () => {
    const playing = !v.paused;
    $$('.reel video').forEach(o => { if (o !== v) { o.pause(); o.closest('.reel').classList.remove('is-playing'); } });
    if (playing) { v.pause(); r.classList.remove('is-playing'); }
    else { v.muted = false; v.play().then(() => r.classList.add('is-playing')).catch(() => {}); }
  });
});

/* ---------- entradas (cada sección con su gesto, desde un estado ya visible) ---------- */
if (!calm) {
  gsap.from('.hero__title .ln', { yPercent: 40, opacity: 0, filter: 'blur(8px)', duration: 1.1, stagger: .1, ease: EASE, delay: .1 });
  gsap.from(['.hero__lead', '.hero__cta', '.hero__sig'], { y: 16, opacity: 0, duration: .9, stagger: .08, ease: EASE, delay: .45 });
  gsap.from('.hero__img img', { scale: 1.08, duration: 1.8, ease: EASE });
  gsap.to('.hero__img img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  gsap.from('.pillars > div', { opacity: 0, y: 24, duration: .8, stagger: .12, ease: EASE, scrollTrigger: { trigger: '.pillars', start: 'top 80%', once: true } });
  gsap.fromTo('.method__img', { clipPath: 'inset(12% 12% 12% 12% round 10px)' }, { clipPath: 'inset(0% 0% 0% 0% round 10px)', duration: 1.2, ease: EASE, scrollTrigger: { trigger: '.method', start: 'top 70%', once: true } });

  $$('.reel').forEach(r => gsap.fromTo(r, { clipPath: 'inset(100% 0% 0% 0% round 10px)' }, { clipPath: 'inset(0% 0% 0% 0% round 10px)', duration: 1.1, ease: 'power3.inOut', scrollTrigger: { trigger: r, start: 'top 85%', once: true } }));
  gsap.from('.about__now', { y: 60, duration: 1.2, ease: EASE, scrollTrigger: { trigger: '.about', start: 'top 70%', once: true } });
  gsap.from('.close__t', { opacity: 0, y: 30, duration: 1, ease: EASE, scrollTrigger: { trigger: '.close', start: 'top 75%', once: true } });
}
