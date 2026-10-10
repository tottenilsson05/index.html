
/* ===== EDIT THESE ===== */
const CONFIG = {
  X_URL:   "https://x.com/nostalgia_SF",    // your X / Twitter link
  DEX_URL: "https://dexscreener.com/solana/HWpb1ceb1AizK2H34kvYiYvmJpj5y2d1GJCyLWXFpump",  // your DEX Screener link
  CA: "HWpb1ceb1AizK2H34kvYiYvmJpj5y2d1GJCyLWXFpump"
};
/* ====================== */
const $=s=>document.querySelector(s);

const ART={
  x:`<svg viewBox="0 0 48 48"><rect x="3" y="3" width="42" height="42" rx="9" fill="#111"/><rect x="3" y="3" width="42" height="42" rx="9" fill="none" stroke="#fff" stroke-width="2"/><path transform="translate(12 12) scale(1)" fill="#fff" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  dex:`<img class="dexlogo" src="https://cdn.jsdelivr.net/gh/tottenilsson05/index.html@83264d9047eff7221b724d3662e5289cbad1b083/dex.png" alt="">`,
  chat:`<svg viewBox="0 0 48 48"><path d="M5 8h26a4 4 0 0 1 4 4v13a4 4 0 0 1-4 4H16l-7 6v-6H5a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4z" fill="#3fbf4f" stroke="#0e5a1a" stroke-width="2"/><path d="M19 20h22a4 4 0 0 1 4 4v11a4 4 0 0 1-4 4h-2v6l-7-6H19a4 4 0 0 1-4-4V24a4 4 0 0 1 4-4z" fill="#3b8cff" stroke="#0b2f80" stroke-width="2"/><circle cx="24" cy="30" r="2" fill="#fff"/><circle cx="30" cy="30" r="2" fill="#fff"/><circle cx="36" cy="30" r="2" fill="#fff"/></svg>`,
  video:`<svg viewBox="0 0 48 48"><rect x="4" y="9" width="40" height="30" rx="3" fill="#f2f2f2" stroke="#333" stroke-width="2"/><rect x="9" y="13" width="30" height="22" fill="#1f6ff0"/><path d="M21 18l9 6-9 6z" fill="#fff"/></svg>`,
  note:`<svg viewBox="0 0 48 48"><rect x="10" y="6" width="28" height="36" fill="#fff" stroke="#333" stroke-width="2"/><path d="M15 15h18M15 21h18M15 27h18M15 33h12" stroke="#7a9cd6" stroke-width="2"/></svg>`,
  pfp:`<svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="4" fill="#2f86ff" stroke="#fff" stroke-width="3"/><path d="M4 36q20-8 40 0v8H4z" fill="#3fae3a"/><circle cx="24" cy="26" r="11" fill="#f0a23c" stroke="#2a1a10" stroke-width="2"/><path d="M12 22q12-16 24 0z" fill="#f28aa6" stroke="#2a1a10" stroke-width="2"/></svg>`,
  warn:`<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#2f7cff" stroke="#0b2f80" stroke-width="2"/><rect x="14.2" y="13" width="3.6" height="11" rx="1" fill="#fff"/><circle cx="16" cy="9" r="2.2" fill="#fff"/></svg>`
};


