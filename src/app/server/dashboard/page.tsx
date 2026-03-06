
"use client";

import { useAppStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, MapPin, History } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function ServerDashboard() {
    const { tickets, assets, sectors } = useAppStore();

    // Show only tickets relevant to validation flow or completed
    const activeTickets = tickets.filter(t => t.status === 'waiting_validation' || t.status === 'validated');

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            <header className="bg-white dark:bg-neutral-900 border-b px-4 py-4 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="-ml-2">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="font-bold text-lg">Validações Pendentes</h1>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 space-y-4">
                {activeTickets.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">Nenhuma solicitação pendente.</div>
                ) : (
                    activeTickets.map(ticket => {
                        const asset = assets.find(a => a.id === ticket.assetId);
                        const sector = sectors.find(s => s.id === ticket.sectorId);

                        // History of this asset
                        const assetHistory = tickets.filter(t => t.assetId === ticket.assetId && t.status === 'validated');

                        return (
                            <div key={ticket.id} className="relative group">
                                <Link href={`/server/validate/${ticket.id}`} className="block">
                                    <Card className="hover:border-emerald-500 transition-colors cursor-pointer border-l-4 border-l-amber-400 shadow-sm">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="font-mono text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">
                                                        #{ticket.code ? `VOS ${String(ticket.code).padStart(6, '0')}` : ticket.id.slice(0, 8)}
                                                    </span>
                                                    <CardTitle className="text-base text-emerald-950">{asset?.name || "Equipamento Desconhecido"}</CardTitle>
                                                </div>
                                                {ticket.status === 'waiting_validation' && (
                                                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0">Aguardando Validação</Badge>
                                                )}
                                                {ticket.status === 'validated' && (
                                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">Validado</Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center text-xs text-muted-foreground gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {sector?.name || "Setor Invalido"} • {asset?.patrimonyNumber}
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-muted-foreground flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(ticket.updatedAt).toLocaleDateString()}
                                                </span>
                                                <div className="flex gap-2 items-center">
                                                    <span className="font-bold text-emerald-700 group-hover:underline flex items-center gap-1">
                                                        Validar <ArrowRight className="w-4 h-4" />
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-3 text-xs text-neutral-600 bg-neutral-100 p-2 rounded border border-neutral-200">
                                                <span className="font-bold">Solicitação:</span> "{ticket.description}"
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>

                                {/* History Button overlay or separate action */}
                                <div className="absolute top-2 right-2  bg-white/80 backdrop-blur rounded-full"></div>
                                <div className="mt-1 flex justify-end px-1">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-6 text-[10px] text-neutral-400 hover:text-emerald-600">
                                                <History className="w-3 h-3 mr-1" />
                                                Ver Histórico de OS ({assetHistory.length})
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Histérico de Manutenções</DialogTitle>
                                                <p className="text-sm text-muted-foreground">{asset?.name} - {asset?.patrimonyNumber}</p>
                                            </DialogHeader>
                                            <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-2">
                                                {assetHistory.length === 0 ? (
                                                    <div className="text-center text-sm text-neutral-400 py-4">Nenhum histórico anterior.</div>
                                                ) : (
                                                    assetHistory.map(h => (
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
                            </div>
                        )
                    })
                )}
            </main>
        </div>
    );
}
