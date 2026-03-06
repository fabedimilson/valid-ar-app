
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("=== FORÇANDO UPDATE MANUAL ===");
    try {
        // Find Carlos
        const carlos = await prisma.$queryRaw`
            SELECT t.id, u.name 
            FROM "technicians" t 
            JOIN "users" u ON t."user_id" = u.id 
            WHERE u.name LIKE '%Carlos%'
            LIMIT 1
        `;

        const tech = (carlos as any[])[0];

        if (!tech) {
            console.error("Carlos não encontrado!");
            return;
        }

        console.log(`Encontrado: ${tech.name} (ID: ${tech.id})`);

        // Force Update Raw
        const result = await prisma.$executeRaw`
            UPDATE "technicians" 
            SET "is_manager" = true 
            WHERE "id" = ${tech.id}
        `;

        console.log(`Update executado. Linhas afetadas: ${result}`);

        // Verify
        const check = await prisma.$queryRaw`
            SELECT is_manager FROM "technicians" WHERE id = ${tech.id}
        `;
        console.log("Verificação no Banco:", (check as any[])[0]);

    } catch (e) {
        console.error("Erro:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
