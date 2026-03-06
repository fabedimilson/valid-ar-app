
"use client";

import { useAppStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Briefcase, Package, ClipboardList, PenTool, CheckCircle2, TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AdminAnalytics() {
    const { assets, tickets } = useAppStore();

    const totalAssets = assets.length;
    const functioningAssets = assets.filter(a => a.status === 'ok').length;
    const healthPercentage = totalAssets > 0 ? Math.round((functioningAssets / totalAssets) * 100) : 0;

    return (
        <div className="space-y-4">
            {/* HERO: Compact & High Contrast - Light/Soft Theme */}
            <Card className="border border-emerald-100 shadow-sm bg-gradient-to-br from-white via-white to-emerald-50/50 overflow-hidden relative isolate">
                {/* Background Gradients - Subtle */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-300/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 z-[-1]"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-300/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 z-[-1]"></div>

                <CardContent className="p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-emerald-900/60 text-xs font-bold uppercase tracking-wider mb-1">Índice de Climatização</p>
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-5xl font-black tracking-tighter text-slate-800">
                                    {healthPercentage}%
                                </h2>
                                {healthPercentage >= 80 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                        EXCELENTE
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-500 text-xs mt-1 font-medium">
                                Equipamentos operando dentro dos padrões ideais.
                            </p>
                        </div>
                        {/* Dynamic Circular Indicator */}
                        <div className="relative h-14 w-14 flex items-center justify-center">
                            {/* SVG Ring */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                                {/* Track */}
                                <path
                                    className="text-slate-100"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                />
                                {/* Progress */}
                                <path
                                    className={`transition-all duration-1000 ease-out ${healthPercentage >= 80 ? 'text-emerald-500 drop-shadow-[0_0_2px_rgba(16,185,129,0.5)]' :
                                        healthPercentage >= 60 ? 'text-amber-500' : 'text-red-500'
                                        }`}
                                    strokeDasharray={`${healthPercentage}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                />
                            </svg>
                            {/* Icon Center */}
                            <span className="text-2xl relative z-10 animate-pulse-slow">🥶</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] items-center text-slate-400 font-bold uppercase">
                            <span>Eficiência da Rede</span>
                            <span>Meta: 80%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${healthPercentage >= 80 ? 'bg-emerald-500 shadow-sm' :
                                    healthPercentage >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                style={{ width: `${healthPercentage}%` }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* METRICS: Horizontal Cards (Bento Grid) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* 1. Patrimônio Total */}
                <MetricCard
                    label="Patrimônio"
                    value={totalAssets}
                    icon={Package}
                    bgClass="bg-blue-50"
                    iconColorClass="text-blue-600 bg-blue-100"
                />

                {/* 2. Serviços em Andamento (Active tickets) */}
                {(() => {
                    const inProgress = tickets.filter(t => t.status === 'in_progress').length;
                    return (
                        <MetricCard
                            label="Em Andamento"
                            value={inProgress}
                            icon={Briefcase}
                            bgClass="bg-indigo-50"
                            iconColorClass="text-indigo-600 bg-indigo-100"
                            highlight={inProgress > 0}
                        />
                    );
                })()}

                {/* 3. Aguardando Validação */}
                {(() => {
                    const waiting = tickets.filter(t => t.status === 'waiting_validation').length;
                    return (
                        <MetricCard
                            label="Pendente Validação"
                            value={waiting}
                            icon={AlertTriangle}
                            bgClass="bg-amber-50"
                            iconColorClass="text-amber-600 bg-amber-100"
                            highlight={waiting > 0}
                        />
                    );
                })()}

                {/* 4. Custos Validados (Real Money) */}
                {(() => {
                    const validatedTickets = tickets; // Consider all tickets, filter items
                    const totalCost = validatedTickets.reduce((acc, t) => {
                        return acc + (t.items || []).reduce((sum, item) => {
                            // Sum if item is approved (service executed and validated)
                            // If validationStatus is 'approved', use estimatedValue or validatedValue
                            if (item.validationStatus === 'approved') {
                                return sum + (item.validatedValue || item.estimatedValue || 0);
                            }
                            return sum;
                        }, 0);
                    }, 0);

                    // Format nicely
                    const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalCost);

                    return (
                        <MetricCard
                            label="Custo Validado"
                            valueDisplay={formatted} // Use specific prop for text value
                            // value={totalCost} // Pass number for semantics if needed, but display overrides
                            icon={TrendingUp}
                            bgClass="bg-emerald-50"
                            iconColorClass="text-emerald-600 bg-emerald-100"
                        />
                    );
                })()}
            </div>
        </div>
    );
}

// Compact Horizontal Card
function MetricCard({ label, value, valueDisplay, subValue, icon: Icon, bgClass, highlight, iconColorClass, subValueClass }: any) {
    return (
        <Card className={`border-0 shadow-sm ${bgClass} relative overflow-hidden`}>
            <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4">

                {/* Icon Left */}
                <div className={`flex-shrink-0 w-10 h-10 md:w-14 md:h-14 rounded-xl flex items-center justify-center ${iconColorClass}`}>
                    <Icon className="w-5 h-5 md:w-7 md:h-7" />
                </div>

                {/* Content Right */}
                <div className="flex flex-col min-w-0">
                    <span className={`text-2xl md:text-4xl font-black tracking-tighter leading-none ${highlight ? 'text-amber-700' : 'text-slate-800'}`}>
                        {valueDisplay || value}
                    </span>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-500 truncate mt-1">
                        {label}
                    </span>

                    {/* Optional Badge */}
                    {subValue && (
                        <span className={`absolute top-2 right-2 md:top-3 md:right-3 text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full ${subValueClass || 'bg-slate-200 text-slate-600'}`}>
                            {subValue}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
