import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Guards the admin page with the same auth_token cookie the API routes check
export async function proxy(request) {
    const secret = process.env.JWT_SECRET;
    const token = request.cookies.get("auth_token")?.value;

    if (secret && token) {
        try {
            await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ["HS256"] });
            return NextResponse.next();
        } catch {
            // bad or expired token: fall through to the redirect
        }
    }

    return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
    matcher: ["/uoadminuo/:path*"],
};