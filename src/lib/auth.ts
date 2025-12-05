import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from '@/db'; // Drizzle DB Client
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { compare } from 'bcrypt'; // Must run in Node.js Runtime
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adapter: DrizzleAdapter(db) as any,
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_CLIENT_ID,
            clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                    role: "student", // Default role
                };
            },
        }),
        Resend({
            apiKey: process.env.RESEND_API_KEY,
            from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        }),
        Credentials({
            credentials: { email: {}, password: {} },
            authorize: async (credentials) => {
                // 1. Query user from DB
                const userArray = await db.select().from(users).where(eq(users.email, credentials.email as string));
                const user = userArray[0];

                if (!user || !user.hashedPassword) return null;

                // 2. Password hash comparison (Server-side)
                const isValid = await compare(credentials.password as string, user.hashedPassword);

                if (isValid) {
                    // Check if email is verified
                    if (!user.emailVerified) {
                        return null; // Or throw Error('Email not verified');
                    }

                    // Return user object, Auth.js will create session based on this
                    return { id: user.id, email: user.email, role: user.role };
                }
                return null; // Validation failed
            },
        }),

    ],
    callbacks: {
        async signIn({ user }) {
            if (user.id) {
                await db.update(users)
                    .set({ lastLoginAt: new Date() })
                    .where(eq(users.id, user.id));
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
            }
            if (session.user && token.role) {
                session.user.role = token.role as "student" | "admin";
            }
            return session;
        }
    },
});
