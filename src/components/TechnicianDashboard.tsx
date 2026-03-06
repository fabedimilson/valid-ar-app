
"use client";

import { useAppStore } from "@/store/useStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HistoryList } from "@/components/HistoryList";
import { TechnicianPreventiveAgenda } from "@/components/TechnicianPreventiveAgenda";
import { SchedulingPanel } from "@/components/SchedulingPanel";
import { PaymentReportManager } from "@/components/PaymentReportManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket } from "@/types";
import {
    Clock,
    Check,
    MapPin,
    ArrowRight,
    Calendar,
    Wrench,
    LayoutDashboard,
    DollarSign,
    LayoutGrid,
    AlertTriangle,
    ShieldCheck,
    Zap,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ─── Ticket Card Component ────────────────────────────────────────────────────

function TicketCard({ ticket }: { ticket: Ticket }) {
    const { assets, sectors } = useAppStore();

    const asset = assets.find(a => a.id === ticket.assetId);
    const sector = sectors.find(s => s.id === ticket.sectorId);
    const isInProgress = ticket.status === 'in_progress';
    const isPreventive = ticket.type === 'preventive';
    const isScheduled = ticket.status === 'scheduled';

    const now = Date.now();
    const hoursSinceCreated = Math.floor((now - ticket.openedAt) / (1000 * 60 * 60));
    const isUrgent = !isPreventive && hoursSinceCreated > 24;

    const borderColor = isInProgress
        ? 'border-l-blue-500'
        : isPreventive
            ? 'border-l-teal-500'
            : isUrgent
                ? 'border-l-red-500'
                : 'border-l-orange-400';

    const bgColor = isInProgress
        ? 'from-blue-50/50 to-white hover:from-blue-50'
        : isPreventive
            ? 'from-teal-50/30 to-white hover:from-teal-50'
            : isUrgent
                ? 'from-red-50/30 to-white hover:from-red-50'
                : 'from-orange-50/30 to-white hover:from-orange-50';

    const statusLabel = isInProgress ? 'EM ATENDIMENTO'
        : isPreventive && isScheduled ? 'PREVENTIVA AGENDADA'
            : isPreventive ? 'PREVENTIVA'
                : isUrgent ? 'URGENTE'
                    : 'NOVO';

    const statusColor = isInProgress ? 'bg-blue-500 text-white'
        : isPreventive ? 'bg-teal-600 text-white'
            : isUrgent ? 'bg-red-500 text-white animate-pulse'
                : 'bg-orange-500 text-white';

    return (
        <Card className={`group hover:shadow-lg transition-all duration-300 border-l-4 ${borderColor} bg-gradient-to-r ${bgColor}`}>
            <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            {/* Badges row */}
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                    {statusLabel}
                                </span>

                                <span className="font-mono text-xs font-bold text-neutral-400 bg-neutral-100 px-2 py-1 rounded border">
                                    VOS-{ticket.code ? String(ticket.code).padStart(6, '0') : ticket.id.slice(0, 6)}
                                </span>

                                {isUrgent && !isPreventive && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                                        <AlertTriangle className="w-3 h-3" /> {hoursSinceCreated}h aberto
                                    </span>
                                )}
                            </div>

                            {/* Asset name */}
                            <h3 className="font-bold text-lg text-neutral-800 mb-1 group-hover:text-neutral-900 transition-colors truncate">
                                {asset?.name || 'Equipamento não identificado'}
                            </h3>

                            {/* Location & Patrimony */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500 mb-2">
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {sector?.name || 'Setor não definido'}
                                </span>
                                <span className="hidden sm:inline text-neutral-200">•</span>
                                <span className="font-mono text-xs">
                                    {asset?.patrimonyNumber || 'N/A'}
                                </span>
                            </div>

                            {/* Description */}
                            <div className={`p-2.5 rounded-lg text-sm italic border-l-2 ${isInProgress
                                ? 'bg-blue-50/50 border-blue-300 text-blue-900'
                                : isPreventive
                                    ? 'bg-teal-50/50 border-teal-300 text-teal-900'
                                    : 'bg-neutral-50 border-neutral-300 text-neutral-600'
                                }`}>
                                "{ticket.description || 'Sem descrição'}"
                            </div>

                            {/* Scheduled date for preventive */}
                            {isPreventive && ticket.scheduledAt && (
                                <div className="mt-2 flex items-center gap-1.5 text-xs text-teal-700 font-medium bg-teal-50 border border-teal-100 px-2.5 py-1.5 rounded-lg w-fit">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Data prevista: <strong>{format(new Date(ticket.scheduledAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</strong>
                                </div>
                            )}
                        </div>

                        {/* Action Button - Desktop */}
                        <Link href={`/technician/${ticket.id}`} className="hidden sm:block">
                            <Button
                                size="lg"
                                className={`${isInProgress
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : isPreventive
                                        ? 'bg-teal-600 hover:bg-teal-700'
                                        : 'bg-emerald-600 hover:bg-emerald-700'
                                    } text-white shadow-lg transition-all group-hover:scale-105`}
                            >
                                {isInProgress ? 'Continuar' : 'Atender'}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    </div>

                    {/* Action Button - Mobile */}
                    <Link href={`/technician/${ticket.id}`} className="sm:hidden">
                        <Button
                            size="lg"
                            className={`w-full ${isInProgress ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white shadow-lg`}
                        >
                            {isInProgress ? 'Continuar Atendimento' : 'Iniciar Atendimento'}
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function TechnicianDashboard() {
    const { tickets, companies, currentUserEmail } = useAppStore();

    const technicianProfile = companies
        .flatMap(c => c.technicians)
        .find(t => t.email === currentUserEmail);

    const isLeader = technicianProfile?.isManager || false;

    // Active tickets split by type
    const activeStatuses = ['open', 'in_progress', 'authorized', 'scheduled'];
    const correctiveTickets = tickets.filter(t => activeStatuses.includes(t.status) && t.type !== 'preventive');
    const preventiveTickets = tickets.filter(t => activeStatuses.includes(t.status) && t.type === 'preventive');

    // Stats
    const statsOpen = tickets.filter(t => t.status === 'open').length;
    const statsInProgress = tickets.filter(t => t.status === 'in_progress').length;
    const statsWaiting = tickets.filter(t => t.status === 'waiting_validation').length;
    const statsDone = tickets.filter(t => t.status === 'validated' || t.status === 'completed').length;

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Wrench className="w-6 h-6 text-orange-600 shrink-0" />
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800">
                        Painel do Técnico {isLeader && <Badge className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">Líder</Badge>}
                    </h2>
                </div>
            </div>

            <Tabs defaultValue="tasks" className="space-y-6">
                <TabsList className="bg-slate-100/80 p-1 rounded-xl w-full md:w-auto overflow-x-auto justify-start inline-flex whitespace-nowrap hide-scrollbar">
                    <TabsTrigger value="tasks" className="rounded-lg px-4 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <LayoutDashboard className="w-4 h-4" /> Meus Chamados
                    </TabsTrigger>
                    {isLeader && (
                        <TabsTrigger value="preventive-schedule" className="rounded-lg px-4 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Calendar className="w-4 h-4" /> Cronograma Preventivo
                        </TabsTrigger>
                    )}
                    {isLeader && (
                        <TabsTrigger value="agenda" className="rounded-lg px-4 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <LayoutGrid className="w-4 h-4" /> Agenda (Kanban)
                        </TabsTrigger>
                    )}
                    {isLeader && (
                        <TabsTrigger value="financial" className="rounded-lg px-4 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <DollarSign className="w-4 h-4" /> Financeiro
                        </TabsTrigger>
                    )}
                </TabsList>

                {/* ── Meus Chamados (with sub-tabs) ── */}
                <TabsContent value="tasks" className="space-y-6 border-0 p-0 m-0">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-100 shadow-sm">
                            <CardContent className="p-4">
                                <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">Novos</p>
                                <p className="text-3xl font-bold text-orange-700">{statsOpen}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-sm">
                            <CardContent className="p-4">
                                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Em Andamento</p>
                                <p className="text-3xl font-bold text-blue-700">{statsInProgress}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100 shadow-sm">
                            <CardContent className="p-4">
                                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Aguardando</p>
                                <p className="text-3xl font-bold text-amber-700">{statsWaiting}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100 shadow-sm">
                            <CardContent className="p-4">
                                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Concluídos</p>
                                <p className="text-3xl font-bold text-emerald-700">{statsDone}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sub-tabs: Corretivos / Preventivos */}
                    <Tabs defaultValue="corrective" className="space-y-4">
                        <TabsList className="bg-white border border-slate-200 p-1 rounded-lg w-full sm:w-auto inline-flex">
                            <TabsTrigger
                                value="corrective"
                                className="flex-1 sm:flex-none rounded-md px-4 py-2 gap-2 text-sm font-medium data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow transition-all"
                            >
                                <Zap className="w-4 h-4" />
                                Corretivos
                                {correctiveTickets.length > 0 && (
                                    <Badge className="ml-1 bg-orange-100 text-orange-700 data-[state=active]:bg-white/20 data-[state=active]:text-white h-5 px-1.5 text-[10px]">
                                        {correctiveTickets.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger
                                value="preventive"
                                className="flex-1 sm:flex-none rounded-md px-4 py-2 gap-2 text-sm font-medium data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow transition-all"
                            >
                                <ShieldCheck className="w-4 h-4" />
                                Preventivos
                                {preventiveTickets.length > 0 && (
                                    <Badge className="ml-1 bg-teal-100 text-teal-700 h-5 px-1.5 text-[10px]">
                                        {preventiveTickets.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        {/* Corretivos */}
                        <TabsContent value="corrective" className="border-0 p-0 m-0">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-bold text-neutral-700 flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-orange-500" /> Ordens Corretivas Ativas
                                    </h3>
                                    <span className="text-xs font-medium text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full">
                                        {correctiveTickets.length} chamado(s)
                                    </span>
                                </div>

                                {correctiveTickets.length === 0 ? (
                                    <Card className="border-2 border-dashed border-orange-100 bg-orange-50/30">
                                        <CardContent className="p-10 text-center">
                                            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Check className="w-7 h-7 text-orange-300" />
                                            </div>
                                            <p className="text-neutral-500 font-medium mb-1">Nenhum chamado corretivo ativo</p>
                                            <p className="text-sm text-neutral-400">Você está em dia com as corretivas! 🎉</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="space-y-3">
                                        {correctiveTickets.map(ticket => (
                                            <TicketCard key={ticket.id} ticket={ticket} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Preventivos */}
                        <TabsContent value="preventive" className="border-0 p-0 m-0">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-bold text-neutral-700 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-teal-500" /> Ordens Preventivas Ativas
                                    </h3>
                                    <span className="text-xs font-medium text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full">
                                        {preventiveTickets.length} chamado(s)
                                    </span>
                                </div>

                                {/* Info banner */}
                                <div className="bg-teal-50 border border-teal-100 rounded-lg px-4 py-2.5 flex items-start gap-2 text-xs text-teal-700">
                                    <Calendar className="w-4 h-4 shrink-0 mt-0.5" />
                                    <p>As OS preventivas são geradas pelo técnico líder no <strong>Cronograma Preventivo</strong>. A data prevista fica visível para fiscais e equipe.</p>
                                </div>

                                {preventiveTickets.length === 0 ? (
                                    <Card className="border-2 border-dashed border-teal-100 bg-teal-50/30">
                                        <CardContent className="p-10 text-center">
                                            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <ShieldCheck className="w-7 h-7 text-teal-300" />
                                            </div>
                                            <p className="text-neutral-500 font-medium mb-1">Nenhuma preventiva em aberto</p>
                                            <p className="text-sm text-neutral-400">Acesse o Cronograma Preventivo para agendar OS.</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="space-y-3">
                                        {preventiveTickets.map(ticket => (
                                            <TicketCard key={ticket.id} ticket={ticket} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* History */}
                    <div className="pt-8 border-t">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-8 w-1 bg-gradient-to-b from-neutral-400 to-neutral-300 rounded-full" />
                            <h3 className="text-xl font-bold text-neutral-700">Histórico Completo</h3>
                        </div>
                        <HistoryList role="technician" />
                    </div>
                </TabsContent>

                {/* ── Cronograma Preventivo ── */}
                {isLeader && (
                    <TabsContent value="preventive-schedule" className="space-y-6 border-0 p-0 m-0">
                        <TechnicianPreventiveAgenda />
                    </TabsContent>
                )}

                {/* ── Agenda Kanban ── */}
                {isLeader && (
                    <TabsContent value="agenda" className="space-y-6 border-0 p-0 m-0">
                        <SchedulingPanel />
                    </TabsContent>
                )}

                {/* ── Financeiro ── */}
                {isLeader && (
                    <TabsContent value="financial" className="border-0 p-0 m-0">
                        <PaymentReportManager isManager={isLeader} />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
