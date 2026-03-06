
import { PrismaClient, UserRole, TicketType, TicketStatus, EvidenceType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Iniciando Seed de Dados Reais ---')

    // 1. Senha padrão hashada
    const passwordHash = await bcrypt.hash('123456', 10)

    // 2. Setores
    const sectors = await Promise.all([
        prisma.sector.upsert({
            where: { id: 'sec-ctic' },
            update: {},
            create: { id: 'sec-ctic', name: 'Coordenação de Tecnologia (CTIC)', block: 'Bloco A', floor: 'Térreo' }
        }),
        prisma.sector.upsert({
            where: { id: 'sec-coord-ensino' },
            update: {},
            create: { id: 'sec-coord-ensino', name: 'Coordenação de Ensino', block: 'Bloco B', floor: '1º Andar' }
        }),
        prisma.sector.upsert({
            where: { id: 'sec-diretoria' },
            update: {},
            create: { id: 'sec-diretoria', name: 'Diretoria Geral', block: 'Bloco A', floor: '2º Andar' }
        })
    ])

    // 3. Usuários por Role
    const admin = await prisma.user.upsert({
        where: { email: 'admin@ifam.edu.br' },
        update: {},
        create: {
            email: 'admin@ifam.edu.br',
            name: 'Administrador Infra',
            role: 'ADMIN',
            passwordHash: passwordHash
        }
    })

    const fiscalContrato = await prisma.user.upsert({
        where: { email: 'fiscal.contrato@ifam.edu.br' },
        update: {},
        create: {
            email: 'fiscal.contrato@ifam.edu.br',
            name: 'Beatriz Santos',
            role: 'FISCAL_CONTRATO',
            passwordHash: passwordHash
        }
    })

    const fiscalSetor = await prisma.user.upsert({
        where: { email: 'joao.silva@ifam.edu.br' },
        update: {},
        create: {
            email: 'joao.silva@ifam.edu.br',
            name: 'João da Silva',
            role: 'SERVER',
            passwordHash: passwordHash,
            metadata: { siape: '1234567', designationDate: '2025-01-10' }
        }
    })

    // Vincular Fiscal de Setor ao Setor
    await prisma.sector.update({
        where: { id: 'sec-ctic' },
        data: { responsibleId: fiscalSetor.id, ordinanceNumber: 'Portaria 123/2025' }
    })

    // 4. Empresas e Técnicos
    const company = await prisma.company.upsert({
        where: { cnpj: '11222333000100' },
        update: {},
        create: {
            id: 'comp-sempre-frio',
            name: 'Sempre Frio Refrigeração LTDA',
            cnpj: '11222333000100'
        }
    })

    const techUser = await prisma.user.upsert({
        where: { email: 'tech.janio@semprefrio.com' },
        update: {},
        create: {
            email: 'tech.janio@semprefrio.com',
            name: 'Jânio Quadros',
            role: 'TECHNICIAN',
            passwordHash: passwordHash
        }
    })

    const technician = await prisma.technician.upsert({
        where: { userId: techUser.id },
        update: {},
        create: {
            userId: techUser.id,
            companyId: company.id,
            isManager: true
        }
    })

    // 5. Contratos
    const contract = await prisma.contract.upsert({
        where: { number: 'PE 05/2025' },
        update: {},
        create: {
            number: 'PE 05/2025',
            companyId: company.id,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2026-01-01'),
            active: true
        }
    })

    // 6. Ativos com Info Preventiva
    const asset1 = await prisma.asset.upsert({
        where: { patrimonyNumber: 'IFAM-100200' },
        update: {},
        create: {
            patrimonyNumber: 'IFAM-100200',
            name: 'Split Samsung 18.000 BTUs',
            brand: 'Samsung',
            model: 'Digital Inverter',
            sectorId: sectors[0].id,
            status: 'ok',
            
            lastMaintenance: new Date('2024-12-15'),
            nextMaintenance: new Date('2025-03-15')
        }
    })

    const asset2 = await prisma.asset.upsert({
        where: { patrimonyNumber: 'IFAM-100300' },
        update: {},
        create: {
            patrimonyNumber: 'IFAM-100300',
            name: 'Split LG 12.000 BTUs',
            brand: 'LG',
            model: 'Dual Inverter',
            sectorId: sectors[1].id,
            status: 'maintenance',
            
            lastMaintenance: new Date('2025-01-20'),
            nextMaintenance: new Date('2025-02-20')
        }
    })

    // 7. Tickets: Corretiva com Cotação
    const ticketCorrective = await prisma.ticket.create({
        data: {
            assetId: asset1.id,
            requesterId: fiscalSetor.id,
            sectorId: sectors[0].id,
            description: 'Aparelho fazendo ruído muito alto na condensadora e não gelando.',
            type: 'CORRECTIVE',
            status: 'AWAITING_APPROVAL',
            quotation: {
                create: {
                    totalValue: 790.00,
                    fileUrl: 'https://example.com/mapa-cotacoes-vos000037.pdf' // PDF com as 3 cotações
                }
            }
        }
    })

    // 8. Ticket: Preventiva Agendada
    const ticketPreventive = await prisma.ticket.create({
        data: {
            assetId: asset2.id,
            requesterId: admin.id,
            sectorId: sectors[1].id,
            description: 'Manutenção Preventiva Mensal - Limpeza e Higienização',
            type: 'PREVENTIVE',
            status: 'SCHEDULED',
            scheduledAt: new Date('2025-02-28T09:00:00Z')
        }
    })

    // 9. Itens de Catálogo (Padronização Profissional)
    await prisma.catalogItem.deleteMany()
    await prisma.catalogItem.createMany({
        data: [
            // --- SERVIÇOS CONTRATADOS (Termo de Referência / Pregão) ---
            { name: 'Manutenção Preventiva Mensal - Split até 18k', type: 'service', estimatedCost: 120.00, isContracted: true, description: 'Limpeza de filtros, verificação de dreno e testes de operação.' },
            { name: 'Manutenção Preventiva Mensal - Split 24k a 60k', type: 'service', estimatedCost: 150.00, isContracted: true, description: 'Limpeza de filtros, verificação de dreno e testes de operação.' },
            { name: 'Manutenção Preventiva Trimestral - Split até 18k', type: 'service', estimatedCost: 180.00, isContracted: true, description: 'Limpeza química da evaporadora e condensadora no local.' },
            { name: 'Manutenção Preventiva Trimestral - Split 24k a 60k', type: 'service', estimatedCost: 250.00, isContracted: true, description: 'Limpeza química da evaporadora e condensadora no local.' },
            { name: 'Limpeza e Higienização de Bebedouro', type: 'service', estimatedCost: 85.00, isContracted: true, description: 'Sanitização de reservatórios e troca de elementos filtrantes.' },
            { name: 'Visita Técnica para Diagnóstico (Corretiva)', type: 'service', estimatedCost: 60.00, isContracted: true, description: 'Identificação de falhas e elaboração de orçamento.' },

            // --- SERVIÇOS SOB DEMANDA (Mão de Obra e Especialidades) ---
            { name: 'Instalação de Ar Condicionado Split até 12k', type: 'service', estimatedCost: 0, isContracted: false, description: 'Instalação completa com infra até 3m.' },
            { name: 'Desinstalação e Recolhimento de Gás', type: 'service', estimatedCost: 0, isContracted: false },
            { name: 'Reparo em Tubulação de Cobre (Solda)', type: 'service', estimatedCost: 0, isContracted: false },
            { name: 'Teste de Estanqueidade com Nitrogênio', type: 'service', estimatedCost: 0, isContracted: false },
            { name: 'Limpeza Química em Oficina (Remoção)', type: 'service', estimatedCost: 0, isContracted: false },
            { name: 'Substituição de Compressor (Mão de Obra)', type: 'service', estimatedCost: 0, isContracted: false },

            // --- PEÇAS (Catalogadas para Padronização de Histórico) ---
            { name: 'Carga de Gás R-410A (por kg)', type: 'part', estimatedCost: 0, isContracted: false, description: 'Gás ecológico para sistemas Inverter.' },
            { name: 'Carga de Gás R-22 (por kg)', type: 'part', estimatedCost: 0, isContracted: false },
            { name: 'Carga de Gás R-134a (por kg)', type: 'part', estimatedCost: 0, isContracted: false, description: 'Utilizado em bebedouros e geladeiras.' },
            { name: 'Compressor Rotativo 12.000 BTUs / 220V', type: 'part', estimatedCost: 0, isContracted: false },
            { name: 'Compressor Rotativo 18.000 BTUs / 220V', type: 'part', estimatedCost: 0, isContracted: false },
            { name: 'Placa Principal Split Samsung Inverter', type: 'part', estimatedCost: 0, isContracted: false },
            { name: 'Motor Ventilador Evaporadora', type: 'part', estimatedCost: 0, isContracted: false },
            { name: 'Motor Ventilador Condensadora', type: 'part', estimatedCost: 0, isContracted: false },
            { name: 'Capacitor de Partida 35uF', type: 'part', estimatedCost: 0, isContracted: false },
            { name: 'Capacitor de Partida 45uF', type: 'part', estimatedCost: 0, isContracted: false },
            { name: 'Sensor de Temperatura / Degelo', type: 'part', estimatedCost: 0, isContracted: false },
            { name: 'Filtro de Água (Elementos Filtrantes)', type: 'part', estimatedCost: 0, isContracted: false },
            { name: 'Termostato Mecânico Bebedouro', type: 'part', estimatedCost: 0, isContracted: false },
            { name: 'Relé de Partida / Protetor Térmico', type: 'part', estimatedCost: 0, isContracted: false },
            { name: 'Dreno de Escoamento (mangueira/tubo)', type: 'part', estimatedCost: 0, isContracted: false },
        ]
    })

    // 10. Adicionar itens realizados ao Ticket Corretivo para Histórico
    await prisma.serviceItem.createMany({
        data: [
            {
                ticketId: ticketCorrective.id,
                titleSnapshot: 'Troca de Compressor 18k BTUs',
                priceSnapshot: 650.00,
                quantity: 1,
                validationStatus: 'APPROVED'
            },
            {
                ticketId: ticketCorrective.id,
                titleSnapshot: 'Carga de Gás R410A',
                priceSnapshot: 140.00,
                quantity: 1,
                validationStatus: 'APPROVED'
            }
        ]
    })

    // --- NOVOS DADOS PARA RELATÓRIOS E TESTES (Adicionados Dinamicamente) ---

    // 11. Novos Equipamentos
    const asset3 = await prisma.asset.upsert({
        where: { patrimonyNumber: 'IFAM-100400' },
        update: {},
        create: {
            patrimonyNumber: 'IFAM-100400',
            name: 'Split Electrolux 12.000 BTUs',
            brand: 'Electrolux',
            model: 'Eco Inverter',
            sectorId: sectors[2].id,
            status: 'ok',
            
            lastMaintenance: new Date('2025-02-10'),
            nextMaintenance: new Date('2025-03-10')
        }
    })

    const asset4 = await prisma.asset.upsert({
        where: { patrimonyNumber: 'IFAM-100500' },
        update: {},
        create: {
            patrimonyNumber: 'IFAM-100500',
            name: 'Bebedouro Industrial 50L',
            brand: 'Venâncio',
            model: 'Inox',
            sectorId: sectors[0].id,
            status: 'ok',
            
            lastMaintenance: new Date('2025-01-05'),
            nextMaintenance: new Date('2025-04-05')
        }
    })

    const asset5 = await prisma.asset.upsert({
        where: { patrimonyNumber: 'IFAM-100600' },
        update: {},
        create: {
            patrimonyNumber: 'IFAM-100600',
            name: 'Ar Condicionado Central 60.000 BTUs',
            brand: 'Carrier',
            model: 'Piso Teto',
            sectorId: sectors[1].id,
            status: 'maintenance',
            
            lastMaintenance: new Date('2024-11-20'),
            nextMaintenance: new Date('2025-05-20')
        }
    })

    // 12. Criar Várias OS Corretivas "VALIDATED" aguardando preço
    const tc1 = await prisma.ticket.create({
        data: {
            assetId: asset3.id,
            requesterId: fiscalSetor.id,
            sectorId: sectors[2].id,
            description: 'Vazamento de água pela evaporadora. Dreno entupido e sensor de temperatura falhando.',
            type: 'CORRECTIVE',
            status: 'VALIDATED',
            closedAt: new Date(new Date().setDate(new Date().getDate() - 2)), // 2 dias atrás
            items: {
                create: [
                    { titleSnapshot: 'Desobstrução de Dreno', priceSnapshot: 80.00, quantity: 1, validationStatus: 'APPROVED' },
                    { titleSnapshot: 'Sensor de Temperatura / Degelo', priceSnapshot: 45.00, quantity: 1, validationStatus: 'APPROVED' }
                ]
            }
        }
    })

    const tc2 = await prisma.ticket.create({
        data: {
            assetId: asset5.id,
            requesterId: fiscalSetor.id,
            sectorId: sectors[1].id,
            description: 'Equipamento não liga, disjuntor desarmando e cheiro de queimado no compressor.',
            type: 'CORRECTIVE',
            status: 'VALIDATED',
            closedAt: new Date(new Date().setDate(new Date().getDate() - 5)), // 5 dias atrás
            items: {
                create: [
                    { titleSnapshot: 'Substituição de Compressor (Mão de Obra)', priceSnapshot: 800.00, quantity: 1, validationStatus: 'APPROVED' },
                    { titleSnapshot: 'Termostato Mecânico Bebedouro', priceSnapshot: 110.00, quantity: 1, validationStatus: 'APPROVED' },
                    { titleSnapshot: 'Carga de Gás R-410A (por kg)', priceSnapshot: 150.00, quantity: 2, validationStatus: 'APPROVED' }
                ]
            }
        }
    })

    // 13. Criar OS Preventivas "VALIDATED" com preços fixos do pregão (aparecem direto no relatório)
    const tp1 = await prisma.ticket.create({
        data: {
            assetId: asset4.id,
            requesterId: admin.id,
            sectorId: sectors[0].id,
            description: 'Manutenção Preventiva Trimestral - Troca de Filtros e Limpeza',
            type: 'PREVENTIVE',
            status: 'VALIDATED',
            closedAt: new Date(new Date().setDate(new Date().getDate() - 1)), // 1 dia atrás
            items: {
                create: [
                    { titleSnapshot: 'Limpeza e Higienização de Bebedouro', priceSnapshot: 85.00, quantity: 1, validationStatus: 'APPROVED' },
                    { titleSnapshot: 'Filtro de Água (Elementos Filtrantes)', priceSnapshot: 60.00, quantity: 2, validationStatus: 'APPROVED' }
                ]
            }
        }
    })

    const tp2 = await prisma.ticket.create({
        data: {
            assetId: asset1.id,
            requesterId: admin.id,
            sectorId: sectors[0].id,
            description: 'Manutenção Preventiva Mensal Regular',
            type: 'PREVENTIVE',
            status: 'VALIDATED',
            closedAt: new Date(new Date().setDate(new Date().getDate() - 10)), // 10 dias atrás
            items: {
                create: [
                    { titleSnapshot: 'Manutenção Preventiva Mensal - Split até 18k', priceSnapshot: 120.00, quantity: 1, validationStatus: 'APPROVED' }
                ]
            }
        }
    })

    const tp3 = await prisma.ticket.create({
        data: {
            assetId: asset3.id,
            requesterId: admin.id,
            sectorId: sectors[2].id,
            description: 'Preventiva Mensal (Visita de rotina)',
            type: 'PREVENTIVE',
            status: 'VALIDATED',
            closedAt: new Date(new Date().setDate(new Date().getDate() - 15)), // 15 dias atrás
            items: {
                create: [
                    { titleSnapshot: 'Manutenção Preventiva Mensal - Split até 18k', priceSnapshot: 120.00, quantity: 1, validationStatus: 'APPROVED' }
                ]
            }
        }
    })

    console.log('--- Seed Concluído com Sucesso ---')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
