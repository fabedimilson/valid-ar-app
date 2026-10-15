
"use client";

import { useAppStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { AlertCircle, CheckCircle2, ThermometerSnowflake, Wrench, History } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Input } from "@/components/ui/input";


export function ServerSectorView() {
    const { currentSectorId, sectors, assets, tickets, openTicket, problemTypes } = useAppStore();

    const currentSector = sectors.find(s => s.id === currentSectorId);
    const myAssets = assets.filter(a => a.sectorId === currentSectorId);

    const [ticketDescription, setTicketDescription] = useState("");
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const [selectedProblemType, setSelectedProblemType] = useState<string>("");

    const handleOpenTicket = () => {
        if (selectedAssetId && selectedProblemType) {
            const problem = problemTypes.find(p => p.id === selectedProblemType);
            const fullDescription = problem ? `[${problem.label}] ${ticketDescription}` : ticketDescription;

            openTicket(selectedAssetId, fullDescription);
            toast.success("Solicitação aberta com sucesso!");
            setTicketDescription("");
            setSelectedProblemType("");
            setSelectedAssetId(null);
        }
    };

    // Find tickets waiting for validation
    const pendingValidations = tickets.filter(t => t.sectorId === currentSectorId && t.status === 'waiting_validation');

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-950 rounded-2xl p-6 shadow-xs border-2 border-slate-300 dark:border-neutral-800 mb-6">
                <div className="flex flex-col gap-2">
                    <div>
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full">
                            Setor Designado
                        </span>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
                            {currentSector?.name}
                        </h2>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-base">
                        Fiscal responsável: <span className="font-bold text-slate-800 dark:text-slate-200">{currentSector?.responsible?.name}</span>
                    </p>

                    <div className="mt-3 p-4 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border-2 border-blue-200 dark:border-blue-900 flex items-start gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg text-blue-700 dark:text-blue-300 shrink-0">
                            <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Abertura de Chamados e Atesto</h4>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                                Identifique o ar-condicionado na lista abaixo para solicitar reparo ou confira os serviços concluídos na barra de validação para atesto.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alertas de Validação Pendente */}
            {pendingValidations.length > 0 && (
                <div className="space-y-3 animate-in slide-in-from-top-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Serviços Aguardando Seu Atesto ({pendingValidations.length})
                    </h3>
                    {pendingValidations.map(t => {
                        const tAsset = assets.find(a => a.id === t.assetId);
                        return (
                            <div key={t.id} className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-700 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
                                <div className="flex gap-3 items-center">
                                    <div className="bg-amber-100 dark:bg-amber-900/60 p-2.5 rounded-xl text-amber-700 dark:text-amber-300 shrink-0 animate-pulse">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-amber-950 dark:text-amber-100 text-sm sm:text-base">
                                            Validar Serviço: {tAsset?.name} ({tAsset?.patrimonyNumber})
                                        </h4>
                                        <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300">
                                            O técnico concluiu o atendimento. Confira as fotos de Antes/Depois para atestar.
                                        </p>
                                    </div>
                                </div>
                                <Link href={`/server/validate/${t.id}`} className="w-full sm:w-auto">
                                    <Button size="lg" className="w-full sm:w-auto min-h-[44px] bg-amber-600 hover:bg-amber-700 text-white font-bold gap-2 shadow-xs cursor-pointer">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Inspecionar e Atestar
                                    </Button>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Grid dos Equipamentos do Setor */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myAssets.map(asset => {
                    const activeTicket = tickets.find(t => t.assetId === asset.id && t.status !== 'validated' && t.status !== 'completed');

                    return (
                        <Card key={asset.id} className={`border-2 border-slate-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 border-l-4 rounded-xl shadow-xs transition-all hover:shadow-md ${asset.status === 'ok' ? 'border-l-emerald-500' :
                            asset.status === 'maintenance' ? 'border-l-blue-500' : 'border-l-red-500'}`}>
                            <CardHeader className="pb-3 pt-4 px-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="secondary" className="font-mono text-sm font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 border border-slate-200 shadow-sm">
                                                {asset.patrimonyNumber}
                                            </Badge>
                                            {(asset as any).brand && (
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border border-slate-200 px-1.5 py-0.5 rounded-sm bg-white">
                                                    {(asset as any).brand}
                                                </span>
                                            )}
                                        </div>
                                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2 leading-tight">
                                            {asset.name}
                                        </CardTitle>
                                    </div>

                                    {/* History Button - Larger touch target for mobile */}
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 -mr-2 -mt-1" title="Ver Histórico">
                                                <History className="w-4 h-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Histórico de Manutenções</DialogTitle>
                                                <p className="text-sm text-muted-foreground">{asset.name} - {asset.patrimonyNumber}</p>
                                            </DialogHeader>
                                            <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-2">
                                                {tickets.filter(t => t.assetId === asset.id && t.status === 'validated').length === 0 ? (
                                                    <div className="text-center text-sm text-neutral-400 py-4">Nenhum histórico anterior.</div>
                                                ) : (
                                                    tickets.filter(t => t.assetId === asset.id && t.status === 'validated').map(h => (
                                                        <div key={h.id} className="border rounded-lg p-3 text-sm space-y-2">
                                                            <div className="flex justify-between font-bold text-neutral-700">
                                                                <span>{h.code ? `VOS ${String(h.code).padStart(6, '0')}` : `OS #${h.id.slice(0, 4)}`}</span>
                                                                <span className="text-xs font-normal text-muted-foreground">{new Date(h.updatedAt).toLocaleDateString()}</span>
                                                            </div>
                                                            <p className="italic text-neutral-500">"{h.description}"</p>
                                                            <div className="flex gap-2 text-xs">
                                                                <Badge variant="outline">{h.items.length} serviço(s)</Badge>
                                                                <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">Validado</Badge>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <div className="pt-2">
                                    {asset.status === 'paralyzed' && <Badge variant="destructive" className="text-[10px] shadow-sm">DEFEITO / INATIVO</Badge>}
                                    {asset.status === 'maintenance' && <Badge className="bg-blue-500 hover:bg-blue-600 text-[10px] shadow-sm">EM MANUTENÇÃO</Badge>}
                                    {asset.status === 'ok' && <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 text-[10px]">OPERACIONAL</Badge>}
                                </div>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                {activeTicket ? (
                                    <div className="text-sm bg-blue-50 border border-blue-100 p-3 rounded-lg mt-1 space-y-2">
                                        <div className="flex items-center gap-2 text-blue-800 font-bold text-xs uppercase tracking-wide">
                                            <Wrench className="w-3 h-3" /> Chamado #{activeTicket.code ? `VOS ${String(activeTicket.code).padStart(6, '0')}` : activeTicket.id.slice(0, 4)}
                                        </div>
                                        <p className="italic text-slate-700 line-clamp-2">"{activeTicket.description}"</p>
                                        <div className="pt-1 border-t border-blue-100 flex justify-between items-center">
                                            <span className="text-xs font-bold text-blue-600">
                                                {activeTicket.status === 'in_progress' ? 'Em atendimento' : 'Aguardando Técnico'}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full mt-2 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300 transition-colors"
                                                onClick={() => setSelectedAssetId(asset.id)}
                                            >
                                                <Wrench className="w-4 h-4 mr-2" />
                                                Solicitar Reparo
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Solicitar Manutenção</DialogTitle>
                                            </DialogHeader>
                                            <div className="py-4 space-y-6">
                                                {/* Asset Summary */}
                                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                                                    <div>
                                                        <p className="font-bold text-slate-800">{asset.name}</p>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="text-[10px] h-5 px-1 bg-white">
                                                                {asset.patrimonyNumber}
                                                            </Badge>
                                                            {(asset as any).brand && <span className="text-[10px] text-slate-400 font-bold uppercase">{(asset as any).brand}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border shadow-sm text-blue-500">
                                                        <ThermometerSnowflake className="w-5 h-5" />
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold text-slate-700">Qual o problema identificado?</Label>
                                                        <Select value={selectedProblemType} onValueChange={setSelectedProblemType}>
                                                            <SelectTrigger className="w-full h-12 bg-white border-slate-200 focus:ring-blue-500 focus:border-blue-500 text-left">
                                                                <SelectValue placeholder="Selecione o tipo de defeito..." />
                                                            </SelectTrigger>
                                                            <SelectContent className="max-h-[280px]">
                                                                {problemTypes.map(p => (
                                                                    <SelectItem key={p.id} value={p.id} className="py-3 cursor-pointer">
                                                                        <span className="font-medium text-slate-700 block mb-0.5">{p.label}</span>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {selectedProblemType && (
                                                            <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-2 items-start animate-in fade-in slide-in-from-top-1">
                                                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                                                <span>{problemTypes.find(p => p.id === selectedProblemType)?.description}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold text-slate-700">Observações (Opcional)</Label>
                                                        <Textarea
                                                            placeholder="Descreva detalhes que ajudem o técnico (ex: barulho metálico, cheiro de queimado...)"
                                                            className="min-h-[100px] resize-none focus:ring-blue-500"
                                                            value={ticketDescription}
                                                            onChange={e => setTicketDescription(e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <Button
                                                    onClick={handleOpenTicket}
                                                    disabled={!selectedProblemType}
                                                    className="w-full h-11 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
                                                >
                                                    Confirmar Solicitação
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div >
    );
}
