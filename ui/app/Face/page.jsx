"use client"

import { BiPhone, BiMessageDetail, BiEnvelope, BiRightArrowAlt, BiX, BiMenu, BiDownload, BiMap, BiLock, BiLike, BiSolidLike } from "react-icons/bi";import { FaGithub, FaLinkedin, FaXTwitter, FaWhatsapp } from "react-icons/fa6";
import { MdOutlineContactPage } from "react-icons/md";
import { HiOutlineDocumentText } from "react-icons/hi";
import { useEffect, useRef, useState } from "react";
import { RiExternalLinkFill, RiArrowRightUpLine } from "react-icons/ri";

const contacts = [
    { label: "Phone", href: "tel:+2349060214104", icon: BiPhone },
    { label: "Message", href: "sms:+2349060214104", icon: BiMessageDetail },
    { label: "Email", href: "mailto:uounique251@gmail.com", icon: BiEnvelope },
    //   { label: "CV", href: "/cv.pdf", icon: HiOutlineDocumentText, newTab: true },
    { label: "GitHub", href: "https://github.com/REVISIT-clouding", icon: FaGithub, newTab: true },
    { label: "LinkedIn", href: "https://linkedin.com/in/unique-okeke-19b570341", icon: FaLinkedin, newTab: true },
    { label: "X", href: "https://x.com/mahrezbr?s=11", icon: FaXTwitter, newTab: true },
];

/* ---------- edit your own details here ---------- */
const PHONE = "+2349060214104";
const WHATSAPP = "2349060214104";      // country code + number, no + or spaces
const EMAIL = "uounique251@gmail.com";
const STATUS = "Available for new projects";
const CV_URL = "/cv.pdf";              // put your PDF in the public folder as cv.pdf

export const ABOUT_INTRO =
    "I'm Unique, a self-taught full-stack developer based in Nigeria. I focus on building practical web applications and resilient software systems built for real-world conditions: multi-tenant architectures, offline-first reliability, and secure data workflows.";

export const ABOUT_FULL = [
    "I'm a full-stack software developer focused on building practical web applications and software systems. My experience spans frontend and backend development, database design, API development, authentication, authorization, and application workflows across healthcare management, e-commerce, task management, and data-driven platforms.",
    "I enjoy understanding how systems work beyond their interfaces—from how information is stored and processed to how different parts of an application communicate. I pay close attention to the critical details: strict multi-tenant isolation, clear transactional logic, offline data syncing, and interfaces optimized for mobile performance.",
    "My hands-on experience includes an offline-capable hospital management system, automated booking workflows, and a digital rewards platform managing user wallets and tasks using React, Next.js, Supabase, and PostgreSQL.",
    "Through independent and project-based development, I've gained practical experience working through technical challenges, testing application behavior, and making engineering decisions. I'm continuously developing my skills and looking to contribute to a software engineering team where I can build useful products, learn from experienced developers, and grow as an engineer."
];

// Replace these with real quotes from real people before you publish.
const TESTIMONIALS = [
    { quote: "I Like Your Vision and Drive.", name: "Dr Iyamu", role: "CEO & member of NEC Nigeria, Enoma Medical Center" },
    { quote: "He can build anything, all i have to do is meet him. He's my enginneer.", name: "Mr Emeka", },
];

const NAV = [
    ["about", "About"],
    ["projects", "Projects"],
    ["skills", "Skills"],
    ["testimonials", "Testimonials"],
    ["contact", "Contact"],
    ["cv", "CV"],
];

const goTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

const stackOf = (s) =>
    (Array.isArray(s) ? s : String(s || "").split(",")).map((t) => t.trim()).filter(Boolean);

// "Next.js", "nextjs" and "Next JS" all match each other
const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9+#]/g, "");

// only these statuses get a badge on the project cards
const isLive = (s) => /live|pilot|deployed|shipped|production|completed/i.test(String(s || ""));
const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }) : "";

const skillName = (s) =>
    s?.name ?? s?.skill ?? s?.title ?? s?.label ??
    Object.values(s || {}).find(
        (v) => typeof v === "string" && v.length < 40 && !/^[0-9a-f-]{36}$/i.test(v) && !/^\d{4}-\d{2}-\d{2}/.test(v)
    ) ?? "";

/* keeps content a readable width on laptops, full width on phones */
function Wrap({ className = "", children }) {
    return <div className={`mx-auto w-full max-w-5xl ${className}`}>{children}</div>;
}

/* Close on Escape and stop the page behind from scrolling */
function useModalBehavior(onClose) {
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [onClose]);
}

