const OBJECT_COPY = {
  blue: ["Blue Guardian", "First watch on difficult nights. Very serious scarf. Very soft security policy."],
  listener: ["Soft-Eared Listener", "Tell the whole story, half of it, or none at all."],
  doll: ["Sweet Slumber Doll", "Your little family is keeping watch. Rest is innocent here."],
  pink: ["Pink Mischief", "Sadness has been served a strongly worded squeak."],
  mint: ["Pocket Courage", "You may borrow every tiny bit of courage I have."],
  carousel: ["Moon Carousel", "One small song, circling until the room feels softer."],
  globe: ["Fairylight Globe", "These are the little lights we saved for a dark day."],
  lamp: ["Cherry Sundae Nightlight", "Warm mode enabled. The room can be gentle now."],
  cat: ["Night Cat & Quiet Chair", "The cat inspected today. Official verdict: you deserve somewhere soft to land."]
};

const REMINDERS = [
  "You don't have to be okay.",
  "You chose to stay.",
  "The tiniest hug still counts.",
  "A violet bouquet is blooming here.",
  "Rest is not something you earn.",
  "A difficult day is not a difficult you.",
  "You are loved in every universe.",
  "Tomorrow can wait outside this room.",
  "Nothing here needs an explanation.",
  "Soft things are still waiting for you."
];

const PHYSICS = Object.freeze({
  springX: .055,
  springY: .07,
  springRotation: .06,
  dampingX: .82,
  dampingY: .79,
  dampingRotation: .8,
  pointerX: 4,
  pointerY: 1.5,
  pointerRotation: .32
});

export class ToyRoomScene {
  constructor(root, patch) {
    this.root = root;
    this.patch = patch;
    this.speech = root.querySelector("#toySpeech");
    this.reminder = root.querySelector("#boardReminder");
    this.hint = root.querySelector("#roomHint").querySelector("p");
    this.patchHome = root.querySelector("#patchHome");
    this.rug = root.querySelector("#rugConstellation");
    this.cocoon = root.querySelector("#wingCocoon");
    this.orbit = root.querySelector("#breathOrbit");
    this.hearts = root.querySelector("#heartBubbles");
    this.fx = root.querySelector("#roomFx");
    this.ctx = this.fx.getContext("2d");
    this.reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.lowEnd = (navigator.hardwareConcurrency || 8) <= 4;
    this.roomTimers = new Set();
    this.breathTimer = 0;
    this.idleTimer = 0;
    this.typeToken = 0;
    this.reminderIndex = 0;
    this.stars = [];
    this.fxRaf = 0;
    this.physicsRaf = 0;
    this.physicsBodies = [];
    this.physicsAbort = null;
    this.runPhysics = null;
    this.lastPointer = { x: .5, y: .5 };
    this.init();
  }

  init() {
    this.resizeFx();
    this.seedStars();
    this.bindRoomObjects();
    this.bindPatchActions();
    this.bindParallax();
    this.bindPhysics();
    this.bindGuide();
    this.root.querySelector("#nextWhisper").addEventListener("click", () => this.nextReminder());
    addEventListener("resize", () => this.resizeFx(), { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clearTimeout(this.idleTimer);
      else {
        this.scheduleAutonomy();
        if (this.runPhysics && !this.physicsRaf) this.runPhysics();
      }
    });
    this.animateFx();
    this.scheduleAutonomy();
  }

  setTimer(callback, delay) {
    const timer = setTimeout(() => {
      this.roomTimers.delete(timer);
      callback();
    }, delay);
    this.roomTimers.add(timer);
    return timer;
  }

  bindRoomObjects() {
    this.root.querySelectorAll("[data-object]").forEach(button => {
      button.addEventListener("click", () => this.activateObject(button.dataset.object, button));
    });
    const globe = this.root.querySelector(".fairies");
    for (let index = 0; index < 18; index += 1) {
      const fairy = document.createElement("i");
      fairy.style.left = `${12 + Math.random() * 74}%`;
      fairy.style.top = `${12 + Math.random() * 72}%`;
      fairy.style.setProperty("--dx", `${-22 + Math.random() * 44}px`);
      fairy.style.setProperty("--dy", `${-20 + Math.random() * 40}px`);
      fairy.style.setProperty("--dur", `${2.8 + Math.random() * 2.8}s`);
      fairy.style.animationDelay = `${-Math.random() * 5}s`;
      globe.append(fairy);
    }
  }

