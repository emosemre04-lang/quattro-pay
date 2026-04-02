import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

(function(){
  const c="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no";
  const v=document.querySelector('meta[name="viewport"]');
  if(v)v.content=c;
  else{const m=document.createElement("meta");m.name="viewport";m.content=c;document.head.appendChild(m);}
})();

const GREEN="#4A7C59",GL="#E8F0EB",GD="#3A6347";
const BG="#FAF8F5",BGS="#F2F0EC",TX="#1A1A1A",TM="#666",TL="#999",BO="#E8E4DE";
const PP="'Poppins',sans-serif",FF="'DM Sans',sans-serif";

const SC=[
  {bg:"#EBF0FA",ic:"#3A6B9F",br:"#C8D8F0",gl:"rgba(58,107,159,.18)"},
  {bg:"#EBF0FA",ic:"#3A6B9F",br:"#C8D8F0",gl:"rgba(58,107,159,.18)"},
  {bg:"#FAF0EB",ic:"#9F6B3A",br:"#F0D8C8",gl:"rgba(159,107,58,.18)"},
  {bg:"#EBFAF0",ic:"#3A9F6B",br:"#C8F0D8",gl:"rgba(58,159,107,.18)"},
  {bg:"#F5EBFA",ic:"#7A3A9F",br:"#DEC8F0",gl:"rgba(122,58,159,.18)"},
  {bg:GL,ic:GD,br:"#C8E0D0",gl:"rgba(74,124,89,.18)"},
];

function isDark(){return window.matchMedia&&window.matchMedia("(prefers-color-scheme:dark)").matches;}
function useDark(){
  const[d,setD]=useState(isDark());
  useEffect(()=>{const mq=window.matchMedia("(prefers-color-scheme:dark)");const h=e=>setD(e.matches);mq.addEventListener("change",h);return()=>mq.removeEventListener("change",h);},[]);
  return d;
}

function bizDate(n){const r=new Date();let a=0;while(a<n){r.setDate(r.getDate()+1);if(r.getDay()!==0&&r.getDay()!==6)a++;}return r;}
function fmtD(d){return d.toLocaleDateString("fr-FR",{day:"numeric",month:"long"});}
function getDelivery(){return`${fmtD(bizDate(3))} – ${fmtD(bizDate(5))}`;}
function getReserve(){const d=new Date();d.setDate(d.getDate()+2);return d.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});}
function getGreeting(){const h=new Date().getHours();return h<12?"Bonjour":h<18?"Bon après-midi":"Bonsoir";}
function getVisitors(){
  const h=new Date().getHours();
  const base=h>=19?18:h>=14?14:h>=10?10:h>=7?6:3;
  const seed=Math.floor(Date.now()/3600000);
  return Math.min(22,Math.max(5,base+((seed*1664525+1013904223)&0x7fffffff)%8-3));
}

function useScrollPct(){
  const[p,setP]=useState(0);
  useEffect(()=>{
    const h=()=>{const t=document.documentElement.scrollHeight-window.innerHeight;setP(t>0?Math.min(100,Math.round(window.scrollY/t*100)):0);};
    window.addEventListener("scroll",h,{passive:true});return()=>window.removeEventListener("scroll",h);
  },[]);return p;
}

function useVis(ref){
  const[ratio,setRatio]=useState(0),[entered,setEntered]=useState(false),[just,setJust]=useState(false),prev=useRef(0);
  useEffect(()=>{
    const el=ref.current;if(!el)return;
    const fire=()=>{setJust(true);setTimeout(()=>setJust(false),900);};
    const obs=new IntersectionObserver(([e])=>{
      const r=e.intersectionRatio;
      if(r>.15&&!entered){setEntered(true);fire();}
      if(r>.4&&prev.current<=.4)fire();
      prev.current=r;setRatio(r);
    },{threshold:[0,.1,.15,.2,.3,.4,.5,.6,.7,.8,.9,1]});
    obs.observe(el);return()=>obs.disconnect();
  },[ref,entered]);
  return{ratio,entered,just};
}

function useActiveStep(){
  const[a,setA]=useState(0);
  useEffect(()=>{
    const ids=["s1","s2","s3","s4","s5","s6"];
    const h=()=>{let f=0;ids.forEach((id,i)=>{const el=document.getElementById(id);if(el&&el.getBoundingClientRect().top<window.innerHeight*.6)f=i+1;});setA(f);};
    window.addEventListener("scroll",h,{passive:true});return()=>window.removeEventListener("scroll",h);
  },[]);return a;
}

function playDing(){
  try{
    const ctx=new(window.AudioContext||window.webkitAudioContext)();
    [523,659,784].forEach((f,i)=>{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.connect(g);g.connect(ctx.destination);o.frequency.value=f;o.type="sine";
      const t=ctx.currentTime+i*.1;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.15,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+.35);
      o.start(t);o.stop(t+.35);
    });
  }catch(e){}
}

function playSuccess(){
  try{
    const ctx=new(window.AudioContext||window.webkitAudioContext)();
    [523,659,784,1047].forEach((f,i)=>{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.connect(g);g.connect(ctx.destination);o.frequency.value=f;o.type="sine";
      const t=ctx.currentTime+i*.15;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.2,t+.03);g.gain.exponentialRampToValueAtTime(.001,t+.5);
      o.start(t);o.stop(t+.5);
    });
  }catch(e){}
}