function PulseDot() {
    return (
        <span className="relative flex h-2.5 w-2.5 flex-none">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
        </span>
    );
}
/* skill logos from Simple Icons, looked up by skill name */
const SLUG_FIX = {
    nextjs: "nextdotjs", nodejs: "nodedotjs", vuejs: "vuedotjs", reactjs: "react",
    expressjs: "express", postgres: "postgresql", tailwind: "tailwindcss",
    js: "javascript", ts: "typescript",
};
const iconSlug = (s) => {
    const base = String(s || "").toLowerCase()
        .replace(/\./g, "dot").replace(/\+/g, "plus").replace(/#/g, "sharp").replace(/&/g, "and")
        .replace(/[^a-z0-9]/g, "");
    return SLUG_FIX[base] || base;
};

function SkillIcon({ name, white = false }) {
    const [ok, setOk] = useState(true);
    const slug = iconSlug(name);
    if (!ok || !slug) return null;
    return (
        <img
            src={`https://cdn.simpleicons.org/${slug}${white ? "/ffffff" : ""}`}
            alt=""
            aria-hidden="true"
            loading="lazy"
            onError={() => setOk(false)}
            className="h-[1.1em] w-[1.1em] flex-none"
        />
    );
}

/* ---------- fade-up on scroll ---------- */
function Reveal({ children, className = "", delay = 0 }) {
    const ref = useRef(null);
    const [shown, setShown] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setShown(true);
            return;
        }
        const io = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setShown(true);
                    io.disconnect();
                }
            },
            { threshold: 0.12 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            style={{ transitionDelay: `${delay}ms` }}
            className={`transition-all duration-700 ${shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"} ${className}`}
        >
            {children}
        </div>
    );
}

/* ---------- scrolling skills band ---------- */
function SkillBand({ names }) {
    if (!names.length) return null;
    const row = Array.from({ length: Math.max(2, Math.ceil(10 / names.length)) }, () => names).flat();
    const items = [...row, ...row]; // doubled so the loop is seamless

    return (
        <div className="overflow-hidden bg-red-500 py-2 text-white" aria-hidden="true">
            <style>{`
                @keyframes skill-band { from { transform: translateX(0); } to { transform: translateX(-50%); } }
                .skill-band { animation: skill-band 30s linear infinite; }
                @media (prefers-reduced-motion: reduce) { .skill-band { animation: none; } }
            `}</style>
            <div className="skill-band flex w-max whitespace-nowrap text-lg font-bold uppercase tracking-wide">
                {items.map((n, i) => (
                    <span key={i} className="flex items-center gap-8 pr-8">
                        {n}
                        <span className="text-white/60">✦</span>
                    </span>
                ))}
            </div>
        </div>
    );
}

