
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Verifying user edimilson@ifam.edu.br...');

    const user = await prisma.user.findFirst({
        where: { email: 'edimilson@ifam.edu.br' },
        include: { technicianProfile: true, responsibleForSectors: true }
    });

    if (user) {
        console.log(`User FOUND: ${user.name} (${user.role})`);
        // If necessary, check permissions or sector
    } else {
        console.log('User NOT FOUND.');
    }
}

main()
    .catch((e) => {
        console.error('ERRO:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