/* ---------- PFP renderer (also used for the icon) ---------- */
const PFP={
  chars:{Shiba:"shiba",Cat:"cat",Frog:"frog",Hippo:"hippo"},
  hats:{None:"none","Pink beanie":"beanie","Party hat":"party",Crown:"crown",Cap:"cap"},
  eyes:{Normal:"normal",Happy:"happy",Shades:"shades","Laser eyes":"laser"},
  extras:{None:"none","Gold chain":"chain",Bowtie:"bow","Diamond":"diamond"},
  bgs:{"XP sky":"sky",Sunset:"sunset","Pump green":"green","Bonk orange":"orange",Night:"night"}
};
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function ell(c,x,y,rx,ry,fill,stroke,lw){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.lineWidth=lw||8;c.strokeStyle=stroke;c.stroke()}}
const OUT="#2a1a10";
function drawPFP(c,s){
  const S=512;c.save();c.clearRect(0,0,S,S);
  // background
  const g=c.createLinearGradient(0,0,0,S);
  const B={sky:["#2f86ff","#9fd0ff"],sunset:["#ff8a5c","#ffd28a"],green:["#0f9d58","#7ff0a8"],orange:["#ff7a1a","#ffc46b"],night:["#1b0d3a","#5a2d8c"]}[s.bg];
  g.addColorStop(0,B[0]);g.addColorStop(1,B[1]);c.fillStyle=g;c.fillRect(0,0,S,S);
  if(s.bg==="sky"){c.fillStyle="#3fae3a";c.beginPath();c.moveTo(0,420);c.quadraticCurveTo(256,360,512,430);c.lineTo(512,512);c.lineTo(0,512);c.fill()}
  if(s.bg==="night"){c.fillStyle="#fff";for(let i=0;i<30;i++){const x=(i*97)%512,y=(i*53)%300;c.fillRect(x,y,3,3)}}
  if(s.bg==="sunset"){ell(c,256,330,120,120,"rgba(255,240,180,.7)")}
  // character
  const P={shiba:{c:"#f0a23c",d:"#c97a1f",l:"#fff4e2"},cat:{c:"#f6c27a",d:"#d98b3a",l:"#fff7ee"},frog:{c:"#69c94a",d:"#3f8f2b",l:"#c9f2a8"},hippo:{c:"#9f8fb8",d:"#76668f",l:"#e7c7d6"}}[s.char];
  // body
  c.fillStyle=P.c;c.strokeStyle=OUT;c.lineWidth=8;c.beginPath();c.moveTo(96,512);c.quadraticCurveTo(110,400,256,392);c.quadraticCurveTo(402,400,416,512);c.closePath();c.fill();c.stroke();
  let eyes,headTop,eyeR=17;
  const hideEars=s.hat==="beanie"||s.hat==="cap";
  if(s.char==="shiba"){
    if(!hideEars)[[-1],[1]].forEach(([k])=>{c.beginPath();c.moveTo(256+k*70,190);c.lineTo(256+k*130,92);c.lineTo(256+k*150,230);c.closePath();c.fillStyle=P.c;c.fill();c.stroke();
      c.beginPath();c.moveTo(256+k*96,190);c.lineTo(256+k*128,128);c.lineTo(256+k*136,215);c.closePath();c.fillStyle=P.l;c.fill()});
    ell(c,256,280,150,135,P.c,OUT);
    c.fillStyle=P.l;c.beginPath();c.ellipse(256,330,110,78,0,0,Math.PI*2);c.fill();
    ell(c,256,300,26,18,"#1d120c");
    c.lineWidth=7;c.strokeStyle=OUT;c.beginPath();c.moveTo(256,318);c.lineTo(256,338);c.moveTo(220,340);c.quadraticCurveTo(256,370,292,340);c.stroke();
    c.fillStyle="#ff6f8a";c.beginPath();c.moveTo(240,352);c.quadraticCurveTo(256,395,272,352);c.fill();
    ell(c,180,300,18,10,"rgba(255,120,120,.35)");ell(c,332,300,18,10,"rgba(255,120,120,.35)");
    eyes=[[205,250],[307,250]];headTop=150;
  }else if(s.char==="cat"){
    if(!hideEars)[[-1],[1]].forEach(([k])=>{c.beginPath();c.moveTo(256+k*60,175);c.lineTo(256+k*120,80);c.lineTo(256+k*148,215);c.closePath();c.fillStyle=P.c;c.fill();c.stroke();
      c.beginPath();c.moveTo(256+k*88,178);c.lineTo(256+k*118,118);c.lineTo(256+k*132,200);c.closePath();c.fillStyle="#ffa3b5";c.fill()});
    ell(c,256,285,152,128,P.c,OUT);
    c.fillStyle=P.l;c.beginPath();c.ellipse(256,335,90,60,0,0,Math.PI*2);c.fill();
    c.fillStyle="#ff7f9b";c.beginPath();c.moveTo(242,305);c.lineTo(270,305);c.lineTo(256,320);c.closePath();c.fill();
    c.lineWidth=6;c.strokeStyle=OUT;c.beginPath();c.moveTo(256,320);c.quadraticCurveTo(240,345,224,330);c.moveTo(256,320);c.quadraticCurveTo(272,345,288,330);c.stroke();
    c.lineWidth=4;[[-1],[1]].forEach(([k])=>{c.beginPath();c.moveTo(256+k*70,315);c.lineTo(256+k*140,300);c.moveTo(256+k*70,330);c.lineTo(256+k*140,336);c.stroke()});
    eyes=[[200,262],[312,262]];headTop=160;
  }else if(s.char==="frog"){
    ell(c,256,300,165,118,P.c,OUT);
    ell(c,180,205,58,54,P.c,OUT);ell(c,332,205,58,54,P.c,OUT);
    c.fillStyle=P.l;c.beginPath();c.ellipse(256,345,120,52,0,0,Math.PI*2);c.fill();
    c.lineWidth=8;c.strokeStyle=OUT;c.beginPath();c.moveTo(150,315);c.quadraticCurveTo(256,375,362,315);c.stroke();
    ell(c,232,268,6,4,"#1d3a12");ell(c,280,268,6,4,"#1d3a12");
    ell(c,150,320,20,11,"rgba(255,120,140,.4)");ell(c,362,320,20,11,"rgba(255,120,140,.4)");
    eyes=[[180,205],[332,205]];headTop=150;eyeR=22;
  }else{
    [[-1],[1]].forEach(([k])=>{ell(c,256+k*95,170,26,22,P.c,OUT);ell(c,256+k*95,172,12,10,"#d99ab5")});
    ell(c,256,255,130,110,P.c,OUT);
    ell(c,256,345,150,85,P.l,OUT);
    ell(c,215,330,12,16,"#5a3b55");ell(c,297,330,12,16,"#5a3b55");
    c.lineWidth=7;c.strokeStyle=OUT;c.beginPath();c.moveTo(200,385);c.quadraticCurveTo(256,410,312,385);c.stroke();
    eyes=[[212,235],[300,235]];headTop=150;eyeR=15;
  }
  // eyes
  const [L,R]=eyes;
  if(s.eyes==="happy"){c.lineWidth=8;c.strokeStyle=OUT;c.lineCap="round";[L,R].forEach(([x,y])=>{c.beginPath();c.arc(x,y+6,eyeR,Math.PI*1.1,Math.PI*1.9);c.stroke()});c.lineCap="butt"}
  else if(s.eyes==="shades"){
    c.fillStyle="#111";const w=eyeR*3.4,h=eyeR*1.9;
    [L,R].forEach(([x,y])=>{c.fillRect(x-w/2,y-h/2,w,h)});c.fillRect(L[0],L[1]-h/2,R[0]-L[0],10);
    c.fillStyle="#fff";[L,R].forEach(([x,y])=>{c.fillRect(x-w/2+8,y-h/2+6,12,6);c.fillRect(x-w/2+22,y-h/2+6,6,6)});
  }else{
    [L,R].forEach(([x,y])=>{ell(c,x,y,eyeR,eyeR*1.15,"#1d120c");ell(c,x-eyeR*.35,y-eyeR*.4,eyeR*.35,eyeR*.35,"#fff")});
    if(s.eyes==="laser"){c.globalCompositeOperation="lighter";[L,R].forEach(([x,y],i)=>{const tx=i?560:-48,ty=y+90;
      c.strokeStyle="rgba(255,40,40,.55)";c.lineWidth=28;c.beginPath();c.moveTo(x,y);c.lineTo(tx,ty);c.stroke();
      c.strokeStyle="rgba(255,230,230,.95)";c.lineWidth=8;c.beginPath();c.moveTo(x,y);c.lineTo(tx,ty);c.stroke();ell(c,x,y,eyeR*1.3,eyeR*1.3,"rgba(255,60,60,.8)")});
      c.globalCompositeOperation="source-over"}
  }
  // extras
  if(s.extra==="chain"){c.lineWidth=12;c.strokeStyle="#f4c430";c.setLineDash([14,6]);c.beginPath();c.moveTo(150,420);c.quadraticCurveTo(256,500,362,420);c.stroke();c.setLineDash([]);
    ell(c,256,470,30,30,"#f4c430","#a87b00",6);c.fillStyle="#7a5600";c.font="bold 36px Tahoma,sans-serif";c.textAlign="center";c.textBaseline="middle";c.fillText("$",256,472)}
  if(s.extra==="bow"){c.fillStyle="#e2264d";c.strokeStyle=OUT;c.lineWidth=6;c.beginPath();c.moveTo(256,420);c.lineTo(200,392);c.lineTo(200,448);c.closePath();c.fill();c.stroke();c.beginPath();c.moveTo(256,420);c.lineTo(312,392);c.lineTo(312,448);c.closePath();c.fill();c.stroke();ell(c,256,420,14,14,"#b5103a",OUT,6)}
  if(s.extra==="diamond"){c.fillStyle="#7fe7ff";c.strokeStyle="#1a6f8a";c.lineWidth=6;c.beginPath();c.moveTo(380,440);c.lineTo(420,410);c.lineTo(460,440);c.lineTo(420,495);c.closePath();c.fill();c.stroke();c.beginPath();c.moveTo(380,440);c.lineTo(460,440);c.stroke()}
  // hats
  const hy=headTop;
  if(s.hat==="beanie"){
    c.fillStyle="#f28aa6";c.strokeStyle=OUT;c.lineWidth=8;c.beginPath();c.moveTo(130,hy+40);c.bezierCurveTo(130,hy-120,382,hy-120,382,hy+40);c.closePath();c.fill();c.stroke();
    c.strokeStyle="rgba(170,50,90,.45)";c.lineWidth=5;for(let x=160;x<=352;x+=24){c.beginPath();c.moveTo(x,hy+30);c.quadraticCurveTo(256+(x-256)*.6,hy-60,256+(x-256)*.4,hy-75);c.stroke()}
    rr(c,118,hy+18,276,46,20);c.fillStyle="#e0718f";c.fill();c.strokeStyle=OUT;c.lineWidth=8;c.stroke();
    c.strokeStyle="rgba(150,40,80,.5)";c.lineWidth=4;for(let x=134;x<390;x+=14){c.beginPath();c.moveTo(x,hy+24);c.lineTo(x,hy+58);c.stroke()}
  }else if(s.hat==="party"){
    c.save();c.beginPath();c.moveTo(196,hy+30);c.lineTo(256,hy-150);c.lineTo(316,hy+30);c.closePath();c.clip();
    ["#ff3b6b","#ffd23b","#3bb5ff"].forEach((col,i)=>{c.fillStyle=col;for(let y=-160+i*30;y<60;y+=90)c.fillRect(150,hy+y,220,30)});c.restore();
    c.strokeStyle=OUT;c.lineWidth=8;c.beginPath();c.moveTo(196,hy+30);c.lineTo(256,hy-150);c.lineTo(316,hy+30);c.stroke();ell(c,256,hy-155,20,20,"#fff",OUT,6);
  }else if(s.hat==="crown"){
    c.fillStyle="#f4c430";c.strokeStyle="#8a6300";c.lineWidth=8;c.beginPath();c.moveTo(160,hy+30);c.lineTo(160,hy-60);c.lineTo(208,hy-15);c.lineTo(256,hy-85);c.lineTo(304,hy-15);c.lineTo(352,hy-60);c.lineTo(352,hy+30);c.closePath();c.fill();c.stroke();
    ell(c,256,hy-5,14,14,"#e2264d");ell(c,200,hy+5,10,10,"#3bb5ff");ell(c,312,hy+5,10,10,"#3ee07a");
  }else if(s.hat==="cap"){
    c.fillStyle="#e2264d";c.strokeStyle=OUT;c.lineWidth=8;c.beginPath();c.moveTo(140,hy+40);c.bezierCurveTo(140,hy-90,372,hy-90,372,hy+40);c.closePath();c.fill();c.stroke();
    c.beginPath();c.moveTo(330,hy+30);c.quadraticCurveTo(440,hy+10,450,hy+45);c.lineTo(350,hy+50);c.closePath();c.fillStyle="#b5103a";c.fill();c.stroke();ell(c,256,hy-50,10,8,"#fff");
  }
  c.restore();
}
function pfpIcon(size){const cv=document.createElement("canvas");cv.width=cv.height=512;drawPFP(cv.getContext("2d"),{char:"shiba",hat:"beanie",eyes:"normal",extra:"none",bg:"sky"});
  const o=document.createElement("canvas");o.width=o.height=size;const c=o.getContext("2d");c.drawImage(cv,0,0,size,size);return o}

