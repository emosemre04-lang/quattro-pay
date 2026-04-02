import { useState, useEffect, useRef } from “react”;
import “./App.css”;

// zoom lock — runs once at load
(function() {
const vp = document.querySelector(‘meta[name=“viewport”]’);
if (vp) vp.content = “width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no”;
else {
const m = document.createElement(“meta”);
m.name = “viewport”;
m.content = “width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no”;
document.head.appendChild(m);
}
})();

const GREEN = “#4A7C59”;
const GL = “#E8F0EB”;
const GD = “#3A6347”;
const BG = “#FFFFFF”;
const BGS = “#F7F6F3”;
const TX = “#1A1A1A”;
const TM = “#555555”;
const TL = “#999999”;
const BO = “#E5E2DC”;
const FF = “‘DM Sans’, sans-serif”;

function bizDate(n) {
const r = new Date(); let a = 0;
while (a < n) { r.setDate(r.getDate() + 1); if (r.getDay() !== 0 && r.getDay() !== 6) a++; }
return r;
}
function fmtD(d) { return d.toLocaleDateString(“fr-FR”, { day: “numeric”, month: “long” }); }
function getDelivery() { return `${fmtD(bizDate(3))} – ${fmtD(bizDate(5))}`; }
function getReserve() {
const d = new Date(); d.setDate(d.getDate() + 2);
return d.toLocaleDateString(“fr-FR”, { weekday: “long”, day: “numeric”, month: “long” });
}

function useScrollPct() {
const [p, setP] = useState(0);
useEffect(() => {
const h = () => {
const t = document.documentElement.scrollHeight - window.innerHeight;
setP(t > 0 ? Math.min(100, Math.round(window.scrollY / t * 100)) : 0);
};
window.addEventListener(“scroll”, h, { passive: true });
return () => window.removeEventListener(“scroll”, h);
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
if (r > 0.2 && !entered) { setEntered(true); fire(); }
if (r > 0.5 && prev.current <= 0.5) fire();
prev.current = r; setRatio(r);
}, { threshold: [0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1] });
obs.observe(el);
return () => obs.disconnect();
}, [ref, entered]);
return { ratio, entered, just };
}

function useActiveStep() {
const [a, setA] = useState(0);
useEffect(() => {
const ids = [“s1”,“s2”,“s3”,“s4”,“s5”,“s6”];
const h = () => {
let f = 0;
ids.forEach((id, i) => {
const el = document.getElementById(id);
if (el && el.getBoundingClientRect().top < window.innerHeight * 0.65) f = i + 1;
});
setA(f);
};
window.addEventListener(“scroll”, h, { passive: true });
return () => window.removeEventListener(“scroll”, h);
}, []);
return a;
}

function useCountdown() {
const s = useRef(Date.now());
const [r, setR] = useState(48 * 3600);
useEffect(() => {
const iv = setInterval(() => setR(Math.max(0, 48 * 3600 - Math.floor((Date.now() - s.current) / 1000))), 1000);
return () => clearInterval(iv);
}, []);
return [Math.floor(r / 3600), Math.floor((r % 3600) / 60), r % 60].map(x => String(x).padStart(2, “0”)).join(”:”);
}

function Counter({ target, dur = 2000 }) {
const [v, setV] = useState(0), ref = useRef(null), st = useRef(false), [vis, setVis] = useState(false);
useEffect(() => {
const el = ref.current; if (!el) return;
const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); o.disconnect(); } });
o.observe(el); return () => o.disconnect();
}, []);
useEffect(() => {
if (!vis || st.current) return; st.current = true;
const s = performance.now();
const t = n => { const p = Math.min(1, (n - s) / dur); setV(Math.round((1 - Math.pow(1 - p, 3)) * target)); if (p < 1) requestAnimationFrame(t); };
requestAnimationFrame(t);
}, [vis, target, dur]);
return <span ref={ref} style={v === target ? { animation: “countPulse .4s ease” } : {}}>{v}</span>;
}

function SlotAmt({ amount }) {
const [d, setD] = useState(”—”), [done, setDone] = useState(false), ref = useRef(null), ran = useRef(false);
useEffect(() => {
const el = ref.current; if (!el) return;
const o = new IntersectionObserver(([e]) => {
if (e.isIntersecting && !ran.current) {
ran.current = true; let c = 0;
const iv = setInterval(() => {
setD(String(amount).split(””).map(() => String(Math.floor(Math.random() * 10))).join(””));
if (++c > 14) { clearInterval(iv); setD(String(amount)); setDone(true); }
}, 55);
}
});
o.observe(el); return () => o.disconnect();
}, [amount]);
return <span ref={ref} style={{ fontVariantNumeric: “tabular-nums”, color: done ? TX : GREEN, transition: “color .3s” }}>{d}</span>;
}

