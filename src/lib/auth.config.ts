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
    },
} satisfies NextAuthConfig;
