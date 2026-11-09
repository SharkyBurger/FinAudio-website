/* FinAudio pixel ocean + lemon shark background
   Drop next to index.html and add before </body>:
   <script src="ocean.js"></script>
*/
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- injected styles ----------
  const style = document.createElement('style');
  style.textContent = `
    html{background:#04122b}
    body{background:transparent!important}
    #pixel-ocean{position:fixed;inset:0;width:100vw;height:100vh;z-index:-1;
      image-rendering:crisp-edges;image-rendering:pixelated;pointer-events:none}
    .ambient-glow{opacity:.25}
    h1,h2{text-shadow:0 2px 18px rgba(2,12,40,.65)}
    .feature-card,.download-card,.faq-item,.install-guide-box,.app-window-frame{
      -webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
  `;
  document.head.appendChild(style);

  const cv = document.createElement('canvas');
  cv.id = 'pixel-ocean';
  cv.setAttribute('aria-hidden', 'true');
  document.body.prepend(cv);
  const ctx = cv.getContext('2d');

  // ---------- palette ----------
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const WATER = ['#021028', '#052352', '#08397a', '#0c5aa8', '#1584d4', '#34aef0', '#7fd6ff', '#d6f6ff'].map(hex);
  const SAND = ['#0a2a3a', '#0f3b4d', '#174d5c'].map(hex);
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + .5) / 16 - .5);

  // ---------- lemon shark sprite (faces right) ----------
  const SHARK = [
    "..........D.................",
    ".........DY.................",
    "D.......DYY.................",
    "DD.....DYYYD................",
    ".DD..DDYYYYYYDDD............",
    "..DDDYYYYYYYYYYYYDDD........",
    "...DYYYYYYYYYYYYYYYYEYDD....",
    "..DDYYYYYYYYYYYYYYYYYYYYYD..",
    ".DD.DLLLLLLLLLLLLLLLLLLLLD..",
    "D.....DDLLLLLLLLLLLLLDDD....",
    "D......DDDYDDDDDDDDD........",
    "..........DYD...............",
    "...........DD..............."
  ];
  const SW = 28;
  const COL = { Y: '#ffd93b', D: '#c99a0e', L: '#fff3a8', E: '#14161c' };

  // ---------- state ----------
  let P, W, H, img, S, t = 0, last = 0, bubbleClock = 0;
  let bubbles = [], kelp = [];
  const shark = { x: 0, y: 0, y0: 0, dir: 1, speed: 15 };

  const groundY = x => H - 7 + Math.sin(x * .07) * 2 + Math.sin(x * .19);
  const surfaceY = (x, t) => 5 + Math.sin(x * .12 + t * 1.6) * 1.2 + Math.sin(x * .05 - t * .9) * 1.5;

  function placeShark(dir) {
    shark.dir = dir;
    shark.x = dir > 0 ? -SW * S - 4 : W + 4;
    shark.y0 = H * (.28 + Math.random() * .3);
  }

  function resize() {
    P = innerWidth < 700 ? 3 : 4;
    W = Math.ceil(innerWidth / P);
    H = Math.ceil(innerHeight / P);
    cv.width = W; cv.height = H;
    img = ctx.createImageData(W, H);
    S = W < 250 ? 1 : 2;
    kelp = [];
    for (let x = 6; x < W; x += 14 + Math.floor(Math.random() * 18)) {
      kelp.push({ x, h: 8 + Math.floor(Math.random() * 14), ph: Math.random() * 6 });
    }
    bubbles = [];
    for (let i = 0; i < Math.min(40, W / 6); i++) addBubble(Math.random() * W, Math.random() * H);
    placeShark(1);
    shark.x = W * .2;
  }

  function addBubble(x, y, big) {
    bubbles.push({ x, y, vy: 4 + Math.random() * 8, ph: Math.random() * 6, big: big || Math.random() < .25 });
  }

  // ---------- drawing ----------
  function drawWater(t) {
    const d = img.data;
    let i = 0;
    for (let y = 0; y < H; y++) {
      const depth = y / H;
      for (let x = 0; x < W; x++, i += 4) {
        const s = surfaceY(x, t);
        const dither = BAYER[(y & 3) * 4 + (x & 3)];
        let c;
        if (y > groundY(x)) {
          c = SAND[Math.max(0, Math.min(2, Math.round(1 + dither * 2 + (y - groundY(x)) * -.05)))];
        } else if (y < s) {
          c = WATER[7];
        } else {
          let L = .78 - depth * .78;
          const ray = Math.sin(x * .045 + y * .018 + t * .5) * Math.sin(x * .021 - t * .3);
          L += Math.max(0, ray) * .18 * (1 - depth);
          const k = Math.sin(x * .21 + t * 1.1) + Math.sin(y * .27 - t * 1.4) + Math.sin((x + y) * .11 + t * .6);
          if (k > 2 && depth < .55) L += .16 * (1 - depth * 1.6);
          L += Math.max(0, 1 - (y - s) / 10) * .2;
          c = WATER[Math.max(0, Math.min(7, Math.round(L * 7 + dither)))];
        }
        d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  function drawKelp(t) {
    kelp.forEach(k => {
      const base = Math.round(groundY(k.x));
      for (let i = 0; i < k.h; i++) {
        const dx = Math.round(Math.sin(t * 1.2 + k.ph + i * .35) * i * .18);
        ctx.fillStyle = i % 2 ? '#2fc98a' : '#1f9d6b';
        ctx.fillRect(k.x + dx, base - i, 2, 1);
      }
    });
  }

  function drawBubbles(dt) {
    ctx.fillStyle = 'rgba(214,246,255,.75)';
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.y -= b.vy * dt;
      b.x += Math.sin(t * 2 + b.ph) * .12;
      if (b.y < surfaceY(b.x, t) + 1) {
        if (b.respawn === false) { bubbles.splice(i, 1); continue; }
        b.y = H - 4; b.x = Math.random() * W;
      }
      const n = b.big ? 2 : 1;
      ctx.fillRect(Math.round(b.x), Math.round(b.y), n, n);
    }
  }

  function drawShark(dt) {
    shark.x += shark.dir * shark.speed * dt;
    shark.y = shark.y0 + Math.sin(t * .7) * 4;
    if (shark.dir > 0 && shark.x > W + 4) placeShark(-1);
    else if (shark.dir < 0 && shark.x < -SW * S - 4) placeShark(1);

    for (let r = 0; r < SHARK.length; r++) {
      for (let c = 0; c < SW; c++) {
        const ch = SHARK[r][c];
        if (!ch || ch === '.') continue;
        const wig = Math.round(Math.sin(t * 5 - c * .28) * 1.6 * (1 - c / SW));
        const cc = shark.dir > 0 ? c : SW - 1 - c;
        ctx.fillStyle = COL[ch];
        ctx.fillRect(Math.round(shark.x + cc * S), Math.round(shark.y + (r + wig) * S), S, S);
      }
    }
    bubbleClock += dt;
    if (bubbleClock > .5) {
      bubbleClock = 0;
      const mx = shark.dir > 0 ? shark.x + SW * S : shark.x;
      const b = { x: mx, y: shark.y + 7 * S, vy: 6 + Math.random() * 4, ph: Math.random() * 6, big: Math.random() < .4, respawn: false };
      bubbles.push(b);
    }
  }

  function frame(now) {
    if (!reduce) requestAnimationFrame(frame);
    if (now - last < 33) return;
    const dt = Math.min(.1, (now - last) / 1000 || .033);
    last = now; t += dt;
    drawWater(t);
    drawKelp(t);
    drawBubbles(dt);
    drawShark(dt);
  }

  // ---------- go ----------
  resize();
  addEventListener('resize', resize);
  addEventListener('click', e => {
    const x = e.clientX / P, y = e.clientY / P;
    for (let i = 0; i < 6; i++) {
      bubbles.push({ x: x + (Math.random() - .5) * 6, y: y + Math.random() * 4, vy: 8 + Math.random() * 10, ph: Math.random() * 6, big: Math.random() < .5, respawn: false });
    }
  });
  if (reduce) { t = 2; frame(100); } else requestAnimationFrame(frame);
})();
