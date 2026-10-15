import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("=== SIMULAÇÃO DETERMINÍSTICA DO FLUXO COMPLETO VOS (IFAM) ===");

    // 1. Verificar usuários chave
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const serverUser = await prisma.user.findFirst({ where: { role: 'SERVER' } });
    const techUser = await prisma.user.findFirst({ where: { role: 'TECHNICIAN' } });

    if (!admin || !serverUser || !techUser) {
        console.error("❌ Usuários essenciais não encontrados.");
        return;
    }

    const technicianProfile = await prisma.technician.findFirst({ where: { userId: techUser.id } });
    if (!technicianProfile) {
        console.error("❌ Perfil de técnico não encontrado.");
        return;
    }

    // 2. Garantir Catálogo de Serviços do Pregão
    const catalogServices = [
        { name: "Manutenção Preventiva Padrão (Limpeza e Higienização)", type: "service", estimatedCost: 120.00, isContracted: true },
        { name: "Carga de Fluido Refrigerante R-410A / R-22", type: "service", estimatedCost: 180.00, isContracted: true },
        { name: "Substituição de Capacitor de Partida", type: "part", estimatedCost: 85.00, isContracted: true },
        { name: "Desobstrução de Dreno e Bandeja", type: "service", estimatedCost: 95.00, isContracted: true },
        { name: "Troca de Motor Ventilador / Turbina", type: "part", estimatedCost: 320.00, isContracted: true },
    ];

    for (const item of catalogServices) {
        const exists = await prisma.catalogItem.findFirst({ where: { name: item.name } });
        if (!exists) {
            await prisma.catalogItem.create({ data: item });
            console.log(`+ Item de catálogo criado: ${item.name}`);
        }
    }

    // 3. Buscar Equipamentos existentes
    const assets = await prisma.asset.findMany({ take: 6 });
    if (assets.length < 4) {
        console.error("❌ Menos de 4 equipamentos encontrados para a simulação.");
        return;
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 4. Criar OS Corretiva VALIDADA com itens, fotos e valor para compor medição do mês atual
    const ticketCorrValidada = await prisma.ticket.create({
        data: {
            description: "Aparelho não resfriava a sala e apresentava estalo no compressor.",
            type: "CORRECTIVE",
            status: "VALIDATED",
            assetId: assets[0].id,
            sectorId: assets[0].sectorId,
            requesterId: serverUser.id,
            technicianId: technicianProfile.id,
            totalValue: 350.00, // Lançado pelo líder
            openedAt: new Date(currentYear, currentMonth, 2, 9, 30),
            closedAt: new Date(currentYear, currentMonth, 3, 16, 0),
            updatedAt: new Date(currentYear, currentMonth, 3, 16, 0),
        }
    });

    const item1 = await prisma.serviceItem.create({
        data: {
            ticketId: ticketCorrValidada.id,
            titleSnapshot: "Substituição de Capacitor e Carga Parcial de Gás",
            priceSnapshot: 350.00,
            quantity: 1,
            validationStatus: "APPROVED",
            technicianNotes: "Capacitor estufado substituído por novo e pressão do fluido equalizada."
        }
    });

    await prisma.evidenceLink.createMany({
        data: [
            {
                serviceItemId: item1.id,
                type: "BEFORE",
                url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
                uploadedById: techUser.id
            },
            {
                serviceItemId: item1.id,
                type: "AFTER",
                url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
                uploadedById: techUser.id
            }
        ]
    });

    await prisma.validation.create({
        data: {
            ticketId: ticketCorrValidada.id,
            validatorId: serverUser.id,
            action: "APPROVED",
            reason: "Serviço verificado no local. Temperatura aferida a 21°C conforme especificação.",
            timestamp: new Date(currentYear, currentMonth, 3, 16, 0)
        }
    });

    console.log(`✅ OS Corretiva Validada criada: VOS-${ticketCorrValidada.code} (Valor: R$ 350,00)`);

    // 5. Criar OS Preventiva VALIDADA com preço de tabela do contrato
    const ticketPrevValidada = await prisma.ticket.create({
        data: {
            description: "Higienização periódica preventiva bimestral do bloco.",
            type: "PREVENTIVE",
            status: "VALIDATED",
            assetId: assets[1].id,
            sectorId: assets[1].sectorId,
            requesterId: admin.id,
            technicianId: technicianProfile.id,
            openedAt: new Date(currentYear, currentMonth, 4, 8, 0),
            scheduledAt: new Date(currentYear, currentMonth, 4, 8, 0),
            closedAt: new Date(currentYear, currentMonth, 4, 11, 30),
            updatedAt: new Date(currentYear, currentMonth, 4, 11, 30),
        }
    });

    const itemPrev = await prisma.serviceItem.create({
        data: {
            ticketId: ticketPrevValidada.id,
            titleSnapshot: "Manutenção Preventiva Padrão (Limpeza e Higienização)",
            priceSnapshot: 120.00,
            quantity: 1,
            validationStatus: "APPROVED",
            technicianNotes: "Limpeza de filtros, colmeia evaporadora, medição de corrente elétrica (4.8A)."
        }
    });

    await prisma.evidenceLink.createMany({
        data: [
            {
                serviceItemId: itemPrev.id,
                type: "BEFORE",
                url: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=600&q=80",
                uploadedById: techUser.id
            },
            {
                serviceItemId: itemPrev.id,
                type: "AFTER",
                url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
                uploadedById: techUser.id
            }
        ]
    });

    console.log(`✅ OS Preventiva Validada criada: VOS-${ticketPrevValidada.code} (Valor: R$ 120,00)`);

    // 6. Criar OS AGUARDANDO VALIDAÇÃO para o Fiscal de Setor atestar interativamente
    const ticketWaiting = await prisma.ticket.create({
        data: {
            description: "Vazamento contínuo de água na parede da sala (dreno entupido).",
            type: "CORRECTIVE",
            status: "WAITING_VALIDATION",
            assetId: assets[2].id,
            sectorId: assets[2].sectorId,
            requesterId: serverUser.id,
            technicianId: technicianProfile.id,
            openedAt: new Date(currentYear, currentMonth, 5, 14, 0),
            updatedAt: new Date(currentYear, currentMonth, 5, 17, 30),
        }
    });

    const itemWaiting = await prisma.serviceItem.create({
        data: {
            ticketId: ticketWaiting.id,
            titleSnapshot: "Desobstrução do Dreno e Limpeza da Bandeja de Condensado",
            priceSnapshot: 95.00,
            quantity: 1,
            validationStatus: "PENDING",
            technicianNotes: "Dreno desobstruído com nitrogênio e aplicação de pastilha bactericida."
        }
    });

    await prisma.evidenceLink.createMany({
        data: [
            {
                serviceItemId: itemWaiting.id,
                type: "BEFORE",
                url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
                uploadedById: techUser.id
            },
            {
                serviceItemId: itemWaiting.id,
                type: "AFTER",
                url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
                uploadedById: techUser.id
            }
        ]
    });

    console.log(`✅ OS Aguardando Validação criada: VOS-${ticketWaiting.code} (Pronta para o Fiscal atestar)`);

    console.log("\n🚀 SIMULAÇÃO CONCLUÍDA! Dados prontos para verificação de ponta a ponta.");
    await prisma.$disconnect();
}

main();