function IBank(){return<svg width="22"height="22"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="1.8"strokeLinecap="round"strokeLinejoin="round"><rect x="2"y="8"width="20"height="13"rx="2"/><path d="M2 10l10-7 10 7"/><line x1="6"y1="12"x2="6"y2="17"/><line x1="10"y1="12"x2="10"y2="17"/><line x1="14"y1="12"x2="14"y2="17"/><line x1="18"y1="12"x2="18"y2="17"/></svg>;}
function IIban(){return<svg width="22"height="22"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="1.8"strokeLinecap="round"strokeLinejoin="round"><rect x="2"y="5"width="20"height="14"rx="2"/><line x1="2"y1="10"x2="22"y2="10"/><line x1="6"y1="15"x2="10"y2="15"/><line x1="13"y1="15"x2="16"y2="15"/></svg>;}
function IUser(){return<svg width="22"height="22"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="1.8"strokeLinecap="round"strokeLinejoin="round"><circle cx="12"cy="8"r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;}
function IEuro(){return<svg width="22"height="22"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="1.8"strokeLinecap="round"strokeLinejoin="round"><path d="M17 6.5A7 7 0 1 0 17 17.5"/><line x1="5"y1="11"x2="14"y2="11"/><line x1="5"y1="14"x2="14"y2="14"/></svg>;}
function IPen(){return<svg width="22"height="22"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="1.8"strokeLinecap="round"strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;}
function ICheck({s}){return<svg width={s||22}height={s||22}viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2.5"strokeLinecap="round"strokeLinejoin="round"style={{strokeDasharray:30,strokeDashoffset:0,animation:"checkDraw .4s ease"}}><polyline points="20 6 9 17 4 12"/></svg>;}
function IWa({s}){return<svg width={s||18}height={s||18}viewBox="0 0 24 24"fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.118 1.523 5.854L0 24l6.324-1.501A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.886 0-3.65-.493-5.177-1.355l-.371-.22-3.754.891.924-3.638-.242-.381A9.946 9.946 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>;}

function TypewriterIntro({name,onDone}){
  const g=getGreeting();
  const lines=[`${g} ${name}.`,"Plus qu'une étape avant de recevoir ta commande.","Le virement bancaire, c'est simple.","On t'explique tout en 6 étapes.","2 minutes, c'est tout."];
  const[li,setLi]=useState(0),[ci,setCi]=useState(0),[done2,setDone2]=useState([]),[done,setDone]=useState(false);
  const ac=useRef(null);
  const pk=useCallback(()=>{
    try{
      if(!ac.current)ac.current=new(window.AudioContext||window.webkitAudioContext)();
      const ctx=ac.current,o=ctx.createOscillator(),g2=ctx.createGain();
      o.connect(g2);g2.connect(ctx.destination);o.frequency.value=180+Math.random()*80;o.type="square";
      g2.gain.setValueAtTime(.03,ctx.currentTime);g2.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.05);
      o.start(ctx.currentTime);o.stop(ctx.currentTime+.05);
    }catch(e){}
  },[]);
  useEffect(()=>{
    if(done)return;
    const cur=lines[li];
    if(ci<cur.length){const t=setTimeout(()=>{pk();setCi(c=>c+1);},42+Math.random()*18);return()=>clearTimeout(t);}
    else{
      const pause=li===lines.length-1?900:450;
      const t=setTimeout(()=>{
        if(li<lines.length-1){setDone2(d=>[...d,cur]);setLi(i=>i+1);setCi(0);}
        else{setDone(true);setTimeout(onDone,500);}
      },pause);return()=>clearTimeout(t);
    }
  },[li,ci,done]);
  const cur=lines[li];
  return(
    <div style={{position:"fixed",inset:0,background:"#080808",zIndex:1000,display:"flex",flexDirection:"column",alignItems:"flex-start",justifyContent:"center",padding:"0 32px"}}>
      <div style={{maxWidth:"420px",width:"100%"}}>
        <div style={{fontSize:"10px",fontWeight:800,letterSpacing:"5px",color:GREEN,marginBottom:"52px",fontFamily:PP}}>QUATTRO</div>
        {done2.map((line,i)=>(
          <div key={i} style={{fontSize:i===0?"24px":"17px",fontWeight:i===0?700:500,color:"rgba(255,255,255,0.3)",marginBottom:"16px",fontFamily:PP,lineHeight:"1.4",animation:"fadeIn .3s ease"}}>{line}</div>
        ))}
        <div style={{fontSize:li===0?"24px":"17px",fontWeight:li===0?700:500,color:"#fff",marginBottom:"16px",fontFamily:PP,lineHeight:"1.4",minHeight:"26px"}}>
          {cur.slice(0,ci)}{!done&&<span style={{color:GREEN,animation:"blink .65s infinite"}}>|</span>}
        </div>
        <div style={{display:"flex",gap:"5px",marginTop:"36px"}}>
          {lines.map((_,i)=><div key={i} style={{width:i<=li?"18px":"4px",height:"3px",borderRadius:"2px",background:i<=li?GREEN:"rgba(255,255,255,0.12)",transition:"width .4s cubic-bezier(.34,1.56,.64,1)"}}/>)}
        </div>
      </div>
      <button onClick={onDone} className="bp" style={{position:"absolute",bottom:"36px",right:"28px",background:"transparent",border:"1px solid rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.3)",borderRadius:"20px",padding:"7px 18px",fontSize:"11px",cursor:"pointer",fontFamily:FF}}>Passer →</button>
    </div>
  );
}

function CopyParticles({show,color}){
  if(!show)return null;
  return(
    <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"visible",zIndex:20}}>
      {Array.from({length:10}).map((_,i)=>{
        const angle=(i/10)*360;
        return<div key={i} style={{position:"absolute",left:"50%",top:"50%",width:"7px",height:"7px",borderRadius:"50%",background:color||GREEN,["--tx"]:Math.cos(angle*Math.PI/180)*55+"px",["--ty"]:Math.sin(angle*Math.PI/180)*45+"px",animation:"particlePop .55s ease-out forwards",animationDelay:`${i*18}ms`}}/>;
      })}
    </div>
  );
}

function VerifiedBadge({show}){
  if(!show)return null;
  return(
    <div style={{display:"inline-flex",alignItems:"center",gap:"4px",padding:"4px 10px",background:"#E8F5EC",borderRadius:"20px",border:`1px solid ${GREEN}40`,animation:"badgePop .4s cubic-bezier(.34,1.56,.64,1)",flexShrink:0}}>
      <span style={{fontSize:"11px"}}>🛡️</span>
      <span style={{fontSize:"10px",fontWeight:700,color:GD,fontFamily:FF}}>Vérifiée</span>
    </div>
  );
}

function CopyBtn({text,label,onCopied,large,col}){
  const[copied,setCopied]=useState(false),[glow,setGlow]=useState(false),[parts,setParts]=useState(false),[sc,setSc]=useState(null);
  const chars="ABCDEFabcdef0123456789@#$";
  const go=async()=>{
    try{await navigator.clipboard.writeText(text);}catch{const t=document.createElement("textarea");t.value=text;document.body.appendChild(t);t.select();document.execCommand("copy");document.body.removeChild(t);}
    playDing();
    let c=0;const orig=label||"Copier";
    const iv=setInterval(()=>{setSc(orig.split("").map(()=>chars[Math.floor(Math.random()*chars.length)]).join("").slice(0,orig.length));if(++c>7){clearInterval(iv);setSc(null);}},40);
    setCopied(true);setGlow(true);setParts(true);
    setTimeout(()=>setCopied(false),2500);setTimeout(()=>setGlow(false),1000);setTimeout(()=>setParts(false),650);
    if(onCopied)setTimeout(onCopied,300);
  };
  const c2=col||GREEN;
  return(
    <div style={{position:"relative",flexShrink:0}}>
      <CopyParticles show={parts} color={c2}/>
      <button onClick={go} className="bp" style={{background:copied?c2:"transparent",color:copied?"#fff":c2,border:`1.5px solid ${c2}`,borderRadius:large?"14px":"10px",padding:large?"13px 28px":"8px 16px",fontSize:large?"14px":"11.5px",fontWeight:700,cursor:"pointer",letterSpacing:".3px",whiteSpace:"nowrap",boxShadow:glow?`0 0 20px 4px ${c2}44`:"none",transition:"background .2s,color .2s,box-shadow .4s",fontFamily:FF}}>
        {copied?"✓ Copié":(sc||label||"Copier")}
      </button>
    </div>
  );
}

