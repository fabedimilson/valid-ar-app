"use client";

import { useAppStore } from "@/store/useStore";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export default function ReportPage() {
    const { ticketId } = useParams();
    const { tickets, assets, sectors, companies } = useAppStore();

    const ticket = tickets.find(t => t.id === ticketId);

    if (!ticket) return <div>Chamado não encontrado.</div>;

    const asset = assets.find(a => a.id === ticket.assetId);
    const sector = sectors.find(s => s.id === ticket.sectorId);
    const company = companies.find(c => c.id === ticket.companyId);

    const handlePrint = () => {
        window.print();
    };

    const total = ticket.items.reduce((acc, item) =>
        item.validationStatus === 'approved' ? acc + item.estimatedValue : acc
        , 0);

    return (
        <div className="min-h-screen bg-white text-black p-8 print:p-0">

            {/* Print Control (Hidden when printing) */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-end print:hidden">
                <Button onClick={handlePrint} className="gap-2">
                    <Printer className="w-4 h-4" /> Imprimir Relatório
                </Button>
            </div>

            <div className="max-w-4xl mx-auto border p-8 print:border-none print:p-0">

                {/* Header */}
                <div className="border-b pb-6 mb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-emerald-900">VOS</h1>
                        <p className="text-sm text-neutral-500 mt-1">Relatório de Conformidade Técnica</p>
                    </div>
                    <div className="text-right">
                        <p className="font-mono text-sm">CHAMADO: {ticket.id}</p>
                        <p className="text-sm text-neutral-500">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-8 mb-8 bg-neutral-50 p-4 rounded border">
                    <div>
                        <p className="text-xs uppercase font-bold text-neutral-400">Cliente / Local</p>
                        <p className="font-medium">IFAM CMC</p>
                        <p className="text-sm text-neutral-600">{sector?.name || 'Setor não informado'}</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase font-bold text-neutral-400">Equipamento</p>
                        <p className="font-medium">{asset?.name || 'Equipamento desconhecido'}</p>
                        <p className="text-sm text-neutral-600">Patrimônio: {asset?.patrimonyNumber || 'N/A'}</p>
                    </div>
                </div>

                {/* Detailed Items Table */}
                <div className="space-y-8">
                    <h2 className="text-lg font-bold border-l-4 border-emerald-500 pl-3">Detalhamento dos Serviços</h2>

                    {ticket.items.map((item, idx) => (
                        <div key={item.id} className="break-inside-avoid">
                            <div className="flex justify-between items-center mb-2 bg-neutral-100 p-2 rounded">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm font-bold opacity-50">#{idx + 1}</span>
                                    <span className="font-bold">{item.title}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded border ${item.validationStatus === 'approved'
                                        ? 'bg-green-100 text-green-700 border-green-200'
                                        : 'bg-red-100 text-red-700 border-red-200'
                                        }`}>
                                        {item.validationStatus === 'approved' ? 'CONFORME' : 'DIVERGENTE'}
                                    </span>
                                </div>
                                <div className="font-mono font-bold">R$ {item.estimatedValue.toFixed(2)}</div>
                            </div>

                            {/* Evidence Grid */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {/* Before */}
                                <div className="border rounded p-1">
                                    <p className="text-[10px] text-center font-bold mb-1">ANTES (Técnico)</p>
                                    {item.technicianPhotos.find(p => p.type === 'before') ? (
                                        <img src={item.technicianPhotos.find(p => p.type === 'before')!.url} className="w-full h-32 object-cover" />
                                    ) : <div className="h-32 bg-neutral-100 flex items-center justify-center text-[10px]">Sem Foto</div>}
                                </div>
                                {/* After */}
                                <div className="border rounded p-1">
                                    <p className="text-[10px] text-center font-bold mb-1">DEPOIS (Técnico)</p>
                                    {item.technicianPhotos.find(p => p.type === 'after') ? (
                                        <img src={item.technicianPhotos.find(p => p.type === 'after')!.url} className="w-full h-32 object-cover" />
                                    ) : <div className="h-32 bg-neutral-100 flex items-center justify-center text-[10px]">Sem Foto</div>}
                                </div>
                                {/* Inspection */}
                                <div className={`border rounded p-1 ${item.serverPhotos.length > 0 ? 'bg-blue-50/30' : ''}`}>
                                    <p className="text-[10px] text-center font-bold mb-1 text-blue-700">AUDITORIA (Fiscal)</p>
                                    {item.serverPhotos.length > 0 ? (
                                        <img src={item.serverPhotos[0].url} className="w-full h-32 object-cover" />
                                    ) : <div className="h-32 bg-neutral-50 flex items-center justify-center text-[10px] text-neutral-400 italic">Fiscal não anexou prova</div>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Totals */}
                <div className="mt-8 border-t pt-4">
                    <div className="flex justify-end">
                        <div className="w-64">
                            <div className="flex justify-between py-1">
                                <span className="text-sm">Total Cobrado</span>
                                <span className="font-mono">R$ {ticket.items.reduce((a, b) => a + b.estimatedValue, 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-1 text-red-600">
                                <span className="text-sm">Total Glosado (Rejeitado)</span>
                                <span className="font-mono">- R$ {ticket.items.reduce((a, b) => b.validationStatus === 'rejected' ? a + b.estimatedValue : a, 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-t mt-2 font-bold text-lg text-emerald-700">
                                <span>Total Aprovado</span>
                                <span>R$ {total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t text-center text-xs text-neutral-400">
                    <p>Gerado digitalmente por VOS - Validação de Ordem de Serviços</p>
                </div>
            </div>
        </div>
    );
}
