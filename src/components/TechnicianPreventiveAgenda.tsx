"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, CheckCircle2, AlertTriangle, Clock, MapPin, Wrench, Pencil, Search, SlidersHorizontal, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { reschedulePreventiveAction } from "@/app/actions/server-actions";

export function TechnicianPreventiveAgenda() {
    const { assets, sectors, companies, currentUserEmail, tickets, schedulePreventive } = useAppStore();
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [scheduleDate, setScheduleDate] = useState<string>("");
    const [selectedTechId, setSelectedTechId] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Edit mode: when true, we're rescheduling an existing OS
    const [editingTicketId, setEditingTicketId] = useState<string | null>(null);

    // ── Filtros ──────────────────────────────────────────────────────────────
    const [search, setSearch] = useState("");
    const [filterBlock, setFilterBlock] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all"); // all | pending | scheduled | inprogress
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    const teamTechnicians = companies.flatMap(c => c.technicians);

    // Unique block list for location filter
    const allBlocks = Array.from(
        new Set(sectors.map(s => s.block || s.name).filter(Boolean))
    ).sort();

    const isOverdue = (date?: string) => {
        if (!date) return false;
        return new Date(date).getTime() < new Date().getTime();
    };

    // Returns the active preventive ticket for an asset (scheduled, open, or in_progress)
    const getActivePreventiveTicket = (assetId: string) => {
        return tickets.find(t =>
            t.assetId === assetId &&
            t.type === 'preventive' &&
            (t.status === 'scheduled' || t.status === 'open' || t.status === 'in_progress')
        ) || null;
    };

    // ── Pipeline de filtragem + ordenação ────────────────────────────────────
    const filteredAssets = assets
        .filter(asset => {
            const sector = sectors.find(s => s.id === asset.sectorId);
            const block = sector?.block || sector?.name || '';
            const activeTicket = getActivePreventiveTicket(asset.id);

            // 1. Busca por nome ou patrimônio
            if (search) {
                const q = search.toLowerCase();
                if (
                    !asset.name.toLowerCase().includes(q) &&
                    !asset.patrimonyNumber.toLowerCase().includes(q)
                ) return false;
            }

            // 2. Filtro por bloco
            if (filterBlock !== 'all' && block !== filterBlock) return false;

            // 3. Filtro por status do ciclo
            if (filterStatus === 'pending') {
                if (activeTicket) return false;
            } else if (filterStatus === 'scheduled') {
                if (!activeTicket || activeTicket.status !== 'scheduled') return false;
            } else if (filterStatus === 'inprogress') {
                if (!activeTicket || activeTicket.status !== 'in_progress') return false;
            }

            return true;
        })
        .sort((a, b) => {
            const tA = getActivePreventiveTicket(a.id);
            const tB = getActivePreventiveTicket(b.id);
            const dA = tA?.scheduledAt ?? (a.nextMaintenance ? new Date(a.nextMaintenance).getTime() : 0);
            const dB = tB?.scheduledAt ?? (b.nextMaintenance ? new Date(b.nextMaintenance).getTime() : 0);
            if (!dA && !dB) return 0;
            if (!dA) return 1;
            if (!dB) return -1;
            return sortDir === 'asc' ? dA - dB : dB - dA;
        });

    const handleOpenScheduleModal = (assetId: string) => {
        setSelectedAssetId(assetId);
        setEditingTicketId(null);

        const asset = assets.find(a => a.id === assetId);
        if (asset && asset.nextMaintenance) {
            setScheduleDate(new Date(asset.nextMaintenance).toISOString().split('T')[0]);
        } else {
            setScheduleDate(new Date().toISOString().split('T')[0]);
        }

        setIsDialogOpen(true);
    };

    const handleOpenEditModal = (assetId: string, ticketId: string, currentScheduledAt?: number) => {
        setSelectedAssetId(assetId);
        setEditingTicketId(ticketId);
        if (currentScheduledAt) {
            setScheduleDate(new Date(currentScheduledAt).toISOString().split('T')[0]);
        } else {
            setScheduleDate(new Date().toISOString().split('T')[0]);
        }
        setIsDialogOpen(true);
    };

    const handleSchedule = async () => {
        if (!selectedAssetId || !scheduleDate) {
            toast.error("Selecione a data programada.");
            return;
        }

        setIsSubmitting(true);
        try {
            const scheduledAt = new Date(scheduleDate).getTime();

            if (editingTicketId) {
                // Reschedule existing OS
                const result = await reschedulePreventiveAction(editingTicketId, scheduledAt);
                if (result.success) {
                    // Update store optimistically for immediate feedback
                    useAppStore.setState(state => ({
                        tickets: state.tickets.map(t =>
                            t.id === editingTicketId ? { ...t, scheduledAt } : t
                        )
                    }));
                    
                    // Refresh all data from server to be sure (async)
                    useAppStore.getState().fetchDashboardData();
                    toast.success("Data da OS atualizada com sucesso!");
                } else {
                    toast.error("Erro ao atualizar data: " + result.error);
                }
            } else {
                // Create new OS
                schedulePreventive(selectedAssetId, scheduledAt, selectedTechId && selectedTechId !== 'unassigned' ? selectedTechId : undefined);
                toast.success("OS Preventiva gerada e salva com sucesso!");
            }

            setIsDialogOpen(false);
            setSelectedAssetId(null);
            setSelectedTechId("");
            setScheduleDate("");
            setEditingTicketId(null);
        } catch (err) {
            toast.error("Erro ao processar agendamento. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Stats
    const totalAssets = assets.length;
    const pendingPreventives = assets.filter(a => a.nextMaintenance && new Date(a.nextMaintenance).getTime() <= new Date().getTime() + 7 * 24 * 60 * 60 * 1000).length;
    const preventiveTickets = tickets.filter(t => t.type === 'preventive' && t.status !== 'completed' && t.status !== 'validated').length;

    const selectedAsset = assets.find(a => a.id === selectedAssetId);

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-800 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Equipamentos Mapeados
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-900">{totalAssets}</div>
                        <p className="text-xs text-emerald-600 mt-1">No contrato ativo</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-800 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Próximas Preventivas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-900">{pendingPreventives}</div>
                        <p className="text-xs text-amber-600 mt-1">Vencendo nos próximos 7 dias</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                            <Wrench className="w-4 h-4" /> OS Preventivas Abertas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-900">{preventiveTickets}</div>
                        <p className="text-xs text-blue-600 mt-1">Aguardando execução pela equipe</p>
                    </CardContent>
                </Card>
            </div>

            {/* Schedule Table */}
            <Card className="border-t-4 border-t-teal-500 shadow-sm">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2 text-teal-800">
                                <CalendarIcon className="w-5 h-5" />
                                Gestão do Cronograma Preventivo
                            </CardTitle>
                            <CardDescription>
                                Agende e atribua serviços contínuos para a equipe técnica. A data prevista será visível para fiscais e técnicos.
                            </CardDescription>
                        </div>
                    </div>

                    {/* ── Barra de Filtros ── */}
                    <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-100 mt-3">
                        {/* Busca */}
                        <div className="relative flex-1 min-w-[200px] max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Buscar equipamento ou patrimônio..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-9 h-9 text-sm border-slate-200"
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Filtro por Localização */}
                        <Select value={filterBlock} onValueChange={setFilterBlock}>
                            <SelectTrigger className="h-9 w-[180px] text-sm border-slate-200">
                                <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                <SelectValue placeholder="Localização" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as localizações</SelectItem>
                                {allBlocks.map(b => (
                                    <SelectItem key={b} value={b}>{b}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Filtro por Status */}
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="h-9 w-[180px] text-sm border-slate-200">
                                <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os status</SelectItem>
                                <SelectItem value="pending">⬜ Aguardando agendamento</SelectItem>
                                <SelectItem value="scheduled">🟢 Agendado</SelectItem>
                                <SelectItem value="inprogress">🔵 Em andamento</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Ordenação por data */}
                        <button
                            onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                            className="h-9 px-3 flex items-center gap-1.5 text-sm font-medium border border-slate-200 rounded-md bg-white hover:bg-slate-50 text-slate-600 transition-colors"
                            title="Alternar ordenação por data"
                        >
                            <CalendarIcon className="w-3.5 h-3.5" />
                            Data {sortDir === 'asc' ? '↑' : '↓'}
                        </button>

                        {/* Contador */}
                        <div className="ml-auto flex items-center text-xs text-slate-500 font-medium">
                            {filteredAssets.length} de {assets.length} equipamentos
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="pl-6">Equipamento</TableHead>
                                    <TableHead>Localização</TableHead>
                                    <TableHead>Ciclo Anterior</TableHead>
                                    <TableHead>Novo Ciclo</TableHead>
                                    <TableHead>Nº OS</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAssets.map((asset) => {
                                    const overdue = isOverdue(asset.nextMaintenance);
                                    const activeTicket = getActivePreventiveTicket(asset.id);
                                    const isScheduled = !!activeTicket;
                                    const sector = sectors.find(s => s.id === asset.sectorId);

                                    // Novo Ciclo: só exibe se houver OS ativa com scheduledAt
                                    const displayDate = activeTicket?.scheduledAt
                                        ? new Date(activeTicket.scheduledAt)
                                        : null;

                                    const osCode = activeTicket?.code
                                        ? `VOS-${String(activeTicket.code).padStart(6, '0')}`
                                        : activeTicket
                                            ? `#${activeTicket.id.slice(0, 8)}`
                                            : null;

                                    return (
                                        <TableRow
                                            key={asset.id}
                                            className={`${overdue && !isScheduled ? "bg-red-50/30" : isScheduled ? "bg-teal-50/50" : ""} transition-colors hover:bg-slate-50`}
                                        >
                                            <TableCell className="pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isScheduled ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'}`}>
                                                        {asset.name.substring(0, 1).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-slate-800">{asset.name}</span>
                                                        <span className="text-xs text-slate-500 font-mono">Patrimônio: {asset.patrimonyNumber}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                    {sector?.block || sector?.name || 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600 font-medium whitespace-nowrap">
                                                {asset.lastMaintenance ? format(new Date(asset.lastMaintenance), "dd/MM/yyyy", { locale: ptBR }) : 'S/ Registro'}
                                            </TableCell>
                                            <TableCell>
                                                {displayDate ? (
                                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                                        <span className="text-sm font-bold text-teal-700">
                                                            {format(displayDate, "dd/MM/yyyy", { locale: ptBR })}
                                                        </span>
                                                        {/* Pencil for all active OS */}
                                                        <button
                                                            onClick={() => handleOpenEditModal(asset.id, activeTicket!.id, activeTicket!.scheduledAt)}
                                                            title="Alterar data"
                                                            className="text-slate-400 hover:text-amber-500 transition-colors"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    // No active OS → show Agendar inline
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleOpenScheduleModal(asset.id)}
                                                        className="bg-slate-900 text-white hover:bg-teal-700 hover:shadow-md transition-all"
                                                    >
                                                        <CalendarIcon className="w-4 h-4 mr-1.5" /> Agendar
                                                    </Button>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {osCode ? (
                                                    <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded border border-teal-200">
                                                        {osCode}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">—</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {filteredAssets.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                                            {assets.length === 0
                                                ? 'Nenhum equipamento cadastrado no sistema.'
                                                : 'Nenhum equipamento encontrado com os filtros aplicados.'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Schedule Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-teal-800">
                            {editingTicketId ? <Pencil className="w-5 h-5" /> : <CalendarIcon className="w-5 h-5" />}
                            {editingTicketId ? "Reagendar OS Preventiva" : "Agendar OS Preventiva"}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedAsset ? (
                                <span>Equipamento: <strong>{selectedAsset.name}</strong> — {selectedAsset.patrimonyNumber}</span>
                            ) : (
                                "Gere uma nova OS de manutenção preventiva para este equipamento."
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-5 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="schedule-date">Data Programada <span className="text-red-500">*</span></Label>
                            <Input
                                id="schedule-date"
                                type="date"
                                value={scheduleDate}
                                onChange={(e) => setScheduleDate(e.target.value)}
                                className="border-slate-300"
                            />
                            <p className="text-xs text-slate-500">Esta data será exibida para o fiscal do setor e para os técnicos visualizarem a OS aberta.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tech-select">Atribuir Técnico (Opcional)</Label>
                            <Select value={selectedTechId} onValueChange={setSelectedTechId}>
                                <SelectTrigger className="border-slate-300">
                                    <SelectValue placeholder="Deixar na fila da equipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">Deixar na fila da equipe</SelectItem>
                                    {teamTechnicians.map(tech => (
                                        <SelectItem key={tech.id} value={tech.id}>
                                            {tech.name} {tech.isManager ? '(Líder)' : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {editingTicketId ? (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 flex gap-2">
                                <Pencil className="w-5 h-5 shrink-0 text-amber-500" />
                                <div>
                                    <p className="font-semibold">Reagendamento de OS:</p>
                                    <ul className="list-disc list-inside text-xs mt-1 space-y-0.5 text-amber-700">
                                        <li>A data prevista da OS será atualizada no banco</li>
                                        <li>Fiscal e técnicos verão a nova data imediatamente</li>
                                        <li>O número da OS permanece o mesmo</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-sm text-teal-800 flex gap-2">
                                <CheckCircle2 className="w-5 h-5 shrink-0 text-teal-500" />
                                <div>
                                    <p className="font-semibold">Ao confirmar:</p>
                                    <ul className="list-disc list-inside text-xs mt-1 space-y-0.5 text-teal-700">
                                        <li>Uma OS preventiva será gerada automaticamente</li>
                                        <li>O número da OS será exibido nesta tabela</li>
                                        <li>A data prevista ficará visível para o fiscal e técnicos</li>
                                        <li>A OS será salva no banco de dados</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSchedule}
                            className={`${editingTicketId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-teal-600 hover:bg-teal-700'} text-white shadow-md`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? (editingTicketId ? "Atualizando..." : "Gerando OS...")
                                : (editingTicketId ? "Confirmar Reagendamento" : "Confirmar Agendamento")
                            }
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