function SlotAmt({amount,dark}){
  const[d,setD]=useState("---"),[done,setDone]=useState(false),ref=useRef(null),ran=useRef(false);
  useEffect(()=>{
    const el=ref.current;if(!el)return;
    const o=new IntersectionObserver(([e])=>{
      if(e.isIntersecting&&!ran.current){ran.current=true;let c=0;
        const iv=setInterval(()=>{setD(String(amount).split("").map(()=>String(Math.floor(Math.random()*10))).join(""));if(++c>14){clearInterval(iv);setD(String(amount));setDone(true);}},55);}
    });o.observe(el);return()=>o.disconnect();
  },[amount]);
  return<span ref={ref} style={{fontVariantNumeric:"tabular-nums",color:done?(dark?"#f0f0f0":TX):GREEN,transition:"color .3s"}}>{d}</span>;
}

function CopyRow({label,sublabel,value,copyValue,large,onCopied,isSlot,amount,dark,col}){
  const[badge,setBadge]=useState(false),[pulse,setPulse]=useState(false);
  const handle=()=>{setBadge(true);setPulse(true);setTimeout(()=>setBadge(false),3000);setTimeout(()=>setPulse(false),600);if(onCopied)onCopied();};
  return(
    <div>
      <div style={{background:dark?"#1e1e1e":(large?"#F0FAF4":BGS),borderRadius:large?"16px":"12px",padding:large?"18px 16px":"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"10px",animation:pulse?"cardPulse .6s ease":"none",border:large?`2px solid ${GREEN}25`:"none"}}>
        <div style={{minWidth:0}}>
          {label&&<div style={{fontSize:"10px",color:TL,fontWeight:600,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:"4px"}}>{label}</div>}
          <div style={{fontSize:large?"30px":"16px",fontWeight:large?800:600,color:dark?"#f0f0f0":TX,fontFamily:large?PP:FF,letterSpacing:large?"-1px":"0"}}>
            {isSlot?<><SlotAmt amount={amount} dark={dark}/>€</>:value}
          </div>
          {sublabel&&<div style={{fontSize:"11px",color:TL,marginTop:"3px",lineHeight:"1.4"}}>{sublabel}</div>}
        </div>
        <CopyBtn text={copyValue||value} label="Copier" onCopied={handle} large={large} col={col}/>
      </div>
      {badge&&(
        <div style={{marginTop:"8px",display:"flex",alignItems:"center",gap:"8px"}}>
          <div style={{padding:"7px 12px",background:"#E8F5EC",borderRadius:"10px",border:`1px solid ${GREEN}25`,display:"flex",alignItems:"center",gap:"6px",animation:"fadeR .3s ease",flex:1}}>
            <span style={{fontSize:"12px"}}>✅</span>
            <span style={{fontSize:"11px",color:GD,fontWeight:600,fontFamily:FF}}>{label?`${label} enregistré`:"Copié"} — étape suivante ↓</span>
          </div>
          <VerifiedBadge show={true}/>
        </div>
      )}
    </div>
  );
}

function AltNames({names,dark}){
  return(
    <div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:"10px"}}>
      {names.map(n=><span key={n} style={{padding:"4px 10px",borderRadius:"8px",background:dark?"#242424":BGS,border:`1px solid ${dark?"#2e2e2e":BO}`,fontSize:"11px",color:dark?"#aaa":TM,fontFamily:FF}}>{n}</span>)}
    </div>
  );
}

function Tip({text,icon,dark}){
  return(
    <div style={{display:"flex",alignItems:"flex-start",gap:"8px",padding:"10px 12px",background:dark?"#1a1600":"#FFFBF0",borderRadius:"10px",marginTop:"10px",border:`1px solid ${dark?"#3a3000":"#F0E6C8"}`}}>
      <span style={{fontSize:"13px",flexShrink:0}}>{icon||"💡"}</span>
      <span style={{fontSize:"11px",color:"#8B7230",lineHeight:"1.5",fontFamily:FF}}>{text}</span>
    </div>
  );
}

function GlitchLabel({n,active}){
  const[g,setG]=useState(false),ran=useRef(false);
  useEffect(()=>{if(active&&!ran.current){ran.current=true;setG(true);setTimeout(()=>setG(false),500);}},[active]);
  const txt=`Étape ${n}`;
  return(
    <span style={{fontSize:"10px",fontWeight:600,color:GREEN,letterSpacing:"1.5px",textTransform:"uppercase",fontFamily:FF,position:"relative",display:"inline-block"}}>
      {txt}
      {g&&<><span style={{position:"absolute",inset:0,color:"#7EC8A0",animation:"gc1 .25s steps(1) 2",pointerEvents:"none"}}>{txt}</span><span style={{position:"absolute",inset:0,color:"#E24B4A",animation:"gc2 .25s steps(1) 2",pointerEvents:"none"}}>{txt}</span></>}
    </span>
  );
}

function StepArrow({done}){
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",height:"38px",zIndex:2,position:"relative"}}>
      <div style={{width:"2px",height:"14px",background:`linear-gradient(180deg,${done?GREEN:BO},${done?GREEN+"66":BO+"44"})`,borderRadius:"2px",transition:"background .5s"}}/>
      <div style={{fontSize:"16px",color:done?GREEN:TL,animation:done?"arrowSuccess .5s cubic-bezier(.34,1.56,.64,1)":"arrowPulse 1.8s ease-in-out infinite",transition:"color .4s",lineHeight:1,marginTop:"2px"}}>↓</div>
    </div>
  );
}