  activateObject(id, button) {
    const [name, line] = OBJECT_COPY[id] || ["Patch's Room", "Everything here is allowed to be soft."];
    button.classList.remove("active");
    void button.offsetWidth;
    button.classList.add("active");
    this.setTimer(() => button.classList.remove("active"), 2200);
    this.rug.classList.add("active");
    this.setTimer(() => this.rug.classList.remove("active"), 3200);
    if (id === "lamp") this.root.classList.toggle("nightlight");
    if (id === "carousel") this.spawnNotes(button.querySelector(".music-notes"));
    if (id === "cat") {
      button.classList.add("purring");
      this.setTimer(() => button.classList.remove("purring"), 4200);
    }
    if (["blue", "listener", "doll", "pink", "mint"].includes(id)) {
      const action = id === "pink" ? "mischief" : id === "doll" ? "quiet" : "walk";
      if (action !== "quiet") this.patch.play(action, { dialogue: line });
    }
    this.setReminder(name);
    this.setSpeech(line);
    this.hint.textContent = line;
    this.scheduleAutonomy();
  }

  spawnNotes(host) {
    host.replaceChildren();
    ["♪", "♫", "✦", "♪", "☾"].forEach((glyph, index) => {
      const note = document.createElement("i");
      note.textContent = glyph;
      note.style.left = `${16 + index * 16}%`;
      note.style.setProperty("--drift", `${index % 2 ? 18 : -16}px`);
      note.style.animationDelay = `${index * .22}s`;
      host.append(note);
    });
  }

  bindPatchActions() {
    this.root.querySelectorAll("[data-patch-action]").forEach(button => {
      button.addEventListener("click", () => this.patch.play(button.dataset.patchAction));
    });
    const zone = this.root.querySelector("#petZone");
    let petting = false;
    let lastPet = 0;
    const pet = event => {
      if (event.type === "pointermove" && (!petting || performance.now() - lastPet < 220)) return;
      lastPet = performance.now();
      if (this.patch.state !== "pet") this.patch.play("pet");
      this.spawnHearts(event);
      if (navigator.vibrate) navigator.vibrate(16);
    };
    zone.addEventListener("click", event => {
      if (event.detail === 0) pet(event);
    });
    zone.addEventListener("pointerdown", event => { petting = true; zone.setPointerCapture?.(event.pointerId); pet(event); });
    zone.addEventListener("pointermove", pet);
    zone.addEventListener("pointerup", () => { petting = false; });
    zone.addEventListener("pointercancel", () => { petting = false; });
  }

  onPatchState({ name, dialogue, duration, hold }) {
    this.root.dataset.shot = name;
    this.patchHome.dataset.patchState = name;
    this.root.querySelectorAll("[data-patch-action]").forEach(button => button.classList.toggle("active", button.dataset.patchAction === name));
    this.setReminder(name === "idle" ? "You don't have to be okay." : this.actionTitle(name));
    this.setSpeech(dialogue);
    this.hint.textContent = dialogue;
    this.rug.classList.toggle("active", name !== "idle");
    this.cocoon.classList.toggle("active", name === "hug");
    if (name === "pet") this.spawnHearts();
    if (name === "breathe") this.startBreathing();
    else this.stopBreathing();
    if (!hold && name !== "idle") {
      this.setTimer(() => {
        this.rug.classList.remove("active");
        this.cocoon.classList.remove("active");
      }, duration * 1000);
    }
    if (name === "idle") this.scheduleAutonomy();
  }

  actionTitle(name) {
    return {
      hug: "A tiny hug, with no conditions.",
      cooking: "IBACO emergency protocol.",
      quiet: "Silence can have company.",
      breathe: "Just this breath. Nothing else.",
      pinky: "The tomorrow pact.",
      mischief: "An official gravity investigation.",
      sleep: "Rest is innocent.",
      pet: "Bravery increased by 12%.",
      walk: "Patch is checking on the room.",
      flutter: "Daemon flight certification."
    }[name] || "Patch is still here.";
  }

  startBreathing() {
    clearTimeout(this.breathTimer);
    this.orbit.hidden = false;
    const label = this.orbit.querySelector("b");
    const counter = this.orbit.querySelector("small");
    let phase = 0;
    const advance = () => {
      const cycle = Math.floor(phase / 2) + 1;
      const inhale = phase % 2 === 0;
      label.textContent = inhale ? "Breathe in" : "Let it go";
      counter.textContent = `${cycle} / 3`;
      this.setSpeech(inhale
        ? "Slowly in. There is nowhere else you need to be."
        : "And out. You are allowed to put this moment down.");
      phase += 1;
      if (phase >= 6) {
        this.breathTimer = setTimeout(() => {
          this.orbit.hidden = true;
          this.patch.play("idle", { dialogue: "Three breaths. Nothing had to be fixed. You still made a little room." });
        }, this.reduceMotion ? 700 : 4000);
        return;
      }
      this.breathTimer = setTimeout(advance, this.reduceMotion ? 900 : 4000);
    };
    advance();
  }

