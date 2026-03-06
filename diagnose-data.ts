
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("=== DIAGNÓSTICO SIMPLIFICADO ===");
    try {
        const rawTechs: any[] = await prisma.$queryRaw`
            SELECT 
                u.name as uname, 
                t.is_manager,
                u.metadata as umeta
            FROM "technicians" t
            JOIN "users" u ON t."user_id" = u.id
        `;

        for (const t of rawTechs) {
            console.log(`Tecnico: ${t.uname}`);
            // Force stringify to see exact value
            console.log(`  isManagerVal: ${JSON.stringify(t.is_manager)} (Tipo: ${typeof t.is_manager})`);
            console.log(`  MetadataVal: ${JSON.stringify(t.umeta)} (Tipo: ${typeof t.umeta})`);
            console.log("-------------------");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
