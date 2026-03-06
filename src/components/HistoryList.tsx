
import { useState } from "react";
import { useAppStore } from "@/store/useStore";
import { Ticket } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, History, Filter, MapPin, Calendar, User, Pencil, FileSpreadsheet, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface HistoryListProps {
    role: 'admin' | 'technician';
}

export function HistoryList({ role }: HistoryListProps) {
    const { tickets, assets, sectors, companies, problemTypes } = useAppStore();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<'all' | 'validated' | 'waiting_validation' | 'in_progress' | 'open'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [problemFilter, setProblemFilter] = useState<string>('all');

    const [showFilters, setShowFilters] = useState(false);

    // Initial Date Range
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    // Derive unique categories from assets
    const uniqueCategories = Array.from(new Set(assets.map(a => a.category).filter(Boolean))) as string[];

    // Filter tickets logic
    const filteredTickets = tickets.filter(t => {
        const asset = assets.find(a => a.id === t.assetId);

        // Text Search
        const fullSearchString = `${t.id} ${t.code || ''} ${asset?.name} ${asset?.patrimonyNumber} ${t.description}`.toLowerCase();
        const matchesSearch = fullSearchString.includes(search.toLowerCase());

        // Status Filter
        const matchesStatus = statusFilter === 'all' ? true : t.status === statusFilter;



        // Category Filter
        const matchesCategory = categoryFilter === 'all' ? true : asset?.category === categoryFilter;

        // Problem Type Filter (Description exact match or just simple includes)
        // Since problemTypes are labels, we check if description includes the label or equals it (depending on how strict we want)
        // Usually the description IS the problem label for generated tickets.
        const matchesProblem = problemFilter === 'all' ? true : t.description === problemFilter;

        // Date Filter
        let matchesDate = true;
        if (startDate) {
            matchesDate = matchesDate && new Date(t.updatedAt) >= new Date(startDate);
        }
        if (endDate) {
            matchesDate = matchesDate && new Date(t.updatedAt) <= new Date(endDate);
        }

        return matchesSearch && matchesStatus && matchesCategory && matchesProblem && matchesDate;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()); // Newest first

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("all");
        setCategoryFilter("all");
        setProblemFilter("all");
        setStartDate("");
        setEndDate("");
    };



    // Simple CSV Export Logic
    const handleExportExcel = () => {
        // Headers for CSV
        const headers = ["ID", "VOS", "Data", "Equipamento", "Patrimonio", "Categoria", "Setor", "Status", "Problema"];
        const rows = filteredTickets.map(t => {
            const asset = assets.find(a => a.id === t.assetId);
            const sector = sectors.find(s => s.id === t.sectorId);
            const vos = t.code ? `VOS-${String(t.code).padStart(6, '0')}` : t.id.slice(0, 6);
            const date = new Date(t.updatedAt).toLocaleDateString();

            // Sanitize description to avoid breaking CSV with newlines or semicolons
            const description = (t.description || "").replace(/;/g, ",").replace(/[\r\n]+/g, " ");

            return [t.id, vos, date, asset?.name || "", asset?.patrimonyNumber || "", asset?.category || "", sector?.name || "", t.status, description];
        });

        const csvContent = [
            headers.join(";"),
            ...rows.map(r => r.join(";"))
        ].join("\n");

        // Add BOM for Excel UTF-8 compatibility
        const BOM = "\uFEFF";
        const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `relatorio_historico_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrintPDF = () => {
        const doc = new jsPDF();

        // Title and Date
        doc.setFontSize(16);
        doc.text("Relatório de Histórico de Serviços", 14, 15);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Gerado em: ${new Date().toLocaleDateString()} às ${new Date().toLocaleTimeString()}`, 14, 22);

        // Table Columns
        const tableColumn = ["OS / VOS", "Data", "Equipamento", "Setor", "Status", "Problema"];

        // Table Rows
        const tableRows = filteredTickets.map(ticket => {
            const asset = assets.find(a => a.id === ticket.assetId);
            const sector = sectors.find(s => s.id === ticket.sectorId);

            const osLabel = ticket.code ? `VOS-${String(ticket.code).padStart(6, '0')}` : ticket.id.slice(0, 6);
            const statusLabel = ticket.status === 'validated' ? 'Validado' :
                ticket.status === 'waiting_validation' ? 'Aguardando' :
                    ticket.status === 'in_progress' ? 'Em Andamento' : 'Aberto';

            return [
                osLabel,
                new Date(ticket.updatedAt).toLocaleDateString(),
                asset?.name || "-",
                sector?.name || "-",
                statusLabel,
                ticket.description || ""
            ];
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 28,
            theme: 'grid',
            headStyles: { fillColor: [40, 167, 69] }, // Emerald Green-ish
            styles: { fontSize: 8, cellPadding: 2 },
            columnStyles: {
                0: { cellWidth: 25 },
                1: { cellWidth: 20 },
                2: { cellWidth: 30 },
                3: { cellWidth: 25 },
                4: { cellWidth: 25 },
                5: { cellWidth: 'auto' }
            }
        });

        doc.save(`relatorio_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    return (
        <div className="space-y-4 print:space-y-0">
            {/* Search & Actions Bar (Hide on Print) */}
            <div className="flex flex-col md:flex-row gap-3 print:hidden">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por OS, Patrimônio ou Descrição..."
                        className="pl-8 bg-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className={showFilters ? "bg-slate-100" : ""}>
                    <Filter className="w-4 h-4 mr-2" /> Filtros
                </Button>
                {(statusFilter !== 'all' || categoryFilter !== 'all' || problemFilter !== 'all' || startDate || endDate) && (
                    <Button variant="ghost" onClick={clearFilters} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        Limpar
                    </Button>
                )}
            </div>

            {/* Expanded Filters */}
            {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 p-4 bg-slate-50 border rounded-lg animate-in slide-in-from-top-2 print:hidden">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Status</label>
                        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                            <SelectTrigger className="bg-white h-9">
                                <SelectValue placeholder="Todos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="validated">Validado</SelectItem>
                                <SelectItem value="waiting_validation">Aguardando Validação</SelectItem>
                                <SelectItem value="in_progress">Em Andamento</SelectItem>
                                <SelectItem value="open">Aberto</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>



                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Categoria</label>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="bg-white h-9">
                                <SelectValue placeholder="Todas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                {uniqueCategories.map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Tipo de Defeito</label>
                        <Select value={problemFilter} onValueChange={setProblemFilter}>
                            <SelectTrigger className="bg-white h-9">
                                <SelectValue placeholder="Todos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                {problemTypes.map(p => (
                                    <SelectItem key={p.id} value={p.label}>{p.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Período</label>
                        <div className="flex gap-2">
                            <Input type="date" className="h-9 bg-white text-xs px-1" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            <Input type="date" className="h-9 bg-white text-xs px-1" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                    </div>
                </div>
            )}

            {/* Results List */}
            <ScrollArea className="h-[500px] border rounded-md bg-white p-0 print:h-auto print:border-0 print:overflow-visible">
                {filteredTickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-slate-400 bg-slate-50/50 h-full">
                        <History className="w-16 h-16 mb-4 opacity-10" />
                        <p className="font-medium text-lg text-slate-500">Nenhum registro encontrado</p>
                        <p className="text-sm">Tente ajustar os filtros ou sua busca.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredTickets.map(ticket => {
                            const asset = assets.find(a => a.id === ticket.assetId);
                            const sector = sectors.find(s => s.id === ticket.sectorId);
                            const company = companies.find(c => c.id === ticket.companyId);

                            return (
                                <Dialog key={ticket.id}>
                                    <DialogTrigger asChild>
                                        <div className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group flex flex-col md:flex-row gap-4 items-start md:items-center print:break-inside-avoid print:border-b print:py-2">
                                            {/* Left Icon/Status */}
                                            <div className="flex-shrink-0 print:hidden">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ticket.status === 'validated' ? 'bg-emerald-100 text-emerald-600' :
                                                    'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {ticket.status === 'validated' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                                </div>
                                            </div>

                                            {/* Main Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border">
                                                        {ticket.code ? `VOS-${String(ticket.code).padStart(6, '0')}` : `#${ticket.id.slice(0, 6)}`}
                                                    </span>
                                                    <span className="text-xs text-slate-400">•</span>
                                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(ticket.updatedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-blue-700 transition-colors">
                                                    {asset?.name} <span className="text-slate-400 font-normal">({asset?.patrimonyNumber})</span>
                                                </h4>
                                                <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {sector?.name}</span>
                                                    {asset?.category && <span className="flex items-center gap-1 border-l pl-2 ml-2 border-slate-300 text-slate-400">{asset.category}</span>}
                                                </div>
                                            </div>

                                            {/* Right Action/Status Badge */}
                                            <div className="flex-shrink-0 text-right">
                                                <Badge className={`mb-1 ${ticket.status === 'validated' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' :
                                                    'bg-amber-100 text-amber-700 hover:bg-amber-100'
                                                    }`}>
                                                    {ticket.status === 'validated' ? 'Validado' :
                                                        ticket.status === 'waiting_validation' ? 'Aguardando' : ticket.status}
                                                </Badge>
                                                <div className="text-[10px] text-slate-400 font-medium mt-1 print:hidden">
                                                    {ticket.items.length} serviço(s)
                                                </div>
                                                <div className="text-[10px] text-slate-500 mt-1 hidden print:block">
                                                    {ticket.description}
                                                </div>
                                            </div>
                                        </div>
                                    </DialogTrigger>

                                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto print:hidden">
                                        <AdminEditView
                                            ticket={ticket}
                                            asset={asset}
                                            sector={sector}
                                            company={company}
                                            role={role}
                                            onSave={(id: string, updates: any) => useAppStore.getState().updateTicket(id, updates)}
                                        />
                                    </DialogContent>
                                </Dialog>
                            );
                        })}
                    </div>
                )}
            </ScrollArea>

            {/* Statistics Summary - Footer */}
            {filteredTickets.length > 0 && (
                <div className="border-t pt-6 mt-2">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                            <Card className="bg-white border-l-4 border-l-blue-500 shadow-sm h-full">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase">Total Selecionado</p>
                                        <p className="text-2xl font-bold text-slate-800">{filteredTickets.length}</p>
                                    </div>
                                    <History className="w-8 h-8 text-blue-100" />
                                </CardContent>
                            </Card>

                            <Card className="col-span-1 md:col-span-3 bg-white shadow-sm border-l-4 border-l-amber-500 h-full">
                                <CardHeader className="py-2 px-4 pb-0">
                                    <CardTitle className="text-xs font-semibold text-slate-500 uppercase">Top Defeitos (Seleção Atual)</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-2">
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(
                                            filteredTickets.reduce((acc: Record<string, number>, ticket) => {
                                                const desc = ticket.description || "Não especificado";
                                                acc[desc] = (acc[desc] || 0) + 1;
                                                return acc;
                                            }, {} as Record<string, number>)
                                        )
                                            .sort(([, a], [, b]) => b - a)
                                            .slice(0, 5) // Top 5
                                            .map(([desc, count]) => (
                                                <Badge key={desc} variant="secondary" className="text-xs px-2 py-1 bg-amber-50 text-amber-900 border-amber-100 hover:bg-amber-100">
                                                    {desc}: <span className="font-bold ml-1">{count}</span>
                                                </Badge>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 print:hidden">
                        <Button variant="outline" size="sm" onClick={handlePrintPDF}>
                            <FileText className="w-4 h-4 mr-2" />
                            Gerar PDF / Imprimir
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportExcel} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                            Exportar Excel (CSV)
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper icons
function CheckCircle({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>;
}
function Clock({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}

// Sub-component for editing logic to keep main component clean
function AdminEditView({ ticket, asset, sector, company, role, onSave }: any) {
    const [isEditing, setIsEditing] = useState(false);
    const { companies } = useAppStore();

    // Form State
    const [desc, setDesc] = useState(ticket.description);
    const [status, setStatus] = useState(ticket.status);
    const [compId, setCompId] = useState(ticket.companyId || "");

    const handleSave = () => {
        onSave(ticket.id, {
            description: desc,
            status: status,
            companyId: compId
        });
        setIsEditing(false);
        // toast.success("OS Atualizada!");
    };

    if (isEditing) {
        return (
            <div className="space-y-4">
                <DialogHeader>
                    <DialogTitle>Editar OS #{ticket.code ? `VOS ${String(ticket.code).padStart(6, '0')}` : ticket.id}</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-neutral-500">Descrição do Problema</label>
                        <textarea
                            className="w-full border rounded p-2 text-sm"
                            rows={3}
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-neutral-500">Status</label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="open">Aberto</SelectItem>
                                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                                    <SelectItem value="waiting_validation">Aguardando Validação</SelectItem>
                                    <SelectItem value="validated">Validado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-neutral-500">Empresa / Técnico</label>
                            <Select value={compId} onValueChange={setCompId}>
                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>
                                    {companies.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
                    <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white">Salvar Alterações</Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle className="flex justify-between items-center pr-8">
                    <span>Detalhes da OS #{ticket.code ? `VOS ${String(ticket.code).padStart(6, '0')}` : ticket.id.slice(0, 8)}</span>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">{new Date(ticket.updatedAt).toLocaleDateString()}</Badge>
                        {role === 'admin' && (
                            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="h-7 text-xs">
                                <Pencil className="w-3 h-3 mr-1" /> Editar
                            </Button>
                        )}
                    </div>
                </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
                {/* Header Info */}
                <div className="bg-neutral-50 p-4 rounded-lg border grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="block text-xs text-neutral-500 uppercase font-bold">Equipamento</span>
                        <span className="font-medium">{asset?.name}</span>
                        <div className="text-xs text-neutral-400">{asset?.patrimonyNumber}</div>
                    </div>
                    <div>
                        <span className="block text-xs text-neutral-500 uppercase font-bold">Setor</span>
                        <span className="font-medium">{sector?.name}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-neutral-500 uppercase font-bold">Empresa Responsável</span>
                        <span className="font-medium">{company?.name || "—"}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-neutral-500 uppercase font-bold">Status Atual</span>
                        <Badge variant="secondary">{ticket.status}</Badge>
                    </div>
                    <div className="col-span-2">
                        <span className="block text-xs text-neutral-500 uppercase font-bold">Problema Relatado</span>
                        <p className="italic text-neutral-700 mt-1">"{ticket.description}"</p>
                    </div>
                </div>

                {/* Service Items */}
                <div>
                    <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-emerald-600" />
                        Serviços Realizados ({ticket.items.length})
                    </h4>
                    <div className="space-y-3">
                        {ticket.items.length === 0 ? (
                            <p className="text-sm text-neutral-400 italic">Nenhum serviço registrado.</p>
                        ) : (
                            ticket.items.map((item: any, idx: number) => (
                                <div key={idx} className="border rounded-lg p-3 text-sm">
                                    <div className="flex justify-between mb-1">
                                        <span className="font-bold">{item.title}</span>
                                        <Badge variant="secondary" className="text-[10px]">{item.category}</Badge>
                                    </div>
                                    {item.description && <p className="text-neutral-600 text-xs mb-2">{item.description}</p>}

                                    {/* Photos Preview */}
                                    {item.technicianPhotos.length > 0 && (
                                        <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                                            {item.technicianPhotos.map((photo: any) => (
                                                <div key={photo.id} className="relative w-16 h-16 flex-shrink-0 rounded border overflow-hidden bg-neutral-100">
                                                    <img src={photo.url} alt="Evidence" className="w-full h-full object-cover" />
                                                    <div className={`absolute bottom-0 w-full text-[8px] text-center text-white ${photo.type === 'before' ? 'bg-red-500/80' : 'bg-green-500/80'}`}>
                                                        {photo.type === 'before' ? 'ANTES' : 'DEPOIS'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

// Icon helper
function Wrench({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
    );
}
