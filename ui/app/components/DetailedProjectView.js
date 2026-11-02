"use client";

import { useCallback, useEffect, useState } from "react";
import { RiExternalLinkFill } from "react-icons/ri";
import { BiX } from "react-icons/bi";

/* ---------- data: draft content, edit to match your real build ---------- */

const data = [
  {
    id: "revisit-hms",
    img: "/revisit-hms.png",
    title: "Revisit HMS",
    subtitle: "Hospital Management System",
    status: "Live",
    role: "Full-stack developer",
    timeline: "Month YYYY - Present",
    team: "Solo project",
    stack: ["Next.js", "React", "Supabase", "Tailwind CSS", "Dexie.js"],
    overview:
      "A multi-module hospital management application covering patient records, appointments, billing, pharmacy, laboratory and hospital operations. Each hospital runs as its own tenant on one shared codebase.",
    problem:
      "Many clinics still run on paper or disconnected tools, and their internet is unreliable. Staff lose time re-entering data, billing leaks, and nobody sees the full picture of a patient's visit. The system had to keep working when the connection dropped.",
    keyFeatures: [
      "Patient records with visit history",
      "Appointments, slot availability and calendar",
      "Laboratory, pharmacy and inventory modules",
      "Billing with pending invoices and daily revenue",
      "Inpatient and bed occupancy tracking",
      "Role-based dashboards with critical alerts",
    ],
    technicalArchitecture:
      "A Next.js front end talks to Supabase for auth, Postgres and storage. Reads and writes go through a local IndexedDB layer first, and a sync queue pushes changes to the server when the network is back.",
    architectureLayers: [
      { label: "Interface", value: "Next.js, React, Tailwind CSS" },
      { label: "Local data", value: "IndexedDB via Dexie.js, with a sync queue" },
      { label: "Backend", value: "Supabase: Auth, Postgres, Storage" },
      { label: "Tenancy", value: "Tenant id on every table, enforced with row level security" },
    ],
    implementation: [
      "Designed the tenant-aware schema and access policies.",
      "Built the auth flow and role-based routing.",
      "Shipped core modules first: patients, appointments, billing.",
      "Added the offline layer and sync queue.",
      "Built laboratory, pharmacy and inpatient modules.",
      "Ran a pre-pilot bug pass with real workflows.",
    ],
    engineeringDecisions: [
      {
        title: "Local-first writes",
        reason:
          "Staff should never wait on the network to save a record, so the UI writes to IndexedDB and syncs in the background.",
      },
      {
        title: "Isolation in the database",
        reason:
          "Tenant separation lives in database policies, so a bug in front-end code can't leak one hospital's data to another.",
      },
      {
        title: "One codebase, many hospitals",
        reason:
          "A single deployment is cheaper to maintain than a copy per client, and fixes reach everyone at once.",
      },
    ],
    challenges: [
      {
        title: "Sync conflicts",
        solution:
          "Two devices could edit the same record offline. Added per-record timestamps and a clear rule for which edit wins.",
      },
      {
        title: "Large module surface",
        solution:
          "Dozens of screens risked inconsistency. Built shared table, form and alert components and reused them everywhere.",
      },
    ],
    testing: [
      "Manual walkthroughs of each role's daily workflow",
      "Offline and reconnect scenarios on throttled networks",
      "Cross-tenant checks to confirm no data crosses hospitals",
    ],
    resultsImpact: [
      "Modules covering X hospital departments in one system",
      "Records stay usable with no connection",
      "Pre-pilot bug list cut from X open issues to Y",
    ],
    limitations: [
      "Conflict handling is simple and may need merge tools for heavy concurrent edits.",
      "Reporting is basic and needs deeper analytics.",
      "Not yet validated at scale across many hospitals.",
    ],
    lessonsLearned: [
      "Design the data model for tenancy before writing any screens.",
      "Offline support is easier to add early than to retrofit.",
    ],
    nextSteps: [
      "Pilot with a first hospital and collect feedback",
      "Add analytics dashboards",
      "Add automated tests for sync",
    ],
    links: [
      { label: "Live demo", href: "#" },
      { label: "Source code", href: "#" },
    ],
  },
  {
    id: "task-rewards",
    img: "/task-rewards.png",
    title: "Task Rewards Platform",
    subtitle: "Tasks and payouts",
    status: "In progress",
    role: "Full-stack developer",
    timeline: "Month YYYY - Present",
    team: "Solo project",
    stack: ["Next.js", "Supabase", "Tailwind CSS"],
    overview:
      "Businesses fund tasks, users complete them for rewards in naira, and admins review proofs before payouts go out in bulk.",
    problem:
      "Small businesses want real users to complete simple actions, but tracking proof and paying people one by one is slow and error prone.",
    keyFeatures: [
      "Business task creation and funding",
      "User task feed with proof upload",
      "Admin proof review queue",
      "Wallet and ledger in kobo",
      "Bulk payout export",
    ],
    technicalArchitecture:
      "Next.js front end on Supabase. Money is stored as integer kobo, and every balance change is a ledger entry rather than an edited number.",
    architectureLayers: [
      { label: "Interface", value: "Next.js, Tailwind CSS" },
      { label: "Backend", value: "Supabase: Auth, Postgres, Storage" },
      { label: "Payments", value: "Ledger table plus bulk payout export" },
    ],
    implementation: [
      "Modeled users, tasks, submissions and the ledger.",
      "Built the funding and submission flows.",
      "Built the admin review queue.",
      "Added payout export for bulk transfers.",
    ],
    engineeringDecisions: [
      {
        title: "Integer kobo, never decimals",
        reason: "Avoids rounding errors in anything that touches money.",
      },
      {
        title: "Append-only ledger",
        reason: "Every balance can be traced and audited from its entries.",
      },
    ],
    challenges: [
      {
        title: "Fake or duplicate proofs",
        solution: "Added a review queue and checks for repeated submissions.",
      },
    ],
    testing: [
      "Ledger totals checked against wallet balances",
      "Walkthroughs of fund, submit, review and payout",
    ],
    resultsImpact: ["End-to-end flow working from funding to payout"],
    limitations: [
      "Payouts are exported manually, not sent automatically.",
      "No automated fraud detection yet.",
    ],
    lessonsLearned: ["Treat money as a ledger from day one."],
    nextSteps: ["Automate payouts", "Add fraud checks"],
    links: [{ label: "Live demo", href: "#" }],
  },
];

