"use client";

import { useEffect } from "react";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const XIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const LinkedInIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const GithubIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);
const GlobeIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2c2.5 2.7 4 6.2 4 10s-1.5 7.3-4 10c-2.5-2.7-4-6.2-4-10s1.5-7.3 4-10z" />
  </svg>
);
const MailIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 6l10 7 10-7" />
  </svg>
);
const PinIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M12 21s-7-6.5-7-11a7 7 0 0114 0c0 4.5-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

// ─── REVEAL HOOK ─────────────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.08 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function SectionLabel({ children, className = "" }) {
  return (
    <div className={`flex items-center gap-3 font-mono text-[0.6rem] tracking-[0.22em] uppercase mb-6 ${className}`}>
      <span className="block w-8 h-px bg-current opacity-70" />
      {children}
    </div>
  );
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const CONTACT = [
  { icon: <PinIcon />, label: "Benin, Nigeria" },
  { icon: <MailIcon />, label: "support.revisit@gmail.com", href: "mailto:support.revisit@gmail.com" },
  { icon: <GlobeIcon />, label: "uniqueuo.vercel.app", href: "https://uniqueuo.vercel.app" },
  { icon: <GithubIcon />, label: "github.com/REVISIT-clouding", href: "https://github.com/REVISIT-clouding" },
  { icon: <LinkedInIcon />, label: "linkedin.com/in/unique-uo-19b570341", href: "https://www.linkedin.com/in/unique-uo-19b570341" },
  { icon: <XIcon />, label: "x.com/mahrezbr", href: "https://x.com/mahrezbr" },
];

const EXPERIENCE = [
  {
    role: "Lead Developer",
    org: "Revisit HMS",
    period: "2026 – Present",
    blurb: "Cloud-based hospital management system built specifically for Nigerian private hospitals and clinics. Live pilot running at Enoma Medical Center, Benin City.",
    points: [
      "Built full patient registration, clinical records, HMO/NHIA billing, pharmacy & inventory, AI consultation notes, ward & bed management — solo",
      "Implemented role-based access control (RBAC) enforced at the PostgreSQL database level via Row Level Security policies",
      "Built offline-first PWA with service worker, IndexedDB sync queue, and graceful degradation for poor connectivity environments",
      "Integrated Groq AI for voice-to-structured consultation note generation; fixed mobile MediaRecorder compatibility",
      "Designed slug-based multi-tenant architecture — each hospital fully isolated on one Supabase instance",
    ],
    stack: ["Next.js", "Supabase", "PostgreSQL", "Groq AI", "Tailwind CSS", "Vercel"],
  },
  {
    role: "Freelance Web Developer",
    org: "",
    period: "2025 – 2026",
    blurb: "",
    points: [
      "Built and deployed full website for a shipping/logistics company — responsive design, product listings, contact flow",
      "Built complete MERN stack site for an NGO — organization profile, campaigns, donation section, mobile-optimised",
      "Designed and delivered landing pages for a political election campaign — fast turnaround, A/B testing on key conversion pages",
      "Developed an e-commerce site for a known clothing brand — helping them manage stock levels, inventory, revenue, orders, and daily product display (August 2026)",
    ],
    stack: ["React", "Next.js", "JavaScript", "HTML", "CSS", "Tailwind CSS"],
  },
  {
    role: "Web Developer Intern",
    org: "SyntechHub (Remote — India)",
    period: "2025",
    blurb: "",
    points: [
      "Completed frontend development tasks in a structured team environment",
      "Delivered work to deadlines in a collaborative, deadline-driven development workflow",
    ],
    stack: [],
  },
];

const PROJECTS = [
  {
    title: "Revisit HMS — Hospital Management System",
    blurb: "Complete HMS covering the full patient and administrative lifecycle.",
    points: [
      "AI voice-to-consultation notes via Groq API — transcribes speech and structures into clinical categories for future revisit sessions",
      "Patient records, visit history, export features, appointments & consultations, HMO & cash billing, pharmacy, queue & inventory, audit logs, role-level security",
    ],
  },
  {
    title: "Spa & Beauty Booking Platform",
    blurb: "End-to-end booking and client retention system for beauty and wellness businesses.",
    points: [
      "Automated WhatsApp follow-ups for lapsed clients; webhook-triggered owner notifications on payment confirmation",
      "Paystack integration with slot locking and online booking",
    ],
  },
  {
    title: "Revisit Schools — Solo Developer",
    blurb: "School management system concept built under Revisit Technologies. Records, attendance, and administration for Nigerian schools.",
    points: [],
    stack: ["Next.js", "Supabase", "JavaScript"],
  },
  {
    title: "Revisit Hospitalities — Solo Developer",
    blurb: "Hospitality management web application built under Revisit Technologies.",
    points: [],
    stack: ["JavaScript", "HTML", "CSS"],
  },
];