/* ---------- header + hamburger menu ---------- */
function Header() {
    const [open, setOpen] = useState(false);
    const [progress, setProgress] = useState(0);

    // thin red line that fills as you scroll down the page
    useEffect(() => {
        const onScroll = () => {
            const h = document.documentElement;
            const max = h.scrollHeight - h.clientHeight;
            setProgress(max > 0 ? (h.scrollTop / max) * 100 : 0);
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [open]);

    const go = (id) => {
        setOpen(false);
        setTimeout(() => goTo(id), 80); // wait for the page to unlock
    };

    return (
        <>
            <header
                className="sticky top-0 z-30 bg-white/90 px-5 pb-3 backdrop-blur"
                style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
            >
                <Wrap className="flex items-center justify-between">
                    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-xl font-extrabold tracking-tight">
                        Unique<span className="text-red-500">.</span>
                    </button>
                    <button
                        onClick={() => setOpen(true)}
                        aria-label="Open menu"
                        aria-expanded={open}
                        className="grid h-12 w-12 place-items-center rounded-full border text-2xl hover:bg-gray-100"
                    >
                        <BiMenu />
                    </button>
                </Wrap>
                <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-red-500"
                    style={{ transform: `scaleX(${progress / 100})` }}
                />
            </header>

            {open && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Menu"
                    className="fixed inset-0 z-[55] overflow-y-auto bg-black px-6 pb-8 text-white"
                    style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
                >
                    <Wrap className="flex min-h-full flex-col">
                        <div className="flex items-center justify-between">
                            <span className="text-xl font-extrabold tracking-tight">
                                Unique<span className="text-red-500">.</span>
                            </span>
                            <button
                                onClick={() => setOpen(false)}
                                aria-label="Close menu"
                                className="grid h-12 w-12 place-items-center rounded-full border border-white/20 text-2xl hover:bg-white/10"
                            >
                                <BiX />
                            </button>
                        </div>

                        <nav className="mt-8 flex flex-1 flex-col">
                            {NAV.map(([id, label], i) => (
                                <button
                                    key={id}
                                    onClick={() => go(id)}
                                    className="flex items-baseline gap-4 border-b border-white/10 py-4 text-left text-4xl font-extrabold tracking-tight transition hover:text-red-500"
                                >
                                    <span className="text-sm font-normal text-gray-500">{String(i + 1).padStart(2, "0")}</span>
                                    {label}
                                </button>
                            ))}
                        </nav>

                        <button
    onClick={() => go("contact")}
    className="mt-6 inline-flex items-center justify-center gap-1 rounded-full bg-red-500 py-3.5 font-semibold hover:bg-red-600"
>
    Let's talk <RiArrowRightUpLine className="text-xl" />
</button>

<div className="mt-6 flex justify-center">
    <a
        href="/login"
        aria-label="Sign in"
        className="p-2 text-white/20 transition hover:text-white/60"
    >
        <BiLock className="text-base" />
    </a>
</div>
                    </Wrap>
                </div>
            )}
        </>
    );
}

/* ---------- project details modal ---------- */
// accepts a jsonb array, or a newline-separated string
const listOf = (v) =>
    (Array.isArray(v) ? v : String(v || "").split("\n"))
        .map((x) => (typeof x === "string" ? x.trim() : String(x?.title ?? x?.text ?? "")))
        .filter(Boolean);

function ModalSection({ title, children }) {
    return (
        <>
            <h4 className="pt-4 text-lg font-bold">{title}</h4>
            <div className="mt-1">{children}</div>
        </>
    );
}

function BulletList({ items }) {
    return (
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-600">
            {items.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
    );
}

/* ---------- project details modal ---------- */
function ProjectModal({ item, onClose }) {
    useModalBehavior(onClose);

    const contributions = listOf(item.contributions);
    const features = listOf(item.key_features);
    const challenges = listOf(item.engineering_challenges);
    const limitations = listOf(item.known_limitations);
    const tech = stackOf(item.stack);
    const overview = item.overview || item.details; // falls back to old field

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="project-title"
                className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-gray-100 text-xl hover:bg-gray-200"
                >
                    <BiX />
                </button>

                {item.img && (
                    <img src={item.img} alt={item.title} decoding="async" className="mb-4 h-40 w-full rounded-2xl border object-cover" />
                )}
                {listOf(item.images).length > 0 && (
                    <div className="mb-4 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2">
                        {listOf(item.images).map((url) => (
                            <img
                                key={url}
                                src={url}
                                alt={item.title}
                                loading="lazy"
                                className="h-60 w-64 flex-none snap-center rounded-2xl border object-cover"
                            />
                        ))}
                    </div>
                )}

                <div className="flex gap-2 text-xs">
                    <span className="rounded bg-gray-100 px-2 py-0.5">{item.mode}</span>
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-700">{item.status}</span>
                </div>

                <h2 id="project-title" className="mt-3 text-xl font-bold">{item.title}</h2>
                <h3 className="text-sm font-semibold text-gray-800">{item.subtitle}</h3>
                <p className="whitespace-pre-line text-sm text-gray-400">{item.summary}</p>
                {item.project_date && <p className="mt-1 text-xs text-gray-500">{fmtDate(item.project_date)}</p>}
                {overview && (
                    <ModalSection title="Overview">
                        <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">{overview}</p>
                    </ModalSection>
                )}

                {contributions.length > 0 && (
                    <ModalSection title="My contribution"><BulletList items={contributions} /></ModalSection>
                )}

                {features.length > 0 && (
                    <ModalSection title="Key features"><BulletList items={features} /></ModalSection>
                )}

                {item.technical_implementation && (
                    <ModalSection title="Technical implementation">
                        <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">{item.technical_implementation}</p>
                    </ModalSection>
                )}

                {challenges.length > 0 && (
                    <ModalSection title="Engineering challenges"><BulletList items={challenges} /></ModalSection>
                )}

                {limitations.length > 0 && (
                    <ModalSection title="Known limitations"><BulletList items={limitations} /></ModalSection>
                )}

                {tech.length > 0 && (
                    <ModalSection title="Technology stack">
                        <div className="flex flex-wrap gap-1.5">
                            {tech.map((t) => (
                                <span key={t} className="rounded-full border px-2.5 py-0.5 text-xs">{t}</span>
                            ))}
                        </div>
                    </ModalSection>
                )}

                <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="text-sm text-gray-600">{item.footerleft}</span>
                    {item.href && (
                        <a
                            href={item.href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-full bg-red-500 px-5 py-2.5 font-semibold text-white hover:bg-red-600"
                        >
                            Visit project <RiExternalLinkFill />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}



/* ---------- "about my code" modal ---------- */
function CodeModal({ onClose }) {
    useModalBehavior(onClose);

    const toProjects = () => {
        onClose();
        setTimeout(() => goTo("projects"), 80);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="code-title"
                className="relative w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-gray-100 text-xl hover:bg-gray-200"
                >
                    <BiX />
                </button>

                <h2 id="code-title" className="text-2xl font-extrabold tracking-tight">About my code</h2>
                <p className="mt-3 leading-relaxed text-gray-700 text-4xl">
                    Most of my work is private: client and pilot projects. The selected projects have live links, screenshots and
                    case studies. I'm happy to do a live walkthrough or share access on request.
                </p>

                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    <button
                        onClick={toProjects}
                        className="inline-flex items-center justify-center gap-1 rounded-full bg-red-500 px-5 py-3 font-semibold text-white hover:bg-red-600 active:scale-95"
                    >
                        View selected projects <RiArrowRightUpLine className="text-xl" />
                    </button>
                    <a
                        href="https://github.com/REVISIT-clouding"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-black px-5 py-3 font-semibold hover:bg-black hover:text-white active:scale-95"
                    >
                        <FaGithub className="text-xl" /> Visit GitHub
                    </a>
                </div>
            </div>
        </div>
    );
}


/* ---------- about modal ---------- */
function AboutModal({ projects, skillNames, onClose }) {
    useModalBehavior(onClose);

    const closeThen = (id) => {
        onClose();
        setTimeout(() => goTo(id), 80);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="about-title"
                className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-gray-100 text-xl hover:bg-gray-200"
                >
                    <BiX />
                </button>

                <h2 id="about-title" className="text-3xl font-extrabold tracking-tight">About me</h2>
                <p className="text-sm text-gray-600">Full-stack Software developer · Benin City, Nigeria</p>

                <div className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-gray-700">
                    {ABOUT_FULL.map((p, i) => <p key={i}>{p}</p>)}
                </div>

                {skillNames.length > 0 && (
                    <>
                        <h3 className="pt-5 text-xl font-bold">What I work with</h3>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {skillNames.map((t) => (
                                <span key={t} className="rounded-full border px-2.5 py-0.5 text-xs">{t}</span>
                            ))}
                        </div>
                    </>
                )}

                {projects.length > 0 && (
                    <>
                        <h3 className="pt-5 text-xl font-bold">Things I've built</h3>
                        <ul className="mt-2 divide-y text-sm">
                            {projects.map((p, i) => (
                                <li key={p.id || i} className="py-2">
                                    <b>{p.title}</b>
                                    <span className="text-gray-600"> · {p.subtitle}</span>
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                    <button
                        onClick={() => closeThen("contact")}
                        className="inline-flex items-center justify-center gap-1 rounded-full bg-red-500 px-5 py-3 font-semibold text-white hover:bg-red-600 active:scale-95"
                    >
                        Let's talk <RiArrowRightUpLine className="text-xl" />
                    </button>
                    <button
                        onClick={() => closeThen("cv")}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-black px-5 py-3 font-semibold hover:bg-black hover:text-white active:scale-95"
                    >
                        <HiOutlineDocumentText className="text-xl" /> View my CV
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ---------- testimonials ---------- */
function Testimonials() {
    if (!TESTIMONIALS.length) return null;

    return (
        <section id="testimonials" className="scroll-mt-16 bg-gray-50 py-12">
            <Wrap>
                <div className="px-5">
                    <p className="text-xs uppercase tracking-widest text-gray-500">Kind words</p>
                    <h1 className="py-3 text-4xl font-bold">
                        WHAT PEOPLE <br /> SAY
                    </h1>
                </div>

                <div className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {TESTIMONIALS.map((t, i) => (
                        <figure
                            key={i}
                            className="flex min-w-[85%] snap-center flex-col justify-between rounded-3xl bg-white p-6 shadow-sm sm:min-w-[380px]"
                        >
                            <div>
                                <span aria-hidden="true" className="block text-6xl font-extrabold leading-none text-red-500">“</span>
                                <blockquote className="mt-2 text-gray-700">{t.quote}</blockquote>
                            </div>
                            <figcaption className="mt-6 flex items-center gap-3">
                                <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-black font-bold text-white">
                                    {t.name?.[0] ?? "?"}
                                </span>
                                <span>
                                    <b className="block">{t.name}</b>
                                    {t.role && <span className="text-sm text-gray-500">{t.role}</span>}
                                </span>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </Wrap>
        </section>
    );
}

/* ---------- sticky "Let's talk" bar ---------- */
function StickyTalk() {
    const [hide, setHide] = useState(false);

    // hide the bar while the contact or CV section is on screen
    useEffect(() => {
        const els = ["contact", "cv"].map((id) => document.getElementById(id)).filter(Boolean);
        if (!els.length) return;
        const seen = new Set();
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => (e.isIntersecting ? seen.add(e.target.id) : seen.delete(e.target.id)));
                setHide(seen.size > 0);
            },
            { threshold: 0.2 }
        );
        els.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);

    return (
        <div
            className={`fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 transition-all duration-300 ${hide ? "pointer-events-none translate-y-24 opacity-0" : "translate-y-0 opacity-100"
                }`}
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
            <div className="flex w-full max-w-md items-center justify-between gap-3 rounded-full bg-black p-2 pl-5 text-white shadow-2xl ring-1 ring-white/10">
                <span className="flex min-w-0 items-center gap-2 text-sm">
                    <PulseDot />
                    <span className="truncate">{STATUS}</span>
                </span>
                <button
                    onClick={() => goTo("contact")}
                    className="group inline-flex flex-none items-center gap-1 rounded-full bg-red-500 px-5 py-2.5 font-semibold text-white transition hover:bg-red-600 active:scale-95"
                >
                    Let's talk
                    <RiArrowRightUpLine className="text-xl transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
            </div>
        </div>
    );
}

/* ---------- contact section ---------- */
function ContactSection() {
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const body = () => `Hi Unique, ${message.trim()}${name.trim() ? `\n\n- ${name.trim()}` : ""}`;

    // No backend: this opens WhatsApp or the email app with the message ready to send
    const send = (via) => {
        if (!message.trim()) return setError("Write a short message first.");
        setError("");
        if (via === "whatsapp") {
            setNotice("");
            window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(body())}`, "_blank", "noopener,noreferrer");
        } else {
            const subject = `Let's talk${name.trim() ? ` - ${name.trim()}` : ""}`;
            setNotice(`If no mail app opened, write to me at ${EMAIL}`);
            window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body())}`;
        }
    };

    const rows = [
        { label: "WhatsApp", value: "Chat with me", href: `https://wa.me/${WHATSAPP}`, icon: FaWhatsapp, newTab: true },
        { label: "Email", value: EMAIL, href: `mailto:${EMAIL}`, icon: BiEnvelope },
        { label: "Call", value: PHONE, href: `tel:${PHONE}`, icon: BiPhone },
    ];

    return (
        <section id="contact" className="scroll-mt-16 bg-black px-5 pb-12 pt-14 text-white">
            <Wrap>
                <p className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs">
                    <PulseDot />
                    {STATUS}
                </p>

                <h2 className="mt-5 text-6xl font-extrabold leading-[0.9] tracking-tight sm:text-7xl">
                    LET'S
                    <br />
                    TALK<span className="text-red-500">.</span>
                </h2>
                <p className="mt-4 max-w-md text-gray-300">Got a project, a role or an idea? Tell me about it.</p>

                {/* big tappable contact rows */}
                <div className="mt-8 grid gap-3 md:grid-cols-3">
                    {rows.map(({ label, value, href, icon: Icon, newTab }) => (
                        <a
                            key={label}
                            href={href}
                            {...(newTab && { target: "_blank", rel: "noopener noreferrer" })}
                            className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-red-500 hover:bg-red-500"
                        >
                            <span className="grid h-12 w-12 flex-none place-items-center rounded-full bg-white/10 text-2xl group-hover:bg-white/20">
                                <Icon />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-xs uppercase tracking-widest text-gray-400 group-hover:text-white/80">{label}</span>
                                <span className="block truncate text-lg font-semibold">{value}</span>
                            </span>
                            <RiArrowRightUpLine className="flex-none text-2xl transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                        </a>
                    ))}
                </div>

                {/* quick message */}
                <div className="mt-8 max-w-2xl rounded-3xl bg-white p-5 text-black">
                    <h3 className="text-xl font-bold">Or leave a quick message</h3>
                    <p className="text-sm text-gray-600">It opens WhatsApp or your email app with your message ready to send.</p>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="mt-4 w-full rounded-xl border p-3 outline-none focus:border-red-500"
                    />
                    <textarea
                        value={message}
                        onChange={(e) => { setMessage(e.target.value); setError(""); }}
                        placeholder="What would you like to build?"
                        rows={4}
                        className="mt-3 w-full rounded-xl border p-3 outline-none focus:border-red-500"
                    />
                    {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                    {notice && <p className="mt-2 text-sm text-gray-600">{notice}</p>}

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <button
                            onClick={() => send("whatsapp")}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-red-500 px-5 py-3 font-semibold text-white transition hover:bg-red-600 active:scale-95"
                        >
                            <FaWhatsapp className="text-xl" /> Send on WhatsApp
                        </button>
                        <button
                            onClick={() => send("email")}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-black px-5 py-3 font-semibold transition hover:bg-black hover:text-white active:scale-95"
                        >
                            <BiEnvelope className="text-xl" /> Send by email
                        </button>
                    </div>
                </div>

                {/* socials */}
                <div className="mt-6 flex flex-wrap gap-2">
                    {contacts.filter((c) => c.newTab).map(({ label, href, icon: Icon }) => (
                        <a
                            key={label}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm transition hover:bg-white hover:text-black"
                        >
                            <Icon className="text-lg" /> {label}
                        </a>
                    ))}
                </div>
            </Wrap>
        </section>
    );
}

/* ---------- CV section (last on the page) ---------- */
function CvSection({ skillNames }) {
    const snapshot = [
        ["Role", "Full-stack software developer"],
        ["Based in", "Benin City, Nigeria"],
        ["Focus", "Multi-tenant, high performance systems, and offline-first apps"],
        ["Core skills", skillNames.slice(0, 6).join(", ") || "-"],
    ];

    return (
        <section
            id="cv"
            className="scroll-mt-16 px-5 pt-14"
            style={{ paddingBottom: "max(2.5rem, env(safe-area-inset-bottom))" }}
        >
            <Wrap>
                <p className="text-xs uppercase tracking-widest text-gray-500">Résumé</p>
                <h2 className="mt-2 text-6xl font-extrabold leading-[0.9] tracking-tight">
                    MY
                    <br />
                    CV<span className="text-red-500">.</span>
                </h2>

                <span className="text-bold">Most of my code is in private repos. Happy to do a live walkthrough or share access.</span>

                <div className="mt-6 max-w-xl rounded-3xl border p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <span className="grid h-14 w-14 flex-none place-items-center rounded-2xl bg-red-500 text-3xl text-white">
                            <HiOutlineDocumentText />
                        </span>
                        <div>
                            <b className="block text-lg">Unique</b>
                            <span className="text-sm text-gray-600">Full-stack developer · PDF</span>
                        </div>
                    </div>

                    <dl className="mt-5 divide-y text-sm">
                        {snapshot.map(([k, v]) => (
                            <div key={k} className="flex justify-between gap-4 py-2.5">
                                <dt className="text-gray-500">{k}</dt>
                                <dd className="text-right font-medium">{v}</dd>
                            </div>
                        ))}
                    </dl>

                    <div className="mt-5 grid gap-2 sm:grid-cols-2">
                        <a
                            href={CV_URL}
                            download="Unique-CV.pdf"
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-red-500 px-5 py-3 font-semibold text-white transition hover:bg-red-600 active:scale-95"
                        >
                            <BiDownload className="text-xl" /> Download CV
                        </a>
                        <a
                            href={CV_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-black px-5 py-3 font-semibold transition hover:bg-black hover:text-white active:scale-95"
                        >
                            Open in new tab <RiExternalLinkFill />
                        </a>
                    </div>
                </div>

                <div className="mt-10 flex items-center justify-between border-t pt-5 text-xs text-gray-500">
                    <span>© {new Date().getFullYear()} Unique · Benin City, Nigeria</span>
                    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="underline hover:text-black">
                        Back to top ↑
                    </button>
                </div>
            </Wrap>
        </section>
    );
}



function EndorseButton({ name, endorse, onEndorse }) {
    const key = norm(name);
    const done = endorse.mine.includes(key);
    const n = endorse.counts[key] || 0;
    return (
        <button
            onClick={() => onEndorse(name)}
            disabled={done}
            aria-label={done ? `You endorsed ${name}` : `Endorse ${name}`}
            title={done ? "You endorsed this" : `Endorse ${name}`}
            className={`inline-flex items-center gap-1 text-xs font-semibold transition active:scale-95 ${
                done ? "text-red-500" : "text-gray-400 hover:text-red-500"
            }`}
        >
            {done ? <BiSolidLike className="text-base" /> : <BiLike className="text-base" />}
            {n > 0 && <span>{n}</span>}
        </button>
    );
}

const track = (type, ref) =>
    fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ref }),
    }).catch(() => {});

export default function Face() {
    const [contents, setContents] = useState([]);
    const [loadingExp, setLoadingExp] = useState(true);
    const [selected, setSelected] = useState(null);
    const [aboutOpen, setAboutOpen] = useState(false);
    const [endorse, setEndorse] = useState({ counts: {}, mine: [] });
    const [skills, setSkills] = useState([]);
    const [loadingSkills, setLoadingSkills] = useState(true);
    const [activeSkill, setActiveSkill] = useState(null); // skill name used to filter the projects
    const projectsRef = useRef(null);
    const [codeOpen, setCodeOpen] = useState(false);

    const fetchAllExp = async () => {
        try {
            const res = await fetch("/api/projectandwork", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            const data = await res.json();

            if (res.ok) {
                setContents(data.fetchAll || data || []);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoadingExp(false);
        }
    };

    const fetchSkills = async () => {
        try {
            const res = await fetch("/api/skills", { cache: "no-store" });
            const data = await res.json();

            if (res.ok) {
                setSkills(data.skills || data || []);
            }
        } catch (error) {
            console.error("Skills fetch error:", error);
        } finally {
            setLoadingSkills(false);
        }
    };

    const fetchEndorse = async () => {
    try {
        const res = await fetch("/api/endorse", { cache: "no-store" });
        if (res.ok) setEndorse(await res.json());
    } catch (e) {
        console.error(e);
    }
};

const endorseSkill = async (name) => {
    const key = norm(name);
    if (endorse.mine.includes(key)) return;
    // show it instantly, then save
    setEndorse((p) => ({
        counts: { ...p.counts, [key]: (p.counts[key] || 0) + 1 },
        mine: [...p.mine, key],
    }));
    try {
        const res = await fetch("/api/endorse", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ skill: key }),
        });
        const data = await res.json();
        if (data.already) fetchEndorse(); // server says already endorsed, resync
    } catch {
        fetchEndorse();
    }
};

useEffect(() => {
    try {
        if (sessionStorage.getItem("visited")) return;
        sessionStorage.setItem("visited", "1");
    } catch {}
    track("visit");
}, []);

    useEffect(() => {
    fetchAllExp();
    fetchSkills();
    fetchEndorse();
}, []);
    /* ---------- skills <-> projects link ---------- */
    const usesSkill = (project, name) => stackOf(project.stack).some((t) => norm(t) === norm(name));
    const countFor = (name) => contents.filter((p) => usesSkill(p, name)).length;

    // unique, non-empty skills, most-used first
    const skillList = [...new Map(skills.map((s) => [norm(skillName(s)), skillName(s)])).entries()]
        .filter(([key, name]) => key && name)
        .map(([, name]) => ({ name, count: countFor(name) }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    const skillNames = skillList.map((s) => s.name);
    const maxCount = Math.max(1, ...skillList.map((s) => s.count));

    // live / pilot projects first, then the rest in their original order
    // order comes from the database (display_order)
    const visible = activeSkill ? contents.filter((p) => usesSkill(p, activeSkill)) : contents;

    const pickSkill = (name) => {
        const next = activeSkill && norm(activeSkill) === norm(name) ? null : name;
        setActiveSkill(next);
        if (next) projectsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <>
            <Header />

            {/* HERO */}
            <section id="home" className="relative overflow-hidden px-5 pb-12 pt-6">
                <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0
       bg-[linear-gradient(to_right,rgba(0,0,0,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.15)_1px,transparent_1px)]
        bg-[size:40px_40px]
        [-webkit-mask-image:linear-gradient(to_bottom,black_60%,transparent)]
        [mask-image:linear-gradient(to_bottom,black_60%,transparent)]"
/>

                <Wrap>
                    <Reveal>
                        <div className="flex items-center gap-4">
                            <div className="relative flex-none">
                                <img
                                    src="/ppic.PNG"
                                    alt="Unique"
                                    width={96}
                                    height={96}
                                    className="h-24 w-24 rounded-full bg-red-500 object-cover shadow-xl ring-4 ring-white"
                                />
                                <span className="absolute bottom-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-white shadow">
                                    <PulseDot />
                                </span>
                            </div>
                            <div>
                                <p className="text-lg font-semibold">Hello its Unique.</p>
                                <p className="mt-1 inline-flex items-center gap-1 rounded-full border bg-white px-3 py-1 text-xs text-gray-600">
                                    <BiMap className="text-base" /> Benin City, Nigeria
                                </p>
                            </div>
                        </div>
                    </Reveal>

                    <p className="mt-3 select-none font-mono text-[0.65rem] tracking-widest text-red-500 sm:text-xs">
                        01010101 01001110 01001001 01010001 01010101 01000101
                        <span className="mt-1 block text-gray-400">that's my name, in binary</span>
                    </p>
                    <Reveal delay={100}>
                        <h1 className="mt-3 text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">
                            I turn great ideas into 1s and 0s{" "}
                            <span className="relative whitespace-nowrap">
                                that scale
                                <svg
                                    aria-hidden="true"
                                    viewBox="0 0 120 8"
                                    preserveAspectRatio="none"
                                    className="absolute -bottom-2 left-0 h-2 w-full text-red-500"
                                >
                                    <path
                                        d="M0 4 Q 10 0 20 4 T 40 4 T 60 4 T 80 4 T 100 4 T 120 4"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </span>
                            <span className="text-red-500">.</span>
                        </h1>
                    </Reveal>

                    {/* skills fetched from the skills table */}
                    <Reveal delay={200}>
                        <div className="mt-7 flex flex-wrap items-center gap-2">
                            {loadingSkills
                                ? [1, 2, 3, 4].map((i) => <span key={i} className="h-8 w-20 animate-pulse rounded-full bg-gray-200" />)
                                : skillNames.slice(0, 6).map((n) => (
                                    <span key={n} className="rounded-full border bg-white px-3 py-1 text-sm shadow-sm">{n}</span>
                                ))}
                            {skillNames.length > 0 && (
                                <button
                                    onClick={() => goTo("skills")}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-sm font-semibold text-red-500 hover:underline"
                                >
                                    See more <RiArrowRightUpLine className="text-lg" />
                                </button>
                            )}
                        </div>
                    </Reveal>

                    <Reveal delay={250}>
                        <div className="mt-5 text-sm items-center">
                            <div>2 years in Software development • 21 projects shipped(Most in private repo)</div>
                        </div>
                    </Reveal>

                    <Reveal delay={300}>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <a
                                href={`https://wa.me/${WHATSAPP}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-full bg-red-500 px-6 py-3.5 font-semibold text-white shadow-md transition hover:bg-red-600 hover:shadow-lg active:scale-95"
                            >
                                <FaWhatsapp className="text-xl" /> Chat on WhatsApp
                            </a>
                            <button
                                onClick={() => goTo("cv")}
                                className="inline-flex items-center gap-2 rounded-full border border-black px-6 py-3.5 font-semibold transition hover:bg-black hover:text-white active:scale-95"
                            >
                                <MdOutlineContactPage className="text-xl" /> View my CV
                            </button>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                            {contacts.map(({ label, href, icon: Icon, newTab }) => {
                                const cls =
                                    "grid h-12 w-12 place-items-center rounded-full border bg-white text-xl shadow-sm transition hover:-translate-y-0.5 hover:border-red-500 hover:bg-red-500 hover:text-white";

                                return label === "GitHub" ? (
                                    <button key={label} onClick={() => setCodeOpen(true)} aria-label={label} title={label} className={cls}>
                                        <Icon />
                                    </button>
                                ) : (
                                    <a
                                        key={label}
                                        href={href}
                                        aria-label={label}
                                        title={label}
                                        {...(newTab && { target: "_blank", rel: "noopener noreferrer" })}
                                        className={cls}
                                    >
                                        <Icon />
                                    </a>
                                );
                            })}
                        </div>
                    </Reveal>
                </Wrap>
            </section>

            <SkillBand names={skillNames} />

            {/* ABOUT */}
            <section id="about" className="scroll-mt-16 px-5 py-4">
                <Wrap>
                    <Reveal>
                        <p className="text-xs uppercase tracking-widest text-gray-500">About</p>
                        <h2 className="mt-2 text-4xl font-extrabold leading-[1.02] tracking-tight">
                            BUILDING THINGS <br /> THAT IMPACT<span className="text-red-500">.</span>
                        </h2>
                        <p className="mt-4 max-w-xl text-lg leading-relaxed text-gray-700">{ABOUT_INTRO}</p>
                        <button
                            onClick={() => setAboutOpen(true)}
                            className="group mt-5 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 font-semibold text-white transition hover:bg-red-500 active:scale-95"
                        >
                            About me
                            <RiArrowRightUpLine className="text-xl transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </button>
                    </Reveal>
                </Wrap>
            </section>

            {/* PROJECTS (dark) */}
            <section id="projects" className="scroll-mt-16 bg-black px-2 py-12 text-white">
                <Wrap>
                    <p className="text-xs uppercase tracking-widest text-gray-400">Work</p>
                    <h1 ref={projectsRef} className="scroll-mt-20 py-3 text-4xl font-bold">SELECTED <br /> PROJECTS</h1>

                    {activeSkill && (
                        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-100">
                            <span>
                                {visible.length} {visible.length === 1 ? "project" : "projects"} built with <b>{activeSkill}</b>
                            </span>
                            <button onClick={() => setActiveSkill(null)} className="font-semibold text-red-300 underline">
                                Clear
                            </button>
                        </div>
                    )}

                    {loadingExp && (
                        <div className="grid gap-4 md:grid-cols-2">
                            {[1, 2].map((i) => (
                                <div key={i} className="h-72 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
                            ))}
                        </div>
                    )}

                    {!loadingExp && visible.length === 0 && !activeSkill && (
                        <p className="text-gray-400">Projects are being added.</p>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                        {visible.map((item, index) => {
                            const tags = stackOf(item.stack);
                            return (
                                <div key={item.id || index} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-2 text-xs">
                                            <span className="px-2 py-0.5 rounded bg-white/10">{item.mode}</span>
                                            {isLive(item.status) && (
                                                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">{item.status}</span>
                                            )}
                                        </div>
                                    </div>

                                    {item.img && (
                                        <img src={item.img} alt="Preview" loading="lazy" decoding="async" className="my-3 h-80 w-full rounded-xl border border-white/10 object-cover" />
                                    )}

                                    <h3 className="mt-2 font-bold text-lg">{item.title}</h3>
                                    <h3 className="font-bold text-md text-gray-200">{item.subtitle}</h3>
                                    <p className="text-sm text-gray-400">{item.summary}</p>

                                    {/* a few stack tags, the selected skill is highlighted */}
                                    {tags.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {tags.slice(0, 4).map((t) => (
                                                <span
                                                    key={t}
                                                    className={`rounded-full border px-2.5 py-0.5 text-xs ${activeSkill && norm(t) === norm(activeSkill)
                                                        ? "border-red-500 bg-red-500 text-white"
                                                        : "border-white/20"
                                                        }`}
                                                >
                                                    {t}
                                                </span>
                                            ))}
                                            {tags.length > 4 && <span className="px-1 text-xs text-gray-500">+{tags.length - 4} more</span>}
                                        </div>
                                    )}

                                    <div className="mt-3 text-sm text-gray-400">{item.footerleft}</div>

                                    {/* Opens the modal */}
                                    <button
                                        onClick={() => { setSelected(item); track("project_open", item.title); }}
                                        className="group mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-500 px-5 py-3 font-semibold text-white shadow-md transition hover:bg-red-600 hover:shadow-lg active:scale-95"
                                    >
                                        View project
                                        <BiRightArrowAlt className="text-2xl transition-transform group-hover:translate-x-1" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </Wrap>
            </section>

            {/* SKILLS */}
            <section id="skills" className="scroll-mt-16 px-5 py-14">
                <Wrap>
                    <Reveal>
                        <p className="text-xs uppercase tracking-widest text-gray-500">Toolbox</p>
                        <h2 className="mt-2 text-4xl font-extrabold tracking-tight">
                            SKILLS<span className="text-red-500">.</span>
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Tap a skill to see the projects built with it. Tap 👍 to endorse.
                        </p>
                    </Reveal>

                    <Reveal delay={100}>
                        <div className="mt-5 rounded-3xl border bg-white p-5 shadow-sm">
                            {loadingSkills ? (
                                <div className="flex flex-wrap gap-2">
                                    {[1, 2, 3, 4, 5, 6].map((i) => <span key={i} className="h-9 w-24 animate-pulse rounded-full bg-gray-200" />)}
                                </div>
                            ) : skillList.length === 0 ? (
                                <p className="text-gray-500">No skills added yet.</p>
                            ) : (
                                <div className="flex flex-wrap items-center gap-2.5">
                                   {skillList.map(({ name, count }) => {
    // no matching project: plain chip, no count, not clickable
    if (count === 0) {
      return (
    <span key={name} className="inline-flex items-center gap-1">
        <span className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-1.5 text-sm font-semibold text-gray-700">
            <SkillIcon name={name} />
            {name}
        </span>
        <EndorseButton name={name} endorse={endorse} onEndorse={endorseSkill} />
    </span>
);
    }

    const on = activeSkill && norm(activeSkill) === norm(name);
    return (
        <span key={name} className="inline-flex flex-col items-center gap-1">
            <button
                onClick={() => pickSkill(name)}
                aria-pressed={!!on}
                style={{ fontSize: `${(0.875 + (count / maxCount) * 0.75).toFixed(2)}rem` }}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-semibold transition hover:-translate-y-0.5 active:scale-95 ${
                    on ? "border-red-500 bg-red-500 text-white" : "bg-white hover:border-red-500"
                }`}
            >
                <SkillIcon name={name} white={!!on} />
                {name}
            </button>
            <EndorseButton name={name} endorse={endorse} onEndorse={endorseSkill} />
        </span>
    );
})}
                                </div>
                            )}
                        </div>
                    </Reveal>
                </Wrap>
            </section>

            <Testimonials />

            {selected && <ProjectModal item={selected} onClose={() => setSelected(null)} />}
            {aboutOpen && <AboutModal projects={contents} skillNames={skillNames} onClose={() => setAboutOpen(false)} />}
            {codeOpen && <CodeModal onClose={() => setCodeOpen(false)} />}

            <ContactSection />
            <CvSection skillNames={skillNames} />
            <StickyTalk />
        </>
    );
}