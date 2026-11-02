"use client";

import { useState } from "react";
import { RiExternalLinkFill } from "react-icons/ri";
import { BiChevronDown } from "react-icons/bi";

/* ---------- data: replace with your real content ---------- */

const work = [
  {
    id: "work-1",
    title: "Role Title",
    subtitle: "Company Name | 2024 - Present",
    img: "/work-1.png",
    summary: "One or two lines on what you owned and the result.",
    stack: ["React", "Node.js", "AWS"],
    footerLeft: "Full-time",
    details: [
      "Built and shipped a feature that did X, used by Y people.",
      "Cut load time / cost / errors by Z.",
    ],
  },
  {
    id: "work-2",
    title: "Role Title",
    subtitle: "Company Name | 2023 - 2024",
    img: "/work-2.png",
    summary: "One or two lines on what you owned and the result.",
    stack: ["React Native", "TypeScript"],
    footerLeft: "Contract",
    details: [
      "Responsibility or achievement one.",
      "Responsibility or achievement two.",
    ],
  },
];

const projects = [
  {
    id: "proj-1",
    title: "Revisit HMS",
    status: "Live",
    subtitle: "Hospital Management System",
    img: "/revisit-hms.png",
    summary:
      "A multi-module hospital management application covering patient records, appointments, billing, pharmacy and hospital operations.",
    stack: ["Next.js", "React", "Supabase", "Dexie.js"],
    footerLeft: "Full-stack development | Personal project",
    href: "#", // case study link
    details: [
      "Multi-tenant: each hospital's data is isolated on one codebase.",
      "Offline-first storage with IndexedDB and sync.",
      "Role-based access for staff.",
    ],
  },
  {
    id: "proj-2",
    title: "Task Rewards Platform",
    status: "In progress",
    subtitle: "Tasks and payouts",
    img: "/task-rewards.png",
    summary:
      "Businesses fund tasks, users earn rewards in naira, and admins review proofs before payouts.",
    stack: ["Next.js", "Supabase", "Tailwind CSS"],
    footerLeft: "Full-stack development | Personal project",
    href: "#",
    details: [
      "Wallet and ledger tracked in kobo.",
      "Proof review queue for admins.",
      "Bulk payout export.",
    ],
  },
];

/* ---------- shared pieces ---------- */

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

function ExpandCard({ item }) {
  const [open, setOpen] = useState(false);
  const panelId = `${item.id}-panel`;

  return (
    <article className="relative border border-current/30 p-4">
      <Corners />

      <img
        src={item.img}
        alt={`${item.title} preview`}
        width={800}
        height={450}
        className="aspect-video w-full border border-current/30 object-cover object-top grayscale"
      />

      {/* Title + status */}
      <div className="mt-4 flex items-start justify-between gap-3 font-mono">
        <h3 className="text-xl font-semibold tracking-wide">{item.title}</h3>
        {item.status && (
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-current/40 px-3 py-1 text-xs tracking-widest">
            <span aria-hidden className="h-2 w-2 rounded-full bg-current" />
            {item.status}
          </span>
        )}
      </div>

      {item.subtitle && (
        <p className="mt-1 font-mono text-sm tracking-wide opacity-70">
          {item.subtitle}
        </p>
      )}

      <p className="mt-3 text-sm leading-relaxed opacity-90">{item.summary}</p>

      {/* Tech stack chips */}
      {item.stack?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {item.stack.map((s) => (
            <span
              key={s}
              className="rounded-full bg-current/10 px-3 py-1 font-mono text-xs"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Footer row: type on the left, link on the right */}
      {(item.footerLeft || item.href) && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-current/30 pt-3 text-sm">
          <span className="opacity-60">{item.footerLeft}</span>
          {item.href && (
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono font-semibold"
            >
              View case study
              <RiExternalLinkFill />
            </a>
          )}
        </div>
      )}

      {/* Collapsible details: stacked blocks */}
      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="mt-4 flex flex-col gap-2 text-sm">
            {item.details.map((d) => (
              <div
                key={d}
                className="border border-current/30 border-l-4 px-3 py-2 leading-relaxed"
              >
                {d}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expand button at the bottom */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="mt-4 flex w-full items-center justify-center gap-1 border border-current/30 py-2 font-mono text-xs tracking-widest transition-colors hover:bg-current/10"
      >
        {open ? "COLLAPSE" : "EXPAND"}
        <BiChevronDown
          className={`text-lg transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
    </article>
  );
}

function SectionShell({ id, heading, items }) {
  return (
    <>
      <section id={id} className="m-4 mt-8">
        <h2 className="font-mono text-2xl font-semibold tracking-widest">
          {heading}
        </h2>
        <div className="mt-4 flex flex-col gap-6">
          {items.map((item) => (
            <ExpandCard key={item.id} item={item} />
          ))}
        </div>
      </section>
      <hr className="mt-6" />
    </>
  );
}

/* ---------- exports ---------- */

export function Work() {
  return <SectionShell id="work" heading="WORK" items={work} />;
}

export function Projects() {
  return <SectionShell id="projects" heading="PROJECTS" items={projects} />;
}