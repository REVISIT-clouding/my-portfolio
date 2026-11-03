"use client";

// app/dashboard/page.jsx — UI design only, all data is mock. Same palette/fonts as the landing page.
import { useState } from "react";
import { Bricolage_Grotesque, IBM_Plex_Sans } from "next/font/google";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["600", "800"] });
const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] });

const naira = (n) => "₦" + Math.round(n).toLocaleString("en-NG");

const PLANS = [
  { id: "note", name: "Naira Note", rate: 12, risk: "Low", min: 50000 },
  { id: "balanced", name: "Balanced Mix", rate: 18, risk: "Medium", min: 100000 },
  { id: "growth", name: "Growth Equity", rate: 25, risk: "High", min: 250000 },
];

const INVESTMENTS = [
  { id: 1, plan: "Balanced Mix", invested: 500000, value: 541200, start: "12 Mar 2026", matures: "12 Mar 2027", progress: 0.62 },
  { id: 2, plan: "Naira Note", invested: 200000, value: 211800, start: "02 Jun 2026", matures: "02 Dec 2026", progress: 0.9 },
  { id: 3, plan: "Growth Equity", invested: 300000, value: 284500, start: "20 Aug 2026", matures: "20 Aug 2027", progress: 0.2 },
];

const TXNS = [
  { id: "T-1048", type: "Deposit", amount: 300000, date: "20 Aug 2026", status: "Completed" },
  { id: "T-1049", type: "Investment", amount: -300000, date: "20 Aug 2026", status: "Completed" },
  { id: "T-1061", type: "Withdrawal", amount: -50000, date: "14 Oct 2026", status: "Pending" },
  { id: "T-1062", type: "Deposit", amount: 120000, date: "28 Oct 2026", status: "Completed" },
];

const GROWTH = [1000000, 1012000, 1031000, 1019000, 1048000, 1066000, 1081000, 1096000, 1112000, 1124000, 1131500];

const NAV = [
  { id: "overview", label: "Overview" },
  { id: "invest", label: "Invest" },
  { id: "wallet", label: "Wallet" },
  { id: "history", label: "History" },
];

function Chart({ data }) {
  const w = 600, h = 180, pad = 8;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => [
    pad + (i * (w - pad * 2)) / (data.length - 1),
    h - pad - ((v - min) / (max - min)) * (h - pad * 2),
  ]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0] + " " + p[1]).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-44 w-full" role="img" aria-label="Portfolio value over the last 11 weeks">
      <path d={`${line} L${w - pad} ${h} L${pad} ${h} Z`} fill="#0F4C5C" opacity=".08" />
      <path d={line} fill="none" stroke="#0F4C5C" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts.at(-1)[0]} cy={pts.at(-1)[1]} r="6" fill="#E0A100" stroke="#fff" strokeWidth="3" />
    </svg>
  );
}

function Card({ children, className = "" }) {
  return <section className={`rounded-2xl bg-white p-5 sm:p-6 ${className}`}>{children}</section>;
}