const TAPE=[["WIF","dog with a hat"],["BONK","og sol dog"],["POPCAT","pop"],["BOME","$1B in 3 days"],["SLERF","lp burned, still ran"],["MEW","cat in a dogs world"],["MOODENG","baby hippo"],["GOAT","the AI's coin"],["PNUT","justice for peanut"],["CHILLGUY","just chill"],["FWOG","small frog"],["GIGA","gigachad"],["SPX6900","flip the stock market"],["FARTCOIN","yes really"]]
  .map(([t,n])=>`<span><i>▲</i> $${t} <em>${n}</em></span>`).join("");
const STORY=`<h3>When We All Held.</h3>
<p>2024 was a different time in the trenches.</p>
<p>Back when memecoins were simple. No complicated tech, no AI agents, no promises of changing the world. Just a funny picture, a community, and thousands of people believing in the same thing.</p>
<p>We bought random animals, watched charts all night, raided tweets, made memes, and held through every dip because we genuinely believed our bags could become something.</p>
<p>Nobody cared about utility. Nobody needed a roadmap. Sometimes all it took was one meme and a group of people refusing to sell.</p>
<p>Some made life-changing money. Others lost everything. But somehow, we all wanted to be part of it.</p>
<p>It wasn't just about the money. It was about the feeling.</p>
<p>The late nights, the friendships, the runners, the endless hope that the next coin could change your life.</p>
<p>We didn't know it back then, but those were the days we'd look back on.</p>
<p class="end">When we all held.</p>`;

