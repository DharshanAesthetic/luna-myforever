# Luna, In Every Tomorrow — Living Project Goal

Last updated: 2026-11-07

## North star

Build a private-feeling, public-link interactive universe for Luna: romantic, dark,
celestial, playful, deeply personal, and unmistakably made by her programmer. It
must feel like a premium interactive film rather than a page sequence or an AI
template. The proposal is one meaningful moment inside a larger shared future,
not the ending or the entire premise.

The experience should communicate: I remember the small things; I see you as an
angel and a goddess; I want to keep building worlds with you; difficult days do
not have to be faced alone.

## Product structure

- The existing Luna universe remains the main narrative and visual shell.
- Worlds are discoverable chapters that can expand later without redesigning the
  navigation system.
- `WORLD_01` is Patch's Moonlit Toy Room, a lightweight virtual-pet companion
  experience for good days, quiet days, and mood-off days.
- Planned future worlds include music/voice, shared photographs, ice cream, and
  other memories. Do not implement them until requested; preserve room for them.
- Laptop is the primary presentation. Mobile remains readable and gently suggests
  using a laptop without making access complicated.

## Relationship and content anchors

- Luna is framed as an angel/goddess; the author can be framed playfully as Zeus.
- Preserve the programmer-romance voice: terminal language, commits, promises,
  stars, ASCII/code fragments, and small nerd jokes without letting gimmicks
  replace sincerity.
- Personal anchors already established: dark chocolate, coffee, Ibaco chocolate
  overload/double chocochips/rainbow sprinkles, purple flowers, plush toys, quiet
  company, the tomorrow pact, and remembering small details.
- Use “I love you” or equivalent multilingual fragments only as atmospheric text
  where repetition is visually useful. Do not overwhelm the meaningful prose.
- The “marry me” moment belongs inside the journey and must lead onward into a
  dream/future, not close the experience.

## Toy World outcome

Patch is a discoverable, independently animated guardian companion—not a static
mascot, generic chatbot, or decorative crop. The moonlit gothic room should feel
dimensional, warm, inhabited, and safe. Each object is an independent transparent
component with its own response; no rectangular source-image backgrounds.

Required comfort actions:

1. Tiny hug — forward contact, heart ignition, wing cocoon, soft recovery.
2. Ibaco — chef reveal and a physically weighted chocolate sundae lift.
3. Quiet — lowered energy, moonward attention, company without pressure.
4. Breathe — three paced inhale/exhale cycles.
5. Promise — the tomorrow pact with a magical orbit/thread.
6. Mischief — playful squash, lift, and recovery.
7. Rest — sleepy lean, breathing, and drifting sleep marks.
8. Head pat — responsive nuzzle and floating hearts.

Patch also performs restrained autonomous idle, walk, flutter, and mischief
actions. Autonomy must never interrupt a visitor-selected comfort action.

## Definitive visual and motion references

Use these as motion, pose, lighting, camera, material, and staging references.
Ignore their audio, lip/mouth movement, embedded titles, and backgrounds.

- `C:/Users/ADMIN/Downloads/gemini_generated_video_6f0893f6.mp4`
  - quiet idle, stardust orbit, heart ignition, wing-hug timing.
- `C:/Users/ADMIN/Downloads/my wife.mp4`
  - close-camera Ibaco/sundae lift and convincing physical weight.
- `C:/Users/ADMIN/Downloads/gemini_generated_video_f3c8efb4.mp4`
  - sleepy lean, constellation magic, forward flight, wing cocoon, chef reveal,
    golden orbit, and recovery.
- `C:/Users/ADMIN/Downloads/patch-companion/patch-companion/pets.zip`
  - reference only for sprite-atlas organization, anticipation/action/recovery,
    stable character invariants, and prop-specific motion rows. Do not copy its
    third-party art into the product.

Motion grammar: quiet idle → anticipation → primary action → secondary overlap →
contact/hold → soft recovery → living idle. Patch follows the ChatGPT-pet model:
stable full-body cells on a shared sprite canvas, small adjacent pose changes,
action-specific rows, soft frame blending, and a neutral return pose. Movement
must remain interruptible where appropriate, grounded at the feet, and limited
to compositor-friendly transforms/opacity. No split anatomy, pose snapping,
transform conflicts, layout-position animation, or camera/object drift. Respect
reduced-motion.

## Visual direction

- Moonlit gothic softness: near-black plum, wine rose, cyan moonlight, restrained
  gold, stardust, velvet, glass, worn wood, and premium plush materials.
- Preserve a universe scale; flowers are a meaningful chapter/accent, not the
  entire concept. A hero bloom can transition into “our garden.”
- Patch remains visually consistent across every action: black plush, pink heart
  details, daemon/bat wings, readable silhouette, gentle—not horror.
