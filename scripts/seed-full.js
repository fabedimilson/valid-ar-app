
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Limpando banco de dados...');
    // Ordem reversa para respeitar chaves estrangeiras
    await prisma.validation.deleteMany();
    await prisma.evidenceLink.deleteMany();
    await prisma.serviceItem.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.technician.deleteMany();
    // Nao vamos apagar Companies e Sectors se tiver usuarios atrelados, entao:
    // Primeiro soltamos os usuarios

    // Como nao quero apagar usuarios (especialmente o Admin), vou apagar apenas
    // os que criei no seed: 'joao' e 'maria'

    const deletedUsers = await prisma.user.deleteMany({
        where: {
            email: {
                in: ['joao.tecnico@empresa.com', 'maria.fiscal@ifam.edu.br']
            }
        }
    });
    console.log(`- ${deletedUsers.count} usuarios de teste apagados.`);

    await prisma.company.deleteMany();
    await prisma.sector.deleteMany();

    console.log('✅ Banco limpo. Iniciando inserção...');

    // --- REPETINDO O SCRIPT DE CRIACAO ---

    // Criar Setores
    const setorTI = await prisma.sector.create({
        data: { name: 'Coordenação de TI' }
    });

    const setorBlocoA = await prisma.sector.create({
        data: { name: 'Bloco A - Salas de Aula' }
    });

    // Criar Empresa
    const empresa = await prisma.company.create({
        data: {
            name: 'Clima Frio Manaus Ltda',
            cnpj: '12.345.678/0001-90'
        }
    });

    // Criar TÉCNICO
    const passHash = await bcrypt.hash('123456', 10);

    const userTecnico = await prisma.user.create({
        data: {
            name: 'João Técnico',
            email: 'joao.tecnico@empresa.com',
            role: 'TECHNICIAN',
            passwordHash: passHash,
            technicianProfile: {
                create: {
                    companyId: empresa.id
                }
            }
        },
        include: { technicianProfile: true }
    });

    const technicianId = userTecnico.technicianProfile.id;

    // Criar FISCAL
    const userFiscal = await prisma.user.create({
        data: {
            name: 'Maria Fiscal',
            email: 'maria.fiscal@ifam.edu.br',
            role: 'SERVER',
            passwordHash: passHash,
            responsibleForSectors: {
                connect: { id: setorTI.id }
            }
        }
    });

    // Criar Ativos
    const ac1 = await prisma.asset.create({
        data: {
            name: 'Split 12000 BTUs',
            patrimonyNumber: 'PAT-2024-001',
            brand: 'Samsung',
            model: 'AR12',
            acquisitionDate: new Date('2023-01-15'),
            sectorId: setorTI.id,
            qrCode: 'QR-TI-01'
        }
    });

    const ac2 = await prisma.asset.create({
        data: {
            name: 'AC Janela 7500',
            patrimonyNumber: 'PAT-2024-002',
            brand: 'Consul',
            model: 'CCB07',
            sectorId: setorBlocoA.id
        }
    });

    // Criar Chamados
    await prisma.ticket.create({
        data: {
            description: 'Realizar limpeza dos filtros e verificar gás.',
            status: 'OPEN',
            assetId: ac1.id,
            sectorId: setorTI.id,
            requesterId: userFiscal.id
        }
    });

    await prisma.ticket.create({
        data: {
            description: 'Ar condicionado pingando muito.',
            status: 'IN_PROGRESS',
            assetId: ac2.id,
            sectorId: setorBlocoA.id,
            requesterId: userFiscal.id,
            technicianId: technicianId
        }
    });

    console.log('✅ SUCESSO! Banco populado.');
}

main()
    .catch((e) => {
        console.error('ERRO:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
