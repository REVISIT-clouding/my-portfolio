"use client";

// app/page.jsx — single page, Tailwind, no other files needed.
import { useState, useMemo } from "react";
import { Bricolage_Grotesque, IBM_Plex_Sans } from "next/font/google";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["600", "800"] });
const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] });

const BRAND = "Arbor Capital"; // change me

const PLANS = [
  { id: "note", name: "Naira Note", rate: 12, risk: "Low", min: 50000, blurb: "Short-term naira instruments. Steady, easy to exit." },
  { id: "balanced", name: "Balanced Mix", rate: 18, risk: "Medium", min: 100000, blurb: "Bonds, money market and a slice of equities." },
  { id: "growth", name: "Growth Equity", rate: 25, risk: "High", min: 250000, blurb: "Mostly equities. Bigger swings, longer horizon." },
];

const STEPS = [
  { t: "Create your account", d: "Email, phone number and a password." },
  { t: "Verify your identity", d: "BVN and a government ID. Required by regulation, takes a few minutes." },
  { t: "Fund your wallet", d: "Bank transfer or card, in naira." },
  { t: "Pick a plan", d: "Choose the plan that matches your risk and timeline." },
  { t: "Withdraw when you need to", d: "Request a withdrawal to your verified bank account." },
];

const FAQ = [
  { q: "Are returns guaranteed?", a: "No. Every figure on this page is an illustration based on an assumed annual rate. Actual returns can be lower, and you can lose part or all of what you invest." },
  { q: "Who holds my money?", a: "Client funds should be held with a licensed custodian, separate from company funds. Replace this answer with your custodian's name and licence details." },
  { q: "What is the minimum I can invest?", a: "It depends on the plan. See the minimum shown on each plan card." },
  { q: "How long do withdrawals take?", a: "Replace with your real processing time. Be specific; people trust specifics." },
];

const naira = (n) => "₦" + Math.round(n).toLocaleString("en-NG");

function project(amount, rate, months) {
  return amount * Math.pow(1 + rate / 100 / 12, months);
}

