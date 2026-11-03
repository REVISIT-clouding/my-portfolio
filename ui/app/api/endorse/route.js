import supabaseAdmin from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function visitorHash(req) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const ua = req.headers.get("user-agent") || "";
    return crypto.createHash("sha256").update(ip + ua + (process.env.JWT_SECRET || "")).digest("hex");
}

export async function GET(req) {
    const { data, error } = await supabaseAdmin
        .from("skill_endorsements")
        .select("skill_name, visitor_hash");
    if (error) return NextResponse.json({ message: error.message }, { status: 500 });

    const me = visitorHash(req);
    const counts = {};
    const mine = [];
    for (const r of data) {
        counts[r.skill_name] = (counts[r.skill_name] || 0) + 1;
        if (r.visitor_hash === me) mine.push(r.skill_name);
    }
    return NextResponse.json({ counts, mine });
}

export async function POST(req) {
    const { skill } = await req.json();
    const skill_name = String(skill || "").trim().slice(0, 60);
    if (!skill_name) return NextResponse.json({ message: "Skill required" }, { status: 422 });

    const { error } = await supabaseAdmin
        .from("skill_endorsements")
        .insert({ skill_name, visitor_hash: visitorHash(req) });

    if (error?.code === "23505") return NextResponse.json({ already: true });
    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ ok: true }, { status: 201 });
}