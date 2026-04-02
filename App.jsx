import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

// zoom lock
(function() {
  const vp = document.querySelector('meta[name="viewport"]');
  const c = "width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no";
  if (vp) vp.content = c;
  else { const m = document.createElement("meta"); m.name="viewport"; m.content=c; document.head.appendChild(m); }
})();

const GREEN = "#4A7C59";
const GL = "#E8F0EB";
const GD = "#3A6347";
const BG = "#FFFFFF";
const BGS = "#F7F6F3";
const TX = "#1A1A1A";
const TM = "#555555";
const TL = "#999999";
const BO = "#E5E2DC";
const PP = "'Poppins', sans-serif";
const FF = "'DM Sans', sans-serif";

function isDark() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function useDark() {
  const [dark, setDark] = useState(isDark());
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const h = e => setDark(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return dark;
}

function bizDate(n) {
  const r = new Date(); let a = 0;
  while (a < n) { r.setDate(r.getDate()+1); if (r.getDay()!==0&&r.getDay()!==6) a++; }
  return r;
}
function fmtD(d) { return d.toLocaleDateString("fr-FR",{day:"numeric",month:"long"}); }
function getDelivery() { return `${fmtD(bizDate(3))} – ${fmtD(bizDate(5))}`; }
function getReserve() {
  const d = new Date(); d.setDate(d.getDate()+2);
  return d.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
}

function getVisitorCount() {
  const h = new Date().getHours();
  const base = h >= 19 ? 18 : h >= 14 ? 14 : h >= 10 ? 10 : h >= 7 ? 6 : 3;
  const seed = Math.floor(Date.now() / 3600000);
  const pseudo = ((seed * 1664525 + 1013904223) & 0x7fffffff) % 8;
  return Math.min(22, Math.max(5, base + pseudo - 3));
}

function useScrollPct() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const h = () => {
      const t = document.documentElement.scrollHeight - window.innerHeight;
      setP(t > 0 ? Math.min(100, Math.round(window.scrollY / t * 100)) : 0);
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return p;
}

function useVis(ref) {
  const [ratio, setRatio] = useState(0);
  const [entered, setEntered] = useState(false);
  const [just, setJust] = useState(false);
  const prev = useRef(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const fire = () => { setJust(true); setTimeout(() => setJust(false), 900); };
    const obs = new IntersectionObserver(([e]) => {
      const r = e.intersectionRatio;
      if (r > 0.15 && !entered) { setEntered(true); fire(); }
      if (r > 0.4 && prev.current <= 0.4) fire();
      prev.current = r; setRatio(r);
    }, { threshold: [0,.1,.15,.2,.3,.4,.5,.6,.7,.8,.9,1] });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, entered]);
  return { ratio, entered, just };
}

function useActiveStep() {
  const [a, setA] = useState(0);
  useEffect(() => {
    const ids = ["s1","s2","s3","s4","s5","s6"];
    const h = () => {
      let f = 0;
      ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.6) f = i + 1;
      });
      setA(f);
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return a;
}

function useCountdown() {
  const s = useRef(Date.now());
  const [r, setR] = useState(48 * 3600);
  useEffect(() => {
    const iv = setInterval(() => setR(Math.max(0, 48*3600 - Math.floor((Date.now()-s.current)/1000))), 1000);
    return () => clearInterval(iv);
  }, []);
  const h = Math.floor(r/3600), m = Math.floor((r%3600)/60), sec = r%60;
  const red = h < 12;
  return { str: [h,m,sec].map(x=>String(x).padStart(2,"0")).join(":"), red };
}

// ── Typewriter intro ──────────────────────────────────────────────
function TypewriterIntro({ name, onDone }) {
  const lines = [
    `Bonjour ${name}.`,
    "Plus qu'une étape.",
    "On vous explique en 6 étapes.",
    "Moins de 2 minutes."
  ];
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [displayed, setDisplayed] = useState([]);
  const [done, setDone] = useState(false);
  const audioCtx = useRef(null);

  const playKey = useCallback(() => {
    try {
      if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtx.current;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 200 + Math.random() * 100;
      o.type = "square";
      g.gain.setValueAtTime(0.04, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      o.start(ctx.currentTime);
      o.stop(ctx.currentTime + 0.05);
    } catch(e) {}
  }, []);

  useEffect(() => {
    if (done) return;
    const cur = lines[lineIdx];
    if (charIdx < cur.length) {
      const t = setTimeout(() => {
        playKey();
        setCharIdx(c => c + 1);
      }, 45 + Math.random() * 20);
      return () => clearTimeout(t);
    } else {
      const pause = lineIdx === lines.length - 1 ? 800 : 500;
      const t = setTimeout(() => {
        if (lineIdx < lines.length - 1) {
          setDisplayed(d => [...d, cur]);
          setLineIdx(i => i + 1);
          setCharIdx(0);
        } else {
          setDone(true);
          setTimeout(onDone, 600);
        }
      }, pause);
      return () => clearTimeout(t);
    }
  }, [lineIdx, charIdx, done]);

  const cur = lines[lineIdx];
  const typing = cur.slice(0, charIdx);

  return (
    <div style={{ position:"fixed",inset:0,background:"#0a0a0a",zIndex:1000,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 30px" }}>
      <div style={{ maxWidth:"380px",width:"100%" }}>
        <div style={{ fontSize:"11px",fontWeight:800,letterSpacing:"5px",color:GREEN,marginBottom:"48px",fontFamily:PP }}>QUATTRO</div>
        {displayed.map((line, i) => (
          <div key={i} style={{ fontSize:"22px",fontWeight:600,color:"rgba(255,255,255,0.5)",marginBottom:"16px",fontFamily:PP,lineHeight:"1.3" }}>{line}</div>
        ))}
        <div style={{ fontSize:"24px",fontWeight:700,color:"#fff",marginBottom:"16px",fontFamily:PP,lineHeight:"1.3",minHeight:"32px" }}>
          {typing}
          {!done && <span style={{ animation:"blink .7s infinite",color:GREEN }}>|</span>}
        </div>
      </div>
      <button onClick={onDone} className="bp" style={{ position:"absolute",bottom:"40px",right:"30px",background:"transparent",border:"1px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.4)",borderRadius:"20px",padding:"6px 16px",fontSize:"11px",cursor:"pointer",fontFamily:FF }}>
        Passer →
      </button>
    </div>
  );
}

// ── SVG Icons ─────────────────────────────────────────────────────
function IconBank() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="8" width="20" height="13" rx="2"/><path d="M2 10l10-7 10 7"/><line x1="6" y1="12" x2="6" y2="17"/><line x1="10" y1="12" x2="10" y2="17"/><line x1="14" y1="12" x2="14" y2="17"/><line x1="18" y1="12" x2="18" y2="17"/></svg>; }
function IconIban() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="6" y1="15" x2="10" y2="15"/><line x1="13" y1="15" x2="16" y2="15"/></svg>; }
function IconUser() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>; }
function IconEuro() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 6.5A7 7 0 1 0 17 17.5"/><line x1="5" y1="11" x2="14" y2="11"/><line x1="5" y1="14" x2="14" y2="14"/></svg>; }
function IconPen() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function IconCheck() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>; }
function IconWa({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.118 1.523 5.854L0 24l6.324-1.501A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.886 0-3.65-.493-5.177-1.355l-.371-.22-3.754.891.924-3.638-.242-.381A9.946 9.946 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
    </svg>
  );
}