/* ---------- small building blocks ---------- */

function Corners() {
  const base = "pointer-events-none absolute h-3 w-3 border-current";
  return (
    <>
      <span className={`${base} left-0 top-0 border-l-2 border-t-2`} />
      <span className={`${base} right-0 top-0 border-r-2 border-t-2`} />
      <span className={`${base} bottom-0 left-0 border-b-2 border-l-2`} />
      <span className={`${base} bottom-0 right-0 border-b-2 border-r-2`} />
    </>
  );
}

function Section({ title, children }) {
  return (
    <section className="mt-8">
      <h3 className="border-b border-current/30 pb-2 font-mono text-sm font-semibold tracking-widest">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

// Stacked blocks of plain text
function Stack({ items }) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      {items.map((t) => (
        <div
          key={t}
          className="border border-current/30 border-l-4 px-3 py-2 leading-relaxed"
        >
          {t}
        </div>
      ))}
    </div>
  );
}

// Stacked blocks with a bold heading line and a body line
function PairStack({ items, titleKey, textKey, tag }) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      {items.map((it) => (
        <div
          key={it[titleKey]}
          className="border border-current/30 border-l-4 px-3 py-2 leading-relaxed"
        >
          <p className="font-mono font-semibold">{it[titleKey]}</p>
          <p className="mt-1 opacity-80">
            {tag && <span className="font-mono opacity-60">{tag} </span>}
            {it[textKey]}
          </p>
        </div>
      ))}
    </div>
  );
}

function Chips({ items }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((s) => (
        <span
          key={s}
          className="rounded-full bg-current/10 px-3 py-1 font-mono text-xs"
        >
          {s}
        </span>
      ))}
    </div>
  );
}

/* ---------- the modal ---------- */

