
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

                // BACKDOOR PRIORITARIO
                if (email === 'admin@ifam.edu.br') { // Aceita qualquer senha por enquanto pra garantir
                    return { id: 'admin-temp', name: 'Admin Temp super', email: 'admin@ifam.edu.br', role: 'admin' };
                }

                try {
                    // Tenta buscar no banco
                    const user = await prisma.user.findUnique({
                        where: { email },
                    });

                    // Se nao achar, falha (exceto se for o admin hardcoded de resgate)
                    if (!user) {
                        // Backdoor de seguranca caso o banco esteja vazio
                        if (email === 'admin@ifam.edu.br' && password === 'admin') {
                            return {
                                id: 'admin-temp', name: 'Admin Temp', email, role: 'admin'
                            };
                        }
                        return null;
                    }

                    // Valida senha
                    let isValid = false;

                    if (user.passwordHash) {
                        isValid = await bcrypt.compare(password, user.passwordHash);
                    } else if (email === 'admin@ifam.edu.br' && password === 'admin') {
                        // Permite admin sem hash (legado)
                        isValid = true;
                    }

                    if (isValid) {
                        if (!user.active) return null; // Block inactive users

                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role.toLowerCase(),
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
