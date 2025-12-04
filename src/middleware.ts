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

        return Response.redirect(new URL(`/api/auth/signin?callbackUrl=${encodedCallbackUrl}`, req.nextUrl));
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