function StepCard({n,icon,title,desc,children,highlight,id,isActive,isCopied,dark,sc}){
  const ref=useRef(null);
  const{ratio,entered,just}=useVis(ref);
  const[aura,setAura]=useState(false),[scan,setScan]=useState(false),[ripple,setRipple]=useState(false);
  const ran=useRef(false);
  useEffect(()=>{
    if(just&&!ran.current){ran.current=true;setAura(true);setScan(true);setRipple(true);
      setTimeout(()=>setAura(false),800);setTimeout(()=>setScan(false),700);setTimeout(()=>setRipple(false),900);}
  },[just]);
  const opacity=entered?(isActive?1:.42):0;
  const blurV=entered?(isActive?"none":"blur(1.5px)"):"none";
  const scale=entered?(isActive?1:.97):.92;
  const ty=entered?0:40;
  const cardBg=dark?(isCopied?"#0d1f12":"#161616"):(isCopied?"#F2FAF5":BG);
  const borderC=isCopied?GREEN:(isActive?(sc?.br||`${GREEN}55`):(dark?"#242424":BO));
  const shadow=isActive?`0 12px 48px ${sc?.gl||"rgba(74,124,89,.15)"},0 2px 8px rgba(0,0,0,.06)`:(dark?"0 2px 8px rgba(0,0,0,.3)":"0 2px 12px rgba(0,0,0,.05)");
  return(
    <div ref={ref} id={id} style={{background:cardBg,border:`1.5px solid ${borderC}`,borderRadius:"24px",overflow:"hidden",position:"relative",opacity,transform:`translateY(${ty}px) scale(${scale})`,filter:blurV,boxShadow:shadow,transition:"transform .55s cubic-bezier(.16,1,.3,1),opacity .55s ease,box-shadow .4s,filter .4s,border-color .4s,background .4s",willChange:"transform,opacity,filter"}}>
      <div style={{position:"absolute",right:"-4px",top:"-8px",fontSize:"110px",fontWeight:900,color:isActive?(dark?"rgba(74,124,89,.09)":"rgba(74,124,89,.055)"):(dark?"rgba(255,255,255,.02)":"rgba(0,0,0,.022)"),fontFamily:PP,lineHeight:1,pointerEvents:"none",userSelect:"none",zIndex:0,transition:"color .4s"}}>{String(n).padStart(2,"0")}</div>
      {aura&&<div style={{position:"absolute",inset:0,borderRadius:"24px",zIndex:10,pointerEvents:"none",background:"radial-gradient(ellipse at 50% 30%,rgba(74,124,89,.2) 0%,rgba(126,200,160,.08) 50%,transparent 80%)",animation:"auraBurst .75s forwards"}}/>}
      {scan&&<div style={{position:"absolute",left:0,right:0,height:"2px",zIndex:11,pointerEvents:"none",background:"linear-gradient(90deg,transparent,rgba(74,124,89,.7) 30%,rgba(126,200,160,.9) 50%,rgba(74,124,89,.7) 70%,transparent)",animation:"scanline .6s cubic-bezier(.4,0,.6,1) forwards"}}/>}
      <div style={{display:"flex",alignItems:"center",gap:"14px",padding:"18px 20px",borderBottom:`1px solid ${dark?"#242424":BO}`,position:"relative",zIndex:1}}>
        <div style={{position:"relative",flexShrink:0}}>
          {ripple&&<><div style={{position:"absolute",inset:0,borderRadius:"14px",background:sc?.bg||GL,animation:"rippleOut .8s ease-out forwards",zIndex:0}}/><div style={{position:"absolute",inset:0,borderRadius:"14px",background:sc?.bg||GL,animation:"rippleOut .8s ease-out .15s forwards",zIndex:0}}/></>}
          <div style={{width:"48px",height:"48px",borderRadius:"14px",background:isCopied?GREEN:(sc?.bg||GL),display:"flex",alignItems:"center",justifyContent:"center",position:"relative",zIndex:1,transform:isActive?"scale(1.06)":"scale(1)",transition:"transform .4s cubic-bezier(.34,1.56,.64,1),background .3s",color:isCopied?"#fff":(sc?.ic||GD),boxShadow:isActive?`0 4px 16px ${sc?.gl||"rgba(74,124,89,.25)"}`:0}}>
            {isCopied?<ICheck s={22}/>:icon}
          </div>
        </div>
        <div style={{flex:1,zIndex:1}}>
          <GlitchLabel n={n} active={just}/>
          <div style={{fontSize:"16px",fontWeight:700,color:dark?"#f0f0f0":TX,marginTop:"2px",lineHeight:"1.3",fontFamily:PP}}>{title}</div>
        </div>
        {isCopied&&<span style={{fontSize:"10px",fontWeight:700,color:GREEN,fontFamily:FF,background:"#E8F5EC",padding:"3px 8px",borderRadius:"10px",flexShrink:0}}>✓ Fait</span>}
      </div>
      <div style={{padding:"16px 20px",position:"relative",zIndex:1}}>
        {desc&&<p style={{fontSize:"12px",color:dark?"#999":TM,margin:"0 0 12px",lineHeight:"1.6",fontFamily:FF}}>{desc}</p>}
        {children}
        {isActive&&!isCopied&&<div style={{marginTop:"10px",fontSize:"10px",color:TL,fontFamily:FF,textAlign:"center",padding:"5px",background:dark?"#1e1e1e":"#F5F3F0",borderRadius:"8px"}}>100% des clients réussissent cette étape ✓</div>}
      </div>
    </div>
  );
}

