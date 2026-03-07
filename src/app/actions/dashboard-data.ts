
'use server';

import { prisma } from "@/lib/prisma";

const PROBLEM_TYPES = [
    { id: 'prob-preventiva', label: 'Manutenção Preventiva / Limpeza', description: 'Serviço de rotina: limpeza de filtros, serpentinas e verificação geral.' },
    { id: 'prob-nao-gela', label: 'Não gela / Baixa Eficiência', description: 'O equipamento liga, mas não resfria adequadamente o ambiente.' },
    { id: 'prob-nao-liga', label: 'Não liga / Sem Energia', description: 'O equipamento não dá nenhum sinal de vida ou não acende os leds.' },
    { id: 'prob-pingando', label: 'Pingando Água (Vazamento Interno)', description: 'Vazamento de água pela unidade interna (evaporadora).' },
    { id: 'prob-barulho', label: 'Barulho / Ruído Anormal', description: 'Barulhos estranhos nas unidades interna ou externa.' },
    { id: 'prob-cheiro', label: 'Mau Cheiro', description: 'Odor desagradável saindo do equipamento quando ligado.' },
    { id: 'prob-controle', label: 'Controle Remoto / Sensor', description: 'Equipamento não responde aos comandos do controle.' },
    { id: 'prob-disjuntor', label: 'Desarmando Disjuntor', description: 'A energia cai ou o disjuntor desliga ao ligar o aparelho.' },
    { id: 'prob-erro', label: 'Código de Erro no Display', description: 'Aparece um código ou luzes piscando no visor.' },
    { id: 'prob-outros', label: 'Outro Problema', description: 'Outro defeito não listado acima.' },
];

export async function getDashboardData() {
    try {
        const sectorsRaw = await prisma.sector.findMany({
            include: {
                responsible: true
            }
        });

        const sectors = sectorsRaw.map(s => {
            let responsible = null;
            if (s.responsible) {
                const meta = (s.responsible.metadata as any) || {};
                responsible = {
                    id: s.responsible.id,
                    name: s.responsible.name,
                    email: s.responsible.email,
                    isActive: s.responsible.active,
                    cpf: s.responsible.cpf || '',
                    siape: s.responsible.siape || '',
                    designationDate: ((s.responsible.metadata as any)?.designationDate) || '',
                    ordinanceNumber: s.ordinanceNumber || '',
                };
            }

            return {
                id: s.id,
                name: s.name,
                block: s.block || undefined,
                floor: s.floor || undefined,
                room: s.room || undefined,
                responsible,
                responsibleHistory: (s.responsibleHistory as any) || [],
                createdAt: s.createdAt.toISOString(),
                updatedAt: s.updatedAt.toISOString(),
                ordinanceNumber: s.ordinanceNumber
            };
        });

        const assets = await prisma.asset.findMany();

        const ticketsRaw = await prisma.ticket.findMany({
            orderBy: { updatedAt: 'desc' },
            include: {
                items: {
                    include: {
                        evidence: true
                    }
                },
                validations: true,
                quotation: true
            }
        });

        // Map Prisma Ticket to Frontend Ticket Interface
        const tickets = ticketsRaw.map((t: any) => {
            const mappedItems = (t.items || []).map((i: any) => {
                const techPhotos = i.evidence
                    .filter((e: any) => e.type === 'BEFORE' || e.type === 'AFTER')
                    .map((e: any) => ({
                        id: e.id,
                        url: e.url,
                        timestamp: e.createdAt.getTime(),
                        type: e.type.toLowerCase() as 'before' | 'after'
                    }));

                // Map Category? Not in schema yet, defaulting
                const category = 'cleaning';

                return {
                    id: i.id,
                    catalogItemId: i.catalogReferenceId || undefined,
                    title: i.titleSnapshot,
                    description: i.technicianNotes || '',
                    category: category,
                    estimatedValue: Number(i.priceSnapshot || 0),
                    technicianPhotos: techPhotos,
                    validationStatus: i.validationStatus.toLowerCase(),
                    serverPhotos: [],
                    technicianNotes: i.technicianNotes || undefined
                };
            });

            // Map Status Enum
            let status = 'open';
            switch (t.status) {
                case 'OPEN': status = 'open'; break;
                case 'AWAITING_QUOTATION': status = 'awaiting_quotation'; break;
                case 'AWAITING_APPROVAL': status = 'awaiting_approval'; break;
                case 'AUTHORIZED': status = 'authorized'; break;
                case 'SCHEDULED': status = 'scheduled'; break;
                case 'IN_PROGRESS': status = 'in_progress'; break;
                case 'WAITING_VALIDATION': status = 'waiting_validation'; break;
                case 'VALIDATED': status = 'validated'; break;
                case 'REJECTED': status = 'rejected'; break;
                case 'CANCELLED': status = 'completed'; break;
                default: status = 'open';
            }

            return {
                id: t.id,
                code: t.code,
                assetId: t.assetId,
                sectorId: t.sectorId,
                technicianId: t.technicianId || undefined,
                requesterName: 'Admin/System',
                description: t.description,
                type: t.type === 'PREVENTIVE' ? 'preventive' : 'corrective',
                status: status,
                items: mappedItems,
                openedAt: t.openedAt.getTime(),
                updatedAt: t.updatedAt.getTime(),
                scheduledAt: t.scheduledAt?.getTime(),
                quotation: t.quotation ? {
                    id: t.quotation.id,
                    ticketId: t.quotation.ticketId,
                    totalValue: Number(t.quotation.totalValue),
                    fileUrl: t.quotation.fileUrl,
                    approvedById: t.quotation.approvedById || undefined,
                    approvedAt: t.quotation.approvedAt?.toISOString()
                } : undefined
            };
        });

        const mappedAssets = assets.map(a => ({
            ...a,
            patrimonyId: a.patrimonyNumber,
            status: (a.status as any) || 'ok',
            acquisitionDate: a.acquisitionDate ? a.acquisitionDate.toISOString() : '',
            lastMaintenance: a.lastMaintenance ? a.lastMaintenance.toISOString() : undefined,
            nextMaintenance: a.nextMaintenance ? a.nextMaintenance.toISOString() : undefined,
            createdAt: a.createdAt.toISOString(),
            updatedAt: a.updatedAt.toISOString()
        }));

        const companies = await prisma.company.findMany({
            include: {
                technicians: {
                    include: {
                        user: true
                    }
                }
            }
        });

        const mappedCompanies = companies.map(c => ({
            id: c.id,
            name: c.name,
            cnpj: c.cnpj,
            active: c.active,
            createdAt: c.createdAt.toISOString(),
            updatedAt: c.updatedAt.toISOString(),
            technicians: c.technicians.map(t => ({
                id: t.id,
                name: t.user.name,
                cpf: t.user.cpf || '',
                email: t.user.email,
                isManager: t.isManager
            }))
        }));

        const catalogRaw = await prisma.catalogItem.findMany({
            where: { active: true }
        });

        const catalog = catalogRaw.map(c => ({
            id: c.id,
            name: c.name,
            type: c.type as 'service' | 'part',
            estimatedCost: Number(c.estimatedCost),
            isContracted: c.isContracted
        }));

        return {
            success: true,
            sectors: sectors as any,
            assets: mappedAssets as any,
            tickets: tickets as any,
            companies: mappedCompanies as any,
            catalog: catalog,
            problemTypes: PROBLEM_TYPES
        };

    } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        return {
            success: false,
            sectors: [],
            assets: [],
            tickets: [],
            companies: [],
            catalog: [],
            problemTypes: []
        };
    }
}
