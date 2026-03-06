
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Criando usuario admin...');

    // Hash da senha 'admin'
    const passwordHash = await bcrypt.hash('admin', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@ifam.edu.br' },
        update: {
            passwordHash: passwordHash // Atualiza a senha se ja existir
        },
        create: {
            email: 'admin@ifam.edu.br',
            name: 'Admin Global',
            role: 'ADMIN',
            passwordHash: passwordHash,
        },
    });

    console.log('SUCESSO! Usuario criado:', admin.email);
}

main()
    .catch((e) => {
        console.error('ERRO:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
