
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Iniciando Super Seed (ValidAr)...');

    // 1. Limpar Banco
    console.log('🧹 Limpando dados antigos...');
    await prisma.validation.deleteMany();
    await prisma.evidenceLink.deleteMany();
    await prisma.serviceItem.deleteMany();
    await prisma.quotation.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.technician.deleteMany();
    await prisma.contractService.deleteMany();
    await prisma.contract.deleteMany();
    await prisma.company.deleteMany();
    await prisma.sector.deleteMany();
    // Apagar todos menos o admin principal se ele existir por email
    await prisma.user.deleteMany({
        where: { email: { notIn: ['admin@ifam.edu.br'] } }
    });

    const passHash = await bcrypt.hash('123456', 10);
    const adminPassHash = await bcrypt.hash('admin', 10);

    // 2. Garantir Admin
    await prisma.user.upsert({
        where: { email: 'admin@ifam.edu.br' },
        update: {},
        create: {
            name: 'Administrador Central',
            email: 'admin@ifam.edu.br',
            passwordHash: adminPassHash,
            role: 'ADMIN',
            cpf: '000.000.000-00'
        }
    });

    // 3. Criar Fiscais (Setores)
    console.log('👥 Criando usuários e setores...');
    const setoresData = [
        { name: 'Biblioteca Central', block: 'Bloco B', floor: '1º Andar', responsible: 'Ricardo Silva', email: 'ricardo.biblioteca@ifam.edu.br', cpf: '111.111.111-11', siape: '1112223' },
        { name: 'Laboratório de Química', block: 'Bloco C', floor: 'Térreo', responsible: 'Ana Paula', email: 'ana.quimica@ifam.edu.br', cpf: '222.222.222-22', siape: '2223334' },
        { name: 'Auditório Principal', block: 'Bloco A', floor: 'Térreo', responsible: 'Carlos Mendes', email: 'carlos.auditorio@ifam.edu.br', cpf: '333.333.333-33', siape: '3334445' },
        { name: 'Secretaria Acadêmica', block: 'Bloco A', floor: '1º Andar', responsible: 'Fernanda Lima', email: 'fernanda.sec@ifam.edu.br', cpf: '444.444.444-44', siape: '4445556' },
        { name: 'Coordenação de Informática', block: 'Bloco D', floor: '2º Andar', responsible: 'Marcos Souza', email: 'marcos.ti@ifam.edu.br', cpf: '555.555.555-55', siape: '5556667' },
    ];

    const setores = [];
    for (const s of setoresData) {
        const user = await prisma.user.create({
            data: {
                name: s.responsible,
                email: s.email,
                passwordHash: passHash,
                role: 'SERVER',
                cpf: s.cpf,
                siape: s.siape
            }
        });

        const sector = await prisma.sector.create({
            data: {
                name: s.name,
                block: s.block,
                floor: s.floor,
                responsibleId: user.id,
                ordinanceNumber: `PORT-${Math.floor(Math.random() * 900) + 100}/2024`
            }
        });
        setores.push(sector);
    }

    // 4. Criar Empresas e Técnicos
    console.log('🏢 Criando empresas e técnicos...');
    const empresas = [
        { name: 'RefriNorte Climatização', cnpj: '10.100.100/0001-10' },
        { name: 'Amazon Gelo Serviços', cnpj: '20.200.200/0001-20' }
    ];

    for (let i = 0; i < empresas.length; i++) {
        const company = await prisma.company.create({ data: empresas[i] });

        // 2 técnicos por empresa
        for (let j = 1; j <= 2; j++) {
            const isManager = j === 1;
            const user = await prisma.user.create({
                data: {
                    name: `Técnico ${j} - ${company.name}`,
                    email: `tech${j}.${i}@empresa.com`,
                    passwordHash: passHash,
                    role: 'TECHNICIAN',
                    cpf: `999.888.777-${i}${j}`
                }
            });

            await prisma.technician.create({
                data: {
                    userId: user.id,
                    companyId: company.id,
                    isManager: isManager
                }
            });
        }
    }

    // 5. Criar Equipamentos (Assets)
    console.log('❄️ Criando equipamentos...');
    const brands = ['Samsung', 'LG', 'Carrier', 'Gree', 'Elgin'];
    const types = ['Split Hi-Wall', 'Piso Teto', 'K7 (Cassete)', 'Janela'];

    for (const sector of setores) {
        // 3 equipamentos por setor
        for (let k = 1; k <= 3; k++) {
            await prisma.asset.create({
                data: {
                    name: `${types[Math.floor(Math.random() * types.length)]} ${Math.random() > 0.5 ? '12k' : '18k'} BTU`,
                    patrimonyNumber: `IFAM-${sector.name.charAt(0)}${Math.floor(Math.random() * 90000) + 10000}`,
                    brand: brands[Math.floor(Math.random() * brands.length)],
                    model: `MOD-${k}00`,
                    sectorId: sector.id,
                    status: k === 3 ? 'waiting_tech' : 'ok',
                    capacityBTU: k % 2 === 0 ? '12000' : '18000',
                    voltage: '220V',
                    criticality: k === 1 ? 'Alta' : 'Média'
                }
            });
        }
    }

    // 6. Criar Catálogo de Serviços
    console.log('📋 Criando catálogo de serviços...');
    const servicos = [
        { name: 'Limpeza Preventiva (Split)', type: 'service', cost: 150.00 },
        { name: 'Carga de Gás R410A', type: 'service', cost: 250.00 },
        { name: 'Troca de Capacitor', type: 'part', cost: 85.00 },
        { name: 'Reparo em Placa Eletrônica', type: 'service', cost: 450.00 },
        { name: 'Troca de Motor Ventilador', type: 'part', cost: 380.00 },
    ];

    for (const s of servicos) {
        await prisma.catalogItem.create({
            data: {
                name: s.name,
                type: s.type,
                estimatedCost: s.cost,
                isContracted: true
            }
        });
    }

    // 7. Criar alguns Chamados (Tickets)
    console.log('🎫 Criando chamados iniciais...');
    const assetsAll = await prisma.asset.findMany();
    const technicians = await prisma.technician.findMany({ include: { user: true } });

    // 5 Chamados abertos
    for (let m = 0; m < 5; m++) {
        const asset = assetsAll[m];
        await prisma.ticket.create({
            data: {
                description: `Problema detectado no equipamento ${asset.patrimonyNumber}: O ar parou de gelar repentinamente.`,
                status: 'OPEN',
                type: 'CORRECTIVE',
                assetId: asset.id,
                sectorId: asset.sectorId,
                requesterId: (await prisma.user.findFirst({ where: { role: 'SERVER' } })).id
            }
        });
    }

    // 2 Chamados em progresso
    for (let n = 5; n < 7; n++) {
        const asset = assetsAll[n];
        await prisma.ticket.create({
            data: {
                description: `Manutenção corretiva agendada. Verificar ruído excessivo.`,
                status: 'IN_PROGRESS',
                type: 'CORRECTIVE',
                assetId: asset.id,
                sectorId: asset.sectorId,
                requesterId: (await prisma.user.findFirst({ where: { role: 'SERVER' } })).id,
                technicianId: technicians[0].id
            }
        });
    }

    console.log('✨ Super Seed finalizado com sucesso!');
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
