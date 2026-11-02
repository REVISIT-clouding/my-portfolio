"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BiShow, BiHide } from "react-icons/bi"
import { RiArrowRightUpLine } from "react-icons/ri"


export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("")
    const [show, setShow] = useState(false);
    const router = useRouter()

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password
                })
            });

            const data = await res.json();

            if (res.ok) {
                router.push("/uoadminuo");
            } else {
                setError(data.message || "Login failed");
            }
        } catch (err) {
            setError("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main
            className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-5 text-white"
            style={{
                paddingTop: "max(2.5rem, env(safe-area-inset-top))",
                paddingBottom: "max(2.5rem, env(safe-area-inset-bottom))",
            }}
        >
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-red-500/20 blur-3xl" />

            <div className="relative w-full max-w-sm">
                <Link href="/" className="text-xl font-extrabold tracking-tight">
                    Unique<span className="text-red-500">.</span>
                </Link>

                <h1 className="mt-8 text-5xl font-extrabold leading-[0.95] tracking-tight">
                    SIGN
                    <br />
                    IN<span className="text-red-500">.</span>
                </h1>
                <p className="mt-3 text-sm text-gray-400">Only me past this point.</p>

                <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-4">
                    <label className="block">
                        <span className="text-xs uppercase tracking-widest text-gray-400">Email</span>
                        <input
                            type="email"
                            required
                            autoFocus
                            autoComplete="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3.5 outline-none transition focus:border-red-500"
                        />
                    </label>

                    <label className="block">
                        <span className="text-xs uppercase tracking-widest text-gray-400">Password</span>
                        <div className="relative mt-2">
                            <input
                                type={show ? "text" : "password"}
                                required
                                autoComplete="current-password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="w-full rounded-xl border border-white/10 bg-white/5 p-3.5 pr-14 outline-none transition focus:border-red-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShow((s) => !s)}
                                aria-label={show ? "Hide password" : "Show password"}
                                className="absolute right-1.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-xl text-gray-400 hover:text-white"
                            >
                                {show ? <BiHide /> : <BiShow />}
                            </button>
                        </div>
                    </label>

                    {error && (
                        <p role="alert" className="rounded-xl bg-red-500/15 px-4 py-2.5 text-sm text-red-200">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-1 inline-flex items-center justify-center gap-1 rounded-full bg-red-500 px-6 py-3.5 font-semibold text-white shadow-md transition hover:bg-red-600 active:scale-95 disabled:opacity-60"
                    >
                        {loading ? "Signing in..." : "Sign in"}
                        {!loading && <RiArrowRightUpLine className="text-xl" />}
                    </button>
                </form>

                <Link href="/" className="mt-6 inline-block text-sm text-gray-400 hover:text-white">
                    ← Back to site
                </Link>
            </div>
        </main>
    )
}