import supabase from "@/utils/supabase/client";
import { NextResponse } from "next/server";

export async function POST(req) {
    const body = await req.json()
    const { name } = body;

    const { data, error } = await supabase
        .from("skills").insert({
            name,
        })

    if (error) {
        return NextResponse.json({ message: "failed to insert" }, { status: 500 })
    }

    return NextResponse.json({ message: "Skill added" }, { status: 201 })
}

export async function GET() {
    const { data, error } = await supabase.from("skills").select("*").order("name");
    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ skills: data });
}
