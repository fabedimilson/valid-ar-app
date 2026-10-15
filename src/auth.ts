
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const email = credentials?.email as string;
                const password = credentials?.password as string;

                if (!email || !password) return null;

                try {
                    // Busca usuário pelo e-mail com relações necessárias
                    const user = await prisma.user.findUnique({
                        where: { email },
                        include: {
                            responsibleForSectors: { select: { id: true } },
                            technicianProfile: { select: { isManager: true, companyId: true } }
                        }
                    });

                    if (!user || !user.active) {
                        return null;
                    }

                    // Valida senha criptografada
                    if (!user.passwordHash) {
                        return null;
                    }

                    const isValid = await bcrypt.compare(password, user.passwordHash);

                    if (isValid) {
                        const sectorId = user.responsibleForSectors && user.responsibleForSectors.length > 0 
                            ? user.responsibleForSectors[0].id 
                            : undefined;

                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role.toLowerCase(),
                            sectorId,
                            isManager: user.technicianProfile?.isManager || false,
                            companyId: user.technicianProfile?.companyId || undefined
                        };
                    }
                } catch (error) {
                    console.error("Erro no login:", error);
                }

                return null;
            },
        }),
    ],
})
