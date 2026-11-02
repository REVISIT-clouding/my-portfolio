import supabaseAdmin from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

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
        const stack = formData.get("stack");
        const footerleft = formData.get("footerLeft");
        const mode = formData.get("mode");
        const href = formData.get("href");
        const status = formData.get("status");
        const imageFile = formData.get("img");
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
                    upsert: false
                });

            if (uploadError) {
                console.error("Storage Upload Error:", uploadError);
                return NextResponse.json({ message: "Image upload failed", error: uploadError.message }, { status: 500 });
            }

            const { data: urlData } = supabaseAdmin.storage
                .from("experience-images")
                .getPublicUrl(fileName);

            publicImageUrl = urlData.publicUrl;
        }

        // Format stack correctly (handles both string and array inputs)
        let formattedStack = stack;
        if (typeof stack === "string") {
            formattedStack = stack.split(",").map(t => t.trim()).filter(Boolean);
        }

        // Update record in Supabase
        const { data, error } = await supabaseAdmin
            .from("experience")
            .update({
                title,
                subtitle,
                summary,
                details,
                stack: formattedStack,
                footerleft: footerleft || null,
                mode: mode || 'work',
                href: href || null,
                status: status || 'In progress',
                img: publicImageUrl
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
        // 1. Authenticate via custom JWT cookie
        const JWT_SECRET = process.env.JWT_SECRET;
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get("auth_token");
        
        if (!tokenCookie || !tokenCookie.value) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        jwt.verify(tokenCookie.value, JWT_SECRET);

        // 2. Get the record ID from the URL params
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ message: "ID is required for deletion" }, { status: 422 });
        }

        // 3. Delete from Supabase
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