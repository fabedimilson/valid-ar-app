import { Data } from "@/types";
import { unstable_noStore as noStore } from 'next/cache';
import { getDashboardData } from "@/app/actions/dashboard-data";

export const getDb = async (): Promise<{ data: Data }> => {
    noStore();
    try {
        const dashboard = await getDashboardData();
        if (dashboard.success) {
            const dbData: Data = {
                sectors: dashboard.sectors as any,
                assets: dashboard.assets as any,
                tickets: dashboard.tickets as any,
                companies: dashboard.companies as any,
                catalog: dashboard.catalog as any,
                problemTypes: dashboard.problemTypes as any
            };
            return { data: dbData };
        }

        console.warn(">>> [getDb] Fallback: getDashboardData returned success=false");
        return {
            data: {
                sectors: [],
                assets: [],
                tickets: [],
                companies: [],
                catalog: [],
                problemTypes: []
            }
        };
    } catch (e) {
        console.error(">>> [getDb] Critical error fetching database state:", e);
        return {
            data: {
                sectors: [],
                assets: [],
                tickets: [],
                companies: [],
                catalog: [],
                problemTypes: []
            }
        };
    }
};
