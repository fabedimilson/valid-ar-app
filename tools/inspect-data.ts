import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("=== INSPEÇÃO DE DADOS EXISTENTES NO NEON ===");

    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, active: true } });
    console.log("\n Usuários:");
    console.table(users);

    const sectors = await prisma.sector.findMany({ select: { id: true, name: true, block: true, room: true, responsibleId: true } });
    console.log("\n🏢 Setores:");
    console.table(sectors);

    const assets = await prisma.asset.findMany({
        select: { id: true, patrimonyNumber: true, name: true, category: true, status: true, sectorId: true, capacityBTU: true }
    });
    console.log("\n❄️ Equipamentos:");
    console.table(assets);

    const tickets = await prisma.ticket.findMany({
        select: { id: true, code: true, type: true, status: true, totalValue: true, description: true }
    });
    console.log("\n📋 Ordens de Serviço (Tickets):");
    console.table(tickets);

    await prisma.$disconnect();
}

main();