- Use depth through layered architecture, parallax, occlusion, light falloff,
  shadows, and camera framing. Do not fake depth with unrelated moving images.
- Guidance should feel like a guiding star/butterfly leading one unskippable
  moment at a time, not an instruction manual.

## Technical approach

- Static HTML/CSS/ES modules under `dist/`; no runtime backend required.
- Patch uses a generated transparent full-body sprite atlas with two composited
  frame layers for short crossfades, plus continuous whole-character secondary
  motion. The DOM adds only stardust, orbit, sleep, and room reactions; it never
  divides the character into independently moving body parts.
- Major cinematic beats may use coherent transparent keyframe art when it adds
  real quality, but character identity must remain stable and payload reasonable.
- Independent objects use transparent PNG/WebP assets and semantic buttons with
  accessible labels, keyboard focus, and at least 40×40 px hit areas.
- Keep a visible loader with truthful progress and failure-safe completion.
- Avoid `transition: all`; animate explicit transform, opacity, filter, and color
  properties. Decorative motion yields to input responsiveness.

## Delivery and persistence

- Local source of truth:
  `sites/luna-every-tomorrow`
- Public GitHub source and durable Pages host:
  `https://github.com/DharshanAesthetic/luna-myforever.git` (`main`)
- GitHub Pages URL:
  `https://dharshanaesthetic.github.io/luna-myforever/`
- Legacy private source mirror:
  `https://github.com/shanxn/Luna--mine.git` (`main`)
- Public Site for the currently connected owner account:
  `https://luna-in-every-tomorrow.plushcuckoo1.chatgpt.site/`
- Site project ID:
  `appgprj_6aef127fcca4819198694b07c4bfab25`
- Every material change must pass syntax/diff checks, receive a descriptive Git
  commit, push to GitHub, package from that exact SHA, and deploy as a new Sites
  version. Never claim a deployment from an unpushed or mismatched commit.
- Update this file whenever requirements, architecture, deployment identity, or
  verified completion state changes.

## Current verified state

- The 2026-11-08 whole-project alignment pass adds a short-laptop composition
  layer for 1366×768, keeps the myth, letter, proposal, and dream content clear
  of fixed chrome, makes the proposal fit its first viewport, removes the World
  Atlas portrait overflow, and replaces the wide bottom-right companion pill
  with a compact full-body Patch launcher. Patch stays discoverable without
  covering chapter copy; its speech bubble and label remain readable on demand.
- Local browser evidence now covers the full ten-chapter journey at 1366×768,
  1440×900, 1584×1230, and 390×844. Toy World still reports zero console/network
  errors, exact surface anchors at all four laptop breakpoints, nine working
  reactions, active spring physics, and a frozen reduced-motion frame.
- The v6.1 laptop composition pass repositions the fairylight globe out from
  behind the foreground flowers, separates the quiet chair from the foreground
  gift stack, enlarges Patch to the supplied reference composition, groups the
  plush family and carousel at upper-left, and confines the copy to a stable
  right-side message panel. Transparent Patch regions no longer intercept the
  carousel. Local evidence at 1366×768, 1440×900, 1536×864, and 1584×1230
  reports zero console errors and zero horizontal overflow; all nine object
  responses, spring physics, Chapter 10 links, and reduced-motion behavior pass.
- `docs/PATCH_MOTION_BLUEPRINT.md` records the reusable production geometry,
  24 fps video analysis, non-uniform pose timing, grounded-object rules, and
  acceptance loop. Patch holds expressive frames longer and uses whole-rig
  anticipation/recovery instead of dissolving between poses, preventing the
  doubled-plush ghosting found during the 2026-11-08 ECC review.
- The 2026-11-08 ECC production review compared all three supplied reference
  videos, the approved room still, every comfort action, and four laptop
  breakpoints. Idle Patch now uses the approved 900×900 master render, sits on
  the moon-to-panel composition axis, and transitions to coherent full-body
  action poses. Message copy is integrated into the architecture's own ornate
  panel instead of a second floating card.
- Nine high-cost Toy World PNGs were replaced with visually reviewed WebP
  equivalents. Browser transfer at 1366×768 fell from about 17.4 MB to 4.3 MB,
  root transfer fell from about 2.1 MB to 0.66 MB, and measured CLS remains
  effectively zero. Duplicate atlas elements now decode each source only once.
- Sites production version 7 is live at
  `https://luna-in-every-tomorrow.plushcuckoo1.chatgpt.site/` from exact source
  commit `55984482527ce14dd444454f743742aa5b575391`.
- Production screenshots at 1366×768, 1440×900, 1536×864, and 1584×1230
  verify that the plush family contacts the left table, carousel contacts the
  window sill, lamp contacts the right table without covering the copy, floor
  objects stay grounded, Patch stays on the rug, and flowers/gifts frame rather
  than hide the interactive scene.
