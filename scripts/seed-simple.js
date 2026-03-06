
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
    datasourceUrl: "postgresql://admin:adminpassword@localhost:5432/valid_ar_db?schema=public"
});

async function main() {
    console.log('Seeding database...');

    const passwordHash = await bcrypt.hash('adminpassword', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@ifam.edu.br' },
        update: {},
        create: {
            email: 'admin@ifam.edu.br',
            name: 'Admin Global',
            role: 'ADMIN',
            passwordHash: passwordHash,
        },
    });

    console.log('Admin created:', admin);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