function CaseStudyModal({ project, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    const prevOverflow = document.body.style.overflow;
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const facts = [
    ["Role", project.role],
    ["Timeline", project.timeline],
    ["Team", project.team],
    ["Status", project.status],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-study-title"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto border border-current/40 bg-[Canvas] text-[CanvasText]"
      >
        {/* Sticky header with close button */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-current/30 bg-[Canvas] px-4 py-3">
          <h2
            id="case-study-title"
            className="font-mono text-lg font-semibold tracking-wide"
          >
            {project.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close case study"
            className="border border-current/30 p-1 text-xl transition-colors hover:bg-current/10"
          >
            <BiX />
          </button>
        </div>

        <div className="p-4">
          <img
            src={project.img}
            alt={`${project.title} preview`}
            width={1200}
            height={675}
            className="aspect-video w-full border border-current/30 object-cover object-top grayscale"
          />

          <p className="mt-4 font-mono text-sm tracking-wide opacity-70">
            {project.subtitle}
          </p>

          {/* Quick facts */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {facts.map(([label, value]) => (
              <div key={label} className="border border-current/30 p-3">
                <p className="font-mono text-xs opacity-60">{label}</p>
                <p className="mt-1 text-sm">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Chips items={project.stack} />
          </div>

          <Section title="OVERVIEW">
            <p className="text-sm leading-relaxed">{project.overview}</p>
          </Section>

          <Section title="THE PROBLEM">
            <p className="text-sm leading-relaxed">{project.problem}</p>
          </Section>

          <Section title="KEY FEATURES">
            <Stack items={project.keyFeatures} />
          </Section>

          <Section title="TECHNICAL ARCHITECTURE">
            <p className="text-sm leading-relaxed">
              {project.technicalArchitecture}
            </p>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              {project.architectureLayers.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 border border-current/30 px-3 py-2 sm:flex-row sm:gap-4"
                >
                  <span className="shrink-0 font-mono font-semibold sm:w-28">
                    {label}
                  </span>
                  <span className="opacity-80">{value}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* A real sequence, so numbering makes sense here */}
          <Section title="IMPLEMENTATION">
            <ol className="flex flex-col gap-2 text-sm">
              {project.implementation.map((step, i) => (
                <li
                  key={step}
                  className="flex gap-3 border border-current/30 px-3 py-2 leading-relaxed"
                >
                  <span className="font-mono opacity-60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </Section>

          <Section title="ENGINEERING DECISIONS">
            <PairStack
              items={project.engineeringDecisions}
              titleKey="title"
              textKey="reason"
            />
          </Section>

          <Section title="CHALLENGES AND SOLUTIONS">
            <PairStack
              items={project.challenges}
              titleKey="title"
              textKey="solution"
            />
          </Section>

          <Section title="TESTING">
            <Stack items={project.testing} />
          </Section>

          <Section title="RESULTS AND IMPACT">
            <Stack items={project.resultsImpact} />
          </Section>

          <Section title="LIMITATIONS">
            <Stack items={project.limitations} />
          </Section>

          <Section title="LESSONS LEARNED">
            <Stack items={project.lessonsLearned} />
          </Section>

          <Section title="WHAT'S NEXT">
            <Stack items={project.nextSteps} />
          </Section>

          <Section title="LINKS">
            <div className="flex flex-wrap gap-3">
              {project.links.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 border border-current/30 px-3 py-2 font-mono text-sm transition-colors hover:bg-current/10"
                >
                  {label}
                  <RiExternalLinkFill />
                </a>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ---------- the view: list of case studies + modal ---------- */

export default function DetailedProjectsView() {
  const [activeId, setActiveId] = useState(null);
  const close = useCallback(() => setActiveId(null), []);
  const active = data.find((p) => p.id === activeId);

  return (
    <>
      <section id="case-studies" className="m-4 mt-8">
        <h2 className="font-mono text-2xl font-semibold tracking-widest">
          CASE STUDIES
        </h2>

        <div className="mt-4 flex flex-col gap-6">
          {data.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveId(item.id)}
              className="relative border border-current/30 p-4 text-left transition-colors hover:bg-current/5"
            >
              <Corners />
              <img
                src={item.img}
                alt={`${item.title} preview`}
                width={800}
                height={450}
                className="aspect-video w-full border border-current/30 object-cover object-top grayscale"
              />
              <div className="mt-4 flex items-start justify-between gap-3 font-mono">
                <h3 className="text-xl font-semibold tracking-wide">
                  {item.title}
                </h3>
                <span className="shrink-0 rounded-full border border-current/40 px-3 py-1 text-xs">
                  {item.status}
                </span>
              </div>
              <p className="mt-1 font-mono text-sm opacity-70">
                {item.role} | {item.timeline}
              </p>
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed opacity-90">
                {item.overview}
              </p>
              <div className="mt-4">
                <Chips items={item.stack} />
              </div>
              <span className="mt-4 inline-flex items-center gap-1 border-b border-current/50 font-mono text-sm">
                Read full case study
                <RiExternalLinkFill />
              </span>
            </button>
          ))}
        </div>
      </section>
      <hr className="mt-6" />

      {active && <CaseStudyModal project={active} onClose={close} />}
    </>
  );
}