
"use client";

import { useAppStore } from "@/store/useStore";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, ArrowLeft, Camera, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { updateItemValidationAction, updateTicketAction } from "@/app/actions/server-actions";
import { toast } from "sonner";
import Link from 'next/link';

export default function ValidationPage() {
    const { id } = useParams();
    const router = useRouter();
    const { tickets, assets, setData } = useAppStore(); // Assuming setData or refresh might be needed

    // In a real app we might fetch specific data here, but we rely on store for prototype
    const ticket = tickets.find(t => t.id === id);
    const asset = assets.find(a => a.id === ticket?.assetId);

    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!ticket || !asset) {
        return <div className="p-8">Carregando ou ticket não encontrado... <Link href="/dashboard" className="text-blue-500 underline">Voltar</Link></div>;
    }

    const totalCost = ticket.items.reduce((acc, item) => acc + (item.validatedValue || item.estimatedValue), 0);

    const handleApprove = async () => {
        setIsSubmitting(true);
        try {
            // Validate all items
            for (const item of ticket.items) {
                await updateItemValidationAction(ticket.id, item.id, 'approved');
            }
            // Close ticket
            await updateTicketAction(ticket.id, { status: 'validated' });

            toast.success("Serviço validado com sucesso!");
            router.push('/dashboard');
        } catch (e) {
            toast.error("Erro ao validar.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!notes) {
            toast.error("Por favor, justifique a rejeição nas observações.");
            return;
        }
        setIsSubmitting(true);
        try {
            // Reject items? Or just ticket? Let's reject ticket to 'in_progress' so tech fixes it
            await updateTicketAction(ticket.id, { status: 'in_progress' });

            // Optionally add a note to the ticket discussion/logs (not implemented yet)

            toast.info("Ticket devolvido para o técnico.");
            router.push('/dashboard');
        } catch (e) {
            toast.error("Erro ao rejeitar.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            <Link href="/dashboard">
                <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-emerald-600">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Painel
                </Button>
            </Link>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Validar Serviço #{ticket.code ? `VOS ${String(ticket.code).padStart(6, '0')}` : ticket.id.slice(0, 4)}</h1>
                    <p className="text-neutral-500">Confira as evidências e valores antes de aprovar.</p>
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1 bg-amber-50 text-amber-700 border-amber-200">
                    Aguardando Aprovação
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left: Ticket & Asset Info */}
                <div className="space-y-6 md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Equipamento e Solicitação</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-neutral-50 p-4 rounded-lg flex justify-between">
                                <div>
                                    <p className="text-sm font-bold text-neutral-700 uppercase">Patrimônio</p>
                                    <p className="text-lg">{asset.patrimonyNumber}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-neutral-700 uppercase">Equipamento</p>
                                    <p className="text-lg">{asset.name}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-bold text-neutral-700 mb-1">Problema Relatado</p>
                                <div className="p-3 border rounded-md text-sm text-neutral-600 italic bg-white">
                                    "{ticket.description}"
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Serviços e Peças Utilizadas</CardTitle>
                            <CardDescription>Verifique se os itens listados correspondem à realidade.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {ticket.items.length === 0 ? (
                                <p className="text-neutral-500 text-center py-4">Nenhum item listado pelo técnico.</p>
                            ) : (
                                ticket.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-start border-b pb-4 last:border-0 last:pb-0">
                                        <div className="flex gap-3">
                                            <div className="bg-blue-100 p-2 rounded h-fit text-blue-600 mt-1">
                                                {item.category === 'part_replacement' ? <Wrench className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{item.title}</p>
                                                <p className="text-sm text-neutral-500">{item.description}</p>

                                                {/* Photos Mockup */}
                                                <div className="flex gap-2 mt-2">
                                                    <div className="w-20 h-20 bg-neutral-100 rounded flex flex-col items-center justify-center text-neutral-300 text-xs gap-1 border border-dashed hover:border-blue-300 cursor-pointer">
                                                        <Camera className="w-4 h-4" /> Antes
                                                    </div>
                                                    <div className="w-20 h-20 bg-neutral-100 rounded flex flex-col items-center justify-center text-neutral-300 text-xs gap-1 border border-dashed hover:border-blue-300 cursor-pointer">
                                                        <Camera className="w-4 h-4" /> Depois
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right font-mono font-bold">
                                            R$ {item.estimatedValue.toFixed(2)}
                                        </div>
                                    </div>
                                ))
                            )}

                            <div className="flex justify-between items-center pt-4 border-t mt-4">
                                <span className="font-bold text-lg">Total do Serviço</span>
                                <span className="font-bold text-xl text-emerald-700">R$ {totalCost.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Actions */}
                <div className="space-y-6">
                    <Card className="border-emerald-100 bg-emerald-50/30">
                        <CardHeader>
                            <CardTitle className="text-emerald-800">Parecer Técnico</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Observações do Fiscal (Opcional)</label>
                                <Textarea
                                    className="bg-white"
                                    placeholder="Ex: Serviço realizado conforme esperado. Equipamento funcionando."
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                />
                            </div>

                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2 h-12 text-lg" onClick={handleApprove} disabled={isSubmitting}>
                                <CheckCircle2 className="w-5 h-5" />
                                APROVAR MANUTENÇÃO
                            </Button>

                            <Button variant="outline" className="w-full border-red-200 text-red-700 hover:bg-red-50 gap-2" onClick={handleReject} disabled={isSubmitting}>
                                <XCircle className="w-5 h-5" />
                                Rejeitar / Pedir Revisão
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100">
                        <p className="font-bold mb-1">Importante:</p>
                        <p>Ao aprovar, você confirma que o equipamento foi testado e está operando corretamente. O valor será liberado para faturamento da empresa contratada.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper icon
function Wrench({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>;
}
