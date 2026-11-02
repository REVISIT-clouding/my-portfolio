
"use client"
import { useState, useEffect } from "react";

const navLinks = [
  { label: "Home", href: "#" },
  { label: "Work", href: "#" },
  { label: "About", href: "#" },
  { label: "Journal", href: "#" },
  { label: "Contact", href: "#" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Geist+Mono:wght@300;400&display=swap');

        :root {
          --cream: #f5f0e8;
          --cream-dim: #e8e0d0;
          --ink: #0f0e0d;
          --ink-soft: #1a1917;
          --ink-mid: #2a2825;
        }

        * { box-sizing: border-box; }

        body {
          background: var(--ink);
          font-family: 'Geist Mono', monospace;
          margin: 0;
          min-height: 200vh;
        }

        .nav-root {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 9999;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .nav-root.scrolled {
          backdrop-filter: blur(24px) saturate(120%);
          -webkit-backdrop-filter: blur(24px) saturate(120%);
          background: rgba(15, 14, 13, 0.92);
          border-bottom: 1px solid rgba(245,240,232,0.06);
          box-shadow: 0 1px 0 rgba(245,240,232,0.04), 0 8px 32px rgba(0,0,0,0.4);
        }

        .nav-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 1.4rem;
          letter-spacing: 0.12em;
          color: var(--cream);
          text-decoration: none;
          text-transform: uppercase;
          position: relative;
        }

        .logo::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0;
          width: 0; height: 1px;
          background: var(--cream);
          transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .logo:hover::after { width: 100%; }

        .desktop-links {
          display: flex;
          align-items: center;
          gap: 2.5rem;
          list-style: none;
          margin: 0; padding: 0;
        }

        .desktop-links a {
          font-family: 'Geist Mono', monospace;
          font-size: 0.72rem;
          font-weight: 300;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(245,240,232,0.55);
          text-decoration: none;
          position: relative;
          transition: color 0.3s ease;
        }

        .desktop-links a::before {
          content: '';
          position: absolute;
          bottom: -3px; left: 0;
          width: 0; height: 1px;
          background: var(--cream-dim);
          transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 0.6;
        }

        .desktop-links a:hover { color: var(--cream); }
        .desktop-links a:hover::before { width: 100%; }

        .cta-btn {
          font-family: 'Geist Mono', monospace;
          font-size: 0.65rem;
          font-weight: 400;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ink);
          background: var(--cream-dim);
          border: none;
          padding: 0.55rem 1.4rem;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          display: inline-block;
        }

        .cta-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--cream);
          transform: translateY(100%);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cta-btn span { position: relative; z-index: 1; }
        .cta-btn:hover::after { transform: translateY(0); }

        .hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 44px;
          height: 44px;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          position: relative;
          z-index: 10001;
        }

        .ham-line {
          display: block;
          width: 26px;
          height: 1px;
          background: var(--cream);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: center;
          position: absolute;
        }

        .ham-line:nth-child(1) { transform: translateY(-7px); }
        .ham-line:nth-child(2) { transform: translateY(0); width: 18px; margin-left: -8px; }
        .ham-line:nth-child(3) { transform: translateY(7px); }

        .hamburger.open .ham-line:nth-child(1) { transform: translateY(0) rotate(45deg); }
        .hamburger.open .ham-line:nth-child(2) { opacity: 0; transform: translateX(10px); }
        .hamburger.open .ham-line:nth-child(3) { transform: translateY(0) rotate(-45deg); }

        .mobile-overlay {
          position: fixed;
          inset: 0;
          background: var(--ink-soft);
          z-index: 9998;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 2rem 2.5rem;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mobile-overlay.open {
          opacity: 1;
          pointer-events: all;
        }

        .mobile-links {
          list-style: none;
          padding: 0; margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .mobile-link-item {
          border-bottom: 1px solid rgba(245,240,232,0.07);
          overflow: hidden;
          transform: translateY(30px);
          opacity: 0;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mobile-overlay.open .mobile-link-item { transform: translateY(0); opacity: 1; }
        .mobile-overlay.open .mobile-link-item:nth-child(1) { transition-delay: 0.06s; }
        .mobile-overlay.open .mobile-link-item:nth-child(2) { transition-delay: 0.11s; }
        .mobile-overlay.open .mobile-link-item:nth-child(3) { transition-delay: 0.16s; }
        .mobile-overlay.open .mobile-link-item:nth-child(4) { transition-delay: 0.21s; }
        .mobile-overlay.open .mobile-link-item:nth-child(5) { transition-delay: 0.26s; }

        .mobile-link-item a {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: clamp(2.4rem, 9vw, 3.8rem);
          color: rgba(245,240,232,0.8);
          text-decoration: none;
          display: block;
          padding: 1rem 0;
          letter-spacing: 0.04em;
          transition: color 0.25s ease, padding-left 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mobile-link-item a:hover {
          color: var(--cream);
          padding-left: 1.5rem;
        }

        .mobile-footer {
          margin-top: 3rem;
          opacity: 0;
          transform: translateY(16px);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.32s;
        }

        .mobile-overlay.open .mobile-footer { opacity: 1; transform: translateY(0); }

        .mobile-footer span {
          font-family: 'Geist Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(245,240,232,0.25);
        }

        @media (max-width: 900px) {
          .desktop-links, .cta-btn { display: none; }
          .hamburger { display: flex; }
        }
      `}</style>

      <nav className={`nav-root ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-inner">
          <a href="#" className="logo">Séance</a>

          <ul className="desktop-links">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>

          <a href="#" className="cta-btn">
            <span>Get in touch</span>
          </a>

          <button
            className={`hamburger ${open ? "open" : ""}`}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <span className="ham-line" />
            <span className="ham-line" />
            <span className="ham-line" />
          </button>
        </div>
      </nav>

      <div className={`mobile-overlay ${open ? "open" : ""}`}>
        <ul className="mobile-links">
          {navLinks.map((link) => (
            <li key={link.label} className="mobile-link-item">
              <a href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="mobile-footer">
          <span>© 2026 Séance Studio</span>
        </div>
      </div>
         </>
  );
}