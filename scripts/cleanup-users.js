
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Limpando usuarios fantasmas...');

    // Apagar usuarios onde email é vazio ou nulo, mas manter o admin certo
    const deleted = await prisma.user.deleteMany({
        where: {
            OR: [
                { email: '' },
                { email: null }
            ],
            NOT: {
                email: 'admin@ifam.edu.br'
            }
        }
    });

    console.log(`Foram apagados ${deleted.count} usuarios invalidos.`);

    const remaining = await prisma.user.findMany();
    console.log('Usuarios restantes:', remaining.map(u => u.email));
}

main()
    .finally(() => prisma.$disconnect());
