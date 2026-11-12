// FinAudio Website Interactive Script
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Drawer
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
      const isOpen = navLinks.classList.contains('mobile-open');
      mobileToggle.innerHTML = isOpen ? '✕' : '☰';
    });

    // Close mobile nav when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
        mobileToggle.innerHTML = '☰';
      });
    });

    // Close mobile nav when clicking outside navbar
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('mobile-open')) {
        if (!e.target.closest('.navbar')) {
          navLinks.classList.remove('mobile-open');
          mobileToggle.innerHTML = '☰';
        }
      }
    });
  }

  // Experience Showcase Tabs
  const tabButtons = document.querySelectorAll('.exp-tab-btn');
  const tabContents = document.querySelectorAll('.exp-tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });

  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // Close others
        faqItems.forEach(other => {
          if (other !== item) other.classList.remove('open');
        });
        item.classList.toggle('open', !isOpen);
      });
    }
  });

  // Interactive Mockup Mini-Player Controls
  const playBtn = document.getElementById('mockupPlayBtn');
  const vizBars = document.querySelectorAll('.viz-bar');
  const scrubberFill = document.querySelector('.scrubber-fill');
  const scrubberTime = document.getElementById('scrubberCurrentTime');
  let isPlaying = true;
  let trackSeconds = 72; // 1:12
  const totalSeconds = 160; // 2:40

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      playBtn.innerHTML = isPlaying 
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>';
      
      vizBars.forEach(bar => {
        bar.style.animationPlayState = isPlaying ? 'running' : 'paused';
      });

      showToast(isPlaying ? "FinAudio Demo: Playback Resumed ▶️" : "FinAudio Demo: Playback Paused ⏸️");
    });
  }

  // Simulated Progress Scrubber & Lyric Rotation
  const lyricsLines = [
    { text: "Locked eyes, yeah we knew from the start", activeText: "You're my missing piece" },
    { text: "Every beat reverberates inside our soul", activeText: "Zero ads, all the beats tonight" },
    { text: "FinAudio playing lossless right through the night", activeText: "Turn the bass up to the sky" },
    { text: "Syncing karaoke in real time with the crew", activeText: "Missing piece found right here" }
  ];
  let lyricIndex = 0;
  const activeLyricEl = document.getElementById('mockupActiveLyric');
  const nextLyricEl = document.getElementById('mockupNextLyric');

  setInterval(() => {
    if (!isPlaying) return;
    trackSeconds = (trackSeconds + 1) % totalSeconds;
    const mins = Math.floor(trackSeconds / 60);
    const secs = String(trackSeconds % 60).padStart(2, '0');
    if (scrubberTime) scrubberTime.textContent = `${mins}:${secs}`;
    if (scrubberFill) scrubberFill.style.width = `${(trackSeconds / totalSeconds) * 100}%`;

    // Rotate lyrics every 6 seconds
    if (trackSeconds % 6 === 0) {
      lyricIndex = (lyricIndex + 1) % lyricsLines.length;
      if (activeLyricEl && nextLyricEl) {
        activeLyricEl.textContent = lyricsLines[lyricIndex].activeText;
        nextLyricEl.textContent = lyricsLines[lyricIndex].text;
      }
    }
  }, 1000);

  // Easter Egg: Tap logo or version tag 5 times!
  const easterTargets = document.querySelectorAll('.easter-trigger');
  let clickCount = 0;
  let clickTimeout = null;

  easterTargets.forEach(el => {
    el.addEventListener('click', (e) => {
      clickCount++;
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(() => { clickCount = 0; }, 2000);

      if (clickCount >= 5) {
        clickCount = 0;
        triggerEasterEgg();
      }
    });
  });

  function triggerEasterEgg() {
    showToast("🎉 SECRET EASTER EGG UNLOCKED! SharkyBurger & Friends Vibe Zone Activated 🍕🔥");
    // Pulse screen with rainbow glow
    document.body.style.transition = 'box-shadow 0.5s ease';
    document.body.style.boxShadow = 'inset 0 0 100px #ff2a5f, inset 0 0 50px #00f2fe';
    setTimeout(() => {
      document.body.style.boxShadow = '';
    }, 2500);
  }

  // Toast Functionality
  function showToast(message) {
    let toast = document.getElementById('appToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'appToast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>⚡</span> <span>${message}</span>`;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  window.showToast = showToast;

  // =========================================================================
  // Cute Pixel Bubble Cursor Trail
  // =========================================================================
  (() => {
    // Respect accessibility reduced-motion preference
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.id = 'pixel-bubble-trail';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = 1;
    function resizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = false;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // Pixel Bubble Sprites (Retro matrix: '.' = transparent, 'X' = glowing cyan rim, 'W' = white shine)
    const BUBBLE_SPRITES = [
      // 0: Tiny baby bubble (3x3)
      [
        ".X.",
        "XWX",
        ".X."
      ],
      // 1: Small cute bubble (5x5)
      [
        ".XXX.",
        "XW..X",
        "X...X",
        "X...X",
        ".XXX."
      ],
      // 2: Medium glossy bubble (7x7)
      [
        "..XXX..",
        ".XWW.X.",
        "XW...XX",
        "X.....X",
        "X.....X",
        ".X...X.",
        "..XXX.."
      ],
      // 3: Shiny big bubble (9x9)
      [
        "...XXX...",
        "..XWWWX..",
        ".XW...XX.",
        "XW.....XX",
        "X.......X",
        "X.......X",
        ".X.....X.",
        "..XXXXX..",
        "...XXX..."
      ]
    ];

    const bubbles = [];
    const popParticles = [];
    let isRunning = false;
    let lastX = null;
    let lastY = null;
    let lastSpawnTime = 0;
    let lastFrameTime = performance.now();

    function spawnBubble(x, y, isBurst = false) {
      const r = Math.random();
      const type = isBurst
        ? (r < 0.45 ? 0 : (r < 0.85 ? 1 : 2))
        : (r < 0.35 ? 0 : (r < 0.70 ? 1 : (r < 0.90 ? 2 : 3)));

      const pixelSize = (type === 0 ? 2 : (type === 3 ? 1.5 : 2));

      bubbles.push({
        x: x + (Math.random() - 0.5) * (isBurst ? 22 : 8),
        y: y + (Math.random() - 0.5) * (isBurst ? 22 : 8),
        vx: (Math.random() - 0.5) * (isBurst ? 3.0 : 1.1),
        vy: isBurst ? -(Math.random() * 2.6 + 1.2) : -(Math.random() * 1.4 + 0.8),
        wobbleSpeed: Math.random() * 3.5 + 2.5,
        wobbleAmp: Math.random() * 0.9 + 0.4,
        wobbleOffset: Math.random() * Math.PI * 2,
        type: type,
        pixelSize: pixelSize,
        alpha: 1.0,
        life: 0,
        maxLife: Math.random() * 0.65 + 0.75, // 0.75s - 1.4s
        hue: Math.random() < 0.65 ? '#7fe0ff' : '#a8eeff'
      });

      if (!isRunning) {
        isRunning = true;
        lastFrameTime = performance.now();
        requestAnimationFrame(renderBubbles);
      }
    }

    function spawnPop(x, y, pixelSize) {
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI / 2) + (Math.PI / 4) + (Math.random() - 0.5) * 0.4;
        const speed = Math.random() * 1.5 + 1.0;
        popParticles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.max(1, pixelSize - 0.5),
          alpha: 0.85,
          life: 0,
          maxLife: 0.16
        });
      }
    }

    function drawPixelBubble(b) {
      const sprite = BUBBLE_SPRITES[b.type];
      const ps = b.pixelSize;
      const h = sprite.length;
      const w = sprite[0].length;
      const startX = Math.round(b.x - (w * ps) / 2);
      const startY = Math.round(b.y - (h * ps) / 2);

      // Translucent watery core for medium & large bubbles
      if (b.type >= 2) {
        ctx.fillStyle = `rgba(74, 168, 255, ${b.alpha * 0.15})`;
        ctx.fillRect(startX + ps, startY + ps, (w - 2) * ps, (h - 2) * ps);
      }

      for (let r = 0; r < h; r++) {
        const row = sprite[r];
        for (let c = 0; c < w; c++) {
          const char = row[c];
          if (char === '.') continue;
          if (char === 'X') {
            ctx.fillStyle = b.hue === '#a8eeff'
              ? `rgba(168, 238, 255, ${b.alpha * 0.88})`
              : `rgba(127, 224, 255, ${b.alpha * 0.92})`;
            ctx.fillRect(startX + c * ps, startY + r * ps, ps, ps);
          } else if (char === 'W') {
            ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 0.96})`;
            ctx.fillRect(startX + c * ps, startY + r * ps, ps, ps);
          }
        }
      }
    }

    function renderBubbles(time) {
      const dt = Math.min((time - lastFrameTime) / 1000, 0.1) || 0.016;
      lastFrameTime = time;

      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      // Update & render bubbles
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.life += dt;

        if (b.life >= b.maxLife) {
          spawnPop(b.x, b.y, b.pixelSize);
          bubbles.splice(i, 1);
          continue;
        }

        b.y += b.vy;
        b.x += b.vx + Math.sin(b.life * b.wobbleSpeed + b.wobbleOffset) * b.wobbleAmp;
        b.vy -= 0.35 * dt;

        const progress = b.life / b.maxLife;
        b.alpha = progress < 0.7 ? 1.0 : (1.0 - (progress - 0.7) / 0.3);

        drawPixelBubble(b);
      }

      // Update & render pop droplets
      for (let i = popParticles.length - 1; i >= 0; i--) {
        const p = popParticles[i];
        p.life += dt;

        if (p.life >= p.maxLife) {
          popParticles.splice(i, 1);
          continue;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.alpha = 1.0 - (p.life / p.maxLife);

        ctx.fillStyle = `rgba(195, 240, 255, ${p.alpha * 0.9})`;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      }

      if (bubbles.length > 0 || popParticles.length > 0) {
        requestAnimationFrame(renderBubbles);
      } else {
        isRunning = false;
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      }
    }

    // Pointer move listener
    window.addEventListener('pointermove', (e) => {
      const x = e.clientX;
      const y = e.clientY;
      const now = performance.now();

      if (lastX === null) {
        lastX = x;
        lastY = y;
        lastSpawnTime = now;
        spawnBubble(x, y);
        return;
      }

      const dx = x - lastX;
      const dy = y - lastY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist >= 12 || (dist >= 4 && now - lastSpawnTime > 55)) {
        spawnBubble(x, y);

        if (dist > 36) {
          spawnBubble(lastX + dx * 0.5, lastY + dy * 0.5);
        }

        lastX = x;
        lastY = y;
        lastSpawnTime = now;
      }
    }, { passive: true });

    // Cute bubble burst on clicks & taps
    window.addEventListener('pointerdown', (e) => {
      const burstCount = Math.floor(Math.random() * 3) + 4;
      for (let i = 0; i < burstCount; i++) {
        spawnBubble(e.clientX, e.clientY, true);
      }
    }, { passive: true });
  })();
});
