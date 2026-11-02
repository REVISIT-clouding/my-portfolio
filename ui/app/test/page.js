"use client";
import { useEffect, useMemo, useRef, useState } from "react";

/* =====================================================================
   Demo investing app. All prices, news and company data are SAMPLE data,
   everything lives in memory and resets on refresh. No real trading.
   ===================================================================== */

/* ---------- helpers ---------- */
const fmt = (n, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const usd = (n, d = 2) => "$" + fmt(n, d);
const uid = () => Math.random().toString(36).slice(2, 9);
const hashStr = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const timeOf = (t) => new Date(t).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
const sameDay = (a, b) => a.toDateString() === b.toDateString();
function dayLabel(t) {
  const d = new Date(t), now = new Date();
  if (sameDay(d, now)) return "Today";
  if (sameDay(d, new Date(now - 864e5))) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ---------- sample market data ---------- */
// A(symbol, name, category, price, open ratio, market cap, [extra label, value], volume, about)
const A = (s, n, c, p, ch, mc, x, vol, about) => ({ s, n, c, b: p, o: p * ch, mc, x, vol, about });
const ASSETS = [
  A("SBUX", "Starbucks", "stocks", 152.88, 0.997, "$174B", ["P/E ratio", "31.2"], "6.1M", "Global coffeehouse chain with company-operated and licensed stores."),
  A("GOOG", "Alphabet", "stocks", 250.88, 1.004, "$3.1T", ["P/E ratio", "24.8"], "21.4M", "Parent company of Google, with search, cloud and video businesses."),
  A("AAPL", "Apple", "stocks", 103.11, 0.988, "$1.6T", ["P/E ratio", "28.9"], "52.3M", "Designs consumer devices, software and services."),
  A("AMZN", "Amazon", "stocks", 186.4, 1.006, "$1.9T", ["P/E ratio", "42.1"], "38.7M", "Online retail, cloud computing and digital services."),
  A("MCD", "McDonald's", "stocks", 296.4, 0.999, "$214B", ["P/E ratio", "25.3"], "2.9M", "Quick-service restaurant franchisor operating worldwide."),
  A("WMT", "Walmart", "stocks", 71.25, 1.002, "$574B", ["P/E ratio", "33.0"], "14.2M", "Operates large-format retail stores and e-commerce."),
  A("TGT", "Target", "stocks", 142.3, 1.009, "$65B", ["P/E ratio", "15.6"], "3.8M", "General merchandise retailer in the United States."),
  A("BTC", "Bitcoin", "crypto", 64200, 0.985, "$1.27T", ["Network", "Bitcoin"], "$28.4B", "The first and largest cryptocurrency by market value."),
  A("ETH", "Ethereum", "crypto", 3150, 1.012, "$379B", ["Network", "Ethereum"], "$14.1B", "A programmable blockchain for apps and tokens."),
  A("SOL", "Solana", "crypto", 148, 0.97, "$68B", ["Network", "Solana"], "$3.2B", "A high-speed blockchain used for payments and apps."),
  A("GIF", "Global Index Fund", "funds", 48.2, 1.001, "$2.4B", ["Expense ratio", "0.12%"], "–", "Tracks a broad index of companies from developed markets."),
  A("BGF", "Balanced Growth Fund", "funds", 21.75, 1.0005, "$860M", ["Expense ratio", "0.65%"], "–", "Mixes stocks and bonds for steady long-term growth."),
  A("BIF", "Bond Income Fund", "funds", 10.34, 0.9998, "$1.1B", ["Expense ratio", "0.30%"], "–", "Holds government and corporate bonds for regular income."),
];
const BY = Object.fromEntries(ASSETS.map((a) => [a.s, a]));
const CATS = [["trending", "Trending"], ["crypto", "Cryptos"], ["stocks", "Stocks"], ["funds", "Mutual funds"]];
const CAT_NAME = { stocks: "Stock", crypto: "Crypto", funds: "Fund" };
const TICK_VOL = { stocks: 0.002, crypto: 0.004, funds: 0.0004 };
const RANGES = {
  "1D": { vol: 0.0035, labels: ["9:30 AM", "11:00 AM", "12:30 PM", "2:00 PM", "4:00 PM"] },
  "1W": { vol: 0.008, labels: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  "1M": { vol: 0.015, labels: ["4w ago", "3w", "2w", "1w", "Now"] },
  "3M": { vol: 0.025, labels: ["3m ago", "2.5m", "2m", "1m", "Now"] },
  "1Y": { vol: 0.05, labels: ["1y ago", "9m", "6m", "3m", "Now"] },
  "5Y": { vol: 0.1, labels: ["5y ago", "4y", "3y", "2y", "Now"] },
  All: { vol: 0.12, labels: ["Start", "", "", "", "Now"] },
};
const CARD_COLORS = ["#BDEFC9", "#D3C2F7", "#FFDDBA", "#C3E4FA"];
const ALLOC_COLORS = { Cash: "#CFC8B8", Stocks: "#5BC98C", Crypto: "#B79CF5", Funds: "#FFC48A" };

// Deterministic chart history that starts at the open (1D) and ends at the base price.
function makeSeries(a, range, n = 60) {
  const R = RANGES[range], r = rng(hashStr(a.s + range));
  const v = R.vol * (a.c === "crypto" ? 2.5 : a.c === "funds" ? 0.4 : 1);
  const start = range === "1D" ? a.o : a.b * (1 - (r() - 0.45) * v * 6);
  const w = [0];
  for (let i = 1; i < n; i++) w.push(w[i - 1] + (r() - 0.5) * 2);
  const end = w[n - 1];
  return w.map((x, i) => {
    const t = i / (n - 1);
    return (start + (a.b - start) * t) * (1 + (x - end * t) * v * 0.5);
  });
}
function smooth(pts) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q${pts[i][0]},${pts[i][1]} ${mx},${my}`;
  }
  const l = pts[pts.length - 1];
  return d + ` L${l[0]},${l[1]}`;
}
function toPoints(data, W, H, pad) {
  const mn = Math.min(...data), mx = Math.max(...data), r = mx - mn || 1;
  return data.map((v, i) => [(i * W) / (data.length - 1), H - pad - ((v - mn) / r) * (H - 2 * pad)]);
}

/* ---------- account logic (pure functions) ---------- */
function fillOrder(a, o, price) {
  const cost = o.q * price;
  let cash = a.cash;
  const hold = { ...a.hold };
  if (o.side === "buy") {
    cash += o.reserve - cost;
    const h = hold[o.s] || { sh: 0, avg: 0 };
    const sh = h.sh + o.q;
    hold[o.s] = { sh, avg: (h.sh * h.avg + cost) / sh };
  } else {
    cash += cost;
    const sh = hold[o.s].sh - o.q;
    if (sh <= 1e-9) delete hold[o.s];
    else hold[o.s] = { sh, avg: hold[o.s].avg };
  }
  return {
    ...a, cash, hold,
    orders: a.orders.filter((x) => x.id !== o.id),
    txs: a.txs.map((t) => (t.id === o.id ? { ...t, status: "Completed", price, amount: cost, t: Date.now() } : t)),
  };
}
function seedAccount() {
  const now = Date.now(), H = 36e5;
  return {
    cash: 3350,
    hold: { SBUX: { sh: 20, avg: 140.2 }, GOOG: { sh: 8, avg: 230 }, AAPL: { sh: 15, avg: 98.4 }, BTC: { sh: 0.1, avg: 60000 } },
    orders: [{ id: "o1", s: "AMZN", side: "buy", q: 5, limit: 180, reserve: 900 }],
    txs: [
      { id: "t1", kind: "Buy", s: "SBUX", q: 10, price: 132, amount: 1320, status: "Completed", t: now - 30 * H },
      { id: "o1", kind: "Buy", s: "AMZN", q: 5, price: 180, amount: 900, status: "In Progress", limit: true, t: now - 3 * H },
      { id: "t2", kind: "Withdraw", amount: 2000, status: "Failed", t: now - 52 * H },
      { id: "t3", kind: "Buy", s: "AAPL", q: 15, price: 98.4, amount: 1476, status: "Completed", t: now - 76 * H },
      { id: "t4", kind: "Deposit", amount: 5000, status: "Completed", t: now - 100 * H },
    ],
  };
}

/* ---------- tiny UI pieces ---------- */
const PATHS = {
  home: "M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z",
  pie: "M12 3v9h9a9 9 0 11-9-9zM15 3.5A9 9 0 0120.5 9H15z",
  plus: "M12 5v14M5 12h14",
  clip: "M9 4h6v3H9zM7 5H6a1 1 0 00-1 1v14a1 1 0 001 1h12a1 1 0 001-1V6a1 1 0 00-1-1h-1M9 12h6M9 16h6",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0",
  bell: "M6 17V11a6 6 0 1112 0v6l1.5 2h-15zM10 21h4",
  sliders: "M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4",
  back: "M15 5l-7 7 7 7",
  star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",
  search: "M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4",
  filter: "M4 7h16M7 12h10M10 17h4",
  down: "M12 5v14M6 13l6 6 6-6",
  up: "M12 19V5M6 11l6-6 6 6",
};
const Ic = ({ n, c = "h-5 w-5", fill = "none" }) => (
  <svg viewBox="0 0 24 24" className={c} fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={PATHS[n]} />
  </svg>
);
const Avatar = ({ s, size = "h-10 w-10", bg = "bg-[#F1E8D8]" }) => (
  <span className={`grid ${size} flex-none place-items-center rounded-full ${bg} font-bold`} aria-hidden="true">{s[0]}</span>
);
const Change = ({ pct }) => (
  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${pct >= 0 ? "bg-[#DDF5E4] text-[#1E8E5A]" : "bg-[#FDE3E3] text-[#D14343]"}`}>
    {pct >= 0 ? "↑" : "↓"} {fmt(Math.abs(pct), 2)}%
  </span>
);
const STATUS = {
  Completed: "bg-[#DDF5E4] text-[#1E8E5A]", "In Progress": "bg-[#DCEBFF] text-[#2D6CDF]",
  Failed: "bg-[#FDE3E3] text-[#D14343]", Cancelled: "bg-[#ECE8E1] text-[#6B6558]",
};
const inputCls = "mt-1.5 w-full rounded-xl border border-[#E6E0D5] bg-[#FAF7F2] px-3 py-3 outline-none focus:border-[#15171C]";
const labelCls = "mt-4 block text-sm font-semibold text-[#7A7568]";
const darkBtn = "rounded-full bg-[#15171C] px-6 py-3 font-bold text-white";
const lightBtn = "rounded-full border-2 border-[#15171C] px-6 py-3 font-bold";

function Spark({ a, price }) {
  const base = useMemo(() => makeSeries(a, "1D", 30), [a]);
  const data = [...base.slice(0, -1), price];
  const up = data[data.length - 1] >= data[0];
  const pts = toPoints(data, 90, 32, 3);
  const col = up ? "#2FB57A" : "#E5646A";
  const d = smooth(pts);
  return (
    <svg viewBox="0 0 90 32" className="h-8 w-[90px]" aria-hidden="true">
      <path d={`${d} L90,32 L0,32 Z`} fill={col} opacity=".12" />
      <path d={d} fill="none" stroke={col} strokeWidth="1.6" />
    </svg>
  );
}

function Chart({ data }) {
  const [hover, setHover] = useState(null);
  const W = 320, H = 170;
  const up = data[data.length - 1] >= data[0];
  const col = up ? "#2FB57A" : "#E5646A";
  const pts = toPoints(data, W, H, 10);
  const d = smooth(pts);
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const i = Math.round(((e.clientX - r.left) / r.width) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  };
  const hx = hover === null ? 0 : (hover / (data.length - 1)) * 100;
  return (
    <div className="relative h-[170px] touch-pan-y" onPointerMove={move} onPointerDown={move} onPointerLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full" role="img" aria-label="Price chart">
        <defs>
          <linearGradient id={up ? "gu" : "gd"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={col} stopOpacity=".28" /><stop offset="100%" stopColor={col} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${d} L${W},${H} L0,${H} Z`} fill={`url(#${up ? "gu" : "gd"})`} />
        <path d={d} fill="none" stroke={col} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      {hover !== null && (
        <>
          <div className="pointer-events-none absolute top-0 h-full border-l border-dashed border-[#B9B2A3]" style={{ left: `${hx}%` }} />
          <div className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white" style={{ left: `${hx}%`, top: `${(pts[hover][1] / H) * 100}%`, borderColor: col }} />
          <div className="pointer-events-none absolute top-1 -translate-x-1/2 rounded-lg bg-[#15171C] px-2.5 py-1 text-center text-xs font-semibold text-white" style={{ left: `${Math.max(14, Math.min(86, hx))}%` }}>
            {usd(data[hover])}
            <div className={up ? "text-[#6FE0A8]" : "text-[#FF9AA0]"}>{data[hover] >= data[0] ? "↑" : "↓"} {fmt(Math.abs((data[hover] / data[0] - 1) * 100), 2)}%</div>
          </div>
        </>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);
  return (
    <dialog ref={ref} onClose={onClose} onClick={(e) => { if (e.target === ref.current) ref.current.close(); }}
      className="m-auto w-[min(440px,94vw)] rounded-3xl bg-white p-0 text-[#15171C] backdrop:bg-black/50">
      <div className="max-h-[85vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">{title}</h3>
          <button aria-label="Close" className="rounded-full bg-[#F4F0E8] px-3 py-1" onClick={() => ref.current.close()}>✕</button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
const Row = ({ k, v, strong }) => (
  <div className="mt-2.5 flex justify-between text-sm text-[#7A7568]">
    <span>{k}</span><b className={`${strong ? "text-base" : "font-medium"} text-[#15171C]`}>{v}</b>
  </div>
);

/* ---------- dialogs ---------- */
function TradeDialog({ a, side0, prices, acct, onPlace, onClose }) {
  const [side, setSide] = useState(side0);
  const [type, setType] = useState("market");
  const [qty, setQty] = useState("");
  const [limit, setLimit] = useState("");
  const [step, setStep] = useState("edit");
  const [error, setError] = useState("");
  const price = prices[a.s];
  const q = parseFloat(qty) || 0;
  const lim = parseFloat(limit) || 0;
  const exec = type === "limit" ? lim : price;
  const est = q * exec;
  const pendingSell = acct.orders.filter((o) => o.s === a.s && o.side === "sell").reduce((x, o) => x + o.q, 0);
  const avail = (acct.hold[a.s]?.sh || 0) - pendingSell;

  const review = () => {
    let err = "";
    if (!(q > 0)) err = "Enter how many units you want.";
    else if (type === "limit" && !(lim > 0)) err = "Enter your limit price.";
    else if (est < 1) err = "The minimum order is $1.00.";
    else if (side === "buy" && est > acct.cash + 1e-9) err = "Not enough buying power. Deposit money to continue.";
    else if (side === "sell" && q > avail + 1e-9) err = `You can sell up to ${fmt(avail, 6)} ${a.s}.`;
    setError(err);
    if (!err) setStep("review");
  };
  const confirm = () => {
    onPlace({ s: a.s, side, type, q, limit: type === "limit" ? lim : null });
    onClose();
  };
  const seg = (on, active) => `rounded-lg py-2 font-semibold ${active ? `${on} text-white` : "text-[#7A7568]"}`;

  return (
    <Modal title={`${side === "buy" ? "Buy" : "Sell"} ${a.s}`} onClose={onClose}>
      <p className="text-sm text-[#7A7568]">{a.n} · Market price {usd(price)}</p>
      {step === "edit" ? (
        <>
          <div className="mt-4 grid grid-cols-2 rounded-xl bg-[#F4F0E8] p-1">
            <button className={seg("bg-[#1E9E62]", side === "buy")} onClick={() => { setSide("buy"); setError(""); }}>Buy</button>
            <button className={seg("bg-[#D14343]", side === "sell")} onClick={() => { setSide("sell"); setError(""); }}>Sell</button>
          </div>
          <label className={labelCls}>Order type
            <select className={inputCls} value={type} onChange={(e) => { setType(e.target.value); setError(""); }}>
              <option value="market">Market (fills now at the market price)</option>
              <option value="limit">Limit (fills only at your price or better)</option>
            </select>
          </label>
          <label className={labelCls} htmlFor="qty">{a.c === "funds" ? "Units" : a.c === "crypto" ? "Amount" : "Shares"}</label>
          <input id="qty" className={inputCls} inputMode="decimal" placeholder="0" value={qty} autoFocus onChange={(e) => { setQty(e.target.value); setError(""); }} />
          {type === "limit" && (
            <>
              <label className={labelCls} htmlFor="lim">Limit price ($)</label>
              <input id="lim" className={inputCls} inputMode="decimal" placeholder={fmt(price)} value={limit} onChange={(e) => { setLimit(e.target.value); setError(""); }} />
            </>
          )}
          <Row k="Estimated total" v={usd(est)} />
          <Row k="Commission" v="$0.00" />
          <Row k={side === "buy" ? "Buying power" : "Available to sell"} v={side === "buy" ? usd(acct.cash) : `${fmt(avail, 6)} ${a.s}`} />
          <p role="alert" className="mt-2 min-h-5 text-sm text-[#D14343]">{error}</p>
          <div className="mt-3 flex justify-end gap-2.5">
            <button className={lightBtn} onClick={onClose}>Cancel</button>
            <button className={darkBtn} onClick={review}>Review order</button>
          </div>
        </>
      ) : (
        <>
          <div className="mt-4 rounded-2xl bg-[#FAF7F2] p-4">
            <Row k="Action" v={`${side === "buy" ? "Buy" : "Sell"} ${a.s}`} />
            <Row k="Order type" v={type === "limit" ? `Limit at ${usd(lim)}` : "Market"} />
            <Row k="Quantity" v={fmt(q, 6)} />
            <Row k={type === "limit" ? "Estimated total at limit" : "Estimated total"} v={usd(est)} strong />
          </div>
          <p className="mt-3 text-xs text-[#7A7568]">
            {type === "limit"
              ? "Your order stays In Progress until the price reaches your limit. You can cancel it any time before then."
              : "Market orders fill at the current price, which can move before you confirm."}{" "}
            Investing involves risk, including loss of money. Demo only.
          </p>
          <div className="mt-4 flex justify-end gap-2.5">
            <button className={lightBtn} onClick={() => setStep("edit")}>Back</button>
            <button className={darkBtn} onClick={confirm}>Confirm {side === "buy" ? "buy" : "sell"}</button>
          </div>
        </>
      )}
    </Modal>
  );
}

function MoneyDialog({ mode, cash, onSubmit, onClose }) {
  const [amt, setAmt] = useState("");
  const [method, setMethod] = useState("Bank transfer");
  const [error, setError] = useState("");
  const go = () => {
    const v = parseFloat(amt);
    if (!(v >= 1)) return setError("Enter at least $1.00.");
    if (mode === "withdraw" && v > cash + 1e-9) return setError(`You can withdraw up to ${usd(cash)}.`);
    onSubmit(mode, v, method);
    onClose();
  };
  return (
    <Modal title={mode === "deposit" ? "Deposit money" : "Withdraw money"} onClose={onClose}>
      <p className="text-sm text-[#7A7568]">Demo only. No real payment is made.</p>
      <label className={labelCls} htmlFor="mamt">Amount ($)</label>
      <input id="mamt" className={inputCls} inputMode="decimal" placeholder="1000" value={amt} autoFocus onChange={(e) => { setAmt(e.target.value); setError(""); }} />
      <label className={labelCls}>{mode === "deposit" ? "From" : "To"}
        <select className={inputCls} value={method} onChange={(e) => setMethod(e.target.value)}>
          <option>Bank transfer</option><option>Debit card</option>
        </select>
      </label>
      {mode === "withdraw" && <Row k="Available to withdraw" v={usd(cash)} />}
      <p className="mt-2 text-xs text-[#7A7568]">{mode === "deposit" ? "Deposits show as In Progress while they settle." : "Withdrawals show as In Progress until they reach your bank."}</p>
      <p role="alert" className="mt-2 min-h-5 text-sm text-[#D14343]">{error}</p>
      <div className="mt-3 flex justify-end gap-2.5">
        <button className={lightBtn} onClick={onClose}>Cancel</button>
        <button className={darkBtn} onClick={go}>{mode === "deposit" ? "Deposit" : "Withdraw"}</button>
      </div>
    </Modal>
  );
}

function QuickDialog({ prices, onMoney, onOpen, onClose }) {
  const [q, setQ] = useState("");
  const list = ASSETS.filter((a) => (a.s + a.n).toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Modal title="Quick actions" onClose={onClose}>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button className={darkBtn} onClick={() => { onClose(); onMoney("deposit"); }}>Deposit</button>
        <button className={lightBtn} onClick={() => { onClose(); onMoney("withdraw"); }}>Withdraw</button>
      </div>
      <label className={labelCls} htmlFor="qs">Find something to trade</label>
      <input id="qs" className={inputCls} placeholder="Search stocks, crypto or funds" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="mt-2">
        {list.map((a) => (
          <button key={a.s} className="flex w-full items-center gap-3 border-b border-[#F0EBE0] py-3 text-left" onClick={() => { onClose(); onOpen(a.s); }}>
            <Avatar s={a.s} /><div className="flex-1"><b>{a.s}</b> <span className="text-sm text-[#7A7568]">{a.n}</span></div>
            <span>{usd(prices[a.s])}</span>
          </button>
        ))}
        {!list.length && <p className="py-3 text-[#7A7568]">Nothing matches your search.</p>}
      </div>
    </Modal>
  );
}

function NotifDialog({ txs, onClose }) {
  const list = txs.filter((t) => t.status !== "In Progress").slice(0, 6);
  const text = (t) =>
    t.s ? `Your ${t.kind.toLowerCase()} of ${fmt(t.q, 4)} ${t.s} was ${t.status.toLowerCase()}.`
        : `Your ${t.kind.toLowerCase()} of ${usd(t.amount)} ${t.status === "Completed" ? "is complete" : "was " + t.status.toLowerCase()}.`;
  return (
    <Modal title="Notifications" onClose={onClose}>
      {list.length ? list.map((t) => (
        <div key={t.id} className="border-b border-[#F0EBE0] py-3 text-sm">{text(t)}<div className="text-xs text-[#7A7568]">{dayLabel(t.t)}, {timeOf(t.t)}</div></div>
      )) : <p className="mt-4 text-[#7A7568]">No notifications yet.</p>}
    </Modal>
  );
}

/* ---------- asset detail screen ---------- */
function Detail({ a, prices, acct, watched, hide, onBack, onWatch, onTrade }) {
  const [range, setRange] = useState("1D");
  const base = useMemo(() => makeSeries(a, range), [a, range]);
  const day = useMemo(() => makeSeries(a, "1D"), [a]);
  const p = prices[a.s];
  const data = useMemo(() => [...base.slice(0, -1), p], [base, p]);
  const chg = (p / data[0] - 1) * 100;
  const hi = Math.max(...day.slice(0, -1), p), lo = Math.min(...day.slice(0, -1), p);
  const h = acct.hold[a.s];
  const pendingSell = acct.orders.filter((o) => o.s === a.s && o.side === "sell").reduce((x, o) => x + o.q, 0);
  const pend = acct.orders.filter((o) => o.s === a.s).length;
  const m = (v) => (hide ? "••••" : v);
  const stats = [["Open", usd(a.o)], ["Day high", usd(hi)], ["Day low", usd(lo)], [a.c === "crypto" ? "24h volume" : "Volume", a.vol], ["Market cap", a.mc], a.x];
  const news = [`${a.n} reports results ahead of expectations`, `Analysts update their outlook on ${a.n}`, `What’s moving ${a.s} today`];

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-[#FAF7F2]">
      <div className="mx-auto max-w-[520px] px-5 pb-32 pt-[max(16px,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <button aria-label="Back" className="grid h-11 w-11 place-items-center rounded-full border border-[#E6E0D5] bg-white" onClick={onBack}><Ic n="back" /></button>
          <h2 className="font-bold">{CAT_NAME[a.c]} Details</h2>
          <button aria-label={watched ? "Remove from watchlist" : "Add to watchlist"} aria-pressed={watched}
            className="grid h-11 w-11 place-items-center rounded-full border border-[#E6E0D5] bg-white" onClick={onWatch}>
            <Ic n="star" fill={watched ? "#F5B83D" : "none"} />
          </button>
        </div>

        <div className="mt-5 rounded-3xl bg-white p-4">
          <div className="flex items-center gap-3"><Avatar s={a.s} size="h-11 w-11" /><div><b>{a.s}</b><div className="text-xs text-[#7A7568]">{a.n}</div></div></div>
          <div className="mt-3 text-4xl font-bold tracking-tight">{usd(p)}</div>
          <div className="mt-1 flex items-center gap-2"><Change pct={chg} /><span className="text-xs text-[#7A7568]">{range === "1D" ? "Today" : `Past ${range}`}</span></div>
          <div className="mt-3"><Chart data={data} /></div>
          <div className="mt-1 flex justify-between text-xs text-[#7A7568]">{RANGES[range].labels.map((l, i) => <span key={i}>{l}</span>)}</div>
        </div>

        <div className="mt-4 flex rounded-full bg-[#F1ECE4] p-1" role="tablist" aria-label="Time range">
          {Object.keys(RANGES).map((r) => (
            <button key={r} role="tab" aria-selected={range === r} onClick={() => setRange(r)}
              className={`flex-1 rounded-full py-2 text-sm font-semibold ${range === r ? "bg-white shadow" : "text-[#7A7568]"}`}>{r}</button>
          ))}
        </div>

        {h && (
          <div className="mt-5 rounded-3xl bg-white p-4">
            <h3 className="font-bold">Your position</h3>
            <Row k="Units held" v={m(fmt(h.sh, 6))} />
            <Row k="Average cost" v={m(usd(h.avg))} />
            <Row k="Market value" v={m(usd(h.sh * p))} />
            <Row k="Total return" v={m(`${h.sh * (p - h.avg) >= 0 ? "+" : "−"}${usd(Math.abs(h.sh * (p - h.avg)))} (${fmt((p / h.avg - 1) * 100, 2)}%)`)} />
            {pend > 0 && <Row k="Pending orders" v={String(pend)} />}
          </div>
        )}

        <div className="mt-5 rounded-3xl bg-white p-4">
          <h3 className="font-bold">Key statistics</h3>
          <div className="mt-2 grid grid-cols-2 gap-x-6">
            {stats.map(([k, v]) => <div key={k} className="flex justify-between border-b border-[#F0EBE0] py-2.5 text-sm"><span className="text-[#7A7568]">{k}</span><b>{v}</b></div>)}
          </div>
        </div>

        <div className="mt-5 rounded-3xl bg-white p-4">
          <h3 className="font-bold">About {a.n}</h3>
          <p className="mt-1 text-sm text-[#4A473F]">{a.about}</p>
        </div>

        <div className="mt-5 rounded-3xl bg-white p-4">
          <h3 className="font-bold">News</h3>
          {news.map((n, i) => <div key={n} className="border-b border-[#F0EBE0] py-3 text-sm last:border-0">{n}<div className="text-xs text-[#7A7568]">Sample headline · {i + 1}h ago</div></div>)}
        </div>
        <p className="mt-4 text-xs text-[#7A7568]">Simulated prices and sample data. Past performance does not predict future results. Investing involves risk, including loss of money.</p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E6E0D5] bg-[#FAF7F2] px-5 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto flex max-w-[520px] gap-3">
          <button className={`${lightBtn} flex-1 disabled:opacity-40`} disabled={!h || h.sh - pendingSell <= 1e-9} onClick={() => onTrade("sell")}>Sell</button>
          <button className={`${darkBtn} flex-1`} onClick={() => onTrade("buy")}>Buy</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- the app ---------- */
export default function Page() {
  const [acct, setAcct] = useState(null);
  const [prices, setPrices] = useState(() => Object.fromEntries(ASSETS.map((a) => [a.s, a.b])));
  const [tab, setTab] = useState("home");
  const [cat, setCat] = useState("trending");
  const [sort, setSort] = useState("active");
  const [detail, setDetail] = useState(null);
  const [watch, setWatch] = useState(["BTC", "MCD"]);
  const [hide, setHide] = useState(false);
  const [trade, setTrade] = useState(null);
  const [money, setMoney] = useState(null);
  const [quick, setQuick] = useState(false);
  const [notif, setNotif] = useState(false);
  const [seen, setSeen] = useState(0);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [toast, setToast] = useState("");
  const timer = useRef(null);

  const say = (m) => {
    setToast(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 2200);
  };

  // Seed the account on the client only (it uses the current time).
  useEffect(() => { setAcct(seedAccount()); setSeen(Date.now()); }, []);

  // Simulated price movement.
  useEffect(() => {
    const id = setInterval(() => {
      if (document.hidden) return;
      setPrices((pr) => Object.fromEntries(ASSETS.map((a) => [a.s, pr[a.s] * (1 + (Math.random() - 0.5) * TICK_VOL[a.c])])));
    }, 1800);
    return () => clearInterval(id);
  }, []);

  // Fill limit orders when the price reaches the limit.
  useEffect(() => {
    setAcct((a) => {
      if (!a || !a.orders.length) return a;
      let n = a;
      for (const o of a.orders) {
        const p = prices[o.s];
        if ((o.side === "buy" && p <= o.limit) || (o.side === "sell" && p >= o.limit)) n = fillOrder(n, o, p);
      }
      return n;
    });
  }, [prices]);

  if (!acct) return <div className="min-h-screen w-full bg-[#FAF7F2]" />;

  /* derived numbers */
  const heldSyms = Object.keys(acct.hold);
  const reserved = acct.orders.reduce((x, o) => x + o.reserve, 0);
  const holdVal = heldSyms.reduce((x, s) => x + acct.hold[s].sh * prices[s], 0);
  const total = acct.cash + reserved + holdVal;
  const dayChg = heldSyms.reduce((x, s) => x + acct.hold[s].sh * (prices[s] - BY[s].o), 0);
  const dayPct = total - dayChg ? (dayChg / (total - dayChg)) * 100 : 0;
  const cost = heldSyms.reduce((x, s) => x + acct.hold[s].sh * acct.hold[s].avg, 0);
  const ret = holdVal - cost;
  const m = (v) => (hide ? "••••" : v);
  const pctOf = (a) => (prices[a.s] / a.o - 1) * 100;
  const unseen = acct.txs.some((t) => t.t > seen && t.status !== "In Progress");

  /* actions */
  const place = ({ s, side, type, q, limit }) => {
    const price = prices[s];
    setAcct((a) => {
      const id = uid(), exec = limit ?? price;
      const order = { id, s, side, q, limit: limit ?? null, reserve: side === "buy" ? q * exec : 0 };
      const tx = { id, kind: side === "buy" ? "Buy" : "Sell", s, q, price: exec, amount: q * exec, status: "In Progress", limit: limit !== null, t: Date.now() };
      let n = { ...a, cash: a.cash - order.reserve, txs: [tx, ...a.txs], orders: [...a.orders, order] };
      if (limit === null) n = fillOrder(n, order, price);
      return n;
    });
    say(type === "limit" ? `Limit order placed for ${s}` : `${side === "buy" ? "Bought" : "Sold"} ${fmt(q, 4)} ${s}`);
  };
  const cancel = (id) => {
    setAcct((a) => {
      const o = a.orders.find((x) => x.id === id);
      if (!o) return a;
      return { ...a, cash: a.cash + o.reserve, orders: a.orders.filter((x) => x.id !== id), txs: a.txs.map((t) => (t.id === id ? { ...t, status: "Cancelled" } : t)) };
    });
    say("Order cancelled");
  };
  const moveMoney = (mode, amount) => {
    const id = uid();
    const dep = mode === "deposit";
    setAcct((a) => ({ ...a, cash: dep ? a.cash : a.cash - amount, txs: [{ id, kind: dep ? "Deposit" : "Withdraw", amount, status: "In Progress", t: Date.now() }, ...a.txs] }));
    say(dep ? "Deposit started" : "Withdrawal started");
    setTimeout(() => setAcct((a) => ({ ...a, cash: dep ? a.cash + amount : a.cash, txs: a.txs.map((t) => (t.id === id ? { ...t, status: "Completed", t: Date.now() } : t)) })), 3000);
  };
  const toggleWatch = (s) => setWatch((w) => (w.includes(s) ? w.filter((x) => x !== s) : [...w, s]));

  /* home lists */
  let list = ASSETS.filter((a) => cat === "trending" || a.c === cat);
  if (sort === "gainers") list = [...list].sort((x, y) => pctOf(y) - pctOf(x));
  if (sort === "losers") list = [...list].sort((x, y) => pctOf(x) - pctOf(y));
  const cards = [...heldSyms].sort((x, y) => acct.hold[y].sh * prices[y] - acct.hold[x].sh * prices[x]).slice(0, 4);

  /* transactions */
  const needle = q.trim().toLowerCase();
  const txs = acct.txs
    .filter((t) => (kind === "All" || t.kind === kind) && (!needle || `${t.s || ""} ${t.s ? BY[t.s].n : ""} ${t.kind}`.toLowerCase().includes(needle)))
    .sort((x, y) => y.t - x.t);
  const groups = [];
  txs.forEach((t) => {
    const l = dayLabel(t.t);
    const g = groups.find((x) => x.l === l);
    if (g) g.items.push(t); else groups.push({ l, items: [t] });
  });

  /* allocation */
  const alloc = { Cash: acct.cash + reserved, Stocks: 0, Crypto: 0, Funds: 0 };
  heldSyms.forEach((s) => { alloc[{ stocks: "Stocks", crypto: "Crypto", funds: "Funds" }[BY[s].c]] += acct.hold[s].sh * prices[s]; });

  const renderRow = (a) => (
    <button key={a.s} onClick={() => setDetail(a.s)} className="mb-2.5 flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left">
      <Avatar s={a.s} />
      <div className="flex-1"><b>{a.s}</b><div className="text-xs text-[#7A7568]">{a.n}</div></div>
      <Spark a={a} price={prices[a.s]} />
      <div className="min-w-[78px] text-right"><div className="font-bold">{usd(prices[a.s])}</div><Change pct={pctOf(a)} /></div>
    </button>
  );

  const nav = [["home", "home", "Home"], ["portfolio", "pie", "Portfolio"], null, ["txs", "clip", "Transactions"], ["profile", "user", "Profile"]];

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] text-[#15171C]">
      <div className="mx-auto max-w-[520px] px-5 pb-28 pt-[max(16px,env(safe-area-inset-top))]">
        {tab !== "txs" && (
          <div className="flex items-center justify-between">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[#FFD7B5] to-[#F5A6A0]" aria-hidden="true"><Ic n="user" /></div>
            <div className="flex gap-2.5">
              <button aria-label="Notifications" className="relative grid h-11 w-11 place-items-center rounded-full border border-[#E6E0D5] bg-white" onClick={() => { setNotif(true); setSeen(Date.now()); }}>
                <Ic n="bell" />{unseen && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#E5484D]" />}
              </button>
              <button aria-label="Account settings" className="grid h-11 w-11 place-items-center rounded-full border border-[#E6E0D5] bg-white" onClick={() => setTab("profile")}><Ic n="sliders" /></button>
            </div>
          </div>
        )}

        {tab === "home" && (
          <section>
            <div className="mt-5 rounded-3xl bg-[#15171C] p-5 text-white">
              <div className="flex items-center justify-between text-sm opacity-80">
                <span>Total balance</span>
                <button className="text-xs font-semibold underline" onClick={() => setHide(!hide)}>{hide ? "Show" : "Hide"}</button>
              </div>
              <div className="mt-1 text-[clamp(32px,9vw,42px)] font-bold tracking-tight">{m(usd(total))}</div>
              <div className="mt-1 text-sm">
                Today{" "}
                <span className={dayChg >= 0 ? "text-[#6FE0A8]" : "text-[#FF9AA0]"}>
                  {m(`${dayChg >= 0 ? "+" : "−"}${usd(Math.abs(dayChg))} (${fmt(Math.abs(dayPct), 2)}%)`)}
                </span>
              </div>
              <div className="mt-5 grid grid-cols-4 gap-2 text-center text-xs">
                {[["Deposit", "down", () => setMoney("deposit")], ["Withdraw", "up", () => setMoney("withdraw")], ["Invest", "plus", () => setQuick(true)], ["History", "clip", () => setTab("txs")]].map(([l, ic, fn]) => (
                  <button key={l} onClick={fn} className="flex flex-col items-center gap-1.5">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-white/15"><Ic n={ic} /></span>{l}
                  </button>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-white/10 p-3 text-sm">
                <div><div className="opacity-70">Buying power</div><b className="text-base">{m(usd(acct.cash))}</b></div>
                <div><div className="opacity-70">Invested</div><b className="text-base">{m(usd(holdVal))}</b></div>
              </div>
            </div>

            <div className="no-scrollbar -mx-5 mt-5 flex gap-2.5 overflow-x-auto px-5" role="tablist" aria-label="Asset types">
              {CATS.map(([k, l]) => (
                <button key={k} role="tab" aria-selected={cat === k} onClick={() => setCat(k)}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold ${cat === k ? "border-[#15171C] bg-[#15171C] text-white" : "border-[#E6E0D5] bg-white"}`}>{l}</button>
              ))}
            </div>

            <h2 className="mb-3 mt-6 text-lg font-bold">Portfolio Overview</h2>
            <div className="no-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-1">
              {cards.length ? cards.map((s, i) => {
                const a = BY[s], h = acct.hold[s];
                return (
                  <div key={s} className="min-w-[210px] snap-start rounded-3xl p-4" style={{ background: CARD_COLORS[i % 4] }}>
                    <button className="flex items-center gap-2 text-left" onClick={() => setDetail(s)}><Avatar s={s} size="h-8 w-8" bg="bg-white" /><b>{a.n}</b></button>
                    <div className="mt-3 text-2xl font-bold">{usd(prices[s])}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs"><span>{m(usd(h.sh * prices[s]))}</span><Change pct={pctOf(a)} /></div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button className="rounded-full border-2 border-[#15171C] py-1.5 text-sm font-semibold" onClick={() => setTrade({ s, side: "buy" })}>Buy</button>
                      <button className="rounded-full bg-[#15171C] py-1.5 text-sm font-semibold text-white" onClick={() => setTrade({ s, side: "sell" })}>Sell</button>
                    </div>
                  </div>
                );
              }) : (
                <div className="w-full rounded-3xl bg-white p-5 text-sm">You don’t own anything yet. Pick an asset below to make your first investment.</div>
              )}
            </div>

            <div className="mb-3 mt-7 flex items-center justify-between">
              <h2 className="text-lg font-bold">{cat === "trending" ? "Top Trending" : CATS.find((c) => c[0] === cat)[1]}</h2>
              <select aria-label="Sort" className="rounded-full border border-[#E6E0D5] bg-white px-3 py-1.5 text-sm" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="active">Most active</option><option value="gainers">Top gainers</option><option value="losers">Top losers</option>
              </select>
            </div>
            {list.slice(0, 8).map(renderRow)}

            {watch.length > 0 && (
              <>
                <h2 className="mb-3 mt-7 text-lg font-bold">Watchlist</h2>
                {watch.map((s) => renderRow(BY[s]))}
              </>
            )}
            <p className="mt-6 text-xs text-[#7A7568]">Simulated prices and sample data. Demo only. Investing involves risk, including loss of money. Nothing here is investment advice.</p>
          </section>
        )}

        {tab === "portfolio" && (
          <section>
            <h1 className="mt-6 text-3xl font-bold">Portfolio</h1>
            <div className="mt-4 rounded-3xl bg-[#15171C] p-5 text-white">
              <div className="flex items-center justify-between text-sm opacity-80">Total value
                <button className="text-xs font-semibold underline" onClick={() => setHide(!hide)}>{hide ? "Show" : "Hide"}</button></div>
              <div className="mt-1 text-4xl font-bold tracking-tight">{m(usd(total))}</div>
              <div className="mt-2 text-sm">Today <span className={dayChg >= 0 ? "text-[#6FE0A8]" : "text-[#FF9AA0]"}>{m(`${dayChg >= 0 ? "+" : "−"}${usd(Math.abs(dayChg))} (${fmt(Math.abs(dayPct), 2)}%)`)}</span></div>
              <div className="mt-1 text-sm">Total return <span className={ret >= 0 ? "text-[#6FE0A8]" : "text-[#FF9AA0]"}>{m(`${ret >= 0 ? "+" : "−"}${usd(Math.abs(ret))} (${fmt(cost ? Math.abs(ret / cost) * 100 : 0, 2)}%)`)}</span></div>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/10 p-3 text-sm">
                <div>Buying power<div className="text-lg font-bold">{m(usd(acct.cash))}</div></div>
                <button className="rounded-full bg-white px-4 py-2 font-bold text-[#15171C]" onClick={() => setMoney("deposit")}>Deposit</button>
              </div>
            </div>

            <h2 className="mb-3 mt-6 text-lg font-bold">Allocation</h2>
            <div className="rounded-3xl bg-white p-4">
              <div className="flex h-3 overflow-hidden rounded-full bg-[#F1ECE4]" role="img" aria-label="Portfolio allocation">
                {Object.entries(alloc).map(([k, v]) => <div key={k} style={{ width: `${total ? (v / total) * 100 : 0}%`, background: ALLOC_COLORS[k] }} />)}
              </div>
              {Object.entries(alloc).map(([k, v]) => (
                <div key={k} className="mt-2.5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full" style={{ background: ALLOC_COLORS[k] }} />{k}</span>
                  <b>{m(`${fmt(total ? (v / total) * 100 : 0, 1)}%`)}</b>
                </div>
              ))}
            </div>

            <h2 className="mb-3 mt-6 text-lg font-bold">Holdings</h2>
            {heldSyms.length ? heldSyms.map((s) => {
              const a = BY[s], h = acct.hold[s], pl = h.sh * (prices[s] - h.avg);
              return (
                <button key={s} onClick={() => setDetail(s)} className="mb-2.5 flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left">
                  <Avatar s={s} />
                  <div className="flex-1"><b>{s}</b><div className="text-xs text-[#7A7568]">{m(`${fmt(h.sh, 4)} units · avg ${usd(h.avg)}`)}</div></div>
                  <div className="text-right"><div className="font-bold">{m(usd(h.sh * prices[s]))}</div>
                    <div className={`text-xs font-semibold ${pl >= 0 ? "text-[#1E8E5A]" : "text-[#D14343]"}`}>{m(`${pl >= 0 ? "+" : "−"}${usd(Math.abs(pl))}`)}</div></div>
                </button>
              );
            }) : <p className="text-[#7A7568]">No holdings yet.</p>}

            {acct.orders.length > 0 && (
              <>
                <h2 className="mb-3 mt-6 text-lg font-bold">Open orders</h2>
                {acct.orders.map((o) => (
                  <div key={o.id} className="mb-2.5 flex items-center justify-between rounded-2xl bg-white p-3 text-sm">
                    <div><b>{o.side === "buy" ? "Buy" : "Sell"} {fmt(o.q, 4)} {o.s}</b><div className="text-xs text-[#7A7568]">Limit {usd(o.limit)} · now {usd(prices[o.s])}</div></div>
                    <button className="rounded-full border border-[#15171C] px-3 py-1 font-semibold" onClick={() => cancel(o.id)}>Cancel</button>
                  </div>
                ))}
              </>
            )}
          </section>
        )}

        {tab === "txs" && (
          <section>
            <h1 className="mt-4 text-3xl font-bold leading-tight">Transaction<br />History</h1>
            <div className="mt-5 flex h-12 items-center gap-2 rounded-full border border-[#E6E0D5] bg-white px-4">
              <Ic n="search" c="h-5 w-5 flex-none" />
              <input className="h-full flex-1 bg-transparent outline-none" placeholder="Search transaction" aria-label="Search transactions" value={q} onChange={(e) => setQ(e.target.value)} />
              <button aria-label="Filter" aria-pressed={filterOpen} onClick={() => setFilterOpen(!filterOpen)}><Ic n="filter" /></button>
            </div>
            {filterOpen && (
              <div className="mt-3 flex flex-wrap gap-2">
                {["All", "Buy", "Sell", "Deposit", "Withdraw"].map((k) => (
                  <button key={k} onClick={() => setKind(k)} className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold ${kind === k ? "border-[#15171C] bg-[#15171C] text-white" : "border-[#E6E0D5] bg-white"}`}>{k}</button>
                ))}
              </div>
            )}
            {groups.map((g) => (
              <div key={g.l}>
                <h2 className="mb-2.5 mt-6 font-bold">{g.l}</h2>
                {g.items.map((t) => {
                  const a = t.s ? BY[t.s] : null;
                  return (
                    <div key={t.id} className="mb-2.5 flex items-center gap-3 rounded-2xl bg-white p-3">
                      {a ? <Avatar s={a.s} /> : <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-[#F1E8D8]"><Ic n={t.kind === "Deposit" ? "down" : "up"} /></span>}
                      <div className="min-w-0 flex-1">
                        <div><b>{a ? a.s : t.kind}</b> <span className="text-sm text-[#7A7568]">{a ? a.n : "Bank transfer"}</span></div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                          <span className={`rounded-md px-1.5 py-0.5 font-semibold ${STATUS[t.status]}`}>{t.status}</span>
                          <span className="text-[#7A7568]">• {a ? `${t.kind}${t.limit ? " (limit)" : ""}` : t.kind}</span>
                          {t.status === "In Progress" && acct.orders.some((o) => o.id === t.id) && (
                            <button className="font-semibold underline" onClick={() => cancel(t.id)}>Cancel</button>
                          )}
                        </div>
                      </div>
                      <div className="text-right"><div className="font-bold">{m(usd(t.amount))}</div><div className="text-xs text-[#7A7568]">{timeOf(t.t)}</div></div>
                    </div>
                  );
                })}
              </div>
            ))}
            {!groups.length && <p className="mt-6 text-[#7A7568]">No transactions match.</p>}
          </section>
        )}

        {tab === "profile" && (
          <section>
            <h1 className="mt-6 text-3xl font-bold">Profile</h1>
            <div className="mt-4 rounded-3xl bg-white p-4">
              <h2 className="font-bold">Account verification</h2>
              {[["Email address", "Verified"], ["Identity (KYC)", "Not needed in demo"], ["Bank account", "Not linked in demo"]].map(([k, v]) => (
                <Row key={k} k={k} v={v} />
              ))}
              <p className="mt-3 text-xs text-[#7A7568]">A real investment platform must verify your identity and link a bank account before you can trade. Those steps are skipped here.</p>
            </div>
            <div className="mt-4 rounded-3xl bg-white p-4">
              <h2 className="font-bold">Settings</h2>
              <label className="mt-3 flex items-center justify-between text-sm">Hide balances
                <input type="checkbox" className="h-5 w-5 accent-[#15171C]" checked={hide} onChange={(e) => setHide(e.target.checked)} /></label>
              <button className={`${lightBtn} mt-4 w-full`} onClick={() => { setAcct(seedAccount()); setWatch(["BTC", "MCD"]); setSeen(Date.now()); say("Demo data reset"); }}>Reset demo data</button>
            </div>
            <div className="mt-4 rounded-3xl bg-white p-4 text-sm text-[#4A473F]">
              <h2 className="font-bold text-[#15171C]">Important information</h2>
              <p className="mt-2">Investing involves risk, including the possible loss of the money you put in. Past performance does not predict future results. Crypto assets are especially volatile.</p>
              <p className="mt-2">Prices, news and company data in this app are simulated sample data. It does not provide investment advice, and no real orders are placed.</p>
            </div>
          </section>
        )}
      </div>

      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E6E0D5] bg-[#FAF7F2] px-3 pb-[max(8px,env(safe-area-inset-bottom))] pt-2">
        <div className="mx-auto flex max-w-[520px] items-center justify-around">
          {nav.map((n) => n ? (
            <button key={n[0]} aria-label={n[2]} aria-current={tab === n[0] ? "page" : undefined} onClick={() => setTab(n[0])}
              className={`grid h-11 w-11 place-items-center rounded-full ${tab === n[0] ? "bg-[#15171C] text-white" : "text-[#7A7568]"}`}><Ic n={n[1]} /></button>
          ) : (
            <button key="plus" aria-label="Quick actions" onClick={() => setQuick(true)} className="grid h-14 w-14 -translate-y-3 place-items-center rounded-full bg-[#15171C] text-white shadow-lg"><Ic n="plus" c="h-7 w-7" /></button>
          ))}
        </div>
      </nav>

      {detail && (
        <Detail key={detail} a={BY[detail]} prices={prices} acct={acct} hide={hide} watched={watch.includes(detail)}
          onBack={() => setDetail(null)} onWatch={() => toggleWatch(detail)} onTrade={(side) => setTrade({ s: detail, side })} />
      )}
      {trade && <TradeDialog key={trade.s + trade.side} a={BY[trade.s]} side0={trade.side} prices={prices} acct={acct} onPlace={place} onClose={() => setTrade(null)} />}
      {money && <MoneyDialog mode={money} cash={acct.cash} onSubmit={moveMoney} onClose={() => setMoney(null)} />}
      {quick && <QuickDialog prices={prices} onMoney={setMoney} onOpen={setDetail} onClose={() => setQuick(false)} />}
      {notif && <NotifDialog txs={[...acct.txs].sort((x, y) => y.t - x.t)} onClose={() => setNotif(false)} />}

      <div role="status" className={`pointer-events-none fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 whitespace-nowrap rounded-full bg-[#15171C] px-[18px] py-2.5 text-sm text-white transition-opacity ${toast ? "opacity-100" : "opacity-0"}`}>{toast}</div>
    </div>
  );
}