import supabaseAdmin from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

const top = (obj, n = 5) =>
    Object.entries(obj)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, n);

export async function GET() {
    try {
        const token = (await cookies()).get("auth_token");
        if (!token?.value) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        jwt.verify(token.value, process.env.JWT_SECRET);

        const since = new Date(Date.now() - 30 * 86400000).toISOString();
        const [ev, en] = await Promise.all([
            supabaseAdmin
                .from("site_events")
               .select("type, ref, visitor_hash, country, created_at, device, os, browser")
                .gte("created_at", since)
                .limit(10000),
            supabaseAdmin.from("skill_endorsements").select("skill_name"),
        ]);
        if (ev.error) return NextResponse.json({ message: ev.error.message }, { status: 500 });

        const events = ev.data || [];
        const visits = events.filter((e) => e.type === "visit");
        const opens = events.filter((e) => e.type === "project_open");

        // last 14 days, oldest first
        const days = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
            days.push({ day: d, visits: 0 });
        }
        visits.forEach((v) => {
            const row = days.find((d) => d.day === v.created_at.slice(0, 10));
            if (row) row.visits++;
        });

        const byProject = {}, byCountry = {}, bySkill = {};
        const byDevice = {}, byBrowser = {};
visits.forEach((v) => {
    if (v.device) byDevice[v.device] = (byDevice[v.device] || 0) + 1;
    if (v.browser) byBrowser[v.browser] = (byBrowser[v.browser] || 0) + 1;
});
        opens.forEach((o) => { if (o.ref) byProject[o.ref] = (byProject[o.ref] || 0) + 1; });
        visits.forEach((v) => { if (v.country) byCountry[v.country] = (byCountry[v.country] || 0) + 1; });
        (en.data || []).forEach((r) => { bySkill[r.skill_name] = (bySkill[r.skill_name] || 0) + 1; });

        return NextResponse.json({
            visits30: visits.length,
            unique30: new Set(visits.map((v) => v.visitor_hash)).size,
            opens30: opens.length,
            endorsements: (en.data || []).length,
            days,
            topProjects: top(byProject),
            topSkills: top(bySkill),
            countries: top(byCountry),
            devices: top(byDevice),
browsers: top(byBrowser),
        });
    } catch (err) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}