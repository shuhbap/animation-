/* ==========================================================
   Orbit – cinematic login
   1. Procedural walk-cycle rig (SVG, driven by one GSAP ticker)
   2. Form-driven character reactions
   3. Ambient layer (particles, cursor glow, card tilt)
   ========================================================== */
(() => {
  const $ = (s) => document.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const actor = $('#actor'), stage = $('#stage'), card = $('#card');
  const email = $('#email'), pass = $('#password'), toggle = $('#toggle');
  const form = $('#form'), submit = $('#submit'), err = $('#err');
  const part = (id) => $('#' + id);
  const P = {
    legF: part('legF'), shinF: part('shinF'), legB: part('legB'), shinB: part('shinB'),
    armF: part('armF'), foreF: part('foreF'), armB: part('armB'), foreB: part('foreB'),
    body: part('body'), upper: part('upper'), torso: part('torso'), head: part('head'),
    flip: part('flip'), brow: part('brow'), mouthN: part('mouthN'), mouthS: part('mouthS'),
    pupils: document.querySelectorAll('.pupil'), lids: document.querySelectorAll('.lid'),
  };

  // every joint rotates around its own local origin (the joint)
  gsap.set([P.legF, P.shinF, P.legB, P.shinB, P.armF, P.foreF, P.armB, P.foreB, P.head],
    { svgOrigin: '0 0' });
  gsap.set(P.lids, { svgOrigin: '0 -43', scaleY: 0 });
  gsap.set(P.torso, { svgOrigin: '120 280' });
  gsap.set(P.upper, { svgOrigin: '120 272' });
  gsap.set(P.flip, { svgOrigin: '120 0' });

  /* ---------- character state ---------- */
  const rig = { phase: 0, amp: 0, v: 0 };
  const mood = { headRot: 0, headY: 0, px: 1.5, py: 0, lid: 0, brow: 0, smile: 0,
                 armW: 0, armRot: 0, elbow: 0, lean: 0, hop: 0 };
  let blink = 0, nextBlink = 2.5, lastX = 0;
  const lerp = (a, b, t) => a + (b - a) * t;
  const mood_to = (v, d = 0.6, ease = 'power3.out') =>
    gsap.to(mood, { ...v, duration: d, ease, overwrite: 'auto' });

  /* ---------- per-frame pose ---------- */
  gsap.ticker.add((time, dtms) => {
    const dt = Math.min(dtms / 1000, 0.05) || 0.016;
    const sc = actor.offsetHeight / 500 || 1;
    const x = gsap.getProperty(actor, 'x');
    const v = Math.abs(x - lastX) / dt; lastX = x;
    rig.v = lerp(rig.v, v, 0.25);
    const a = Math.min(1, Math.pow(rig.v / (170 * sc), 0.6));
    rig.amp = a < 0.02 ? 0 : a;
    rig.phase += (rig.v / (60 * sc)) * dt;           // feet never slide: phase follows ground speed
    const p = rig.phase, s = Math.sin(p), c = Math.cos(p), idle = 1 - rig.amp, A = rig.amp;
    const breath = Math.sin(time * 1.7);

    // legs
    gsap.set(P.legF, { rotation: -s * 28 * A - 2 * idle });
    gsap.set(P.shinF, { rotation: Math.max(0, c) * 50 * A + 2 * idle });
    gsap.set(P.legB, { rotation: s * 28 * A + 3 * idle });
    gsap.set(P.shinB, { rotation: Math.max(0, -c) * 50 * A + 1 * idle });

    // arms (swing against legs) blended with reaction pose
    const w = mood.armW;
    gsap.set(P.armF, { rotation: lerp(s * 24 * A + (4 + breath) * idle, mood.armRot, w) });
    gsap.set(P.foreF, { rotation: lerp(-(10 + 12 * (1 + s) / 2) * A - 8 * idle, mood.elbow, w) });
    gsap.set(P.armB, { rotation: -s * 24 * A - 3 * idle });
    gsap.set(P.foreB, { rotation: -(10 + 12 * (1 - s) / 2) * A - 7 * idle });

    // torso / bob / lean
    gsap.set(P.body, { y: -Math.abs(c) * 5 * A + mood.hop });
    gsap.set(P.upper, { rotation: 3 * A + mood.lean + breath * 0.25 * idle });
    gsap.set(P.torso, { scaleY: 1 + 0.012 * breath * idle, scaleX: 1 + 0.006 * breath * idle });

    // head
    gsap.set(P.head, { rotation: mood.headRot - 1.5 * s * A + breath * 0.6 * idle, y: mood.headY + breath * 0.8 * idle });

    // eyes
    nextBlink -= dt;
    if (nextBlink < 0) { blink = 1; nextBlink = 2.5 + Math.random() * 3; gsap.to({ b: 1 }, { b: 0, duration: 0.16, ease: 'power1.in', onUpdate() { blink = this.targets()[0].b; } }); }
    gsap.set(P.lids, { scaleY: Math.max(mood.lid, blink) });
    P.pupils.forEach((el, i) => gsap.set(el, { x: mood.px - 1.5 - (i ? 0 : 0), y: mood.py }));
    gsap.set(P.brow, { y: -mood.brow });
    gsap.set(P.mouthS, { opacity: mood.smile });
    gsap.set(P.mouthN, { opacity: 1 - mood.smile });
  });

  /* ---------- movement ---------- */
  const actorW = () => actor.offsetWidth;
  const restX = () => {
    const w = stage.clientWidth;
    return Math.max(8, w * (innerWidth > 820 ? 0.5 : 0.5) - actorW() / 2);
  };
  const offLeft = () => -actorW() - 120;
  const walkTo = (x, dur) => new Promise((res) =>
    gsap.to(actor, { x, duration: dur, ease: 'sine.inOut', onComplete: res }));

  /* ---------- reactions ---------- */
  let focusField = null, visible = false, busy = false;
  const neutral = { headRot: 0, headY: 0, px: 1.5, py: 0, lid: 0, brow: 0, lean: 0 };
  function applyMood() {
    if (busy) return;
    if (focusField === 'email') {
      const r = Math.min(1, email.value.length / 28);
      mood_to({ ...neutral, headRot: 4 + r * 3, px: 1.2 + r * 2.4, py: 1.2, lean: 1 }, 0.5);
    } else if (focusField === 'pass' && visible) {
      mood_to({ ...neutral, headRot: -3, px: 3, brow: 3, lean: -2, lid: 0 }, 0.35, 'back.out(2)'); // "oh, you're showing it"
    } else if (focusField === 'pass') {
      mood_to({ ...neutral, headRot: -8, px: -1.5, lid: 0.9, lean: -1 }, 0.55); // looks away, eyes nearly shut
    } else if (visible) {
      mood_to({ ...neutral, brow: 2, px: 3 }, 0.4);
    } else mood_to(neutral, 0.7);
  }
  email.addEventListener('focus', () => { focusField = 'email'; applyMood(); });
  email.addEventListener('input', applyMood);
  pass.addEventListener('focus', () => { focusField = 'pass'; applyMood(); });
  [email, pass].forEach((el) => el.addEventListener('blur', () => {
    setTimeout(() => { if (document.activeElement !== email && document.activeElement !== pass && document.activeElement !== toggle) { focusField = null; applyMood(); } }, 30);
  }));
  toggle.addEventListener('click', () => {
    visible = !visible;
    pass.type = visible ? 'text' : 'password';
    toggle.setAttribute('aria-pressed', visible);
    toggle.setAttribute('aria-label', visible ? 'Hide password' : 'Show password');
    if (focusField !== 'pass') focusField = 'pass';
    applyMood();
  });

  /* ---------- submit flow ---------- */
  function fail(msg) {
    err.textContent = msg;
    gsap.fromTo(card, { x: -10 }, { x: 0, duration: 0.6, ease: 'elastic.out(1.2,0.25)', overwrite: false });
    gsap.timeline().to(mood, { headRot: -6, duration: 0.12 }).to(mood, { headRot: 6, duration: 0.12 })
      .to(mood, { headRot: -4, duration: 0.12 }).to(mood, { headRot: 0, duration: 0.2 });
    mood_to({ brow: -1 }, 0.3);
  }
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.textContent = '';
    if (!/^\S+@\S+\.\S+$/.test(email.value)) return fail('Enter a valid email address.');
    if (pass.value.length < 4) return fail('Password must be at least 4 characters.');
    busy = true; submit.classList.add('loading');
    // character checks his watch while we "verify"
    mood_to({ headRot: 5, px: 2.8, py: 1, lid: 0, brow: 0, lean: 1, armW: 1, armRot: -18, elbow: -105 }, 0.7);
    await new Promise((r) => setTimeout(r, 1900));
    success();
  });

  async function success() {
    submit.classList.remove('loading');
    $('#welcome').textContent = `Signed in as ${email.value}`;
    mood_to({ smile: 1, brow: 2, headRot: -2, px: 2.5, py: 0, armW: 1, armRot: -155, elbow: -12, lean: -2 }, 0.45, 'back.out(2)');
    gsap.timeline().to(mood, { hop: -16, duration: 0.22, ease: 'power2.out' }).to(mood, { hop: 0, duration: 0.3, ease: 'bounce.out' });

    const fv = $('#formView'), sv = $('#successView');
    const h = card.offsetHeight;
    await gsap.to(fv, { opacity: 0, y: -14, duration: 0.35, ease: 'power2.in' });
    fv.hidden = true; sv.hidden = false;
    gsap.set(card, { minHeight: h });
    gsap.fromTo(sv, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
    gsap.timeline()
      .to('.ring', { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' })
      .to('.check-path', { strokeDashoffset: 0, duration: 0.45, ease: 'power2.out' }, '-=0.15')
      .fromTo('.tick', { scale: 0.85 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1,0.4)', transformOrigin: '50% 50%' }, '-=0.5');

    await new Promise((r) => setTimeout(r, 1500));
    // turn around and walk away
    mood_to({ armW: 0, smile: 0.6, headRot: 0, lean: 0, px: 1.5 }, 0.6);
    await gsap.to(P.flip, { scaleX: -1, duration: 0.4, ease: 'power2.inOut' });
    await walkTo(offLeft(), 3.6);
    busy = false;
  }

  $('#again').addEventListener('click', async () => {
    const fv = $('#formView'), sv = $('#successView');
    gsap.set('.ring,.check-path', { strokeDashoffset: (i) => (i ? 50 : 214) });
    await gsap.to(sv, { opacity: 0, duration: 0.25 });
    sv.hidden = true; fv.hidden = false; form.reset(); visible = false; pass.type = 'password';
    toggle.setAttribute('aria-pressed', false);
    gsap.set(card, { minHeight: 0 });
    gsap.fromTo(fv, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
    mood_to({ ...neutral, smile: 0, armW: 0 }, 0.3);
    gsap.set(P.flip, { scaleX: 1 });
    gsap.set(actor, { x: offLeft() });
    busy = false;
    await walkTo(restX(), 4);
  });

  /* ---------- cinematic entrance ---------- */
  gsap.set(actor, { x: offLeft() });
  if (reduce) {
    gsap.set(actor, { x: restX() }); gsap.set(card, { opacity: 1 });
  } else {
    gsap.set(card, { y: 40, scale: 0.97 });
    gsap.timeline()
      .to(card, { opacity: 1, y: 0, scale: 1, duration: 1.4, ease: 'power4.out' }, 1.4);
    gsap.delayedCall(0.5, async () => {
      await walkTo(restX(), 4.4);
      if (focusField) return;
      mood_to({ px: 3, headRot: 3 }, 0.8);              // glances at the form on arrival
      gsap.delayedCall(1.4, () => { if (!focusField && !busy) mood_to({ px: 1.5, headRot: 0 }, 1); });
    });
  }
  addEventListener('resize', () => { if (!gsap.isTweening(actor) && !busy) gsap.set(actor, { x: restX() }); });

  /* ---------- ambient: cursor glow + card tilt ---------- */
  const glow = $('#cursorGlow');
  if (matchMedia('(pointer:fine)').matches && !reduce) {
    const gx = gsap.quickTo(glow, 'x', { duration: 0.6, ease: 'power3' });
    const gy = gsap.quickTo(glow, 'y', { duration: 0.6, ease: 'power3' });
    addEventListener('pointermove', (e) => { gsap.to(glow, { opacity: 1, duration: 1, overwrite: 'auto' }); gx(e.clientX); gy(e.clientY); });
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.7, ease: 'power3' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.7, ease: 'power3' });
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
      ry((nx - 0.5) * 6); rx((0.5 - ny) * 6);
      card.style.setProperty('--mx', nx * 100 + '%'); card.style.setProperty('--my', ny * 100 + '%');
    });
    card.addEventListener('pointerleave', () => { rx(0); ry(0); });
  }

  /* ---------- ambient: particles ---------- */
  const cv = $('#particles'), ctx = cv.getContext('2d');
  let W, H, dots = [];
  const size = () => {
    const d = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * d; H = cv.height = innerHeight * d;
    dots = Array.from({ length: innerWidth < 820 ? 36 : 70 }, () => ({
      x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.4 + 0.4) * d,
      vx: (Math.random() - 0.5) * 0.12 * d, vy: -(Math.random() * 0.18 + 0.04) * d, t: Math.random() * 6 }));
  };
  size(); addEventListener('resize', size);
  gsap.ticker.add((time) => {
    if (document.hidden) return;
    ctx.clearRect(0, 0, W, H);
    for (const d of dots) {
      if (!reduce) { d.x += d.vx; d.y += d.vy; }
      if (d.y < -4) { d.y = H + 4; d.x = Math.random() * W; }
      ctx.globalAlpha = 0.25 + 0.35 * Math.sin(time * 0.8 + d.t) ** 2;
      ctx.fillStyle = d.t > 3 ? '#9d84ff' : '#7fa3ff';
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.283); ctx.fill();
    }
  });
})();
