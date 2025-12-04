import { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            role: "student" | "admin"
            id: string
        } & DefaultSession["user"]
    }

    interface User {
        role: "student" | "admin"
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: "student" | "admin"
    }
}