// ── Particles on copy ─────────────────────────────────────────────
function CopyParticles({ show }) {
  if (!show) return null;
  return (
    <div style={{ position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden",borderRadius:"10px" }}>
      {Array.from({length:12}).map((_,i) => {
        const angle = (i/12)*360;
        const tx = Math.cos(angle*Math.PI/180)*50+"px";
        const ty = Math.sin(angle*Math.PI/180)*40+"px";
        return (
          <div key={i} style={{ position:"absolute",left:"50%",top:"50%",width:"6px",height:"6px",borderRadius:"50%",background:GREEN,["--tx"]:tx,["--ty"]:ty,animation:"particlePop .6s ease-out forwards",animationDelay:`${i*20}ms` }} />
        );
      })}
    </div>
  );
}

// ── Ding sound ────────────────────────────────────────────────────
function playDing() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523, 659, 784].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = freq;
      o.type = "sine";
      const t = ctx.currentTime + i * 0.1;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.15, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      o.start(t); o.stop(t + 0.3);
    });
  } catch(e) {}
}

// ── Copy Button ───────────────────────────────────────────────────
function CopyBtn({ text, label, onCopied, large }) {
  const [copied, setCopied] = useState(false);
  const [glow, setGlow] = useState(false);
  const [particles, setParticles] = useState(false);
  const [sc, setSc] = useState(null);
  const chars = "ABCDEFabcdef0123456789@#$";

  const go = async () => {
    try { await navigator.clipboard.writeText(text); } catch {
      const t = document.createElement("textarea"); t.value = text;
      document.body.appendChild(t); t.select(); document.execCommand("copy"); document.body.removeChild(t);
    }
    playDing();
    let c = 0; const orig = label || "Copier";
    const iv = setInterval(() => {
      setSc(orig.split("").map(() => chars[Math.floor(Math.random()*chars.length)]).join("").slice(0,orig.length));
      if (++c > 7) { clearInterval(iv); setSc(null); }
    }, 40);
    setCopied(true); setGlow(true); setParticles(true);
    setTimeout(() => setCopied(false), 2500);
    setTimeout(() => setGlow(false), 1000);
    setTimeout(() => setParticles(false), 700);
    if (onCopied) setTimeout(onCopied, 300);
  };
  return (
    <div style={{ position:"relative" }}>
      <CopyParticles show={particles} />
      <button onClick={go} className="bp" style={{ background:copied?GREEN:"transparent",color:copied?"#fff":GREEN,border:`1.5px solid ${GREEN}`,borderRadius:large?"12px":"8px",padding:large?"12px 24px":"7px 14px",fontSize:large?"14px":"11px",fontWeight:700,cursor:"pointer",letterSpacing:".5px",whiteSpace:"nowrap",flexShrink:0,boxShadow:glow?"0 0 18px 4px rgba(74,124,89,.3)":"none",transition:"background .2s,color .2s,box-shadow .4s",fontFamily:FF }}>
        {copied ? "✓ Copié" : (sc || label || "Copier")}
      </button>
    </div>
  );
}

// ── CopyRow ───────────────────────────────────────────────────────
function CopyRow({ label, sublabel, value, copyValue, large, onCopied, isSlot, amount, dark }) {
  const [badge, setBadge] = useState(false);
  const handle = () => {
    setBadge(true);
    setTimeout(() => setBadge(false), 2800);
    if (onCopied) onCopied();
  };
  const cardBg = dark ? "#222" : BGS;
  const textColor = dark ? "#f0f0f0" : TX;
  return (
    <div>
      <div style={{ background:cardBg,borderRadius:"10px",padding:large?"16px":"13px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"10px" }}>
        <div style={{ minWidth:0 }}>
          {label && <div style={{ fontSize:"10px",color:TL,fontWeight:500,letterSpacing:"1px",textTransform:"uppercase",marginBottom:"3px" }}>{label}</div>}
          <div style={{ fontSize:large?"28px":"15px",fontWeight:large?800:600,color:textColor,fontFamily:FF,letterSpacing:large?"-1px":"0" }}>
            {isSlot ? <SlotAmt amount={amount} dark={dark} /> : value}
            {isSlot && "€"}
          </div>
          {sublabel && <div style={{ fontSize:"11px",color:TL,marginTop:"3px",lineHeight:"1.4" }}>{sublabel}</div>}
        </div>
        <CopyBtn text={copyValue||value} label="Copier" onCopied={handle} large={large} />
      </div>
      {badge && (
        <div style={{ marginTop:"6px",padding:"7px 12px",background:GL,borderRadius:"8px",border:`1px solid ${GREEN}40`,display:"flex",alignItems:"center",gap:"6px",animation:"fadeR .3s ease" }}>
          <span style={{ fontSize:"13px" }}>✅</span>
          <span style={{ fontSize:"11.5px",color:GD,fontWeight:600,fontFamily:FF }}>{label?`${label} enregistré`:"Copié"} — passez à l'étape suivante</span>
        </div>
      )}
    </div>
  );
}

function SlotAmt({ amount, dark }) {
  const [d, setD] = useState("---");
  const [done, setDone] = useState(false);
  const ref = useRef(null);
  const ran = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !ran.current) {
        ran.current = true; let c = 0;
        const iv = setInterval(() => {
          setD(String(amount).split("").map(() => String(Math.floor(Math.random()*10))).join(""));
          if (++c > 14) { clearInterval(iv); setD(String(amount)); setDone(true); }
        }, 55);
      }
    });
    o.observe(el); return () => o.disconnect();
  }, [amount]);
  return <span ref={ref} style={{ fontVariantNumeric:"tabular-nums",color:done?(dark?"#f0f0f0":TX):GREEN,transition:"color .3s" }}>{d}</span>;
}

function AltNames({ names, dark }) {
  return (
    <div style={{ display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:"10px" }}>
      {names.map(n => <span key={n} style={{ padding:"4px 10px",borderRadius:"6px",background:dark?"#2a2a2a":BGS,border:`1px solid ${dark?"#333":BO}`,fontSize:"11px",color:dark?"#aaa":TM,fontFamily:FF }}>{n}</span>)}
    </div>
  );
}

function Tip({ text, icon, dark }) {
  return (
    <div style={{ display:"flex",alignItems:"flex-start",gap:"8px",padding:"10px 12px",background:dark?"#1a1600":"#FFFBF0",borderRadius:"8px",marginTop:"10px",border:`1px solid ${dark?"#3a3000":"#F0E6C8"}` }}>
      <span style={{ fontSize:"13px",flexShrink:0 }}>{icon||"💡"}</span>
      <span style={{ fontSize:"11.5px",color:"#8B7230",lineHeight:"1.5",fontFamily:FF }}>{text}</span>
    </div>
  );
}

