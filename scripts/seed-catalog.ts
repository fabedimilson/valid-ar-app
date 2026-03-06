
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATALOG_ITEMS = [
    // --- SERVIÇOS DE LIMPEZA ---
    { name: 'Limpeza Química - Split até 12k BTUs', type: 'service', estimatedCost: 150.00, description: 'Limpeza completa com produtos químicos biodegradáveis.' },
    { name: 'Limpeza Química - Split 18k-24k BTUs', type: 'service', estimatedCost: 200.00, description: 'Limpeza interna e externa para equipamentos de médio porte.' },
    { name: 'Limpeza Química - ACJ / Janela', type: 'service', estimatedCost: 120.00, description: 'Desmontagem e higienização completa.' },
    { name: 'Limpeza de Dutos (Por Metro)', type: 'service', estimatedCost: 80.00, description: 'Higienização robotizada de dutos de ar central.' },
    { name: 'Higienização de Filtros (Simples)', type: 'service', estimatedCost: 50.00, description: 'Lavagem apenas dos filtros de ar.' },

    // --- GÁS E REFRIGERAÇÃO ---
    { name: 'Carga de Gás R410A (Completa)', type: 'service', estimatedCost: 250.00, description: 'Recarga total de fluido refrigerante ecológico.' },
    { name: 'Carga de Gás R22 (Completa)', type: 'service', estimatedCost: 280.00, description: 'Recarga total de fluido (equipamentos antigos).' },
    { name: 'Complemento de Gás', type: 'service', estimatedCost: 120.00, description: 'Adição de gás para completar a pressão ideal.' },
    { name: 'Solda / Correção de Vazamento', type: 'service', estimatedCost: 100.00, description: 'Localização e brasagem de furos na tubulação.' },
    { name: 'Vácuo e Desidratação', type: 'service', estimatedCost: 80.00, description: 'Procedimento técnico antes da carga de gás.' },

    // --- PEÇAS ELÉTRICAS ---
    { name: 'Capacitor 35uF', type: 'part', estimatedCost: 45.00, description: 'Capacitor de marcha para compressor.' },
    { name: 'Capacitor 45uF', type: 'part', estimatedCost: 55.00, description: 'Capacitor de marcha para compressor de maior potência.' },
    { name: 'Capacitor Ventilador 2uF-5uF', type: 'part', estimatedCost: 25.00, description: 'Para motor ventilador da evaporadora ou condensadora.' },
    { name: 'Sensor de Temperatura 10k', type: 'part', estimatedCost: 30.00, description: 'Sensor de ambiente ou serpentina.' },
    { name: 'Relé da Placa Eletrônica', type: 'part', estimatedCost: 40.00, description: 'Substituição de componente na placa.' },
    { name: 'Contatora Magnética', type: 'part', estimatedCost: 85.00, description: 'Chave de acionamento para compressores trifásicos.' },
    { name: 'Placa Universal (Kit)', type: 'part', estimatedCost: 250.00, description: 'Substituição da placa original por universal.' },

    // --- PEÇAS MECÂNICAS / ESTRUTURAIS ---
    { name: 'Motor Ventilador Evaporadora', type: 'part', estimatedCost: 250.00, description: 'Motor da unidade interna.' },
    { name: 'Motor Ventilador Condensadora', type: 'part', estimatedCost: 320.00, description: 'Motor da unidade externa.' },
    { name: 'Hélice Condensadora', type: 'part', estimatedCost: 80.00, description: 'Hélice plástica do motor externo.' },
    { name: 'Turbina Evaporadora', type: 'part', estimatedCost: 120.00, description: 'Rotor centrífugo da unidade interna.' },
    { name: 'Compressor Rotativo 12k BTUs', type: 'part', estimatedCost: 800.00, description: 'Coração do sistema (novo).' },
    { name: 'Isolamento Térmico (Metro)', type: 'part', estimatedCost: 15.00, description: 'Esponjoso para tubulação de cobre.' },
    { name: 'Suporte de Condensadora (Par)', type: 'part', estimatedCost: 60.00, description: 'Mão francesa reforçada.' },
];

async function seed() {
    console.log('Seeding Catalog...');

    // Clear existing (optional, usually good for dev)
    // await prisma.catalogItem.deleteMany(); 

    for (const item of CATALOG_ITEMS) {
        // Upsert to avoid duplicates if running multiple times
        const exists = await prisma.catalogItem.findFirst({ where: { name: item.name } });

        if (!exists) {
            await prisma.catalogItem.create({
                data: {
                    name: item.name,
                    type: item.type,
                    estimatedCost: item.estimatedCost,
                    description: item.description
                }
            });
            console.log(`+ Added: ${item.name}`);
        } else {
            console.log(`= Skipped (Exists): ${item.name}`);
        }
    }

    console.log('Catalog seeding complete.');
}

seed()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