  stopBreathing() {
    clearTimeout(this.breathTimer);
    if (this.patch.state !== "breathe") this.orbit.hidden = true;
  }

  spawnHearts(event) {
    for (let index = 0; index < 5; index += 1) {
      const heart = document.createElement("i");
      heart.textContent = "♥";
      heart.style.setProperty("--x", `${25 + Math.random() * 50}%`);
      heart.style.setProperty("--drift", `${-24 + Math.random() * 48}px`);
      heart.style.animationDelay = `${index * .08}s`;
      this.hearts.append(heart);
      heart.addEventListener("animationend", () => heart.remove(), { once: true });
    }
  }

  bindParallax() {
    if (this.reduceMotion) return;
    this.root.addEventListener("pointermove", event => {
      const rect = this.root.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      this.lastPointer = { x, y };
      this.root.style.setProperty("--stage-x", (x - .5).toFixed(3));
      this.root.style.setProperty("--stage-y", (y - .5).toFixed(3));
    }, { passive: true });
    this.root.addEventListener("pointerleave", () => {
      this.root.style.setProperty("--stage-x", 0);
      this.root.style.setProperty("--stage-y", 0);
    });
  }

  bindPhysics() {
    if (this.reduceMotion || this.lowEnd) return;
    this.physicsAbort = new AbortController();
    const signal = this.physicsAbort.signal;
    this.physicsBodies = [...this.root.querySelectorAll(".room-object,.toy-family,.memory-board")].map((node, index) => ({
      node,
      depth: node.matches(".memory-board") ? .18 : node.matches(".toy-family") ? .42 : .55 + index * .09,
      x: 0, y: 0, r: 0,
      vx: 0, vy: 0, vr: 0,
      tx: 0, ty: 0, tr: 0
    }));

    const settle = body => {
      body.vx += (body.tx - body.x) * PHYSICS.springX;
      body.vy += (body.ty - body.y) * PHYSICS.springY;
      body.vr += (body.tr - body.r) * PHYSICS.springRotation;
      body.vx *= PHYSICS.dampingX;
      body.vy *= PHYSICS.dampingY;
      body.vr *= PHYSICS.dampingRotation;
      body.x += body.vx;
      body.y += body.vy;
      body.r += body.vr;
      body.node.style.setProperty("--physics-x", `${body.x.toFixed(2)}px`);
      body.node.style.setProperty("--physics-y", `${body.y.toFixed(2)}px`);
      body.node.style.setProperty("--physics-r", `${body.r.toFixed(3)}deg`);
    };

    this.runPhysics = () => {
      if (document.hidden) {
        this.physicsRaf = 0;
        return;
      }
      this.physicsBodies.forEach(settle);
      this.physicsRaf = requestAnimationFrame(this.runPhysics);
    };

    this.root.addEventListener("pointermove", event => {
      const rect = this.root.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - .5;
      const ny = (event.clientY - rect.top) / rect.height - .5;
      this.physicsBodies.forEach(body => {
        body.tx = nx * PHYSICS.pointerX * body.depth;
        body.ty = ny * PHYSICS.pointerY * body.depth;
        body.tr = nx * PHYSICS.pointerRotation * body.depth;
      });
    }, { passive: true, signal });

    this.root.addEventListener("pointerleave", () => {
      this.physicsBodies.forEach(body => Object.assign(body, { tx: 0, ty: 0, tr: 0 }));
    }, { signal });

    this.physicsBodies.filter(body => body.node.matches(".room-object")).forEach(body => {
      body.node.addEventListener("pointerdown", () => {
        body.node.dataset.pressed = "true";
        body.vy += 1.4;
      }, { signal });
      const release = () => {
        delete body.node.dataset.pressed;
        body.vy -= .75;
      };
      body.node.addEventListener("pointerup", release, { signal });
      body.node.addEventListener("pointercancel", release, { signal });
      body.node.addEventListener("click", () => {
        body.vy -= 1.8;
        body.vr += body.node.matches(".carousel,.sundae-lamp") ? .5 : -.35;
      }, { signal });
    });

    this.runPhysics();
  }

