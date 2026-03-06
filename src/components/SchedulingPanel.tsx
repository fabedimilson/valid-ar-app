"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Calendar,
    LayoutGrid,
    Search,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Wrench,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Thermometer,
} from "lucide-react";
import { Asset } from "@/types";

// ─── Helpers ────────────────────────────────────────────────────────────────

type AssetStatus = "ok" | "overdue" | "scheduled" | "in_maintenance";

function getAssetStatus(asset: Asset, scheduledAssetIds: Set<string>): AssetStatus {
    if (asset.status === "maintenance") return "in_maintenance";
    if (scheduledAssetIds.has(asset.id)) return "scheduled";
    if (asset.nextMaintenance && new Date(asset.nextMaintenance) < new Date()) return "overdue";
    return "ok";
}

function formatDate(dateStr?: string) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-BR");
}

const MONTHS_PT = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// ─── Status Config ───────────────────────────────────────────────────────────

const statusConfig = {
    ok: {
        label: "Em Dia",
        icon: CheckCircle2,
        color: "text-emerald-600",
        bg: "bg-white border-emerald-100 shadow-sm",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    overdue: {
        label: "Atrasado",
        icon: AlertTriangle,
        color: "text-red-500",
        bg: "bg-white border-red-100 shadow-sm",
        badge: "bg-red-50 text-red-700 border-red-200",
    },
    scheduled: {
        label: "Agendado",
        icon: Clock,
        color: "text-blue-500",
        bg: "bg-white border-blue-100 shadow-sm",
        badge: "bg-blue-50 text-blue-700 border-blue-200",
    },
    in_maintenance: {
        label: "Em Manutenção",
        icon: Wrench,
        color: "text-amber-500",
        bg: "bg-white border-amber-100 shadow-sm",
        badge: "bg-amber-50 text-amber-700 border-amber-200",
    },
};

// ─── Asset Card ──────────────────────────────────────────────────────────────

function AssetCard({ asset, status }: { asset: Asset; status: AssetStatus }) {
    const cfg = statusConfig[status];
    const Icon = cfg.icon;

    return (
        <div className={`rounded-xl border p-3 transition-all hover:shadow-md cursor-pointer ${cfg.bg}`}>
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                    <Thermometer className={`h-4 w-4 shrink-0 ${cfg.color}`} />
                    <p className="text-sm font-semibold text-slate-800 truncate">{asset.name}</p>
                </div>
                <Badge className={`text-[10px] shrink-0 border ${cfg.badge}`}>
                    <Icon className="h-2.5 w-2.5 mr-1" />
                    {cfg.label}
                </Badge>
            </div>
            <p className="text-xs text-slate-500 font-mono mb-2">{asset.patrimonyNumber}</p>
            <div className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{asset.sectorId}</span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium">Próxima: {formatDate(asset.nextMaintenance)}</span>
            </div>
        </div>
    );
}

// ─── Kanban View ─────────────────────────────────────────────────────────────

function KanbanView({ grouped }: { grouped: Record<AssetStatus, Asset[]> }) {
    const columns: AssetStatus[] = ["overdue", "scheduled", "in_maintenance", "ok"];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {columns.map((col) => {
                const cfg = statusConfig[col];
                const Icon = cfg.icon;
                const items = grouped[col] || [];
                return (
                    <div key={col} className="flex flex-col gap-3">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border bg-slate-50 border-slate-200`}>
                            <Icon className={`h-4 w-4 ${cfg.color}`} />
                            <span className="text-sm font-bold text-slate-700">{cfg.label}</span>
                            <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                                {items.length}
                            </span>
                        </div>
                        <div className="flex flex-col gap-2">
                            {items.length === 0 ? (
                                <div className="text-xs text-slate-400 text-center py-4 border border-dashed border-slate-200 bg-slate-50/50 rounded-lg">
                                    Nenhum equipamento
                                </div>
                            ) : (
                                items.map((a) => (
                                    <AssetCard key={a.id} asset={a} status={col} />
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Calendar View ───────────────────────────────────────────────────────────

function CalendarView({
    assetsWithStatus,
    year,
    month,
    onPrev,
    onNext,
}: {
    assetsWithStatus: Array<{ asset: Asset; status: AssetStatus }>;
    year: number;
    month: number; // 0-indexed
    onPrev: () => void;
    onNext: () => void;
}) {
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    // Map day → assets with scheduled date in that day
    const dayMap = useMemo(() => {
        const map: Record<number, Array<{ asset: Asset; status: AssetStatus }>> = {};
        assetsWithStatus.forEach(({ asset, status }) => {
            const dateStr = asset.nextMaintenance;
            if (!dateStr) return;
            const d = new Date(dateStr);
            if (d.getFullYear() === year && d.getMonth() === month) {
                const day = d.getDate();
                if (!map[day]) map[day] = [];
                map[day].push({ asset, status });
            }
        });
        return map;
    }, [assetsWithStatus, year, month]);

    const cells: (number | null)[] = [
        ...Array(firstDay === 0 ? 6 : firstDay - 1).fill(null), // offset for Mon-start
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    const dayNames = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

    return (
        <div className="space-y-3">
            {/* Calendar Header */}
            <div className="flex items-center justify-between px-1">
                <Button variant="ghost" size="icon" onClick={onPrev} className="text-slate-500 hover:text-slate-800 hover:bg-slate-100">
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-base font-bold text-slate-800">
                    {MONTHS_PT[month]} {year}
                </h3>
                <Button variant="ghost" size="icon" onClick={onNext} className="text-slate-500 hover:text-slate-800 hover:bg-slate-100">
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1">
                {dayNames.map((d) => (
                    <div key={d} className="text-center text-[11px] font-bold text-slate-500 py-1 uppercase tracking-wide">
                        {d}
                    </div>
                ))}
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7 gap-1">
                {cells.map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} className="bg-transparent" />;
                    const isToday =
                        day === today.getDate() &&
                        month === today.getMonth() &&
                        year === today.getFullYear();
                    const events = dayMap[day] || [];

                    return (
                        <div
                            key={day}
                            className={`min-h-[80px] rounded-lg p-1.5 border transition-colors ${isToday
                                ? "border-indigo-300 bg-indigo-50/50 shadow-sm"
                                : events.length > 0
                                    ? "border-slate-200 bg-white shadow-sm"
                                    : "border-slate-100 bg-slate-50/30"
                                }`}
                        >
                            <div
                                className={`text-xs font-bold mb-1.5 ${isToday ? "text-indigo-600 bg-indigo-100 w-fit px-1.5 py-0.5 rounded-md" : "text-slate-500"
                                    }`}
                            >
                                {day}
                            </div>
                            <div className="flex flex-col gap-1">
                                {events.slice(0, 3).map(({ asset, status }) => {
                                    const cfg = statusConfig[status];
                                    return (
                                        <div
                                            key={asset.id}
                                            title={asset.name}
                                            className={`text-[9px] px-1.5 py-0.5 rounded-md truncate border ${cfg.badge} font-medium`}
                                        >
                                            {asset.name.split(" ").slice(0, 2).join(" ")}
                                        </div>
                                    );
                                })}
                                {events.length > 3 && (
                                    <div className="text-[9px] font-medium text-slate-400 px-1">
                                        +{events.length - 3} mais
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function SchedulingPanel() {
    const { assets, tickets, sectors } = useAppStore();

    const [view, setView] = useState<"kanban" | "calendar">("kanban");
    const [filters, setFilters] = useState({ search: "", sector: "all", status: "all", category: "all" });

    const today = new Date();
    const [calYear, setCalYear] = useState(today.getFullYear());
    const [calMonth, setCalMonth] = useState(today.getMonth());

    // IDs agendados (tickets com status scheduled)
    const scheduledAssetIds = useMemo(() => {
        const ids = new Set<string>();
        tickets.forEach((t) => {
            if (t.status === "scheduled") ids.add(t.assetId);
        });
        return ids;
    }, [tickets]);

    // Filtros
    const filteredAssets = useMemo(() => {
        return assets.filter((a) => {
            const matchSearch =
                !filters.search ||
                a.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                a.patrimonyNumber.toLowerCase().includes(filters.search.toLowerCase());
            const matchSector = filters.sector === "all" || a.sectorId === filters.sector;
            const matchCat = filters.category === "all" || a.category === filters.category;
            // Status filter will be applied after calculating asset status
            return matchSearch && matchSector && matchCat;
        });
    }, [assets, filters]);

    // Enriquecer com status calculado
    const assetsWithStatus = useMemo(() => {
        return filteredAssets
            .map((a) => ({
                asset: a,
                status: getAssetStatus(a, scheduledAssetIds),
            }))
            .filter(({ status }) => filters.status === "all" || status === filters.status);
    }, [filteredAssets, scheduledAssetIds, filters.status]);

    // Agrupado por status (Kanban)
    const grouped = useMemo(() => {
        const g: Record<AssetStatus, Asset[]> = { ok: [], overdue: [], scheduled: [], in_maintenance: [] };
        assetsWithStatus.forEach(({ asset, status }) => g[status].push(asset));
        return g;
    }, [assetsWithStatus]);

    // KPIs
    const kpis = [
        { label: "Total Equipamentos", value: assetsWithStatus.length, color: "text-slate-700", bg: "bg-white", border: "border-slate-200" },
        { label: "Em Dia", value: grouped.ok.length, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
        { label: "Agendados", value: grouped.scheduled.length, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
        { label: "Atrasados", value: grouped.overdue.length, color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
        { label: "Em Manutenção", value: grouped.in_maintenance.length, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    ];

    function prevMonth() {
        if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
        else setCalMonth(m => m - 1);
    }
    function nextMonth() {
        if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
        else setCalMonth(m => m + 1);
    }

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-4">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {kpis.map((k) => (
                    <Card key={k.label} className={`${k.bg} ${k.border} shadow-sm transition-all hover:shadow-md`}>
                        <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 text-center leading-tight">{k.label}</p>
                            <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Toolbar */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-3">
                    <div className="flex flex-wrap gap-3 items-center">
                        {/* View Toggle */}
                        <div className="flex rounded-lg overflow-hidden border border-slate-200 bg-slate-50 p-0.5">
                            <button
                                onClick={() => setView("kanban")}
                                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-md transition-all ${view === "kanban"
                                    ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                                    : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                <LayoutGrid className="h-3.5 w-3.5" /> Kanban
                            </button>
                            <button
                                onClick={() => setView("calendar")}
                                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-md transition-all ${view === "calendar"
                                    ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                                    : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                <Calendar className="h-3.5 w-3.5" /> Calendário
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar equipamento ou patrimônio..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange("search", e.target.value)}
                                className="pl-9 h-9 text-sm bg-white border-slate-200 text-slate-800 focus:border-indigo-400 focus:ring-indigo-400/20"
                            />
                        </div>

                        {/* Sector Filter */}
                        <Select value={filters.sector} onValueChange={(val) => handleFilterChange("sector", val)}>
                            <SelectTrigger className="h-9 w-[180px] text-sm bg-white border-slate-200 text-slate-700">
                                <SelectValue placeholder="Setor" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-200 text-slate-800">
                                <SelectItem value="all">Todos os setores</SelectItem>
                                {sectors.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Status Filter */}
                        <Select value={filters.status} onValueChange={(val) => handleFilterChange("status", val)}>
                            <SelectTrigger className="h-9 w-[140px] text-sm bg-white border-slate-200 text-slate-700">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-200 text-slate-800">
                                <SelectItem value="all">Todos os Status</SelectItem>
                                <SelectItem value="ok">Em Dia</SelectItem>
                                <SelectItem value="scheduled">Agendado</SelectItem>
                                <SelectItem value="overdue">Atrasado</SelectItem>
                                <SelectItem value="in_maintenance">Em Manutenção</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Category Filter */}
                        <Select value={filters.category} onValueChange={(val) => handleFilterChange("category", val)}>
                            <SelectTrigger className="h-9 w-[140px] text-sm bg-white border-slate-200 text-slate-700">
                                <SelectValue placeholder="Categoria" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-200 text-slate-800">
                                <SelectItem value="all">Todas as Categorias</SelectItem>
                                <SelectItem value="preventive">Preventiva</SelectItem>
                                <SelectItem value="corrective">Corretiva</SelectItem>
                                <SelectItem value="calibration">Calibração</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* View Content */}
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-5">
                    {view === "kanban" ? (
                        <KanbanView grouped={grouped} />
                    ) : (
                        <CalendarView
                            assetsWithStatus={assetsWithStatus}
                            year={calYear}
                            month={calMonth}
                            onPrev={prevMonth}
                            onNext={nextMonth}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
