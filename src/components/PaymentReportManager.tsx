"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    DollarSign, FileText, CheckCircle2, AlertCircle, Loader2,
    Wrench, Calendar, Building2, Download, Printer, ClipboardList
} from "lucide-react";
import { toast } from "sonner";
import { setTicketTotalValueAction, getValidatedTicketsAction, getPaymentReportDataAction } from "@/app/actions/server-actions";

// ─── Types ───────────────────────────────────────────────────────────────────

interface OSItem {
    id: string;
    code: number;
    type: "corrective" | "preventive";
    description: string;
    assetName?: string;
    patrimonyNumber?: string;
    sectorName?: string;
    closedAt: string;
    totalValue: number | null;
    items: { title: string; price: number; quantity: number }[];
}

interface ReportData {
    month: number;
    year: number;
    preventiveTickets: OSItem[];
    correctiveTickets: OSItem[];
    preventiveTotal: number;
    correctiveTotal: number;
    grandTotal: number;
}

const MONTHS_PT = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

function fmtCurrency(v: number) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(s: string) {
    return new Date(s).toLocaleDateString("pt-BR");
}

// ─── OS Value Entry Panel ─────────────────────────────────────────────────────

function OSValueEntry() {
    const [osList, setOsList] = useState<OSItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [values, setValues] = useState<Record<string, string>>({});

    useEffect(() => {
        loadOS();
    }, []);

    async function loadOS() {
        setLoading(true);
        const result = await getValidatedTicketsAction();
        if (result.success) {
            const list = result.tickets as OSItem[];
            setOsList(list);
            // Pre-populate with existing values
            const init: Record<string, string> = {};
            list.forEach((os) => {
                if (os.totalValue !== null) init[os.id] = String(os.totalValue);
            });
            setValues(init);
        }
        setLoading(false);
    }

    async function handleSave(osId: string) {
        const raw = values[osId];
        const val = parseFloat(raw?.replace(",", ".") || "0");
        if (isNaN(val) || val < 0) {
            toast.error("Valor inválido. Digite um número positivo.");
            return;
        }
        setSaving(osId);
        const result = await setTicketTotalValueAction(osId, val);
        if (result.success) {
            toast.success("Valor salvo com sucesso!");
            setOsList((prev) => prev.map((os) => os.id === osId ? { ...os, totalValue: val } : os));
        } else {
            toast.error("Erro ao salvar o valor.");
        }
        setSaving(null);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                <span className="font-medium animate-pulse">Carregando OS concluídas...</span>
            </div>
        );
    }

    if (osList.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <ClipboardList className="h-10 w-10 opacity-30" />
                <p className="text-sm font-medium">Nenhuma OS de reparo concluída encontrada.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex gap-3 text-indigo-800 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 text-indigo-500" />
                <p>
                    Abaixo estão listadas as OS de reparo (<strong>Corretivas</strong>) validadas pelo fiscal de setor.
                    Insira o valor total cobrado em cada intervenção (conforme fechamento comercial).
                    As preventivas já possuem valor fixado pelo serviço licitado e não necessitam de preenchimento.
                </p>
            </div>

            {osList.map((os) => {
                const hasValue = os.totalValue !== null;
                const isDirty = values[os.id] !== undefined && values[os.id] !== String(os.totalValue ?? "");

                return (
                    <div
                        key={os.id}
                        className={`rounded-xl border p-4 transition-all hover:shadow-md ${hasValue
                            ? "bg-emerald-50/50 border-emerald-200"
                            : "bg-white border-slate-200"
                            }`}
                    >
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                            {/* Info */}
                            <div className="space-y-1.5 min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200 font-bold tracking-wide">
                                        OS VOS-{String(os.code).padStart(6, '0')}
                                    </Badge>
                                    <Badge variant="outline" className="text-slate-600 bg-slate-50 uppercase text-[10px]">
                                        Corretiva
                                    </Badge>
                                    {hasValue && (
                                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                                            <CheckCircle2 className="h-3 w-3 mr-1" /> Valor lançado
                                        </Badge>
                                    )}
                                </div>
                                <h3 className="text-base font-bold text-slate-800 line-clamp-1">
                                    {os.assetName || "Equipamento"}
                                </h3>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{os.patrimonyNumber}</span>
                                    <span>·</span>
                                    <span className="font-medium">{os.sectorName}</span>
                                    <span>·</span>
                                    <span>Concluída em {fmtDate(os.closedAt)}</span>
                                </div>
                                <p className="text-xs text-slate-600 italic mt-1 line-clamp-2 bg-slate-50 p-2 rounded border border-slate-100">
                                    "{os.description}"
                                </p>
                            </div>

                            {/* Value Input */}
                            <div className="flex items-center gap-2 shrink-0 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Valor Final</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">R$</span>
                                        <Input
                                            type="text"
                                            inputMode="decimal"
                                            placeholder="0,00"
                                            value={values[os.id] ?? (os.totalValue !== null ? String(os.totalValue) : "")}
                                            onChange={(e) => setValues((prev) => ({ ...prev, [os.id]: e.target.value }))}
                                            className="pl-9 w-36 h-10 text-base font-bold bg-white border-slate-300 text-slate-800 focus:ring-indigo-500 focus:border-indigo-500 text-right"
                                        />
                                    </div>
                                </div>
                                <Button
                                    size="lg"
                                    disabled={saving === os.id || (!isDirty && hasValue)}
                                    onClick={() => handleSave(os.id)}
                                    className={`mt-5 ${hasValue && !isDirty
                                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                                        }`}
                                >
                                    {saving === os.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : hasValue && !isDirty ? (
                                        <CheckCircle2 className="h-4 w-4" />
                                    ) : (
                                        "Salvar"
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Items */}
                        {os.items.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-100">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                                    Peças / Serviços Registrados na OS:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {os.items.map((item, i) => (
                                        <span key={i} className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 font-medium rounded-md border border-slate-200">
                                            {item.quantity > 1 && <span className="font-bold mr-1">{item.quantity}×</span>}
                                            {item.title}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Payment Report ───────────────────────────────────────────────────────────

function PaymentReportPanel() {
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [year, setYear] = useState(today.getFullYear());
    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    async function handleGenerate() {
        setLoading(true);
        const data = await getPaymentReportDataAction(month, year);
        setReport(data as ReportData);
        setLoading(false);
    }

    function handlePrint() {
        if (!report) return;

        const fileName = `Relatorio_Pagamento_${MONTHS_PT[month - 1]}_${year}`;
        const now = new Date().toLocaleString("pt-BR");
        const monthLabel = `${MONTHS_PT[report.month - 1]} / ${report.year}`;

        const preventiveRows = report.preventiveTickets.map(os => {
            const total = os.items.reduce((s, it) => s + it.price * it.quantity, 0);
            return `
            <tr>
              <td style="font-family:monospace;font-size:10px;color:#6366f1;font-weight:700;padding:9px 12px;border-bottom:1px solid #f1f5f9;">VOS-${String(os.code).padStart(6, '0')}</td>
              <td style="padding:9px 12px;border-bottom:1px solid #f1f5f9;">
                <div style="font-weight:700;color:#1e293b;font-size:11px;">${os.assetName || '—'}</div>
                <div style="font-size:9px;color:#94a3b8;margin-top:2px;">${os.description}</div>
              </td>
              <td style="padding:9px 12px;border-bottom:1px solid #f1f5f9;color:#475569;font-size:10px;">${os.sectorName || '—'}</td>
              <td style="padding:9px 12px;border-bottom:1px solid #f1f5f9;font-size:9px;color:#64748b;">${fmtDate(os.closedAt)}</td>
              <td style="padding:9px 12px;border-bottom:1px solid #f1f5f9;text-align:right;">
                <span style="display:inline-block;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:5px;padding:2px 9px;font-weight:700;font-size:11px;">${fmtCurrency(total)}</span>
              </td>
            </tr>`;
        }).join('');

        const correctiveRows = report.correctiveTickets.map(os => {
            return `
            <tr>
              <td style="font-family:monospace;font-size:10px;color:#f97316;font-weight:700;padding:9px 12px;border-bottom:1px solid #f1f5f9;">VOS-${String(os.code).padStart(6, '0')}</td>
              <td style="padding:9px 12px;border-bottom:1px solid #f1f5f9;">
                <div style="font-weight:700;color:#1e293b;font-size:11px;">${os.assetName || '—'}</div>
                <div style="font-size:9px;color:#94a3b8;margin-top:2px;">${os.description}</div>
              </td>
              <td style="padding:9px 12px;border-bottom:1px solid #f1f5f9;color:#475569;font-size:10px;">${os.sectorName || '—'}</td>
              <td style="padding:9px 12px;border-bottom:1px solid #f1f5f9;font-size:9px;color:#64748b;">${fmtDate(os.closedAt)}</td>
              <td style="padding:9px 12px;border-bottom:1px solid #f1f5f9;text-align:right;">
                ${os.totalValue !== null
                    ? `<span style="display:inline-block;background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;border-radius:5px;padding:2px 9px;font-weight:700;font-size:11px;">${fmtCurrency(os.totalValue)}</span>`
                    : `<span style="display:inline-block;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:5px;padding:2px 9px;font-weight:700;font-size:9px;">⚠ Falta Lançar</span>`
                }
              </td>
            </tr>`;
        }).join('');

        const theadStyle = `style="background:#f8fafc;border-bottom:2px solid #e2e8f0;"`;
        const thStyle = `style="text-align:left;padding:8px 12px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#475569;"`;
        const thRStyle = `style="text-align:right;padding:8px 12px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#475569;"`;

        const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>${fileName}</title>
  <style>
    @page { size: A4 portrait; margin: 14mm 12mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 11px; color: #1e293b; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    table { width: 100%; border-collapse: collapse; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div style="background:linear-gradient(135deg,#1e293b 0%,#334155 100%);padding:22px 26px;border-radius:10px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:flex-start;">
    <div>
      <div style="font-size:8px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.15em;margin-bottom:6px;">Sistema de Gestão e Transparência — ValidAr</div>
      <h1 style="font-size:19px;font-weight:900;color:#fff;margin-bottom:6px;">Relatório Consolidado de Pagamento</h1>
      <div style="display:flex;align-items:center;gap:10px;margin-top:4px;">
        <span style="display:inline-block;background:rgba(99,102,241,.3);color:#c7d2fe;border:1px solid rgba(99,102,241,.5);border-radius:20px;padding:2px 12px;font-size:10px;font-weight:700;">${monthLabel}</span>
        <span style="font-size:10px;color:#94a3b8;">Preventivos e Corretivos Validados</span>
      </div>
    </div>
    <div style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:11px 16px;text-align:right;min-width:160px;">
      <div style="font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px;">Emitido em</div>
      <div style="font-family:monospace;font-size:10px;color:#e2e8f0;">${now}</div>
    </div>
  </div>

  <!-- SUMMARY CARDS -->
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:24px;">

    <div style="border-radius:10px;overflow:hidden;border:1px solid #bfdbfe;">
      <div style="background:#dbeafe;padding:8px 16px;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#1d4ed8;border-bottom:1px solid #bfdbfe;">
        Subtotal Preventivas
      </div>
      <div style="background:#fff;padding:14px 16px;">
        <div style="font-size:22px;font-weight:900;color:#1d4ed8;">${fmtCurrency(report.preventiveTotal)}</div>
        <div style="font-size:10px;color:#64748b;margin-top:3px;">${report.preventiveTickets.length} OS atendida(s)</div>
      </div>
    </div>

    <div style="border-radius:10px;overflow:hidden;border:1px solid #fed7aa;">
      <div style="background:#ffedd5;padding:8px 16px;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#c2410c;border-bottom:1px solid #fed7aa;">
        Subtotal Corretivas
      </div>
      <div style="background:#fff;padding:14px 16px;">
        <div style="font-size:22px;font-weight:900;color:#c2410c;">${fmtCurrency(report.correctiveTotal)}</div>
        <div style="font-size:10px;color:#64748b;margin-top:3px;">${report.correctiveTickets.length} OS reparo(s)</div>
      </div>
    </div>

    <div style="border-radius:10px;overflow:hidden;border:2px solid #10b981;box-shadow:0 2px 8px rgba(16,185,129,.15);">
      <div style="background:#10b981;padding:8px 16px;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#ecfdf5;border-bottom:1px solid #059669;display:flex;justify-content:space-between;align-items:center;">
        <span>Total Geral a Pagar</span> <span>✓</span>
      </div>
      <div style="background:#f0fdf4;padding:14px 16px;">
        <div style="font-size:26px;font-weight:900;color:#059669;">${fmtCurrency(report.grandTotal)}</div>
        <div style="font-size:9px;font-weight:700;color:#6ee7b7;text-transform:uppercase;letter-spacing:.08em;margin-top:3px;">Soma do Período</div>
      </div>
    </div>

  </div>

  <hr style="border:none;border-top:1px dashed #cbd5e1;margin:0 0 22px;"/>

  <!-- PREVENTIVE TABLE -->
  <div style="margin-bottom:26px;">
    <div style="display:inline-flex;align-items:center;gap:6px;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:6px;padding:5px 14px;font-size:11px;font-weight:700;margin-bottom:12px;">
      📅 Demonstrativo de Preventivas
    </div>
    ${report.preventiveTickets.length === 0
                ? `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:14px 18px;color:#94a3b8;font-style:italic;font-size:10px;">Não constam registros de OS preventivas validadas neste período.</div>`
                : `<div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
        <table>
          <thead><tr ${theadStyle}>
            <th ${thStyle} style="width:110px;text-align:left;padding:8px 12px;font-size:9px;font-weight:700;text-transform:uppercase;color:#475569;">Nº OS</th>
            <th ${thStyle}>Equipamento</th>
            <th ${thStyle}>Localização</th>
            <th ${thStyle}>Data</th>
            <th ${thRStyle}>Valor Catálogo</th>
          </tr></thead>
          <tbody>${preventiveRows}</tbody>
          <tfoot><tr style="background:#eff6ff;border-top:2px solid #bfdbfe;">
            <td colspan="4" style="padding:10px 12px;text-align:right;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#1d4ed8;">Subtotal Preventivas:</td>
            <td style="padding:10px 12px;text-align:right;font-size:15px;font-weight:900;color:#1d4ed8;">${fmtCurrency(report.preventiveTotal)}</td>
          </tr></tfoot>
        </table>
      </div>`
            }
  </div>

  <!-- CORRECTIVE TABLE -->
  <div style="margin-bottom:26px;">
    <div style="display:inline-flex;align-items:center;gap:6px;background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;border-radius:6px;padding:5px 14px;font-size:11px;font-weight:700;margin-bottom:12px;">
      🔧 Demonstrativo de Corretivas (Reparos)
    </div>
    ${report.correctiveTickets.length === 0
                ? `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:14px 18px;color:#94a3b8;font-style:italic;font-size:10px;">Não constam registros de OS corretivas validadas neste período.</div>`
                : `<div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
        <table>
          <thead><tr ${theadStyle}>
            <th ${thStyle} style="width:110px;text-align:left;padding:8px 12px;font-size:9px;font-weight:700;text-transform:uppercase;color:#475569;">Nº OS</th>
            <th ${thStyle}>Equipamento Reparado</th>
            <th ${thStyle}>Localização</th>
            <th ${thStyle}>Data</th>
            <th ${thRStyle}>Valor Informado</th>
          </tr></thead>
          <tbody>${correctiveRows}</tbody>
          <tfoot><tr style="background:#fff7ed;border-top:2px solid #fed7aa;">
            <td colspan="4" style="padding:10px 12px;text-align:right;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#c2410c;">Subtotal Corretivas:</td>
            <td style="padding:10px 12px;text-align:right;font-size:15px;font-weight:900;color:#c2410c;">${fmtCurrency(report.correctiveTotal)}</td>
          </tr></tfoot>
        </table>
      </div>`
            }
  </div>

  <!-- GRAND TOTAL BAR -->
  <div style="background:linear-gradient(90deg,#059669,#10b981);border-radius:10px;padding:16px 22px;display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
    <div style="color:#ecfdf5;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;">Total Consolidado do Período</div>
    <div style="color:#fff;font-size:24px;font-weight:900;">${fmtCurrency(report.grandTotal)}</div>
  </div>

  <!-- FOOTER -->
  <div style="text-align:center;padding-top:14px;border-top:1px solid #e2e8f0;font-size:9px;color:#94a3b8;line-height:1.6;">
    Este documento possui validade para conferência administrativa entre as partes.<br/>
    Os valores preventivos são baseados nos preços do catálogo do pregão. Os corretivos foram lançados manualmente pelo técnico líder.<br/>
    Os valores estão sujeitos à aprovação final pelo fiscal do contrato.<br/>
    <strong style="color:#64748b;">Emitido em: ${now} — Sistema ValidAr</strong>
  </div>

</body>
</html>`;

        const printWindow = window.open("", "_blank", "width=1100,height=860");
        if (!printWindow) {
            toast.error("Bloqueio de pop-up detectado. Permita pop-ups para este site e tente novamente.");
            return;
        }

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
            toast.success("Diálogo de impressão aberto. Selecione 'Salvar como PDF'.");
        }, 700);
    }



    const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-wrap gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-1.5 flex-1 min-w-[200px] max-w-[240px]">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mês Base</label>
                    <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                        <SelectTrigger className="h-11 bg-white border-slate-300 text-slate-800 text-sm font-semibold focus:ring-indigo-500">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200">
                            {MONTHS_PT.map((m, i) => (
                                <SelectItem key={i} value={String(i + 1)} className="font-medium cursor-pointer">{m}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5 w-[120px]">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ano</label>
                    <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                        <SelectTrigger className="h-11 bg-white border-slate-300 text-slate-800 text-sm font-semibold focus:ring-indigo-500">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200">
                            {years.map((y) => (
                                <SelectItem key={y} value={String(y)} className="font-medium cursor-pointer">{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleGenerate} disabled={loading} className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                    {loading ? "Processando..." : "Gerar Relatório Resumo"}
                </Button>
            </div>

            {/* Report Preview */}
            {report && (
                <div className="space-y-4">
                    <div className="flex justify-end pr-2">
                        <Button onClick={handlePrint} variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-bold">
                            <Download className="h-4 w-4 mr-2" />
                            Salvar em PDF
                        </Button>
                    </div>

                    <div
                        ref={reportRef}
                        className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
                        style={{ fontFamily: "sans-serif" }}
                    >
                        {/* Report Header */}
                        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-6 border-b border-slate-200">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">Relatório Consolidado de Pagamento</h2>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge className="bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/20 border-indigo-500/30 font-bold">
                                            {MONTHS_PT[report.month - 1]} / {report.year}
                                        </Badge>
                                        <span className="text-sm text-slate-400 font-medium tracking-wide">
                                            Serviços Preventivos e Corretivos Validados
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 backdrop-blur-sm">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Emitido Em</p>
                                    <p className="text-sm font-mono font-medium text-slate-200">{new Date().toLocaleString("pt-BR")}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-3 gap-6">
                                <div className="rounded-xl border border-blue-100 bg-white shadow-sm overflow-hidden">
                                    <div className="bg-blue-50 py-2 px-4 border-b border-blue-100 font-bold text-xs uppercase text-blue-800 tracking-wider">
                                        Subtotal Preventivas
                                    </div>
                                    <div className="p-4">
                                        <p className="text-2xl font-black text-blue-700">{fmtCurrency(report.preventiveTotal)}</p>
                                        <p className="text-sm font-medium text-slate-500 mt-1">{report.preventiveTickets.length} OS Atendidas</p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-orange-100 bg-white shadow-sm overflow-hidden">
                                    <div className="bg-orange-50 py-2 px-4 border-b border-orange-100 font-bold text-xs uppercase text-orange-800 tracking-wider">
                                        Subtotal Corretivas
                                    </div>
                                    <div className="p-4">
                                        <p className="text-2xl font-black text-orange-600">{fmtCurrency(report.correctiveTotal)}</p>
                                        <p className="text-sm font-medium text-slate-500 mt-1">{report.correctiveTickets.length} OS Reparos</p>
                                    </div>
                                </div>

                                <div className="rounded-xl border-2 border-emerald-500 bg-white shadow-md overflow-hidden transform scale-[1.02]">
                                    <div className="bg-emerald-500 py-2 px-4 font-bold text-xs uppercase text-emerald-50 tracking-wider flex justify-between items-center">
                                        <span>Total Geral a Pagar</span>
                                        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                                    </div>
                                    <div className="p-5">
                                        <p className="text-3xl font-black text-emerald-700">{fmtCurrency(report.grandTotal)}</p>
                                        <p className="text-xs font-bold text-emerald-600/60 uppercase tracking-widest mt-1">Soma do Período</p>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100 border-dashed" />

                            {/* Preventive Table */}
                            <div>
                                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4 bg-blue-50 w-fit px-3 py-1 rounded-md text-blue-800 border border-blue-100">
                                    <Calendar className="h-4 w-4" />
                                    Demonstrativo de Preventivas
                                </h3>
                                {report.preventiveTickets.length === 0 ? (
                                    <p className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-lg border border-slate-100">Não constam registros de OS preventivas validadas neste período.</p>
                                ) : (
                                    <div className="rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                                    <th className="text-left px-4 py-3 font-bold uppercase text-[10px] tracking-widest w-24">Ordem</th>
                                                    <th className="text-left px-4 py-3 font-bold uppercase text-[10px] tracking-widest">Equipamento referenciado</th>
                                                    <th className="text-left px-4 py-3 font-bold uppercase text-[10px] tracking-widest hidden md:table-cell">Setor / Local</th>
                                                    <th className="text-right px-4 py-3 font-bold uppercase text-[10px] tracking-widest w-36">Catálogo Base</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {report.preventiveTickets.map((os) => {
                                                    const itemsTotal = os.items.reduce((s, it) => s + it.price * it.quantity, 0);
                                                    return (
                                                        <tr key={os.id} className="hover:bg-slate-50/50">
                                                            <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-500">VOS-{String(os.code).padStart(6, '0')}</td>
                                                            <td className="px-4 py-3">
                                                                <p className="font-bold text-slate-800">{os.assetName}</p>
                                                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{os.description}</p>
                                                            </td>
                                                            <td className="px-4 py-3 text-slate-600 font-medium hidden md:table-cell">{os.sectorName}</td>
                                                            <td className="px-4 py-3 text-right">
                                                                <span className="font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                                                    {fmtCurrency(itemsTotal)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                            <tfoot>
                                                <tr className="border-t-2 border-slate-200 bg-blue-50/50">
                                                    <td colSpan={3} className="px-4 py-3 text-right text-[11px] uppercase tracking-widest font-bold text-slate-500">Subtotal Preventivas:</td>
                                                    <td className="px-4 py-3 text-right text-lg font-black text-blue-700">{fmtCurrency(report.preventiveTotal)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Corrective Table */}
                            <div>
                                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4 bg-orange-50 w-fit px-3 py-1 rounded-md text-orange-800 border border-orange-100 mt-8">
                                    <Wrench className="h-4 w-4" />
                                    Demonstrativo de Corretivas (Reparos)
                                </h3>
                                {report.correctiveTickets.length === 0 ? (
                                    <p className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-lg border border-slate-100">Não constam registros de OS corretivas validadas neste período.</p>
                                ) : (
                                    <div className="rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                                    <th className="text-left px-4 py-3 font-bold uppercase text-[10px] tracking-widest w-24">Ordem</th>
                                                    <th className="text-left px-4 py-3 font-bold uppercase text-[10px] tracking-widest">Equipamento Reparado</th>
                                                    <th className="text-left px-4 py-3 font-bold uppercase text-[10px] tracking-widest hidden md:table-cell">Setor / Local</th>
                                                    <th className="text-right px-4 py-3 font-bold uppercase text-[10px] tracking-widest w-40">Valor Informado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {report.correctiveTickets.map((os) => (
                                                    <tr key={os.id} className="hover:bg-slate-50/50">
                                                        <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-500">VOS-{String(os.code).padStart(6, '0')}</td>
                                                        <td className="px-4 py-3">
                                                            <p className="font-bold text-slate-800">{os.assetName}</p>
                                                            <p className="text-xs text-slate-500 mt-0.5 max-w-[300px] truncate" title={os.description}>{os.description}</p>
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-600 font-medium hidden md:table-cell">{os.sectorName}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            {os.totalValue !== null ? (
                                                                <span className="font-bold text-orange-700 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                                                                    {fmtCurrency(os.totalValue)}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] font-bold tracking-wider uppercase text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100 flex justify-end items-center gap-1.5 w-max ml-auto">
                                                                    <AlertCircle className="w-3 h-3" /> Falta Lançar
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="border-t-2 border-slate-200 bg-orange-50/50">
                                                    <td colSpan={3} className="px-4 py-3 text-right text-[11px] uppercase tracking-widest font-bold text-slate-500">Subtotal Corretivas:</td>
                                                    <td className="px-4 py-3 text-right text-lg font-black text-orange-600">{fmtCurrency(report.correctiveTotal)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div className="pt-8 text-center border-t border-slate-200">
                                <p className="text-xs text-slate-400 font-medium">
                                    Este documento possui validade para conferência administrativa entre as partes.
                                    Os valores estão sujeitos à aprovação final pelo fiscal do contrato.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export function PaymentReportManager({ isManager }: { isManager: boolean }) {
    const [tab, setTab] = useState<"values" | "report">("values");

    if (!isManager) return null;

    return (
        <div className="space-y-6">
            {/* Tab toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl w-fit shadow-inner">
                <button
                    onClick={() => setTab("values")}
                    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg transition-all ${tab === "values"
                        ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                        }`}
                >
                    <DollarSign className="h-4 w-4" /> Lançar Preços de Corretiva
                </button>
                <button
                    onClick={() => setTab("report")}
                    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg transition-all ${tab === "report"
                        ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                        }`}
                >
                    <FileText className="h-4 w-4" /> Emitir Relatório PDF
                </button>
            </div>

            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                    <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        {tab === "values" ? (
                            <><DollarSign className="h-5 w-5 text-indigo-600" /> Fechamento de Corretivas</>
                        ) : (
                            <><FileText className="h-5 w-5 text-indigo-600" /> Resumo de Pagamentos</>
                        )}
                    </CardTitle>
                    <CardDescription className="text-slate-500 text-sm font-medium">
                        {tab === "values"
                            ? "Para cada corretiva (reparo) aprovada, informe o valor da cotação vencedora escolhida."
                            : "Verifique o subtotal mensal de horas preventivas tabeladas e corretivas aprovadas."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    {tab === "values" ? <OSValueEntry /> : <PaymentReportPanel />}
                </CardContent>
            </Card>
        </div>
    );
}
