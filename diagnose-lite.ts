
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    try {
        const rawTechs: any[] = await prisma.$queryRaw`
            SELECT 
                t.id,
                u.name, 
                t.is_manager,
                c.name as comp_name
            FROM "technicians" t 
            JOIN "users" u ON t."user_id" = u.id
            LEFT JOIN "companies" c ON t."company_id" = c.id
        `;
        console.log("Total Techs:", rawTechs.length);
        for (const t of rawTechs) {
            console.log(`[${t.name}] ID:${t.id} | Mgr:${t.is_manager} | Comp:${t.comp_name}`);
        }
    } catch (e) { console.error(e); } finally { await prisma.$disconnect(); }
}
main();
