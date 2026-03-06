
"use client";

import { useAppStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, AlertTriangle, Clock, Wrench } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AdminMaintenanceDashboard() {
    const { assets, sectors } = useAppStore();

    // Sort assets by next maintenance date
    const sortedAssets = [...assets].sort((a, b) => {
        if (!a.nextMaintenance) return 1;
        if (!b.nextMaintenance) return -1;
        return new Date(a.nextMaintenance).getTime() - new Date(b.nextMaintenance).getTime();
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ok':
                return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Operacional</Badge>;
            case 'waiting_tech':
                return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Aguardando Técnico</Badge>;
            case 'maintenance':
                return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Em Manutenção</Badge>;
            case 'paralyzed':
                return <Badge variant="destructive">Paralisado</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const isOverdue = (date?: string) => {
        if (!date) return false;
        return new Date(date).getTime() < new Date().getTime();
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-emerald-50/50 border-emerald-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-800 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Realizadas no Mês
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-900">12</div>
                        <p className="text-xs text-emerald-600 mt-1">Meta: 15 equipamentos</p>
                    </CardContent>
                </Card>
                <Card className="bg-amber-50/50 border-amber-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-800 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Próximos 7 dias
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-900">5</div>
                        <p className="text-xs text-amber-600 mt-1">Aguardando agendamento</p>
                    </CardContent>
                </Card>
                <Card className="bg-red-50/50 border-red-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Preventivas Atrasadas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-900">2</div>
                        <p className="text-xs text-red-600 mt-1">Exige atenção imediata</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        Agenda de Manutenções Preventivas
                    </CardTitle>
                    <CardDescription>
                        Lista de equipamentos e cronograma de manutenções periódicas contratadas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Equipamento</TableHead>
                                <TableHead>Setor</TableHead>
                                <TableHead>Status Atual</TableHead>
                                <TableHead>Última Preventiva</TableHead>
                                <TableHead>Próxima Preventiva</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedAssets.map((asset) => (
                                <TableRow key={asset.id} className={isOverdue(asset.nextMaintenance) ? "bg-red-50/30" : ""}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{asset.name}</span>
                                            <span className="text-[10px] text-slate-500 font-mono">{asset.patrimonyNumber}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {sectors.find(s => s.id === asset.sectorId)?.name || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(asset.status)}
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600">
                                        {asset.lastMaintenance ? format(new Date(asset.lastMaintenance), "dd/MM/yyyy", { locale: ptBR }) : '---'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-bold ${isOverdue(asset.nextMaintenance) ? "text-red-600" : "text-slate-900"}`}>
                                                {asset.nextMaintenance ? format(new Date(asset.nextMaintenance), "dd/MM/yyyy", { locale: ptBR }) : 'N/A'}
                                            </span>
                                            {isOverdue(asset.nextMaintenance) && <AlertTriangle className="w-3 h-3 text-red-500" />}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