// ── Glitch label ──────────────────────────────────────────────────
function GlitchLabel({ n, active }) {
  const [g, setG] = useState(false);
  const ran = useRef(false);
  useEffect(() => { if (active && !ran.current) { ran.current=true; setG(true); setTimeout(()=>setG(false),500); } }, [active]);
  const txt = `Étape ${n}`;
  return (
    <span style={{ fontSize:"10px",fontWeight:600,color:GREEN,letterSpacing:"1.5px",textTransform:"uppercase",fontFamily:FF,position:"relative",display:"inline-block" }}>
      {txt}
      {g && <>
        <span style={{ position:"absolute",inset:0,color:"#7EC8A0",animation:"gc1 .25s steps(1) 2",pointerEvents:"none" }}>{txt}</span>
        <span style={{ position:"absolute",inset:0,color:"#E24B4A",animation:"gc2 .25s steps(1) 2",pointerEvents:"none" }}>{txt}</span>
      </>}
    </span>
  );
}

// ── Arrow between steps ───────────────────────────────────────────
function StepArrow({ done }) {
  return (
    <div style={{ display:"flex",justifyContent:"center",alignItems:"center",height:"36px",position:"relative",zIndex:2 }}>
      <div style={{ color:done?GREEN:TL,fontSize:"22px",animation:done?"arrowBounceGreen .5s ease":"arrowBounce 1.5s ease-in-out infinite",transition:"color .3s" }}>
        {done ? "↓" : "↓"}
      </div>
      {done && <div style={{ position:"absolute",fontSize:"10px",color:GREEN,fontWeight:600,fontFamily:FF,top:"-2px",left:"calc(50% + 16px)",whiteSpace:"nowrap" }}>suivant →</div>}
    </div>
  );
}

// ── StepCard ──────────────────────────────────────────────────────
function StepCard({ n, icon, iconBg, iconColor, title, desc, children, highlight, id, activeStep, copiedSteps, dark }) {
  const ref = useRef(null);
  const { ratio, entered, just } = useVis(ref);
  const isActive = n === activeStep || (activeStep === 0 && n === 1);
  const isCopied = copiedSteps.includes(n);
  const [aura, setAura] = useState(false);
  const [scan, setScan] = useState(false);
  const [ripple, setRipple] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (just && !ran.current) {
      ran.current=true;
      setAura(true); setScan(true); setRipple(true);
      setTimeout(()=>setAura(false),800);
      setTimeout(()=>setScan(false),700);
      setTimeout(()=>setRipple(false),900);
    }
  }, [just]);

  const opacity = entered ? (isActive ? 1 : 0.45) : 0;
  const blur = entered ? (isActive ? "none" : "blur(1.5px)") : "none";
  const sc = entered ? (isActive ? 1 : 0.97) : 0.92;
  const ty = entered ? 0 : 40;

  const cardBg = dark ? (isCopied ? "#142018" : "#1a1a1a") : (isCopied ? "#f0f9f2" : BG);
  const borderCol = isCopied ? `${GREEN}` : isActive ? `${GREEN}55` : (dark ? "#2a2a2a" : BO);

  return (
    <div ref={ref} id={id} style={{ background:cardBg,border:highlight?`2px solid ${GREEN}`:`1.5px solid ${borderCol}`,borderRadius:"18px",overflow:"hidden",position:"relative",opacity,transform:`translateY(${ty}px) scale(${sc})`,filter:blur,boxShadow:isActive?`0 0 0 1.5px ${GREEN}44,0 8px 32px rgba(74,124,89,.18),0 2px 8px rgba(0,0,0,.08)`:(dark?"0 2px 8px rgba(0,0,0,.3)":"0 2px 8px rgba(0,0,0,.04)"),transition:"transform .55s cubic-bezier(.16,1,.3,1),opacity .55s ease,box-shadow .4s ease,filter .4s ease,border-color .4s ease",willChange:"transform,opacity,filter" }}>
      {aura && <div style={{ position:"absolute",inset:0,borderRadius:"18px",zIndex:10,pointerEvents:"none",background:"radial-gradient(ellipse at 50% 30%,rgba(74,124,89,.22) 0%,rgba(126,200,160,.1) 50%,transparent 80%)",animation:"auraBurst .75s forwards" }} />}
      {scan && <div style={{ position:"absolute",left:0,right:0,height:"2px",zIndex:11,pointerEvents:"none",background:"linear-gradient(90deg,transparent,rgba(74,124,89,.7) 30%,rgba(126,200,160,.9) 50%,rgba(74,124,89,.7) 70%,transparent)",animation:"scanline .6s cubic-bezier(.4,0,.6,1) forwards" }} />}

      {/* Watermark number */}
      <div style={{ position:"absolute",right:"-8px",top:"-10px",fontSize:"100px",fontWeight:900,color:isActive?(dark?"rgba(74,124,89,.12)":"rgba(74,124,89,.07)"):(dark?"rgba(255,255,255,.03)":"rgba(0,0,0,.03)"),fontFamily:PP,lineHeight:1,pointerEvents:"none",userSelect:"none",zIndex:0,transition:"color .4s" }}>
        {String(n).padStart(2,"0")}
      </div>

      <div style={{ display:"flex",alignItems:"center",gap:"14px",padding:"16px 18px",borderBottom:`1px solid ${dark?"#2a2a2a":BO}`,position:"relative",zIndex:1 }}>
        <div style={{ position:"relative",flexShrink:0 }}>
          {ripple && <>
            <div style={{ position:"absolute",inset:0,borderRadius:"14px",background:GL,animation:"rippleOut .8s ease-out forwards",zIndex:0 }} />
            <div style={{ position:"absolute",inset:0,borderRadius:"14px",background:GL,animation:"rippleOut .8s ease-out .15s forwards",zIndex:0 }} />
          </>}
          <div style={{ width:"46px",height:"46px",borderRadius:"14px",background:isCopied?GREEN:(iconBg||GL),display:"flex",alignItems:"center",justifyContent:"center",position:"relative",zIndex:1,transform:isActive?"scale(1.08)":"scale(1)",transition:"transform .4s cubic-bezier(.34,1.56,.64,1),background .3s",color:isCopied?"#fff":(iconColor||GD) }}>
            {isCopied ? <IconCheck /> : icon}
          </div>
        </div>
        <div style={{ flex:1,zIndex:1 }}>
          <GlitchLabel n={n} active={just} />
          <div style={{ fontSize:"15px",fontWeight:700,color:dark?"#f0f0f0":TX,marginTop:"2px",lineHeight:"1.3",fontFamily:PP }}>{title}</div>
        </div>
      </div>

      <div style={{ padding:"16px 18px",position:"relative",zIndex:1 }}>
        {desc && <p style={{ fontSize:"12.5px",color:dark?"#aaa":TM,margin:"0 0 12px",lineHeight:"1.6",fontFamily:FF }}>{desc}</p>}
        {children}
      </div>
    </div>
  );
}

