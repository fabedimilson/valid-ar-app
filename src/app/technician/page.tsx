
"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useStore";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TechnicianProfile, Ticket } from "@/types";
import {
    User, ShieldCheck, Briefcase, Wrench, Clock, CheckCircle2,
    AlertCircle, Search, Calendar, ChevronRight, LogOut, ArrowRight
} from "lucide-react";
import { toast } from "sonner";

export default function TechnicianDashboard() {
    const { companies, tickets: storeTickets } = useAppStore();
    const [selectedTech, setSelectedTech] = useState<(TechnicianProfile & { companyName: string }) | null>(null);

    // Estado local para simular tickets e atribuições (UX Demo)
    const [localTickets, setLocalTickets] = useState<Ticket[]>([]);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedTicketToAssign, setSelectedTicketToAssign] = useState<Ticket | null>(null);
    const [techToAssign, setTechToAssign] = useState<string>("");

    // Carregar tickets ou gerar mocks se vazio
    useEffect(() => {
        if (storeTickets.length > 0) {
            setLocalTickets(storeTickets);
        } else {
            // Mocks para demonstração visual rica
            const now = Date.now();
            setLocalTickets([
                { id: 't1', code: 2024001, description: 'Ar Condicionado Pingando - Sala 101', status: 'open', assetId: 'a1', sectorId: 's1', openedAt: now - 3600000, requesterName: 'Ana Souza', updatedAt: now },
                { id: 't2', code: 2024002, description: 'Limpeza Preventiva - Auditório', status: 'in_progress', technicianId: 'tech_nadson', assetId: 'a2', sectorId: 's2', openedAt: now - 86400000, requesterName: 'João Silva', updatedAt: now },
                { id: 't3', code: 2024003, description: 'Falha no Compressor - Sala de TI', status: 'open', assetId: 'a3', sectorId: 's3', openedAt: now - 7200000, requesterName: 'Gestor TI', updatedAt: now },
                { id: 't4', code: 2024004, description: 'Troca de Filtro - Recepção', status: 'done', technicianId: 'tech_carlos', assetId: 'a4', sectorId: 's4', openedAt: now - 172800000, requesterName: 'Maria', updatedAt: now }
            ] as any[]);
        }
    }, [storeTickets]);

    // Flatten technicians list
    const allTechnicians = companies.flatMap(c =>
        c.technicians.map(t => ({ ...t, companyName: c.name }))
    );

    // Técnicos da mesma empresa (para atribuição)
    const colleagues = selectedTech
        ? allTechnicians.filter(t => t.companyName === selectedTech.companyName)
        : [];

    const handleAssign = () => {
        if (!selectedTicketToAssign || !techToAssign) return;

        // Simular atualização
        setLocalTickets(prev => prev.map(t =>
            t.id === selectedTicketToAssign.id ? { ...t, technicianId: techToAssign, status: 'in_progress' } : t
        ));

        toast.success(`OS #${selectedTicketToAssign.code} atribuída com sucesso!`);
        setAssignDialogOpen(false);
        setTechToAssign("");
        setSelectedTicketToAssign(null);
    };

    // Filtrar tickets por visão
    const myTickets = localTickets.filter(t => t.technicianId === selectedTech?.id);
    const openTickets = localTickets.filter(t => t.status === 'open' && !t.technicianId);

    // Tela de Seleção de Usuário (Login Simulado)
    if (!selectedTech) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <Card className="w-full max-w-4xl shadow-lg border-none bg-white/80 backdrop-blur">
                    <CardHeader className="text-center pb-8 sticky top-0 bg-white z-10 border-b">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                            <Wrench className="w-8 h-8" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-800">Portal do Técnico</CardTitle>
                        <CardDescription>Selecione seu perfil para acessar o painel de operações.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8 max-h-[60vh] overflow-y-auto">
                        {allTechnicians.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {allTechnicians.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setSelectedTech(t)}
                                        className="relative flex flex-col items-start p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-3 mb-3 w-full">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${t.isManager ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'} transition-colors`}>
                                                {t.name.substring(0, 1).toUpperCase()}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="font-bold text-slate-800 truncate">{t.name}</p>
                                                <p className="text-xs text-slate-500 truncate">{t.companyName}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {t.isManager ? (
                                                <Badge className="bg-blue-600 text-white text-[10px] px-2 py-0.5">LÍDER</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-slate-500 text-[10px]">TÉCNICO</Badge>
                                            )}
                                        </div>
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowRight className="w-4 h-4 text-blue-400" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-400 border-2 border-dashed rounded-xl">
                                <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                <p>Nenhum técnico cadastrado no sistema.</p>
                                <p className="text-xs mt-2">Acesse o Painel Admin para cadastrar.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Topbar */}
            <header className="bg-white border-b sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${selectedTech.isManager ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white'}`}>
                            {selectedTech.name.substring(0, 1)}
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-800 text-sm leading-tight">{selectedTech.name}</h1>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{selectedTech.companyName}</p>
                        </div>
                        {selectedTech.isManager && (
                            <Badge variant="secondary" className="ml-2 bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                                <ShieldCheck className="w-3 h-3 mr-1" /> PAINEL DO LÍDER
                            </Badge>
                        )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTech(null)} className="text-slate-500 hover:text-red-600">
                        <LogOut className="w-4 h-4 mr-2" /> Sair
                    </Button>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 space-y-6">

                {/* Métricas Rápidas */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-white border-l-4 border-l-blue-500 shadow-sm">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="bg-blue-50 p-2 rounded-full text-blue-600"><Briefcase className="w-5 h-5" /></div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Minhas OS Ativas</p>
                                <p className="text-2xl font-bold text-slate-800">{myTickets.filter(t => t.status === 'in_progress').length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-l-4 border-l-green-500 shadow-sm">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="bg-green-50 p-2 rounded-full text-green-600"><CheckCircle2 className="w-5 h-5" /></div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Finalizadas Hoje</p>
                                <p className="text-2xl font-bold text-slate-800">{myTickets.filter(t => t.status === 'completed').length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-l-4 border-l-orange-500 shadow-sm">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="bg-orange-50 p-2 rounded-full text-orange-600"><AlertCircle className="w-5 h-5" /></div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Pendentes</p>
                                <p className="text-2xl font-bold text-slate-800">{myTickets.filter(t => t.status === 'open').length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    {selectedTech.isManager && (
                        <Card className="bg-indigo-50 border-l-4 border-l-indigo-500 shadow-sm">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="bg-indigo-100 p-2 rounded-full text-indigo-600"><ShieldCheck className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">OS Sem Técnico</p>
                                    <p className="text-2xl font-bold text-slate-800">{openTickets.length}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Conteúdo Principal */}
                <Tabs defaultValue="mystasks" className="w-full">
                    <TabsList className="bg-white border mb-4">
                        <TabsTrigger value="mystasks" className="data-[state=active]:bg-slate-100">Minhas Tarefas</TabsTrigger>
                        {selectedTech.isManager && (
                            <TabsTrigger value="team" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Gestão de Equipe</TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="mystasks" className="space-y-4">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Wrench className="w-5 h-5 text-blue-500" /> Ordens de Serviço Atribuídas</h2>
                        {myTickets.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {myTickets.map(t => (
                                    <Card key={t.id} className="hover:shadow-md transition-shadow border-l-4 border-l-slate-200">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <Badge variant={t.status === 'completed' ? 'default' : t.status === 'in_progress' ? 'secondary' : 'outline'}>
                                                    {t.status === 'completed' ? 'Finalizada' : t.status === 'in_progress' ? 'Em Progresso' : 'Aguardando'}
                                                </Badge>
                                                <span className="text-xs text-slate-400">#{t.code}</span>
                                            </div>
                                            <CardTitle className="text-sm font-bold mt-2 leadig-tight line-clamp-2" title={t.description}>{t.description || "Manutenção Geral"}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pb-3 text-xs space-y-2 text-slate-600">
                                            <div className="flex items-center gap-2"><User className="w-3 h-3" /> {t.requesterName}</div>
                                            <div className="flex items-center gap-2"><Clock className="w-3 h-3" /> {new Date(t.openedAt).toLocaleDateString()}</div>
                                        </CardContent>
                                        <CardFooter className="pt-0">
                                            <Button className="w-full h-8 text-xs" variant={t.status === 'completed' ? 'outline' : 'default'} disabled={t.status === 'completed'}>
                                                {t.status === 'completed' ? 'Ver Detalhes' : 'Iniciar / Continuar'}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-12 text-center rounded-xl border border-dashed text-slate-400">
                                <p>Você não possui OS atribuídas no momento.</p>
                            </div>
                        )}
                    </TabsContent>

                    {selectedTech.isManager && (
                        <TabsContent value="team" className="space-y-6">

                            {/* Seção de Atribuição */}
                            <Card className="border-blue-100 bg-blue-50/30">
                                <CardHeader>
                                    <CardTitle className="text-base text-blue-900 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" /> Atribuição de Chamados
                                    </CardTitle>
                                    <CardDescription>Distribua as OS abertas para sua equipe técnica.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {openTickets.length > 0 ? (
                                        <div className="space-y-3">
                                            {openTickets.map(t => (
                                                <div key={t.id} className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">Aberto</Badge>
                                                            <span className="font-mono text-xs text-slate-400">#{t.code}</span>
                                                        </div>
                                                        <p className="font-bold text-sm text-slate-800">{t.description}</p>
                                                        <p className="text-xs text-slate-500 mt-1">Solicitante: {t.requesterName} • {new Date(t.openedAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <Button size="sm" className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => { setSelectedTicketToAssign(t); setAssignDialogOpen(true); }}>
                                                        Atribuir Técnico
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-slate-500 italic bg-white rounded border border-dashed">
                                            Nenhuma OS aguardando atribuição.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Dashboard de Equipe (Placeholder) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader><CardTitle className="text-sm">Disponibilidade da Equipe</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {colleagues.map(c => (
                                                <div key={c.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                                                    <span className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-green-500"></div> {c.name}
                                                    </span>
                                                    <span className="text-slate-400 text-xs">Livre</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                        </TabsContent>
                    )}
                </Tabs>
            </main>

            {/* Dialog de Atribuição */}
            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Atribuir OS #{selectedTicketToAssign?.code}</DialogTitle>
                        <DialogDescription>Selecione um técnico disponível para realizar este serviço.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="bg-slate-50 p-3 rounded text-sm border">
                            <span className="font-bold block mb-1">Descrição do Serviço:</span>
                            {selectedTicketToAssign?.description}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Técnico Responsável</label>
                            <Select value={techToAssign} onValueChange={setTechToAssign}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um técnico..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {colleagues.map(c => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name} {c.isManager ? '(Líder)' : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleAssign} disabled={!techToAssign} className="bg-blue-600 hover:bg-blue-700">Confirmar Atribuição</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