document.querySelectorAll("[data-art]").forEach(e=>e.innerHTML=ART[e.dataset.art]);
$("#tape").innerHTML=TAPE+TAPE;
const storyEl=$("#story");storyEl.innerHTML=STORY;

/* right panel: story or pfp maker */
const wStory=$("#wStory"),wPfp=$("#wPfp");let side="story";
function showSide(which){
  side=which;wStory.hidden=which!=="story";wPfp.hidden=which!=="pfp";
  if(which==="pfp")initPFP();
  renderTasks();syncHeight();
  if(innerWidth<=1060)(which==="pfp"?wPfp:wStory).scrollIntoView({behavior:"smooth",block:"start"});
}
$("#pfpClose").onclick=()=>showSide("story");

/* keep the right panel the same height as the video panel */
const wVideo=$("#wVideo");
function syncHeight(){document.documentElement.style.setProperty("--side-h",innerWidth>1060?wVideo.offsetHeight+"px":"auto")}
new ResizeObserver(syncHeight).observe(wVideo);addEventListener("resize",syncHeight);

/* PFP maker */
let pfpReady=false;const ps={char:"shiba",hat:"beanie",eyes:"normal",extra:"none",bg:"sky"};
function initPFP(){
  if(pfpReady)return;pfpReady=true;
  const cv=$("#pc"),cx=cv.getContext("2d"),box=$("#popts");
  const groups=[["Character","char",PFP.chars],["Hat","hat",PFP.hats],["Eyes","eyes",PFP.eyes],["Extra","extra",PFP.extras],["Background","bg",PFP.bgs]];
  function build(){box.innerHTML="";groups.forEach(([lab,key,opts])=>{const f=document.createElement("fieldset");f.className="opt";f.innerHTML=`<legend>${lab}</legend><div class="chips"></div>`;
    Object.entries(opts).forEach(([name,val])=>{const b=document.createElement("button");b.type="button";b.className="chip";b.textContent=name;b.setAttribute("aria-pressed",ps[key]===val);
      b.onclick=()=>{ps[key]=val;build();drawPFP(cx,ps)};f.querySelector(".chips").appendChild(b)});box.appendChild(f)})}
  build();drawPFP(cx,ps);
  $("#prand").onclick=()=>{groups.forEach(([,k,o])=>{const v=Object.values(o);ps[k]=v[Math.random()*v.length|0]});build();drawPFP(cx,ps)};
  $("#psave").onclick=()=>{cv.toBlob(b=>{const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download="nostalgia-pfp.png";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)})};
}

