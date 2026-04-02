import { useState, useEffect, useRef, useCallback } from "react";

const GREEN = "#4A7C59";
const GREEN_LIGHT = "#E8F0EB";
const GREEN_DARK = "#3A6347";
const BG = "#FFFFFF";
const BG_SOFT = "#F7F6F3";
const TEXT = "#1A1A1A";
const TEXT_MID = "#555555";
const TEXT_LIGHT = "#999999";
const BORDER = "#E5E2DC";

const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Inter:wght@400;500;600;700;800;900&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

const globalStyle = document.createElement("style");
globalStyle.textContent = `
html{scroll-behavior:smooth}
*{-webkit-tap-highlight-color:transparent}
@keyframes pulseGlow{0%,100%{box-shadow:0 0 0 0 rgba(74,124,89,0)}50%{box-shadow:0 0 0 8px rgba(74,124,89,0.15)}}
@keyframes pulseLock{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeR{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
@keyframes glowCopy{0%{box-shadow:0 0 0 0 rgba(74,124,89,0.4)}50%{box-shadow:0 0 16px 4px rgba(74,124,89,0.25)}100%{box-shadow:0 0 0 0 rgba(74,124,89,0)}}
@keyframes confettiBurst{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-60px) scale(0.5)}}
@keyframes floatIn{from{opacity:0;transform:translateY(12px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes countPulse{0%{transform:scale(1)}50%{transform:scale(1.05)}100%{transform:scale(1)}}
.btn-press:active{transform:scale(0.96)!important;transition:transform 0.1s!important}
`;
document.head.appendChild(globalStyle);

function getDeliveryDates() {
  const now = new Date();
  const addBiz = (d, n) => { const r = new Date(d); let a = 0; while (a < n) { r.setDate(r.getDate() + 1); if (r.getDay() !== 0 && r.getDay() !== 6) a++; } return r; };
  const fmt = (d) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  return `${fmt(addBiz(now, 3))} – ${fmt(addBiz(now, 5))}`;
}

