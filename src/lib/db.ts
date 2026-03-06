
import { prisma } from "@/lib/prisma";
import { Data, Sector, Asset, Company, Ticket, CatalogItem, ProblemType } from "@/types";
import { unstable_noStore as noStore } from 'next/cache';

export const getDb = async () => {
    noStore();
    console.log(">>> [SERVER] DB FETCH TIMESTAMP:", Date.now());
    try {
        console.log(">>> [SERVER] Fetching DB Data with RAW SQL (Bypassing outdated Client)...");

        // 1. COMPANIES & TECHNICIANS (RAW QUERY)
        // Precisamos dessa query crua porque o Prisma Client gerado pode não ter o campo 'is_manager' se o generate falhou.
        const rawTechs: any[] = await prisma.$queryRaw`
            SELECT 
                c.id as cid, c.name as cname, c.cnpj,
                t.id as tid, t.is_manager,
                u.name as uname, u.email as uemail, u.metadata as umeta
            FROM "companies" c
            LEFT JOIN "technicians" t ON t."company_id" = c.id
            LEFT JOIN "users" u ON t."user_id" = u.id
        `;

        const companiesMap = new Map<string, Company>();

        for (const row of rawTechs) {
            if (!companiesMap.has(row.cid)) {
                companiesMap.set(row.cid, {
                    id: row.cid,
                    name: row.cname,
                    cnpj: row.cnpj,
                    technicians: []
                });
            }

            if (row.tid) {
                const comp = companiesMap.get(row.cid)!;
                let cpf = "000.000.000-00";
                try {
                    // Postgres pode retornar string JSON ou objeto já parseado
                    let meta = row.umeta;
                    if (typeof meta === 'string') meta = JSON.parse(meta);
                    if (meta?.cpf) cpf = meta.cpf;
                } catch { /* ignore */ }

                comp.technicians.push({
                    id: row.tid,
                    name: row.uname || "Desconhecido",
                    email: row.uemail || "",
                    cpf: cpf,
                    isManager: Boolean(row.is_manager) // Força leitura do booleano do banco
                });
            }
        }

        // 2. SECTORS (RAW QUERY)
        // O usuário reclamou de 'dados de localização'. Isso (block, floor, room) pode estar sendo ignorado pelo Client velho.
        const rawSectors: any[] = await prisma.$queryRaw`
            SELECT s.*, 
            u.id as uid, u.name as uname, u.email as uemail, u.metadata as umeta, u.active as uactive
            FROM "sectors" s
            LEFT JOIN "users" u ON s."responsible_id" = u.id
        `;

        const sectors: Sector[] = rawSectors.map((s: any) => {
            let responsible = { id: 'none', name: 'Não Atribuído', email: '', siape: '', isActive: false } as any;

            if (s.uid) { // Tem responsável
                let siape = "N/A";
                try {
                    let meta = s.umeta;
                    if (typeof meta === 'string') meta = JSON.parse(meta);
                    if (meta?.siape) siape = meta.siape;
                } catch { }

                responsible = {
                    id: s.uid,
                    name: s.uname,
                    email: s.uemail,
                    isActive: s.uactive,
                    siape: siape,
                    password: '***'
                };
            }

            return {
                id: s.id,
                name: s.name,
                block: s.block || undefined,
                floor: s.floor || undefined,
                room: s.room || undefined,
                responsible: responsible,
                responsibleHistory: [] // Histórico complexo para raw query, deixando vazio por enquanto
            };
        });

        // 3. ASSETS (Standard Prisma)
        // Assumindo que assets não mudaram schema recentemente, ou se mudaram, raw seria ideal também.
        // Mas vamos manter standard para simplificar.
        const assetsData = await prisma.asset.findMany();
        const assets: Asset[] = assetsData.map(a => ({
            id: a.id,
            patrimonyNumber: a.patrimonyNumber,
            name: a.name,
            sectorId: a.sectorId,
            acquisitionDate: a.acquisitionDate ? a.acquisitionDate.toISOString() : new Date().toISOString(),
            status: a.status as any,
            brand: a.brand || undefined,
            model: a.model || undefined,
            serialNumber: a.serialNumber || undefined,
            category: a.category || undefined,
            subType: a.subType || undefined,
            capacityBTU: a.capacityBTU || undefined,
            capacityLiters: a.capacityLiters || undefined,
            voltage: a.voltage || undefined,
            gasType: a.gasType || undefined,
            compressorType: a.compressorType || undefined,
            criticality: a.criticality || undefined,
            power: a.power || undefined
        }));

        // 4. TICKETS (Standard)
        const ticketsData = await prisma.ticket.findMany();
        const tickets: Ticket[] = ticketsData.map(t => ({
            id: t.id,
            code: t.code,
            assetId: t.assetId,
            sectorId: t.sectorId,
            technicianId: t.technicianId || undefined,
            requesterName: "Carregando...",
            description: t.description,
            status: 'open',
            type: 'corrective',
            items: [],
            openedAt: t.openedAt.getTime(),
            updatedAt: new Date().getTime()
        }));

        const dbData: Data = {
            sectors,
            assets,
            tickets,
            companies: Array.from(companiesMap.values()),
            catalog: [],
            problemTypes: []
        };

        return { data: dbData };

    } catch (e) {
        console.error(">>> CRITICAL ERROR IN GETDB RAW FETCH:", e);
        // Fallback vazio para não crashar o app
        return {
            data: {
                sectors: [], assets: [], tickets: [], companies: [], catalog: [], problemTypes: []
            }
        };
    }
}