function Overview({ go }) {
  const invested = INVESTMENTS.reduce((a, b) => a + b.invested, 0);
  const value = INVESTMENTS.reduce((a, b) => a + b.value, 0);
  const gain = value - invested;
  return (
    <div className="space-y-5">
      <Card className="border border-[#E0A100]/50 !bg-[#FFF8E6]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Finish verification to withdraw</h2>
            <p className="text-sm text-[#3B4F5C]">Add your BVN and a government ID. You can invest now, but withdrawals stay locked until this is done.</p>
          </div>
          <button className="shrink-0 rounded-full bg-[#14232E] px-5 py-2 text-sm font-semibold text-white">Verify identity</button>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <p className="text-sm text-[#5A6C78]">Portfolio value</p>
          <p className={`${display.className} mt-1 text-5xl font-extrabold tracking-tight`}>{naira(value)}</p>
          <p className="mt-1 text-sm">
            <span className={gain >= 0 ? "font-semibold text-[#0F7A4A]" : "font-semibold text-[#B42318]"}>
              {gain >= 0 ? "+" : ""}{naira(gain)}
            </span>{" "}
            <span className="text-[#5A6C78]">on {naira(invested)} invested</span>
          </p>
          <div className="mt-4"><Chart data={GROWTH} /></div>
        </Card>

        <Card className="flex flex-col">
          <p className="text-sm text-[#5A6C78]">Wallet balance</p>
          <p className={`${display.className} mt-1 text-4xl font-extrabold`}>{naira(120000)}</p>
          <p className="mt-1 text-sm text-[#5A6C78]">Available to invest</p>
          <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
            <button onClick={() => go("wallet")} className="rounded-full bg-[#0F4C5C] py-2.5 text-sm font-semibold text-white hover:bg-[#0B3A47]">Add money</button>
            <button onClick={() => go("invest")} className="rounded-full border border-[#0F4C5C] py-2.5 text-sm font-semibold text-[#0F4C5C] hover:bg-[#EDF1F3]">Invest</button>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className={`${display.className} text-xl font-extrabold`}>Your investments</h2>
        <ul className="mt-4 divide-y divide-[#14232E]/10">
          {INVESTMENTS.map((i) => {
            const g = i.value - i.invested;
            return (
              <li key={i.id} className="py-4">
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <p className="font-semibold">{i.plan}</p>
                    <p className="text-sm text-[#5A6C78]">Started {i.start} · Matures {i.matures}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{naira(i.value)}</p>
                    <p className={`text-sm ${g >= 0 ? "text-[#0F7A4A]" : "text-[#B42318]"}`}>{g >= 0 ? "+" : ""}{naira(g)}</p>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E3EAEE]" role="progressbar" aria-valuenow={Math.round(i.progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={`${i.plan} time to maturity`}>
                  <div className="h-full rounded-full bg-[#0F4C5C]" style={{ width: `${i.progress * 100}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

function Invest() {
  const [planId, setPlanId] = useState("balanced");
  const [amount, setAmount] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const plan = PLANS.find((p) => p.id === planId);
  const n = Number(amount) || 0;
  const error = n > 0 && n < plan.min ? `${plan.name} starts at ${naira(plan.min)}.` : n > 120000 ? "That's more than your wallet balance. Add money first." : "";

  if (done)
    return (
      <Card className="text-center">
        <h2 className={`${display.className} text-2xl font-extrabold`}>Investment placed</h2>
        <p className="mt-2 text-[#3B4F5C]">{naira(n)} in {plan.name}. You can follow it from Overview.</p>
        <button onClick={() => { setDone(false); setConfirm(false); setAmount(""); }} className="mt-5 rounded-full bg-[#0F4C5C] px-6 py-2.5 text-sm font-semibold text-white">Make another investment</button>
      </Card>
    );

  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <Card>
        <h2 className={`${display.className} text-xl font-extrabold`}>Choose a plan</h2>
        <div className="mt-4 space-y-3" role="radiogroup" aria-label="Plan">
          {PLANS.map((p) => (
            <button key={p.id} role="radio" aria-checked={p.id === planId} onClick={() => setPlanId(p.id)}
              className={`flex w-full items-center justify-between rounded-xl border-2 p-4 text-left transition-colors ${p.id === planId ? "border-[#0F4C5C] bg-[#F1F7F8]" : "border-[#14232E]/10 hover:border-[#14232E]/30"}`}>
              <span>
                <span className="block font-semibold">{p.name}</span>
                <span className="text-sm text-[#5A6C78]">{p.risk} risk · from {naira(p.min)}</span>
              </span>
              <span className="text-sm font-semibold">{p.rate}% assumed</span>
            </button>
          ))}
        </div>

        <label className="mt-6 block text-sm font-medium" htmlFor="amt">Amount</label>
        <div className={`mt-2 flex items-center rounded-xl border-2 px-4 ${error ? "border-[#B42318]" : "border-[#14232E]/15 focus-within:border-[#0F4C5C]"}`}>
          <span className="text-lg text-[#5A6C78]">₦</span>
          <input id="amt" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            placeholder="100000" className="w-full bg-transparent px-2 py-3 text-lg outline-none" />
        </div>
        {error && <p role="alert" className="mt-2 text-sm font-medium text-[#B42318]">{error}</p>}
        <p className="mt-2 text-sm text-[#5A6C78]">Wallet balance: {naira(120000)}</p>
      </Card>

      <Card className="h-fit">
        <h2 className={`${display.className} text-xl font-extrabold`}>Summary</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between"><dt>Plan</dt><dd className="font-semibold">{plan.name}</dd></div>
          <div className="flex justify-between"><dt>Amount</dt><dd className="font-semibold">{n ? naira(n) : "—"}</dd></div>
          <div className="flex justify-between"><dt>Illustrative value in 12 months</dt><dd className="font-semibold">{n ? naira(n * (1 + plan.rate / 100)) : "—"}</dd></div>
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-[#5A6C78]">Illustration at an assumed rate. Returns are not guaranteed and you can lose money.</p>
        {!confirm ? (
          <button disabled={!n || !!error} onClick={() => setConfirm(true)}
            className="mt-5 w-full rounded-full bg-[#0F4C5C] py-3 font-semibold text-white hover:bg-[#0B3A47] disabled:cursor-not-allowed disabled:opacity-40">
            Review investment
          </button>
        ) : (
          <div className="mt-5 rounded-xl bg-[#EDF1F3] p-4">
            <p className="text-sm font-semibold">Invest {naira(n)} in {plan.name}?</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button onClick={() => setConfirm(false)} className="rounded-full border border-[#14232E]/25 py-2 text-sm font-semibold">Go back</button>
              <button onClick={() => setDone(true)} className="rounded-full bg-[#0F4C5C] py-2 text-sm font-semibold text-white">Invest {naira(n)}</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function Wallet() {
  const [tab, setTab] = useState("fund");
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
      <Card className="h-fit">
        <p className="text-sm text-[#5A6C78]">Wallet balance</p>
        <p className={`${display.className} mt-1 text-4xl font-extrabold`}>{naira(120000)}</p>
        <p className="mt-4 text-sm text-[#5A6C78]">Pending withdrawal: {naira(50000)}</p>
        <div className="mt-6 rounded-xl bg-[#EDF1F3] p-4 text-sm">
          <p className="font-semibold">Withdrawal account</p>
          <p className="mt-1 text-[#3B4F5C]">GTBank · ••••4821</p>
          <p className="text-[#3B4F5C]">Mahrezz Okoro</p>
        </div>
      </Card>

      <Card>
        <div className="flex gap-2" role="tablist">
          {[["fund", "Add money"], ["withdraw", "Withdraw"]].map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
              className={`rounded-full px-5 py-2 text-sm font-semibold ${tab === id ? "bg-[#0F4C5C] text-white" : "bg-[#EDF1F3]"}`}>{label}</button>
          ))}
        </div>
        {tab === "fund" ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border-2 border-[#14232E]/10 p-4">
              <p className="font-semibold">Bank transfer</p>
              <p className="mt-1 text-sm text-[#5A6C78]">Send to the account below. Your wallet is credited once we confirm the transfer.</p>
              <div className="mt-3 rounded-lg bg-[#EDF1F3] p-3 text-sm">
                <p className="text-[#5A6C78]">Account number</p>
                <p className="text-lg font-semibold tracking-wide">0123456789</p>
                <p className="text-[#5A6C78]">Wema Bank · Arbor Capital</p>
              </div>
            </div>
            <div className="rounded-xl border-2 border-[#14232E]/10 p-4">
              <p className="font-semibold">Card</p>
              <p className="mt-1 text-sm text-[#5A6C78]">Credited instantly. Card fees may apply.</p>
              <button className="mt-3 rounded-full border border-[#0F4C5C] px-5 py-2 text-sm font-semibold text-[#0F4C5C]">Pay with card</button>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <label htmlFor="w" className="text-sm font-medium">Amount to withdraw</label>
            <div className="mt-2 flex items-center rounded-xl border-2 border-[#14232E]/15 px-4 focus-within:border-[#0F4C5C]">
              <span className="text-lg text-[#5A6C78]">₦</span>
              <input id="w" inputMode="numeric" placeholder="50000" className="w-full bg-transparent px-2 py-3 text-lg outline-none" />
            </div>
            <p className="mt-2 text-sm text-[#5A6C78]">Paid to GTBank ••••4821. Verification is required before your first withdrawal.</p>
            <button className="mt-5 w-full rounded-full bg-[#0F4C5C] py-3 font-semibold text-white">Request withdrawal</button>
          </div>
        )}
      </Card>
    </div>
  );
}

function History() {
  const tone = { Completed: "bg-[#E3F4EA] text-[#0F7A4A]", Pending: "bg-[#FFF1CC] text-[#8A5A00]" };
  return (
    <Card>
      <h2 className={`${display.className} text-xl font-extrabold`}>Transactions</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="text-[#5A6C78]">
            <tr><th className="py-2 font-medium">Reference</th><th className="font-medium">Type</th><th className="font-medium">Date</th><th className="text-right font-medium">Amount</th><th className="text-right font-medium">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-[#14232E]/10">
            {TXNS.map((t) => (
              <tr key={t.id}>
                <td className="py-3.5 text-[#5A6C78]">{t.id}</td>
                <td className="font-semibold">{t.type}</td>
                <td>{t.date}</td>
                <td className={`text-right font-semibold ${t.amount > 0 ? "text-[#0F7A4A]" : ""}`}>{t.amount > 0 ? "+" : "−"}{naira(Math.abs(t.amount))}</td>
                <td className="text-right"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone[t.status]}`}>{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const [view, setView] = useState("overview");
  const titles = { overview: "Overview", invest: "Invest", wallet: "Wallet", history: "History" };

  return (
    <div className={`${body.className} min-h-screen bg-[#EDF1F3] text-[#14232E] md:grid md:grid-cols-[220px_1fr]`}>
      <style>{`button:focus-visible,a:focus-visible,input:focus-visible{outline:3px solid #E0A100;outline-offset:2px}@media (prefers-reduced-motion:reduce){*{transition:none!important}}`}</style>

      {/* Sidebar (desktop) */}
      <aside className="hidden border-r border-[#14232E]/10 bg-white p-5 md:flex md:flex-col">
        <span className={`${display.className} text-xl font-extrabold tracking-tight`}>Arbor Capital</span>
        <nav className="mt-8 space-y-1">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setView(n.id)} aria-current={view === n.id ? "page" : undefined}
              className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold ${view === n.id ? "bg-[#0F4C5C] text-white" : "hover:bg-[#EDF1F3]"}`}>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-3 border-t border-[#14232E]/10 pt-4">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0F4C5C] text-sm font-semibold text-white">MO</span>
          <span className="text-sm"><b className="block">Mahrezz Okoro</b><span className="text-[#5A6C78]">Not verified</span></span>
        </div>
      </aside>

      <main className="px-4 pb-28 pt-6 sm:px-8 md:pb-10">
        <header className="mb-6 flex items-center justify-between">
          <h1 className={`${display.className} text-3xl font-extrabold tracking-tight`}>{titles[view]}</h1>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0F4C5C] text-sm font-semibold text-white md:hidden">MO</span>
        </header>
        <div className="mx-auto max-w-5xl">
          {view === "overview" && <Overview go={setView} />}
          {view === "invest" && <Invest />}
          {view === "wallet" && <Wallet />}
          {view === "history" && <History />}
          <p className="mt-8 text-xs leading-relaxed text-[#5A6C78]">
            All investments carry risk, including loss of capital. Projections are illustrations, not guarantees.
          </p>
        </div>
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 grid grid-cols-4 border-t border-[#14232E]/10 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {NAV.map((n) => (
          <button key={n.id} onClick={() => setView(n.id)} aria-current={view === n.id ? "page" : undefined}
            className={`py-4 text-sm font-semibold ${view === n.id ? "text-[#0F4C5C] shadow-[inset_0_3px_0_#0F4C5C]" : "text-[#5A6C78]"}`}>
            {n.label}
          </button>
        ))}
      </nav>
    </div>
  );
}