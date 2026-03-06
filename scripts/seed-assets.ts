import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Busca setores existentes
    const sectors = await prisma.sector.findMany({ select: { id: true, name: true } });
    if (sectors.length === 0) {
        console.error('Nenhum setor encontrado. Cadastre setores antes de rodar este script.');
        process.exit(1);
    }

    const s = (i: number) => sectors[i % sectors.length].id;

    // Busca um usuário admin para requester
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
        ?? await prisma.user.findFirst();
    if (!admin) { console.error('Nenhum usuário encontrado.'); process.exit(1); }

    const today = new Date();
    const past = (days: number) => new Date(today.getTime() - days * 86400000);
    const future = (days: number) => new Date(today.getTime() + days * 86400000);

    // ── NOVOS ATIVOS ────────────────────────────────────────────────────────────
    const newAssets = [
        {
            id: 'asset-new-01',
            name: 'Fancoil 24.000 BTUs',
            patrimonyNumber: 'IFAM-200100',
            sectorId: s(0),
            status: 'OK' as const,
            brand: 'Carrier',
            model: 'FC-24',
            acquisitionDate: past(400),
            lastMaintenance: past(90),   // Ciclo Anterior: 90 dias atrás
            nextMaintenance: future(0),  // Vencendo hoje
            category: 'Fancoil',
        },
        {
            id: 'asset-new-02',
            name: 'Ar Condicionado Split 9.000 BTUs',
            patrimonyNumber: 'IFAM-200200',
            sectorId: s(1),
            status: 'OK' as const,
            brand: 'Midea',
            model: 'MSP-09',
            acquisitionDate: past(300),
            lastMaintenance: past(180), // Ciclo Anterior: 6 meses atrás
            nextMaintenance: past(30),  // Vencido há 30 dias (urgente)
            category: 'Split',
        },
        {
            id: 'asset-new-03',
            name: 'Bebedouro de Coluna 30L',
            patrimonyNumber: 'IFAM-200300',
            sectorId: s(2 % sectors.length),
            status: 'OK' as const,
            brand: 'Ibbl',
            model: 'FR600',
            acquisitionDate: past(500),
            lastMaintenance: past(60),
            nextMaintenance: future(30), // Próximo ciclo: 30 dias
            category: 'Bebedouro',
        },
        {
            id: 'asset-new-04',
            name: 'Climatizador Industrial 45.000 BTUs',
            patrimonyNumber: 'IFAM-200400',
            sectorId: s(0),
            status: 'OK' as const,
            brand: 'York',
            model: 'YCH-45',
            acquisitionDate: past(800),
            lastMaintenance: null,       // Sem ciclo anterior (novo)
            nextMaintenance: null,
            category: 'Climatizador',
        },
        {
            id: 'asset-new-05',
            name: 'Split Cassete 36.000 BTUs',
            patrimonyNumber: 'IFAM-200500',
            sectorId: s(1 % sectors.length),
            status: 'OK' as const,
            brand: 'Daikin',
            model: 'FCAG36',
            acquisitionDate: past(600),
            lastMaintenance: past(45),
            nextMaintenance: future(45), // Próximo ciclo: 45 dias
            category: 'Cassete',
        },
    ];

    console.log('\n── Criando novos ativos ──');
    for (const asset of newAssets) {
        await prisma.asset.upsert({
            where: { id: asset.id },
            update: {},
            create: {
                id: asset.id,
                name: asset.name,
                patrimonyNumber: asset.patrimonyNumber,
                sectorId: asset.sectorId,
                status: asset.status,
                brand: asset.brand,
                model: asset.model,
                acquisitionDate: asset.acquisitionDate,
                lastMaintenance: asset.lastMaintenance ?? undefined,
                nextMaintenance: asset.nextMaintenance ?? undefined,
                category: asset.category,
            },
        });
        console.log(`  ✓ ${asset.name} (${asset.patrimonyNumber})`);
    }

    // ── SITUAÇÃO A: OS já concluída (Novo Ciclo zerado) ──────────────────────
    // Ativo asset-new-01: cria ticket preventiva já VALIDATED → Novo Ciclo deve ficar zerado
    const existingValidated = await prisma.ticket.findFirst({
        where: { assetId: 'asset-new-01', type: 'PREVENTIVE', status: 'VALIDATED' }
    });
    if (!existingValidated) {
        await prisma.ticket.create({
            data: {
                description: 'Manutenção preventiva — limpeza geral e verificação de filtros (Fancoil)',
                status: 'VALIDATED',
                type: 'PREVENTIVE',
                assetId: 'asset-new-01',
                sectorId: s(0),
                requesterId: admin.id,
                scheduledAt: past(15),
            }
        });
        // Atualiza lastMaintenance do ativo para refletir o ciclo concluído
        await prisma.asset.update({
            where: { id: 'asset-new-01' },
            data: { lastMaintenance: past(15) }
        });
        console.log('\n  ✓ Fancoil: OS preventiva CONCLUÍDA/VALIDADA (Novo Ciclo zerado)');
    }

    // ── SITUAÇÃO B: OS agendada (Novo Ciclo com data + lápis) ──────────────
    const existingScheduled = await prisma.ticket.findFirst({
        where: { assetId: 'asset-new-02', type: 'PREVENTIVE', status: 'SCHEDULED' }
    });
    if (!existingScheduled) {
        await prisma.ticket.create({
            data: {
                description: 'Preventiva programada — limpeza de filtros e serpentina',
                status: 'SCHEDULED',
                type: 'PREVENTIVE',
                assetId: 'asset-new-02',
                sectorId: s(1 % sectors.length),
                requesterId: admin.id,
                scheduledAt: future(7),
            }
        });
        console.log('  ✓ Split 9.000 BTUs: OS preventiva AGENDADA para daqui 7 dias');
    }

    // ── SITUAÇÃO C: OS em execução (in_progress) ─────────────────────────────
    const existingInProgress = await prisma.ticket.findFirst({
        where: { assetId: 'asset-new-03', type: 'PREVENTIVE', status: 'IN_PROGRESS' }
    });
    if (!existingInProgress) {
        await prisma.ticket.create({
            data: {
                description: 'Preventiva em andamento — troca de filtro e sanitização',
                status: 'IN_PROGRESS',
                type: 'PREVENTIVE',
                assetId: 'asset-new-03',
                sectorId: s(2 % sectors.length),
                requesterId: admin.id,
                scheduledAt: past(2),
            }
        });
        console.log('  ✓ Bebedouro 30L: OS preventiva EM ANDAMENTO (técnico executando)');
    }

    console.log('\n✅ Seed concluído! Recarregue o sistema para ver as novas situações.\n');
    console.log('Cenários disponíveis:');
    console.log('  • Fancoil          → OS CONCLUÍDA  → Novo Ciclo zerado, pronto para agendar');
    console.log('  • Split 9.000 BTUs → OS AGENDADA   → Novo Ciclo com data + caneta');
    console.log('  • Bebedouro 30L    → OS EM ANDAMENTO → Novo Ciclo com data + caneta');
    console.log('  • Climatizador     → SEM HISTÓRICO  → Ciclo anterior vazio, pronto para agendar');
    console.log('  • Split Cassete    → SEM OS ATIVA   → Pronto para novo agendamento\n');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
