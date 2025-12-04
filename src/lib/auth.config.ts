import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    session: { strategy: "jwt" },
    providers: [], // Initialize with empty providers
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                // Persist role and ID to JWT Token
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            // Expose role and ID to client useSession
            if (session.user) {
                session.user.role = token.role as 'student' | 'admin';
                session.user.id = token.sub as string; // 'sub' is the default subject (ID) in JWT
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`;

            // Allows callback URLs on the same origin
            if (new URL(url).origin === baseUrl) return url;

            // Allow callback URLs that match the configured app URL (e.g. custom domain)
            const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL;
            if (allowedOrigin && url.startsWith(allowedOrigin)) return url;

            return baseUrl;
        },
    },
} satisfies NextAuthConfig;