  nextReminder() {
    this.reminderIndex = (this.reminderIndex + 1) % REMINDERS.length;
    this.setReminder(REMINDERS[this.reminderIndex]);
    this.setSpeech([
      "No lesson attached. I just wanted you to remember.",
      "Not because of grand gestures. Because someone chose to stay.",
      "The room kept every purple flower from the bouquet.",
      "If you have no energy to answer, quiet company is still company.",
      "Patch checked the wording twice. It is still true.",
      "You can keep this one for later."
    ][this.reminderIndex % 6]);
  }

  setReminder(text) {
    this.reminder.animate?.(
      [{ opacity: .25, transform: "translateY(5px)" }, { opacity: 1, transform: "none" }],
      { duration: 500, easing: "ease-out" }
    );
    this.reminder.textContent = text;
  }

  setSpeech(text) {
    const token = ++this.typeToken;
    if (this.reduceMotion) {
      this.speech.textContent = text;
      return;
    }
    this.speech.textContent = "";
    let index = 0;
    const type = () => {
      if (token !== this.typeToken) return;
      this.speech.textContent = text.slice(0, index += 2);
      if (index < text.length) requestAnimationFrame(type);
    };
    type();
  }

  scheduleAutonomy() {
    clearTimeout(this.idleTimer);
    if (document.hidden) return;
    const delay = this.reduceMotion ? 42000 : 16000 + Math.random() * 13000;
    this.idleTimer = setTimeout(() => {
      if (this.patch.state === "idle") {
        const options = ["walk", "flutter", "mischief", "pet", "walk"];
        this.patch.play(options[Math.floor(Math.random() * options.length)]);
      }
      this.scheduleAutonomy();
    }, delay);
  }

  bindGuide() {
    const guide = document.querySelector("#roomGuide");
    const next = guide.querySelector("#guideNext");
    const close = guide.querySelector(".guide-close");
    const steps = [
      ["This is Patch.", "He is not a chatbot and he will never ask you to perform happiness. Touch his head, or simply let him sit with you."],
      ["Choose what feels lightest.", "The dock is not a checklist. A hug, a quiet moon, three breaths, nonsense—or nothing at all. Every choice is valid."],
      ["The room remembers softness.", "The toys, lamp, globe, carousel, rug and message board are alive too. Anything that glows can be visited."]
    ];
    let step = 0;
    const render = () => {
      guide.querySelector("#guideStep").textContent = `0${step + 1} / 03`;
      guide.querySelector("#guideTitle").textContent = steps[step][0];
      guide.querySelector("#guideCopy").textContent = steps[step][1];
      next.firstChild.textContent = step === 2 ? "enter the room " : "show me ";
    };
    const dismiss = () => {
      if (guide.open) guide.close();
      localStorage.setItem("patch-room-guide-v4", "seen");
    };
    next.addEventListener("click", () => {
      if (step === 2) dismiss();
      else { step += 1; render(); }
    });
    close.addEventListener("click", dismiss);
    guide.addEventListener("cancel", event => { event.preventDefault(); dismiss(); });
    if (!localStorage.getItem("patch-room-guide-v4")) setTimeout(() => guide.showModal(), 900);
  }

  resizeFx() {
    const rect = this.root.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    this.fx.width = Math.max(1, Math.round(rect.width * dpr));
    this.fx.height = Math.max(1, Math.round(rect.height * dpr));
    this.fx.style.width = `${rect.width}px`;
    this.fx.style.height = `${rect.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.fxWidth = rect.width;
    this.fxHeight = rect.height;
  }

  seedStars() {
    this.stars = Array.from({ length: 84 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: .4 + Math.random() * 1.3,
      speed: .15 + Math.random() * .35,
      phase: Math.random() * Math.PI * 2,
      cyan: Math.random() > .72
    }));
  }

  animateFx(timestamp = 0) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.fxWidth, this.fxHeight);
    const t = timestamp / 1000;
    this.stars.forEach(star => {
      const y = ((star.y + t * star.speed * .009) % 1) * this.fxHeight;
      const alpha = .18 + (Math.sin(t * (1 + star.speed) + star.phase) + 1) * .18;
      ctx.beginPath();
      ctx.fillStyle = star.cyan ? `rgba(114,214,223,${alpha})` : `rgba(255,221,188,${alpha})`;
      ctx.arc(star.x * this.fxWidth, y, star.r, 0, Math.PI * 2);
      ctx.fill();
    });
    this.fxRaf = requestAnimationFrame(time => this.animateFx(time));
  }

  destroy() {
    this.roomTimers.forEach(timer => clearTimeout(timer));
    clearTimeout(this.breathTimer);
    clearTimeout(this.idleTimer);
    cancelAnimationFrame(this.fxRaf);
    cancelAnimationFrame(this.physicsRaf);
    this.physicsAbort?.abort();
  }
}
