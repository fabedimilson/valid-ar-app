
import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    providers: [],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.sectorId = (user as any).sectorId;
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).sectorId = token.sectorId;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    }
} satisfies NextAuthConfig