const ALSO_BUILT = "Laboratory Management Software, School Management Software, shipping and NGO websites (client work), multiple portfolio sites";

const SKILLS = [
  { label: "Frontend", value: "React, Next.js (App Router), JavaScript, HTML, CSS" },
  { label: "Backend", value: "Node.js, Next.js API, Supabase, PostgreSQL, MongoDB, Python (basics)" },
  { label: "AI", value: "Groq API — voice transcription & clinical note structuring; AI-assisted development for faster delivery" },
  { label: "Payments", value: "Paystack" },
  { label: "Tools", value: "Vercel, GitHub, VS Code" },
  { label: "Practices", value: "Multi-tenant architecture · RBAC · Offline-first development · Responsive design" },
];

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function CVPage() {
  useReveal();
  return (
    <div className="bg-[#f5f0e8] min-h-screen overflow-x-hidden text-gray-600">
      <GlobalStyles />

      {/* Top bar */}
      <div className="border-b border-[#0f0e0d]/10 bg-[#f5f0e8]/90 backdrop-blur-xl sticky top-0 z-50 print:hidden">
        <div className="max-w-[900px] mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="font-['DM_Serif_Display'] text-base tracking-widest text-[#0f0e0d] no-underline uppercase">
            Unique Uo
          </a>
          <button
            onClick={() => window.print()}
            className="font-mono text-[0.6rem] tracking-[0.16em] uppercase text-[#f5f0e8] bg-[#1a3a5c] px-5 py-2.5 hover:bg-[#245080] transition-colors duration-300 border-none cursor-pointer"
          >
            Print / Save PDF
          </button>
        </div>
      </div>

      <main className="max-w-[900px] mx-auto px-6 py-16 text-gray-600">
        {/* Header */}
        <header className="reveal mb-16">
          <h1 className="font-['DM_Serif_Display'] text-[clamp(2.4rem,6vw,3.6rem)] text-[#0f0e0d] leading-[1.05] mb-2">
            Unique U. Okeke
          </h1>
          <div className="font-mono text-[0.68rem] tracking-[0.22em] uppercase text-[#245080] mb-8">
            Software Developer
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {CONTACT.map(({ icon, label, href }) => {
              const Wrapper = href ? "a" : "span";
              const wrapperProps = href ? { href, target: "_blank", rel: "noreferrer" } : {};
              return (
                <Wrapper key={label} {...wrapperProps}
                  className="flex items-center gap-2 font-mono text-[0.66rem] tracking-wide text-[#0f0e0d]/60 no-underline hover:text-[#1a3a5c] transition-colors duration-200">
                  <span className="text-[#245080]">{icon}</span>{label}
                </Wrapper>
              );
            })}
          </div>
        </header>

        {/* Professional Summary */}
        <section className="reveal mb-16 text-gray-600">
          <SectionLabel className="text-[#245080]">Professional Summary</SectionLabel>
          <p className="font-['Cormorant_Garamond'] text-lg leading-relaxed text-[#0f0e0d]/75 max-w-[70ch]">
            Self-taught full-stack developer who has shipped multiple production-grade systems including a
            complete Hospital Management System with AI-powered clinical workflows. Experienced in taking
            products from zero to deployment across healthcare, micro-SaaS, and other service industries.
            Builds efficiently using AI-assisted development workflows. Works with integrations including
            WhatsApp, email automations, Paystack, map systems, and real-time simulation tracking. Creates
            software built to scale and deliver real value.
          </p>
        </section>

        {/* Experience */}
        <section className="reveal mb-16">
          <SectionLabel className="text-[#245080]">Experience</SectionLabel>
          <div className="flex flex-col gap-10">
            {EXPERIENCE.map((e, i) => (
              <div key={i} className="border-l-2 border-[#1a3a5c]/15 pl-6 relative">
                <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[#1a3a5c]" />
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-1">
                  <div className="font-['DM_Serif_Display'] text-xl text-[#0f0e0d]">
                    {e.role}{e.org && <span className="text-[#245080]"> · {e.org}</span>}
                  </div>
                  <div className="font-mono text-[0.6rem] tracking-[0.14em] uppercase text-[#0f0e0d]/40 whitespace-nowrap">{e.period}</div>
                </div>
                {e.blurb && (
                  <p className="font-['Cormorant_Garamond'] text-base text-[#0f0e0d]/65 leading-relaxed mb-3 max-w-[65ch]">{e.blurb}</p>
                )}
                <ul className="list-none p-0 m-0 flex flex-col gap-1.5 mb-3">
                  {e.points.map((p, j) => (
                    <li key={j} className="font-mono text-[0.68rem] leading-relaxed text-[#0f0e0d]/60 flex items-start gap-2">
                      <span className="text-[#3a6ea5] shrink-0">—</span>{p}
                    </li>
                  ))}
                </ul>
                {e.stack.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {e.stack.map(s => (
                      <span key={s} className="font-mono text-[0.58rem] tracking-wide uppercase text-[#1a3a5c] bg-[#1a3a5c]/8 px-2.5 py-1">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Selected Projects */}
        <section className="reveal mb-16">
          <SectionLabel className="text-[#245080]">Selected Projects</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5 bg-[#0f0e0d]/[0.06]">
            {PROJECTS.map((p, i) => (
              <div key={i} className="bg-[#f5f0e8] p-6">
                <div className="font-['DM_Serif_Display'] text-lg text-[#0f0e0d] mb-2 leading-snug">{p.title}</div>
                {p.blurb && <p className="font-['Cormorant_Garamond'] text-[0.95rem] text-[#0f0e0d]/65 leading-relaxed mb-3">{p.blurb}</p>}
                {p.points.length > 0 && (
                  <ul className="list-none p-0 m-0 flex flex-col gap-1.5 mb-3">
                    {p.points.map((pt, j) => (
                      <li key={j} className="font-mono text-[0.64rem] leading-relaxed text-[#0f0e0d]/55 flex items-start gap-2">
                        <span className="text-[#3a6ea5] shrink-0">—</span>{pt}
                      </li>
                    ))}
                  </ul>
                )}
                {p.stack && (
                  <div className="flex flex-wrap gap-2">
                    {p.stack.map(s => (
                      <span key={s} className="font-mono text-[0.56rem] tracking-wide uppercase text-[#1a3a5c] bg-[#1a3a5c]/8 px-2 py-0.5">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="font-mono text-[0.64rem] leading-relaxed text-[#0f0e0d]/45 mt-4">
            <span className="text-[#0f0e0d]/70">Also built:</span> {ALSO_BUILT}
          </p>
        </section>

        {/* Technical Skills */}
        <section className="reveal mb-16">
          <SectionLabel className="text-[#245080]">Technical Skills</SectionLabel>
          <div className="flex flex-col gap-3">
            {SKILLS.map(({ label, value }) => (
              <div key={label} className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-4 py-3 border-b border-[#0f0e0d]/[0.06]">
                <div className="font-mono text-[0.6rem] tracking-[0.16em] uppercase text-[#245080]">{label}</div>
                <div className="font-['Cormorant_Garamond'] text-base text-[#0f0e0d]/70 leading-relaxed">{value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section className="reveal mb-8">
          <SectionLabel className="text-[#245080]">Education</SectionLabel>
          <div className="flex flex-col gap-2">
            <div className="font-['DM_Serif_Display'] text-lg text-[#0f0e0d]">BSc Computer Science <span className="font-mono text-[0.6rem] tracking-[0.14em] uppercase text-[#0f0e0d]/40 ml-2">In view</span></div>
            <div className="font-['Cormorant_Garamond'] text-base text-[#0f0e0d]/65">West African Senior School Certificate (WASSCE/SSCE)</div>
          </div>
        </section>

        {/* Footer / back link */}
        <div className="reveal pt-10 border-t border-[#0f0e0d]/10 flex items-center justify-between flex-wrap gap-4 print:hidden">
          <a href="/" className="font-mono text-[0.62rem] tracking-[0.18em] uppercase text-[#245080] no-underline hover:text-[#1a3a5c] transition-colors duration-200">
            ← Back to Portfolio
          </a>
          <span className="font-mono text-[0.56rem] tracking-[0.15em] uppercase text-[#0f0e0d]/30">
            © 2026 Unique U. Okeke
          </span>
        </div>
      </main>
    </div>
  );
}

const GlobalStyles = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; }
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
    .reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.6s cubic-bezier(.16,1,.3,1), transform 0.6s cubic-bezier(.16,1,.3,1); }
    .reveal.visible { opacity: 1; transform: none; }
    @media print {
      body { background: #fff !important; }
      .sticky { position: static !important; }
    }
  `}</style>
);