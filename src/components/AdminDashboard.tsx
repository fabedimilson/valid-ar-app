import { useAppStore } from "@/store/useStore";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminForms } from "@/components/admin/AdminForms";
import { AdminMaintenanceDashboard } from "@/components/admin/AdminMaintenanceDashboard";
import { Package, LayoutDashboard, Calendar, Database } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AdminDashboard() {
    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Package className="w-6 h-6 text-emerald-600 shrink-0" />
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800">
                        Painel Administrativo
                    </h2>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-slate-100/80 p-1 rounded-xl w-full md:w-auto overflow-x-auto justify-start inline-flex whitespace-nowrap hide-scrollbar">
                    <TabsTrigger value="overview" className="rounded-lg px-4 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <LayoutDashboard className="w-4 h-4" /> Visão Geral
                    </TabsTrigger>
                    <TabsTrigger value="maintenance" className="rounded-lg px-4 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Calendar className="w-4 h-4" /> Agenda Preventiva
                    </TabsTrigger>
                    <TabsTrigger value="management" className="rounded-lg px-4 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Database className="w-4 h-4" /> Gerenciamento
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 border-0 p-0 m-0">
                    <AdminAnalytics />
                </TabsContent>

                <TabsContent value="maintenance" className="space-y-6 border-0 p-0 m-0">
                    <AdminMaintenanceDashboard />
                </TabsContent>

                <TabsContent value="management" className="space-y-6 border-0 p-0 m-0">
                    <div className="bg-white rounded-xl p-6 border border-slate-200">
                        <h3 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
                            <Database className="w-5 h-5 text-blue-600" />
                            Configurações e Cadastros
                        </h3>
                        <AdminForms />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