function RecapBar({ci,cn,ca,cr,dark}){
  const all=ci&&cn&&ca&&cr;
  const items=[{l:"IBAN",d:ci},{l:"Nom",d:cn},{l:"Montant",d:ca},{l:"Réf.",d:cr}];
  return(
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:80,background:dark?"rgba(8,8,8,.95)":"rgba(250,248,245,.95)",backdropFilter:"blur(16px)",borderTop:`1px solid ${dark?"#222":BO}`,padding:"10px 16px 14px"}}>
      <div style={{maxWidth:"460px",margin:"0 auto"}}>
        {all?(
          <div style={{textAlign:"center",fontSize:"13px",fontWeight:700,color:GREEN,fontFamily:FF,animation:"pulse .8s ease infinite"}}>🎉 Tout est prêt — finalisez le virement !</div>
        ):(
          <div style={{display:"flex",gap:"10px",justifyContent:"center",alignItems:"center"}}>
            {items.map(it=>(
              <div key={it.l} style={{display:"flex",alignItems:"center",gap:"3px",fontSize:"11px",fontFamily:FF,color:it.d?GREEN:(dark?"#555":TL),fontWeight:it.d?700:400,transition:"color .3s"}}>
                <span style={{fontSize:"12px"}}>{it.d?"✅":"⏳"}</span>{it.l}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StepProgress({current,dark}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
      <div style={{display:"flex",gap:"3px"}}>
        {Array.from({length:4}).map((_,i)=>(
          <div key={i} style={{width:i<current?"14px":"5px",height:"5px",borderRadius:"3px",background:i<current?GREEN:(dark?"#333":BO),transition:"all .35s cubic-bezier(.34,1.56,.64,1)",boxShadow:i===current-1?`0 0 6px rgba(74,124,89,.6)`:"none"}}/>
        ))}
      </div>
      <span style={{fontSize:"10px",color:GREEN,fontWeight:700,fontFamily:FF}}>{current}/4</span>
    </div>
  );
}

function Particles({dark}){
  const pts=[{x:8,y:20,s:3,o:.07,a:"d0",d:"9s"},{x:88,y:35,s:2,o:.06,a:"d1",d:"12s"},{x:50,y:60,s:4,o:.05,a:"d2",d:"15s"},{x:15,y:75,s:2.5,o:.07,a:"d3",d:"11s"},{x:78,y:15,s:3,o:.05,a:"d4",d:"13s"},{x:92,y:80,s:2,o:.07,a:"d5",d:"10s"}];
  return(
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
      {pts.map((p,i)=><div key={i} style={{position:"absolute",left:`${p.x}%`,top:`${p.y}%`,width:`${p.s}px`,height:`${p.s}px`,borderRadius:"50%",background:GREEN,opacity:p.o,animation:`${p.a} ${p.d} ease-in-out infinite`,animationDelay:`${i*1.3}s`}}/>)}
    </div>
  );
}

function Confetti(){
  const cols=[GREEN,"#F5A623","#25D366","#E24B4A","#85B7EB","#D4BC8B"];
  return(
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999}}>
      {Array.from({length:50}).map((_,i)=>(
        <div key={i} style={{position:"absolute",left:`${10+Math.random()*80}%`,top:`${30+Math.random()*50}%`,width:`${5+Math.random()*8}px`,height:`${5+Math.random()*8}px`,borderRadius:Math.random()>.5?"50%":"2px",background:cols[i%cols.length],animation:`confettiFall ${0.8+Math.random()}s ease-out forwards`,animationDelay:`${Math.random()*.6}s`}}/>
      ))}
    </div>
  );
}

function BankLogos({dark}){
  const ref=useRef(null);const{entered}=useVis(ref);
  const banks=[{n:"BNP Paribas",c:"#009A44"},{n:"Boursorama",c:"#FF6600"},{n:"N26",c:"#3DBBDB"},{n:"Revolut",c:"#191C1F"},{n:"CIC",c:"#E30613"},{n:"Société Générale",c:"#E60026"},{n:"Crédit Agricole",c:"#007A33"},{n:"La Banque Postale",c:"#003DA5"},{n:"LCL",c:"#EE2E24"},{n:"Crédit Mutuel",c:"#005DA2"},{n:"ING",c:"#FF6200"},{n:"Wise",c:"#9FE870",t:"#1A1A1A"},{n:"Belfius",c:"#C8007B"},{n:"KBC",c:"#00A3E0"}];
  return(
    <div ref={ref} style={{display:"flex",flexWrap:"wrap",gap:"5px"}}>
      {banks.map((b,i)=><span key={b.n} style={{padding:"4px 9px",borderRadius:"5px",background:b.c,color:b.t||"#fff",fontSize:"9.5px",fontWeight:600,fontFamily:FF,opacity:entered?1:0,transform:entered?"translateY(0) scale(1)":"translateY(8px) scale(0.9)",transition:`all .4s cubic-bezier(.34,1.56,.64,1) ${i*50}ms`}}>{b.n}</span>)}
      <span style={{padding:"4px 9px",borderRadius:"5px",background:dark?"#242424":BGS,color:TL,fontSize:"9.5px",fontFamily:FF}}>+ autres</span>
    </div>
  );
}

function FinishScreen({waLink,onWa,dark}){
  const[phase,setPhase]=useState(0);
  useEffect(()=>{playSuccess();const t1=setTimeout(()=>setPhase(1),300),t2=setTimeout(()=>setPhase(2),1100);return()=>{clearTimeout(t1);clearTimeout(t2);};},[]);
  return(
    <div style={{minHeight:"100vh",background:phase>=1?(dark?"#071410":"#EFF9F4"):(dark?"#0c0c0c":BG),transition:"background .8s ease",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px",position:"relative",overflow:"hidden"}}>
      {phase>=1&&<Confetti/>}
      <div style={{textAlign:"center",maxWidth:"380px",zIndex:1}}>
        <div style={{fontSize:"72px",marginBottom:"16px",animation:phase>=1?"fadeUp .5s ease":"none"}}>🎉</div>
        <div style={{fontSize:"26px",fontWeight:800,color:GREEN,fontFamily:PP,marginBottom:"8px",animation:phase>=1?"fadeUp .5s ease .1s both":"none"}}>Commande en préparation !</div>
        <div style={{fontSize:"13px",color:dark?"#aaa":TM,lineHeight:"1.6",fontFamily:FF,marginBottom:"28px",animation:phase>=1?"fadeUp .5s ease .2s both":"none"}}>Envoyez-nous la capture de votre virement — on prépare votre colis dès réception.</div>
        {phase>=2&&(
          <div style={{background:dark?"#161616":BG,borderRadius:"20px",padding:"20px",marginBottom:"24px",animation:"bannerIn .5s ease",border:`1px solid ${dark?"#242424":BO}`}}>
            {[{icon:"✅",label:"Commande reçue",done:true},{icon:"⏳",label:"Virement en cours",active:true},{icon:"📦",label:`Expédition sous 24h`,done:false},{icon:"🚚",label:`Livraison ${getDelivery()}`,done:false}].map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px 0",borderBottom:i<3?`1px solid ${dark?"#1e1e1e":BGS}`:"none"}}>
                <span style={{fontSize:"18px",width:"24px",textAlign:"center"}}>{s.icon}</span>
                <span style={{fontSize:"13px",fontFamily:FF,fontWeight:s.active?700:400,color:s.done?GREEN:s.active?(dark?"#f0f0f0":TX):(dark?"#444":TL)}}>{s.label}</span>
                {s.active&&<span style={{marginLeft:"auto",fontSize:"10px",color:GREEN,fontWeight:700,fontFamily:FF,animation:"pulse 1.5s ease infinite"}}>EN ATTENTE</span>}
              </div>
            ))}
          </div>
        )}
        {phase>=2&&(
          <a href={waLink} onClick={onWa} className="bp" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"10px",background:"#25D366",color:"#fff",borderRadius:"18px",padding:"18px 24px",fontSize:"16px",fontWeight:700,textDecoration:"none",fontFamily:PP,boxShadow:"0 8px 32px rgba(37,211,102,.4)",animation:"waBounce 2s ease infinite"}}>
            <IWa s={22}/> Envoyer la capture
          </a>
        )}
      </div>
    </div>
  );
}

function WhyAccordion({dark}){
  const[open,setOpen]=useState(false);
  const bg=dark?"#161616":BG,border=dark?"#242424":BO;
  return(
    <div style={{borderRadius:"16px",overflow:"hidden",border:`1px solid ${border}`}}>
      <button onClick={()=>setOpen(!open)} className="bp" style={{width:"100%",padding:"14px 18px",background:bg,border:"none",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:"12.5px",fontWeight:600,color:dark?"#f0f0f0":TX,fontFamily:FF}}>
        <span>Pourquoi le virement bancaire ?</span>
        <span style={{transition:"transform .3s",transform:open?"rotate(180deg)":"rotate(0deg)",color:TL}}>▾</span>
      </button>
      <div style={{maxHeight:open?"160px":"0",overflow:"hidden",transition:"max-height .4s cubic-bezier(.16,1,.3,1)"}}>
        <p style={{fontSize:"12px",color:dark?"#999":TM,lineHeight:"1.7",margin:0,padding:"0 18px 16px",fontFamily:FF}}>Quattro Shopping est une boutique européenne indépendante. Le virement SEPA est le moyen le plus sécurisé et le plus direct — sans intermédiaire, sans frais cachés. Vos données bancaires ne transitent jamais sur notre site.</p>
      </div>
    </div>
  );
}

