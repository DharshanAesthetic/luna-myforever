// Complete-body sprite frames keep Patch coherent like a lightweight desktop pet.
const ACTIONS = {
  idle:     { atlas:"primary", duration:4.8, loop:true,  heart:.12, frames:[0,1,2,3,2,1] },
  walk:     { atlas:"primary", duration:2.8, loop:false, heart:.08, frames:[0,14,15,14,0] },
  quiet:    { atlas:"primary", duration:5.2, loop:true,  heart:.12, frames:[0,12,13,12] },
  sleep:    { atlas:"primary", duration:6.4, loop:true,  heart:.08, frames:[12,13,13,12] },
  hug:      { atlas:"primary", duration:5.5, loop:false, heart:1,   frames:[0,4,5,6,7,7,6,5,4,0] },
  mischief: { atlas:"primary", duration:3.5, loop:false, heart:.2,  frames:[0,14,15,14,15,14,0] },
  cooking:  { atlas:"primary", duration:8,   loop:false, heart:.35, frames:[0,8,9,10,11,11,10,9,8,0] },
  flutter:  { atlas:"comfort", duration:3.8, loop:false, heart:.2,  frames:[12,13,14,15,14,13,12,0] },
  breathe:  { atlas:"comfort", duration:8,   loop:true,  heart:.55, frames:[8,9,10,11,10,9,8] },
  pet:      { atlas:"comfort", duration:3.2, loop:false, heart:.7,  frames:[4,5,6,7,6,5,4,0] },
  pinky:    { atlas:"comfort", duration:5.2, loop:false, heart:.85, frames:[0,1,2,3,3,2,1,0] }
};

const DIALOGUE = {
  idle:"I'm right here. Stare at the moon as long as you want.",
  walk:"Waddling over to make sure you have everything you need.",
  flutter:"Behold. My daemon wings are completely airborne.",
  quiet:"Quiet mode. You can stare at the moon. I'll make sure silence does not feel lonely.",
  sleep:"Resting our eyes together. Close them when you're ready.",
  hug:"Tiny hug. No questions, no fixing, no need to hug back. I can hold this minute for you.",
  mischief:"Breaking news: gravity has been reported to the authorities.",
  cooking:"IBACO_EMERGENCY.exe loaded: chocolate overload, double chocochips, rainbow sprinkles, and zero judgement.",
  breathe:"Breathe in slowly. There is nowhere else you need to be.",
  pet:"Oh. Head pats accepted. I am now at least twelve percent braver.",
  pinky:"Pinky promise: we do not have to solve every tomorrow tonight. We figure it out as we go."
};

export class PatchVirtualCompanion {
  constructor(rig,{onState=()=>{},onReady=()=>{}}={}) {
    if (!(rig instanceof HTMLElement)) throw new TypeError("Patch requires a rig element");
    this.rig=rig;
    this.sprites=[...rig.querySelectorAll(".patch-sprite-frame")];
    this.atlasSprites=Object.groupBy
      ? Object.groupBy(this.sprites,sprite=>sprite.dataset.spriteAtlas)
      : this.sprites.reduce((groups,sprite)=>((groups[sprite.dataset.spriteAtlas]??=[]).push(sprite),groups),{});
    if (!Object.values(this.atlasSprites).every(group=>group.length>=2)) throw new TypeError("Patch requires two layers per sprite atlas");
    Object.assign(this,{onState,onReady,state:"idle",startedAt:0,frame:-1,currentAtlas:"",playing:false,raf:0,queuedState:null,hold:false,visibleSprite:this.sprites[0],reduceMotion:matchMedia("(prefers-reduced-motion: reduce)").matches});
    this.boundRender=this.render.bind(this);
  }

  async load() {
    await Promise.all(this.sprites.map(sprite=>sprite.decode?.().catch(()=>{})));
    this.playing=true;
    this.startedAt=performance.now();
    this.onReady();
    this.raf=requestAnimationFrame(this.boundRender);
    this.play(this.queuedState||"idle",{instant:true});
    this.queuedState=null;
    return this;
  }

  play(name,options={}) {
    if (!ACTIONS[name]) return false;
    if (!this.playing) { this.queuedState=name; return true; }
    this.state=name;
    this.rig.dataset.action=name;
    this.rig.style.setProperty("--heart-power",ACTIONS[name].heart);
    this.startedAt=performance.now();
    this.frame=-1;
    this.hold=options.hold??["quiet","sleep","breathe"].includes(name);
    this.onState({name,dialogue:options.dialogue||DIALOGUE[name],duration:ACTIONS[name].duration,hold:this.hold});
    if (this.reduceMotion) {
      const stillIndex=Math.floor(ACTIONS[name].frames.length/2);
      this.applyFrame(ACTIONS[name].frames[stillIndex],stillIndex,.5,ACTIONS[name].atlas);
    } else if (options.instant) this.applyFrame(ACTIONS[name].frames[0],0,0,ACTIONS[name].atlas);
    return true;
  }

  release() { if (["quiet","sleep","breathe"].includes(this.state)) this.play("idle"); }

  render(timestamp) {
    if (!this.playing) return;
    if (this.reduceMotion) return;
    const action=ACTIONS[this.state]||ACTIONS.idle;
    const elapsed=Math.max(0,(timestamp-this.startedAt)/1000);
    const progress=action.loop?(elapsed%action.duration)/action.duration:Math.min(1,elapsed/action.duration);
    const index=Math.min(action.frames.length-1,Math.floor(progress*action.frames.length));
    const spriteFrame=action.frames[index];
    if (spriteFrame!==this.frame||action.atlas!==this.currentAtlas) this.applyFrame(spriteFrame,index,progress,action.atlas);
    if (!action.loop&&elapsed>=action.duration) this.play("idle");
    this.raf=requestAnimationFrame(this.boundRender);
  }

  applyFrame(spriteFrame,index,progress,atlas) {
    this.frame=spriteFrame;
    this.currentAtlas=atlas;
    const column=spriteFrame%4;
    const row=Math.floor(spriteFrame/4);
    const pool=this.atlasSprites[atlas];
    const incoming=pool.find(sprite=>sprite!==this.visibleSprite)??pool[0];
    const outgoing=this.visibleSprite;
    incoming.style.transform=`translate3d(${-column*25}%,${-row*25}%,0)`;
    incoming.classList.add("is-visible");
    outgoing?.classList.remove("is-visible");
    this.visibleSprite=incoming;
    this.rig.dataset.frame=index;
    this.rig.dataset.phase=progress<.22?"anticipation":progress>.82?"recovery":"action";
  }

  getDialogue(name=this.state) { return DIALOGUE[name]||DIALOGUE.idle; }
  destroy() { this.playing=false; cancelAnimationFrame(this.raf); }
}

export {ACTIONS as PATCH_ACTIONS,DIALOGUE as PATCH_DIALOGUE};