export default function Page() {
  const [planId, setPlanId] = useState("balanced");
  const [amount, setAmount] = useState(500000);
  const [months, setMonths] = useState(12);
  const [open, setOpen] = useState(0);

  const plan = PLANS.find((p) => p.id === planId);
  const { expected, low } = useMemo(
    () => ({
      expected: project(amount, plan.rate, months),
      low: project(amount, plan.rate / 3, months),
    }),
    [amount, months, plan]
  );
  const belowMin = amount < plan.min;

  return (
    <div className={`${body.className} min-h-screen bg-[#EDF1F3] text-[#14232E]`}>
      <style>{`
        .rng{-webkit-appearance:none;appearance:none;height:6px;border-radius:99px;background:#C9D4DA;width:100%}
        .rng::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#0F4C5C;border:3px solid #fff;box-shadow:0 0 0 1px #0F4C5C;cursor:pointer}
        .rng::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#0F4C5C;border:3px solid #fff;cursor:pointer}
        .rng:focus-visible,button:focus-visible,a:focus-visible{outline:3px solid #E0A100;outline-offset:3px}
        @media (prefers-reduced-motion:reduce){*{transition:none!important}}
      `}</style>

      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <span className={`${display.className} text-xl font-extrabold tracking-tight`}>{BRAND}</span>
        <nav className="hidden gap-7 text-sm md:flex">
          <a href="#plans" className="hover:underline">Plans</a>
          <a href="#how" className="hover:underline">How it works</a>
          <a href="#faq" className="hover:underline">FAQ</a>
        </nav>
        <a href="#start" className="rounded-full bg-[#0F4C5C] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0B3A47]">
          Open account
        </a>
      </header>

      {/* Hero + calculator */}
      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-20 pt-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <div>
          <h1 className={`${display.className} text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl`}>
            See where your money could be in a year, before you put any in.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#3B4F5C]">
            Invest in naira from ₦50,000. Choose a plan, set an amount and timeline, and see a realistic range, not just the best case.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#start" className="rounded-full bg-[#0F4C5C] px-7 py-3 font-semibold text-white hover:bg-[#0B3A47]">
              Start investing
            </a>
            <a href="#plans" className="rounded-full border border-[#14232E]/25 px-7 py-3 font-semibold hover:bg-white">
              Compare plans
            </a>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-[0_20px_50px_-25px_rgba(15,76,92,.5)] sm:p-8">
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Plan">
            {PLANS.map((p) => (
              <button
                key={p.id}
                role="radio"
                aria-checked={p.id === planId}
                onClick={() => setPlanId(p.id)}
                className={`rounded-xl px-2 py-2.5 text-sm font-semibold transition-colors ${
                  p.id === planId ? "bg-[#0F4C5C] text-white" : "bg-[#EDF1F3] hover:bg-[#DCE4E8]"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          <label className="mt-7 block">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium">Amount</span>
              <span className={`${display.className} text-2xl font-extrabold`}>{naira(amount)}</span>
            </div>
            <input className="rng mt-3" type="range" min={50000} max={10000000} step={50000}
              value={amount} onChange={(e) => setAmount(+e.target.value)} />
          </label>

          <label className="mt-6 block">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium">Timeline</span>
              <span className={`${display.className} text-2xl font-extrabold`}>{months} months</span>
            </div>
            <input className="rng mt-3" type="range" min={3} max={60} step={1}
              value={months} onChange={(e) => setMonths(+e.target.value)} />
          </label>

          <div className="mt-8 rounded-2xl bg-[#EDF1F3] p-5">
            <p className="text-sm text-[#3B4F5C]">Illustrative value after {months} months</p>
            <p className={`${display.className} mt-1 text-4xl font-extrabold text-[#0F4C5C]`}>{naira(expected)}</p>
            <p className="mt-1 text-sm text-[#3B4F5C]">
              at an assumed {plan.rate}% a year. If returns are only a third of that: <b>{naira(low)}</b>.
            </p>
          </div>

          {belowMin && (
            <p role="alert" className="mt-4 text-sm font-medium text-[#9A3412]">
              {plan.name} starts at {naira(plan.min)}. Raise the amount or pick another plan.
            </p>
          )}
          <p className="mt-4 text-xs leading-relaxed text-[#5A6C78]">
            Projection only. Not a promise or guarantee. Investments can lose value.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className={`${display.className} text-4xl font-extrabold tracking-tight`}>Three plans, three levels of risk</h2>
          <p className="mt-3 max-w-xl text-[#3B4F5C]">Higher assumed returns come with bigger swings and a longer time you should be ready to stay invested.</p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {PLANS.map((p) => (
              <article key={p.id} className="flex flex-col rounded-2xl border border-[#14232E]/15 p-6">
                <h3 className={`${display.className} text-2xl font-extrabold`}>{p.name}</h3>
                <p className="mt-2 flex-1 text-[#3B4F5C]">{p.blurb}</p>
                <dl className="mt-6 space-y-2 border-t border-[#14232E]/10 pt-4 text-sm">
                  <div className="flex justify-between"><dt>Assumed return</dt><dd className="font-semibold">{p.rate}% a year</dd></div>
                  <div className="flex justify-between"><dt>Risk</dt><dd className="font-semibold">{p.risk}</dd></div>
                  <div className="flex justify-between"><dt>Minimum</dt><dd className="font-semibold">{naira(p.min)}</dd></div>
                </dl>
                <button onClick={() => { setPlanId(p.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="mt-6 rounded-full border border-[#0F4C5C] py-2.5 font-semibold text-[#0F4C5C] hover:bg-[#0F4C5C] hover:text-white">
                  Try in calculator
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — real sequence */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-20">
        <h2 className={`${display.className} text-4xl font-extrabold tracking-tight`}>How it works</h2>
        <ol className="mt-10 grid gap-4 md:grid-cols-5">
          {STEPS.map((s, i) => (
            <li key={s.t} className="rounded-2xl bg-white p-5">
              <span className={`${display.className} text-3xl font-extrabold text-[#E0A100]`}>{i + 1}</span>
              <h3 className="mt-2 font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-[#3B4F5C]">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-5 pb-20">
        <h2 className={`${display.className} text-4xl font-extrabold tracking-tight`}>Questions</h2>
        <div className="mt-8 divide-y divide-[#14232E]/15 border-y border-[#14232E]/15">
          {FAQ.map((f, i) => (
            <div key={f.q}>
              <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}
                className="flex w-full items-center justify-between py-5 text-left font-semibold">
                {f.q}
                <span aria-hidden className="ml-4 text-2xl leading-none">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && <p className="pb-5 leading-relaxed text-[#3B4F5C]">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="start" className="bg-[#0F4C5C] py-16 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 md:flex-row md:items-center">
          <h2 className={`${display.className} max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl`}>
            Open an account in about five minutes.
          </h2>
          <a href="/signup" className="rounded-full bg-[#E0A100] px-8 py-3 font-semibold text-[#14232E] hover:bg-[#F0B31A]">
            Open account
          </a>
        </div>
      </section>

      {/* Footer + risk disclosure */}
      <footer className="mx-auto max-w-6xl px-5 py-10 text-xs leading-relaxed text-[#5A6C78]">
        <p>
          <b>Risk warning:</b> All investments carry risk, including loss of capital. Past performance does not
          guarantee future results. Figures shown are illustrations using assumed rates, not forecasts or promises.
        </p>
        <p className="mt-3">
          {BRAND} is [add your SEC Nigeria registration / licence details here]. © {new Date().getFullYear()} {BRAND}.
        </p>
      </footer>
    </div>
  );
}