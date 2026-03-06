
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Restoring user edimilson@ifam.edu.br...');

    const passwordHash = await bcrypt.hash('123456', 10); // Standard password or ask user? Defaulting to standard for now.

    const user = await prisma.user.upsert({
        where: { email: 'edimilson@ifam.edu.br' },
        update: {}, // Don't change if exists
        create: {
            name: 'Edimilson (Admin/Fiscal)',
            email: 'edimilson@ifam.edu.br',
            role: 'ADMIN', // Safest bet, can change to SERVER if needed
            passwordHash: passwordHash,
            active: true
        }
    });

    console.log(`User restored: ${user.email} with ID: ${user.id}`);
}

main()
    .catch((e) => {
        console.error('ERRO:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
