"use client";

import { useAppStore } from "@/store/useStore";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, ArrowLeft, Camera, Wrench, AlertTriangle, ShieldCheck, Eye, ZoomIn } from "lucide-react";
import { useState } from "react";
import { updateItemValidationAction, updateTicketAction, recordValidationAction } from "@/app/actions/server-actions";
import { toast } from "sonner";
import Link from 'next/link';

export default function ValidationPage() {
    const { id } = useParams();
    const router = useRouter();
    const { tickets, assets, updateTicket, updateItemValidation, currentUserId } = useAppStore();

    const ticket = tickets.find(t => t.id === id);
    const asset = assets.find(a => a.id === ticket?.assetId);

    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [zoomPhoto, setZoomPhoto] = useState<{ url: string; title: string } | null>(null);

    if (!ticket || !asset) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-black">
                <p className="text-lg font-bold mb-2">Chamado não encontrado ou carregando...</p>
                <Link href="/dashboard" className="text-emerald-600 dark:text-emerald-400 underline font-semibold">
                    Voltar ao Painel
                </Link>
            </div>
        );
    }

    // Coleta todas as fotos anexadas nos itens
    const allPhotos = (ticket.items || []).flatMap(i => i.technicianPhotos || []);
    const hasBeforePhoto = allPhotos.some(p => p.type === 'before');
    const hasAfterPhoto = allPhotos.some(p => p.type === 'after');
    const canApprove = hasBeforePhoto && hasAfterPhoto;

    const totalCost = (ticket.items || []).reduce((acc, item) => acc + (item.validatedValue || item.estimatedValue || 0), 0);

    const handleApprove = async () => {
        if (!canApprove) {
            toast.error("Conformidade IFAM: É obrigatório haver fotos de Antes e Depois para emitir o atesto.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Valida todos os itens
            for (const item of ticket.items) {
                await updateItemValidationAction(ticket.id, item.id, 'approved');
                updateItemValidation(ticket.id, item.id, 'approved');
            }
            // Fecha e atesta o ticket
            await updateTicketAction(ticket.id, { status: 'validated' });
            updateTicket(ticket.id, { status: 'validated' });

            await recordValidationAction({
                ticketId: ticket.id,
                action: 'APPROVED',
                reason: 'Atesto emitido pelo Fiscal de Setor',
                validatorId: currentUserId || undefined
            });

            toast.success("Serviço atestado e validado com sucesso! Pronto para instrução no SIPAC.");
            router.push('/dashboard');
        } catch (e) {
            toast.error("Erro ao validar o serviço.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!notes.trim()) {
            toast.error("Atenção: É obrigatório justificar textualmente o motivo da rejeição.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Retorna a OS para o técnico com status in_progress
            await updateTicketAction(ticket.id, { status: 'in_progress' });
            updateTicket(ticket.id, { status: 'in_progress' });

            await recordValidationAction({
                ticketId: ticket.id,
                action: 'REJECTED',
                reason: notes,
                validatorId: currentUserId || undefined
            });

            toast.info("OS devolvida para correção do técnico com sua justificativa.");
            router.push('/dashboard');
        } catch (e) {
            toast.error("Erro ao registrar a rejeição.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-black text-neutral-900 dark:text-neutral-100 p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <Link href="/dashboard">
                    <Button variant="ghost" className="mb-2 pl-0 hover:bg-transparent hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Painel
                    </Button>
                </Link>

                {/* Cabeçalho com status destacado */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-neutral-950 p-6 rounded-2xl border-2 border-slate-200 dark:border-neutral-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                Fiscal de Setor (Atesto)
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
                            Validar OS #{ticket.code ? `VOS ${String(ticket.code).padStart(6, '0')}` : ticket.id.slice(0, 6)}
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                            Conferência física e documental antes do atesto definitivo para liquidação.
                        </p>
                    </div>

                    <Badge className="text-sm font-bold px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-2 border-amber-500/30">
                        Aguardando Validação
                    </Badge>
                </div>

                {/* Banner de Conformidade Pública IFAM */}
                {!canApprove ? (
                    <div className="p-4 rounded-xl border-2 border-amber-400/80 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-bold">Atesto Bloqueado: Evidências Incompletas</p>
                            <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300">
                                Pela regra do IFAM CMC e conformidade pública, o atesto requer foto do <strong>Antes</strong> e do <strong>Depois</strong> do serviço.
                                {!hasBeforePhoto && " [Falta Foto Antes]"}
                                {!hasAfterPhoto && " [Falta Foto Depois]"}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 rounded-xl border-2 border-emerald-500/80 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div className="text-sm">
                            <p className="font-bold">Evidências Conformes (Antes e Depois Registrados)</p>
                            <p className="text-xs text-emerald-800 dark:text-emerald-300">Você pode conferir as imagens em zoom e prosseguir com a emissão do atesto formal.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Coluna Esquerda: Equipamento & Itens com Evidências Reais */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Info do Equipamento */}
                        <Card className="border-2 border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold text-neutral-800 dark:text-neutral-200">
                                    Equipamento Inspecionado
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
                                    <div>
                                        <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Patrimônio</p>
                                        <p className="text-lg font-black text-neutral-900 dark:text-white font-mono">{asset.patrimonyNumber}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Aparelho</p>
                                        <p className="text-base font-bold text-neutral-900 dark:text-white truncate">{asset.name}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-1 uppercase tracking-wider">Problema Relatado</p>
                                    <div className="p-3 rounded-lg border-2 border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-700 dark:text-neutral-300 italic">
                                        "{ticket.description}"
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Itens e Evidências Fotográficas Reais */}
                        <Card className="border-2 border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold text-neutral-800 dark:text-neutral-200">
                                    Serviços Realizados & Evidências Fotográficas
                                </CardTitle>
                                <CardDescription className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Clique nas imagens para ampliar em alta resolução antes de assinar o atesto.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {ticket.items.length === 0 ? (
                                    <p className="text-neutral-500 text-center py-6">Nenhum item listado pelo técnico.</p>
                                ) : (
                                    ticket.items.map((item, idx) => {
                                        const beforePhotos = (item.technicianPhotos || []).filter(p => p.type === 'before');
                                        const afterPhotos = (item.technicianPhotos || []).filter(p => p.type === 'after');

                                        return (
                                            <div key={idx} className="p-4 rounded-xl border-2 border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/40 space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex gap-3">
                                                        <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                            <Wrench className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-neutral-900 dark:text-white">{item.title}</p>
                                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{item.description}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right font-mono font-bold text-sm text-emerald-700 dark:text-emerald-400">
                                                        R$ {(item.validatedValue || item.estimatedValue || 0).toFixed(2)}
                                                    </div>
                                                </div>

                                                {/* Comparativo de Fotos Antes vs Depois */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                                    {/* Fotos do Antes */}
                                                    <div className="p-3 rounded-lg border-2 border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                                                                <Camera className="w-3.5 h-3.5" /> Foto: Antes
                                                            </span>
                                                            <Badge variant="outline" className="text-[10px] border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400">
                                                                {beforePhotos.length} anexo(s)
                                                            </Badge>
                                                        </div>
                                                        {beforePhotos.length > 0 ? (
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {beforePhotos.map((photo, pIdx) => (
                                                                    <div
                                                                        key={pIdx}
                                                                        onClick={() => setZoomPhoto({ url: photo.url, title: `Antes - ${item.title}` })}
                                                                        className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-neutral-800 cursor-pointer shadow-2xs hover:border-amber-500 transition-all"
                                                                    >
                                                                        <img src={photo.url} alt="Antes" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                                            <ZoomIn className="w-5 h-5" />
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="h-24 rounded-lg border-2 border-dashed border-slate-300 dark:border-neutral-800 flex flex-col items-center justify-center text-neutral-400 text-xs">
                                                                <Camera className="w-5 h-5 mb-1 opacity-50" />
                                                                Nenhuma foto de Antes
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Fotos do Depois */}
                                                    <div className="p-3 rounded-lg border-2 border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                                                                <Camera className="w-3.5 h-3.5" /> Foto: Depois
                                                            </span>
                                                            <Badge variant="outline" className="text-[10px] border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
                                                                {afterPhotos.length} anexo(s)
                                                            </Badge>
                                                        </div>
                                                        {afterPhotos.length > 0 ? (
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {afterPhotos.map((photo, pIdx) => (
                                                                    <div
                                                                        key={pIdx}
                                                                        onClick={() => setZoomPhoto({ url: photo.url, title: `Depois - ${item.title}` })}
                                                                        className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-neutral-800 cursor-pointer shadow-2xs hover:border-emerald-500 transition-all"
                                                                    >
                                                                        <img src={photo.url} alt="Depois" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                                            <ZoomIn className="w-5 h-5" />
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="h-24 rounded-lg border-2 border-dashed border-slate-300 dark:border-neutral-800 flex flex-col items-center justify-center text-neutral-400 text-xs">
                                                                <Camera className="w-5 h-5 mb-1 opacity-50" />
                                                                Nenhuma foto de Depois
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}

                                <div className="flex justify-between items-center pt-4 border-t-2 border-slate-200 dark:border-neutral-800">
                                    <span className="font-bold text-base text-neutral-900 dark:text-white">Total do Serviço na Ata</span>
                                    <span className="font-black text-2xl text-emerald-600 dark:text-emerald-400 font-mono">
                                        R$ {totalCost.toFixed(2)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Coluna Direita: Parecer Formal & Atesto */}
                    <div className="space-y-6">
                        <Card className="border-2 border-emerald-500/50 bg-white dark:bg-neutral-950 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5" /> Atesto do Fiscal
                                </CardTitle>
                                <CardDescription className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Declaração de conferência de serviço para liquidação pública.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                        Observações / Parecer
                                    </label>
                                    <Textarea
                                        className="bg-slate-50 dark:bg-neutral-900 border-2 border-slate-200 dark:border-neutral-800 text-sm min-h-[90px]"
                                        placeholder="Ex: Serviço executado a contento. Aparelho gelando adequadamente e área higienizada."
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                    />
                                    <p className="text-[11px] text-neutral-400">
                                        * Obrigatório preencher caso opte por rejeitar o serviço.
                                    </p>
                                </div>

                                <Button
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 min-h-[48px] text-base shadow-sm active:scale-[0.98] transition-transform cursor-pointer disabled:opacity-50"
                                    onClick={handleApprove}
                                    disabled={isSubmitting || !canApprove}
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    {canApprove ? "EMITIR ATESTO DO SETOR" : "BLOQUEADO (SEM FOTOS)"}
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-full border-2 border-red-300 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 gap-2 min-h-[44px] font-semibold active:scale-[0.98] transition-transform cursor-pointer"
                                    onClick={handleReject}
                                    disabled={isSubmitting}
                                >
                                    <XCircle className="w-5 h-5" />
                                    Rejeitar e Devolver ao Técnico
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="p-4 rounded-xl text-xs bg-slate-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border-2 border-slate-200 dark:border-neutral-800 space-y-1">
                            <p className="font-bold text-neutral-800 dark:text-neutral-100 uppercase tracking-wider">Aviso Legal:</p>
                            <p>
                                O atesto emitido registra sua matrícula SIAPE e vincula formalmente a aceitação dos serviços para o processo de pagamento no SIPAC.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Zoom de Evidência em Alta Resolução */}
            <Dialog open={!!zoomPhoto} onOpenChange={() => setZoomPhoto(null)}>
                <DialogContent className="max-w-3xl bg-neutral-950 border-2 border-neutral-800 text-white p-4">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-neutral-200">
                            {zoomPhoto?.title}
                        </DialogTitle>
                    </DialogHeader>
                    {zoomPhoto && (
                        <div className="relative aspect-video max-h-[70vh] flex items-center justify-center overflow-hidden rounded-xl bg-black">
                            <img src={zoomPhoto.url} alt={zoomPhoto.title} className="max-h-full max-w-full object-contain" />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
