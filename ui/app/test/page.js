"use client";

// app/dashboard/page.jsx — UI only, all data is sample data. Limits, fees and rates are placeholders: replace with yours.
import { useState } from "react";
import { Bricolage_Grotesque, IBM_Plex_Sans } from "next/font/google";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["600", "800"] });
const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] });

const naira = (n) => "₦" + Math.round(n).toLocaleString("en-NG");
const TODAY = new Date("2026-11-03"); // use new Date() when real
const fmt = (d) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const addMonths = (d, m) => { const x = new Date(d); x.setMonth(x.getMonth() + m); return x; };
const daysBetween = (a, b) => Math.ceil((new Date(b) - new Date(a)) / 864e5);

const WALLET = 350000, PENDING_WD = 50000, TIER = { n: 1, limit: 50000, next: 500000 };
const BANKS = ["Access Bank", "First Bank", "GTBank", "Kuda", "Moniepoint", "OPay", "UBA", "Zenith Bank"];

const PLANS = [
  { id: "note", name: "US Treasury Fund", rate: 4, risk: "Low", min: 15000 },
  { id: "balanced", name: "S&P 500 ETF", rate: 9, risk: "Medium", min: 15000 },
  { id: "growth", name: "US Growth ETF", rate: 13, risk: "High", min: 30000 },
];

// Sample FX rate: replace with a live rate and show its timestamp.
const FX = 1500;
const usd = (n) => "$" + (n / FX).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const INVESTMENTS = [
  { ref: "INV-20260312-0412", plan: "S&P 500 ETF", invested: 500000, value: 541200, start: "2026-03-12", matures: "2027-03-12" },
  { ref: "INV-20260602-0201", plan: "US Treasury Fund", invested: 200000, value: 211800, start: "2026-06-02", matures: "2026-12-02" },
  { ref: "INV-20260820-0388", plan: "US Growth ETF", invested: 300000, value: 284500, start: "2026-08-20", matures: "2027-08-20" },
];

const TXNS = [
  { id: "TRX-20261030-3302", type: "Deposit", note: "Bank transfer", amount: 280000, date: "2026-10-30", status: "Completed" },
  { id: "WDR-20261014-0192", type: "Withdrawal", note: "GTBank ••••4821", amount: -50000, date: "2026-10-14", status: "Pending" },
  { id: "INV-20260820-0388", type: "Investment", note: "US Growth ETF", amount: -300000, date: "2026-08-20", status: "Completed" },
  { id: "TRX-20260820-5120", type: "Deposit", note: "Card", amount: 300000, date: "2026-08-20", status: "Completed" },
  { id: "INV-20260602-0201", type: "Investment", note: "US Treasury Fund", amount: -200000, date: "2026-06-02", status: "Completed" },
  { id: "TRX-20260601-4410", type: "Deposit", note: "Bank transfer", amount: 200000, date: "2026-06-01", status: "Completed" },
  { id: "INV-20260312-0412", type: "Investment", note: "S&P 500 ETF", amount: -500000, date: "2026-03-12", status: "Completed" },
  { id: "TRX-20260311-1180", type: "Deposit", note: "Bank transfer", amount: 500000, date: "2026-03-11", status: "Completed" },
];

const GROWTH = [1000000, 1006000, 1015000, 1009000, 1021000, 1027000, 1019000, 1031000, 1026000, 1034000, 1037500];
const NAV = [["overview", "Overview"], ["invest", "Invest"], ["wallet", "Wallet"], ["history", "History"], ["documents", "Documents"]];
const STATUS = { Completed: "bg-[#E3F4EA] text-[#0F7A4A]", Pending: "bg-[#FFF1CC] text-[#8A5A00]" };

