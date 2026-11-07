(() => {
  "use strict";

  const canvas = document.querySelector("#universe");
  const ctx = canvas.getContext("2d");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const state = {
    scene: "boot", entered: false, bloom: 0, bloomTarget: 0, celebration: 0,
    mouseX: 0, mouseY: 0, width: innerWidth, height: innerHeight, dpr: 1, time: 0,
    gardenOpen: false, gardenAge: 0,
  };

  const colors = { rose: "#e890ac", cyan: "#80d4d2", gold: "#d8b46f", dim: "#47404e" };
  const TAU = Math.PI * 2;
  const glyphs = ".·+*x01{}<>/\\";
  const whispers = [
    "I love you", "நான் உன்னை காதலிக்கிறேன்", "ഞാൻ നിന്നെ സ്നേഹിക്കുന്നു", "मैं तुमसे प्यार करता हूँ",
    "আমি তোমাকে ভালোবাসি", "Te amo", "Je t’aime", "Ti amo", "Ich liebe dich", "Eu te amo",
    "愛してる", "사랑해", "Σ’ αγαπώ", "أحبك", "Я тебя люблю", "Seni seviyorum", "Aku cinta kamu",
    "Nakupenda", "Will you marry me?", "¿Quieres casarte conmigo?", "Veux-tu m’épouser?",
    "என்னை திருமணம் செய்வாயா?", "നീ എന്നെ വിവാഹം കഴിക്കുമോ?", "क्या तुम मुझसे शादी करोगी?",
  ];
  const stars = Array.from({ length: 230 }, (_, i) => ({
    x: hash(i * 3.17), y: hash(i * 8.31 + 7), z: .25 + hash(i * 1.93) * .75,
    p: hash(i * 9.71) * Math.PI * 2, c: i % 17 === 0 ? colors.rose : i % 23 === 0 ? colors.cyan : "#d9d2dc",
  }));
  const rain = Array.from({ length: 80 }, (_, i) => ({ x: hash(i * 4.17), y: hash(i * 8.02), s: .2 + hash(i * 9.1) * .7 }));
  const flowers = Array.from({ length: 31 }, (_, i) => ({
    x: hash(i * 5.63), base: .82 + hash(i * 8.13) * .23, size: .55 + hash(i * 2.11) * 1.1,
    petals: 7 + Math.floor(hash(i * 4.71) * 7), delay: hash(i * 6.23), sway: hash(i * 7.1) * 6,
    color: [colors.rose, colors.cyan, colors.gold, "#9e7dc5"][i % 4],
  }));

  function hash(n) { return (Math.sin(n * 127.1) * 43758.5453) % 1 + ((Math.sin(n * 127.1) * 43758.5453) % 1 < 0 ? 1 : 0); }
  function clamp(v, a = 0, b = 1) { return Math.max(a, Math.min(b, v)); }
  function ease(v) { v = clamp(v); return 1 - Math.pow(1 - v, 3); }
  function resize() {
    state.dpr = Math.min(devicePixelRatio || 1, 2);
    state.width = innerWidth; state.height = innerHeight;
    canvas.width = state.width * state.dpr; canvas.height = state.height * state.dpr;
    canvas.style.width = `${state.width}px`; canvas.style.height = `${state.height}px`;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  }

  function drawStars(t) {
    ctx.font = `${Math.max(8, state.width / 120)}px monospace`;
    ctx.textAlign = "center";
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const px = (s.x * state.width + state.mouseX * (s.z - .5) * 13 + t * s.z * 1.7) % state.width;
      const py = s.y * state.height + state.mouseY * (s.z - .5) * 9;
      const twinkle = .18 + .55 * (.5 + .5 * Math.sin(t * (.6 + s.z) + s.p));
      ctx.globalAlpha = twinkle;
      ctx.fillStyle = s.c;
      ctx.fillText(glyphs[(i * 7) % glyphs.length], px, py);
    }
    ctx.globalAlpha = 1;
  }

  function drawRain(t) {
    if (state.scene !== "boot" && state.scene !== "origin") return;
    ctx.font = "10px monospace"; ctx.fillStyle = colors.rose;
    rain.forEach((r, i) => {
      const y = ((r.y * state.height + t * 24 * r.s) % (state.height + 150)) - 100;
      ctx.globalAlpha = .035 + r.s * .055;
      for (let k = 0; k < 8; k++) ctx.fillText(glyphs[(i + k) % glyphs.length], r.x * state.width, y - k * 13);
    });
    ctx.globalAlpha = 1;
  }

  function drawWhispers(t) {
    if (!["constellation", "goddess", "promise", "garden", "letter", "proposal", "dream", "forever"].includes(state.scene)) return;
    const strength = state.scene === "proposal" || state.scene === "dream" || state.scene === "forever" ? .12 : .065;
    ctx.save();
    ctx.font = `${Math.max(9, Math.min(13, state.width / 105))}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    whispers.forEach((phrase, i) => {
      const x = (.06 + hash(i * 4.21) * .88) * state.width;
      const y = (.09 + hash(i * 7.43 + 2) * .82) * state.height;
      ctx.globalAlpha = strength * (.55 + .45 * Math.sin(t * .22 + i));
      ctx.fillStyle = i % 5 === 0 ? colors.rose : i % 7 === 0 ? colors.cyan : "#d2cad5";
      ctx.fillText(phrase, x, y);
    });
    ctx.restore();
  }

  function drawGalaxy(t) {
    if (!["origin", "constellation", "goddess"].includes(state.scene)) return;
    const alpha = state.scene === "origin" ? .58 : .24;
    const cx = state.width * (.73 + state.mouseX * .01), cy = state.height * .43;
    ctx.font = `${Math.max(8, state.width / 110)}px monospace`;
    for (let i = 0; i < 460; i++) {
      const arm = i % 3;
      const r = Math.pow(i / 460, .68) * Math.min(state.width, state.height) * .35;
      const a = arm * Math.PI * 2 / 3 + r * .025 + t * .035 + hash(i) * .25;
      const x = cx + Math.cos(a) * r * 1.35;
      const y = cy + Math.sin(a) * r * .42;
      ctx.globalAlpha = alpha * (1 - i / 580);
      ctx.fillStyle = i % 19 === 0 ? colors.rose : i % 31 === 0 ? colors.cyan : "#b4aeba";
      ctx.fillText(glyphs[i % glyphs.length], x, y);
    }
    ctx.globalAlpha = 1;
  }

  function drawLightning(t) {
    if (state.scene !== "goddess") return;
    const x = state.width * .5, top = 70, length = state.height * .7;
    ctx.save(); ctx.strokeStyle = colors.gold; ctx.globalAlpha = .13 + .05 * Math.sin(t * 2); ctx.lineWidth = 1;
    for (let bolt = -2; bolt <= 2; bolt++) {
      ctx.beginPath(); ctx.moveTo(x + bolt * 50, top);
      for (let k = 1; k < 15; k++) ctx.lineTo(x + bolt * 50 + (hash(k * 8 + bolt) - .5) * 70, top + k * length / 14);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawOcean(t) {
    if (state.scene !== "promise") return;
    ctx.save();
    ctx.font = `${Math.max(8, state.width / 130)}px monospace`;
    ctx.textAlign = "center";
    for (let layer = 0; layer < 9; layer++) {
      const baseY = state.height * (.62 + layer * .045);
      const amplitude = 7 + layer * 2.4;
      for (let x = -10; x < state.width + 10; x += 13) {
        const y = baseY + Math.sin(x * .014 + t * (.32 + layer * .02) + layer) * amplitude;
        ctx.globalAlpha = .05 + layer * .018;
        ctx.fillStyle = layer % 3 === 0 ? colors.rose : colors.cyan;
        ctx.fillText(glyphs[(Math.floor(x / 13) + layer * 3 + 99) % glyphs.length], x, y);
      }
    }
    ctx.globalAlpha = .22; ctx.strokeStyle = colors.gold; ctx.beginPath();
    ctx.moveTo(0, state.height * .615);
    for (let x = 0; x <= state.width; x += 8) ctx.lineTo(x, state.height * .615 + Math.sin(x * .012 + t * .2) * 4);
    ctx.stroke(); ctx.restore();
  }

  function drawFlower(f, index, progress, t) {
    const local = ease((progress - f.delay * .62) / .38);
    if (local <= 0) return;
    const x = f.x * state.width;
    const bottom = Math.min(state.height * f.base, state.height + 20);
    const h = (70 + f.size * 95) * local;
    const sway = Math.sin(t * .5 + f.sway) * 4;
    const y = bottom - h;
    ctx.strokeStyle = index % 2 ? "rgba(128,212,210,.22)" : "rgba(232,144,172,.22)";
    ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, bottom); ctx.quadraticCurveTo(x - sway * 2, bottom - h * .45, x + sway, y); ctx.stroke();
    ctx.font = `${Math.max(9, 9 + f.size * 3)}px monospace`; ctx.textAlign = "center";
    for (let ring = 0; ring < 3; ring++) {
      const radius = (11 + ring * 12) * f.size * local;
      const petals = f.petals + ring * 2;
      for (let p = 0; p < petals; p++) {
        const a = p * Math.PI * 2 / petals + ring * .38 + t * (index % 2 ? .018 : -.014);
        ctx.globalAlpha = .28 + .2 * ring + .18 * Math.sin(t + p);
        ctx.fillStyle = f.color;
        ctx.fillText(glyphs[(p + ring + index) % glyphs.length], x + sway + Math.cos(a) * radius, y + Math.sin(a) * radius * .6);
      }
    }
    ctx.globalAlpha = .7; ctx.fillStyle = colors.gold; ctx.fillText(index % 2 ? "@" : "*", x + sway, y + 4);
    ctx.globalAlpha = 1;
  }

  function drawGarden(t) {
    const visible = ["garden", "letter", "proposal", "dream", "forever"].includes(state.scene) ? 1 : 0;
    state.bloomTarget = Math.max(state.bloomTarget, visible * .45);
    state.bloom = reduceMotion ? state.bloomTarget : state.bloom + (state.bloomTarget - state.bloom) * .025;
    flowers.forEach((f, i) => drawFlower(f, i, state.bloom, t));
  }

  function drawGlassPetal(length, width, alpha, palette) {
    const gradient = ctx.createLinearGradient(0, 8, 0, -length);
    gradient.addColorStop(0, palette[0]); gradient.addColorStop(.48, palette[1]); gradient.addColorStop(1, palette[2]);
    ctx.beginPath(); ctx.moveTo(0, 8);
    ctx.bezierCurveTo(-width * .72, -length * .18, -width * .54, -length * .78, 0, -length);
    ctx.bezierCurveTo(width * .54, -length * .78, width * .72, -length * .18, 0, 8);
    ctx.closePath(); ctx.globalAlpha = alpha; ctx.fillStyle = gradient; ctx.fill();
    ctx.globalAlpha = alpha * 1.45; ctx.strokeStyle = "rgba(255,220,235,.34)"; ctx.lineWidth = .8; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 4); ctx.quadraticCurveTo(width * .07, -length * .5, 0, -length * .92);
    ctx.strokeStyle = "rgba(128,212,210,.2)"; ctx.stroke();
  }

  function drawGlassBloom(cx, cy, size, progress, t, seed = 0, alpha = 1) {
    if (progress <= 0 || alpha <= 0) return;
    const palettes = [
      ["rgba(82,8,39,.14)", "rgba(196,42,99,.34)", "rgba(255,188,215,.42)"],
      ["rgba(42,10,73,.12)", "rgba(163,73,171,.27)", "rgba(185,218,236,.36)"],
      ["rgba(89,34,12,.11)", "rgba(194,87,67,.27)", "rgba(244,187,151,.34)"],
    ];
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.sin(t * .28 + seed) * .035 + state.mouseX * .035);
    ctx.globalCompositeOperation = "screen";
    const rings = [
      { count: 22, radius: .23, length: .45, width: .14, delay: .00 },
      { count: 18, radius: .16, length: .36, width: .13, delay: .09 },
      { count: 14, radius: .105, length: .28, width: .12, delay: .18 },
      { count: 9, radius: .055, length: .19, width: .10, delay: .28 },
    ];
    rings.forEach((ring, ri) => {
      const open = ease((progress - ring.delay) / Math.max(.2, 1 - ring.delay));
      for (let i = 0; i < ring.count; i++) {
        const angle = i * TAU / ring.count + ri * .31 + seed * .19;
        const ripple = 1 + Math.sin(t * .9 + i * 1.7 + seed) * .028;
        ctx.save(); ctx.rotate(angle); ctx.translate(0, -size * ring.radius * open);
        ctx.scale(.3 + .7 * open, (.2 + .8 * open) * ripple);
        drawGlassPetal(size * ring.length, size * ring.width, alpha * (.16 + ri * .035), palettes[(ri + Math.floor(seed)) % palettes.length]);
        ctx.restore();
      }
    });
    ctx.globalAlpha = alpha * .75; ctx.fillStyle = "#f3b6c8"; ctx.shadowColor = colors.rose; ctx.shadowBlur = size * .09;
    for (let i = 0; i < 23; i++) {
      const a = i * 2.4 + seed, r = size * (.015 + hash(i + seed) * .055) * progress;
      ctx.beginPath(); ctx.arc(Math.cos(a) * r, Math.sin(a) * r, Math.max(1, size * .006), 0, TAU); ctx.fill();
    }
    ctx.restore(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
  }

  function drawCinematicGarden(t) {
    if (state.scene !== "garden") return;
    const unit = Math.min(state.width, state.height);
    const cx = state.width * .5 + state.mouseX * 18, cy = state.height * .48 + state.mouseY * 12;
    if (!state.gardenOpen) {
      drawGlassBloom(cx, cy, unit * .53, .5 + Math.sin(t * .55) * .035, t, 2, .62);
      return;
    }
    const age = state.gardenAge;
    const push = ease(age / 1.75);
    const mainAlpha = 1 - clamp((age - 1.05) / .85);
    drawGlassBloom(cx, cy, unit * .53 * (1 + push * 2.85), .5 + push * .5, t, 2, mainAlpha * .9);
    const garden = ease((age - .72) / 2.5);
    const blooms = [
      [.10,.18,.24,1], [.88,.18,.22,4], [.06,.52,.27,7], [.94,.52,.25,10],
      [.16,.88,.24,13], [.84,.88,.23,16], [.34,.09,.16,19], [.68,.08,.17,22],
      [.31,.91,.17,25], [.69,.91,.16,28],
    ];
    blooms.forEach((b, i) => {
      const local = ease((garden - i * .035) / .78);
      const swayX = Math.sin(t * .32 + i) * 8, swayY = Math.cos(t * .28 + i * .7) * 5;
      drawGlassBloom(state.width * b[0] + swayX, state.height * b[1] + swayY, unit * b[2], local, t, b[3], .42 + local * .25);
    });
  }

  function pointRing(t, celebration = false) {
    if (state.scene !== "proposal") return;
    const cx = state.width / 2;
    const cy = Math.max(235, state.height * .29);
    const scale = Math.min(state.width, state.height) * (state.width < 600 ? .18 : .16);
    const rot = t * .22;
    ctx.font = `${Math.max(8, scale / 20)}px monospace`; ctx.textAlign = "center";
    // Ring band: a perspective torus made from characters.
    for (let i = 0; i < 720; i++) {
      const u = (i % 120) / 120 * Math.PI * 2;
      const v = Math.floor(i / 120) / 6 * Math.PI * 2;
      const R = 1, r = .11;
      const X = (R + r * Math.cos(v)) * Math.cos(u);
      const Y = (R + r * Math.cos(v)) * Math.sin(u);
      const Z = r * Math.sin(v);
      const xr = X * Math.cos(rot) + Z * Math.sin(rot);
      const zr = -X * Math.sin(rot) + Z * Math.cos(rot);
      const light = clamp(.25 + zr * 3 + Math.sin(u - t) * .35);
      ctx.globalAlpha = .22 + light * .72;
      ctx.fillStyle = light > .7 ? "#fff7ec" : light > .43 ? colors.cyan : "#8d8791";
      ctx.fillText(glyphs[(i * 5) % glyphs.length], cx + xr * scale, cy + Y * scale * 1.08);
    }
    // Four prongs and faceted diamond.
    const top = cy - scale * 1.25;
    for (let p = 0; p < 4; p++) {
      const side = (p - 1.5) * scale * .25;
      ctx.strokeStyle = p % 2 ? "rgba(128,212,210,.62)" : "rgba(232,144,172,.56)";
      ctx.beginPath(); ctx.moveTo(cx + side * .4, cy - scale * .91); ctx.lineTo(cx + side, top - scale * .4); ctx.stroke();
    }
    const layers = 13;
    for (let row = 0; row < layers; row++) {
      const ratio = row < 4 ? row / 4 : 1 - (row - 4) / 9;
      const half = Math.max(1, ratio * scale * .52);
      const y = top - scale * .42 + row * scale * .055;
      const count = Math.max(3, Math.floor(half / 7));
      for (let k = -count; k <= count; k++) {
        ctx.globalAlpha = .28 + .65 * hash(row * 30 + k);
        ctx.fillStyle = (row + k) % 4 === 0 ? colors.rose : "#e8e6df";
        ctx.fillText(glyphs[Math.abs(row * 9 + k) % glyphs.length], cx + k * half / count, y);
      }
    }
    if (celebration) {
      ctx.globalAlpha = .7; ctx.strokeStyle = colors.gold;
      for (let i = 0; i < 18; i++) {
        const a = i * Math.PI / 9 + t * .05, r = scale * (1.5 + hash(i) * .45);
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * scale * 1.15, cy + Math.sin(a) * scale * 1.15);
        ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawDreamHorizon(t) {
    if (!["dream", "forever"].includes(state.scene)) return;
    const horizon = state.height * .68;
    ctx.save(); ctx.textAlign = "center"; ctx.font = `${Math.max(8, state.width / 125)}px monospace`;
    // A faraway field made from the same characters as the first stars.
    for (let row = 0; row < 10; row++) {
      for (let x = 0; x < state.width; x += 12) {
        ctx.globalAlpha = .035 + row * .012;
        ctx.fillStyle = row % 3 === 0 ? colors.gold : row % 2 ? colors.cyan : colors.rose;
        const y = horizon + row * 13 + Math.sin(x * .02 + t * .14 + row) * 3;
        ctx.fillText(glyphs[(Math.floor(x / 12) + row * 5) % glyphs.length], x, y);
      }
    }
    // The small house: peace to return to, not a world to hide from.
    const hx = state.width * .73, hy = horizon - 66, unit = Math.max(4, Math.min(8, state.width / 190));
    ctx.globalAlpha = .22; ctx.fillStyle = colors.rose; ctx.font = `${unit * 2.3}px monospace`;
    ["       /\\", "      /  \\", "     /____\\", "     | [] |", "     |  __|", "_____|_|__|_____"].forEach((line, i) => ctx.fillText(line, hx, hy + i * unit * 2));
    // An old bike constellation: repaired piece by piece, like a shared life.
    const bx = state.width * .24, by = horizon - 25, r = 22;
    ctx.strokeStyle = "rgba(128,212,210,.2)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(bx - 34, by, r, 0, TAU); ctx.arc(bx + 34, by, r, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx - 34, by); ctx.lineTo(bx, by); ctx.lineTo(bx - 9, by - 30); ctx.lineTo(bx + 34, by); ctx.lineTo(bx, by); ctx.lineTo(bx + 15, by - 36); ctx.stroke();
    ctx.globalAlpha = .17; ctx.fillStyle = colors.gold; ctx.fillText("repair / ride / return", bx, by + 49);
    // Moon projector glow above the quiet field.
    const moon = ctx.createRadialGradient(state.width * .5, state.height * .2, 0, state.width * .5, state.height * .2, 90);
    moon.addColorStop(0, "rgba(232,144,172,.15)"); moon.addColorStop(1, "rgba(232,144,172,0)");
    ctx.fillStyle = moon; ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(state.width * .5, state.height * .2, 90, 0, TAU); ctx.fill();
    ctx.restore();
  }

  const bursts = [];
  function celebrate() {
    state.celebration = 1;
    for (let b = 0; b < 9; b++) {
      const cx = hash(b * 9.2) * state.width, cy = .12 * state.height + hash(b * 3.7) * state.height * .55;
      for (let i = 0; i < 45; i++) bursts.push({ cx, cy, a: i * Math.PI * 2 / 45, v: 25 + hash(i * 4 + b) * 85, age: -b * .15, c: [colors.rose, colors.cyan, colors.gold][b % 3] });
    }
  }
  function drawBursts(t, dt) {
    bursts.forEach(p => {
      p.age += dt; if (p.age < 0 || p.age > 4) return;
      const r = p.v * p.age;
      ctx.globalAlpha = Math.max(0, 1 - p.age / 4); ctx.fillStyle = p.c; ctx.font = "11px monospace";
      ctx.fillText(glyphs[Math.floor(p.a * 10) % glyphs.length], p.cx + Math.cos(p.a) * r, p.cy + Math.sin(p.a) * r + p.age * p.age * 7);
    });
    ctx.globalAlpha = 1;
  }

  let last = performance.now(), animationFrame = 0;
  function render(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now; state.time += reduceMotion ? 0 : dt;
    ctx.clearRect(0, 0, state.width, state.height);
    const g = ctx.createRadialGradient(state.width * .5, state.height * .42, 0, state.width * .5, state.height * .42, Math.max(state.width, state.height) * .72);
    g.addColorStop(0, state.scene === "goddess" ? "#15101a" : "#100b16"); g.addColorStop(1, "#030307");
    ctx.fillStyle = g; ctx.fillRect(0, 0, state.width, state.height);
    if (state.gardenOpen && state.scene === "garden") state.gardenAge = reduceMotion ? 4 : state.gardenAge + dt;
    drawStars(state.time); drawRain(state.time); drawWhispers(state.time); drawGalaxy(state.time); drawLightning(state.time); drawOcean(state.time);
    drawCinematicGarden(state.time); drawGarden(state.time); pointRing(state.time, state.celebration > 0); drawDreamHorizon(state.time); drawBursts(state.time, dt);
    animationFrame = requestAnimationFrame(render);
  }
  function startRendering() {
    if (animationFrame || document.hidden) return;
    last = performance.now();
    animationFrame = requestAnimationFrame(render);
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    } else startRendering();
  });

  const bootLines = [
    ["booting heartOS v∞ ...", ""], ["loading moonlight.dll", ""], ["mounting /memories/tiny-hug", ""],
    ["indexing stars: 1,000,000,000", ""], ["searching every universe for: luna", ""],
    ["match found: 1 / ∞", "ok"], ["permission granted by: the heart", "ok"], ["welcome home, goddess.", "final"],
  ];
  const bootLog = document.querySelector("#bootLog");
  const enterButton = document.querySelector("#enterButton");
  let lineIndex = 0;
  function bootStep() {
    if (lineIndex >= bootLines.length) {
      enterButton.disabled = false;
      setTimeout(() => { if (!sessionStorage.getItem("luna-guide-seen") && !guideDialog.open) guideDialog.showModal(); }, 250);
      return;
    }
    const p = document.createElement("p"); p.className = `boot-line ${bootLines[lineIndex][1]}`; p.textContent = bootLines[lineIndex][0]; bootLog.append(p); lineIndex++;
    setTimeout(bootStep, reduceMotion ? 20 : 330 + Math.random() * 230);
  }
  setTimeout(bootStep, 450);
  document.querySelector("#mobileContinue").addEventListener("click", () => document.querySelector("#deviceGate").classList.add("dismissed"));

  const sections = [...document.querySelectorAll(".scene[data-scene]")];
  let sceneMotionQueued = false;
  function updateSceneMotion() {
    sceneMotionQueued = false;
    sections.forEach(section => {
      if (section.classList.contains("locked")) return;
      const rect = section.getBoundingClientRect();
      const camera = clamp((rect.top + rect.height / 2 - innerHeight / 2) / innerHeight, -1.2, 1.2);
      section.style.setProperty("--camera", camera.toFixed(3));
    });
  }
  function queueSceneMotion() {
    if (sceneMotionQueued) return; sceneMotionQueued = true; requestAnimationFrame(updateSceneMotion);
  }
  function pulseTransition(fromElement) {
    const rect = fromElement.getBoundingClientRect();
    document.documentElement.style.setProperty("--flare-x", `${rect.left + rect.width / 2}px`);
    document.documentElement.style.setProperty("--flare-y", `${rect.top + rect.height / 2}px`);
    document.body.classList.add("scene-shifting");
    setTimeout(() => document.body.classList.remove("scene-shifting"), reduceMotion ? 40 : 920);
  }
  addEventListener("scroll", queueSceneMotion, { passive: true });
  addEventListener("resize", queueSceneMotion, { passive: true });
  queueSceneMotion();
  const chapterLabel = document.querySelector("#chapterLabel");
  const labels = { boot: "00 / boot", origin: "01 / origin", constellation: "02 / memories", goddess: "03 / myth", promise: "04 / promise", garden: "05 / garden", letter: "06 / letter", proposal: "07 / question", dream: "08 / dream", forever: "09 / next" };
  const directions = {
    boot: ["00", "begin here", "Run the little universe when you are ready."],
    origin: ["01", "follow the signal", "Read this first, then trace the signal below."],
    constellation: ["02", "collect all eight stars", "Touch every glow. Each one holds something I remembered."],
    goddess: ["03", "follow the lightning", "Let the myth soften, then continue to the shore."],
    promise: ["04", "stay where the tide returns", "Read the promise underneath the grand words."],
    garden: ["05", "open the first flower", "One bloom is waiting behind the stars. Let it become our garden."],
    letter: ["06", "open the unsent draft", "Take your time. The next chapter asks the question."],
    proposal: ["07", "answer in your own time", "This moment matters—but it is not where the story ends."],
    dream: ["08", "touch every future", "Open the six fragments and see what forever means here."],
    forever: ["09", "leave the ending open", "There is no final page. Only the next thing we choose to build."],
  };
  function direct(scene, override) {
    const cue = override || directions[scene];
    if (!cue) return;
    document.querySelector("#directorMark").textContent = cue[0];
    document.querySelector("#directorVerb").textContent = cue[1];
    document.querySelector("#directorText").textContent = cue[2];
  }

  const journeyOrder = ["boot", "origin", "constellation", "goddess", "promise", "garden", "letter", "proposal", "dream", "forever"];
  let unlockedIndex = 0;
  function setJourneyLimit(index) {
    unlockedIndex = Math.max(unlockedIndex, index);
    sections.forEach(section => section.classList.toggle("locked", journeyOrder.indexOf(section.dataset.scene) > unlockedIndex));
    document.querySelectorAll("[data-rail]").forEach(link => {
      const locked = journeyOrder.indexOf(link.dataset.rail) > unlockedIndex;
      link.classList.toggle("locked", locked);
      link.setAttribute("aria-disabled", String(locked));
      if (locked) link.setAttribute("tabindex", "-1");
      else link.removeAttribute("tabindex");
    });
    document.body.classList.add("journey-ready");
  }
  function unlockScene(id) { setJourneyLimit(journeyOrder.indexOf(id)); }

  const guideStar = document.querySelector("#guideStar");
  let guideTarget = null;
  function setGuideTarget(target, title, message) {
    guideTarget?.classList.remove("guided-target");
    guideTarget = typeof target === "string" ? document.querySelector(target) : target;
    if (!guideTarget) return;
    guideTarget.classList.add("guided-target");
    document.querySelector("#guideStarTitle").textContent = title;
    document.querySelector("#guideStarText").textContent = message;
    guideStar.setAttribute("aria-hidden", "false");
    updateGuidePosition();
  }
  function updateGuidePosition() {
    if (!guideTarget || !document.body.classList.contains("guided")) return;
    const rect = guideTarget.getBoundingClientRect();
    if (!rect.width && !rect.height) return;
    let x = rect.left > innerWidth * .56 ? rect.left - 150 : rect.right + 150;
    let y = rect.top + rect.height / 2;
    x = clamp(x, 150, innerWidth - 150);
    y = clamp(y, 88, innerHeight - 88);
    guideStar.style.left = `${x}px`; guideStar.style.top = `${y}px`;
  }
  addEventListener("scroll", updateGuidePosition, { passive: true });
  addEventListener("resize", updateGuidePosition, { passive: true });

  const readGateTimers = new Set();
  const readGateDelay = { origin: 2600, goddess: 4200, promise: 5200, letter: 8500 };
  function scheduleReadGate(scene) {
    const next = document.querySelector(`#${scene} [data-next]`);
    if (!next || readGateTimers.has(scene) || !readGateDelay[scene]) return;
    readGateTimers.add(scene); next.disabled = true;
    setTimeout(() => {
      next.disabled = false; next.classList.add("unlocked");
      guideForScene(scene);
      chime(620, .22);
    }, reduceMotion ? 40 : readGateDelay[scene]);
  }
  function guideForScene(scene = state.scene) {
    if (!document.body.classList.contains("guided")) return;
    scheduleReadGate(scene);
    const next = document.querySelector(`#${scene} [data-next]`);
    if (readGateDelay[scene] && next?.disabled) {
      const copy = document.querySelector(`#${scene} .chapter-copy, #${scene} .letter-card, #${scene} .myth-copy, #${scene} .promise-copy`);
      setGuideTarget(copy, "stay with this moment", "The next path will glow when these words have had a little time to breathe.");
      return;
    }
    if (scene === "boot") { setGuideTarget("#enterButton", "begin here", "When the little universe finishes loading, touch this glowing command."); return; }
    if (scene === "constellation") {
      const unvisited = document.querySelector("[data-memory]:not(.visited)");
      if (unvisited) {
        if (dialog.open) setGuideTarget(".dialog-next", "the next memory is here", "Keep following the butterflies through every saved moment.");
        else setGuideTarget(unvisited, "touch this star", "It is holding the next memory. Eight lights must be opened before the path continues.");
      } else if (dialog.open) setGuideTarget("#memoryDialog .dialog-close", "all eight are safe", "Close this memory, then follow the lightning onward.");
      else setGuideTarget(next, "all eight remembered", "The next chapter is open. Follow the lightning.");
      return;
    }
    if (scene === "garden") {
      if (!document.querySelector("#garden").classList.contains("garden-open")) setGuideTarget("#bloomButton", "open the first flower", "Touch it once. The universe will carry you through the petals.");
      else if (next?.disabled) setGuideTarget(".garden-memory", "stay in the garden", "Nothing to click yet. Let the flowers finish opening around these words.");
      else setGuideTarget(next, "the letter is ready", "The butterflies found the next piece. Open the unsent letter.");
      return;
    }
    if (scene === "proposal") {
      const after = document.querySelector("#afterQuestion");
      if (after.hidden) setGuideTarget(".proposal-actions", "this answer is yours", "Choose the glowing answer, or hold my hand first. Take the time you need.");
      else setGuideTarget(after, "the story does not end here", "Keep going. The life after the question is waiting.");
      return;
    }
    if (scene === "dream") {
      const unseen = document.querySelector("[data-dream]:not(.seen)");
      if (unseen) setGuideTarget(unseen, "touch the next future", "Each fragment is part of the life after the grand moment. Open all six.");
      else setGuideTarget(next, "the horizon is complete", "Now write the next commit.");
      return;
    }
    if (scene === "forever") { setGuideTarget("#replayButton", "you reached the open ending", "There is no final page—only every tomorrow after this one."); return; }
    if (next) setGuideTarget(next, "the path continues here", "The butterflies are waiting on the next chapter.");
  }

  document.querySelectorAll("[data-next]").forEach(button => { button.disabled = true; });
  document.querySelector("#afterQuestion").disabled = true;
  setJourneyLimit(0);
  const observer = new IntersectionObserver(entries => {
    const current = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!current) return;
    state.scene = current.target.dataset.scene; chapterLabel.textContent = labels[state.scene];
    direct(state.scene);
    sections.forEach(s => s.classList.toggle("active", s === current.target));
    document.querySelectorAll("[data-rail]").forEach(link => link.classList.toggle("active", link.dataset.rail === state.scene));
    guideForScene(state.scene);
    patchGuideForScene(state.scene);
  }, { threshold: [.35, .6] });
  sections.forEach(s => observer.observe(s));

  enterButton.addEventListener("click", () => {
    state.entered = true; unlockScene("origin"); document.querySelector("#origin").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    startAudio();
    setTimeout(() => {
      if (!sessionStorage.getItem("luna-guide-seen")) guideDialog.showModal();
      else { document.body.classList.add("guided"); guideForScene("origin"); }
    }, reduceMotion ? 10 : 850);
  });
  document.querySelectorAll("[data-next]").forEach(button => button.addEventListener("click", () => {
    if (button.disabled) return;
    pulseTransition(button);
    unlockScene(button.dataset.next);
    document.querySelector(`#${button.dataset.next}`).scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    setTimeout(() => guideForScene(button.dataset.next), reduceMotion ? 20 : 720);
  }));
  document.querySelectorAll("[data-rail]").forEach(link => link.addEventListener("click", e => {
    if (journeyOrder.indexOf(link.dataset.rail) > unlockedIndex) e.preventDefault();
  }));

  const guideDialog = document.querySelector("#guideDialog");
  const closeGuide = () => {
    sessionStorage.setItem("luna-guide-seen", "1"); document.body.classList.add("guided");
    guideDialog.close(); direct(state.scene); guideForScene(state.scene);
  };
  document.querySelector("#guideButton").addEventListener("click", () => guideDialog.showModal());
  document.querySelector(".guide-close").addEventListener("click", closeGuide);
  document.querySelector(".guide-start").addEventListener("click", closeGuide);
  guideDialog.addEventListener("click", e => { if (e.target === guideDialog) closeGuide(); });
  guideDialog.addEventListener("cancel", e => { e.preventDefault(); closeGuide(); });

  // PATCH // a tiny, local-only companion state machine. No model calls, no data leaves the page.
  const patchCompanion = document.querySelector("#patchCompanion");
  const patchSummon = document.querySelector("#patchSummon");
  const patchDen = document.querySelector("#patchDen");
  const patchSpeech = document.querySelector("#patchSpeech");
  const patchWhisper = document.querySelector("#patchWhisper");
  const patchWhisperText = document.querySelector("#patchWhisperText");
  const patchBreath = document.querySelector("#patchBreath");
  const patchActions = [...document.querySelectorAll("[data-patch-action]")];
  let patchActionTimer = 0;
  let patchWhisperTimer = 0;
  let patchIdleTimer = 0;
  let patchBreathTimer = 0;
  let patchBusy = false;
  let patchGreetingShown = false;
  const patchSeenScenes = new Set();

  document.querySelector("#patchModelMount").innerHTML = '<img class="patch-avatar-art" src="assets/patch-avatar-v2.webp" alt="Patch, a tiny stitched bat-bear guardian">';

  function clearPatchAction() {
    clearTimeout(patchActionTimer);
    clearTimeout(patchBreathTimer);
    patchBreath.hidden = true;
    patchActions.forEach(button => button.classList.remove("active"));
  }

  function setPatchState(name, speech, duration = 0) {
    clearPatchAction();
    patchDen.dataset.patchState = name;
    patchCompanion.dataset.patchState = name;
    patchSpeech.textContent = speech;
    if (duration) {
      patchBusy = true;
      patchActionTimer = setTimeout(() => {
        patchBusy = false;
        patchDen.dataset.patchState = "idle";
        patchCompanion.dataset.patchState = "idle";
        patchSpeech.textContent = "I’ll be right here. You do not have to entertain me.";
      }, reduceMotion ? Math.min(duration, 900) : duration);
    }
  }

  function showPatchWhisper(text, duration = 5600) {
    if (!patchCompanion.classList.contains("awake") || patchDen.open) return;
    clearTimeout(patchWhisperTimer);
    patchWhisperText.textContent = text;
    patchWhisper.hidden = false;
    patchWhisperTimer = setTimeout(() => { patchWhisper.hidden = true; }, reduceMotion ? Math.min(duration, 2200) : duration);
  }

  function wakePatch() {
    if (patchCompanion.classList.contains("awake")) return;
    patchCompanion.classList.add("awake");
    if (!sessionStorage.getItem("patch-introduced")) {
      setTimeout(() => {
        showPatchWhisper("Psst. I’m Patch. I stay near the edge of the universe on difficult days.", 6800);
        sessionStorage.setItem("patch-introduced", "1");
      }, reduceMotion ? 120 : 900);
    }
    schedulePatchIdle();
  }

  function openPatch() {
    clearTimeout(patchWhisperTimer);
    patchWhisper.hidden = true;
    patchSummon.setAttribute("aria-expanded", "true");
    patchDen.dataset.patchState = "wave";
    patchSpeech.textContent = "Oh. You found me. I was absolutely not waiting behind the moon.";
    patchDen.showModal();
    patchActionTimer = setTimeout(() => { if (!patchBusy) patchDen.dataset.patchState = "idle"; }, reduceMotion ? 80 : 2600);
  }

  function closePatch() {
    clearPatchAction();
    patchBusy = false;
    patchSummon.setAttribute("aria-expanded", "false");
    patchDen.dataset.patchState = "idle";
    if (patchDen.open) patchDen.close();
    schedulePatchIdle();
  }

  function breatheWithPatch() {
    clearPatchAction();
    patchBusy = true;
    patchDen.dataset.patchState = "breathe";
    patchCompanion.dataset.patchState = "breathe";
    patchBreath.hidden = false;
    const label = patchBreath.querySelector("b");
    const count = patchBreath.querySelector("small");
    let cycle = 1;
    let breathingIn = true;
    const step = () => {
      label.textContent = breathingIn ? "Breathe in" : "Breathe out";
      count.textContent = `${cycle} / 3`;
      patchSpeech.textContent = breathingIn
        ? "Slowly. No perfect breath required. Just make a little room."
        : "Let the shoulders fall. Patch is carrying absolutely nothing with dignity.";
      const delay = reduceMotion ? 1200 : 4000;
      patchBreathTimer = setTimeout(() => {
        if (!breathingIn) cycle += 1;
        breathingIn = !breathingIn;
        if (cycle > 3) {
          patchBusy = false;
          patchBreath.hidden = true;
          patchDen.dataset.patchState = "idle";
          patchCompanion.dataset.patchState = "idle";
          patchSpeech.textContent = "Three breaths. Nothing had to be fixed. You still made a little room—and that counts.";
          return;
        }
        step();
      }, delay);
    };
    step();
  }

  const patchCheer = [
    "I audited the universe. You are still the rarest beautiful bug.",
    "Breaking news: bookworm caught resting. Civilization survives.",
    "If today has an attitude, I have tiny wings and no fear.",
    "Patch.exe encountered a problem: Luna remains unfairly adorable.",
    "I tried to fight the bad mood. My arms are tiny. I did hiss at it, though."
  ];

  function runPatchAction(action, button) {
    patchActions.forEach(item => item.classList.toggle("active", item === button));
    if (action === "breathe") { breatheWithPatch(); button.classList.add("active"); return; }
    if (action === "quiet") {
      clearPatchAction();
      button.classList.add("active");
      patchBusy = true;
      patchDen.dataset.patchState = "quiet";
      patchCompanion.dataset.patchState = "quiet";
      patchSpeech.textContent = "No need to explain. No need to reply. I’ll sit here quietly until the room feels a little less loud.";
      return;
    }
    const actions = {
      hug: ["hug", "Tiny hug uploaded. Size: tiny. Impact: catastrophic. You can keep it as long as you need.", 5200],
      pinky: ["pinky", "No enormous promise. Just this one: you are allowed to rest, and we can figure the rest out as we go.", 6200],
      treat: ["treat", "IBACO_PROTOCOL: chocolate overload, double chocochip buttons, rainbow sprinkles, and hazelnut drizzle. Patch is extremely unqualified, but certain.", 6800],
      cheer: ["cheer", patchCheer[Math.floor(Math.random() * patchCheer.length)], 5200],
    };
    const [stateName, speech, duration] = actions[action];
    setPatchState(stateName, speech, duration);
    button.classList.add("active");
  }

  function petPatch() {
    if (!patchDen.open) return;
    setPatchState("pet", "Patch pretends this is undignified. Patch is lying. The ears have gone completely soft.", 3400);
  }

  const patchSceneLines = {
    origin: "Follow the guiding star. I’ll guard the edge of the screen.",
    constellation: "Eight stars. Eight memories. I checked—none of them are allowed to disappear.",
    promise: "Honest commits. Gentle debugging. That is a very good kind of love.",
    garden: "I think the flowers know her name.",
    letter: "I’ll sit quietly while she reads this one.",
    dream: "The future does not need to be perfect to be worth wanting.",
    forever: "No ending detected. Good. I was not ready to leave."
  };

  function patchGuideForScene(scene) {
    if (!patchSceneLines[scene] || patchSeenScenes.has(scene)) return;
    patchSeenScenes.add(scene);
    setTimeout(() => showPatchWhisper(patchSceneLines[scene]), reduceMotion ? 120 : 1700);
  }

  function schedulePatchIdle() {
    clearTimeout(patchIdleTimer);
    const wait = reduceMotion ? 60000 : 22000 + Math.random() * 18000;
    patchIdleTimer = setTimeout(() => {
      if (document.hidden || !patchCompanion.classList.contains("awake")) { schedulePatchIdle(); return; }
      if (patchDen.open && !patchBusy) {
        const idleStates = [
          ["blink", "Still here."],
          ["wave", "Patch status: present. Slightly sleepy. Fully on duty."],
          ["cheer", "I caught a piece of stardust. It looked like it belonged to you."],
        ];
        const [idleState, line] = idleStates[Math.floor(Math.random() * idleStates.length)];
        setPatchState(idleState, line, 2600);
      } else if (!patchDen.open && Math.random() < .3) {
        const whispers = [
          "Hydration check. Tiny sip. I’ll look away.",
          "No pressure to be extraordinary today.",
          "If you are tired, I can be the dramatic one for both of us.",
          "Patch is nearby. That is the entire announcement."
        ];
        showPatchWhisper(whispers[Math.floor(Math.random() * whispers.length)], 4800);
      }
      schedulePatchIdle();
    }, wait);
  }

  patchSummon.addEventListener("click", openPatch);
  patchCompanion.addEventListener("pointerenter", () => {
    if (patchGreetingShown || patchDen.open) return;
    patchGreetingShown = true;
    patchCompanion.dataset.patchState = "wave";
    showPatchWhisper("Oh, hi. I can sit here quietly—or you can visit my room.", 4300);
    setTimeout(() => { if (!patchDen.open) patchCompanion.dataset.patchState = "idle"; }, reduceMotion ? 800 : 2300);
  });
  document.querySelector(".patch-close").addEventListener("click", closePatch);
  document.querySelector("#patchPet").addEventListener("click", petPatch);
  document.querySelector("#patchModelMount").addEventListener("click", petPatch);
  patchActions.forEach(button => button.addEventListener("click", () => runPatchAction(button.dataset.patchAction, button)));
  patchDen.addEventListener("click", event => { if (event.target === patchDen) closePatch(); });
  patchDen.addEventListener("cancel", event => { event.preventDefault(); closePatch(); });
  patchDen.addEventListener("close", () => { patchSummon.setAttribute("aria-expanded", "false"); });
  guideDialog.addEventListener("close", () => setTimeout(wakePatch, reduceMotion ? 80 : 900));
  setTimeout(wakePatch, sessionStorage.getItem("luna-guide-seen") ? 3200 : 8800);

  const memories = {
    chocolate: { tag: "MEMORY_01 // FLAVOUR WAR", title: "Dark matter.", text: "Dark chocolate. Coffee. Double, triple, everything chocolate. Fruit flavours never stood a chance—and somehow even a tiny ice-cream debate became a memory worth keeping.", code: "preference.merge(['dark chocolate', 'coffee', 'ibaco']);" },
    bookworm: { tag: "MEMORY_02 // CARE LOOP", title: "My impossible bookworm.", text: "You study until the stars clock out. I learned that loving you sometimes means reminding the future doctor to eat, sleep, breathe, and be gentle with herself.", code: "if (luna.isTired) return rest + food + zero_guilt;" },
    darcy: { tag: "MEMORY_03 // CLASSICS", title: "The Darcy protocol.", text: "You said you would love to play Elizabeth Bennet. I offered to offend you like Fitzwilliam Darcy—and secretly saved the idea of one movie, one shared headphone, and us.", code: "pairing.approved('Elizabeth Bennet', 'her ridiculous Darcy');" },
    vampire: { tag: "MEMORY_04 // DARK MODE", title: "After midnight.", text: "Horror movies, vampire edits, gothic eyes, fairy energy. You made the dark feel less like an absence of light and more like a world waiting for us.", code: "nightMode = vampireEdits + horror + luna.glow;" },
    tinyhug: { tag: "MEMORY_05 // PACKET RECEIVED", title: "The tiniest hug.", text: "You called me an absolute menace and gave me the tiniest hug ever. Tiny in size. Catastrophic in effect. My entire system has been warm since.", code: "heart.receive(hug.size('tiny').impact('infinite'));" },
    sky: { tag: "MEMORY_06 // USER REQUEST", title: "Bring her the sky.", text: "You said you wanted to lie down and watch the sky. I remember thinking: then I will bring the view to wherever you are. This little universe is me keeping that thought.", code: "sky.moveTo(luna.currentLocation);" },
    loved: { tag: "MEMORY_07 // CORE MEMORY", title: "You felt loved.", text: "You said you had not felt like this in years. You wondered how nice it was to feel loved. I wanted that feeling to become ordinary for you—not rare, not borrowed, but home.", code: "assert.equal(luna.feelsLoved, true); // always" },
    future: { tag: "MEMORY_08 // LONG-TERM SUPPORT", title: "This life and the next.", text: "A faraway star became a direction. Not ownership. Not perfection. Just the stubborn hope that we can keep choosing each other, figuring things out as we go.", code: "for (const life of infinity) choose(luna);" },
  };
  const memoryKeys = Object.keys(memories); let memoryIndex = 0;
  const dialog = document.querySelector("#memoryDialog");
  function openMemory(key) {
    memoryIndex = memoryKeys.indexOf(key); const m = memories[key];
    document.querySelector("#memoryTag").textContent = m.tag; document.querySelector("#memoryTitle").textContent = m.title;
    document.querySelector("#memoryText").textContent = m.text; document.querySelector("#memoryCode").textContent = m.code;
    document.querySelector(`[data-memory="${key}"]`).classList.add("visited");
    const visited = document.querySelectorAll("[data-memory].visited").length;
    if (visited === memoryKeys.length) {
      const next = document.querySelector('#constellation [data-next="goddess"]');
      next.disabled = false; next.classList.add("unlocked");
    }
    direct("constellation", visited === memoryKeys.length
      ? ["02", "all eight remembered", "You found them. Follow the lightning when you are ready."]
      : ["02", `${visited} of ${memoryKeys.length} stars found`, "Keep touching the lights. I saved each one for a reason."]);
    if (!dialog.open) dialog.showModal();
    guideForScene("constellation");
  }
  document.querySelectorAll("[data-memory]").forEach(b => b.addEventListener("click", () => openMemory(b.dataset.memory)));
  function closeMemoryDialog() { dialog.close(); guideForScene("constellation"); }
  document.querySelector("#memoryDialog .dialog-close").addEventListener("click", closeMemoryDialog);
  document.querySelector(".dialog-next").addEventListener("click", () => openMemory(memoryKeys[(memoryIndex + 1) % memoryKeys.length]));
  dialog.addEventListener("click", e => { if (e.target === dialog) closeMemoryDialog(); });
  dialog.addEventListener("close", () => guideForScene("constellation"));

  document.querySelector("#bloomButton").addEventListener("click", e => {
    state.bloomTarget = 1; state.gardenOpen = true; state.gardenAge = 0; e.currentTarget.disabled = true;
    document.querySelector("#garden").classList.add("garden-open");
    document.querySelector("#oursGarden").setAttribute("aria-hidden", "false");
    document.querySelector("#bloomStatus").textContent = "one flower became a garden_ stay for the words";
    direct("garden", ["05", "the garden is speaking", "Stay with these words. The letter will open when the garden has finished blooming."]);
    setTimeout(() => document.querySelector(".garden-memory").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" }), reduceMotion ? 10 : 760);
    setTimeout(() => {
      const next = document.querySelector('#garden [data-next="letter"]');
      next.disabled = false; next.classList.add("unlocked");
      direct("garden", ["05", "the garden has finished blooming", "Follow the butterflies to the unsent letter."]);
      guideForScene("garden");
    }, reduceMotion ? 40 : 3600);
    chime(659, .4); setTimeout(() => chime(880, .55), 180);
  });
  document.querySelector("#handButton").addEventListener("click", () => {
    document.querySelector("#proposalStatus").textContent = "hand extended_  take all the time in this universe. I’m right here. ♥";
    document.querySelector("#afterQuestion").hidden = false; document.querySelector("#afterQuestion").disabled = false;
    direct("proposal", ["07", "take all the time you need", "When you are ready, keep going—the dream is waiting after this."]);
    guideForScene("proposal");
    chime(523, .35);
  });
  document.querySelector("#yesButton").addEventListener("click", () => {
    state.bloomTarget = 1; celebrate();
    document.querySelector("#proposalStatus").textContent = "merge approved ♥  this is a beginning, not an ending.";
    document.querySelector("#afterQuestion").hidden = false; document.querySelector("#afterQuestion").disabled = false;
    direct("proposal", ["07", "the beginning was accepted", "Now keep going. I want to show you what I mean by forever."]);
    guideForScene("proposal");
    [523,659,784,1047].forEach((n,i) => setTimeout(() => chime(n,.7), i * 150));
  });

  const dreamFragments = {
    morning: { tag: "DREAM_01 // SOFT MORNINGS", title: "Warm coffee. Tiny worries.", text: "A strawberry on the windowsill. Your coffee still warm. A ridiculous good-morning message. Not every day needs to be cinematic; some days should simply feel kind.", code: "morning = coffee.warm + worries.tiny + luna.smile;" },
    calling: { tag: "DREAM_02 // HER CALLING", title: "A doctor who still gets to rest.", text: "I want to watch you become everything you work for without letting the work erase you. I will admire the doctor, protect the human, and remind the bookworm that sleep is not a failed exam.", code: "support(luna.dreams); never replace(luna.choices);" },
    roads: { tag: "DREAM_03 // ROADS & CAMERAS", title: "See the world. Notice each other.", text: "Long roads, a camera, music, strange food, unplanned photographs—and finding little things in every city that make me think, ‘she would love this.’", code: "for (const place of world) collect(place, memoryOfYou);" },
    nights: { tag: "DREAM_04 // OUR NIGHTS", title: "One sky. One shared headphone.", text: "Pride and Prejudice at a food court. Horror when the world feels wrong. Vampire edits after midnight. A projector turning the ceiling into stars when going outside is too much.", code: "night.plan = [sharedHeadphone, horror, stars, safeSilence];" },
    ordinary: { tag: "DREAM_05 // ORDINARY MAGIC", title: "Ibaco runs are sacred infrastructure.", text: "KFC cravings, absurd chocolate overloads, learning to cook, checking whether the other reached home, fixing a bad day with food and presence. Love lives here too.", code: "home.install(['ibaco', 'kfc', 'did_you_eat']);" },
    field: { tag: "DREAM_06 // THE FARAWAY FIELD", title: "A quiet place to return to.", text: "A field far from noise. Flowers on the way back. An old bike repaired piece by piece. Room for her work, his building, both their solitude—and a sky large enough to meet beneath.", code: "home = spaceFor(you) + spaceFor(me) + placeToReturnTogether;" },
  };
  document.querySelectorAll("[data-dream]").forEach(button => button.addEventListener("click", () => {
    const d = dreamFragments[button.dataset.dream];
    button.classList.add("seen");
    document.querySelectorAll("[data-dream]").forEach(b => b.classList.toggle("active", b === button));
    document.querySelector("#dreamTag").textContent = d.tag; document.querySelector("#dreamFragmentTitle").textContent = d.title;
    document.querySelector("#dreamFragmentText").textContent = d.text; document.querySelector("#dreamFragmentCode").textContent = d.code;
    const touched = new Set([...document.querySelectorAll("[data-dream].seen")].map(b => b.dataset.dream));
    if (touched.size === 6) {
      const next = document.querySelector('#dream [data-next="forever"]');
      next.disabled = false; next.classList.add("unlocked");
    }
    direct("dream", ["08", `${touched.size} dream fragment${touched.size === 1 ? "" : "s"} open`, touched.size === 6 ? "You saw the whole horizon. Write the next commit." : "There are more pieces of the life after the question."]);
    guideForScene("dream");
    chime(440 + [...document.querySelectorAll("[data-dream]")].indexOf(button) * 55, .32);
  }));
  document.querySelector("#replayButton").addEventListener("click", () => { location.hash = "boot"; location.reload(); });

  let audioContext = null, audioNodes = [], audioOn = false;
  const soundButton = document.querySelector("#soundButton");
  function startAudio() {
    if (!audioOn) return;
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioNodes.length) return;
    const gain = audioContext.createGain(); gain.gain.value = .018; gain.connect(audioContext.destination);
    [110, 164.81, 220].forEach((freq, i) => { const o = audioContext.createOscillator(); o.type = i === 1 ? "triangle" : "sine"; o.frequency.value = freq; o.connect(gain); o.start(); audioNodes.push(o); });
  }
  function stopAudio() { audioNodes.forEach(n => n.stop()); audioNodes = []; }
  function chime(freq, duration) {
    if (!audioOn || !audioContext) return;
    const o = audioContext.createOscillator(), g = audioContext.createGain(); o.type = "sine"; o.frequency.value = freq;
    g.gain.setValueAtTime(.0001, audioContext.currentTime); g.gain.exponentialRampToValueAtTime(.08, audioContext.currentTime + .03); g.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + duration);
    o.connect(g).connect(audioContext.destination); o.start(); o.stop(audioContext.currentTime + duration + .05);
  }
  soundButton.addEventListener("click", () => {
    audioOn = !audioOn; soundButton.setAttribute("aria-pressed", String(audioOn)); soundButton.textContent = `sound: ${audioOn ? "on" : "off"}`;
    if (audioOn) startAudio(); else stopAudio();
  });

  addEventListener("resize", resize);
  addEventListener("pointermove", e => { state.mouseX = e.clientX / innerWidth - .5; state.mouseY = e.clientY / innerHeight - .5; }, { passive: true });
  resize(); startRendering();
})();