// ── Recap bar ─────────────────────────────────────────────────────
function RecapBar({ cIban, cNom, cAmt, cRef, dark }) {
  const items = [
    { label:"IBAN", done:cIban },
    { label:"Nom", done:cNom },
    { label:"Montant", done:cAmt },
    { label:"Réf.", done:cRef },
  ];
  const all = cIban && cNom && cAmt && cRef;
  return (
    <div style={{ position:"fixed",bottom:0,left:0,right:0,zIndex:80,background:dark?"rgba(15,15,15,.95)":"rgba(255,255,255,.95)",backdropFilter:"blur(16px)",borderTop:`1px solid ${dark?"#2a2a2a":BO}`,padding:"10px 16px 14px" }}>
      <div style={{ maxWidth:"460px",margin:"0 auto" }}>
        {all ? (
          <div style={{ textAlign:"center",fontSize:"13px",fontWeight:700,color:GREEN,fontFamily:FF,animation:"pulse .8s ease infinite" }}>
            🎉 Tout est prêt — finalisez le virement !
          </div>
        ) : (
          <div style={{ display:"flex",gap:"8px",justifyContent:"center" }}>
            {items.map(item => (
              <div key={item.label} style={{ display:"flex",alignItems:"center",gap:"4px",fontSize:"11px",fontFamily:FF,color:item.done?GREEN:(dark?"#666":TL),fontWeight:item.done?700:400,transition:"color .3s" }}>
                <span style={{ fontSize:"12px" }}>{item.done?"✅":"⏳"}</span>
                {item.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────
function StepProgress({ current, total, dark }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:"8px" }}>
      <div style={{ display:"flex",gap:"3px" }}>
        {Array.from({length:total}).map((_,i) => (
          <div key={i} style={{ width:i<current?"14px":"5px",height:"5px",borderRadius:"3px",background:i<current?GREEN:(dark?"#333":BO),transition:"all .35s cubic-bezier(.34,1.56,.64,1)",boxShadow:i===current-1?"0 0 6px rgba(74,124,89,.5)":"none" }} />
        ))}
      </div>
      <span style={{ fontSize:"10px",color:GREEN,fontWeight:700,fontFamily:FF }}>{current}/{total}</span>
    </div>
  );
}

// ── Delivery animation ────────────────────────────────────────────
function DeliveryAnim({ dark }) {
  const [step, setStep] = useState(0);
  const steps = ["📦 Emballage", "✈️ En route", "🏠 Livraison"];
  useEffect(() => {
    const iv = setInterval(() => setStep(s => (s+1)%steps.length), 2000);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ padding:"12px 14px",background:dark?"#1a2a1e":GL,borderRadius:"12px",marginBottom:"8px" }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px" }}>
        <div style={{ fontSize:"12px",color:GD,fontWeight:600,fontFamily:FF }}>Livraison estimée</div>
        <div style={{ fontSize:"14px",color:GREEN,fontWeight:700,fontFamily:FF }}>{getDelivery()}</div>
      </div>
      <div style={{ display:"flex",alignItems:"center",gap:"0",position:"relative" }}>
        {steps.map((s,i) => (
          <div key={i} style={{ flex:1,textAlign:"center",position:"relative" }}>
            <div style={{ fontSize:i===step?"18px":"13px",transition:"font-size .3s",filter:i===step?"none":"grayscale(1) opacity(0.4)" }}>{s.split(" ")[0]}</div>
            <div style={{ fontSize:"9px",color:i<=step?GREEN:TL,fontFamily:FF,fontWeight:i===step?700:400,marginTop:"2px",transition:"color .3s" }}>{s.split(" ").slice(1).join(" ")}</div>
            {i < steps.length-1 && <div style={{ position:"absolute",right:0,top:"8px",width:"50%",height:"1.5px",background:`linear-gradient(90deg,${i<step?GREEN:BO},${i<step-1?GREEN:BO})` }} />}
          </div>
        ))}
      </div>
      <div style={{ fontSize:"10.5px",color:TL,marginTop:"8px",fontFamily:FF }}>Suivi UPS/FedEx sous 48h après expédition</div>
    </div>
  );
}

// ── Finish screen ─────────────────────────────────────────────────
function FinishScreen({ waLink, onWa, dark }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // play success sound
  useEffect(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [523,659,784,1047].forEach((f,i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = f; o.type = "sine";
        const t = ctx.currentTime + i*0.15;
        g.gain.setValueAtTime(0,t);
        g.gain.linearRampToValueAtTime(0.2,t+0.03);
        g.gain.exponentialRampToValueAtTime(0.001,t+0.4);
        o.start(t); o.stop(t+0.4);
      });
    } catch(e) {}
  }, []);

  const cols = ["#4A7C59","#F5A623","#25D366","#E24B4A","#85B7EB","#D4BC8B"];

  return (
    <div style={{ minHeight:"100vh",background:phase>=1?(dark?"#0d1f12":"#f0f9f2"):(dark?"#0f0f0f":BG),transition:"background .8s ease",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px",position:"relative",overflow:"hidden" }}>
      {/* confetti */}
      {phase>=1 && Array.from({length:40}).map((_,i) => (
        <div key={i} style={{ position:"fixed",left:`${10+Math.random()*80}%`,top:`${30+Math.random()*40}%`,width:`${5+Math.random()*8}px`,height:`${5+Math.random()*8}px`,borderRadius:Math.random()>.5?"50%":"2px",background:cols[i%cols.length],animation:`confettiFall ${0.8+Math.random()}s ease-out forwards`,animationDelay:`${Math.random()*.6}s`,pointerEvents:"none",zIndex:10 }} />
      ))}
      <div style={{ textAlign:"center",maxWidth:"380px",zIndex:1 }}>
        <div style={{ fontSize:"64px",marginBottom:"20px",animation:phase>=1?"fadeUp .6s ease":"none" }}>🎉</div>
        <div style={{ fontSize:"28px",fontWeight:800,color:GREEN,fontFamily:PP,marginBottom:"8px",animation:phase>=1?"fadeUp .6s ease .1s both":"none" }}>Commande en préparation !</div>
        <div style={{ fontSize:"14px",color:dark?"#aaa":TM,lineHeight:"1.6",fontFamily:FF,marginBottom:"32px",animation:phase>=1?"fadeUp .6s ease .2s both":"none" }}>Envoyez-nous la capture de votre virement sur WhatsApp — on prépare votre colis dès réception.</div>

        {/* timeline */}
        {phase>=2 && (
          <div style={{ background:dark?"#1a1a1a":BG,borderRadius:"16px",padding:"20px",marginBottom:"24px",animation:"bannerIn .5s ease" }}>
            {[
              { icon:"✅", label:"Commande reçue", done:true },
              { icon:"⏳", label:"Virement en cours", done:false, active:true },
              { icon:"📦", label:"Emballage & expédition", done:false },
              { icon:"🚚", label:`Livraison ${fmtD(bizDate(3))} – ${fmtD(bizDate(5))}`, done:false },
            ].map((s,i) => (
              <div key={i} style={{ display:"flex",alignItems:"center",gap:"12px",padding:"8px 0",borderBottom:i<3?`1px solid ${dark?"#2a2a2a":BO}`:"none" }}>
                <span style={{ fontSize:"18px",width:"24px",textAlign:"center" }}>{s.icon}</span>
                <span style={{ fontSize:"13px",fontFamily:FF,fontWeight:s.active?700:400,color:s.done?GREEN:s.active?(dark?"#f0f0f0":TX):(dark?"#555":TL) }}>{s.label}</span>
                {s.active && <span style={{ marginLeft:"auto",fontSize:"10px",color:GREEN,fontWeight:600,fontFamily:FF,animation:"pulse 1.5s ease infinite" }}>EN ATTENTE</span>}
              </div>
            ))}
          </div>
        )}

        {phase>=2 && (
          <a href={waLink} onClick={onWa} className="bp" style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:"10px",background:"#25D366",color:"#fff",borderRadius:"16px",padding:"18px 24px",fontSize:"16px",fontWeight:700,textDecoration:"none",fontFamily:PP,boxShadow:"0 8px 30px rgba(37,211,102,.4)",animation:"waBounce 2s ease infinite" }}>
            <IconWa size={22} /> Envoyer la capture
          </a>
        )}
      </div>
    </div>
  );
}

// ── Confetti (global) ─────────────────────────────────────────────
function Confetti({ show }) {
  if (!show) return null;
  const cols = [GREEN,"#F5A623","#25D366","#E24B4A","#85B7EB","#D4BC8B"];
  return (
    <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:9999 }}>
      {Array.from({length:40}).map((_,i) => (
        <div key={i} style={{ position:"absolute",left:`${10+Math.random()*80}%`,top:`${40+Math.random()*40}%`,width:`${5+Math.random()*8}px`,height:`${5+Math.random()*8}px`,borderRadius:Math.random()>.5?"50%":"2px",background:cols[i%cols.length],animation:`confettiFall ${0.8+Math.random()}s ease-out forwards`,animationDelay:`${Math.random()*.4}s` }} />
      ))}
    </div>
  );
}

// ── Particles bg ──────────────────────────────────────────────────
function Particles({ dark }) {
  const pts = [
    {x:8,y:20,s:3,o:.08,a:"d0",d:"9s"},{x:88,y:35,s:2,o:.06,a:"d1",d:"12s"},
    {x:50,y:60,s:4,o:.05,a:"d2",d:"15s"},{x:15,y:75,s:2.5,o:.07,a:"d3",d:"11s"},
    {x:78,y:15,s:3,o:.05,a:"d4",d:"13s"},{x:92,y:80,s:2,o:.07,a:"d5",d:"10s"},
  ];
  return (
    <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden" }}>
      {pts.map((p,i) => <div key={i} style={{ position:"absolute",left:`${p.x}%`,top:`${p.y}%`,width:`${p.s}px`,height:`${p.s}px`,borderRadius:"50%",background:GREEN,opacity:p.o,animation:`${p.a} ${p.d} ease-in-out infinite`,animationDelay:`${i*1.3}s` }} />)}
    </div>
  );
}

// ── BankLogos ─────────────────────────────────────────────────────
function BankLogos({ dark }) {
  const ref = useRef(null);
  const { entered } = useVis(ref);
  const banks = [
    {n:"BNP Paribas",c:"#009A44"},{n:"Boursorama",c:"#FF6600"},{n:"N26",c:"#3DBBDB"},
    {n:"Revolut",c:"#191C1F"},{n:"CIC",c:"#E30613"},{n:"Société Générale",c:"#E60026"},
    {n:"Crédit Agricole",c:"#007A33"},{n:"La Banque Postale",c:"#003DA5"},{n:"LCL",c:"#EE2E24"},
    {n:"Crédit Mutuel",c:"#005DA2"},{n:"ING",c:"#FF6200"},{n:"Wise",c:"#9FE870",t:"#1A1A1A"},
    {n:"Belfius",c:"#C8007B"},{n:"KBC",c:"#00A3E0"},
  ];
  return (
    <div ref={ref} style={{ display:"flex",flexWrap:"wrap",gap:"5px" }}>
      {banks.map((b,i) => <span key={b.n} style={{ padding:"4px 9px",borderRadius:"5px",background:b.c,color:b.t||"#fff",fontSize:"9.5px",fontWeight:600,fontFamily:FF,opacity:entered?1:0,transform:entered?"translateY(0) scale(1)":"translateY(8px) scale(0.9)",transition:`all .4s cubic-bezier(.34,1.56,.64,1) ${i*50}ms` }}>{b.n}</span>)}
      <span style={{ padding:"4px 9px",borderRadius:"5px",background:dark?"#2a2a2a":BGS,color:TL,fontSize:"9.5px",fontFamily:FF }}>+ autres</span>
    </div>
  );
}

function WhyAccordion({ dark }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderRadius:"12px",overflow:"hidden",border:`1px solid ${dark?"#2a2a2a":BO}` }}>
      <button onClick={()=>setOpen(!open)} className="bp" style={{ width:"100%",padding:"14px 16px",background:dark?"#1a1a1a":BG,border:"none",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:"12.5px",fontWeight:600,color:dark?"#f0f0f0":TX,fontFamily:FF }}>
        <span>Pourquoi le virement bancaire ?</span>
        <span style={{ transition:"transform .3s",transform:open?"rotate(180deg)":"rotate(0deg)",color:TL }}>▾</span>
      </button>
      <div style={{ maxHeight:open?"180px":"0",overflow:"hidden",transition:"max-height .4s cubic-bezier(.16,1,.3,1)" }}>
        <p style={{ fontSize:"12.5px",color:dark?"#aaa":TM,lineHeight:"1.7",margin:0,padding:"0 16px 16px",fontFamily:FF }}>
          Quattro Shopping est une boutique européenne indépendante. Le virement SEPA est le moyen de paiement le plus sécurisé et le plus direct — sans intermédiaire, sans frais cachés. Vos données bancaires ne transitent jamais sur notre site.
        </p>
      </div>
    </div>
  );
}

