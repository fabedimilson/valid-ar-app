
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
    try {
        const userCount = await prisma.user.count();
        console.log(`Users in DB: ${userCount}`);

        if (userCount > 0) {
            const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
            console.log('Users:', users);
        } else {
            // Create a default admin for testing if none exists
            console.log('No users found. Creating default admin...');
            /*
            await prisma.user.create({
                data: {
                    id: 'admin-temp',
                    name: 'Admin Temp',
                    email: 'admin@temp.com',
                    passwordHash: 'temp',
                    role: 'ADMIN'
                }
            });
            console.log('Created admin-temp');
            */
        }

        const ticketCount = await prisma.ticket.count();
        console.log(`Tickets in DB: ${ticketCount}`);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
