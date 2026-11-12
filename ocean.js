/* FinAudio pixel ocean + lemon shark (calm edition + fish, corals, headphones)
   Used together with theme-blue.css, which handles the page layout. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const style = document.createElement('style');
  style.textContent = `
    html{background:#04122b}
    body{background:transparent!important}
    #pixel-ocean{position:fixed;inset:0;width:100%;height:100%;z-index:-1;
      image-rendering:crisp-edges;image-rendering:pixelated;pointer-events:none}
  `;
  document.head.appendChild(style);

  const cv = document.createElement('canvas');
  cv.id = 'pixel-ocean';
  cv.setAttribute('aria-hidden', 'true');
  document.body.prepend(cv);
  const ctx = cv.getContext('2d');

  // Narrower, darker palette = less visual noise behind the text
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const WATER = ['#030c22', '#051a40', '#07295e', '#0a3d86', '#0f56ab', '#1b74cc'].map(hex);
  const N = WATER.length - 1;
  const SAND = ['#071f33', '#0b2c45'].map(hex);
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + .5) / 16 - .5);

  // Lemon shark sprite, built from shape rules so it stays clean (faces right)
  const SW = 38, SH = 16;
  const G = Array.from({ length: SH }, () => Array(SW).fill('.'));
  const put = (c, r, ch) => { if (r >= 0 && r < SH && c >= 0 && c < SW) G[r][c] = ch; };
  const fin = (r, l, rt) => { for (let c = l; c <= rt; c++) put(c, r, c === l || c === rt ? 'D' : 'Y'); };
  // forked tail (upper lobe longer, like a real shark)
  ['DD.......', 'DYD......', '.DYD.....', '.DYYD....', '..DYYD...', '..DYYYD..', '...DYYYD.',
   '...DYYYYY', '....YYYYY', '...DYYYYY', '..DYYYYD.', '..DYYYD..', '.DYYD....']
    .forEach((s, i) => [...s].forEach((ch, c) => { if (ch !== '.') put(c, i + 1, ch); }));
  // two dorsal fins, pectoral + pelvic fins
  put(20, 1, 'D'); fin(2, 20, 21); fin(3, 20, 22); fin(4, 19, 24); fin(5, 18, 26); fin(6, 17, 28);
  put(12, 5, 'D'); fin(6, 11, 14); fin(7, 10, 15);
  fin(13, 22, 28); fin(14, 19, 25); fin(15, 17, 21);
  fin(13, 13, 16); fin(14, 12, 14);
  // streamlined body: dark back, yellow sides, pale belly
  for (let c = 8; c < SW; c++) {
    let t, b;
    if (c <= 11) { t = 8; b = 11; } else if (c <= 14) { t = 8; b = 12; }
    else if (c <= 30) { t = 7; b = 12; } else if (c <= 33) { t = 8; b = 12; }
    else if (c <= 35) { t = 9; b = 11; } else if (c === 36) { t = 10; b = 11; } else { t = 10; b = 10; }
    for (let r = t; r <= b; r++) put(c, r, r === t ? 'D' : (r >= b - 1 && c >= 13 ? 'L' : 'Y'));
  }
  // gills, eye, mouth
  [26, 28, 30].forEach(c => { put(c, 8, 'K'); put(c, 9, 'K'); });
  put(33, 9, 'E');
  for (let c = 32; c <= 35; c++) put(c, 11, 'K');
  // headphones: ear cup over the gills + band over the head
  for (let r = 8; r <= 10; r++) for (let c = 30; c <= 32; c++) put(c, r, 'C');
  put(30, 8, 'c');
  [[30, 7], [31, 6], [32, 6], [33, 6], [34, 7]].forEach(([c, r]) => put(c, r, 'W'));
  const SHARK = G.map(r => r.join(''));
  const COL = { Y: '#ffd93b', D: '#c99a0e', L: '#fff0a0', K: '#8a6508', E: '#14161c', W: '#e6f1ff', C: '#2f7de1', c: '#9fdcff' };

  let P, W, H, img, S, t = 0, last = 0, bubbleClock = 0;
  let bubbles = [], kelp = [];
  const shark = { x: 0, y: 0, y0: 0, dir: 1, speed: 11 };

  const groundY = x => H - 6 + Math.sin(x * .07) * 1.5 + Math.sin(x * .19) * .6;
  const surfaceY = (x, t) => 3 + Math.sin(x * .09 + t * 1.2) * .9 + Math.sin(x * .04 - t * .7);

  function placeShark(dir) {
    shark.dir = dir;
    shark.x = dir > 0 ? -SW * S - 4 : W + 4;
    shark.y0 = H * (.3 + Math.random() * .28);
  }

  function resize() {
    P = innerWidth < 700 ? 4 : 5;
    W = Math.ceil(innerWidth / P);
    H = Math.ceil(innerHeight / P);
    cv.width = W; cv.height = H;
    img = ctx.createImageData(W, H);
    S = W < 200 ? 1 : 2;
    kelp = [];
    for (let x = 8; x < W; x += 26 + Math.floor(Math.random() * 30)) {
      kelp.push({ x, h: 6 + Math.floor(Math.random() * 9), ph: Math.random() * 6 });
    }
    bubbles = [];
    for (let i = 0; i < Math.min(14, W / 10); i++) addBubble(Math.random() * W, Math.random() * H);
    placeShark(1);
    shark.x = W * .2;
    buildCorals();
    setupFish();
    notes = [];
  }

  function addBubble(x, y) {
    bubbles.push({ x, y, vy: 3 + Math.random() * 5, ph: Math.random() * 6, big: Math.random() < .2 });
  }

  function drawWater(t) {
    const d = img.data;
    let i = 0;
    for (let y = 0; y < H; y++) {
      const depth = y / H;
      for (let x = 0; x < W; x++, i += 4) {
        const s = surfaceY(x, t);
        const dither = BAYER[(y & 3) * 4 + (x & 3)] * .6;
        let c;
        const gy = groundY(x);
        if (y > gy) {
          c = SAND[dither > 0 ? 1 : 0];
        } else if (y < s) {
          c = WATER[N];
        } else {
          let L = .62 - depth * .58;
          // soft slow light rays, very gentle
          const ray = Math.sin(x * .04 + y * .015 + t * .3) * Math.sin(x * .02 - t * .2);
          L += Math.max(0, ray) * .08 * (1 - depth);
          // a few rare caustic sparkles near the top only
          const k = Math.sin(x * .21 + t * .9) + Math.sin(y * .27 - t * 1.1) + Math.sin((x + y) * .11 + t * .5);
          if (k > 2.3 && depth < .35) L += .08;
          L += Math.max(0, 1 - (y - s) / 6) * .1;
          c = WATER[Math.max(0, Math.min(N, Math.round(L * N + dither)))];
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
        const dx = Math.round(Math.sin(t * 1 + k.ph + i * .35) * i * .15);
        ctx.fillStyle = i % 2 ? '#1a7a60' : '#14624d';
        ctx.fillRect(k.x + dx, base - i, 1, 1);
      }
    });
  }

  function drawBubbles(dt) {
    ctx.fillStyle = 'rgba(160,215,255,.45)';
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.y -= b.vy * dt;
      b.x += Math.sin(t * 2 + b.ph) * .1;
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
    shark.y = shark.y0 + Math.sin(t * .6) * 3;
    if (shark.dir > 0 && shark.x > W + 4) placeShark(-1);
    else if (shark.dir < 0 && shark.x < -SW * S - 4) placeShark(1);

    for (let r = 0; r < SHARK.length; r++) {
      for (let c = 0; c < SW; c++) {
        const ch = SHARK[r][c];
        if (!ch || ch === '.') continue;
        const wig = Math.round(Math.sin(t * 4 - c * .15) * 1.6 * Math.pow(1 - c / SW, 2.2));
        const cc = shark.dir > 0 ? c : SW - 1 - c;
        ctx.fillStyle = COL[ch];
        ctx.fillRect(Math.round(shark.x + cc * S), Math.round(shark.y + (r + wig) * S), S, S);
      }
    }
    sharkNoteT += dt;
    if (sharkNoteT > 2.4) { sharkNoteT = 0; addNote(shark.x + (shark.dir > 0 ? 31 : 3) * S, shark.y + 2 * S); }
    bubbleClock += dt;
    if (bubbleClock > 1.2) {
      bubbleClock = 0;
      const mx = shark.dir > 0 ? shark.x + SW * S : shark.x;
      bubbles.push({ x: mx, y: shark.y + 10 * S, vy: 5 + Math.random() * 3, ph: Math.random() * 6, big: false, respawn: false });
    }
  }

  // ---------- music notes (everyone's listening to FinAudio) ----------
  const NOTE = ['..XX', '..X.', '..X.', 'XXX.', 'XX..'];
  let notes = [], sharkNoteT = 0;
  function addNote(x, y) {
    notes.push({ x, y, vy: 6 + Math.random() * 3, age: 0, life: 2.6, ph: Math.random() * 6 });
  }
  function drawNotes(dt) {
    for (let i = notes.length - 1; i >= 0; i--) {
      const n = notes[i];
      n.age += dt; n.y -= n.vy * dt; n.x += Math.sin(n.age * 3 + n.ph) * .12;
      if (n.age > n.life) { notes.splice(i, 1); continue; }
      ctx.globalAlpha = Math.min(1, n.age * 4) * (1 - n.age / n.life) * .9;
      ctx.fillStyle = '#cfeaff';
      for (let r = 0; r < NOTE.length; r++) for (let c = 0; c < 4; c++) {
        if (NOTE[r][c] === 'X') ctx.fillRect(Math.round(n.x) + c, Math.round(n.y) + r, 1, 1);
      }
    }
    ctx.globalAlpha = 1;
  }

  // ---------- fish ----------
  const FISH_COL = {
    orange: { b: '#ff9a3c', d: '#d9601a', l: '#ffd9a0' },
    yellow: { b: '#ffd23c', d: '#e0a000', l: '#fff0a8' },
    pink: { b: '#ff6fa5', d: '#d64582', l: '#ffc2d9' },
    lime: { b: '#8be04e', d: '#4fa82a', l: '#d4f7a8' },
    silver: { b: '#bcd6ef', d: '#7fa3c8', l: '#eaf4ff' }
  };
  const FISH_EXTRA = { e: '#101820', W: '#e6f1ff', C: '#2f7de1', c: '#9fdcff' };
  const TAIL = 4;

  function makeFish(bodyLen, bh, phones) {
    const top = phones ? 4 : 2, Wd = TAIL + bodyLen, Ht = top + bh * 2 + 3;
    const g = Array.from({ length: Ht }, () => Array(Wd).fill('.'));
    const put = (x, y, ch) => { if (x >= 0 && x < Wd && y >= 0 && y < Ht) g[y][x] = ch; };
    const cy = top + bh + 1, a = bodyLen / 2, cx = TAIL + a - 1.5;
    for (let y = 0; y < Ht; y++) for (let x = TAIL - 1; x < Wd; x++) {
      const dx = (x - cx) / a, dy = (y - cy) / (bh + .5);
      if (dx * dx + dy * dy <= 1) g[y][x] = y >= cy + bh * .45 ? 'l' : 'b';
    }
    for (let x = 0; x < TAIL; x++) {
      const hh = .6 + (TAIL - 1 - x) * bh * .42;
      for (let y = 0; y < Ht; y++) if (Math.abs(y - cy) <= hh) g[y][x] = 'd';
    }
    const m = Math.round(cx);
    for (let x = m - 3; x <= m; x++) put(x, cy - bh - 1, 'd');
    for (let x = m - 3; x <= m - 1; x++) put(x, cy - bh - 2, 'd');
    put(Math.round(cx + a - 2), cy - 1, 'e');
    if (phones) {
      const cupX = Wd - 6;
      for (let y = cy - 1; y <= cy + 1; y++) { put(cupX, y, 'C'); put(cupX + 1, y, 'C'); }
      put(cupX, cy - 1, 'c');
      for (let y = cy - bh - 1; y <= cy - 2; y++) put(cupX + 1, y, 'W');
      for (let x = cupX + 2; x <= cupX + 4; x++) put(x, cy - bh - 1, 'W');
    }
    return g.map(r => r.join(''));
  }

  let groups = [];
  function setupFish() {
    groups = [];
    const rnd = (a, b) => a + Math.random() * (b - a);
    const school = (n, len, bh, colName, y, dir, sp) => {
      const spr = makeFish(len, bh, false);
      const fish = [];
      for (let i = 0; i < n; i++) fish.push({ spr, pal: { ...FISH_COL[colName], ...FISH_EXTRA }, s: 1, ox: rnd(0, 34), oy: rnd(-8, 8), ph: rnd(0, 6) });
      groups.push({ x: rnd(0, W), y0: y, dir, sp, w: 34 + spr[0].length, fish });
    };
    school(8, 7, 2, 'orange', H * .3, 1, 9);
    school(5, 6, 2, 'yellow', H * .55, -1, 7);
    const single = (len, bh, colName, y, dir, sp, phones) => {
      const spr = makeFish(len, bh, phones);
      groups.push({ x: rnd(0, W), y0: y, dir, sp, w: spr[0].length * S,
        fish: [{ spr, pal: { ...FISH_COL[colName], ...FISH_EXTRA }, s: S, ox: 0, oy: 0, ph: rnd(0, 6), phones, noteT: rnd(0, 2) }] });
    };
    single(10, 3, 'pink', H * .42, -1, 6, false);
    single(10, 3, 'lime', H * .66, 1, 8, false);
    single(12, 3, 'yellow', H * .19, -1, 8, true); // the one with headphones
  }

  function drawFishes(dt) {
    groups.forEach(g => {
      g.x += g.dir * g.sp * dt;
      const m = g.w + 12;
      if (g.dir > 0 && g.x > W + m) g.x = -m;
      else if (g.dir < 0 && g.x < -m) g.x = W + m;
      g.fish.forEach(f => {
        const spr = f.spr, w = spr[0].length;
        const x0 = g.x + f.ox, y0 = g.y0 + f.oy + Math.sin(t * .8 + f.ph) * 1.5;
        for (let r = 0; r < spr.length; r++) for (let c = 0; c < w; c++) {
          const ch = spr[r][c];
          if (ch === '.') continue;
          const wag = c < TAIL ? Math.round(Math.sin(t * 9 + f.ph) * (TAIL - c) / TAIL * 1.2) : 0;
          const cc = g.dir > 0 ? c : w - 1 - c;
          ctx.fillStyle = f.pal[ch];
          ctx.fillRect(Math.round(x0 + cc * f.s), Math.round(y0 + (r + wag) * f.s), f.s, f.s);
        }
        if (f.phones) {
          f.noteT += dt;
          if (f.noteT > 2.2) {
            f.noteT = 0;
            addNote(x0 + (g.dir > 0 ? w - 4 : 1) * f.s, y0);
          }
        }
      });
    });
  }

  // ---------- corals (pre-rendered once per resize) ----------
  let coralLayer = null;
  function buildCorals() {
    coralLayer = document.createElement('canvas');
    coralLayer.width = W; coralLayer.height = H;
    const g = coralLayer.getContext('2d');
    const px = (x, y, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
    const line = (x0, y0, x1, y1, c) => {
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
      for (let i = 0; i <= n; i++) px(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, c);
    };
    const rnd = (a, b) => a + Math.random() * (b - a);
    const PALS = [['#ff6f91', '#ffa3b9', '#c2456a'], ['#ff9a5a', '#ffc590', '#c9622c'],
                  ['#a55eea', '#cfa6ff', '#7a3bbd'], ['#2dd4bf', '#86f2e1', '#16988a'],
                  ['#ffd166', '#ffe9a8', '#c99a2a']];

    function dome(x, b, r, p) {
      for (let dy = 0; dy <= r * .75; dy++) for (let dx = -r; dx <= r; dx++) {
        if ((dx / r) ** 2 + (dy / (r * .75)) ** 2 <= 1) px(x + dx, b - dy, (dx + dy * 2) % 4 === 0 ? p[2] : dy > r * .5 ? p[1] : p[0]);
      }
    }
    function branch(x, y, len, ang, depth, p) {
      const x1 = x + Math.cos(ang) * len, y1 = y + Math.sin(ang) * len;
      line(x, y, x1, y1, p[0]);
      if (depth > 0) {
        branch(x1, y1, len * .72, ang - rnd(.35, .7), depth - 1, p);
        branch(x1, y1, len * .72, ang + rnd(.35, .7), depth - 1, p);
      } else px(x1, y1, p[1]);
    }
    function fan(x, b, r, p) {
      for (let a = -160; a <= -20; a += 7) {
        const rad = a * Math.PI / 180, x1 = x + Math.cos(rad) * r, y1 = b + Math.sin(rad) * r * .9;
        line(x, b, x1, y1, p[2]); px(x1, y1, p[1]);
      }
      for (let a = -160; a <= -20; a += 3) {
        const rad = a * Math.PI / 180;
        px(x + Math.cos(rad) * r * .6, b + Math.sin(rad) * r * .55, p[0]);
      }
    }
    function tubes(x, b, p) {
      [-3, 0, 3].forEach((o, i) => {
        const h = 5 + ((i * 5 + Math.floor(x)) % 6);
        g.fillStyle = p[0]; g.fillRect(x + o, b - h, 2, h);
        g.fillStyle = p[2]; g.fillRect(x + o, b - h, 1, h);
        px(x + o, b - h, p[1]); px(x + o + 1, b - h, p[1]);
      });
    }

    for (let x = 4; x < W - 4; x += 8 + Math.floor(Math.random() * 14)) {
      const base = Math.round(groundY(x)) + 1;
      const p = PALS[Math.floor(Math.random() * PALS.length)];
      const type = Math.floor(Math.random() * 4);
      if (type === 0) dome(x, base, 4 + Math.floor(Math.random() * 4), p);
      else if (type === 1) branch(x, base, rnd(4, 6), -Math.PI / 2, 3, p);
      else if (type === 2) fan(x, base, rnd(6, 9), p);
      else tubes(x, base, p);
    }
  }

  function frame(now) {
    if (!reduce) requestAnimationFrame(frame);
    if (now - last < 40) return; // ~25fps keeps it calm and light
    const dt = Math.min(.1, (now - last) / 1000 || .04);
    last = now; t += dt;
    drawWater(t);
    if (coralLayer) ctx.drawImage(coralLayer, 0, 0);
    drawKelp(t);
    drawFishes(dt);
    drawShark(dt);
    drawBubbles(dt);
    drawNotes(dt);
  }

  resize();
  addEventListener('resize', resize);
  addEventListener('click', e => {
    const x = e.clientX / P, y = e.clientY / P;
    for (let i = 0; i < 4; i++) {
      bubbles.push({ x: x + (Math.random() - .5) * 5, y: y + Math.random() * 3, vy: 7 + Math.random() * 6, ph: Math.random() * 6, big: Math.random() < .4, respawn: false });
    }
  });
  if (reduce) { t = 2; frame(100); } else requestAnimationFrame(frame);
})();