function getReserveDate() {
  const d = new Date(); d.setDate(d.getDate() + 2);
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

function useScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const h = () => {
      const st = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setPct(total > 0 ? Math.min(100, Math.round((st / total) * 100)) : 0);
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return pct;
}

function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function AnimatedCounter({ target, duration = 2000 }) {
  const [val, setVal] = useState(0);
  const [ref, visible] = useScrollReveal();
  const started = useRef(false);
  useEffect(() => {
    if (!visible || started.current) return;
    started.current = true;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [visible, target, duration]);
  return <span ref={ref} style={val === target ? { animation: "countPulse 0.4s ease" } : {}}>{val.toLocaleString("fr-FR")}</span>;
}

function CopyButton({ text, label, onCopied }) {
  const [copied, setCopied] = useState(false);
  const [glow, setGlow] = useState(false);
  const go = async () => {
    try { await navigator.clipboard.writeText(text); } catch {
      const t = document.createElement("textarea"); t.value = text;
      document.body.appendChild(t); t.select(); document.execCommand("copy"); document.body.removeChild(t);
    }
    setCopied(true); setGlow(true);
    setTimeout(() => setCopied(false), 2200);
    setTimeout(() => setGlow(false), 800);
    if (onCopied) setTimeout(onCopied, 400);
  };
  return (
    <button onClick={go} className="btn-press" style={{ background: copied ? GREEN : "transparent", color: copied ? "#fff" : GREEN, border: `1.5px solid ${GREEN}`, padding: "7px 16px", borderRadius: "6px", fontSize: "11px", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer", transition: "all 0.25s ease", whiteSpace: "nowrap", letterSpacing: "0.5px", textTransform: "uppercase", animation: glow ? "glowCopy 0.8s ease" : "none" }}>
      {copied ? "✓ Copié" : (label || "Copier")}
    </button>
  );
}

function CopyRow({ label, sublabel, value, copyValue, large, onCopied }) {
  return (
    <div style={{ background: BG_SOFT, borderRadius: "10px", padding: large ? "16px" : "13px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
      <div style={{ minWidth: 0 }}>
        {label && <div style={{ fontSize: "10px", color: TEXT_LIGHT, fontWeight: 500, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>{label}</div>}
        <div style={{ fontSize: large ? "26px" : "15px", fontWeight: large ? 700 : 600, color: TEXT, fontFamily: large ? "'Cormorant Garamond', serif" : "'DM Sans', sans-serif", letterSpacing: large ? "0" : "0.8px", wordBreak: "break-all" }}>{value}</div>
        {sublabel && <div style={{ fontSize: "11px", color: TEXT_LIGHT, marginTop: "3px", lineHeight: "1.4" }}>{sublabel}</div>}
      </div>
      <CopyButton text={copyValue || value} onCopied={onCopied} />
    </div>
  );
}

function AltNames({ names }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "10px" }}>
      {names.map((n) => (
        <span key={n} style={{ padding: "4px 10px", borderRadius: "6px", background: BG_SOFT, fontSize: "11px", fontWeight: 500, color: TEXT_MID, border: `1px solid ${BORDER}` }}>"{n}"</span>
      ))}
    </div>
  );
}

function StepCard({ n, icon, iconBg, title, desc, children, highlight, id }) {
  const [ref, visible] = useScrollReveal();
  return (
    <div ref={ref} id={id} style={{ background: BG, border: highlight ? `2px solid ${GREEN}` : `1px solid ${BORDER}`, borderRadius: "14px", overflow: "hidden", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 18px", borderBottom: `1px solid ${BORDER}`, background: highlight ? GREEN_LIGHT : BG }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: iconBg || GREEN_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: "10px", fontWeight: 600, color: GREEN, letterSpacing: "1px", textTransform: "uppercase" }}>Étape {n}/6</span>
          <div style={{ fontSize: "14px", fontWeight: 600, color: TEXT, marginTop: "2px", lineHeight: "1.3" }}>{title}</div>
        </div>
      </div>
      <div style={{ padding: "16px 18px" }}>
        {desc && <p style={{ fontSize: "12.5px", color: TEXT_MID, margin: "0 0 12px", lineHeight: "1.65" }}>{desc}</p>}
        {children}
      </div>
    </div>
  );
}

function Tip({ text }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px 12px", background: GREEN_LIGHT, borderRadius: "8px", marginTop: "10px", fontSize: "11.5px", color: GREEN_DARK, lineHeight: "1.55" }}>
      <span style={{ fontSize: "13px", flexShrink: 0 }}>💡</span><span>{text}</span>
    </div>
  );
}

function BankLogos() {
  const [ref, visible] = useScrollReveal();
  const banks = [
    { n: "BNP Paribas", c: "#009A44" }, { n: "Boursorama", c: "#FF6600" }, { n: "N26", c: "#36A18B" },
    { n: "Revolut", c: "#191C1F" }, { n: "CIC", c: "#E30613" }, { n: "Société Générale", c: "#E30016" },
    { n: "Crédit Agricole", c: "#007A33" }, { n: "La Banque Postale", c: "#003DA5" }, { n: "LCL", c: "#002D72" },
    { n: "Crédit Mutuel", c: "#005DA2" }, { n: "ING", c: "#FF6200" }, { n: "Wise", c: "#9FE870", t: "#1A1A1A" },
    { n: "Belfius", c: "#C8007B" }, { n: "KBC", c: "#00A3E0" },
  ];
  return (
    <div ref={ref} style={{ display: "flex", flexWrap: "wrap", gap: "5px", opacity: visible ? 1 : 0, transition: "opacity 0.6s ease" }}>
      {banks.map((b, i) => (<span key={b.n} style={{ padding: "4px 9px", borderRadius: "5px", background: b.c, color: b.t || "#fff", fontSize: "9.5px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(8px)", transition: `all 0.4s ease ${i * 40}ms` }}>{b.n}</span>))}
      <span style={{ padding: "4px 9px", borderRadius: "5px", background: BG_SOFT, color: TEXT_LIGHT, fontSize: "9.5px", fontWeight: 500, border: `1px solid ${BORDER}` }}>+ toute banque SEPA</span>
    </div>
  );
}

function WhyAccordion() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderRadius: "12px", overflow: "hidden", border: `1px solid ${BORDER}` }}>
      <button onClick={() => setOpen(!open)} className="btn-press" style={{ width: "100%", padding: "13px 16px", background: BG_SOFT, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "'DM Sans', sans-serif", fontSize: "12.5px", fontWeight: 500, color: TEXT }}>
        <span>Pourquoi le virement bancaire ?</span>
        <span style={{ transition: "transform 0.3s", transform: open ? "rotate(180deg)" : "rotate(0)", fontSize: "16px", color: TEXT_LIGHT }}>▾</span>
      </button>
      <div style={{ maxHeight: open ? "180px" : "0", overflow: "hidden", transition: "max-height 0.35s ease, padding 0.35s ease", padding: open ? "12px 16px" : "0 16px", background: BG }}>
        <p style={{ fontSize: "12.5px", color: TEXT_MID, lineHeight: "1.7", margin: 0 }}>Quattro Shopping utilise le virement SEPA pour garantir des transactions directes et sécurisées vers notre compte professionnel européen. Votre banque assure la traçabilité complète du paiement. Plus de 4 000 commandes livrées depuis 2021.</p>
      </div>
    </div>
  );
}

function Reviews() {
  const rs = [
    { n: "Yacine B.", t: "Reçu en 4 jours, qualité propre. Merci pour le petit cadeau dans le colis.", w: "Il y a 2 semaines" },
    { n: "Mehdi L.", t: "Deuxième commande, toujours carré. Service client rapide sur WhatsApp.", w: "Il y a 10 jours" },
    { n: "Rayane D.", t: "Article conforme aux photos. Matière bien épaisse. Ça vaut le prix.", w: "Il y a 6 jours" },
  ];
  const [i, setI] = useState(0);
  const [ref, visible] = useScrollReveal();
  useEffect(() => { if (!visible) return; const t = setInterval(() => setI((x) => (x + 1) % rs.length), 5000); return () => clearInterval(t); }, [visible]);
  const r = rs[i];
  return (
    <div ref={ref} style={{ padding: "16px 18px", background: BG, border: `1px solid ${BORDER}`, borderRadius: "12px", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)", transition: "all 0.6s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
        <span style={{ color: "#F5A623", fontSize: "11px", letterSpacing: "1px" }}>★★★★★</span>
        <span style={{ fontSize: "10px", color: TEXT_LIGHT, fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase" }}>Avis vérifiés</span>
      </div>
      <div key={i} style={{ animation: "fadeR 0.4s ease" }}>
        <p style={{ fontSize: "12.5px", color: TEXT_MID, lineHeight: "1.6", margin: "0 0 6px", fontStyle: "italic" }}>"{r.t}"</p>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: TEXT }}>{r.n}</span>
          <span style={{ fontSize: "10px", color: TEXT_LIGHT }}>{r.w}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: "4px", justifyContent: "center", marginTop: "10px" }}>
        {rs.map((_, j) => <div key={j} style={{ width: j === i ? "14px" : "5px", height: "5px", borderRadius: "3px", background: j === i ? GREEN : BORDER, transition: "all 0.3s" }} />)}
      </div>
    </div>
  );
}

function Confetti({ show }) {
  if (!show) return null;
  const colors = [GREEN, "#F5A623", "#25D366", "#E24B4A", "#3A6347"];
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 999 }}>
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${15 + Math.random() * 70}%`,
          top: `${50 + Math.random() * 30}%`,
          width: `${6 + Math.random() * 6}px`,
          height: `${6 + Math.random() * 6}px`,
          borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          background: colors[Math.floor(Math.random() * colors.length)],
          animation: `confettiBurst ${0.6 + Math.random() * 0.8}s ease-out forwards`,
          animationDelay: `${Math.random() * 0.3}s`,
          transform: `rotate(${Math.random() * 360}deg)`,
        }} />
      ))}
    </div>
  );
}

function FloatingWhatsApp({ waLink, onClick }) {
  const [ref, visible] = useScrollReveal();
  return (
    <div ref={ref}>
      <a href={waLink} target="_blank" rel="noopener noreferrer" onClick={onClick}
        className="btn-press"
        style={{
          position: "fixed", bottom: "20px", right: "20px", zIndex: 50,
          width: "56px", height: "56px", borderRadius: "50%", background: "#25D366",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(37,211,102,0.35)",
          animation: visible ? "floatIn 0.5s ease, pulseGlow 3s ease infinite 1s" : "none",
          textDecoration: "none", cursor: "pointer",
        }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.13.556 4.13 1.526 5.863L.05 23.999l6.313-1.654A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-2.007 0-3.885-.6-5.45-1.625l-.39-.234-4.05 1.062 1.08-3.95-.257-.41A9.7 9.7 0 012.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z"/></svg>
      </a>
    </div>
  );
}

function PaymentPage({ data }) {
  const [show, setShow] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const scrollPct = useScrollProgress();
  useEffect(() => { setTimeout(() => setShow(true), 50); }, []);

  const scrollTo = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); };

  const waLink = `https://wa.me/447365758255?text=${encodeURIComponent(`Bonjour, j'ai effectué le virement de ${data.amount}€${data.order ? ` pour la commande ${data.order}` : ""}. Voici ma capture :`)}`;

  const handleWaClick = (e) => { e.preventDefault(); setConfetti(true); setTimeout(() => { setConfetti(false); window.open(waLink, "_blank"); }, 1200); };

  return (
    <div style={{ minHeight: "100vh", background: BG_SOFT, fontFamily: "'DM Sans', sans-serif", opacity: show ? 1 : 0, transition: "opacity 0.5s ease" }}>
      <Confetti show={confetti} />

      {/* Scroll progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "3px", zIndex: 100, background: "transparent" }}>
        <div style={{ height: "100%", width: `${scrollPct}%`, background: `linear-gradient(90deg, ${GREEN}, #6aad7e)`, transition: "width 0.1s linear" }} />
      </div>

      {/* Sticky glassmorphism header */}
      <div style={{ position: "sticky", top: "3px", zIndex: 90, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", background: "rgba(247,246,243,0.85)", borderBottom: `1px solid ${BORDER}40` }}>
        <div style={{ maxWidth: "460px", margin: "0 auto", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "4px", color: TEXT, textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>QUATTRO SHOPPING</div>
          <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: GREEN }} />
          <div style={{ fontSize: "10px", color: GREEN, fontWeight: 600, letterSpacing: "1px" }}>Paiement</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px 100px" }}>
        <div style={{ width: "100%", maxWidth: "460px" }}>

          {/* Intro card */}
          <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "22px", marginTop: "20px", marginBottom: "20px", animation: "fadeUp 0.6s ease" }}>
            <p style={{ fontSize: "16px", color: TEXT, margin: "0 0 4px", fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>Bonjour {data.name},</p>
            <p style={{ fontSize: "13px", color: TEXT_MID, margin: "0 0 18px", lineHeight: "1.6" }}>Merci pour votre commande. Finalisez votre paiement en <strong style={{ color: TEXT }}>2 minutes</strong> en suivant les étapes ci-dessous.</p>

            {/* Trust badges */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 11px", background: GREEN_LIGHT, borderRadius: "18px", fontSize: "11px", fontWeight: 500, color: GREEN_DARK }}>
                <span style={{ fontSize: "12px", animation: "pulseLock 2.5s ease infinite" }}>🔒</span>Paiement sécurisé
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 11px", background: GREEN_LIGHT, borderRadius: "18px", fontSize: "11px", fontWeight: 500, color: GREEN_DARK }}>
                <span style={{ fontSize: "12px" }}>🏦</span>Entreprise européenne
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 11px", background: GREEN_LIGHT, borderRadius: "18px", fontSize: "11px", fontWeight: 500, color: GREEN_DARK }}>
                <span style={{ fontSize: "12px" }}>✓</span>+<AnimatedCounter target={4000} /> commandes
              </span>
            </div>

            {/* Delivery + Reserve */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", background: GREEN_LIGHT, borderRadius: "10px" }}>
                <span style={{ fontSize: "20px" }}>📦</span>
                <div>
                  <div style={{ fontSize: "12px", color: GREEN_DARK, fontWeight: 600 }}>Livraison estimée</div>
                  <div style={{ fontSize: "14px", color: GREEN, fontWeight: 600, marginTop: "1px" }}>{getDeliveryDates()}</div>
                  <div style={{ fontSize: "10.5px", color: TEXT_LIGHT, marginTop: "2px" }}>Suivi UPS/FedEx envoyé sous 48h</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "#FFFBF0", border: "1px solid #F2E8CD", borderRadius: "10px" }}>
                <span style={{ fontSize: "14px" }}>🔒</span>
                <span style={{ fontSize: "11.5px", color: "#8B7230", lineHeight: "1.4" }}>Vos articles sont réservés jusqu'au <strong>{getReserveDate()}</strong></span>
              </div>
            </div>
          </div>

          {/* BIG TITLE */}
          <div style={{ textAlign: "center", margin: "8px 0 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", justifyContent: "center" }}>
              <div style={{ height: "2px", flex: 1, background: `linear-gradient(90deg, transparent, ${BORDER})` }} />
              <div>
                <div style={{ fontSize: "28px", fontWeight: 900, color: TEXT, fontFamily: "'Inter', sans-serif", letterSpacing: "-0.5px", lineHeight: "1.1" }}>
                  Comment payer ?
                </div>
                <div style={{ fontSize: "11px", color: TEXT_LIGHT, marginTop: "6px", letterSpacing: "0.5px" }}>
                  Suivez ces 6 étapes simples
                </div>
              </div>
              <div style={{ height: "2px", flex: 1, background: `linear-gradient(90deg, ${BORDER}, transparent)` }} />
            </div>
          </div>

          {/* Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <StepCard n={1} icon="🏦" iconBg="#E3F1E8" title="Ouvrez votre application bancaire" id="step-1"
              desc="Ouvrez l'app de votre banque et cherchez le bouton pour faire un virement :">
              <AltNames names={["Virement", "Envoyer de l'argent", "Nouveau transfert"]} />
              <Tip text="Le nom du bouton change selon la banque (BNP, Boursorama, N26, Revolut…) mais c'est toujours dans la même section." />
            </StepCard>

            <StepCard n={2} icon="📋" iconBg="#E6F0FA" title="Copiez et collez l'IBAN" id="step-2"
              desc="C'est le numéro du compte vers lequel vous envoyez l'argent. Appuyez sur Copier puis collez-le.">
              <CopyRow label="IBAN" value="LU80 4080 0000 4547 7817" copyValue="LU804080000045477817" onCopied={() => scrollTo("step-3")} />
            </StepCard>

            <StepCard n={3} icon="👤" iconBg="#F3EDE4" title="Entrez le nom du destinataire" id="step-3"
              desc="Votre banque va demander à qui vous envoyez l'argent. Ce champ peut s'appeler :">
              <AltNames names={["Bénéficiaire", "Destinataire", "Nom du compte", "Titulaire"]} />
              <CopyRow label="Nom à entrer" value="Quattro Visual Ltd" sublabel="Entreprise enregistrée au Royaume-Uni · Compte Luxembourg (zone SEPA)" onCopied={() => scrollTo("step-4")} />
            </StepCard>

            <StepCard n={4} icon="💶" iconBg="#E8F0EB" title="Entrez le montant exact" id="step-4"
              desc="Vérifiez bien que la devise est en euros (€).">
              <CopyRow value={`${data.amount}€`} copyValue={String(data.amount)} large onCopied={() => scrollTo("step-5")} />
            </StepCard>

            <StepCard n={5} icon="✏️" iconBg="#F0EDE6" title="En référence, mettez votre nom" id="step-5"
              desc="Votre banque peut demander un motif ou une référence. Ce champ peut s'appeler :">
              <AltNames names={["Référence", "Communication", "Motif", "Message"]} />
              <CopyRow label="Référence à entrer" value={data.name} onCopied={() => scrollTo("step-6")} />
              <Tip text="Si votre banque ne demande pas de référence, passez directement à l'étape suivante." />
            </StepCard>

            <StepCard n={6} icon="✅" iconBg={GREEN_LIGHT} title="Confirmez et envoyez-nous la capture" highlight id="step-6"
              desc="Appuyez sur Confirmer ou Envoyer dans votre app bancaire, puis envoyez-nous la capture d'écran sur WhatsApp.">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11.5px", color: TEXT_MID, marginBottom: "14px", padding: "10px 12px", background: GREEN_LIGHT, borderRadius: "8px" }}>
                <span style={{ fontSize: "15px" }}>📦</span><span>Votre commande sera préparée dans la journée <span style={{ color: TEXT_LIGHT }}>(lien de suivi sous 48h)</span></span>
              </div>
              <a href={waLink} onClick={handleWaClick} className="btn-press" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", width: "100%", padding: "14px", background: "#25D366", color: "#fff", border: "none", borderRadius: "10px", fontSize: "13.5px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", textDecoration: "none", cursor: "pointer", boxSizing: "border-box", transition: "transform 0.15s" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.13.556 4.13 1.526 5.863L.05 23.999l6.313-1.654A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-2.007 0-3.885-.6-5.45-1.625l-.39-.234-4.05 1.062 1.08-3.95-.257-.41A9.7 9.7 0 012.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z"/></svg>
                Envoyer la capture sur WhatsApp
              </a>
            </StepCard>
          </div>

          {/* Bank logos */}
          <div style={{ marginTop: "18px", padding: "16px 18px", background: BG, border: `1px solid ${BORDER}`, borderRadius: "12px" }}>
            <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "2px", color: TEXT_LIGHT, textTransform: "uppercase", marginBottom: "10px" }}>Compatible avec toutes les banques</div>
            <BankLogos />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "14px" }}><WhyAccordion /><Reviews /></div>

          {/* Social */}
          <div style={{ marginTop: "14px", padding: "18px", background: BG, border: `1px solid ${BORDER}`, borderRadius: "12px" }}>
            <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "2px", color: TEXT_LIGHT, textTransform: "uppercase", marginBottom: "12px" }}>Suivez-nous</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {[{ icon: "📸", p: "Instagram", h: "@quattro.shopping", url: "https://instagram.com/quattro.shopping" }, { icon: "🎵", p: "TikTok", h: "@quattro.shopping", url: "https://tiktok.com/@quattro.shopping" }, { icon: "👻", p: "Snapchat", h: "@quattroshopping", url: "https://snapchat.com/add/quattroshopping" }].map((s) => (
                <a key={s.p} href={s.url} target="_blank" rel="noopener noreferrer" className="btn-press" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", background: BG_SOFT, borderRadius: "8px", textDecoration: "none", transition: "background 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "9px" }}><span style={{ fontSize: "15px" }}>{s.icon}</span><span style={{ fontSize: "12.5px", fontWeight: 500, color: TEXT }}>{s.p}</span></div>
                  <span style={{ fontSize: "11.5px", color: GREEN }}>{s.h}</span>
                </a>
              ))}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", background: GREEN_LIGHT, borderRadius: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "9px" }}><span style={{ fontSize: "15px" }}>📱</span><span style={{ fontSize: "12.5px", fontWeight: 500, color: TEXT }}>WhatsApp</span></div>
                <div style={{ textAlign: "right" }}><div style={{ fontSize: "11.5px", color: GREEN, fontWeight: 500 }}>+44 7365 758255</div><div style={{ fontSize: "9.5px", color: TEXT_LIGHT }}>Service client 7j/7 24h/24</div></div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: "24px", paddingBottom: "16px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "4px", color: TEXT, textTransform: "uppercase", fontFamily: "'Inter', sans-serif", marginBottom: "4px" }}>QUATTRO SHOPPING</div>
            <div style={{ fontSize: "11px", color: TEXT_LIGHT }}>depuis 2021 · Merci pour votre confiance</div>
            <a href="https://quattroshopping.com" style={{ fontSize: "11px", color: GREEN, textDecoration: "none", marginTop: "4px", display: "inline-block" }}>quattroshopping.com</a>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp button */}
      <FloatingWhatsApp waLink={waLink} onClick={handleWaClick} />
    </div>
  );
}