/* desktop icons */
const icons=$("#icons");
[["Twitter","x",CONFIG.X_URL],["PFP Maker","pfpimg",()=>showSide("pfp")],["DEX Screener","dex",CONFIG.DEX_URL]].forEach(([label,art,act])=>{
  const isLink=typeof act==="string";const el=document.createElement(isLink?"a":"button");el.className="ico";
  if(isLink){el.href=act;el.target="_blank";el.rel="noopener"}else{el.type="button";el.onclick=act}
  el.innerHTML=`<span class="g"></span><span class="l"></span>`;el.querySelector(".l").textContent=label;
  const g=el.querySelector(".g");if(art==="pfpimg"){const c=pfpIcon(128);c.style.borderRadius="12%";c.style.border="2px solid #fff";c.style.boxSizing="border-box";g.appendChild(c)}else g.innerHTML=ART[art];
  icons.appendChild(el);
});

/* taskbar */
const tasks=$("#tasks");
function renderTasks(){
  tasks.innerHTML="";
  [["nostalgia.mp4","video",()=>wVideo.scrollIntoView({behavior:"smooth",block:"center"}),true],
   ["when_we_all_held.txt","note",()=>showSide("story"),side==="story"],
   ["PFP Maker","pfp",()=>showSide("pfp"),side==="pfp"]].forEach(([t,art,fn,on])=>{
    const b=document.createElement("button");b.className="tbtn"+(on?" on":"");b.innerHTML=ART[art]+"<span></span>";b.querySelector("span").textContent=t;b.title=t;b.onclick=fn;tasks.appendChild(b)});
}
renderTasks();syncHeight();

