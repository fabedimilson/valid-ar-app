
import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    providers: [],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.sectorId = (user as any).sectorId;
                token.isManager = (user as any).isManager;
                token.companyId = (user as any).companyId;
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                session.user.id = (token.id as string) || (token.sub as string);
                (session.user as any).role = token.role;
                (session.user as any).sectorId = token.sectorId;
                (session.user as any).isManager = token.isManager;
                (session.user as any).companyId = token.companyId;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    }
} satisfies NextAuthConfig
