"use client";
import { useAppStore } from "@/store/useStore";

export default function DebugPage() {
    const { companies, sectors } = useAppStore();
    return (
        <div className="p-4 font-mono text-xs">
            <h1 className="text-xl font-bold mb-4">Debug do Estado da Aplicação</h1>

            <h2 className="text-lg font-bold mt-4">Empresas e Técnicos (Raw JSON)</h2>
            <div className="bg-slate-100 p-2 overflow-auto max-h-96 border rounded">
                <pre>{JSON.stringify(companies, null, 2)}</pre>
            </div>

            <h2 className="text-lg font-bold mt-4">Setores (Raw JSON)</h2>
            <div className="bg-slate-100 p-2 overflow-auto max-h-96 border rounded">
                <pre>{JSON.stringify(sectors, null, 2)}</pre>
            </div>
        </div>
    );
}