function AdminPanel() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [order, setOrder] = useState("");
  const [link, setLink] = useState("");
  const [preview, setPreview] = useState(null);
  const BASE = window.location.origin + window.location.pathname;

  const gen = () => {
    if (!name || !amount) return;
    const p = new URLSearchParams();
    p.set("name", name); p.set("amount", amount);
    if (order) p.set("order", order);
    setLink(`${BASE}?${p.toString()}`);
  };

  if (preview) return (
    <div>
      <PaymentPage data={preview} />
      <button onClick={() => setPreview(null)} className="btn-press" style={{ position: "fixed", bottom: "14px", left: "14px", background: TEXT, color: "#fff", border: "none", padding: "8px 18px", borderRadius: "8px", fontSize: "10px", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, cursor: "pointer", zIndex: 100 }}>← Admin</button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: BG_SOFT, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "4px", color: TEXT, textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>QUATTRO SHOPPING</div>
        <div style={{ fontSize: "12px", color: GREEN, marginTop: "4px", letterSpacing: "1px" }}>Générateur de lien de paiement</div>
      </div>
      <div style={{ background: BG, borderRadius: "14px", padding: "28px", width: "100%", maxWidth: "380px", border: `1px solid ${BORDER}`, animation: "fadeUp 0.5s ease" }}>
        {[
          { label: "Prénom et nom du client", value: name, set: setName, ph: "Jean Dupont" },
          { label: "Montant (€)", value: amount, set: setAmount, ph: "178" },
          { label: "N° commande (optionnel)", value: order, set: setOrder, ph: "QS-4521" },
        ].map((f) => (
          <div key={f.label} style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "10px", fontWeight: 600, color: TEXT_MID, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "7px" }}>{f.label}</label>
            <input value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.ph}
              style={{ width: "100%", padding: "11px 14px", background: BG_SOFT, border: `1px solid ${BORDER}`, borderRadius: "8px", color: TEXT, fontSize: "14px", fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box", transition: "border 0.2s" }}
              onFocus={(e) => (e.target.style.borderColor = GREEN)} onBlur={(e) => (e.target.style.borderColor = BORDER)} />
          </div>
        ))}
        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          <button onClick={gen} className="btn-press" style={{ flex: 1, padding: "13px", background: GREEN, color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", letterSpacing: "1px", textTransform: "uppercase" }}>Créer le lien</button>
          <button onClick={() => { if (name && amount) setPreview({ name, amount, order }); }} className="btn-press" style={{ padding: "13px 16px", background: "transparent", color: GREEN, border: `1.5px solid ${GREEN}`, borderRadius: "8px", fontSize: "12px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>Aperçu</button>
        </div>

        {link && (
          <div style={{ marginTop: "20px", padding: "16px", background: GREEN_LIGHT, borderRadius: "10px", animation: "fadeUp 0.4s ease" }}>
            <div style={{ fontSize: "10px", fontWeight: 600, color: GREEN_DARK, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>✅ Lien de paiement créé</div>
            <div style={{ fontSize: "11.5px", color: TEXT, wordBreak: "break-all", background: BG, padding: "10px 12px", borderRadius: "6px", border: `1px solid ${BORDER}`, marginBottom: "10px", lineHeight: "1.5", fontFamily: "'DM Sans', monospace" }}>{link}</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <CopyButton text={link} label="Copier le lien" />
              <button onClick={() => {
                const t = `Bonjour ${name} !\n\nMerci pour votre commande Quattro Shopping.\n\nVoici votre page de paiement sécurisée :\n${link}\n\nToutes les instructions sont dessus, c'est simple et rapide (2 min). Si vous avez une question je suis dispo ici 🙏`;
                window.open(`https://wa.me/?text=${encodeURIComponent(t)}`, "_blank");
              }} className="btn-press" style={{ background: "#25D366", color: "#fff", border: "none", padding: "7px 16px", borderRadius: "6px", fontSize: "11px", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer", textTransform: "uppercase" }}>
                Envoyer via WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>

      {link && (
        <div style={{ marginTop: "16px", padding: "14px 20px", background: BG, border: `1px solid ${BORDER}`, borderRadius: "10px", maxWidth: "380px", width: "100%", animation: "fadeUp 0.5s ease" }}>
          <div style={{ fontSize: "11px", color: TEXT_MID, lineHeight: "1.7" }}>
            <strong style={{ color: TEXT }}>Comment ça marche :</strong><br />
            1. Le lien contient le nom et montant du client<br />
            2. Envoyez-le sur WhatsApp<br />
            3. Le client ouvre → voit sa page personnalisée<br />
            4. Il suit les étapes, paie, vous envoie la capture
          </div>
        </div>
      )}
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  return (
    <div style={{ minHeight: "100vh", background: BG_SOFT, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: "center", marginBottom: "28px", animation: "fadeUp 0.5s ease" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "5px", color: TEXT, textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>QUATTRO SHOPPING</div>
        <div style={{ fontSize: "12px", color: GREEN, marginTop: "5px", letterSpacing: "1.5px" }}>Espace administrateur</div>
      </div>
      <div style={{ background: BG, borderRadius: "14px", padding: "28px", width: "100%", maxWidth: "340px", border: `1px solid ${BORDER}`, animation: "fadeUp 0.6s ease" }}>
        <div style={{ fontSize: "10px", fontWeight: 600, color: TEXT_MID, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "7px" }}>Mot de passe</div>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { if (pw === "eren") onLogin(); else { setError(true); setTimeout(() => setError(false), 2000); } } }}
          placeholder="••••••" autoFocus
          style={{ width: "100%", padding: "12px 14px", background: BG_SOFT, border: `1px solid ${error ? "#E24B4A" : BORDER}`, borderRadius: "8px", color: TEXT, fontSize: "15px", fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box", marginBottom: "12px", transition: "border 0.3s" }} />
        {error && <div style={{ fontSize: "11px", color: "#E24B4A", marginBottom: "10px", animation: "fadeR 0.3s ease" }}>Mot de passe incorrect</div>}
        <button onClick={() => { if (pw === "eren") onLogin(); else { setError(true); setTimeout(() => setError(false), 2000); } }} className="btn-press"
          style={{ width: "100%", padding: "13px", background: GREEN, color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", letterSpacing: "1.5px", textTransform: "uppercase" }}>
          Connexion
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [auth, setAuth] = useState(false);
  const p = new URLSearchParams(window.location.search);
  const name = p.get("name");
  const amount = p.get("amount");
  const order = p.get("order");
  if (name && amount) return <PaymentPage data={{ name, amount, order: order || "" }} />;
  if (!auth) return <LoginScreen onLogin={() => setAuth(true)} />;
  return <AdminPanel />;
}