function Reviews({dark}){
  const rs=[{n:"Yacine B.",t:"Reçu en 4 jours, qualité propre. Merci pour le petit cadeau dans le colis.",w:"il y a 3 jours"},{n:"Mehdi L.",t:"Deuxième commande, toujours carré. Service client rapide sur WhatsApp.",w:"il y a 1 semaine"},{n:"Rayane D.",t:"Article conforme aux photos. Matière bien épaisse. Ça vaut le prix.",w:"il y a 2 semaines"}];
  const[i,setI]=useState(0),ref=useRef(null);const{entered}=useVis(ref);
  useEffect(()=>{if(!entered)return;const t=setInterval(()=>setI(x=>(x+1)%rs.length),3500);return()=>clearInterval(t);},[entered]);
  const r=rs[i];
  return(
    <div ref={ref} style={{padding:"16px 18px",background:dark?"#161616":BG,border:`1px solid ${dark?"#242424":BO}`,borderRadius:"16px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"8px"}}>
        <span style={{color:"#F5A623",fontSize:"11px"}}>★★★★★</span>
        <span style={{fontSize:"10px",color:TL,fontWeight:500,fontFamily:FF}}>AVIS VÉRIFIÉ</span>
      </div>
      <div key={i} style={{animation:"fadeR .4s ease"}}>
        <p style={{fontSize:"12.5px",color:dark?"#aaa":TM,lineHeight:"1.6",margin:"0 0 6px",fontFamily:FF}}>"{r.t}"</p>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:"11px",fontWeight:600,color:dark?"#f0f0f0":TX,fontFamily:FF}}>{r.n}</span>
          <span style={{fontSize:"10px",color:TL,fontFamily:FF}}>{r.w}</span>
        </div>
      </div>
      <div style={{display:"flex",gap:"4px",justifyContent:"center",marginTop:"10px"}}>
        {rs.map((_,j)=><div key={j} style={{width:j===i?"14px":"5px",height:"5px",borderRadius:"3px",background:j===i?GREEN:BO,transition:"width .3s ease,background .3s ease"}}/>)}
      </div>
    </div>
  );
}

