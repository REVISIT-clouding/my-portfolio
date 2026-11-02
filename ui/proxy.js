import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // 1. Initialize Supabase client for middleware
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
                    response = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // 2. Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();

    // 3. Protect the /admin route (redirect to login if not logged in)
    if (request.nextUrl.pathname.startsWith('/admin') && !user) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return response;
}

// 4. Specify which routes this middleware should run on
export const config = {
    matcher: ['/uoadminuo/:path*', '/api/protected/:path*'],
};