function Chart({ data }) {
  const w = 600, h = 150, p = 6, min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => [p + (i * (w - p * 2)) / (data.length - 1), h - p - ((v - min) / (max - min)) * (h - p * 2)]);
  const line = pts.map((q, i) => (i ? "L" : "M") + q[0] + " " + q[1]).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-36 w-full" role="img" aria-label="Portfolio value, last 11 weeks">
      <path d={`${line} L${w - p} ${h} L${p} ${h} Z`} fill="#fff" opacity=".1" />
      <path d={line} fill="none" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts.at(-1)[0]} cy={pts.at(-1)[1]} r="6" fill="#E0A100" stroke="#0F4C5C" strokeWidth="3" />
    </svg>
  );
}

const Card = ({ children, className = "" }) => (
  <section className={`rounded-2xl bg-white p-5 shadow-[0_1px_0_rgba(20,35,46,.06)] sm:p-6 ${className}`}>{children}</section>
);
const H2 = ({ children }) => <h2 className={`${display.className} text-xl font-extrabold tracking-tight`}>{children}</h2>;
const Input = ({ prefix, ...p }) => (
  <div className="mt-2 flex items-center rounded-xl border-2 border-[#14232E]/15 px-4 focus-within:border-[#0F4C5C]">
    {prefix && <span className="text-lg text-[#5A6C78]">{prefix}</span>}
    <input {...p} className="w-full bg-transparent px-2 py-3 text-lg tabular-nums outline-none" />
  </div>
);

function WalletCard() {
  const [hide, setHide] = useState(false);
  const mask = (s) => (hide ? "••••••" : s);
  return (
    <div className="relative aspect-[1.586/1] w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-br from-[#14232E] via-[#0F4C5C] to-[#0B3A47] p-5 text-white shadow-[0_24px_40px_-24px_rgba(15,76,92,.9)] sm:p-6">
      <div aria-hidden className="absolute -right-14 -top-14 h-56 w-56 rounded-full border-[30px] border-white/5" />
      <div aria-hidden className="absolute -bottom-24 -left-12 h-60 w-60 rounded-full bg-[#E0A100]/10" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="h-7 w-10 rounded-md bg-gradient-to-br from-[#F5C542] to-[#C98F00]" aria-hidden />
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-white/70" aria-hidden>
            <path d="M7 8a6 6 0 0 1 0 8" /><path d="M11 5a10 10 0 0 1 0 14" /><path d="M15 2a14 14 0 0 1 0 20" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-3">
            <p className="text-xs text-white/60">Wallet balance</p>
            <button onClick={() => setHide((h) => !h)} className="text-xs font-semibold text-white/80 underline-offset-2 hover:underline">{hide ? "Show" : "Hide"}</button>
          </div>
          <p className={`${display.className} text-3xl font-extrabold tracking-tight tabular-nums sm:text-4xl`}>{mask(naira(WALLET))}</p>
          <p className="text-xs text-white/70 tabular-nums">≈ {mask(usd(WALLET))} · ₦{FX.toLocaleString()}/$ sample rate</p>
        </div>
        <div className="flex items-end justify-between text-xs">
          <div>
            <p className="font-semibold tracking-widest">MAHREZZ OKORO</p>
            <p className="mt-0.5 tracking-widest text-white/60">6012 •••• 678</p>
          </div>
          <span className={`${display.className} text-lg font-extrabold`}>Arbor</span>
        </div>
      </div>
    </div>
  );
}

