
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🏭 Iniciando Super Seed (Modo Seguro - Sem Limpeza Automática)...');

    // --- LIMPEZA DESATIVADA PARA PRESERVAR DADOS ---
    // User requested to preserve data (e.g. edimilson@ifam.edu.br)
    /*
    try {
        console.log('Cleaning up...');
        await prisma.validation.deleteMany().catch(e => console.log('Val err', e.message));
        await prisma.evidenceLink.deleteMany().catch(e => console.log('Evid err', e.message));
        await prisma.serviceItem.deleteMany().catch(e => console.log('SvcItm err', e.message));
        await prisma.ticket.deleteMany().catch(e => console.log('Ticket err', e.message));
        await prisma.asset.deleteMany().catch(e => console.log('Asset err', e.message));
        await prisma.sector.deleteMany().catch(e => console.log('Sector err', e.message));
        await prisma.technician.deleteMany().catch(e => console.log('Tech err', e.message));
        await prisma.company.deleteMany().catch(e => console.log('Comp err', e.message));
        
        await prisma.user.deleteMany({
            where: {
                NOT: { email: { contains: 'global' } }, 
                role: { not: 'ADMIN' }
            }
        }).catch(e => console.log('User err', e.message));
    } catch (e) {
        console.log('Erro na limpeza:', e.message);
    }
    */

    // --- 1. EMPRESAS DE MANUTENÇÃO ---
    // Use upsert to avoid unique constraint errors
    const comp1 = await prisma.company.upsert({
        where: { cnpj: '11.111.111/0001-11' },
        update: {},
        create: { name: 'ClimaFrio Soluções', cnpj: '11.111.111/0001-11' }
    });

    const comp2 = await prisma.company.upsert({
        where: { cnpj: '22.222.222/0001-22' },
        update: {},
        create: { name: 'GelaManaus Serviços', cnpj: '22.222.222/0001-22' }
    });

    // --- 2. TÉCNICOS ---
    const pass = await bcrypt.hash('123456', 10);

    // Tech 1
    const techUser1 = await prisma.user.upsert({
        where: { email: 'carlos@climafrio.com' },
        update: {},
        create: { name: 'Carlos Técnico (ClimaFrio)', email: 'carlos@climafrio.com', role: 'TECHNICIAN', passwordHash: pass }
    });

    // Link Technician Logic (Check if exists first as no unique constraint on userId alone in upsert easily without ID knowledge, though userId is unique)
    let tech1 = await prisma.technician.findUnique({ where: { userId: techUser1.id } });
    if (!tech1) {
        tech1 = await prisma.technician.create({ data: { userId: techUser1.id, companyId: comp1.id } });
    }

    // Tech 2
    const techUser2 = await prisma.user.upsert({
        where: { email: 'beto@gelamanaus.com' },
        update: {},
        create: { name: 'Roberto Especialista (GelaManaus)', email: 'beto@gelamanaus.com', role: 'TECHNICIAN', passwordHash: pass }
    });

    let tech2 = await prisma.technician.findUnique({ where: { userId: techUser2.id } });
    if (!tech2) {
        tech2 = await prisma.technician.create({ data: { userId: techUser2.id, companyId: comp2.id } });
    }

    // --- 3. SETORES E FISCAIS ---
    const sectorsData = [
        { name: 'Auditório Principal', email: 'ana@ifam.edu.br', resp: 'Ana Gestora' },
        { name: 'Laboratório de Informática 3', email: 'paulo@ifam.edu.br', resp: 'Paulo TI' },
        { name: 'Coordenação Pedagógica', email: 'elena@ifam.edu.br', resp: 'Elena Pedagoga' },
        { name: 'Biblioteca Central', email: 'marcos@ifam.edu.br', resp: 'Marcos Biblio' },
        { name: 'Refeitório', email: 'joana@ifam.edu.br', resp: 'Joana Nutri' },
    ];

    const sectors = [];

    for (const s of sectorsData) {
        const user = await prisma.user.upsert({
            where: { email: s.email },
            update: {},
            create: { name: s.resp, email: s.email, role: 'SERVER', passwordHash: pass }
        });

        // Try to find sector by name to avoid dupes
        let sec = await prisma.sector.findFirst({ where: { name: s.name } });
        if (!sec) {
            sec = await prisma.sector.create({
                data: { name: s.name, responsibleId: user.id }
            });
        }

        // Add requesterId (user id) to sector object for easy access later
        sec.requesterId = user.id;
        sectors.push(sec);
    }

    // --- 4. ATIVOS (Gerar 25 ativos variados if checking existing count is low) ---
    const existingAssetsCount = await prisma.asset.count();

    // Only generate more assets if we have fewer than 25 (to avoid infinite growth on re-runs)
    if (existingAssetsCount < 25) {
        const brands = ['Samsung', 'LG', 'Carrier', 'Consul', 'Springer', 'Elgin'];
        const models = ['Split Inverter 12k', 'Split High Wall 18k', 'Cassete 36k', 'Piso Teto 60k', 'ACJ 10k'];

        // Load *all* created assets so createScenario can pick from them
        let allAssets = await prisma.asset.findMany();

        // If still need to create
        const diff = 25 - existingAssetsCount;
        if (diff > 0) {
            console.log(`Gerando mais ${diff} ativos...`);
            for (let i = 1; i <= diff; i++) {
                const sector = sectors[Math.floor(Math.random() * sectors.length)];
                const brand = brands[Math.floor(Math.random() * brands.length)];
                const model = models[Math.floor(Math.random() * models.length)];

                const asset = await prisma.asset.create({
                    data: {
                        name: `${model} - ${brand}`,
                        patrimonyNumber: `IFAM-${Date.now()}-${i}`, // Unique patrimony
                        brand: brand,
                        model: model,
                        sectorId: sector.id,
                        acquisitionDate: new Date(2020, Math.floor(Math.random() * 12), 15),
                        status: 'ok',
                    }
                });
                allAssets.push(asset);
            }
        }
    }

    // Re-fetch ALL assets to let createScenario use them
    const allAssets = await prisma.asset.findMany();

    // If no assets (shouldn't happen), exit
    if (allAssets.length === 0) return;

    // --- HELPER FUNCTION ---
    // Only create TICKET if asset doesn't have an open ticket? 
    // Or just skip creating new tickets if we already have plenty.
    // Let's count tickets.
    const ticketCount = await prisma.ticket.count();
    if (ticketCount > 10) {
        console.log('Já existem chamados suficientes. Pulando criação de novos cenários.');
        return;
    }

    async function createScenario(assetIndex, ticketStatus, desc, daysAgo, items = []) {
        if (assetIndex >= allAssets.length) return;
        const asset = allAssets[assetIndex];
        const sector = sectors.find(s => s.id === asset.sectorId); // Note: sectors array might not have ALL sectors if DB had others, but it has the ones we upserted

        // Fallback for sector requester if we can't match easily (e.g. existing asset in diff sector)
        let requesterId = sector ? (sector.requesterId || sector.responsibleId) : (await prisma.user.findFirst({ where: { role: 'SERVER' } })).id;
        let sectorId = asset.sectorId;

        let techId = null;
        let assetStatus = 'ok';

        // Logic for asset status based on ticket
        if (ticketStatus === 'OPEN') {
            assetStatus = 'waiting_tech';
        } else if (ticketStatus === 'IN_PROGRESS') {
            assetStatus = 'maintenance';
            techId = Math.random() > 0.5 ? tech1.id : tech2.id;
        } else if (ticketStatus === 'WAITING_VALIDATION') {
            assetStatus = 'maintenance';
            techId = tech1.id;
        } else if (ticketStatus === 'VALIDATED') {
            assetStatus = 'ok';
            techId = tech1.id;
        } else if (ticketStatus === 'CANCELLED') {
            assetStatus = 'ok';
        }

        // Update ASSET
        await prisma.asset.update({
            where: { id: asset.id },
            data: { status: assetStatus }
        });

        // Create TICKET
        const ticket = await prisma.ticket.create({
            data: {
                code: Math.floor(Math.random() * 10000), // Random code to avoid unique clash if any
                assetId: asset.id,
                sectorId: sectorId,
                requesterId: requesterId,
                technicianId: techId,
                description: desc,
                status: ticketStatus,
                openedAt: new Date(Date.now() - 86400000 * daysAgo)
            }
        });

        // Create ITEMS
        if (items.length > 0) {
            for (const item of items) {
                let valStatus = 'PENDING';
                if (ticketStatus === 'VALIDATED') valStatus = 'APPROVED';

                await prisma.serviceItem.create({
                    data: {
                        ticketId: ticket.id,
                        titleSnapshot: item.title,
                        priceSnapshot: item.price,
                        validationStatus: valStatus,
                        technicianNotes: 'Serviço realizado conforme padrão.',
                    }
                });
            }
        }
    }

    // --- 5. CENARIOS (Create only if ticket count was low) ---
    if (ticketCount <= 10) {
        console.log('Criando cenários de testes iniciais...');
        await createScenario(0, 'OPEN', 'Equipamento parou de refrigerar (Simulação).', 2);
        await createScenario(1, 'IN_PROGRESS', 'Vazamento de água (Simulação).', 1);
        await createScenario(2, 'WAITING_VALIDATION', 'Manutenção preventiva (Simulação).', 1, [{ title: 'Preventiva', price: 150 }]);
        await createScenario(3, 'VALIDATED', 'Troca de placa (Simulação).', 5, [{ title: 'Placa', price: 300 }]);
    }

    console.log('✅ Seed Concluído em Modo Seguro.');
    console.log('Nenhum dado existente foi apagado propositalmente.');
}

main()
    .catch((e) => {
        console.error('ERRO FATAL:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
