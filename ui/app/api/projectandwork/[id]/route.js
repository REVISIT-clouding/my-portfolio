import supabaseAdmin from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

// textarea (one per line) -> array for jsonb columns
const toList = (v) =>
    String(v || "")
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);

export async function PUT(req, { params }) {
    try {
        const JWT_SECRET = process.env.JWT_SECRET;
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get("auth_token");

        if (!tokenCookie || !tokenCookie.value) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        jwt.verify(tokenCookie.value, JWT_SECRET);

        const { id } = await params;
        if (!id) {
            return NextResponse.json({ message: "ID is required for updating" }, { status: 422 });
        }

        const formData = await req.formData();
        const title = formData.get("title");
        const subtitle = formData.get("subtitle");
        const summary = formData.get("summary");
        const details = formData.get("details");
        const overview = formData.get("overview");
        const contributions = toList(formData.get("contributions"));
        const key_features = toList(formData.get("key_features"));
        const technical_implementation = formData.get("technical_implementation");
        const engineering_challenges = toList(formData.get("engineering_challenges"));
        const known_limitations = toList(formData.get("known_limitations"));
        const stack = formData.get("stack");
        const footerleft = formData.get("footerleft");
        const mode = formData.get("mode");
        const href = formData.get("href");
        const status = formData.get("status");
        const imageFile = formData.get("img");
        const display_order = parseInt(formData.get("display_order"), 10) || 100;
        const existingImg = formData.get("existingImg");

        let publicImageUrl = existingImg || null;

        // Handle optional new image upload
        if (imageFile && typeof imageFile === "object" && imageFile.size > 0) {
            const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
            const fileName = `${Date.now()}-${imageFile.name.replace(/\s/g, "_")}`;

            const { error: uploadError } = await supabaseAdmin.storage
                .from("experience-images")
                .upload(fileName, fileBuffer, {
                    contentType: imageFile.type,
                    upsert: false,
                });

            if (uploadError) {
                console.error("Storage Upload Error:", uploadError);
                return NextResponse.json(
                    { message: "Image upload failed", error: uploadError.message },
                    { status: 500 }
                );
            }

            const { data: urlData } = supabaseAdmin.storage
                .from("experience-images")
                .getPublicUrl(fileName);

            publicImageUrl = urlData.publicUrl;
        }

        // stack: "a, b, c" -> ["a","b","c"]
        let formattedStack = stack;
        if (typeof stack === "string") {
            formattedStack = stack.split(",").map((t) => t.trim()).filter(Boolean);
        }

        const { data, error } = await supabaseAdmin
            .from("experience")
            .update({
                title,
                subtitle,
                summary,
                details,
                overview: overview || null,
                contributions,
                key_features,
                technical_implementation: technical_implementation || null,
                engineering_challenges,
                known_limitations,
                stack: formattedStack,
                footerleft: footerleft || null,
                mode: mode || "work",
                href: href || null,
                status: status || "In progress",
                img: publicImageUrl,
            })
            .eq("id", id)
            .select();

        if (error) {
            console.error("Supabase Update Error:", error);
            return NextResponse.json(
                { message: error.message || "Database update failed" },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: "Experience updated successfully", data }, { status: 200 });
    } catch (err) {
        console.error("Server PUT Error:", err);
        return NextResponse.json(
            { message: "Internal server error", error: err.message },
            { status: 500 }
        );
    }
}

export async function DELETE(req, { params }) {
    try {
        const JWT_SECRET = process.env.JWT_SECRET;
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get("auth_token");

        if (!tokenCookie || !tokenCookie.value) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        jwt.verify(tokenCookie.value, JWT_SECRET);

        const { id } = await params;
        if (!id) {
            return NextResponse.json({ message: "ID is required for deletion" }, { status: 422 });
        }

        const { error } = await supabaseAdmin
            .from("experience")
            .delete()
            .eq("id", id);

        if (error) {
            return NextResponse.json({ message: "Delete failed", error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: "Experience deleted successfully" }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: "Internal server error", error: err.message }, { status: 500 });
    }
}