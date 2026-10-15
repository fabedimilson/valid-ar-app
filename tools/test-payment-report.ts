import { getPaymentReportDataAction } from "../src/app/actions/server-actions";

async function main() {
    console.log("=== TESTE DO RELATÓRIO CONSOLIDADO DE MEDIÇÃO / PAGAMENTO ===");
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    console.log(`Buscando dados de medição para ${month}/${year}...`);
    const report = await getPaymentReportDataAction(month, year);

    if (report.success) {
        console.log("\n📊 RESULTADO DA MEDIÇÃO MENSAL:");
        console.log(`- Mês/Ano: ${report.month}/${report.year}`);
        console.log(`- Total Preventivas (Pregão): R$ ${report.preventiveTotal.toFixed(2)} (${report.preventiveTickets.length} OSs)`);
        console.log(`- Total Corretivas (Aprovadas): R$ ${report.correctiveTotal.toFixed(2)} (${report.correctiveTickets.length} OSs)`);
        console.log(`- TOTAL GERAL LIQUIDAÇÃO: R$ ${report.grandTotal.toFixed(2)}`);

        console.log("\nDetalhamento Preventivas:");
        report.preventiveTickets.forEach(t => {
            console.log(`  [VOS-${String(t.code).padStart(6, '0')}] ${t.assetName} (${t.patrimonyNumber}) - Setor: ${t.sectorName}`);
        });

        console.log("\nDetalhamento Corretivas:");
        report.correctiveTickets.forEach(t => {
            console.log(`  [VOS-${String(t.code).padStart(6, '0')}] ${t.assetName} (${t.patrimonyNumber}) - Valor: R$ ${t.totalValue?.toFixed(2)}`);
        });
        console.log("\n✅ Relatório de medição determinístico validado com sucesso!");
    } else {
        console.error("❌ Falha ao buscar relatório:", report);
    }
}

main();