- Production browser QA reports zero console errors, zero horizontal overflow,
  all nine room-object responses, active per-layer spring physics, zero axe
  WCAG A/AA violations, and both Chapter 10 navigation targets present.
- The public repository is populated at
  `https://github.com/DharshanAesthetic/luna-myforever`. GitHub Pages was enabled
  and the 2026-11-08 alignment/companion build is deployed successfully at
  `https://dharshanaesthetic.github.io/luna-myforever/` from public commit
  `9d5860f9d398a0962df0fb00ef81146c386195fd`. Public browser QA confirms the
  root, World Atlas, and Toy World have zero console/network errors and zero
  horizontal overflow at 390px and all requested laptop breakpoints. A final
  WCAG 2.2 A/AA scan reports zero violations, every visible interactive target
  is at least 24px, keyboard order reaches every Toy World object and comfort
  action, and reduced-motion freezes Patch on a coherent full-body frame.
- Clean transparent family/room props and articulated Patch rig are live.
- Cloud-browser read-only QA passed loading, all eight comfort actions, four room
  objects, three plush hotspots, message-board updates, transparency, clipping,
  overlap, and scrolling checks.
- GitHub repository and deployed manifest were independently verified.
- GitHub Pages is the authoritative public delivery URL after each public build
  is verified against the expected commit and browser evidence.
- Screenshot review of version 2 found excessive desktop dead space, a guide
  modal covering Patch, competing prop scale, downward camera drift, and a
  visibly split puppet. Version 3 replaces it with coherent full-body sprite
  frames, soft two-layer frame blends, whole-character secondary motion, a
  full-bleed desktop stage, rebalanced props, and corrected camera direction.
- Version 5 adds a second transparent full-body atlas dedicated to Promise,
  Head Pat, Breathe, and Flutter so those actions no longer borrow emotionally
  wrong poses. It also adds the reference-matched purple-flower/gift foreground,
  reduces action-camera drift, and keeps the breath orbit close to Patch.
- Fresh desktop evidence verifies all eight comfort actions as intact silhouettes.
  Desktop and mobile grounding evidence verifies that the plush family and
  carousel contact the left shelf, Patch contacts the rug, gifts contact the
  foreground floor, and the dessert lamp contacts the right table/window ledge.
- Automated browser QA reports zero console errors, zero horizontal overflow,
  zero WCAG A/AA axe violations, no sub-24px interactive targets, and a complete
  keyboard path through navigation, room objects, Patch, and comfort actions.
  Reduced-motion verification freezes Patch on a coherent action frame and
  disables whole-character CSS animation.
- The alignment model now uses intrinsic component aspect ratios and rendered
  surface anchors instead of tall percentage boxes. Plushes contact the left
  table, the carousel contacts the window sill, the lamp contacts the right
  table, and floor objects remain grounded at ultrawide, standard, tall-laptop,
  and portrait aspect ratios. Interactive props also use restrained spring
  damping, press weight, contact shadows, and depth-aware parallax.
- Toy World is a prominent Chapter 10 gateway at the end of the main journey,
  with direct entrances to Patch's room and the expandable World Atlas.

## Completion gates

The project is not complete until all are true:

- Desktop (1440), tablet (768), and mobile (375) visual evidence exists.
- No loader stall, missing asset, console-blocking error, overflow, clipped text,
  overlapping controls, or internal scrollbars.
- All actions show distinct anticipation, action, hold, and recovery with no snap.
- Patch, props, camera, shadows, and effects remain spatially aligned throughout.
- Keyboard order, focus visibility, labels, reduced-motion, and contrast receive a
  dedicated accessibility pass.
- The live deployment matches the final Git SHA and remains publicly accessible.
- A human review confirms the experience feels personal, cinematic, comforting,
  and worthy of the supplied references—not merely functional.

## Immediate next work

1. Preserve Toy World v6 as one physically coherent scene: intrinsic aspect
   ratios, surface anchors, lighting integration, correct occlusion, contact
   shadows, depth parallax, spring settling, press weight, and object reactions.
2. Treat 1366×768, 1440×900, 1536×864, and 1584×1230 as the primary laptop
   acceptance breakpoints. Keep portrait usable, but do not let it dictate the
   laptop composition.
3. Keep the message panel steadier than physical props, highly legible, and clear
   of the lamp at every laptop breakpoint. Preserve reduced-motion and low-end
   device gates for all non-essential scene physics.
4. Make Toy World a prominent Chapter 10 gateway after the main vow, with direct
   entrances to Patch's room and the World Atlas.
5. Publish the ECC visual/performance pass to `DharshanAesthetic/luna-myforever`,
   run the GitHub Pages workflow, and verify the public URL with screenshots,
   interactions, console/network checks, axe, keyboard focus, and reduced-motion.
6. Keep this goal active until the public Pages build is verified and the user
   accepts the visual and motion quality; then continue future worlds separately.

