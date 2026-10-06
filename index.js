<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Cinematic Login · Premium</title>
  <!-- GSAP for smooth, high‑performance animations -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <style>
    /* ---------- RESET & GLOBAL ---------- */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background: #070b14;
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden; /* Prevent scroll from character */
      position: relative;
      color: #fff;
    }

    /* ---------- DARK LUXURY BACKGROUND + GRADIENT ---------- */
    .bg-gradient {
      position: fixed;
      inset: 0;
      background: radial-gradient(circle at 30% 40%, #0e1a2b 0%, #03070e 90%);
      z-index: -2;
    }

    /* Subtle moving gradient overlay */
    .bg-glow {
      position: fixed;
      inset: -50%;
      background: radial-gradient(circle at 20% 30%, rgba(80, 130, 255, 0.08), transparent 50%),
                  radial-gradient(circle at 80% 70%, rgba(150, 80, 255, 0.08), transparent 50%);
      animation: bgShift 20s infinite alternate ease-in-out;
      z-index: -1;
      pointer-events: none;
    }

    @keyframes bgShift {
      0% { transform: translate(0, 0) scale(1); opacity: 0.6; }
      100% { transform: translate(2%, -2%) scale(1.1); opacity: 1; }
    }

    /* Cursor glow – subtle */
    .cursor-glow {
      position: fixed;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(100, 150, 255, 0.15), transparent 70%);
      pointer-events: none;
      z-index: 0;
      transform: translate(-50%, -50%);
      transition: opacity 0.3s;
      opacity: 0.7;
      filter: blur(40px);
    }

    /* Particles container */
    .particles {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
    }

    .particle {
      position: absolute;
      width: 3px;
      height: 3px;
      background: rgba(180, 200, 255, 0.3);
      border-radius: 50%;
      filter: blur(1px);
      animation: floatParticle 12s infinite linear;
    }

    @keyframes floatParticle {
      0% { transform: translateY(100vh) scale(0.5); opacity: 0; }
      20% { opacity: 0.8; }
      80% { opacity: 0.8; }
      100% { transform: translateY(-10vh) scale(1.2); opacity: 0; }
    }

    /* ---------- LAYOUT ---------- */
    .app {
      position: relative;
      width: 100%;
      max-width: 1440px;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
      padding: 1.5rem;
      gap: 2rem;
    }

    /* ----- CHARACTER CONTAINER (SVG) ----- */
    .character-wrapper {
      flex: 1 1 45%;
      height: 70vh;
      max-height: 700px;
      position: relative;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      pointer-events: none;
      z-index: 3;
      transform: translateX(-10%);
      opacity: 0; /* hidden until entrance animation */
    }

    .character-svg {
      width: 100%;
      max-width: 380px;
      height: auto;
      overflow: visible;
      filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.7));
      transform-origin: bottom center;
      will-change: transform;
    }

    /* ----- LOGIN CARD (GLASSMORPHISM) ----- */
    .login-card {
      flex: 0 1 400px;
      background: rgba(12, 18, 30, 0.65);
      backdrop-filter: blur(16px) saturate(180%);
      -webkit-backdrop-filter: blur(16px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 32px;
      padding: 2.5rem 2rem;
      box-shadow: 0 30px 50px -20px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.02) inset;
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
      transition: box-shadow 0.4s, border-color 0.4s;
      transform: translateY(30px);
      opacity: 0; /* entrance */
      will-change: transform, opacity;
    }

    .login-card:hover {
      border-color: rgba(120, 170, 255, 0.25);
      box-shadow: 0 40px 60px -20px rgba(0, 30, 80, 0.7), 0 0 0 1px rgba(120, 170, 255, 0.2) inset;
    }

    /* Logo area */
    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-weight: 600;
      letter-spacing: 2px;
      font-size: 1.1rem;
      color: #aac8ff;
      text-transform: uppercase;
      margin-bottom: 0.25rem;
      opacity: 0.9;
    }

    .logo-icon {
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #6a9cff, #a56eff);
      border-radius: 10px;
      box-shadow: 0 0 20px rgba(106, 156, 255, 0.5);
    }

    h2 {
      font-size: 2.1rem;
      font-weight: 500;
      letter-spacing: -0.5px;
      background: linear-gradient(to right, #fff, #b8cbff);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      margin-bottom: 0.2rem;
    }

    .subtitle {
      color: rgba(200, 215, 255, 0.7);
      font-size: 0.95rem;
      font-weight: 400;
      margin-top: -0.5rem;
    }

    /* Input groups */
    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      position: relative;
    }

    .input-group label {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: rgba(180, 200, 255, 0.8);
      margin-left: 0.2rem;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-wrapper input {
      width: 100%;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 0.9rem 1.2rem;
      font-size: 1rem;
      color: #fff;
      outline: none;
      transition: border 0.3s, box-shadow 0.3s, background 0.3s;
      font-family: inherit;
    }

    .input-wrapper input:focus {
      border-color: rgba(106, 156, 255, 0.8);
      box-shadow: 0 0 0 4px rgba(106, 156, 255, 0.15);
      background: rgba(255, 255, 255, 0.07);
    }

    .input-wrapper input::placeholder {
      color: rgba(200, 210, 255, 0.3);
    }

    .toggle-password {
      position: absolute;
      right: 16px;
      background: none;
      border: none;
      color: rgba(200, 215, 255, 0.6);
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 500;
      padding: 0.25rem 0.5rem;
      border-radius: 8px;
      transition: color 0.2s, background 0.2s;
    }

    .toggle-password:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.05);
    }

    /* Row: remember & forgot */
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.9rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: rgba(200, 215, 255, 0.8);
      cursor: pointer;
      user-select: none;
    }

    .checkbox-label input {
      accent-color: #6a9cff;
      width: 16px;
      height: 16px;
      border-radius: 4px;
      cursor: pointer;
    }

    .forgot-link {
      color: #8aacff;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s, text-shadow 0.2s;
    }

    .forgot-link:hover {
      color: #b8cbff;
      text-shadow: 0 0 12px rgba(138, 172, 255, 0.6);
    }

    /* Login button */
    .login-btn {
      background: linear-gradient(135deg, #3d6aff, #8b5eff);
      border: none;
      border-radius: 20px;
      padding: 1rem;
      font-size: 1rem;
      font-weight: 600;
      color: #fff;
      letter-spacing: 0.3px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.3s, filter 0.3s;
      box-shadow: 0 10px 25px -8px rgba(61, 106, 255, 0.5);
      margin-top: 0.25rem;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .login-btn:hover {
      transform: scale(1.02);
      box-shadow: 0 15px 30px -8px #3d6affcc;
      filter: brightness(1.1);
    }

    .login-btn:active {
      transform: scale(0.98);
    }

    .login-btn.loading {
      pointer-events: none;
      color: transparent;
    }

    .login-btn.loading::after {
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s infinite linear;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Success state */
    .login-card.success .login-btn {
      background: #2e7d32;
      box-shadow: 0 0 30px #2e7d32aa;
    }

    .create-account {
      text-align: center;
      font-size: 0.9rem;
      color: rgba(200, 215, 255, 0.6);
    }

    .create-account a {
      color: #8aacff;
      text-decoration: none;
      font-weight: 500;
      margin-left: 0.25rem;
      transition: color 0.2s;
    }

    .create-account a:hover {
      color: #b8cbff;
    }

    /* Error shake */
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20% { transform: translateX(-6px); }
      40% { transform: translateX(6px); }
      60% { transform: translateX(-4px); }
      80% { transform: translateX(4px); }
    }

    .shake {
      animation: shake 0.4s ease-in-out;
    }

    /* ---------- RESPONSIVE ---------- */
    @media (max-width: 900px) {
      .app {
        flex-direction: column;
        justify-content: center;
        gap: 1rem;
        padding: 2rem 1.5rem;
      }

      .character-wrapper {
        flex: 0 0 auto;
        height: 35vh;
        max-height: 260px;
        width: 100%;
        transform: translateX(0) translateY(-5%);
        opacity: 0;
        justify-content: center;
      }

      .character-svg {
        max-width: 220px;
      }

      .login-card {
        flex: 0 1 auto;
        width: 100%;
        max-width: 400px;
        padding: 2rem 1.5rem;
        border-radius: 28px;
      }

      h2 {
        font-size: 1.8rem;
      }

      .cursor-glow {
        display: none; /* optional mobile perf */
      }
    }

    @media (max-width: 480px) {
      .character-wrapper {
        height: 25vh;
        max-height: 180px;
      }
      .character-svg {
        max-width: 160px;
      }
      .login-card {
        padding: 1.8rem 1.2rem;
      }
    }

    /* Character SVG animation states – controlled by GSAP mostly */
    .character-svg .head {
      transform-origin: 50% 30%;
      transition: transform 0.3s ease;
    }
  </style>
</head>
<body>
  <div class="bg-gradient"></div>
  <div class="bg-glow"></div>
  <div class="cursor-glow" id="cursorGlow"></div>
  <div class="particles" id="particles"></div>

  <div class="app">
    <!-- Animated character (SVG person with realistic walk cycle) -->
    <div class="character-wrapper" id="characterWrapper">
      <svg class="character-svg" id="characterSvg" viewBox="0 0 300 520" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Shadow -->
        <ellipse cx="150" cy="500" rx="70" ry="12" fill="rgba(0,0,0,0.4)" />

        <!-- Back leg (will be animated) -->
        <g id="leg-back">
          <path d="M130 380 L125 460 L120 490" stroke="#2a3a5a" stroke-width="18" stroke-linecap="round" fill="none" />
          <circle cx="120" cy="495" r="10" fill="#1e2a3a" />
        </g>
        <!-- Front leg -->
        <g id="leg-front">
          <path d="M170 380 L175 460 L180 490" stroke="#2a3a5a" stroke-width="18" stroke-linecap="round" fill="none" />
          <circle cx="180" cy="495" r="10" fill="#1e2a3a" />
        </g>

        <!-- Torso -->
        <path d="M110 250 L110 380 L190 380 L190 250 Z" fill="#1e2e4a" rx="10" />
        <path d="M110 250 Q150 220 190 250 L190 280 Q150 260 110 280 Z" fill="#2a3f62" />

        <!-- Arms (animated) -->
        <g id="arm-back">
          <path d="M115 280 L90 350 L85 380" stroke="#2a3a5a" stroke-width="14" stroke-linecap="round" fill="none" />
          <circle cx="85" cy="385" r="8" fill="#1e2a3a" />
        </g>
        <g id="arm-front">
          <path d="M185 280 L210 350 L215 380" stroke="#2a3a5a" stroke-width="14" stroke-linecap="round" fill="none" />
          <circle cx="215" cy="385" r="8" fill="#1e2a3a" />
        </g>

        <!-- Head -->
        <g id="head">
          <circle cx="150" cy="180" r="45" fill="#1e2e4a" />
          <!-- Face features -->
          <circle cx="135" cy="170" r="4" fill="#aaccff" />
          <circle cx="165" cy="170" r="4" fill="#aaccff" />
          <path d="M140 195 Q150 205 160 195" stroke="#aaccff" stroke-width="3" fill="none" stroke-linecap="round" />
          <!-- Hair -->
          <path d="M110 160 Q150 120 190 160 Q180 140 150 135 Q120 140 110 160" fill="#0f1a2a" />
        </g>

        <!-- Jacket / details -->
        <path d="M110 270 L190 270" stroke="#3d5a8a" stroke-width="4" stroke-linecap="round" />
        <path d="M130 250 L130 380" stroke="#0f1a2a" stroke-width="3" opacity="0.5" />
        <path d="M170 250 L170 380" stroke="#0f1a2a" stroke-width="3" opacity="0.5" />
      </svg>
    </div>

    <!-- Login card -->
    <div class="login-card" id="loginCard">
      <div class="logo">
        <div class="logo-icon"></div>
        <span>NEXUS</span>
      </div>
      <div>
        <h2>Welcome Back</h2>
        <div class="subtitle">Sign in to continue</div>
      </div>

      <div class="input-group">
        <label>Email</label>
        <div class="input-wrapper">
          <input type="email" id="emailInput" placeholder="hello@nexus.ai" autocomplete="email" />
        </div>
      </div>

      <div class="input-group">
        <label>Password</label>
        <div class="input-wrapper">
          <input type="password" id="passwordInput" placeholder="••••••••" autocomplete="current-password" />
          <button class="toggle-password" id="togglePassword" aria-label="Show password">SHOW</button>
        </div>
      </div>

      <div class="row">
        <label class="checkbox-label">
          <input type="checkbox" id="rememberCheck" /> Remember me
        </label>
        <a href="#" class="forgot-link">Forgot password?</a>
      </div>

      <button class="login-btn" id="loginBtn">LOGIN</button>

      <div class="create-account">
        Don't have an account? <a href="#">Create account</a>
      </div>
    </div>
  </div>

  <script>
    (function() {
      // ---------- PARTICLES ----------
      const particlesContainer = document.getElementById('particles');
      for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 12 + 's';
        p.style.animationDuration = 8 + Math.random() * 10 + 's';
        p.style.width = p.style.height = (2 + Math.random() * 3) + 'px';
        p.style.opacity = 0.2 + Math.random() * 0.5;
        particlesContainer.appendChild(p);
      }

      // ---------- CURSOR GLOW ----------
      const cursorGlow = document.getElementById('cursorGlow');
      window.addEventListener('mousemove', (e) => {
        gsap.to(cursorGlow, {
          left: e.clientX,
          top: e.clientY,
          duration: 0.6,
          ease: 'power2.out'
        });
      });

      // ---------- CHARACTER WALK CYCLE (SVG limb animation) ----------
      // We'll animate the arms and legs using GSAP to create a realistic walking loop.
      const legFront = document.getElementById('leg-front');
      const legBack = document.getElementById('leg-back');
      const armFront = document.getElementById('arm-front');
      const armBack = document.getElementById('arm-back');
      const head = document.getElementById('head');

      // Timeline for walk cycle (yoyo, repeat)
      const walkTl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { duration: 0.5, ease: 'sine.inOut' } });
      walkTl.to(legFront, { rotation: -15, transformOrigin: '150px 380px' }, 0)
            .to(legBack, { rotation: 15, transformOrigin: '150px 380px' }, 0)
            .to(armFront, { rotation: -20, transformOrigin: '185px 280px' }, 0)
            .to(armBack, { rotation: 20, transformOrigin: '115px 280px' }, 0)
            .to(head, { y: 2, rotation: 2, transformOrigin: '150px 180px' }, 0)
            .to(legFront, { rotation: 15, transformOrigin: '150px 380px' }, 0.5)
            .to(legBack, { rotation: -15, transformOrigin: '150px 380px' }, 0.5)
            .to(armFront, { rotation: 20, transformOrigin: '185px 280px' }, 0.5)
            .to(armBack, { rotation: -20, transformOrigin: '115px 280px' }, 0.5)
            .to(head, { y: -2, rotation: -1, transformOrigin: '150px 180px' }, 0.5);

      // ---------- ENTRANCE ANIMATIONS ----------
      const characterWrapper = document.getElementById('characterWrapper');
      const loginCard = document.getElementById('loginCard');
      const characterSvg = document.getElementById('characterSvg');

      // Set initial state (already hidden via CSS, but enforce)
      gsap.set(characterWrapper, { x: -150, opacity: 0 });
      gsap.set(loginCard, { y: 40, opacity: 0 });

      // Character walks in from left to center
      const entranceTl = gsap.timeline({ delay: 0.3 });
      entranceTl.to(characterWrapper, { opacity: 1, duration: 0.1 })
                .to(characterWrapper, { x: '0%', duration: 1.6, ease: 'power2.out' })
                .to(loginCard, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, '-=0.8')
                // Character turns head slightly toward card after arriving
                .to(head, { rotation: 6, transformOrigin: '150px 180px', duration: 0.5, ease: 'power2.out' }, '-=0.3')
                .to(head, { rotation: 0, duration: 0.4, ease: 'power2.inOut' }, '-=0.1');

      // ---------- INTERACTION: FOCUS EVENTS ----------
      const emailInput = document.getElementById('emailInput');
      const passwordInput = document.getElementById('passwordInput');
      const togglePassword = document.getElementById('togglePassword');
      const loginBtn = document.getElementById('loginBtn');
      const rememberCheck = document.getElementById('rememberCheck');

      // Head subtle reaction when focusing email
      emailInput.addEventListener('focus', () => {
        gsap.to(head, { rotation: -4, y: -2, duration: 0.3, ease: 'power2.out' });
        gsap.to(characterSvg, { x: 5, duration: 0.3, ease: 'power2.out' }); // slight lean
      });
      emailInput.addEventListener('blur', () => {
        gsap.to(head, { rotation: 0, y: 0, duration: 0.3, ease: 'power2.out' });
        gsap.to(characterSvg, { x: 0, duration: 0.3, ease: 'power2.out' });
      });

      // Password field: different subtle reaction
      passwordInput.addEventListener('focus', () => {
        gsap.to(head, { rotation: 5, y: 2, duration: 0.3, ease: 'power2.out' });
        gsap.to(characterSvg, { x: -4, duration: 0.3, ease: 'power2.out' });
      });
      passwordInput.addEventListener('blur', () => {
        gsap.to(head, { rotation: 0, y: 0, duration: 0.3, ease: 'power2.out' });
        gsap.to(characterSvg, { x: 0, duration: 0.3, ease: 'power2.out' });
      });

      // Toggle password visibility – character reacts with a slight head tilt
      togglePassword.addEventListener('click', (e) => {
        e.preventDefault();
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.textContent = type === 'password' ? 'SHOW' : 'HIDE';

        // Character reaction
        gsap.to(head, { rotation: -8, y: -3, duration: 0.2, ease: 'power2.out' })
            .to(head, { rotation: 0, y: 0, duration: 0.3, delay: 0.15, ease: 'power2.inOut' });
        gsap.to(characterSvg, { x: 6, duration: 0.2, ease: 'power2.out' })
            .to(characterSvg, { x: 0, duration: 0.3, delay: 0.1, ease: 'power2.inOut' });
      });

      // ---------- LOGIN BUTTON ----------
      loginBtn.addEventListener('click', (e) => {
        e.preventDefault();

        // Simple validation demo
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
          // Shake card + character reaction
          loginCard.classList.add('shake');
          setTimeout(() => loginCard.classList.remove('shake'), 400);
          gsap.to(head, { rotation: -10, duration: 0.1, yoyo: true, repeat: 3, ease: 'power2.inOut' });
          return;
        }

        // Start loading
        loginBtn.classList.add('loading');
        loginBtn.textContent = '';

        // Character reacts: looks toward screen, slight step forward
        gsap.to(head, { rotation: -12, y: -5, duration: 0.3, ease: 'power2.out' });
        gsap.to(characterSvg, { x: 12, scale: 1.02, duration: 0.4, ease: 'power2.out' });

        // Simulate API call
        setTimeout(() => {
          // Success state
          loginBtn.classList.remove('loading');
          loginBtn.textContent = '✓ SUCCESS';
          loginCard.classList.add('success');
          loginBtn.style.background = 'linear-gradient(135deg, #2e7d32, #1b5e20)';

          // Character celebrates subtly: head up, slight bounce
          gsap.to(head, { rotation: 0, y: -8, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.inOut' });
          gsap.to(characterSvg, { y: -10, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.inOut' });

          // After success, character walks away (exits to the right)
          setTimeout(() => {
            // Stop the walk cycle temporarily? we can just animate wrapper away
            gsap.to(characterWrapper, {
              x: '120%',
              opacity: 0,
              duration: 1.8,
              ease: 'power2.inOut',
              onComplete: () => {
                // Reset (optional, for demo)
                // characterWrapper.style.display = 'none';
              }
            });

            // Also fade the card a bit or keep success state
            gsap.to(loginCard, { scale: 1.02, boxShadow: '0 0 60px rgba(46,125,50,0.4)', duration: 0.6 });
          }, 1200);
        }, 1800);
      });

      // Reset button state if user types again (simple)
      [emailInput, passwordInput].forEach(inp => {
        inp.addEventListener('input', () => {
          if (loginBtn.textContent.includes('SUCCESS')) {
            loginBtn.textContent = 'LOGIN';
            loginBtn.style.background = '';
            loginCard.classList.remove('success');
            loginBtn.classList.remove('loading');
          }
        });
      });

      // ---------- IDLE BREATHING AFTER STOP (subtle chest/head movement) ----------
      gsap.to('#characterSvg', {
        y: 4,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 2.5 // start after entrance
      });

      // Also subtle head bob independent
      gsap.to(head, {
        y: 1.5,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 2.8
      });

      // ---------- CARD HOVER EFFECT (handled by CSS, but add GSAP for extra depth) ----------
      loginCard.addEventListener('mouseenter', () => {
        gsap.to(loginCard, { y: -5, duration: 0.3, ease: 'power2.out' });
      });
      loginCard.addEventListener('mouseleave', () => {
        gsap.to(loginCard, { y: 0, duration: 0.3, ease: 'power2.out' });
      });

      // ---------- REMEMBER ME CHECKBOX (character glance) ----------
      rememberCheck.addEventListener('change', () => {
        gsap.to(head, { rotation: 4, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.inOut' });
      });

      // Fix SVG stroke properties: need to set fill and stroke correctly; inline styles already in SVG.
      // Ensure legs and arms have proper stroke.
      // (We used stroke in the SVG markup, so it's fine)
    })();
  </script>
</body>
</html>
