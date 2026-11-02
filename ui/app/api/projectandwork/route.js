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

export async function POST(req) {
    try {
        // 1. Authenticate via custom JWT cookie
        const JWT_SECRET = process.env.JWT_SECRET;
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get("auth_token");

        if (!tokenCookie || !tokenCookie.value) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        jwt.verify(tokenCookie.value, JWT_SECRET);

        // 2. Parse FormData from frontend
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

        let publicImageUrl = null;

        // 3. Upload file to Supabase Storage bucket if provided
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
                return NextResponse.json(
                    { message: "Image upload failed", error: uploadError.message },
                    { status: 500 }
                );
            }

            // 4. Get Public URL
            const { data: urlData } = supabaseAdmin.storage
                .from("experience-images")
                .getPublicUrl(fileName);

            publicImageUrl = urlData.publicUrl;
        }

        // 5. Insert record
        const { error: dbError } = await supabaseAdmin.from("experience").insert({
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
            stack,
            footerleft: footerleft || null,
            mode: mode || "work",
            href: href || null,
            status: status || "In progress",
            img: publicImageUrl,
        });

        if (dbError) {
            return NextResponse.json(
                { message: "Database insert error", error: dbError.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "Experience and image created successfully!" },
            { status: 201 }
        );
    } catch (err) {
        return NextResponse.json(
            { message: "Internal server error", error: err.message },
            { status: 500 }
        );
    }
}

export async function GET(req) {
    try {
        const { data: fetchAll, error } = await supabaseAdmin
            .from("experience")
            .select("*")
            .order("id", { ascending: false });

        if (error) {
            return NextResponse.json(
                { message: "Failed to fetch records", error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ fetchAll: fetchAll || [] }, { status: 200 });
    } catch (err) {
        return NextResponse.json(
            { message: "Internal server error", error: err.message },
            { status: 500 }
        );
    }
}
export async function GET(req) {
    try {
        const { data: fetchAll, error } = await supabaseAdmin
            .from("experience")
            .select("*")
            .order("id", { ascending: false });

        if (error) {
            return NextResponse.json({ message: "Failed to fetch records", error: error.message }, { status: 500 });
        }

        return NextResponse.json({ fetchAll: fetchAll || [] }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: "Internal server error", error: err.message }, { status: 500 });
    }
}