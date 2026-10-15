import { useAppStore } from "@/store/useStore";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminForms } from "@/components/admin/AdminForms";
import { AdminMaintenanceDashboard } from "@/components/admin/AdminMaintenanceDashboard";
import { Package, LayoutDashboard, Calendar, Database, DollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentReportManager } from "@/components/PaymentReportManager";

export function AdminDashboard() {
    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        Painel de Gestão e Fiscalização
                    </h2>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-slate-100 dark:bg-neutral-900 border-2 border-slate-300 dark:border-neutral-800 p-1 rounded-xl w-full md:w-auto overflow-x-auto justify-start inline-flex whitespace-nowrap hide-scrollbar shadow-2xs">
                    <TabsTrigger value="overview" className="rounded-lg px-4 py-2 gap-2 font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-xs">
                        <LayoutDashboard className="w-4 h-4" /> Visão Geral
                    </TabsTrigger>
                    <TabsTrigger value="maintenance" className="rounded-lg px-4 py-2 gap-2 font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-xs">
                        <Calendar className="w-4 h-4" /> Agenda Preventiva
                    </TabsTrigger>
                    <TabsTrigger value="finance" className="rounded-lg px-4 py-2 gap-2 font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-xs text-emerald-700 dark:text-emerald-400">
                        <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Financeiro
                    </TabsTrigger>
                    <TabsTrigger value="management" className="rounded-lg px-4 py-2 gap-2 font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-xs">
                        <Database className="w-4 h-4" /> Gerenciamento
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 border-0 p-0 m-0">
                    <AdminAnalytics />
                </TabsContent>

                <TabsContent value="maintenance" className="space-y-6 border-0 p-0 m-0">
                    <AdminMaintenanceDashboard />
                </TabsContent>

                <TabsContent value="finance" className="space-y-6 border-0 p-0 m-0">
                    <PaymentReportManager />
                </TabsContent>

                <TabsContent value="management" className="space-y-6 border-0 p-0 m-0">
                    <div className="bg-white dark:bg-neutral-950 rounded-2xl p-6 border-2 border-slate-300 dark:border-neutral-800 shadow-xs">
                        <h3 className="text-lg font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            Configurações e Cadastros
                        </h3>
                        <AdminForms />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