function CopyBtn({ text, label, onCopied }) {
const [copied, setCopied] = useState(false), [glow, setGlow] = useState(false), [sc, setSc] = useState(null);
const chars = “ABCDEFabcdef0123456789@#$”;
const go = async () => {
try { await navigator.clipboard.writeText(text); } catch {
const t = document.createElement(“textarea”); t.value = text;
document.body.appendChild(t); t.select(); document.execCommand(“copy”); document.body.removeChild(t);
}
let c = 0; const orig = label || “Copier”;
const iv = setInterval(() => {
setSc(orig.split(””).map(() => chars[Math.floor(Math.random() * chars.length)]).join(””).slice(0, orig.length));
if (++c > 7) { clearInterval(iv); setSc(null); }
}, 40);
setCopied(true); setGlow(true);
setTimeout(() => setCopied(false), 2500);
setTimeout(() => setGlow(false), 1000);
if (onCopied) setTimeout(onCopied, 300);
};
return (
<button onClick={go} className=“bp” style={{ background: copied ? GREEN : “transparent”, color: copied ? “#fff” : GREEN, border: `1.5px solid ${GREEN}`, borderRadius: “8px”, padding: “7px 14px”, fontSize: “11px”, fontWeight: 700, cursor: “pointer”, letterSpacing: “.5px”, whiteSpace: “nowrap”, flexShrink: 0, boxShadow: glow ? “0 0 18px 4px rgba(74,124,89,.3)” : “none”, transition: “background .2s,color .2s,box-shadow .4s”, fontFamily: FF }}>
{copied ? “✓ Copié” : (sc || label || “Copier”)}
</button>
);
}

function CopyRow({ label, sublabel, value, copyValue, large, onCopied, isSlot, amount }) {
const [badge, setBadge] = useState(false), [pulse, setPulse] = useState(false);
const handle = () => {
setBadge(true); setPulse(true);
setTimeout(() => setBadge(false), 2800);
setTimeout(() => setPulse(false), 600);
if (onCopied) onCopied();
};
return (
<div>
<div style={{ background: BGS, borderRadius: “10px”, padding: large ? “16px” : “13px 14px”, display: “flex”, alignItems: “center”, justifyContent: “space-between”, gap: “10px”, animation: pulse ? “cardPulse .6s ease” : “none” }}>
<div style={{ minWidth: 0 }}>
{label && <div style={{ fontSize: “10px”, color: TL, fontWeight: 500, letterSpacing: “1px”, textTransform: “uppercase”, marginBottom: “3px” }}>{label}</div>}
<div style={{ fontSize: large ? “26px” : “15px”, fontWeight: large ? 700 : 600, color: TX, fontFamily: FF, letterSpacing: large ? “-0.5px” : “0” }}>
{isSlot ? <><SlotAmt amount={amount} />€</> : value}
</div>
{sublabel && <div style={{ fontSize: “11px”, color: TL, marginTop: “3px”, lineHeight: “1.4” }}>{sublabel}</div>}
</div>
<CopyBtn text={copyValue || value} label=“Copier” onCopied={handle} />
</div>
{badge && (
<div style={{ marginTop: “6px”, padding: “7px 12px”, background: GL, borderRadius: “8px”, border: `1px solid ${GREEN}40`, display: “flex”, alignItems: “center”, gap: “6px”, animation: “fadeR .3s ease” }}>
<span style={{ fontSize: “13px” }}>✅</span>
<span style={{ fontSize: “11.5px”, color: GD, fontWeight: 600, fontFamily: FF }}>{label ? `${label} enregistré` : “Copié”} — passez à l’étape suivante</span>
</div>
)}
</div>
);
}

function AltNames({ names }) {
return (
<div style={{ display: “flex”, flexWrap: “wrap”, gap: “5px”, marginBottom: “10px” }}>
{names.map(n => <span key={n} style={{ padding: “4px 10px”, borderRadius: “6px”, background: BGS, border: `1px solid ${BO}`, fontSize: “11px”, color: TM, fontFamily: FF }}>{n}</span>)}
</div>
);
}

function Tip({ text, icon }) {
return (
<div style={{ display: “flex”, alignItems: “flex-start”, gap: “8px”, padding: “10px 12px”, background: “#FFFBF0”, borderRadius: “8px”, marginTop: “10px”, border: “1px solid #F0E6C8” }}>
<span style={{ fontSize: “13px”, flexShrink: 0 }}>{icon || “💡”}</span>
<span style={{ fontSize: “11.5px”, color: “#8B7230”, lineHeight: “1.5”, fontFamily: FF }}>{text}</span>
</div>
);
}

function GlitchLabel({ n, active }) {
const [g, setG] = useState(false), ran = useRef(false);
useEffect(() => { if (active && !ran.current) { ran.current = true; setG(true); setTimeout(() => setG(false), 500); } }, [active]);
const txt = `Étape ${n}`;
return (
<span style={{ fontSize: “10px”, fontWeight: 600, color: GREEN, letterSpacing: “1.5px”, textTransform: “uppercase”, fontFamily: FF, position: “relative”, display: “inline-block” }}>
{txt}
{g && <>
<span style={{ position: “absolute”, inset: 0, color: “#7EC8A0”, animation: “gc1 .25s steps(1) 2”, pointerEvents: “none” }}>{txt}</span>
<span style={{ position: “absolute”, inset: 0, color: “#E24B4A”, animation: “gc2 .25s steps(1) 2”, pointerEvents: “none” }}>{txt}</span>
</>}
</span>
);
}

function StepCard({ n, icon, iconBg, title, desc, children, highlight, id }) {
const ref = useRef(null);
const { ratio, entered, just } = useVis(ref);
const isActive = ratio > 0.5;
const [aura, setAura] = useState(false), [scan, setScan] = useState(false), [ripple, setRipple] = useState(false);
const ran = useRef(false);
useEffect(() => {
if (just && !ran.current) {
ran.current = true;
setAura(true); setScan(true); setRipple(true);
setTimeout(() => setAura(false), 800);
setTimeout(() => setScan(false), 700);
setTimeout(() => setRipple(false), 900);
}
}, [just]);
const opacity = entered ? (0.4 + Math.min(ratio, 1) * 0.6) : 0;
const ty = entered ? 0 : 40;
const sc = entered ? (0.96 + Math.min(ratio, 1) * 0.04) : 0.92;
return (
<div ref={ref} id={id} style={{ background: BG, border: highlight ? `2px solid ${GREEN}` : `1px solid ${isActive ? GREEN + "55" : BO}`, borderRadius: “16px”, overflow: “hidden”, position: “relative”, opacity, transform: `translateY(${ty}px) scale(${sc})`, boxShadow: isActive ? `0 0 0 1.5px ${GREEN}44,0 0 28px 4px rgba(74,124,89,.12),0 4px 20px rgba(0,0,0,.05)` : “0 2px 8px rgba(0,0,0,.04)”, transition: “transform .55s cubic-bezier(.16,1,.3,1),opacity .55s ease,box-shadow .4s ease,border-color .4s ease”, willChange: “transform,opacity” }}>
{aura && <div style={{ position: “absolute”, inset: 0, borderRadius: “16px”, zIndex: 10, pointerEvents: “none”, background: “radial-gradient(ellipse at 50% 30%,rgba(74,124,89,.22) 0%,rgba(126,200,160,.1) 50%,transparent 80%)”, animation: “auraBurst .75s forwards” }} />}
{scan && <div style={{ position: “absolute”, left: 0, right: 0, height: “2px”, zIndex: 11, pointerEvents: “none”, background: “linear-gradient(90deg,transparent,rgba(74,124,89,.7) 30%,rgba(126,200,160,.9) 50%,rgba(74,124,89,.7) 70%,transparent)”, animation: “scanline .6s cubic-bezier(.4,0,.6,1) forwards” }} />}
<div style={{ display: “flex”, alignItems: “center”, gap: “12px”, padding: “16px 18px”, borderBottom: `1px solid ${BO}` }}>
<div style={{ position: “relative”, flexShrink: 0 }}>
{ripple && <>
<div style={{ position: “absolute”, inset: 0, borderRadius: “12px”, background: GL, animation: “rippleOut .8s ease-out forwards”, zIndex: 0 }} />
<div style={{ position: “absolute”, inset: 0, borderRadius: “12px”, background: GL, animation: “rippleOut .8s ease-out .15s forwards”, zIndex: 0 }} />
</>}
<div style={{ width: “42px”, height: “42px”, borderRadius: “12px”, background: iconBg || GL, display: “flex”, alignItems: “center”, justifyContent: “center”, fontSize: “20px”, position: “relative”, zIndex: 1, transform: isActive ? “scale(1.08)” : “scale(1)”, transition: “transform .4s cubic-bezier(.34,1.56,.64,1)” }}>{icon}</div>
</div>
<div style={{ flex: 1 }}>
<GlitchLabel n={n} active={just} />
<div style={{ fontSize: “14px”, fontWeight: 600, color: TX, marginTop: “2px”, lineHeight: “1.3”, fontFamily: FF }}>{title}</div>
</div>
</div>
<div style={{ padding: “16px 18px” }}>
{desc && <p style={{ fontSize: “12.5px”, color: TM, margin: “0 0 12px”, lineHeight: “1.6”, fontFamily: FF }}>{desc}</p>}
{children}
</div>
</div>
);
}

function StepIndicator({ active }) {
if (active === 0) return <div style={{ width: “4px”, height: “4px”, borderRadius: “50%”, background: GREEN }} />;
return (
<div style={{ display: “flex”, alignItems: “center”, gap: “4px” }}>
{[1,2,3,4,5,6].map(i => (
<div key={i} style={{ width: i === active ? “18px” : “5px”, height: “5px”, borderRadius: “3px”, background: i <= active ? GREEN : BO, transition: “all .35s cubic-bezier(.34,1.56,.64,1)”, boxShadow: i === active ? “0 0 6px rgba(74,124,89,.5)” : “none” }} />
))}
<span style={{ fontSize: “10px”, color: GREEN, fontWeight: 700, marginLeft: “4px”, fontFamily: FF }}>{active}/6</span>
</div>
);
}

function AllReadyBanner({ show }) {
if (!show) return null;
return (
<div style={{ padding: “14px 16px”, background: `linear-gradient(135deg,${GL},#d4edd9)`, borderRadius: “14px”, border: `1.5px solid ${GREEN}`, display: “flex”, alignItems: “center”, gap: “12px”, animation: “bannerIn .5s cubic-bezier(.16,1,.3,1)”, boxShadow: “0 4px 20px rgba(74,124,89,.2)” }}>
<span style={{ fontSize: “24px” }}>🎉</span>
<div>
<div style={{ fontSize: “13px”, fontWeight: 700, color: GD, fontFamily: FF }}>Tout est prêt !</div>
<div style={{ fontSize: “11.5px”, color: TM, marginTop: “2px”, fontFamily: FF }}>Confirmez le virement dans votre app, puis envoyez-nous la capture.</div>
</div>
</div>
);
}

function ProgressLine({ total, pct }) {
const p = Math.min(100, pct * 2.2);
return (
<div style={{ position: “absolute”, left: “29px”, top: 0, bottom: 0, width: “2px”, zIndex: 0, pointerEvents: “none” }}>
<div style={{ position: “absolute”, inset: 0, background: BO, borderRadius: “2px” }} />
<div style={{ position: “absolute”, top: 0, left: 0, right: 0, height: `${p}%`, background: `linear-gradient(180deg,${GREEN},#7EC8A0 80%,transparent)`, borderRadius: “2px”, transition: “height .15s linear”, boxShadow: “0 0 8px rgba(74,124,89,.4)” }} />
{Array.from({ length: total }).map((_, i) => {
const pos = (i / (total - 1)) * 100, lit = p >= pos - 5;
return <div key={i} style={{ position: “absolute”, left: “50%”, transform: “translateX(-50%)”, top: `${pos}%`, marginTop: “-5px”, width: lit ? “10px” : “6px”, height: lit ? “10px” : “6px”, borderRadius: “50%”, background: lit ? GREEN : BO, border: `2px solid ${lit ? GD : BO}`, boxShadow: lit ? “0 0 10px rgba(74,124,89,.6)” : “none”, transition: “all .3s ease” }} />;
})}
</div>
);
}

function Particles() {
const pts = [
{ x: 8, y: 20, s: 3, o: .12, a: “drift0”, d: “9s” },
{ x: 88, y: 35, s: 2, o: .09, a: “drift1”, d: “12s” },
{ x: 50, y: 60, s: 4, o: .07, a: “drift2”, d: “15s” },
{ x: 15, y: 75, s: 2.5, o: .10, a: “drift3”, d: “11s” },
{ x: 78, y: 15, s: 3, o: .08, a: “drift4”, d: “13s” },
{ x: 92, y: 80, s: 2, o: .11, a: “drift5”, d: “10s” },
];
return (
<div style={{ position: “fixed”, inset: 0, pointerEvents: “none”, zIndex: 0, overflow: “hidden” }}>
{pts.map((p, i) => <div key={i} style={{ position: “absolute”, left: `${p.x}%`, top: `${p.y}%`, width: `${p.s}px`, height: `${p.s}px`, borderRadius: “50%”, background: GREEN, opacity: p.o, animation: `${p.a} ${p.d} ease-in-out infinite`, animationDelay: `${i * 1.3}s` }} />)}
</div>
);
}

function BankLogos() {
const ref = useRef(null);
const { entered } = useVis(ref);
const banks = [
{ n: “BNP Paribas”, c: “#009A44” }, { n: “Boursorama”, c: “#FF6600” }, { n: “N26”, c: “#3DBBDB” },
{ n: “Revolut”, c: “#191C1F” }, { n: “CIC”, c: “#E30613” }, { n: “Société Générale”, c: “#E60026” },
{ n: “Crédit Agricole”, c: “#007A33” }, { n: “La Banque Postale”, c: “#003DA5” }, { n: “LCL”, c: “#EE2E24” },
{ n: “Crédit Mutuel”, c: “#005DA2” }, { n: “ING”, c: “#FF6200” }, { n: “Wise”, c: “#9FE870”, t: “#1A1A1A” },
{ n: “Belfius”, c: “#C8007B” }, { n: “KBC”, c: “#00A3E0” },
];
return (
<div ref={ref} style={{ display: “flex”, flexWrap: “wrap”, gap: “5px” }}>
{banks.map((b, i) => <span key={b.n} style={{ padding: “4px 9px”, borderRadius: “5px”, background: b.c, color: b.t || “#fff”, fontSize: “9.5px”, fontWeight: 600, fontFamily: FF, opacity: entered ? 1 : 0, transform: entered ? “translateY(0) scale(1)” : “translateY(8px) scale(0.9)”, transition: `all .4s cubic-bezier(.34,1.56,.64,1) ${i * 50}ms` }}>{b.n}</span>)}
<span style={{ padding: “4px 9px”, borderRadius: “5px”, background: BGS, color: TL, fontSize: “9.5px”, fontFamily: FF }}>+ autres</span>
</div>
);
}

function WhyAccordion() {
const [open, setOpen] = useState(false);
return (
<div style={{ borderRadius: “12px”, overflow: “hidden”, border: `1px solid ${BO}` }}>
<button onClick={() => setOpen(!open)} className=“bp” style={{ width: “100%”, padding: “14px 16px”, background: BG, border: “none”, cursor: “pointer”, display: “flex”, justifyContent: “space-between”, alignItems: “center”, fontSize: “12.5px”, fontWeight: 600, color: TX, fontFamily: FF }}>
<span>Pourquoi le virement bancaire ?</span>
<span style={{ transition: “transform .3s”, transform: open ? “rotate(180deg)” : “rotate(0deg)”, color: TL }}>▾</span>
</button>
<div style={{ maxHeight: open ? “180px” : “0”, overflow: “hidden”, transition: “max-height .4s cubic-bezier(.16,1,.3,1)” }}>
<p style={{ fontSize: “12.5px”, color: TM, lineHeight: “1.7”, margin: 0, padding: “0 16px 16px”, fontFamily: FF }}>
Quattro Shopping est une boutique européenne indépendante. Le virement SEPA est le moyen de paiement le plus sécurisé et le plus direct — sans intermédiaire, sans frais cachés. Vos données bancaires ne transitent jamais sur notre site.
</p>
</div>
</div>
);
}

function Reviews() {
const rs = [
{ n: “Yacine B.”, t: “Reçu en 4 jours, qualité propre. Merci pour le petit cadeau dans le colis.”, w: “il y a 3 jours” },
{ n: “Mehdi L.”, t: “Deuxième commande, toujours carré. Service client rapide sur WhatsApp.”, w: “il y a 1 semaine” },
{ n: “Rayane D.”, t: “Article conforme aux photos. Matière bien épaisse. Ça vaut le prix.”, w: “il y a 2 semaines” },
];
const [i, setI] = useState(0), ref = useRef(null);
const { entered } = useVis(ref);
useEffect(() => { if (!entered) return; const t = setInterval(() => setI(x => (x + 1) % rs.length), 3500); return () => clearInterval(t); }, [entered]);
const r = rs[i];
return (
<div ref={ref} style={{ padding: “16px 18px”, background: BG, border: `1px solid ${BO}`, borderRadius: “14px” }}>
<div style={{ display: “flex”, alignItems: “center”, gap: “6px”, marginBottom: “8px” }}>
<span style={{ color: “#F5A623”, fontSize: “11px”, letterSpacing: “1px” }}>★★★★★</span>
<span style={{ fontSize: “10px”, color: TL, fontWeight: 500, letterSpacing: “.5px”, fontFamily: FF }}>AVIS VÉRIFIÉ</span>
</div>
<div key={i} style={{ animation: “fadeR .4s ease” }}>
<p style={{ fontSize: “12.5px”, color: TM, lineHeight: “1.6”, margin: “0 0 6px”, fontFamily: FF }}>”{r.t}”</p>
<div style={{ display: “flex”, justifyContent: “space-between” }}>
<span style={{ fontSize: “11px”, fontWeight: 600, color: TX, fontFamily: FF }}>{r.n}</span>
<span style={{ fontSize: “10px”, color: TL, fontFamily: FF }}>{r.w}</span>
</div>
</div>
<div style={{ display: “flex”, gap: “4px”, justifyContent: “center”, marginTop: “10px” }}>
{rs.map((_, j) => <div key={j} style={{ width: j === i ? “14px” : “5px”, height: “5px”, borderRadius: “3px”, background: j === i ? GREEN : BO, transition: “width .3s ease,background .3s ease” }} />)}
</div>
</div>
);
}

function Confetti({ show }) {
if (!show) return null;
const cols = [GREEN, “#F5A623”, “#25D366”, “#E24B4A”, “#85B7EB”, “#D4BC8B”];
return (
<div style={{ position: “fixed”, inset: 0, pointerEvents: “none”, zIndex: 9999 }}>
{Array.from({ length: 40 }).map((_, i) => (
<div key={i} style={{ position: “absolute”, left: `${10 + Math.random() * 80}%`, top: `${40 + Math.random() * 40}%`, width: `${5 + Math.random() * 8}px`, height: `${5 + Math.random() * 8}px`, borderRadius: Math.random() > 0.5 ? “50%” : “2px”, background: cols[i % cols.length], animation: `confettiFall ${0.8 + Math.random()}s ease-out forwards`, animationDelay: `${Math.random() * 0.4}s` }} />
))}
</div>
);
}

function WaIcon() {
return (
<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
<path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.118 1.523 5.854L0 24l6.324-1.501A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.886 0-3.65-.493-5.177-1.355l-.371-.22-3.754.891.924-3.638-.242-.381A9.946 9.946 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
</svg>
);
}

function WaIconLg() {
return (
<svg width="26" height="26" viewBox="0 0 24 24" fill="#fff">
<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
<path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.118 1.523 5.854L0 24l6.324-1.501A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.886 0-3.65-.493-5.177-1.355l-.371-.22-3.754.891.924-3.638-.242-.381A9.946 9.946 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
</svg>
);
}

function PaymentPage({ data }) {
const [show, setShow] = useState(false);
const [confetti, setConfetti] = useState(false);
const pct = useScrollPct();
const activeStep = useActiveStep();
const countdown = useCountdown();
const [cIban, setCIban] = useState(false);
const [cAmt, setCamt] = useState(false);
const [cRef, setCref] = useState(false);
const allReady = cIban && cAmt && cRef;

useEffect(() => { setTimeout(() => setShow(true), 50); }, []);

const warmth = Math.min(1, pct / 80);
const bg = `rgb(${Math.round(247 + warmth * 4)},${Math.round(246 + warmth * 2)},${Math.round(243 - warmth * 6)})`;

const scrollTo = (id) => setTimeout(() => {
const el = document.getElementById(id);
if (el) el.scrollIntoView({ behavior: “smooth”, block: “center” });
}, 400);

const waText = `Bonjour, j'ai effectué mon virement de ${data.amount}€ pour ma commande${data.order ? ` #${data.order}` : ""}. Voici ma capture.`;
const waLink = `https://wa.me/447365758255?text=${encodeURIComponent(waText)}`;
const handleWa = (e) => {
e.preventDefault(); setConfetti(true);
setTimeout(() => { setConfetti(false); window.open(waLink, “_blank”); }, 600);
};

return (
<div style={{ minHeight: “100vh”, background: bg, fontFamily: FF, opacity: show ? 1 : 0, transition: “opacity .5s ease,background .3s ease”, position: “relative” }}>
<Particles />
<Confetti show={confetti} />
<div style={{ position: “fixed”, top: 0, left: 0, width: “100%”, height: “3px”, zIndex: 100 }}>
<div style={{ height: “100%”, width: `${pct}%`, background: `linear-gradient(90deg,${GREEN},#7EC8A0)`, transition: “width .1s linear”, borderRadius: “0 2px 2px 0” }} />
</div>
<div style={{ position: “sticky”, top: “3px”, zIndex: 90, backdropFilter: “blur(20px)”, background: “rgba(255,255,255,.88)”, borderBottom: `1px solid ${BO}` }}>
<div style={{ maxWidth: “460px”, margin: “0 auto”, padding: “12px 16px”, display: “flex”, alignItems: “center”, justifyContent: “space-between” }}>
<div style={{ fontSize: “10px”, fontWeight: 800, letterSpacing: “4px”, color: TX }}>QUATTRO</div>
<StepIndicator active={activeStep} />
<div style={{ fontSize: “10px”, color: GREEN, fontWeight: 600, letterSpacing: “1px” }}>PAIEMENT SÉCURISÉ</div>
</div>
</div>
<div style={{ display: “flex”, flexDirection: “column”, alignItems: “center”, padding: “20px 16px 40px”, position: “relative”, zIndex: 1 }}>
<div style={{ width: “100%”, maxWidth: “460px” }}>
<div style={{ background: BG, border: `1px solid ${BO}`, borderRadius: “16px”, padding: “20px 18px”, marginBottom: “16px” }}>
<p style={{ fontSize: “16px”, color: TX, margin: “0 0 4px”, fontWeight: 700 }}>Bonjour {data.name} 👋</p>
<p style={{ fontSize: “13px”, color: TM, margin: “0 0 18px”, lineHeight: “1.6” }}>Voici votre page de paiement personnalisée. Suivez les étapes ci-dessous pour finaliser votre commande.</p>
<div style={{ display: “flex”, flexWrap: “wrap”, gap: “6px”, marginBottom: “14px” }}>
<span style={{ display: “flex”, alignItems: “center”, gap: “5px”, padding: “5px 10px”, borderRadius: “20px”, background: GL, fontSize: “11px”, color: GD, fontWeight: 600 }}>
<span style={{ fontSize: “12px”, animation: “pulseLock 2.5s ease infinite” }}>🔒</span> Paiement sécurisé
</span>
<span style={{ display: “flex”, alignItems: “center”, gap: “5px”, padding: “5px 10px”, borderRadius: “20px”, background: GL, fontSize: “11px”, color: GD, fontWeight: 600 }}>
<span style={{ fontSize: “12px” }}>🏢</span>Entreprise européenne
</span>
<span style={{ display: “flex”, alignItems: “center”, gap: “5px”, padding: “5px 10px”, borderRadius: “20px”, background: GL, fontSize: “11px”, color: GD, fontWeight: 600 }}>
<span style={{ fontSize: “12px” }}>✓</span>+<Counter target={4000} /> clients
</span>
</div>
<div style={{ display: “flex”, flexDirection: “column”, gap: “8px” }}>
<div style={{ display: “flex”, alignItems: “center”, gap: “10px”, padding: “12px 14px”, background: GL, borderRadius: “10px” }}>
<span style={{ fontSize: “20px” }}>📦</span>
<div>
<div style={{ fontSize: “12px”, color: GD, fontWeight: 600 }}>Livraison estimée</div>
<div style={{ fontSize: “14px”, color: GREEN, fontWeight: 600, marginTop: “1px” }}>{getDelivery()}</div>
<div style={{ fontSize: “10.5px”, color: TL, marginTop: “2px” }}>Suivi UPS/FedEx sous 48h après expédition</div>
</div>
</div>
<div style={{ display: “flex”, alignItems: “center”, justifyContent: “space-between”, padding: “10px 14px”, background: “#FFFBF0”, borderRadius: “10px”, border: “1px solid #F0E6C8” }}>
<div style={{ display: “flex”, alignItems: “center”, gap: “8px” }}>
<span style={{ fontSize: “14px” }}>⏳</span>
<span style={{ fontSize: “11.5px”, color: “#8B7230”, lineHeight: “1.4” }}>Réservé jusqu’au {getReserve()}</span>
</div>
<div style={{ fontFamily: “monospace”, fontSize: “13px”, fontWeight: 700, color: “#8B7230”, background: “#F0E6C8”, padding: “3px 8px”, borderRadius: “6px”, letterSpacing: “1px” }}>{countdown}</div>
</div>
</div>
</div>
<div style={{ textAlign: “center”, margin: “12px 0 28px”, animation: “fadeUp .8s cubic-bezier(.16,1,.3,1)” }}>
<div style={{ display: “flex”, alignItems: “center”, gap: “14px”, justifyContent: “center” }}>
<div style={{ height: “2px”, flex: 1, background: `linear-gradient(90deg,transparent,${BO})` }} />
<div>
<div style={{ fontSize: “30px”, fontWeight: 900, color: TX, fontFamily: FF, letterSpacing: “-1px” }}>6 étapes simples</div>
<div style={{ fontSize: “12px”, color: TL, marginTop: “8px”, letterSpacing: “2px”, textTransform: “uppercase” }}>pour finaliser votre commande</div>
</div>
<div style={{ height: “2px”, flex: 1, background: `linear-gradient(90deg,${BO},transparent)` }} />
</div>
</div>
<div style={{ position: “relative” }}>
<ProgressLine total={6} pct={pct} />
<div style={{ display: “flex”, flexDirection: “column”, gap: “16px” }}>
<StepCard n={1} icon="🏦" iconBg="#E3F1E8" title="Ouvrez votre application bancaire" id="s1" desc="Ouvrez l'app de votre banque et cherchez le bouton pour faire un virement SEPA.">
<AltNames names={[“Virement”, “Envoyer de l’argent”, “Nouveau transfert”]} />
<Tip text="Le nom du bouton change selon la banque (BNP, Boursorama, N26, Revolut…)" />
</StepCard>
<StepCard n={2} icon="🔢" iconBg="#E6F0FA" title="Copiez et collez l'IBAN" id="s2" desc="C'est le numéro du compte vers lequel vous envoyez l'argent.">
<CopyRow label=“IBAN” value=“LU80 4080 0000 4547 7817” copyValue=“LU80408000004547817” onCopied={() => { setCIban(true); scrollTo(“s3”); }} />
<Tip icon="🇱🇺" text="Si votre banque demande un pays, sélectionnez Luxembourg — c'est là où le compte est domicilié." />
</StepCard>
<StepCard n={3} icon="👤" iconBg="#F3EDE4" title="Entrez le nom du destinataire" id="s3" desc="Ce champ peut s'appeler :">
<AltNames names={[“Bénéficiaire”, “Destinataire”, “Nom du compte”, “Titulaire”]} />
<CopyRow label=“Nom à entrer” value=“Quattro Visual Ltd” sublabel=“Entreprise enregistrée au Royaume-Uni” onCopied={() => scrollTo(“s4”)} />
</StepCard>
<StepCard n={4} icon="💶" iconBg="#E8F0EB" title="Entrez le montant exact" id="s4" desc="Vérifiez bien que la devise est en euros (€).">
<CopyRow isSlot amount={data.amount} value={`${data.amount}€`} copyValue={String(data.amount)} large onCopied={() => { setCamt(true); scrollTo(“s5”); }} />
</StepCard>
<StepCard n={5} icon="✏️" iconBg="#F0EDE6" title="En référence, mettez votre nom" id="s5" desc="Ce champ peut s'appeler :">
<AltNames names={[“Référence”, “Communication”, “Motif”, “Message”]} />
<CopyRow label=“Référence” value={data.name} onCopied={() => { setCref(true); scrollTo(“s6”); }} />
<Tip text="Si votre banque ne demande pas de référence, passez directement à l'étape suivante." />
</StepCard>
<AllReadyBanner show={allReady} />
<StepCard n={6} icon="✅" iconBg={GL} title="Confirmez et envoyez-nous la capture" id="s6" highlight desc="Appuyez sur Confirmer dans votre app, puis envoyez-nous la capture sur WhatsApp.">
<div style={{ display: “flex”, alignItems: “center”, gap: “8px”, fontSize: “11.5px”, color: TM, marginBottom: “12px” }}>
<span style={{ fontSize: “15px” }}>📬</span>
<span>Votre commande sera préparée dès réception.</span>
</div>
<a href={waLink} onClick={handleWa} className=“bp” style={{ display: “flex”, alignItems: “center”, justifyContent: “center”, gap: “8px”, background: “#25D366”, color: “#fff”, borderRadius: “12px”, padding: “14px”, fontSize: “14px”, fontWeight: 700, textDecoration: “none”, fontFamily: FF }}>
<WaIcon /> Envoyer la capture sur WhatsApp
</a>
</StepCard>
</div>
</div>
<div style={{ marginTop: “18px”, padding: “16px 18px”, background: BG, border: `1px solid ${BO}`, borderRadius: “14px” }}>
<div style={{ fontSize: “10px”, fontWeight: 600, letterSpacing: “2px”, color: TL, textTransform: “uppercase”, marginBottom: “10px” }}>Compatible avec toutes les banques</div>
<BankLogos />
</div>
<div style={{ display: “flex”, flexDirection: “column”, gap: “12px”, marginTop: “14px” }}>
<WhyAccordion />
<Reviews />
<div style={{ marginTop: “14px”, padding: “18px”, background: BG, border: `1px solid ${BO}`, borderRadius: “14px” }}>
<div style={{ fontSize: “10px”, fontWeight: 600, letterSpacing: “2px”, color: TL, textTransform: “uppercase”, marginBottom: “12px” }}>Nous suivre</div>
<div style={{ display: “flex”, flexDirection: “column”, gap: “6px” }}>
{[{ icon: “📸”, p: “Instagram”, h: “@quattro.shopping”, url: “https://instagram.com/quattro.shopping” }, { icon: “🎵”, p: “TikTok”, h: “@quattroshopping”, url: “https://tiktok.com/@quattroshopping” }].map(s => (
<a key={s.p} href={s.url} target=”_blank” rel=“noopener noreferrer” className=“bp” style={{ display: “flex”, alignItems: “center”, justifyContent: “space-between”, padding: “10px 12px”, background: BGS, borderRadius: “10px”, textDecoration: “none” }}>
<div style={{ display: “flex”, alignItems: “center”, gap: “9px” }}><span style={{ fontSize: “16px” }}>{s.icon}</span><span style={{ fontSize: “12px”, color: TX, fontWeight: 600 }}>{s.p}</span></div>
<span style={{ fontSize: “11.5px”, color: GREEN }}>{s.h}</span>
</a>
))}
<div style={{ display: “flex”, alignItems: “center”, justifyContent: “space-between”, padding: “10px 12px”, background: BGS, borderRadius: “10px” }}>
<div style={{ display: “flex”, alignItems: “center”, gap: “9px” }}><span style={{ fontSize: “16px” }}>🌐</span><span style={{ fontSize: “12px”, color: TX, fontWeight: 600 }}>Site</span></div>
<span style={{ fontSize: “11.5px”, color: GREEN }}>quattroshopping.com</span>
</div>
</div>
</div>
</div>
<div style={{ textAlign: “center”, marginTop: “24px”, paddingBottom: “16px” }}>
<div style={{ fontSize: “10px”, fontWeight: 800, letterSpacing: “4px”, color: TX, marginBottom: “4px” }}>QUATTRO</div>
<div style={{ fontSize: “11px”, color: TL }}>depuis 2021 · Merci pour votre confiance</div>
<a href=“https://quattroshopping.com” style={{ fontSize: “11px”, color: GREEN, textDecoration: “none” }}>quattroshopping.com</a>
</div>
</div>
</div>
<a href={waLink} onClick={handleWa} className=“bp” style={{ position: “fixed”, bottom: “24px”, right: “20px”, zIndex: 50, width: “56px”, height: “56px”, borderRadius: “50%”, background: “#25D366”, display: “flex”, alignItems: “center”, justifyContent: “center”, boxShadow: “0 4px 20px rgba(37,211,102,.4)”, textDecoration: “none”, cursor: “pointer”, animation: “floatBounce 3s ease-in-out infinite” }}>
<WaIconLg />
</a>
</div>
);
}

function AdminPanel() {
const [name, setName] = useState(””), [amount, setAmount] = useState(””), [order, setOrder] = useState(””), [link, setLink] = useState(””), [preview, setPreview] = useState(null);
const BASE = window.location.origin + window.location.pathname;
const gen = () => {
if (!name || !amount) return;
const p = new URLSearchParams();
p.set(“name”, name); p.set(“amount”, amount);
if (order) p.set(“order”, order);
setLink(`${BASE}?${p.toString()}`);
};
if (preview) return (
<div>
<PaymentPage data={preview} />
<button onClick={() => setPreview(null)} className=“bp” style={{ position: “fixed”, top: “60px”, left: “16px”, zIndex: 200, background: TX, color: “#fff”, border: “none”, borderRadius: “8px”, padding: “8px 14px”, fontSize: “12px”, cursor: “pointer”, fontFamily: FF }}>← Retour admin</button>
</div>
);
return (
<div style={{ minHeight: “100vh”, background: BGS, display: “flex”, flexDirection: “column”, alignItems: “center”, padding: “40px 16px”, fontFamily: FF }}>
<div style={{ textAlign: “center”, marginBottom: “28px”, animation: “fadeUp .5s ease” }}>
<div style={{ fontSize: “11px”, fontWeight: 800, letterSpacing: “4px”, color: TX }}>QUATTRO</div>
<div style={{ fontSize: “12px”, color: GREEN, marginTop: “4px”, letterSpacing: “1px” }}>Génération de lien de paiement</div>
</div>
<div style={{ background: BG, borderRadius: “14px”, padding: “28px”, width: “100%”, maxWidth: “400px” }}>
{[{ label: “Prénom et nom du client”, value: name, set: setName, ph: “Jean Dupont” }, { label: “Montant (€)”, value: amount, set: setAmount, ph: “178” }, { label: “N° commande (optionnel)”, value: order, set: setOrder, ph: “QS-4521” }].map(f => (
<div key={f.label} style={{ marginBottom: “16px” }}>
<label style={{ display: “block”, fontSize: “10px”, fontWeight: 600, color: TM, letterSpacing: “1px”, textTransform: “uppercase”, marginBottom: “6px” }}>{f.label}</label>
<input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.ph} style={{ width: “100%”, padding: “11px 14px”, background: BGS, border: `1px solid ${BO}`, borderRadius: “8px”, fontSize: “14px”, color: TX, outline: “none”, fontFamily: FF }} onFocus={e => e.target.style.borderColor = GREEN} onBlur={e => e.target.style.borderColor = BO} />
</div>
))}
<div style={{ display: “flex”, gap: “8px”, marginTop: “8px” }}>
<button onClick={gen} className=“bp” style={{ flex: 1, padding: “13px”, background: GREEN, color: “#fff”, border: “none”, borderRadius: “10px”, fontSize: “13px”, fontWeight: 700, cursor: “pointer”, fontFamily: FF }}>Générer le lien</button>
<button onClick={() => { if (name && amount) setPreview({ name, amount, order }); }} className=“bp” style={{ padding: “13px 16px”, background: BGS, color: TX, border: `1px solid ${BO}`, borderRadius: “10px”, fontSize: “13px”, fontWeight: 600, cursor: “pointer”, fontFamily: FF }}>Aperçu</button>
</div>
{link && (
<div style={{ marginTop: “20px”, padding: “16px”, background: GL, borderRadius: “10px” }}>
<div style={{ fontSize: “10px”, fontWeight: 600, color: GD, letterSpacing: “1px”, textTransform: “uppercase”, marginBottom: “8px” }}>Lien généré</div>
<div style={{ fontSize: “11.5px”, color: TX, wordBreak: “break-all”, background: BG, borderRadius: “6px”, padding: “8px 10px”, marginBottom: “10px”, fontFamily: “monospace” }}>{link}</div>
<div style={{ display: “flex”, gap: “8px”, flexWrap: “wrap” }}>
<CopyBtn text={link} label="Copier le lien" />
<button onClick={() => { const t = `Bonjour ${name} !\n\nMerci pour votre commande Quattro Shopping.\n\nCliquez ici pour finaliser votre paiement :\n${link}\n\nN'hésitez pas à me contacter si besoin. 🙏`; window.open(`https://wa.me/?text=${encodeURIComponent(t)}`, “_blank”); }} className=“bp” style={{ background: “#25D366”, color: “#fff”, border: “none”, borderRadius: “8px”, padding: “7px 14px”, fontSize: “11px”, fontWeight: 700, cursor: “pointer”, fontFamily: FF }}>Envoyer via WhatsApp</button>
</div>
</div>
)}
</div>
</div>
);
}

function LoginScreen({ onLogin }) {
const [pw, setPw] = useState(””), [error, setError] = useState(false);
const go = () => { if (pw === “eren”) onLogin(); else { setError(true); setTimeout(() => setError(false), 1500); } };
return (
<div style={{ minHeight: “100vh”, background: BGS, display: “flex”, flexDirection: “column”, alignItems: “center”, justifyContent: “center”, padding: “24px”, fontFamily: FF }}>
<div style={{ textAlign: “center”, marginBottom: “28px”, animation: “fadeUp .5s ease” }}>
<div style={{ fontSize: “11px”, fontWeight: 800, letterSpacing: “5px”, color: TX }}>QUATTRO</div>
<div style={{ fontSize: “12px”, color: GREEN, marginTop: “5px”, letterSpacing: “1.5px” }}>Espace administration</div>
</div>
<div style={{ background: BG, borderRadius: “14px”, padding: “28px”, width: “100%”, maxWidth: “340px” }}>
<div style={{ fontSize: “10px”, fontWeight: 600, color: TM, letterSpacing: “1px”, textTransform: “uppercase”, marginBottom: “8px” }}>Mot de passe</div>
<input type=“password” value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === “Enter” && go()} placeholder=”••••••” autoFocus style={{ width: “100%”, padding: “12px 14px”, background: BGS, border: `1px solid ${error ? "#E24B4A" : BO}`, borderRadius: “8px”, fontSize: “16px”, color: TX, outline: “none”, marginBottom: “12px”, fontFamily: FF, transition: “border-color .2s” }} />
{error && <div style={{ fontSize: “11px”, color: “#E24B4A”, marginBottom: “10px”, animation: “fadeR .3s ease” }}>Mot de passe incorrect</div>}
<button onClick={go} className=“bp” style={{ width: “100%”, padding: “13px”, background: GREEN, color: “#fff”, border: “none”, borderRadius: “10px”, fontSize: “13px”, fontWeight: 700, cursor: “pointer”, fontFamily: FF }}>Accéder</button>
</div>
</div>
);
}

export default function App() {
const [auth, setAuth] = useState(false);
const p = new URLSearchParams(window.location.search);
const name = p.get(“name”), amount = p.get(“amount”), order = p.get(“order”);
if (name && amount) return <PaymentPage data={{ name, amount, order: order || “” }} />;
if (!auth) return <LoginScreen onLogin={() => setAuth(true)} />;
return <AdminPanel />;
}