function Overview({ go }) {
  const invested = INVESTMENTS.reduce((a, b) => a + b.invested, 0);
  const value = INVESTMENTS.reduce((a, b) => a + b.value, 0);
  const gain = value - invested;
  const next = [...INVESTMENTS].sort((a, b) => new Date(a.matures) - new Date(b.matures))[0];
  const shades = ["bg-white", "bg-[#E0A100]", "bg-white/40"];
  return (
    <div className="space-y-5">
      <Card className="flex flex-col gap-3 !bg-[#FFF8E6] sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">You're on Tier {TIER.n}: withdrawals up to {naira(TIER.limit)} a day</h2>
          <p className="text-sm text-[#3B4F5C]">Verify your KYC to raise it to {naira(TIER.next)} a day.</p>
          <div className="mt-3 h-1.5 w-full max-w-xs rounded-full bg-[#E0A100]/25"><div className="h-full w-1/3 rounded-full bg-[#E0A100]" /></div>
        </div>
        <button className="shrink-0 rounded-full bg-[#14232E] px-5 py-2.5 text-sm font-semibold text-white">Verify KYC</button>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-3xl bg-[#0F4C5C] p-6 text-white sm:p-8">
          <p className="text-sm text-white/70">Portfolio value</p>
          <p className={`${display.className} mt-1 text-5xl font-extrabold tracking-tight tabular-nums sm:text-6xl`}>{naira(value)}</p>
          <p className="mt-2 text-sm text-white/80 tabular-nums">
            <b className="text-[#F5C542]">+{naira(gain)}</b> since you started · Today <b>+{naira(1820)}</b>
          </p>
          <div className="mt-5"><Chart data={GROWTH} /></div>
          <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-white/10" aria-hidden>
            {INVESTMENTS.map((i, k) => <div key={i.ref} className={shades[k]} style={{ width: `${(i.invested / invested) * 100}%` }} />)}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/75">
            {INVESTMENTS.map((i, k) => (
              <li key={i.ref} className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${shades[k]}`} />{i.plan} {Math.round((i.invested / invested) * 100)}%</li>
            ))}
          </ul>
        </section>

        <div className="space-y-5">
          <div>
            <WalletCard />
            <p className="mt-2 text-xs text-[#5A6C78]">{naira(PENDING_WD)} held for a pending withdrawal</p>
            <div className="mt-3 grid max-w-md grid-cols-2 gap-3">
              <button onClick={() => go("wallet")} className="rounded-full bg-[#0F4C5C] py-2.5 text-sm font-semibold text-white hover:bg-[#0B3A47]">Add money</button>
              <button onClick={() => go("invest")} className="rounded-full border border-[#0F4C5C] py-2.5 text-sm font-semibold text-[#0F4C5C] hover:bg-white">Invest</button>
            </div>
          </div>
          <Card>
            <p className="text-sm text-[#5A6C78]">Next maturity</p>
            <p className="mt-1 font-semibold">{next.plan} · {fmt(next.matures)}</p>
            <p className="text-sm text-[#5A6C78]">In {daysBetween(TODAY, next.matures)} days. Paid to your wallet, about <b className="text-[#14232E]">{naira(next.value)}</b> at today's value.</p>
          </Card>
        </div>
      </div>

      <Card>
        <H2>Your investments</H2>
        <ul className="mt-2 divide-y divide-[#14232E]/10">
          {INVESTMENTS.map((i) => {
            const g = i.value - i.invested;
            const pct = Math.min(100, Math.max(0, (daysBetween(i.start, TODAY) / daysBetween(i.start, i.matures)) * 100));
            return (
              <li key={i.ref} className="py-4">
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <p className="font-semibold">{i.plan}</p>
                    <p className="text-xs text-[#5A6C78]">{i.ref} · {fmt(i.start)} to {fmt(i.matures)}</p>
                  </div>
                  <div className="text-right tabular-nums">
                    <p className="font-semibold">{naira(i.value)}</p>
                    <p className={`text-sm ${g >= 0 ? "text-[#0F7A4A]" : "text-[#B42318]"}`}>{g >= 0 ? "+" : "−"}{naira(Math.abs(g))} ({((g / i.invested) * 100).toFixed(1)}%)</p>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E3EAEE]" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={`${i.plan} time to maturity`}>
                  <div className="h-full rounded-full bg-[#0F4C5C]" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-[#5A6C78]">{daysBetween(TODAY, i.matures)} days to maturity</p>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <div className="flex items-center justify-between"><H2>Recent activity</H2><button onClick={() => go("history")} className="text-sm font-semibold text-[#0F4C5C] hover:underline">See all</button></div>
        <ul className="mt-2 divide-y divide-[#14232E]/10">
          {TXNS.slice(0, 3).map((t) => (
            <li key={t.id} className="flex items-center justify-between py-3 text-sm">
              <span><b className="block">{t.type}</b><span className="text-[#5A6C78]">{t.note} · {fmt(t.date)}</span></span>
              <span className={`font-semibold tabular-nums ${t.amount > 0 ? "text-[#0F7A4A]" : ""}`}>{t.amount > 0 ? "+" : "−"}{naira(Math.abs(t.amount))}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Invest({ notify, go }) {
  const [planId, setPlanId] = useState("balanced");
  const [amount, setAmount] = useState("");
  const [months, setMonths] = useState(12);
  const [agree, setAgree] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const plan = PLANS.find((p) => p.id === planId);
  const n = Number(amount) || 0;
  const expected = n * Math.pow(1 + plan.rate / 1200, months);
  const low = n * Math.pow(1 + plan.rate / 3600, months);
  const error = n > 0 && n < plan.min ? `${plan.name} starts at ${naira(plan.min)}.` : n > WALLET ? `Your wallet has ${naira(WALLET)}. Add money to invest more.` : "";
  const ready = n > 0 && !error && agree;

  if (done)
    return (
      <Card className="text-center">
        <H2>Investment placed</H2>
        <p className="mx-auto mt-2 max-w-md text-[#3B4F5C]">{naira(n)} in {plan.name}, maturing {fmt(addMonths(TODAY, months))}. Your confirmation is under History.</p>
        <div className="mt-5 flex justify-center gap-3">
          <button onClick={() => go("overview")} className="rounded-full bg-[#0F4C5C] px-6 py-2.5 text-sm font-semibold text-white">View portfolio</button>
          <button onClick={() => { setDone(false); setConfirm(false); setAmount(""); setAgree(false); }} className="rounded-full border border-[#14232E]/25 px-6 py-2.5 text-sm font-semibold">Invest again</button>
        </div>
      </Card>
    );

  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <Card>
        <H2>Choose a plan</H2>
        <div className="mt-4 space-y-3" role="radiogroup" aria-label="Plan">
          {PLANS.map((p) => (
            <button key={p.id} role="radio" aria-checked={p.id === planId} onClick={() => setPlanId(p.id)}
              className={`flex w-full items-center justify-between rounded-xl border-2 p-4 text-left transition-colors ${p.id === planId ? "border-[#0F4C5C] bg-[#F1F7F8]" : "border-[#14232E]/10 hover:border-[#14232E]/30"}`}>
              <span><span className="block font-semibold">{p.name}</span><span className="text-sm text-[#5A6C78]">{p.risk} risk · from {naira(p.min)}</span></span>
              <span className="text-sm font-semibold">{p.rate}% sample</span>
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm font-medium">How long</p>
        <div className="mt-2 flex gap-2" role="radiogroup" aria-label="Tenor">
          {[3, 6, 12].map((m) => (
            <button key={m} role="radio" aria-checked={m === months} onClick={() => setMonths(m)}
              className={`rounded-full px-5 py-2 text-sm font-semibold ${m === months ? "bg-[#0F4C5C] text-white" : "bg-[#EDF1F3] hover:bg-[#DCE4E8]"}`}>{m} months</button>
          ))}
        </div>

        <label htmlFor="amt" className="mt-6 block text-sm font-medium">Amount</label>
        <Input id="amt" prefix="₦" inputMode="numeric" value={amount} placeholder="100000" aria-invalid={!!error}
          onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} />
        {error && <p role="alert" className="mt-2 text-sm font-medium text-[#B42318]">{error}</p>}
        <p className="mt-2 text-sm text-[#5A6C78]">Wallet balance: {naira(WALLET)}</p>
      </Card>

      <Card className="h-fit">
        <H2>Summary</H2>
        <dl className="mt-4 space-y-3 text-sm tabular-nums">
          {[["Plan", plan.name], ["Amount", n ? naira(n) : "—"], ["Matures", fmt(addMonths(TODAY, months))],
            ["Illustrative value", n ? naira(expected) : "—"], ["If returns are a third", n ? naira(low) : "—"], ["Fee to invest", "₦0"]].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4"><dt className="text-[#5A6C78]">{k}</dt><dd className="font-semibold">{v}</dd></div>
          ))}
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-[#5A6C78]">Leaving before maturity costs 10% of any gains. Returns are not guaranteed and you can lose money.</p>
        <label className="mt-4 flex items-start gap-3 text-sm">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-4 w-4 accent-[#0F4C5C]" />
          I understand the risks and the early-exit cost.
        </label>
        {!confirm ? (
          <button disabled={!ready} onClick={() => setConfirm(true)}
            className="mt-5 w-full rounded-full bg-[#0F4C5C] py-3 font-semibold text-white hover:bg-[#0B3A47] disabled:cursor-not-allowed disabled:opacity-40">Review investment</button>
        ) : (
          <div className="mt-5 rounded-xl bg-[#EDF1F3] p-4">
            <p className="text-sm font-semibold">Invest {naira(n)} in {plan.name} for {months} months?</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button onClick={() => setConfirm(false)} className="rounded-full border border-[#14232E]/25 py-2 text-sm font-semibold">Go back</button>
              <button onClick={() => { setDone(true); notify("Investment placed"); }} className="rounded-full bg-[#0F4C5C] py-2 text-sm font-semibold text-white">Invest {naira(n)}</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function Wallet({ notify }) {
  const [tab, setTab] = useState("fund");
  const [bank, setBank] = useState("GTBank");
  const [acct, setAcct] = useState("");
  const [amt, setAmt] = useState("");
  const [step, setStep] = useState("form"); // form -> otp -> sent
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [sentAmt, setSentAmt] = useState(0);
  const a = Number(amt) || 0, fee = 50;
  const err = a > 0 && a + fee > WALLET - PENDING_WD ? "That's more than your available balance." : a > TIER.limit ? `Tier ${TIER.n} allows ${naira(TIER.limit)} a day. Verify your BVN to raise it.` : "";
  const ok = acct.length === 10 && a > 0 && !err;
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
      <Card className="h-fit">
        <p className="text-sm text-[#5A6C78]">Wallet balance</p>
        <p className={`${display.className} mt-1 text-4xl font-extrabold tabular-nums`}>{naira(WALLET)}</p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-[#5A6C78]">Held for withdrawal</dt><dd className="font-semibold tabular-nums">{naira(PENDING_WD)}</dd></div>
          <div className="flex justify-between"><dt className="text-[#5A6C78]">Available</dt><dd className="font-semibold tabular-nums">{naira(WALLET - PENDING_WD)}</dd></div>
          <div className="flex justify-between"><dt className="text-[#5A6C78]">Daily withdrawal limit</dt><dd className="font-semibold tabular-nums">{naira(TIER.limit)}</dd></div>
        </dl>
      </Card>

      <Card>
        <div className="flex gap-2" role="tablist">
          {[["fund", "Add money"], ["withdraw", "Withdraw"]].map(([id, l]) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
              className={`rounded-full px-5 py-2 text-sm font-semibold ${tab === id ? "bg-[#0F4C5C] text-white" : "bg-[#EDF1F3]"}`}>{l}</button>
          ))}
        </div>
        {tab === "fund" ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border-2 border-[#14232E]/10 p-4">
              <p className="font-semibold">Bank transfer <span className="ml-1 text-sm font-normal text-[#0F7A4A]">No fee</span></p>
              <p className="mt-1 text-sm text-[#5A6C78]">This account is yours alone. Transfers usually reflect in a few minutes.</p>
              <div className="mt-3 flex items-center justify-between rounded-lg bg-[#EDF1F3] p-3">
                <div className="text-sm">
                  <p className="text-lg font-semibold tracking-wide tabular-nums">6012 345 678</p>
                  <p className="text-[#5A6C78]">Wema Bank · Arbor Capital / Mahrezz Okoro</p>
                </div>
                <button onClick={() => { navigator.clipboard?.writeText("6012345678"); notify("Account number copied"); }} className="rounded-full border border-[#0F4C5C] px-4 py-1.5 text-sm font-semibold text-[#0F4C5C] hover:bg-white">Copy</button>
              </div>
            </div>
            <div className="rounded-xl border-2 border-[#14232E]/10 p-4">
              <p className="font-semibold">Card <span className="ml-1 text-sm font-normal text-[#5A6C78]">1.5% + ₦100</span></p>
              <p className="mt-1 text-sm text-[#5A6C78]">Credited instantly.</p>
              <button className="mt-3 rounded-full border border-[#0F4C5C] px-5 py-2 text-sm font-semibold text-[#0F4C5C]">Pay with card</button>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <label htmlFor="bank" className="text-sm font-medium">Bank</label>
            <select id="bank" value={bank} onChange={(e) => setBank(e.target.value)} className="mt-2 w-full rounded-xl border-2 border-[#14232E]/15 bg-white px-4 py-3 text-lg outline-none focus:border-[#0F4C5C]">
              {BANKS.map((b) => <option key={b}>{b}</option>)}
            </select>
            <label htmlFor="acct" className="mt-4 block text-sm font-medium">Account number</label>
            <Input id="acct" inputMode="numeric" maxLength={10} value={acct} placeholder="10 digits" onChange={(e) => setAcct(e.target.value.replace(/\D/g, ""))} />
            {acct.length === 10 && <p className="mt-2 text-sm font-semibold text-[#0F7A4A]">MAHREZZ OKORO · {bank}</p>}
            <label htmlFor="w" className="mt-4 block text-sm font-medium">Amount</label>
            <Input id="w" prefix="₦" inputMode="numeric" value={amt} placeholder="20000" aria-invalid={!!err} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ""))} />
            {err && <p role="alert" className="mt-2 text-sm font-medium text-[#B42318]">{err}</p>}
            <p className="mt-2 text-sm text-[#5A6C78] tabular-nums">Fee {naira(fee)} · You receive {a ? naira(a) : "—"} · Usually arrives the same business day</p>
            {step === "form" && (
              <button disabled={!ok} onClick={() => { setSentAmt(a); setStep("otp"); }}
                className="mt-5 w-full rounded-full bg-[#0F4C5C] py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Continue</button>
            )}
            {step === "otp" && (
              <div className="mt-5 rounded-xl bg-[#EDF1F3] p-4">
                <p className="text-sm font-semibold">Confirm {naira(a)} to {bank} ••••{acct.slice(-4)}</p>
                <p className="mt-1 text-sm text-[#5A6C78]">Enter the 6-digit code sent to 0803 ••• ••21, then your 4-digit transaction PIN.</p>
                <label htmlFor="otp" className="mt-4 block text-sm font-medium">Code</label>
                <Input id="otp" inputMode="numeric" maxLength={6} value={otp} placeholder="000000" onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} />
                <label htmlFor="pin" className="mt-3 block text-sm font-medium">Transaction PIN</label>
                <Input id="pin" type="password" inputMode="numeric" maxLength={4} value={pin} placeholder="••••" onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
                <button onClick={() => notify("New code sent")} className="mt-3 text-sm font-semibold text-[#0F4C5C] hover:underline">Send a new code</button>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button onClick={() => setStep("form")} className="rounded-full border border-[#14232E]/25 py-2.5 text-sm font-semibold">Go back</button>
                  <button disabled={otp.length !== 6 || pin.length !== 4}
                    onClick={() => { setStep("sent"); setAmt(""); setAcct(""); notify("Withdrawal requested"); }}
                    className="rounded-full bg-[#0F4C5C] py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Confirm withdrawal</button>
                </div>
              </div>
            )}
            {step === "sent" && (
              <div className="mt-5 rounded-xl bg-[#EDF1F3] p-4">
                <p className="text-sm font-semibold">Withdrawal of {naira(sentAmt)} requested</p>
                <ol className="mt-3 space-y-3 text-sm">
                  {[["Requested", "Just now", true], ["Approved", "Usually within a few hours", false], ["Sent to your bank", "Same business day", false]].map(([t, d, on]) => (
                    <li key={t} className="flex items-start gap-3">
                      <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${on ? "bg-[#0F7A4A]" : "border-2 border-[#14232E]/25"}`} />
                      <span><b className="block">{t}</b><span className="text-[#5A6C78]">{d}</span></span>
                    </li>
                  ))}
                </ol>
                <button onClick={() => { setStep("form"); setOtp(""); setPin(""); }} className="mt-4 rounded-full border border-[#0F4C5C] px-5 py-2 text-sm font-semibold text-[#0F4C5C]">Done</button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

function History({ notify }) {
  const [f, setF] = useState("All");
  const rows = TXNS.filter((t) => f === "All" || t.type + "s" === f);
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {["All", "Deposits", "Withdrawals", "Investments"].map((x) => (
            <button key={x} onClick={() => setF(x)} aria-pressed={f === x} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${f === x ? "bg-[#0F4C5C] text-white" : "bg-[#EDF1F3] hover:bg-[#DCE4E8]"}`}>{x}</button>
          ))}
        </div>
        <button onClick={() => notify("Statement is being prepared")} className="rounded-full border border-[#0F4C5C] px-4 py-1.5 text-sm font-semibold text-[#0F4C5C] hover:bg-[#EDF1F3]">Download statement</button>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="text-[#5A6C78]"><tr><th className="py-2 font-medium">Reference</th><th className="font-medium">Details</th><th className="font-medium">Date</th><th className="text-right font-medium">Amount</th><th className="text-right font-medium">Status</th></tr></thead>
          <tbody className="divide-y divide-[#14232E]/10">
            {rows.map((t) => (
              <tr key={t.id}>
                <td className="py-3.5 text-xs text-[#5A6C78]">{t.id}</td>
                <td><b className="block">{t.type}</b><span className="text-[#5A6C78]">{t.note}</span></td>
                <td>{fmt(t.date)}</td>
                <td className={`text-right font-semibold tabular-nums ${t.amount > 0 ? "text-[#0F7A4A]" : ""}`}>{t.amount > 0 ? "+" : "−"}{naira(Math.abs(t.amount))}</td>
                <td className="text-right"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS[t.status]}`}>{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="py-8 text-center text-sm text-[#5A6C78]">Nothing here yet.</p>}
      </div>
    </Card>
  );
}

function Documents({ notify }) {
  const months = ["October 2026", "September 2026", "August 2026", "July 2026", "June 2026"];
  const Row = ({ title, sub, onClick }) => (
    <li className="flex items-center justify-between gap-4 py-3.5">
      <span className="min-w-0"><b className="block truncate text-sm">{title}</b><span className="text-xs text-[#5A6C78]">{sub}</span></span>
      <button onClick={onClick} className="shrink-0 rounded-full border border-[#0F4C5C] px-4 py-1.5 text-sm font-semibold text-[#0F4C5C] hover:bg-[#EDF1F3]">Download PDF</button>
    </li>
  );
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <H2>Monthly statements</H2>
        <p className="mt-1 text-sm text-[#5A6C78]">Every deposit, withdrawal, investment and payout for the month.</p>
        <ul className="mt-2 divide-y divide-[#14232E]/10">
          {months.map((m) => <Row key={m} title={m} sub="Issued on the 1st of the following month" onClick={() => notify(`${m} statement is being prepared`)} />)}
        </ul>
      </Card>

      <div className="space-y-5">
        <Card>
          <H2>Contract notes</H2>
          <p className="mt-1 text-sm text-[#5A6C78]">One for each investment, with the terms you agreed to.</p>
          <ul className="mt-2 divide-y divide-[#14232E]/10">
            {INVESTMENTS.map((i) => <Row key={i.ref} title={`${i.plan} · ${naira(i.invested)}`} sub={`${i.ref} · ${fmt(i.start)}`} onClick={() => notify(`${i.ref} is being prepared`)} />)}
          </ul>
        </Card>

        <Card>
          <H2>Who holds your money</H2>
          <dl className="mt-3 space-y-3 text-sm">
            {[["Custodian", "[Custodian name]"], ["Regulator", "[SEC Nigeria registration no.]"], ["Data protection", "[NDPC registration / privacy policy link]"], ["Client funds", "[Held separately from company funds]"]].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4"><dt className="text-[#5A6C78]">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>
            ))}
          </dl>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [view, setView] = useState("overview");
  const [toast, setToast] = useState("");
  const notify = (m) => { setToast(m); setTimeout(() => setToast(""), 2800); };

  return (
    <div className={`${body.className} min-h-screen bg-[#EDF1F3] text-[#14232E] md:grid md:grid-cols-[230px_1fr]`}>
      <style>{`button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #E0A100;outline-offset:2px}@media (prefers-reduced-motion:reduce){*{transition:none!important}}`}</style>

      <aside className="hidden border-r border-[#14232E]/10 bg-white p-5 md:flex md:flex-col">
        <span className={`${display.className} text-xl font-extrabold tracking-tight`}>Arbor Capital</span>
        <nav className="mt-8 space-y-1">
          {NAV.map(([id, l]) => (
            <button key={id} onClick={() => setView(id)} aria-current={view === id ? "page" : undefined}
              className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold ${view === id ? "bg-[#0F4C5C] text-white" : "hover:bg-[#EDF1F3]"}`}>{l}</button>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-3 border-t border-[#14232E]/10 pt-4">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0F4C5C] text-sm font-semibold text-white">MO</span>
          <span className="text-sm"><b className="block">Mahrezz Okoro</b><span className="text-[#5A6C78]">Tier {TIER.n}</span></span>
        </div>
      </aside>

      <main className="px-4 pb-28 pt-6 sm:px-8 md:pb-10">
        <header className="mx-auto mb-6 flex max-w-5xl items-center justify-between">
          <div>
            <p className="text-sm text-[#5A6C78]">{view === "overview" ? "Welcome back, Mahrezz" : fmt(TODAY)}</p>
            <h1 className={`${display.className} text-3xl font-extrabold tracking-tight`}>{NAV.find((n) => n[0] === view)[1]}</h1>
          </div>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0F4C5C] text-sm font-semibold text-white md:hidden">MO</span>
        </header>
        <div className="mx-auto max-w-5xl">
          {view === "overview" && <Overview go={setView} />}
          {view === "invest" && <Invest notify={notify} go={setView} />}
          {view === "wallet" && <Wallet notify={notify} />}
          {view === "history" && <History notify={notify} />}
          {view === "documents" && <Documents notify={notify} />}
          <p className="mt-8 text-xs leading-relaxed text-[#5A6C78]">All investments carry risk, including loss of capital. Projections are illustrations, not guarantees.</p>
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 grid grid-cols-5 border-t border-[#14232E]/10 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {NAV.map(([id, l]) => (
          <button key={id} onClick={() => setView(id)} aria-current={view === id ? "page" : undefined}
            className={`py-4 text-xs font-semibold ${view === id ? "text-[#0F4C5C] shadow-[inset_0_3px_0_#0F4C5C]" : "text-[#5A6C78]"}`}>{l}</button>
        ))}
      </nav>

      {toast && (
        <div role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#14232E] px-5 py-3 text-sm font-semibold text-white shadow-lg md:bottom-8">{toast}</div>
      )}
    </div>
  );
}