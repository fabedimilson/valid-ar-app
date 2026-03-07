
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
    { id: 'prob-vazamento-gas', label: 'Vazamento de Fluido Refrigerante', description: 'Suspeita de vazamento de gás (gelo na tubulação ou baixo rendimento).' },
    { id: 'prob-compressor-n-parte', label: 'Compressor não parte', description: 'Ventilador externo funciona, mas o compressor não liga.' },
    { id: 'prob-congelando', label: 'Congelamento da Unidade Interna', description: 'Formação de gelo na colmeia da evaporadora.' },
    { id: 'prob-outros', label: 'Outro Problema', description: 'Outro defeito não listado acima.' },
];

async function main() {
    console.log('Seeding problem types...');
    for (const prob of PROBLEM_TYPES) {
        await prisma.problemType.upsert({
            where: { id: prob.id },
            update: {
                label: prob.label,
                description: prob.description,
                active: true
            },
            create: {
                id: prob.id,
                label: prob.label,
                description: prob.description,
                active: true
            }
        });
    }
    console.log('Done!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
