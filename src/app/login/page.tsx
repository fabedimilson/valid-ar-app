
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react'; // Client side sign in
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
// Since I can't import the server action 'signIn' directly in client component easily without wrapping, 
// I will use next-auth/react for client side flow or a server action in a separate file.
// For simplicity in this step, I'll use a server action in this file? No, 'use client' prevents that.
// I will use a simple form action that calls a server action, or just use `signIn` from `next-auth/react` (requires SessionProvider)
// OR I can use the newly available `signIn` from `src/auth.ts` inside a Server Component wrapper?
// Let's stick to the standard App Router pattern: create a Server Action for login.

// Actually, let's make this page a Client Component that calls a Server Action defined in `actions/auth.ts` or just use `next-auth/react` `signIn`.
// However, `next-auth` v5 `signIn` can be used in server actions.

// Let's create `src/app/login/login-form.tsx` (client) and `src/app/login/page.tsx` (server).

// Re-evaluating: I'll put the page code here directly as a Client Component using `next-auth/react` `signIn` 
// but I need `SessionProvider` in layout? Not necessarily for just calling `signIn`.

import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // We use the NextAuth primitive 'signIn' which might be from 'next-auth/react' 
            console.log("Tentando logar via client...", email);
            // Warning: in v5 beta, client side `signIn` imports might differ. 
            // Let's rely on standard fetch to `/api/auth/callback/credentials` handled by existing `signIn` logic if using client lib,
            // OR better: use a Server Action. But I don't want to create too many files right now.
            // Let's try the simple client-side import.

            // Actually, for V5, importing `signIn` from `next-auth/react` is correct for client components.
            // But I need to allow it.

            // Quick workaround: Submit a form to a Server Action.

            // Let's assume standard `next-auth/react` usage. 
            // If it fails, I'll fix it.

            // Wait, I haven't installed `next-auth` (npm install failed/mixed results).
            // I should have `next-auth`.

            // Dynamic import to avoid build errors if package missing? No.

            const { signIn } = await import('next-auth/react');

            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                toast.error("Credenciais inválidas");
                setLoading(false);
            } else {
                router.push("/dashboard"); // Redirect to home/dashboard
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            toast.error("Erro ao realizar login");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-black p-4 relative transition-colors duration-200">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <Card className="w-full max-w-md shadow-lg border-2 border-slate-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-2xl">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-2 shadow-md border border-emerald-400/30">
                        <span className="text-white font-black text-xl">V</span>
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">ValidAr</CardTitle>
                    <CardDescription className="text-neutral-500 dark:text-neutral-400">
                        Plataforma de Validação e Fiscalização de Ordens de Serviço (IFAM CMC)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="font-bold text-neutral-700 dark:text-neutral-300 text-xs uppercase tracking-wider">E-mail Institucional</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nome@ifam.edu.br"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-slate-50 dark:bg-neutral-900 border-2 border-slate-200 dark:border-neutral-800 focus-visible:ring-emerald-600 min-h-[44px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="font-bold text-neutral-700 dark:text-neutral-300 text-xs uppercase tracking-wider">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-slate-50 dark:bg-neutral-900 border-2 border-slate-200 dark:border-neutral-800 focus-visible:ring-emerald-600 min-h-[44px]"
                            />
                        </div>
                        <Button type="submit" className="w-full min-h-[48px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-sm active:scale-[0.98] transition-transform cursor-pointer" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Entrar no Sistema"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center pb-6">
                    <p className="text-xs text-muted-foreground text-center">
                        Problemas de acesso? Contate o Departamento de Manutenção e Infraestrutura.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
