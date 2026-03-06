
"use client";

import { useAppStore } from "@/store/useStore";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { AdminDashboard } from "@/components/AdminDashboard";
import { TechnicianDashboard } from "@/components/TechnicianDashboard";
import { ServerSectorView } from "@/components/ServerSectorView";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Check, MapPin } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { HistoryList } from "@/components/HistoryList";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getDashboardData } from "@/app/actions/dashboard-data";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UserCog } from "lucide-react";

export default function DashboardPage() {
    const { currentUserRole, currentUserEmail, setCurrentUser, setData, tickets, sectors, assets, currentUserName, currentSectorId } = useAppStore();
    const { status, data: session } = useSession();
    const [isStoreReady, setIsStoreReady] = useState(false);

    const currentSector = sectors.find(s => s.id === currentSectorId);

    // Wait for store to be hydrated effectively
    useEffect(() => {
        if (status === 'authenticated' && currentUserRole) {
            // Fetch real data from DB
            getDashboardData().then(data => {
                if (data.success) {
                    // @ts-ignore - Ignore exact type mismatch for rapid prototyping
                    setData(data);

                    // LINK SERVER TO SECTOR
                    if (currentUserRole === 'server' && currentUserEmail) {
                        const mySector = (data.sectors || []).find((s: any) =>
                            s.responsible?.email === currentUserEmail
                        );
                        if (mySector) {
                            // Force update currentUser with sectorId
                            setCurrentUser({
                                id: session?.user?.id || 'unknown',
                                name: session?.user?.name || 'Unknown',
                                email: session?.user?.email || 'unknown',
                                role: currentUserRole,
                                sectorId: mySector.id
                            });
                        }
                    }
                } else {
                    console.log("Database connection failed. Falling back to mock data.");
                }

                setIsStoreReady(true);
            });
        }
    }, [status, currentUserRole, currentUserEmail, setData, session, setCurrentUser]);

    if (status === "loading" || (!isStoreReady && status === 'authenticated')) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 gap-4">
                <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                <p className="text-neutral-500 font-medium">Carregando sistema VOS...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-50 text-neutral-900 animate-in fade-in overflow-x-hidden">
            {/* Premium Header */}
            <header className="bg-white border-b sticky top-0 z-20 shadow-sm">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                                V
                            </div>
                            <div>
                                <span className="font-bold text-xl tracking-tight block leading-none">VOS</span>
                                <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-medium">IFAM CMC</span>
                            </div>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Sheet>
                            <SheetTrigger asChild>
                                <div className="text-right hidden md:block cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors group">
                                    <p className="text-sm font-bold group-hover:text-emerald-700 transition-colors flex items-center justify-end gap-2">
                                        {currentUserName}
                                        <UserCog className="w-3 h-3 text-slate-400 group-hover:text-emerald-500" />
                                    </p>
                                    <div className="flex items-center justify-end gap-1">
                                        <span className={`w-2 h-2 rounded-full ${currentUserRole === 'admin' ? 'bg-purple-500' : currentUserRole === 'server' ? 'bg-blue-500' : 'bg-orange-500'}`}></span>
                                        <p className="text-xs text-muted-foreground capitalize">
                                            {currentUserRole === 'admin' ? 'Administrador' : currentUserRole === 'server' ? 'Servidor / Fiscal' : 'Técnico'}
                                        </p>
                                    </div>
                                </div>
                            </SheetTrigger>
                            {/* Only show profile content for Server role for now, or adapt for others */}
                            {currentUserRole === 'server' && (
                                <SheetContent>
                                    <SheetHeader>
                                        <SheetTitle>Meus Dados (Fiscal)</SheetTitle>
                                        <SheetDescription>
                                            Informações de cadastro e designação.
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="space-y-4 py-6">
                                        <div className="p-3 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700 mb-4">
                                            Estes dados são gerenciados pela administração. Para alterações, entre em contato.
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Status do Acesso</Label>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${currentSector?.responsible?.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                <span className={`font-bold ${currentSector?.responsible?.isActive ? 'text-emerald-700' : 'text-red-700'}`}>
                                                    {currentSector?.responsible?.isActive ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Nome Completo</Label>
                                            <Input
                                                value={currentSector?.responsible?.name || ''}
                                                readOnly
                                                className="bg-slate-50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>SIAPE / Matrícula</Label>
                                            <Input
                                                value={currentSector?.responsible?.siape || ''}
                                                readOnly
                                                className="bg-slate-50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email Institucional</Label>
                                            <Input
                                                value={currentSector?.responsible?.email || ''}
                                                readOnly
                                                className="bg-slate-50"
                                            />
                                        </div>
                                        <div className="bg-emerald-50/50 p-4 rounded-lg space-y-4 border border-emerald-100 opacity-80">
                                            <h4 className="font-bold text-sm text-emerald-800">Designação Oficial</h4>
                                            <div className="space-y-2">
                                                <Label>Nº da Portaria</Label>
                                                <Input
                                                    value={currentSector?.responsible?.ordinanceNumber || ''}
                                                    readOnly
                                                    className="bg-slate-50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Data da Designação</Label>
                                                <Input
                                                    type="date"
                                                    value={currentSector?.responsible?.designationDate || ''}
                                                    readOnly
                                                    className="bg-slate-50"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <SheetFooter>
                                        <SheetClose asChild>
                                            <Button className="w-full">Fechar</Button>
                                        </SheetClose>
                                    </SheetFooter>
                                </SheetContent>
                            )}
                            {/* Fallback for other roles or general info */}
                            {currentUserRole !== 'server' && (
                                <SheetContent>
                                    <SheetHeader>
                                        <SheetTitle>Perfil do Usuário</SheetTitle>
                                    </SheetHeader>
                                    <div className="py-6 space-y-4">
                                        <div className="space-y-2">
                                            <Label>Nome</Label>
                                            <Input value={currentUserName || ''} readOnly className="bg-slate-50" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input value={currentUserEmail || ''} readOnly className="bg-slate-50" />
                                        </div>
                                    </div>
                                </SheetContent>
                            )}
                        </Sheet>

                        <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                            Sair
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content Area - Fluid on mobile, fixed on desktop */}
            <div className="w-full md:container md:mx-auto px-4 py-8 md:max-w-5xl overflow-hidden">

                {/* ADMIN VIEW */}
                {currentUserRole === 'admin' && (
                    <AdminDashboard />
                )}

                {/* SERVER VIEW (Sector Responsible) */}
                {currentUserRole === 'server' && (
                    <ServerSectorView />
                )}

                {/* TECHNICIAN VIEW */}
                {currentUserRole === 'technician' && (
                    <TechnicianDashboard />
                )}
            </div>
        </main>
    );
}
