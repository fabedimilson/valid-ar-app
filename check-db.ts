
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const techCount = await prisma.technician.count();
        const companyCount = await prisma.company.count();
        const userCount = await prisma.user.count();
        console.log(`✅ BANCO DE DADOS CONECTADO E OPERACIONAL!`);

        // Check for manager (Raw query to avoid client validation issues if outdated)
        try {
            const managers = await prisma.$queryRaw`SELECT count(*) as count FROM "technicians" WHERE "is_manager" = true`;
            console.log(`🚀 Técnicos com perfil LÍDER encontrados: ${Number((managers as any)[0].count)}`);
        } catch {
            console.log(`⚠️ Coluna is_manager pode não existir ou erro na query.`);
        }

        console.log(`\n📊 Resumo dos Dados:`);
        console.log(`- ${companyCount} Empresas Cadastradas`);
        console.log(`- ${techCount} Técnicos Cadastrados`);
        console.log(`- ${userCount} Usuários no Sistema`);

    } catch (e) {
        console.error("❌ ERRO GRAVE: Não foi possível conectar ao banco de dados.", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
