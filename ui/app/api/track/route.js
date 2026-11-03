import supabaseAdmin from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req) {
    try {
        const { type, ref } = await req.json();
        if (!["visit", "project_open"].includes(type)) {
            return NextResponse.json({ message: "Bad type" }, { status: 422 });
        }

        // Skip you: logged-in admin
        const token = (await cookies()).get("auth_token");
        if (token?.value) {
            try {
                jwt.verify(token.value, process.env.JWT_SECRET);
                return NextResponse.json({ skipped: "owner" });
            } catch {}
        }

        const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

        // Skip you: optional IP list, e.g. OWNER_IPS=1.2.3.4,5.6.7.8
        const ownerIps = (process.env.OWNER_IPS || "").split(",").map((s) => s.trim()).filter(Boolean);
        if (ownerIps.includes(ip)) {
            return NextResponse.json({ skipped: "owner" });
        }

        const ua = req.headers.get("user-agent") || "";
        const visitor_hash = crypto
            .createHash("sha256")
            .update(ip + ua + (process.env.JWT_SECRET || ""))
            .digest("hex");

        await supabaseAdmin.from("site_events").insert({
            type,
            ref: ref ? String(ref).slice(0, 120) : null,
            visitor_hash,
            country: req.headers.get("x-vercel-ip-country") || null,
        });
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}