
import { getDashboardData } from "../src/app/actions/dashboard-data";
import { prisma } from "../src/lib/prisma";

async function test() {
    try {
        console.log("Testing dashboard data fetch...");
        const data = await getDashboardData();
        console.log("Success:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Dashboard Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

test();