function Reviews({ dark }) {
  const rs = [
    {n:"Yacine B.",t:"Reçu en 4 jours, qualité propre. Merci pour le petit cadeau dans le colis.",w:"il y a 3 jours"},
    {n:"Mehdi L.",t:"Deuxième commande, toujours carré. Service client rapide sur WhatsApp.",w:"il y a 1 semaine"},
    {n:"Rayane D.",t:"Article conforme aux photos. Matière bien épaisse. Ça vaut le prix.",w:"il y a 2 semaines"},
  ];
  const [i, setI] = useState(0);
  const ref = useRef(null);
  const {entered} = useVis(ref);
  useEffect(()=>{ if(!entered)return; const t=setInterval(()=>setI(x=>(x+1)%rs.length),3500); return()=>clearInterval(t); },[entered]);
  const r = rs[i];
  return (
    <div ref={ref} style={{ padding:"16px 18px",background:dark?"#1a1a1a":BG,border:`1px solid ${dark?"#2a2a2a":BO}`,borderRadius:"14px" }}>
      <div style={{ display:"flex",alignItems:"center",gap:"6px",marginBottom:"8px" }}>
        <span style={{ color:"#F5A623",fontSize:"11px",letterSpacing:"1px" }}>★★★★★</span>
        <span style={{ fontSize:"10px",color:TL,fontWeight:500,letterSpacing:".5px",fontFamily:FF }}>AVIS VÉRIFIÉ</span>
      </div>
      <div key={i} style={{ animation:"fadeR .4s ease" }}>
        <p style={{ fontSize:"12.5px",color:dark?"#aaa":TM,lineHeight:"1.6",margin:"0 0 6px",fontFamily:FF }}>"{r.t}"</p>
        <div style={{ display:"flex",justifyContent:"space-between" }}>
          <span style={{ fontSize:"11px",fontWeight:600,color:dark?"#f0f0f0":TX,fontFamily:FF }}>{r.n}</span>
          <span style={{ fontSize:"10px",color:TL,fontFamily:FF }}>{r.w}</span>
        </div>
      </div>
      <div style={{ display:"flex",gap:"4px",justifyContent:"center",marginTop:"10px" }}>
        {rs.map((_,j)=><div key={j} style={{ width:j===i?"14px":"5px",height:"5px",borderRadius:"3px",background:j===i?GREEN:BO,transition:"width .3s ease,background .3s ease" }} />)}
      </div>
    </div>
  );
}