function PaymentPage({data}){
  const dark=useDark();
  const[showIntro,setShowIntro]=useState(true),[show,setShow]=useState(false),[showFinish,setShowFinish]=useState(false);
  const pct=useScrollPct(),activeStep=useActiveStep();
  const visitors=useRef(getVisitors()).current;
  const[ci,setCi]=useState(false),[cn,setCn]=useState(false),[ca,setCa]=useState(false),[cr,setCr]=useState(false);
  const all=ci&&cn&&ca&&cr;
  const copiedCount=[ci,cn,ca,cr].filter(Boolean).length;

  useEffect(()=>{setTimeout(()=>setShow(true),50);},[]);

  const progress=Math.min(1,pct/70);
  const warm=dark?0:progress*6;
  const bg=dark?`rgb(${Math.round(10+progress*8)},${Math.round(10+progress*14)},${Math.round(10+progress*8)})`:`rgb(${Math.round(250+warm)},${Math.round(248+warm)},${Math.round(245-warm*2)})`;

  const scrollTo=id=>setTimeout(()=>{const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:"smooth",block:"center"});},400);

  const waText=`Bonjour, j'ai effectué mon virement de ${data.amount}€ pour ma commande${data.order?` #${data.order}`:""
}. Voici ma capture.`;
  const waLink=`https://wa.me/447365758255?text=${encodeURIComponent(waText)}`;
  const handleWa=e=>{e.preventDefault();setShowFinish(true);setTimeout(()=>window.open(waLink,"_blank"),800);};

  const cardBg=dark?"#161616":BG;
  const border=dark?"#242424":BO;

  if(showIntro)return<TypewriterIntro name={data.name} onDone={()=>setShowIntro(false)}/>;
  if(showFinish)return<FinishScreen waLink={waLink} onWa={e=>{e.preventDefault();window.open(waLink,"_blank");}} dark={dark}/>;

  return(
    <div style={{minHeight:"100vh",background:bg,fontFamily:FF,opacity:show?1:0,transition:"opacity .5s ease,background .6s ease",position:"relative",paddingBottom:"80px"}}>
      <Particles dark={dark}/>

      {/* progress bar */}
      <div style={{position:"fixed",top:0,left:0,width:"100%",height:"3px",zIndex:100}}>
        <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${GREEN},#7EC8A0)`,transition:"width .1s linear",borderRadius:"0 2px 2px 0"}}/>
      </div>

      {/* header */}
      <div style={{position:"sticky",top:"3px",zIndex:90,backdropFilter:"blur(20px)",background:dark?"rgba(8,8,8,.94)":"rgba(250,248,245,.94)",borderBottom:`1px solid ${border}`}}>
        <div style={{maxWidth:"460px",margin:"0 auto",padding:"11px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:"10px",fontWeight:800,letterSpacing:"4px",color:dark?"#f0f0f0":TX,fontFamily:PP}}>QUATTRO</div>
          <StepProgress current={copiedCount} dark={dark}/>
          <div style={{fontSize:"10px",color:GREEN,fontWeight:600,letterSpacing:"1px"}}>🔒 SÉCURISÉ</div>
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"28px 16px 20px",position:"relative",zIndex:1}}>
        <div style={{width:"100%",maxWidth:"460px"}}>

          {/* GRAND TITRE */}
          <div style={{textAlign:"center",marginBottom:"32px",animation:"fadeUp .7s ease"}}>
            <div style={{fontSize:"30px",fontWeight:900,color:dark?"#f0f0f0":TX,fontFamily:PP,letterSpacing:"-1px",lineHeight:"1.1"}}>Votre virement</div>
            <div style={{fontSize:"30px",fontWeight:900,color:GREEN,fontFamily:PP,letterSpacing:"-1px",lineHeight:"1.1"}}>en 6 étapes</div>
            <div style={{height:"3px",width:"48px",background:GREEN,borderRadius:"2px",margin:"12px auto 0",boxShadow:`0 0 10px ${GREEN}66`}}/>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"12px",marginTop:"16px",flexWrap:"wrap"}}>
              <span style={{display:"flex",alignItems:"center",gap:"5px",padding:"5px 12px",borderRadius:"20px",background:dark?"#1a1a1a":BGS,fontSize:"11px",color:dark?"#aaa":TM,fontFamily:FF}}>
                <span style={{animation:"pulseLock 2.5s ease infinite"}}>🔒</span> Paiement sécurisé
              </span>
              <span style={{display:"flex",alignItems:"center",gap:"5px",padding:"5px 12px",borderRadius:"20px",background:dark?"#1a1a1a":BGS,fontSize:"11px",color:dark?"#aaa":TM,fontFamily:FF}}>
                👥 {visitors} paiements aujourd'hui
              </span>
            </div>
          </div>

          {/* STEPS */}
          <div style={{display:"flex",flexDirection:"column",gap:"0"}}>

            <StepCard n={1} icon={<IBank/>} title="Ouvrez votre app bancaire" id="s1" isActive={activeStep===1||activeStep===0} isCopied={false} dark={dark} sc={SC[0]} desc="Cherchez le bouton virement SEPA.">
              <AltNames names={["Virement","Envoyer de l'argent","Nouveau transfert"]} dark={dark}/>
              <Tip text="Le nom du bouton varie selon la banque." dark={dark}/>
            </StepCard>

            <StepArrow done={false}/>

            <StepCard n={2} icon={<IIban/>} title="Copiez l'IBAN" id="s2" isActive={activeStep===2} isCopied={ci} dark={dark} sc={SC[1]} desc="Numéro du compte vers lequel envoyer l'argent.">
              <CopyRow label="IBAN" value="LU80 4080 0000 4547 7817" copyValue="LU80408000004547817" onCopied={()=>{setCi(true);scrollTo("s3");}} dark={dark} col={SC[1].ic}/>
              <Tip icon="🇱🇺" text="Si votre banque demande un pays, sélectionnez Luxembourg." dark={dark}/>
            </StepCard>

            <StepArrow done={ci}/>

            <StepCard n={3} icon={<IUser/>} title="Nom du destinataire" id="s3" isActive={activeStep===3} isCopied={cn} dark={dark} sc={SC[2]} desc="Le champ peut s'appeler : Bénéficiaire, Destinataire, Titulaire.">
              <CopyRow label="Nom à entrer" value="Quattro Visual Ltd" sublabel="Entreprise enregistrée au Royaume-Uni" onCopied={()=>{setCn(true);scrollTo("s4");}} dark={dark} col={SC[2].ic}/>
            </StepCard>

            <StepArrow done={ci&&cn}/>

            <StepCard n={4} icon={<IEuro/>} title="Montant exact" id="s4" isActive={activeStep===4} isCopied={ca} dark={dark} sc={SC[3]} desc="Vérifiez que la devise est bien en euros (€).">
              <CopyRow isSlot amount={data.amount} value={`${data.amount}€`} copyValue={String(data.amount)} large onCopied={()=>{setCa(true);scrollTo("s5");}} dark={dark} col={SC[3].ic}/>
            </StepCard>

            <StepArrow done={ci&&cn&&ca}/>

            <StepCard n={5} icon={<IPen/>} title="Référence / Motif" id="s5" isActive={activeStep===5} isCopied={cr} dark={dark} sc={SC[4]} desc="Ce champ peut s'appeler : Référence, Communication, Motif.">
              <AltNames names={["Référence","Communication","Motif","Message"]} dark={dark}/>
              <CopyRow label="Référence" value={data.name} onCopied={()=>{setCr(true);scrollTo("s6");}} dark={dark} col={SC[4].ic}/>
              <Tip text="Si votre banque ne demande pas de référence, passez à l'étape suivante." dark={dark}/>
            </StepCard>

            <StepArrow done={all}/>

            {all&&(
              <div style={{padding:"14px 16px",background:dark?"linear-gradient(135deg,#0d1f12,#1e3025)":"linear-gradient(135deg,#E8F5EC,#D4EDD9)",borderRadius:"20px",border:`1.5px solid ${GREEN}`,display:"flex",alignItems:"center",gap:"12px",animation:"bannerIn .5s cubic-bezier(.16,1,.3,1)",boxShadow:"0 4px 24px rgba(74,124,89,.25)",marginBottom:"0"}}>
                <span style={{fontSize:"26px"}}>🎉</span>
                <div>
                  <div style={{fontSize:"14px",fontWeight:700,color:GD,fontFamily:PP}}>Tout est prêt !</div>
                  <div style={{fontSize:"12px",color:dark?"#aaa":TM,marginTop:"2px",fontFamily:FF}}>Confirmez le virement dans votre app bancaire.</div>
                </div>
              </div>
            )}

            <div style={{height:"8px"}}/>

            <StepCard n={6} icon={<ICheck s={22}/>} title="Confirmez et envoyez la capture" id="s6" highlight isActive={activeStep===6} isCopied={false} dark={dark} sc={SC[5]} desc="Confirmez dans votre app, puis envoyez-nous la capture.">
              <div style={{display:"flex",alignItems:"center",gap:"8px",fontSize:"12px",color:dark?"#999":TM,marginBottom:"12px"}}>
                <span>📬</span><span>Commande préparée dès réception.</span>
              </div>
              {all?(
                <a href={waLink} onClick={handleWa} className="bp" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"10px",background:"#25D366",color:"#fff",borderRadius:"16px",padding:"16px",fontSize:"15px",fontWeight:700,textDecoration:"none",fontFamily:PP,boxShadow:"0 8px 28px rgba(37,211,102,.4)",animation:"pulse 1.5s ease infinite"}}>
                  <IWa s={20}/> Envoyer la capture sur WhatsApp
                </a>
              ):(
                <div style={{padding:"14px",background:dark?"#1a1a1a":BGS,borderRadius:"14px",textAlign:"center",fontSize:"12px",color:TL,fontFamily:FF,border:`1px dashed ${border}`}}>
                  Complétez les étapes ci-dessus pour débloquer
                </div>
              )}
            </StepCard>
          </div>

          {/* Bank logos */}
          <div style={{marginTop:"24px",padding:"16px 18px",background:cardBg,border:`1px solid ${border}`,borderRadius:"18px"}}>
            <div style={{fontSize:"10px",fontWeight:600,letterSpacing:"2px",color:TL,textTransform:"uppercase",marginBottom:"10px"}}>Compatible avec toutes les banques</div>
            <BankLogos dark={dark}/>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:"10px",marginTop:"12px"}}>
            <WhyAccordion dark={dark}/>
            <Reviews dark={dark}/>
          </div>

          {/* Livraison */}
          <div style={{marginTop:"16px",padding:"16px 18px",background:dark?"#0d1f12":GL,borderRadius:"18px",border:`1px solid ${dark?"#1a3020":GREEN}25`}}>
            <div style={{fontSize:"12px",color:GD,fontWeight:600,fontFamily:FF,marginBottom:"6px"}}>📦 Livraison estimée après réception du virement</div>
            <div style={{fontSize:"16px",color:GREEN,fontWeight:700,fontFamily:PP}}>{getDelivery()}</div>
            <div style={{fontSize:"11px",color:TL,marginTop:"4px",fontFamily:FF}}>Suivi UPS/FedEx sous 48h après expédition</div>
          </div>

          <div style={{textAlign:"center",marginTop:"24px",paddingBottom:"16px"}}>
            <div style={{fontSize:"10px",fontWeight:800,letterSpacing:"4px",color:dark?"#f0f0f0":TX,marginBottom:"4px",fontFamily:PP}}>QUATTRO</div>
            <div style={{fontSize:"11px",color:TL}}>depuis 2021 · Merci pour votre confiance</div>
            <a href="https://quattroshopping.com" style={{fontSize:"11px",color:GREEN,textDecoration:"none"}}>quattroshopping.com</a>
          </div>
        </div>
      </div>

      <RecapBar ci={ci} cn={cn} ca={ca} cr={cr} dark={dark}/>

      {all&&(
        <a href={waLink} onClick={handleWa} className="bp" style={{position:"fixed",bottom:"78px",right:"18px",zIndex:50,width:"56px",height:"56px",borderRadius:"50%",background:"#25D366",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(37,211,102,.45)",textDecoration:"none",cursor:"pointer",animation:"waBounce 1.5s ease-in-out infinite"}}>
          <IWa s={26}/>
        </a>
      )}
    </div>
  );
}

