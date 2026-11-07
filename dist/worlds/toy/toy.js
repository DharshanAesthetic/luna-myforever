import { PatchVirtualCompanion } from "./patch-virtual-companion.js";
import { ToyRoomScene } from "./toy-room-scene.js";

const stage = document.querySelector("#roomStage");
const loader = document.querySelector("#roomLoader");
const loadPercent = document.querySelector("#loadPercent");
const loadDetail = document.querySelector("#loadDetail");
const patchHome = document.querySelector("#patchHome");
const patchRig = document.querySelector("#patchRig");

let scene;
const patch = new PatchVirtualCompanion(patchRig, {
  onState: state => scene?.onPatchState(state),
  onReady: () => patchHome.classList.add("ready")
});

scene = new ToyRoomScene(stage, patch);

const imageTasks = [...stage.querySelectorAll("img")].map(image => {
  if (image.complete && image.naturalWidth) return image.decode?.().catch(() => {}) || Promise.resolve();
  return new Promise((resolve, reject) => {
    image.addEventListener("load", resolve, { once: true });
    image.addEventListener("error", reject, { once: true });
  });
});

const tasks = [
  ...imageTasks,
  patch.load()
];

let finished = 0;
loadPercent.textContent = "6%";
loadDetail.textContent = "opening the curtains...";

tasks.forEach((task, index) => {
  Promise.resolve(task).finally(() => {
    finished += 1;
    const progress = 6 + Math.round((finished / tasks.length) * 94);
    loadPercent.textContent = `${Math.min(100, progress)}%`;
    const phase = finished / tasks.length;
    loadDetail.textContent = phase < .35
      ? "placing the toy family..."
      : phase < .72
        ? "saving a little stardust..."
        : "waking Patch...";
  });
});

Promise.allSettled(tasks).then(() => {
  loadPercent.textContent = "100%";
  loadDetail.textContent = "the room is awake";
  setTimeout(() => loader.classList.add("complete"), 420);
  setTimeout(() => patch.play("idle"), 680);
});

addEventListener("pagehide", () => {
  patch.destroy();
  scene.destroy();
}, { once: true });

window.__PATCH_ROOM__ = { patch, scene };
