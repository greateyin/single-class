import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isProtectedRoute =
        req.nextUrl.pathname.startsWith("/admin") ||
        req.nextUrl.pathname.startsWith("/dashboard") ||
        req.nextUrl.pathname.startsWith("/courses") ||
        req.nextUrl.pathname.startsWith("/lessons") ||
        req.nextUrl.pathname.startsWith("/qa");

    if (isProtectedRoute && !isLoggedIn) {
        let callbackUrl = req.nextUrl.pathname;
        if (req.nextUrl.search) {
            callbackUrl += req.nextUrl.search;
        }

        const encodedCallbackUrl = encodeURIComponent(callbackUrl);

        // Construct absolute URL using the Host header to avoid redirecting to Vercel's internal deployment URL
        // which might trigger Vercel Authentication on Preview deployments.
        const host = req.headers.get("host");
        const protocol = req.headers.get("x-forwarded-proto") || "https";
        const baseUrl = host ? `${protocol}://${host}` : req.nextUrl.origin;

        return Response.redirect(new URL(`/api/auth/signin?callbackUrl=${encodedCallbackUrl}`, baseUrl));
    }
});

export const config = {
    matcher: [
        '/admin/:path*',
        '/dashboard/:path*',
        '/courses/:path*',
        '/lessons/:path*',
        '/qa/:path*',
    ],
};
