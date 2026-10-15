import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("--> Iniciando teste de Handshake com o banco Neon PostgreSQL...");
    try {
        const result = await prisma.$queryRaw`SELECT NOW() as current_time, current_database() as db_name, version() as pg_version`;
        console.log(" Conexão com o Neon estabelecida com sucesso!");
        console.log("Detalhes:", result);

        // Contagem rápida de registros
        const [usersCount, sectorsCount, assetsCount, ticketsCount] = await Promise.all([
            prisma.user.count(),
            prisma.sector.count(),
            prisma.asset.count(),
            prisma.ticket.count()
        ]);

        console.log("\n📊 Censo Atual do Banco Neon:");
        console.log(`- Usuários cadastrados: ${usersCount}`);
        console.log(`- Setores cadastrados: ${sectorsCount}`);
        console.log(`- Equipamentos cadastrados: ${assetsCount}`);
        console.log(`- Ordens de Serviço (Tickets): ${ticketsCount}`);

    } catch (error) {
        console.error("❌ Falha no Handshake com o Neon:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
