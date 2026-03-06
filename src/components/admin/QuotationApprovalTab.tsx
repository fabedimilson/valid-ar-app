
"use client";

import { useAppStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, FileText, User, Calendar, ExternalLink, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function QuotationApprovalTab() {
    const { tickets, assets, currentUserId, approveQuotation } = useAppStore();

    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [password, setPassword] = useState("");
    const [isConfirming, setIsConfirming] = useState(false);

    const pendingTickets = tickets.filter(t => t.status === 'awaiting_approval');

    const handleApproveClick = (ticketId: string) => {
        setSelectedTicketId(ticketId);
        setIsConfirming(true);
    };

    const confirmApproval = () => {
        // In a real app, we would verify the password here or via server action
        if (password === "123456") { // Mock password
            if (selectedTicketId && currentUserId) {
                approveQuotation(selectedTicketId, currentUserId);
                toast.success("Cotação validada com sucesso! Execução autorizada.");
                setIsConfirming(false);
                setPassword("");
            }
        } else {
            toast.error("Senha incorreta. Ação não autorizada.");
        }
    };

    if (pendingTickets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed">
                <ShieldCheck className="w-12 h-12 mb-3" />
                <p className="font-medium">Nenhuma cotação pendente de aprovação.</p>
                <p className="text-xs">Novos orçamentos enviados pelas empresas aparecerão aqui.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2 px-1">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-800">Cotações Aguardando Aprovação (Fiscal de Contrato)</h3>
            </div>

            <div className="grid gap-6">
                {pendingTickets.map(ticket => {
                    const asset = assets.find(a => a.id === ticket.assetId);
                    return (
                        <Card key={ticket.id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="bg-slate-50/50 border-b pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="font-mono">{ticket.code ? `VOS ${String(ticket.code).padStart(6, '0')}` : `#${ticket.id.slice(0, 8)}`}</Badge>
                                            <span className="text-sm font-bold text-slate-900">{asset?.name}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> Aberto em: {new Date(ticket.openedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
                                        ANÁLISE DE PREÇO
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="mb-6">
                                    <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> Descrição do Problema / Necessidade
                                    </h4>
                                    <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 italic border border-slate-100">
                                        "{ticket.description}"
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-700">Resumo da Proposta (Validar Documentação em Anexo)</h4>
                                    <div className="bg-white border-2 border-slate-200 rounded-xl p-5 shadow-sm">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Valor Proposto pela Empresa</p>
                                                <p className="text-3xl font-black text-blue-700">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ticket.quotation?.totalValue || 0)}
                                                </p>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                                <Button
                                                    variant="outline"
                                                    className="gap-2 border-slate-300"
                                                    asChild
                                                >
                                                    <a href={ticket.quotation?.fileUrl} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="w-4 h-4" /> Visualizar 3 Cotações (PDF)
                                                    </a>
                                                </Button>

                                                <Button
                                                    className="bg-slate-900 hover:bg-blue-700 text-white gap-2"
                                                    onClick={() => handleApproveClick(ticket.id)}
                                                >
                                                    Autorizar Execução
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
                                            <ShieldCheck className="w-3 h-3" />
                                            <span>O fiscal deve validar se o valor acima é o menor entre as 3 cotações presentes no arquivo anexo.</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Dialog open={isConfirming} onOpenChange={setIsConfirming}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-blue-600" />
                            Confirmar Aprovação
                        </DialogTitle>
                        <DialogDescription>
                            Ao aprovar, você autoriza a execução do serviço pelo valor selecionado. Esta ação ficará vinculada ao seu usuário.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Confirme sua senha para validar</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="******"
                                autoFocus
                            />
                            <p className="text-[10px] text-slate-500 italic">* Dica de protótipo: use 123456</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirming(false)}>Cancelar</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={confirmApproval}>
                            Autenticar e Aprovar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