/* ---------- intro, music, entrance ---------- */
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const vid=$("#vid"),vol=$("#vol"),intro=$("#intro");
const SPK_ON=`<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#1a1a6e"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="#1a1a6e" stroke-width="2" stroke-linecap="round"/></svg>`;
const SPK_OFF=`<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#1a1a6e"/><path d="M16 9l6 6M22 9l-6 6" stroke="#d8401c" stroke-width="2.2" stroke-linecap="round"/></svg>`;
function syncVol(){vol.innerHTML=vid.muted?SPK_OFF:SPK_ON;vol.setAttribute("aria-label",vid.muted?"Play music":"Mute music")}
vid.addEventListener("volumechange",syncVol);syncVol();
vol.onclick=()=>{vid.muted=!vid.muted;if(!vid.muted)vid.play().catch(()=>{})};
// keep the music going the whole visit
vid.addEventListener("pause",()=>{if(!vid.ended&&document.visibilityState==="visible"&&!vid.dataset.userPaused)setTimeout(()=>vid.play().catch(()=>{}),400)});
vid.addEventListener("click",()=>{vid.dataset.userPaused=vid.paused?"":"1"});
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&!vid.dataset.userPaused)vid.play().catch(()=>{})});

$("#uimg").appendChild(pfpIcon(144));
document.body.classList.add("booting");
const fullStory=STORY;
function typeStory(){
  if(reduce){storyEl.innerHTML=fullStory;return}
  const tmp=document.createElement("div");tmp.innerHTML=fullStory;const nodes=[...tmp.children];
  storyEl.innerHTML="";let i=0,j=0,cur=null,skip=false;
  storyEl.addEventListener("click",()=>skip=true,{once:true});
  const caret=document.createElement("span");caret.className="caret";
  (function step(){
    if(skip){storyEl.innerHTML=fullStory;return}
    if(i>=nodes.length){caret.remove();return}
    if(!cur){cur=document.createElement(nodes[i].tagName);cur.className=nodes[i].className;storyEl.appendChild(cur);j=0}
    const t=nodes[i].textContent;j=Math.min(t.length,j+3);cur.textContent=t.slice(0,j);cur.appendChild(caret);
    if(j>=t.length){i++;cur=null;setTimeout(step,140)}else setTimeout(step,16);
    const box=storyEl;if(box.scrollHeight>box.clientHeight)box.scrollTop=box.scrollHeight;
  })();
}
function balloon(){
  const b=document.createElement("div");b.className="balloon";b.setAttribute("role","status");
  b.innerHTML="<b>Welcome back to 2024</b>Nobody is selling today. Sound is on, use the speaker to mute.";
  document.body.appendChild(b);setTimeout(()=>b.classList.add("hide"),6000);setTimeout(()=>b.remove(),6600);
}
function enter(){
  if(document.body.classList.contains("enter"))return;
  vid.muted=false;vid.currentTime=0;vid.play().catch(()=>{vid.muted=true;vid.play().catch(()=>{})});
  intro.classList.add("gone");setTimeout(()=>intro.remove(),700);
  document.body.classList.remove("booting");document.body.classList.add("enter");
  setTimeout(syncHeight,50);setTimeout(typeStory,700);setTimeout(balloon,1400);
}
$("#enter").onclick=enter;
let booted=false;
function toWelcome(){if(booted)return;booted=true;const bt=$("#boot");bt.style.opacity=0;setTimeout(()=>{bt.remove();$("#welcome").classList.add("on");$("#enter").focus()},450)}
$("#boot").addEventListener("click",enter);
setTimeout(toWelcome,reduce?300:6500);

const clk=$("#clock");function tickClock(){clk.textContent=new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}
tickClock();setInterval(tickClock,10000);

/* contract address */
(function(){const el=document.getElementById("ca");if(!el)return;el.querySelector("code").textContent=CONFIG.CA;
  const b=el.querySelector("button");b.onclick=()=>{const done=()=>{b.textContent="Copied";setTimeout(()=>b.textContent="Copy",1400)};
    try{navigator.clipboard.writeText(CONFIG.CA).then(done,sel)}catch(_){sel()}
    function sel(){const r=document.createRange();r.selectNodeContents(el.querySelector("code"));const s=getSelection();s.removeAllRanges();s.addRange(r)}}})();
