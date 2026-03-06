
"use client";

import { useAppStore } from "@/store/useStore";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, History, User, MapPin, Calendar, Clock, Image as ImageIcon, Info, Package, Wrench, AlertCircle, HelpCircle, TrendingUp, FileText } from "lucide-react";
import Link from "next/link";
import { TechnicianItemForm } from "@/components/TechnicianItemForm";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function TicketPage() {
    const { ticketId } = useParams();
    const router = useRouter();
    const { tickets, assets, sectors, addItemToTicket, startService, submitTicket, setData, catalog } = useAppStore();

    const ticket = tickets.find(t => t.id === ticketId);
    const asset = assets.find(a => a.id === ticket?.assetId);
    const sector = sectors.find(s => s.id === ticket?.sectorId);

    const [viewPhoto, setViewPhoto] = useState<string | null>(null);

    const fetchedRef = useRef(false);
    // Ensure data is loaded (handle refresh)
    useEffect(() => {
        if (!fetchedRef.current && (catalog.length === 0 || !tickets.find(t => t.id === ticketId))) {
            fetchedRef.current = true;
            import('@/app/actions/dashboard-data').then(mod => {
                mod.getDashboardData().then(data => {
                    // @ts-ignore
                    setData(data);
                });
            });
        }
    }, [catalog.length, ticketId, tickets, setData]);

    const startedRef = useRef(false);
    // Auto-start service if opening page (only if ticket exists)
    useEffect(() => {
        if (!startedRef.current && ticket && ticket.status === 'open') {
            startedRef.current = true;
            startService(ticket.id as string);
        }
    }, [ticket, startService]);

    if (!ticket || !asset) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center text-neutral-500 bg-neutral-50">
                <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-10 h-10 text-neutral-300" />
                </div>
                <p className="font-bold text-lg text-neutral-700 mb-1">Chamado não encontrado</p>
                <p className="text-sm text-neutral-500 mb-4">Este atendimento pode ter sido removido ou não existe.</p>
                <Link href="/"><Button variant="default">Voltar ao Painel</Button></Link>
            </div>
        );
    }

    const handleFinish = () => {
        if (ticket.items.length === 0) {
            alert("Adicione pelo menos 1 item (serviço ou peça) antes de finalizar.");
            return;
        }
        if (confirm("Finalizar este atendimento e enviar para validação do setor?")) {
            submitTicket(ticket.id);
            alert("✓ Serviço finalizado! Enviado para validação do fiscal.");
            router.push("/");
        }
    };

    const totalValue = ticket.items.reduce((acc, item) => acc + item.estimatedValue, 0);
    const serviceCount = ticket.items.filter(i => i.category === 'cleaning').length;
    const partCount = ticket.items.filter(i => i.category === 'part_replacement').length;

    // History of this asset
    const assetHistory = tickets.filter(t => t.assetId === asset.id && t.status === 'validated');

    // Calculate progress
    const hasItems = ticket.items.length > 0;
    const hasPhotos = ticket.items.some(i => i.technicianPhotos.length > 0);
    const progressPercent = hasItems ? (hasPhotos ? 100 : 50) : 0;

    return (
        <TooltipProvider delayDuration={200}>
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-40">
                {/* Enhanced Header */}
                <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 border-b border-neutral-700/50 shadow-xl">
                    {/* Top Bar */}
                    <div className="px-4 py-3 flex items-center justify-between">
                        <Link href="/">
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${ticket.status === 'in_progress' ? 'bg-blue-400 animate-pulse' : 'bg-emerald-400'}`}></div>
                            <span className="text-white text-xs font-bold tracking-wide uppercase">
                                {ticket.status === 'in_progress' ? 'Em Atendimento' : 'Atendendo'}
                            </span>
                        </div>
                        <div className="w-10"></div> {/* Spacer for alignment */}
                    </div>

                    {/* Equipment Info */}
                    <div className="px-6 pb-6 pt-2">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">{asset.name}</h1>
                                <div className="flex flex-wrap items-center gap-2 text-neutral-300 text-sm">
                                    <span className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                                        <Package className="w-3.5 h-3.5" />
                                        <span className="font-mono font-semibold">{asset.patrimonyNumber}</span>
                                    </span>
                                    <span className="text-neutral-500">•</span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {sector?.name}
                                    </span>
                                    {asset.category && (
                                        <>
                                            <span className="text-neutral-500">•</span>
                                            <span className="text-xs bg-white/10 px-2 py-0.5 rounded">{asset.category}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-neutral-400 font-medium">Progresso do Atendimento</span>
                                <span className="text-white font-bold">{progressPercent}%</span>
                            </div>
                            <div className="h-2 bg-neutral-700/50 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 rounded-full"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <div className="flex items-center gap-4 text-[10px] text-neutral-400">
                                <span className={hasItems ? 'text-emerald-400' : ''}>
                                    {hasItems ? '✓' : '○'} Itens adicionados
                                </span>
                                <span className={hasPhotos ? 'text-emerald-400' : ''}>
                                    {hasPhotos ? '✓' : '○'} Fotos enviadas
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <main className="container mx-auto px-4 -mt-4 space-y-6 relative z-10 max-w-3xl">
                    {/* Request Card */}
                    <Card className="rounded-2xl shadow-lg border-0 ring-1 ring-orange-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-50 via-orange-50/80 to-white border-b border-orange-100 px-4 py-4 flex gap-3 items-start">
                            <div className="bg-white p-2 rounded-xl shadow-sm text-orange-500 mt-0.5 flex-shrink-0">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-[10px] font-bold uppercase text-orange-700/70 tracking-wide">
                                        Problema Relatado
                                    </p>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="w-3.5 h-3.5 text-orange-400 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-xs">
                                            <p className="text-xs">Esta é a descrição do problema fornecida pelo fiscal do setor. Use como referência para seu atendimento.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <p className="text-sm font-medium text-slate-800 leading-relaxed mb-3">"{ticket.description}"</p>
                                <div className="flex flex-wrap items-center gap-3 text-[11px] text-orange-800/60">
                                    <span className="inline-flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded font-medium">
                                        <User className="w-3 h-3" />
                                        {sector?.responsible?.name || "Fiscal"}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded font-medium">
                                        <Clock className="w-3 h-3" />
                                        {new Date(ticket.openedAt).toLocaleDateString()}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded font-mono font-semibold">
                                        {ticket.code ? `VOS-${String(ticket.code).padStart(6, '0')}` : `OS #${ticket.id.slice(0, 4)}`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Equipment Specifications Card */}
                    <Card className="rounded-2xl shadow-lg border-0 ring-1 ring-blue-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 via-blue-50/80 to-white border-b border-blue-100 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-xl shadow-sm text-blue-500">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-blue-700/70 tracking-wide">
                                        Especificações do Equipamento
                                    </p>
                                    <p className="text-xs text-blue-600 font-medium">{asset.name}</p>
                                </div>
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 h-8 text-xs font-semibold">
                                        <History className="w-3.5 h-3.5 mr-1.5" />
                                        Ver Histórico
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <History className="w-5 h-5 text-neutral-600" />
                                            Histórico do Equipamento
                                        </DialogTitle>
                                    </DialogHeader>
                                    <ScrollArea className="flex-1 pr-4">
                                        <div className="space-y-4 py-2">
                                            {assetHistory.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <FileText className="w-8 h-8 text-neutral-300" />
                                                    </div>
                                                    <p className="text-sm text-neutral-500 font-medium">Nenhum histórico registrado</p>
                                                    <p className="text-xs text-neutral-400 mt-1">Este é o primeiro atendimento</p>
                                                </div>
                                            ) : (
                                                assetHistory.map(h => (
                                                    <div key={h.id} className="relative pl-4 border-l-2 border-emerald-200 py-1">
                                                        <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="font-bold text-sm text-slate-700">
                                                                {h.code ? `VOS-${String(h.code).padStart(6, '0')}` : `OS #${h.id.slice(0, 6)}`}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400">{new Date(h.updatedAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 mb-2 italic">"{h.description}"</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {h.items.map((it, i) => (
                                                                <Badge key={i} variant="secondary" className="text-[10px] px-1.5 h-5 bg-emerald-50 text-emerald-700 font-normal">{it.title}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </ScrollArea>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className="p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Left Column */}
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Patrimônio</p>
                                        <p className="text-sm font-mono font-semibold text-slate-800 bg-slate-50 px-2 py-1.5 rounded border border-slate-200">
                                            {asset.patrimonyNumber}
                                        </p>
                                    </div>
                                    {asset.category && (
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Categoria</p>
                                            <p className="text-sm text-slate-700">{asset.category}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column */}
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Localização</p>
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-slate-800">{sector?.name}</p>
                                            {sector?.block && (
                                                <p className="text-xs text-slate-600">Bloco: {sector.block}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Notes */}
                            {asset.notes && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-[10px] font-bold uppercase text-slate-500 mb-2">Observações</p>
                                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                                        {asset.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Items Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-800 text-lg">Itens Registrados</h3>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-xs">
                                        <p className="text-xs mb-2 font-semibold">Registre TODOS os serviços e peças</p>
                                        <p className="text-xs text-neutral-300">• Você pode adicionar múltiplos serviços</p>
                                        <p className="text-xs text-neutral-300">• Você pode adicionar múltiplas peças</p>
                                        <p className="text-xs text-neutral-300">• Fotos são opcionais (mas recomendadas)</p>
                                        <p className="text-xs text-neutral-300">• Adicione observações quando necessário</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="flex items-center gap-2">
                                {serviceCount > 0 && (
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 gap-1">
                                                <Wrench className="w-3 h-3" />
                                                {serviceCount}
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">{serviceCount} serviço(s) executado(s)</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                                {partCount > 0 && (
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 gap-1">
                                                <Package className="w-3 h-3" />
                                                {partCount}
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">{partCount} peça(s) substituída(s)</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                                {ticket.items.length > 0 && (
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                                        Total: {ticket.items.length}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {ticket.items.length === 0 ? (
                            <Card className="border-2 border-dashed border-slate-200 rounded-2xl bg-gradient-to-br from-slate-50 to-white">
                                <CardContent className="py-12 px-4 text-center">
                                    <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                                        <ImageIcon className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 mb-1">Nenhum item registrado</p>
                                    <p className="text-xs text-slate-500 max-w-[320px] mx-auto mb-4">
                                        Adicione <strong>todos os serviços e peças</strong> necessários para este atendimento usando o formulário abaixo.
                                    </p>
                                    <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg font-medium">
                                        <Info className="w-3.5 h-3.5" />
                                        Mínimo: 1 item | Você pode adicionar quantos forem necessários
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-3">
                                {ticket.items.map((item, idx) => (
                                    <Card key={item.id} className="overflow-hidden border-0 shadow-md ring-1 ring-slate-100 rounded-2xl group hover:shadow-lg transition-all">
                                        <div className="p-4 sm:p-5">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 text-xs font-bold text-slate-600 flex-shrink-0 ring-2 ring-white shadow-sm">
                                                        {idx + 1}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                            <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">{item.title}</h4>
                                                            <Badge className={`text-[10px] font-bold uppercase ${item.category === 'part_replacement'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-emerald-100 text-emerald-700'
                                                                }`}>
                                                                {item.category === 'part_replacement' ? (
                                                                    <><Package className="w-2.5 h-2.5 mr-1" /> Peça</>
                                                                ) : (
                                                                    <><Wrench className="w-2.5 h-2.5 mr-1" /> Serviço</>
                                                                )}
                                                            </Badge>
                                                        </div>
                                                        {item.description && (
                                                            <div className="text-xs bg-slate-50 p-2.5 rounded-lg text-slate-600 border border-slate-100 mt-2">
                                                                <span className="font-semibold text-slate-500">Obs:</span> {item.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="font-mono text-sm sm:text-base font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg flex-shrink-0 ml-2">
                                                    R$ {item.estimatedValue.toFixed(2)}
                                                </span>
                                            </div>

                                            {/* Photos Grid */}
                                            {item.technicianPhotos.length > 0 && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                                        <ImageIcon className="w-3.5 h-3.5" />
                                                        Evidências Fotográficas ({item.technicianPhotos.length})
                                                    </div>
                                                    <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                                                        {item.technicianPhotos.map((photo) => (
                                                            <button
                                                                key={photo.id}
                                                                onClick={() => setViewPhoto(photo.url)}
                                                                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 border-2 border-slate-100 bg-slate-50 hover:border-emerald-300 hover:scale-105 transition-all shadow-sm"
                                                            >
                                                                <img src={photo.url} className="w-full h-full object-cover" alt={`${photo.type} photo`} />
                                                                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                                                                <span className={`absolute bottom-0 inset-x-0 text-[9px] text-white text-center py-1 font-bold uppercase tracking-wide ${photo.type === 'before' ? 'bg-red-500/90' : 'bg-emerald-500/90'
                                                                    }`}>
                                                                    {photo.type === 'before' ? 'Antes' : 'Depois'}
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Add Item Form */}
                    <TechnicianItemForm ticketId={ticket.id} onAdd={(item) => addItemToTicket(ticket.id, item)} />
                </main>

                {/* Enhanced Floating Bottom Bar */}
                <div className="fixed bottom-0 inset-x-0 z-50 pointer-events-none">
                    <div className="container mx-auto px-4 pb-6 max-w-3xl pointer-events-auto">
                        <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 backdrop-blur-xl text-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-white/10">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Total Estimado</p>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="w-3 h-3 text-neutral-500 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">Valor somado de {ticket.items.length} {ticket.items.length === 1 ? 'item' : 'itens'}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                                        R$ {totalValue.toFixed(2)}
                                    </p>
                                    {ticket.items.length > 0 && (
                                        <p className="text-[10px] text-neutral-500 mt-1">
                                            {serviceCount} serviço(s) • {partCount} peça(s)
                                        </p>
                                    )}
                                </div>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div>
                                            <Button
                                                size="lg"
                                                onClick={handleFinish}
                                                disabled={ticket.items.length === 0}
                                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 sm:px-8 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40"
                                            >
                                                <span className="hidden sm:inline">Finalizar Atendimento</span>
                                                <span className="sm:hidden">Finalizar</span>
                                                <CheckCircle2 className="w-5 h-5 ml-2" />
                                            </Button>
                                        </div>
                                    </TooltipTrigger>
                                    {ticket.items.length === 0 && (
                                        <TooltipContent side="top">
                                            <p className="text-xs">Adicione pelo menos 1 item para finalizar</p>
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Photo Viewer Modal */}
                <Dialog open={!!viewPhoto} onOpenChange={(o) => !o && setViewPhoto(null)}>
                    <DialogContent className="p-0 border-0 bg-black max-w-3xl overflow-hidden">
                        {viewPhoto && (
                            <div className="relative w-full aspect-[4/3] bg-black flex items-center justify-center">
                                <img src={viewPhoto} className="w-full h-full object-contain" alt="Foto ampliada" />
                                <Button
                                    className="absolute top-4 right-4 bg-black/70 text-white rounded-full hover:bg-black/90 w-10 h-10 p-0"
                                    onClick={() => setViewPhoto(null)}
                                >
                                    <span className="text-2xl leading-none">&times;</span>
                                </Button>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
}