function AdminPanel(){
  const dark=useDark();
  const[name,setName]=useState(""),[amount,setAmount]=useState(""),[order,setOrder]=useState(""),[link,setLink]=useState(""),[preview,setPreview]=useState(null);
  const BASE=window.location.origin+window.location.pathname;
  const gen=()=>{if(!name||!amount)return;const p=new URLSearchParams();p.set("name",name);p.set("amount",amount);if(order)p.set("order",order);setLink(`${BASE}?${p.toString()}`);};
  const bg=dark?"#0c0c0c":BGS,card=dark?"#161616":BG,border=dark?"#242424":BO,tx=dark?"#f0f0f0":TX;
  if(preview)return<div><PaymentPage data={preview}/><button onClick={()=>setPreview(null)} className="bp" style={{position:"fixed",top:"60px",left:"16px",zIndex:200,background:TX,color:"#fff",border:"none",borderRadius:"8px",padding:"8px 14px",fontSize:"12px",cursor:"pointer",fontFamily:FF}}>← Admin</button></div>;
  return(
    <div style={{minHeight:"100vh",background:bg,display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 16px",fontFamily:FF}}>
      <div style={{textAlign:"center",marginBottom:"28px",animation:"fadeUp .5s ease"}}>
        <div style={{fontSize:"11px",fontWeight:800,letterSpacing:"4px",color:tx,fontFamily:PP}}>QUATTRO</div>
        <div style={{fontSize:"12px",color:GREEN,marginTop:"4px",letterSpacing:"1px"}}>Génération de lien de paiement</div>
      </div>
      <div style={{background:card,borderRadius:"18px",padding:"28px",width:"100%",maxWidth:"400px",border:`1px solid ${border}`}}>
        {[{label:"Prénom et nom du client",value:name,set:setName,ph:"Jean Dupont"},{label:"Montant (€)",value:amount,set:setAmount,ph:"178"},{label:"N° commande (optionnel)",value:order,set:setOrder,ph:"QS-4521"}].map(f=>(
          <div key={f.label} style={{marginBottom:"16px"}}>
            <label style={{display:"block",fontSize:"10px",fontWeight:600,color:TM,letterSpacing:"1px",textTransform:"uppercase",marginBottom:"6px"}}>{f.label}</label>
            <input value={f.value} onChange={e=>f.set(e.target.value)} placeholder={f.ph} style={{width:"100%",padding:"11px 14px",background:dark?"#1e1e1e":BGS,border:`1px solid ${border}`,borderRadius:"10px",fontSize:"14px",color:tx,outline:"none",fontFamily:FF}} onFocus={e=>e.target.style.borderColor=GREEN} onBlur={e=>e.target.style.borderColor=border}/>
          </div>
        ))}
        <div style={{display:"flex",gap:"8px",marginTop:"8px"}}>
          <button onClick={gen} className="bp" style={{flex:1,padding:"13px",background:GREEN,color:"#fff",border:"none",borderRadius:"12px",fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:FF}}>Générer le lien</button>
          <button onClick={()=>{if(name&&amount)setPreview({name,amount,order});}} className="bp" style={{padding:"13px 16px",background:dark?"#1e1e1e":BGS,color:tx,border:`1px solid ${border}`,borderRadius:"12px",fontSize:"13px",fontWeight:600,cursor:"pointer",fontFamily:FF}}>Aperçu</button>
        </div>
        {link&&(
          <div style={{marginTop:"20px",padding:"16px",background:dark?"#0d1f12":GL,borderRadius:"12px",border:`1px solid ${GREEN}30`}}>
            <div style={{fontSize:"10px",fontWeight:600,color:GD,letterSpacing:"1px",textTransform:"uppercase",marginBottom:"8px"}}>Lien généré</div>
            <div style={{fontSize:"11.5px",color:tx,wordBreak:"break-all",background:dark?"#161616":BG,borderRadius:"8px",padding:"8px 10px",marginBottom:"10px",fontFamily:"monospace"}}>{link}</div>
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
              <CopyBtn text={link} label="Copier le lien"/>
              <button onClick={()=>{const t=`Bonjour ${name} !\n\nMerci pour votre commande Quattro Shopping.\n\nCliquez ici pour finaliser votre paiement :\n${link}\n\nN'hésitez pas à nous contacter si besoin. 🙏`;window.open(`https://wa.me/?text=${encodeURIComponent(t)}`,"_blank");}} className="bp" style={{background:"#25D366",color:"#fff",border:"none",borderRadius:"8px",padding:"7px 14px",fontSize:"11px",fontWeight:700,cursor:"pointer",fontFamily:FF}}>Envoyer via WhatsApp</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LoginScreen({onLogin}){
  const dark=useDark();
  const[pw,setPw]=useState(""),[error,setError]=useState(false);
  const go=()=>{if(pw==="eren")onLogin();else{setError(true);setTimeout(()=>setError(false),1500);}};
  const bg=dark?"#0c0c0c":BGS,card=dark?"#161616":BG,border=dark?"#242424":BO,tx=dark?"#f0f0f0":TX;
  return(
    <div style={{minHeight:"100vh",background:bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px",fontFamily:FF}}>
      <div style={{textAlign:"center",marginBottom:"28px",animation:"fadeUp .5s ease"}}>
        <div style={{fontSize:"11px",fontWeight:800,letterSpacing:"5px",color:tx,fontFamily:PP}}>QUATTRO</div>
        <div style={{fontSize:"12px",color:GREEN,marginTop:"5px",letterSpacing:"1.5px"}}>Espace administration</div>
      </div>
      <div style={{background:card,borderRadius:"18px",padding:"28px",width:"100%",maxWidth:"340px",border:`1px solid ${border}`}}>
        <div style={{fontSize:"10px",fontWeight:600,color:TM,letterSpacing:"1px",textTransform:"uppercase",marginBottom:"8px"}}>Mot de passe</div>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="••••••" autoFocus style={{width:"100%",padding:"12px 14px",background:dark?"#1e1e1e":BGS,border:`1px solid ${error?"#E24B4A":border}`,borderRadius:"10px",fontSize:"16px",color:tx,outline:"none",marginBottom:"12px",fontFamily:FF,transition:"border-color .2s"}}/>
        {error&&<div style={{fontSize:"11px",color:"#E24B4A",marginBottom:"10px",animation:"fadeR .3s ease"}}>Mot de passe incorrect</div>}
        <button onClick={go} className="bp" style={{width:"100%",padding:"13px",background:GREEN,color:"#fff",border:"none",borderRadius:"12px",fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:FF}}>Accéder</button>
      </div>
    </div>
  );
}

export default function App(){
  const[auth,setAuth]=useState(false);
  const p=new URLSearchParams(window.location.search);
  const name=p.get("name"),amount=p.get("amount"),order=p.get("order");
  if(name&&amount)return<PaymentPage data={{name,amount,order:order||""}}/>;
  if(!auth)return<LoginScreen onLogin={()=>setAuth(true)}/>;
  return<AdminPanel/>;
}
