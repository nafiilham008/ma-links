import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "super-secret-key-change-this"
);

export async function middleware(request) {
    const token = request.cookies.get("token")?.value;
    const { pathname } = request.nextUrl;

    // Routes that require authentication
    const isProtectedRoute = pathname.startsWith("/dashboard") ||
        pathname.startsWith("/api/links") ||
        pathname.startsWith("/api/upload") ||
        pathname.startsWith("/api/auth/profile") ||
        pathname.startsWith("/api/admin");

    // Routes that are for guests only (redirect to dashboard if logged in)
    const isGuestRoute = pathname === "/login" ||
        pathname === "/register" ||
        pathname === "/forgot-password" ||
        pathname.startsWith("/reset-password");

    if (isGuestRoute && token) {
        try {
            await jwtVerify(token, JWT_SECRET);
            const response = NextResponse.redirect(new URL("/dashboard", request.url));
            // Prevent caching so the browser always hits the middleware even on back button
            response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
            response.headers.set("Pragma", "no-cache");
            response.headers.set("Expires", "0");
            return response;
        } catch (e) {
            // Invalid token, let them stay on login/register
        }
    }

    if (isGuestRoute) {
        const response = NextResponse.next();
        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        return response;
    }

    if (isProtectedRoute) {
        if (!token) {
            // If it's an API route, return 401 instead of redirect
            if (pathname.startsWith("/api/")) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            return NextResponse.redirect(new URL("/login", request.url));
        }

        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);

            const requestHeaders = new Headers(request.headers);
            requestHeaders.set("x-user-id", payload.sub);
            requestHeaders.set("x-user-username", payload.username);

            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            });

        } catch (error) {
            if (pathname.startsWith("/api/")) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard",
        "/dashboard/:path*",
        "/api/links",
        "/api/links/:path*",
        "/api/upload",
        "/api/auth/profile",
        "/api/admin/:path*",
        "/login",
        "/register"
    ],
};