// ── PaymentPage ───────────────────────────────────────────────────
function PaymentPage({ data }) {
  const dark = useDark();
  const [showIntro, setShowIntro] = useState(true);
  const [show, setShow] = useState(false);
  const [showFinish, setShowFinish] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const pct = useScrollPct();
  const activeStep = useActiveStep();
  const { str: countdown, red: timerRed } = useCountdown();
  const [cIban, setCIban] = useState(false);
  const [cNom, setCNom] = useState(false);
  const [cAmt, setCamt] = useState(false);
  const [cRef, setCref] = useState(false);
  const allReady = cIban && cNom && cAmt && cRef;
  const copiedSteps = [cIban?2:null,cNom?3:null,cAmt?4:null,cRef?5:null].filter(Boolean);
  const visitors = useRef(getVisitorCount()).current;

  useEffect(() => { setTimeout(() => setShow(true), 50); }, []);

  const progress = Math.min(1, pct / 80);
  const r = Math.round(247 + (dark?-100:0) + progress * (dark?0:4));
  const g2 = Math.round(246 + (dark?-100:0) + progress * (dark?8:2));
  const b = Math.round(243 + (dark?-100:0) - progress * (dark?0:6));
  const bg = `rgb(${r},${g2},${b})`;

  const scrollTo = id => setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior:"smooth", block:"center" });
  }, 400);

  const waText = `Bonjour, j'ai effectué mon virement de ${data.amount}€ pour ma commande${data.order?` #${data.order}`:""
}. Voici ma capture.`;
  const waLink = `https://wa.me/447365758255?text=${encodeURIComponent(waText)}`;
  const handleWa = e => {
    e.preventDefault(); setConfetti(true);
    setTimeout(()=>{ setConfetti(false); window.open(waLink,"_blank"); },600);
  };

  const cardBg = dark ? "#1a1a1a" : BG;
  const borderCol = dark ? "#2a2a2a" : BO;

  if (showIntro) return <TypewriterIntro name={data.name} onDone={() => { setShowIntro(false); }} />;
  if (showFinish) return <FinishScreen waLink={waLink} onWa={handleWa} dark={dark} />;

  return (
    <div style={{ minHeight:"100vh",background:bg,fontFamily:FF,opacity:show?1:0,transition:"opacity .5s ease,background .5s ease",position:"relative",paddingBottom:"80px" }}>
      <Particles dark={dark} />
      <Confetti show={confetti} />

      {/* Progress bar top */}
      <div style={{ position:"fixed",top:0,left:0,width:"100%",height:"3px",zIndex:100 }}>
        <div style={{ height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${GREEN},#7EC8A0)`,transition:"width .1s linear",borderRadius:"0 2px 2px 0" }} />
      </div>

      {/* Sticky header */}
      <div style={{ position:"sticky",top:"3px",zIndex:90,backdropFilter:"blur(20px)",background:dark?"rgba(10,10,10,.92)":"rgba(255,255,255,.92)",borderBottom:`1px solid ${borderCol}` }}>
        <div style={{ maxWidth:"460px",margin:"0 auto",padding:"11px 16px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div style={{ fontSize:"10px",fontWeight:800,letterSpacing:"4px",color:dark?"#f0f0f0":TX,fontFamily:PP }}>QUATTRO</div>
          <StepProgress current={copiedSteps.length} total={4} dark={dark} />
          <div style={{ fontSize:"10px",color:GREEN,fontWeight:600,letterSpacing:"1px" }}>SÉCURISÉ 🔒</div>
        </div>
      </div>

      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",padding:"20px 16px 20px",position:"relative",zIndex:1 }}>
        <div style={{ width:"100%",maxWidth:"460px" }}>

          {/* Intro card */}
          <div style={{ background:cardBg,border:`1px solid ${borderCol}`,borderRadius:"18px",padding:"20px 18px",marginBottom:"16px" }}>
            <p style={{ fontSize:"15px",color:dark?"#f0f0f0":TX,margin:"0 0 4px",fontWeight:700,fontFamily:PP }}>Bonjour {data.name} 👋</p>
            <p style={{ fontSize:"12.5px",color:dark?"#aaa":TM,margin:"0 0 14px",lineHeight:"1.6",fontFamily:FF }}>Finalisez votre commande en 2 min — 6 étapes simples.</p>

            <div style={{ display:"flex",gap:"6px",marginBottom:"14px",flexWrap:"wrap" }}>
              <span style={{ display:"flex",alignItems:"center",gap:"5px",padding:"5px 10px",borderRadius:"20px",background:dark?"#1a2a1e":GL,fontSize:"11px",color:GD,fontWeight:600,fontFamily:FF }}>
                <span style={{ fontSize:"12px",animation:"pulseLock 2.5s ease infinite" }}>🔒</span> Paiement sécurisé
              </span>
              <span style={{ display:"flex",alignItems:"center",gap:"5px",padding:"5px 10px",borderRadius:"20px",background:dark?"#1a2a1e":GL,fontSize:"11px",color:GD,fontWeight:600,fontFamily:FF }}>
                👥 {visitors} paiements aujourd'hui
              </span>
            </div>

            <DeliveryAnim dark={dark} />

            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",background:dark?"#1a1600":"#FFFBF0",borderRadius:"10px",border:`1px solid ${dark?"#3a3000":"#F0E6C8"}` }}>
              <div style={{ display:"flex",alignItems:"center",gap:"8px" }}>
                <span style={{ fontSize:"14px" }}>⏳</span>
                <span style={{ fontSize:"11px",color:"#8B7230",fontFamily:FF }}>Réservé jusqu'au {getReserve()}</span>
              </div>
              <div style={{ fontFamily:"monospace",fontSize:"13px",fontWeight:700,color:timerRed?"#E24B4A":"#8B7230",background:timerRed?"#FFE8E8":(dark?"#2a2000":"#F0E6C8"),padding:"3px 8px",borderRadius:"6px",letterSpacing:"1px",animation:timerRed?"shake 0.5s ease infinite":"none" }}>{countdown}</div>
            </div>
          </div>

          {/* Title */}
          <div style={{ textAlign:"center",margin:"8px 0 24px" }}>
            <div style={{ display:"flex",alignItems:"center",gap:"12px",justifyContent:"center" }}>
              <div style={{ height:"1px",flex:1,background:`linear-gradient(90deg,transparent,${borderCol})` }} />
              <div style={{ fontSize:"11px",color:TL,letterSpacing:"3px",textTransform:"uppercase",fontFamily:FF }}>6 étapes · 2 minutes</div>
              <div style={{ height:"1px",flex:1,background:`linear-gradient(90deg,${borderCol},transparent)` }} />
            </div>
          </div>

          {/* Steps */}
          <div style={{ display:"flex",flexDirection:"column",gap:"0" }}>

            <StepCard n={1} icon={<IconBank/>} iconBg={dark?"#1a2a1e":GL} iconColor={GD} title="Ouvrez votre app bancaire" id="s1" activeStep={activeStep} copiedSteps={copiedSteps} dark={dark}
              desc="Cherchez le bouton pour faire un virement SEPA.">
              <AltNames names={["Virement","Envoyer de l'argent","Nouveau transfert"]} dark={dark}/>
              <Tip text="Le nom change selon la banque — cherchez ces termes." dark={dark}/>
            </StepCard>

            <StepArrow done={false} />

            <StepCard n={2} icon={<IconIban/>} iconBg={dark?"#1a1e2a":"#E6F0FA"} iconColor="#3A6B9F" title="Copiez l'IBAN" id="s2" activeStep={activeStep} copiedSteps={copiedSteps} dark={dark}
              desc="Numéro du compte vers lequel envoyer l'argent.">
              <CopyRow label="IBAN" value="LU80 4080 0000 4547 7817" copyValue="LU80408000004547817" onCopied={()=>{ setCIban(true); scrollTo("s3"); }} dark={dark}/>
              <Tip icon="🇱🇺" text="Si votre banque demande un pays, sélectionnez Luxembourg." dark={dark}/>
            </StepCard>

            <StepArrow done={cIban} />

            <StepCard n={3} icon={<IconUser/>} iconBg={dark?"#2a1e1a":"#F3EDE4"} iconColor="#8B5A3A" title="Nom du destinataire" id="s3" activeStep={activeStep} copiedSteps={copiedSteps} dark={dark}
              desc="Le champ peut s'appeler : Bénéficiaire, Destinataire, Titulaire.">
              <CopyRow label="Nom à entrer" value="Quattro Visual Ltd" sublabel="Entreprise enregistrée au Royaume-Uni" onCopied={()=>{ setCNom(true); scrollTo("s4"); }} dark={dark}/>
            </StepCard>

            <StepArrow done={cIban && cNom} />

            <StepCard n={4} icon={<IconEuro/>} iconBg={dark?"#1a2a1e":GL} iconColor={GD} title="Montant exact" id="s4" activeStep={activeStep} copiedSteps={copiedSteps} dark={dark}
              desc="Vérifiez que la devise est en euros (€).">
              <CopyRow isSlot amount={data.amount} value={`${data.amount}€`} copyValue={String(data.amount)} large onCopied={()=>{ setCamt(true); scrollTo("s5"); }} dark={dark}/>
            </StepCard>

            <StepArrow done={cIban && cNom && cAmt} />

            <StepCard n={5} icon={<IconPen/>} iconBg={dark?"#2a2a1a":"#F0EDE6"} iconColor="#7A6A3A" title="Référence / Motif" id="s5" activeStep={activeStep} copiedSteps={copiedSteps} dark={dark}
              desc="Votre banque peut appeler ce champ : Référence, Communication, Motif.">
              <CopyRow label="Référence" value={data.name} onCopied={()=>{ setCref(true); scrollTo("s6"); }} dark={dark}/>
              <Tip text="Si votre banque ne demande pas de référence, passez à l'étape suivante." dark={dark}/>
            </StepCard>

            <StepArrow done={allReady} />

            {/* All ready banner */}
            {allReady && (
              <div style={{ padding:"14px 16px",background:`linear-gradient(135deg,${dark?"#142018":GL},${dark?"#1e3025":"#d4edd9"})`,borderRadius:"14px",border:`1.5px solid ${GREEN}`,display:"flex",alignItems:"center",gap:"12px",animation:"bannerIn .5s cubic-bezier(.16,1,.3,1)",boxShadow:"0 4px 20px rgba(74,124,89,.25)",marginBottom:"0" }}>
                <span style={{ fontSize:"24px" }}>🎉</span>
                <div>
                  <div style={{ fontSize:"13px",fontWeight:700,color:GD,fontFamily:PP }}>Tout est prêt !</div>
                  <div style={{ fontSize:"11.5px",color:dark?"#aaa":TM,marginTop:"2px",fontFamily:FF }}>Confirmez le virement dans votre app.</div>
                </div>
              </div>
            )}

            <div style={{ height:"8px" }} />

            <StepCard n={6} icon={<IconCheck/>} iconBg={GL} iconColor={GD} title="Confirmez et envoyez la capture" id="s6" highlight activeStep={activeStep} copiedSteps={copiedSteps} dark={dark}
              desc="Confirmez dans votre app, puis envoyez-nous la capture.">
              <div style={{ display:"flex",alignItems:"center",gap:"8px",fontSize:"11.5px",color:dark?"#aaa":TM,marginBottom:"12px" }}>
                <span style={{ fontSize:"15px" }}>📬</span>
                <span>Commande préparée dès réception.</span>
              </div>
              {allReady ? (
                <a href={waLink} onClick={e=>{e.preventDefault();setShowFinish(true);setTimeout(()=>window.open(waLink,"_blank"),800);}} className="bp" style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",background:"#25D366",color:"#fff",borderRadius:"14px",padding:"16px",fontSize:"15px",fontWeight:700,textDecoration:"none",fontFamily:PP,boxShadow:"0 6px 24px rgba(37,211,102,.4)",animation:"pulse 1.5s ease infinite" }}>
                  <IconWa size={20}/> Envoyer la capture sur WhatsApp
                </a>
              ) : (
                <div style={{ padding:"14px",background:dark?"#1a1a1a":BGS,borderRadius:"12px",textAlign:"center",fontSize:"12px",color:TL,fontFamily:FF,border:`1px dashed ${BO}` }}>
                  Complétez les étapes ci-dessus pour débloquer ce bouton
                </div>
              )}
            </StepCard>
          </div>

          {/* Bank logos */}
          <div style={{ marginTop:"20px",padding:"16px 18px",background:cardBg,border:`1px solid ${borderCol}`,borderRadius:"14px" }}>
            <div style={{ fontSize:"10px",fontWeight:600,letterSpacing:"2px",color:TL,textTransform:"uppercase",marginBottom:"10px" }}>Compatible avec toutes les banques</div>
            <BankLogos dark={dark}/>
          </div>

          <div style={{ display:"flex",flexDirection:"column",gap:"12px",marginTop:"14px" }}>
            <WhyAccordion dark={dark}/>
            <Reviews dark={dark}/>
          </div>

          <div style={{ textAlign:"center",marginTop:"24px",paddingBottom:"16px" }}>
            <div style={{ fontSize:"10px",fontWeight:800,letterSpacing:"4px",color:dark?"#f0f0f0":TX,marginBottom:"4px",fontFamily:PP }}>QUATTRO</div>
            <div style={{ fontSize:"11px",color:TL }}>depuis 2021 · Merci pour votre confiance</div>
            <a href="https://quattroshopping.com" style={{ fontSize:"11px",color:GREEN,textDecoration:"none" }}>quattroshopping.com</a>
          </div>
        </div>
      </div>

      {/* Recap bar */}
      <RecapBar cIban={cIban} cNom={cNom} cAmt={cAmt} cRef={cRef} dark={dark}/>

      {/* Floating WA — only after all copies */}
      {allReady && (
        <a href={waLink} onClick={handleWa} className="bp" style={{ position:"fixed",bottom:"80px",right:"20px",zIndex:50,width:"56px",height:"56px",borderRadius:"50%",background:"#25D366",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(37,211,102,.4)",textDecoration:"none",cursor:"pointer",animation:"waBounce 1.5s ease-in-out infinite" }}>
          <IconWa size={26}/>
        </a>
      )}
    </div>
  );
}

// ── Admin ─────────────────────────────────────────────────────────
function AdminPanel() {
  const dark = useDark();
  const [name,setName]=useState(""),[amount,setAmount]=useState(""),[order,setOrder]=useState(""),[link,setLink]=useState(""),[preview,setPreview]=useState(null);
  const BASE=window.location.origin+window.location.pathname;
  const gen=()=>{
    if(!name||!amount)return;
    const p=new URLSearchParams();
    p.set("name",name);p.set("amount",amount);
    if(order)p.set("order",order);
    setLink(`${BASE}?${p.toString()}`);
  };
  const cardBg=dark?"#1a1a1a":BG;
  const borderCol=dark?"#2a2a2a":BO;
  const bgMain=dark?"#0f0f0f":BGS;
  const textCol=dark?"#f0f0f0":TX;

  if(preview)return(
    <div>
      <PaymentPage data={preview}/>
      <button onClick={()=>setPreview(null)} className="bp" style={{ position:"fixed",top:"60px",left:"16px",zIndex:200,background:TX,color:"#fff",border:"none",borderRadius:"8px",padding:"8px 14px",fontSize:"12px",cursor:"pointer",fontFamily:FF }}>← Admin</button>
    </div>
  );
  return(
    <div style={{ minHeight:"100vh",background:bgMain,display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 16px",fontFamily:FF }}>
      <div style={{ textAlign:"center",marginBottom:"28px",animation:"fadeUp .5s ease" }}>
        <div style={{ fontSize:"11px",fontWeight:800,letterSpacing:"4px",color:textCol,fontFamily:PP }}>QUATTRO</div>
        <div style={{ fontSize:"12px",color:GREEN,marginTop:"4px",letterSpacing:"1px" }}>Génération de lien de paiement</div>
      </div>
      <div style={{ background:cardBg,borderRadius:"14px",padding:"28px",width:"100%",maxWidth:"400px",border:`1px solid ${borderCol}` }}>
        {[{label:"Prénom et nom du client",value:name,set:setName,ph:"Jean Dupont"},{label:"Montant (€)",value:amount,set:setAmount,ph:"178"},{label:"N° commande (optionnel)",value:order,set:setOrder,ph:"QS-4521"}].map(f=>(
          <div key={f.label} style={{ marginBottom:"16px" }}>
            <label style={{ display:"block",fontSize:"10px",fontWeight:600,color:TM,letterSpacing:"1px",textTransform:"uppercase",marginBottom:"6px" }}>{f.label}</label>
            <input value={f.value} onChange={e=>f.set(e.target.value)} placeholder={f.ph}
              style={{ width:"100%",padding:"11px 14px",background:dark?"#222":BGS,border:`1px solid ${borderCol}`,borderRadius:"8px",fontSize:"14px",color:textCol,outline:"none",fontFamily:FF }}
              onFocus={e=>e.target.style.borderColor=GREEN}
              onBlur={e=>e.target.style.borderColor=borderCol}/>
          </div>
        ))}
        <div style={{ display:"flex",gap:"8px",marginTop:"8px" }}>
          <button onClick={gen} className="bp" style={{ flex:1,padding:"13px",background:GREEN,color:"#fff",border:"none",borderRadius:"10px",fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:FF }}>Générer le lien</button>
          <button onClick={()=>{ if(name&&amount)setPreview({name,amount,order}); }} className="bp" style={{ padding:"13px 16px",background:dark?"#222":BGS,color:textCol,border:`1px solid ${borderCol}`,borderRadius:"10px",fontSize:"13px",fontWeight:600,cursor:"pointer",fontFamily:FF }}>Aperçu</button>
        </div>
        {link&&(
          <div style={{ marginTop:"20px",padding:"16px",background:dark?"#142018":GL,borderRadius:"10px" }}>
            <div style={{ fontSize:"10px",fontWeight:600,color:GD,letterSpacing:"1px",textTransform:"uppercase",marginBottom:"8px" }}>Lien généré</div>
            <div style={{ fontSize:"11.5px",color:textCol,wordBreak:"break-all",background:dark?"#1a1a1a":BG,borderRadius:"6px",padding:"8px 10px",marginBottom:"10px",fontFamily:"monospace" }}>{link}</div>
            <div style={{ display:"flex",gap:"8px",flexWrap:"wrap" }}>
              <CopyBtn text={link} label="Copier le lien"/>
              <button onClick={()=>{ const t=`Bonjour ${name} !\n\nMerci pour votre commande Quattro Shopping.\n\nCliquez ici pour finaliser votre paiement :\n${link}\n\nN'hésitez pas à nous contacter si besoin. 🙏`;window.open(`https://wa.me/?text=${encodeURIComponent(t)}`,"_blank"); }} className="bp" style={{ background:"#25D366",color:"#fff",border:"none",borderRadius:"8px",padding:"7px 14px",fontSize:"11px",fontWeight:700,cursor:"pointer",fontFamily:FF }}>
                Envoyer via WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const dark = useDark();
  const [pw,setPw]=useState(""),[error,setError]=useState(false);
  const go=()=>{ if(pw==="eren")onLogin(); else{setError(true);setTimeout(()=>setError(false),1500);} };
  return(
    <div style={{ minHeight:"100vh",background:dark?"#0f0f0f":BGS,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px",fontFamily:FF }}>
      <div style={{ textAlign:"center",marginBottom:"28px",animation:"fadeUp .5s ease" }}>
        <div style={{ fontSize:"11px",fontWeight:800,letterSpacing:"5px",color:dark?"#f0f0f0":TX,fontFamily:PP }}>QUATTRO</div>
        <div style={{ fontSize:"12px",color:GREEN,marginTop:"5px",letterSpacing:"1.5px" }}>Espace administration</div>
      </div>
      <div style={{ background:dark?"#1a1a1a":BG,borderRadius:"14px",padding:"28px",width:"100%",maxWidth:"340px",border:`1px solid ${dark?"#2a2a2a":BO}` }}>
        <div style={{ fontSize:"10px",fontWeight:600,color:TM,letterSpacing:"1px",textTransform:"uppercase",marginBottom:"8px" }}>Mot de passe</div>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}
          placeholder="••••••" autoFocus
          style={{ width:"100%",padding:"12px 14px",background:dark?"#222":BGS,border:`1px solid ${error?"#E24B4A":(dark?"#2a2a2a":BO)}`,borderRadius:"8px",fontSize:"16px",color:dark?"#f0f0f0":TX,outline:"none",marginBottom:"12px",fontFamily:FF,transition:"border-color .2s" }}/>
        {error&&<div style={{ fontSize:"11px",color:"#E24B4A",marginBottom:"10px",animation:"fadeR .3s ease" }}>Mot de passe incorrect</div>}
        <button onClick={go} className="bp" style={{ width:"100%",padding:"13px",background:GREEN,color:"#fff",border:"none",borderRadius:"10px",fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:FF }}>Accéder</button>
      </div>
    </div>
  );
}

export default function App() {
  const [auth,setAuth]=useState(false);
  const p=new URLSearchParams(window.location.search);
  const name=p.get("name"),amount=p.get("amount"),order=p.get("order");
  if(name&&amount)return <PaymentPage data={{name,amount,order:order||""}}/>;
  if(!auth)return <LoginScreen onLogin={()=>setAuth(true)}/>;
  return <AdminPanel/>;
}
