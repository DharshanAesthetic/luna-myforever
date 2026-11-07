(() => {
  "use strict";
  const orbit = document.querySelector("#worldOrbit");
  const status = document.querySelector("#worldStatus");
  const positions = [[50,12],[86,44],[64,86],[15,63]];

  window.LUNA_WORLDS.forEach((world,index) => {
    const node = document.createElement(world.status === "open" ? "a" : "button");
    node.className = `world-node ${world.status}`;
    node.dataset.color = world.color;
    node.style.setProperty("--x", `${positions[index][0]}%`);
    node.style.setProperty("--y", `${positions[index][1]}%`);
    if (world.href) node.href = world.href;
    if (world.status !== "open") node.type = "button";
    node.innerHTML = `<span class="node-content"><span class="symbol" aria-hidden="true">${world.symbol}</span><b>${world.number} / ${world.name}</b><small>${world.status}</small></span>`;
    node.setAttribute("aria-label", `${world.name}: ${world.status}. ${world.note}`);
    node.addEventListener("mouseenter", () => show(world));
    node.addEventListener("focus", () => show(world));
    if (world.status !== "open") node.addEventListener("click", () => show(world));
    orbit.append(node);
  });

  function show(world) {
    status.querySelector("span").textContent = world.number;
    status.querySelector("b").textContent = world.status === "open" ? `${world.name} is awake.` : `${world.name} is still dreaming.`;
    status.querySelector("small").textContent = world.note;
  }

  const canvas = document.querySelector("#atlasSky");
  const ctx = canvas.getContext("2d");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stars = Array.from({length:150},(_,i)=>({x:(Math.sin(i*88.7)*9999)%1,y:(Math.sin(i*37.3+4)*9999)%1,a:.1+(i%9)/13,s:i%23===0?2:1})).map(s=>({...s,x:Math.abs(s.x),y:Math.abs(s.y)}));
  let width=0,height=0,time=0,last=performance.now();
  function resize(){width=innerWidth;height=innerHeight;const d=Math.min(devicePixelRatio||1,2);canvas.width=width*d;canvas.height=height*d;canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;ctx.setTransform(d,0,0,d,0,0)}
  function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(!reduceMotion)time+=dt;ctx.clearRect(0,0,width,height);ctx.font="11px monospace";stars.forEach((s,i)=>{ctx.globalAlpha=s.a*(.55+.45*Math.sin(time*.7+i));ctx.fillStyle=i%19===0?"#e890ac":i%29===0?"#80d4d2":"#b7aeb9";ctx.fillText(i%3===0?"*":i%3===1?".":"+",s.x*width,s.y*height)});ctx.globalAlpha=1;requestAnimationFrame(frame)}
  addEventListener("resize",resize,{passive:true});resize();requestAnimationFrame(frame);
})();
