import supabaseAdmin from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

const toList = (v) =>
    String(v || "")
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);

async function uploadMany(files) {
    const urls = [];
    for (const f of files) {
        if (!f || typeof f !== "object" || f.size === 0) continue;
        const buf = Buffer.from(await f.arrayBuffer());
        const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${f.name.replace(/\s/g, "_")}`;
        const { error } = await supabaseAdmin.storage
            .from("experience-images")
            .upload(name, buf, { contentType: f.type, upsert: false });
        if (error) throw new Error(error.message);
        urls.push(supabaseAdmin.storage.from("experience-images").getPublicUrl(name).data.publicUrl);
    }
    return urls;
}

export async function PUT(req, { params }) {
    try {
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get("auth_token");
        if (!tokenCookie || !tokenCookie.value) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        jwt.verify(tokenCookie.value, process.env.JWT_SECRET);

        const { id } = await params;
        if (!id) {
            return NextResponse.json({ message: "ID is required for updating" }, { status: 422 });
        }

        const formData = await req.formData();
        const imageFile = formData.get("img");
        let publicImageUrl = formData.get("existingImg") || null;

        if (imageFile && typeof imageFile === "object" && imageFile.size > 0) {
            const [url] = await uploadMany([imageFile]);
            publicImageUrl = url;
        }

        let kept = [];
        try { kept = JSON.parse(formData.get("existingImages") || "[]"); } catch {}
        const images = [...kept, ...(await uploadMany(formData.getAll("images")))];

        const stackRaw = formData.get("stack");
        const stack = typeof stackRaw === "string"
            ? stackRaw.split(",").map((t) => t.trim()).filter(Boolean)
            : stackRaw;

        const { data, error } = await supabaseAdmin
            .from("experience")
            .update({
                title: formData.get("title"),
                subtitle: formData.get("subtitle"),
                summary: formData.get("summary"),
                details: formData.get("details"),
                overview: formData.get("overview") || null,
                contributions: toList(formData.get("contributions")),
                key_features: toList(formData.get("key_features")),
                technical_implementation: formData.get("technical_implementation") || null,
                engineering_challenges: toList(formData.get("engineering_challenges")),
                known_limitations: toList(formData.get("known_limitations")),
                stack,
                footerleft: formData.get("footerleft") || null,
                mode: formData.get("mode") || "work",
                href: formData.get("href") || null,
                status: formData.get("status") || "In progress",
                display_order: parseInt(formData.get("display_order"), 10) || 100,
                project_date: formData.get("project_date") || null,
                img: publicImageUrl,
                images,
            })
            .eq("id", id)
            .select();

        if (error) {
            console.error("Supabase Update Error:", error);
            return NextResponse.json({ message: error.message || "Database update failed" }, { status: 500 });
        }

        return NextResponse.json({ message: "Experience updated successfully", data }, { status: 200 });
    } catch (err) {
        console.error("Server PUT Error:", err);
        return NextResponse.json({ message: "Internal server error", error: err.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get("auth_token");
        if (!tokenCookie || !tokenCookie.value) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        jwt.verify(tokenCookie.value, process.env.JWT_SECRET);

        const { id } = await params;
        if (!id) {
            return NextResponse.json({ message: "ID is required for deletion" }, { status: 422 });
        }

        const { error } = await supabaseAdmin.from("experience").delete().eq("id", id);
        if (error) {
            return NextResponse.json({ message: "Delete failed", error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: "Experience deleted successfully" }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: "Internal server error", error: err.message }, { status: 500 });
    }
}