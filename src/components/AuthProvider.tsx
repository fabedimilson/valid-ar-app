
'use client';

import { useAppStore } from "@/store/useStore";
import { useEffect } from "react";
// We need to fetch the session client side or pass it as prop.
// Since we don't have SessionProvider in layout yet, let's just use a server action or fetch to get session?
// Or better: In the RootLayout (Server Component), we fetch auth(), then pass it to this component.

import { SessionProvider } from "next-auth/react";

interface AuthProviderProps {
    session: any; // Using any for simplicity in bootstrap
    children: React.ReactNode;
}

export function AuthProvider({ session, children }: AuthProviderProps) {
    const { setCurrentUser } = useAppStore();

    useEffect(() => {
        if (session?.user) {
            setCurrentUser({
                id: session.user.id || 'unknown',
                name: session.user.name || 'Unknown',
                email: session.user.email || 'unknown',
                role: session.user.role || 'server', // default safe
                sectorId: session.user.sectorId
            });
        }
    }, [session, setCurrentUser]);

    return (
        <SessionProvider session={session}>
            {children}
        </SessionProvider>
    );
}
