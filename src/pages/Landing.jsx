import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../App.css";
import FooterCTA from "../components/FooterCTA.jsx";
import { Button } from "../components/PremiumComponents";
import { ArrowRight, PlayCircle } from "lucide-react";

function Hero() {
  const navigate = useNavigate();
  
  return (
    <section className="hero">
      <div className="container hero-grid">
        <motion.div 
          className="hero-copy"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="badge"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            Rootd in Community
          </motion.div>
          <h1 className="h1">Get partnered. Build your brand. Earn more.</h1>
          <p className="lead">Rootd helps student-athletes and creators find sponsorships with local and national brands using performance signals and real-world reach.</p>

          <motion.div 
            style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Button 
              onClick={() => navigate("/signup")} 
              variant="primary"
              size="lg"
              icon={ArrowRight}
            >
              Get Early Access
            </Button>
            <Button 
              onClick={() => navigate("/demo")} 
              variant="ghost"
              size="lg"
              icon={PlayCircle}
            >
              Request Demo
            </Button>
          </motion.div>

          <div className="trust-row" aria-hidden>
            <div>Trusted by college teams & clubs</div>
            <div style={{ opacity: 0.8, fontSize: 13 }}>Beta — free for early partners</div>
          </div>
        </motion.div>

        <motion.div 
          className="hero-visual" 
          aria-hidden
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="card soft">
            <h4 style={{ margin: 0 }}>Example Match</h4>
            <p style={{ marginTop: 8, color: "var(--muted-2)" }}>Arlington Apparel — Local sportswear brand</p>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
              <div style={{ fontWeight: 800 }}>Match Score</div>
              <div style={{ background: "#ECFDF5", color: "#065F46", padding: "6px 10px", borderRadius: 8, fontWeight: 800 }}>86</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { title: "Data-driven matches", desc: "We combine performance, engagement and location to prioritize sponsors most likely to convert." },
    { title: "One-click pitch", desc: "Generate a concise, personalized outreach message you can send in seconds." },
    { title: "Verified leads", desc: "Local businesses with real interest signals and phone / address data so you can follow up." },
    { title: "Privacy first", desc: "You control what profile info is shared — opt in only when you're ready." },
  ];

  return (
    <section className="features container">
      <h2 style={{ textAlign: "center" }}>How Rootd works</h2>
      <p style={{ textAlign: "center", maxWidth: 720, margin: "8px auto 24px" }}>A simple workflow for athletes to find and secure sponsorships without the grunt work.</p>

      <div className="features-grid">
        {items.map((it, idx) => (
          <div key={it.title} className="feature-card">
            <div className="feature-icon" aria-hidden>
              {idx === 0 && (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 13h4v7H3zM10 6h4v14h-4zM17 10h4v10h-4z" fill="#06b6d4"/></svg>
              )}
              {idx === 1 && (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3 6 6 .5-4.5 4 1 6-5.5-3.25L6 19.5 7 13 3.5 9 9 8.5 12 2z" fill="#F59E0B"/></svg>
              )}
              {idx === 2 && (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18v2H3zM6 11h12v2H6zM9 16h6v2H9z" fill="#34D399"/></svg>
              )}
              {idx === 3 && (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 1a5 5 0 015 5v3a7 7 0 11-10 0V6a5 5 0 015-5z" fill="#60A5FA"/></svg>
              )}
            </div>
            <h4>{it.title}</h4>
            <p>{it.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  const navigate = useNavigate();
  
  return (
    <section className="final-cta">
      <motion.div 
        className="container" 
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h3 style={{ margin: 0 }}>Ready to get matched?</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>Sign up for early access and we'll prioritize you for our pilot program.</p>
        </div>

        <div>
          <Button 
            onClick={() => navigate("/signup")} 
            variant="primary"
            size="lg"
            icon={ArrowRight}
          >
            Join the Pilot
          </Button>
        </div>
      </motion.div>
    </section>
  );
}

function SimpleFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <strong>Rootd</strong>
          <div style={{ marginTop: 8, opacity: 0.8 }}>Helping athletes find sponsors since 2024</div>
        </div>

        <div>
          <div><Link to="/privacy">Privacy</Link></div>
          <div><Link to="/terms">Terms</Link></div>
        </div>

        <div>
          <div>Contact</div>
          <div style={{ marginTop: 8 }}>hi@rootd.com</div>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <div className="page-container landing-page">
      <div className="page-content" style={{ padding: 0 }}>
        <Hero />
        <Features />
        <FinalCta />
        <SimpleFooter />
      </div>
      <FooterCTA />
    </div>
  );
}
