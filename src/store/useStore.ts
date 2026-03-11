import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ServiceItem, Ticket, UserRole, Sector, Asset, Company, CatalogItem, ProblemType, TechnicianProfile } from '@/types';
import {
    addSectorAction,
    addAssetAction,
    updateSectorResponsibleAction,
    changeSectorResponsibleAction,
    deleteCompanyAction,
    deleteTechnicianAction,
    deleteCatalogItemAction,
    deleteProblemTypeAction,
    addCompanyAction,
    addTechnicianAction,
    updateTechnicianAction,
    addCatalogItemAction,
    updateCatalogItemAction,
    addProblemTypeAction,
    updateProblemTypeAction,
    createTicketAction,
    schedulePreventiveAction,
    startServiceAction,
    addItemToTicketAction,
    submitTicketAction,
    updateTicketAction,
    updateItemValidationAction,
    updateCompanyAction,
    updateAssetAction,
    updateSectorAction
} from '@/app/actions/server-actions';
import { getDashboardData } from '@/app/actions/dashboard-data';

interface AppState {
    currentUserRole: UserRole | null;
    currentSectorId: string | null;
    currentUserId: string | null;
    currentUserName: string | null;
    currentUserEmail: string | null;

    sectors: Sector[];
    assets: Asset[];
    tickets: Ticket[];
    companies: Company[];
    catalog: CatalogItem[];
    contracts: import('@/types').Contract[];

    problemTypes: ProblemType[];

    setRole: (role: UserRole) => void;
    setCurrentUser: (user: { id: string, name: string, email: string, role: UserRole, sectorId?: string }) => void;

    // Actions to hydrate data from DB (Simulated or Real)
    setData: (data: import('@/types').Data) => void; // We will use the Data interface from types

    addSector: (sector: Sector) => void;
    updateSector: (id: string, data: { name: string }) => void;
    addAsset: (asset: Asset) => void;
    updateAsset: (id: string, data: Partial<Asset>) => void;
    addCompany: (company: Company) => void;
    updateCompany: (id: string, data: Partial<Company>) => void;
    addTechnician: (companyId: string, tech: TechnicianProfile) => void;
    updateTechnician: (techId: string, data: Partial<TechnicianProfile>) => void;
    addCatalogItem: (item: CatalogItem) => void;
    updateCatalogItem: (id: string, item: Partial<CatalogItem>) => void;
    addProblemType: (problem: ProblemType) => void;
    updateProblemType: (id: string, data: Partial<ProblemType>) => void;

    deleteCompany: (id: string) => void;
    deleteTechnician: (companyId: string, techId: string) => void;
    deleteCatalogItem: (id: string) => void;
    deleteProblemType: (id: string) => void;

    openTicket: (assetId: string, description: string) => void;
    startService: (ticketId: string) => void;
    addItemToTicket: (ticketId: string, item: ServiceItem) => void;
    submitTicket: (ticketId: string) => void;
    updateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
    updateItemValidation: (ticketId: string, itemId: string, status: ServiceItem['validationStatus'], notes?: string) => void;
    updateSectorResponsible: (sectorId: string, data: Partial<import('@/types').SectorResponsible>) => void;
    changeSectorResponsible: (sectorId: string, newResponsible: Omit<import('@/types').SectorResponsible, 'id' | 'isActive'>) => void;

    // NEW: Quotation & Contract Actions
    addContract: (contract: import('@/types').Contract) => void;
    submitQuotation: (ticketId: string, quotation: import('@/types').Quotation) => void;
    approveQuotation: (ticketId: string, approvedById: string) => void;

    schedulePreventive: (assetId: string, scheduledAt: number, technicianId?: string) => void;
    activeTechnicianTab: string;
    setActiveTechnicianTab: (tab: string) => void;
    fetchDashboardData: () => Promise<void>;
}

const MOCK_SECTORS: Sector[] = [
    {
        id: 'sec-1',
        name: 'Coordenação de Tecnologia (CTIC)',
        responsible: {
            id: 'resp-1',
            name: 'João da Silva',
            siape: '1234567',
            email: 'joao.silva@ifam.edu.br',
            password: '123456',
            isActive: true
        },
        responsibleHistory: []
    },
    {
        id: 'sec-2',
        name: 'Auditório Principal',
        responsible: {
            id: 'resp-2',
            name: 'Maria Souza',
            siape: '7654321',
            email: 'maria.souza@ifam.edu.br',
            password: '123456',
            isActive: true
        },
        responsibleHistory: []
    },
];

const MOCK_ASSETS: Asset[] = [
    {
        id: 'ast-1',
        patrimonyNumber: 'IFAM-00100',
        name: 'Split Samsung 12000',
        sectorId: 'sec-1',
        acquisitionDate: '2023-01-15',
        status: 'ok',
        lastMaintenance: '2025-01-20',
        nextMaintenance: '2025-02-20'
    },
    {
        id: 'ast-2',
        patrimonyNumber: 'IFAM-00101',
        name: 'Split Consul 18000',
        sectorId: 'sec-1',
        acquisitionDate: '2022-05-20',
        status: 'waiting_tech',
        lastMaintenance: '2024-11-10',
        nextMaintenance: '2025-02-10'
    },
    {
        id: 'ast-3',
        patrimonyNumber: 'IFAM-00200',
        name: 'Ar Central Carrier',
        sectorId: 'sec-2',
        acquisitionDate: '2020-11-10',
        status: 'paralyzed',
        lastMaintenance: '2024-08-15',
        nextMaintenance: '2025-02-15'
    },
    {
        id: 'ast-4',
        patrimonyNumber: 'IFAM-00500',
        name: 'Bebedouro Industrial',
        sectorId: 'sec-1',
        acquisitionDate: '2019-03-30',
        status: 'ok',
        lastMaintenance: '2025-01-25',
        nextMaintenance: '2025-02-25'
    },
];

const MOCK_COMPANIES: Company[] = [
    { id: 'comp-1', name: 'ArLimpo Refrigeração Ltda', cnpj: '00.000.000/0001-00', technicians: [{ id: 'tech-1', name: 'Carlos Técnico', cpf: '000.000.000-00' }] }
];

const MOCK_CATALOG: CatalogItem[] = [
    // --- SERVIÇOS CONTRATADOS (Termo de Referência / Pregão) ---
    { id: 'cat-01', name: 'Manutenção Preventiva Mensal - Split até 18k', type: 'service', estimatedCost: 120, isContracted: true, description: 'Limpeza de filtros, verificação de dreno e testes de operação.' },
    { id: 'cat-02', name: 'Manutenção Preventiva Mensal - Split 24k a 60k', type: 'service', estimatedCost: 150, isContracted: true, description: 'Limpeza de filtros, verificação de dreno e testes de operação.' },
    { id: 'cat-03', name: 'Manutenção Preventiva Trimestral - Split até 18k', type: 'service', estimatedCost: 180, isContracted: true, description: 'Limpeza química da evaporadora e condensadora no local.' },
    { id: 'cat-04', name: 'Manutenção Preventiva Trimestral - Split 24k a 60k', type: 'service', estimatedCost: 250, isContracted: true, description: 'Limpeza química da evaporadora e condensadora no local.' },
    { id: 'cat-05', name: 'Limpeza e Higienização de Bebedouro', type: 'service', estimatedCost: 85, isContracted: true, description: 'Sanitização de reservatórios e troca de elementos filtrantes.' },
    { id: 'cat-06', name: 'Visita Técnica para Diagnóstico (Corretiva)', type: 'service', estimatedCost: 60, isContracted: true, description: 'Identificação de falhas e elaboração de orçamento.' },

    // --- SERVIÇOS SOB DEMANDA ---
    { id: 'cat-07', name: 'Instalação de Ar Condicionado Split até 12k', type: 'service', estimatedCost: 0, isContracted: false, description: 'Instalação completa com infra até 3m.' },
    { id: 'cat-08', name: 'Desinstalação e Recolhimento de Gás', type: 'service', estimatedCost: 0, isContracted: false },
    { id: 'cat-09', name: 'Reparo em Tubulação de Cobre (Solda)', type: 'service', estimatedCost: 0, isContracted: false },
    { id: 'cat-10', name: 'Teste de Estanqueidade com Nitrogênio', type: 'service', estimatedCost: 0, isContracted: false },
    { id: 'cat-11', name: 'Limpeza Química em Oficina (Remoção)', type: 'service', estimatedCost: 0, isContracted: false },
    { id: 'cat-12', name: 'Substituição de Compressor (Mão de Obra)', type: 'service', estimatedCost: 0, isContracted: false },

    // --- PEÇAS ---
    { id: 'cat-13', name: 'Carga de Gás R-410A (por kg)', type: 'part', estimatedCost: 0, isContracted: false, description: 'Gás ecológico para sistemas Inverter.' },
    { id: 'cat-14', name: 'Carga de Gás R-22 (por kg)', type: 'part', estimatedCost: 0, isContracted: false },
    { id: 'cat-15', name: 'Carga de Gás R-134a (por kg)', type: 'part', estimatedCost: 0, isContracted: false, description: 'Utilizado em bebedouros e geladeiras.' },
    { id: 'cat-16', name: 'Compressor Rotativo 12.000 BTUs / 220V', type: 'part', estimatedCost: 0, isContracted: false },
    { id: 'cat-17', name: 'Compressor Rotativo 18.000 BTUs / 220V', type: 'part', estimatedCost: 0, isContracted: false },
    { id: 'cat-18', name: 'Placa Principal Split Samsung Inverter', type: 'part', estimatedCost: 0, isContracted: false },
    { id: 'cat-19', name: 'Motor Ventilador Evaporadora', type: 'part', estimatedCost: 0, isContracted: false },
    { id: 'cat-20', name: 'Motor Ventilador Condensadora', type: 'part', estimatedCost: 0, isContracted: false },
    { id: 'cat-21', name: 'Capacitor de Partida 35uF', type: 'part', estimatedCost: 0, isContracted: false },
    { id: 'cat-22', name: 'Capacitor de Partida 45uF', type: 'part', estimatedCost: 0, isContracted: false },
    { id: 'cat-23', name: 'Sensor de Temperatura / Degelo', type: 'part', estimatedCost: 0, isContracted: false },
    { id: 'cat-24', name: 'Filtro de Água (Elementos Filtrantes)', type: 'part', estimatedCost: 0, isContracted: false },
    { id: 'cat-25', name: 'Termostato Mecânico Bebedouro', type: 'part', estimatedCost: 0, isContracted: false },
    { id: 'cat-26', name: 'Relé de Partida / Protetor Térmico', type: 'part', estimatedCost: 0, isContracted: false },
    { id: 'cat-27', name: 'Dreno de Escoamento (mangueira/tubo)', type: 'part', estimatedCost: 0, isContracted: false },
];

const MOCK_PROBLEM_TYPES: ProblemType[] = [
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

const MOCK_TICKETS: Ticket[] = [
    {
        id: 't-101',
        assetId: 'ast-2',
        sectorId: 'sec-1',
        companyId: 'comp-1',
        requesterName: 'João da Silva',
        description: 'Não está ligando.',
        status: 'open',
        type: 'corrective',
        items: [],
        openedAt: Date.now() - 1000000,
        updatedAt: Date.now(),
    },
    {
        id: 't-105',
        assetId: 'ast-3',
        sectorId: 'sec-2',
        companyId: 'comp-1',
        requesterName: 'Maria Souza',
        description: 'Compressor travado. Aguardando peça importada.',
        status: 'in_progress',
        type: 'corrective',
        items: [],
        openedAt: Date.now() - 55000000,
        updatedAt: Date.now(),
    },
    {
        id: 't-200',
        assetId: 'ast-2',
        sectorId: 'sec-1',
        requesterName: 'João da Silva',
        description: 'Troca de compressor e carga de gás.',
        status: 'awaiting_approval',
        type: 'corrective',
        items: [],
        openedAt: Date.now() - 100000,
        updatedAt: Date.now(),
        quotation: {
            id: 'q-1',
            ticketId: 't-200',
            totalValue: 790,
            fileUrl: '#'
        }
    }
];

// MOCK DATA REMOVED FROM INITIAL STATE INITIATION - Will be loaded via setData
// Keeping constants for fallback/seed if needed but state starts empty
// Actually, to avoid breaking everything immediately without a fetch, we keep the mocks but 
// we will overwrite them on app load if we want to be "real".
// For now, let's keep the mock data as "Initial State" but allow overwriting.

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            currentUserRole: null, // Starts null, waits for auth
            currentSectorId: null,
            currentUserId: null,
            currentUserName: null,
            currentUserEmail: null,

            sectors: [],
            assets: [],
            tickets: [],
            companies: [],
            catalog: [],
            contracts: [],
            problemTypes: [],
            activeTechnicianTab: 'tasks',
            setActiveTechnicianTab: (tab) => set({ activeTechnicianTab: tab }),

            fetchDashboardData: async () => {
                const data = await getDashboardData();
                if (data.success) {
                    // @ts-ignore
                    useAppStore.getState().setData(data);
                }
            },


            setRole: (role) => set({ currentUserRole: role }),
            setCurrentUser: (user) => set({
                currentUserRole: user.role,
                currentUserId: user.id,
                currentUserName: user.name,
                currentUserEmail: user.email,
                currentSectorId: user.sectorId || null
            }),

            setData: (data) => set({
                sectors: data.sectors,
                assets: data.assets,
                tickets: data.tickets || [],
                companies: data.companies,
                catalog: data.catalog || [],
                problemTypes: data.problemTypes || []
            }),

            addSector: (sector) => {
                set((state) => ({ sectors: [...state.sectors, sector] }));
                addSectorAction(sector);
            },
            addAsset: (asset) => {
                set((state) => ({ assets: [...state.assets, asset] }));
                addAssetAction(asset);
            },
            updateAsset: (id, data) => {
                set((state) => ({
                    assets: state.assets.map(a => a.id === id ? { ...a, ...data } : a)
                }));
                updateAssetAction(id, data);
            },
            updateSector: (id, data) => {
                set((state) => ({
                    sectors: state.sectors.map(s => s.id === id ? { ...s, name: data.name } : s)
                }));
                updateSectorAction(id, data);
            },
            addCompany: (comp) => {
                set((state) => ({ companies: [...state.companies, comp] }));
                addCompanyAction(comp);
            },
            updateCompany: (id, data) => {
                set((state) => ({
                    companies: state.companies.map(c => c.id === id ? { ...c, ...data } : c)
                }));
                updateCompanyAction(id, data);
            },
            addTechnician: (companyId, tech) => {
                set((state) => ({
                    companies: state.companies.map(c => c.id === companyId ? { ...c, technicians: [...c.technicians, tech] } : c)
                }));
                addTechnicianAction(companyId, tech);
            },
            updateTechnician: (techId, data) => {
                set((state) => ({
                    companies: state.companies.map(c => ({
                        ...c,
                        technicians: c.technicians.map(t => t.id === techId ? { ...t, ...data } : t)
                    }))
                }));
                updateTechnicianAction(techId, data);
            },
            addCatalogItem: (item) => {
                set((state) => ({ catalog: [...state.catalog, item] }));
                addCatalogItemAction(item);
            },
            updateCatalogItem: (id, data) => {
                set((state) => ({
                    catalog: state.catalog.map(c => c.id === id ? { ...c, ...data } : c)
                }));
                updateCatalogItemAction(id, data);
            },
            addProblemType: (problem) => {
                set((state) => ({ problemTypes: [...state.problemTypes, problem] }));
                addProblemTypeAction(problem);
            },
            updateProblemType: (id, data) => {
                set((state) => ({
                    problemTypes: state.problemTypes.map(p => p.id === id ? { ...p, ...data } : p)
                }));
                updateProblemTypeAction(id, data);
            },

            deleteCompany: (id) => {
                set((state) => ({ companies: state.companies.filter(c => c.id !== id) }));
                deleteCompanyAction(id);
            },
            deleteTechnician: (companyId, techId) => {
                set((state) => ({
                    companies: state.companies.map(c => c.id === companyId ? { ...c, technicians: c.technicians.filter(t => t.id !== techId) } : c)
                }));
                deleteTechnicianAction(companyId, techId);
            },
            deleteCatalogItem: (id) => {
                set((state) => ({ catalog: state.catalog.filter(c => c.id !== id) }));
                deleteCatalogItemAction(id);
            },
            deleteProblemType: (id) => {
                set((state) => ({ problemTypes: state.problemTypes.filter(p => p.id !== id) }));
                deleteProblemTypeAction(id);
            },

            openTicket: (assetId, description) => {
                let newTicket: Ticket | undefined;
                set((state) => {
                    const asset = state.assets.find(a => a.id === assetId);
                    if (!asset) return state;

                    // Auto status change asset to 'waiting_tech'
                    const updatedAssets = state.assets.map(a => a.id === assetId ? { ...a, status: 'waiting_tech' as const } : a);

                    const ticket: Ticket = {
                        id: `t-${Date.now()}`,
                        assetId,
                        sectorId: asset.sectorId,
                        requesterName: 'Admin/System', // Ideally from session
                        description,
                        status: 'open',
                        type: 'corrective',
                        items: [],
                        openedAt: Date.now(),
                        updatedAt: Date.now()
                    };

                    newTicket = ticket;

                    return { tickets: [...state.tickets, ticket], assets: updatedAssets };
                });

                if (newTicket) createTicketAction(newTicket);
            },

            schedulePreventive: (assetId, scheduledAt, technicianId) => {
                const asset = useAppStore.getState().assets.find(a => a.id === assetId);
                if (!asset) return;

                const tempId = `t-prev-${Date.now()}`;

                const ticket: Ticket = {
                    id: tempId,
                    assetId,
                    sectorId: asset.sectorId,
                    technicianId,
                    requesterName: 'Sistema/Painel Técnico',
                    description: 'Manutenção Preventiva Agendada',
                    status: 'scheduled',
                    type: 'preventive',
                    items: [],
                    openedAt: Date.now(),
                    updatedAt: Date.now(),
                    scheduledAt,
                };

                // Optimistic update
                set((state) => ({ tickets: [...state.tickets, ticket] }));

                // Persist to DB using dedicated preventive action
                schedulePreventiveAction({
                    id: tempId,
                    assetId,
                    sectorId: asset.sectorId,
                    technicianId,
                    scheduledAt,
                    description: 'Manutenção Preventiva Agendada',
                }).then(result => {
                    if (result.success) {
                        // RE-FETCH data from server to ensure we have the real ID and code
                        useAppStore.getState().fetchDashboardData();
                    } else {
                        console.error('[schedulePreventive] DB save failed:', result.error);
                        // Remove optimistic ticket on failure
                        set(state => ({
                            tickets: state.tickets.filter(t => t.id !== tempId)
                        }));
                    }
                });
            },

            startService: (ticketId) => {
                set((state) => ({
                    tickets: state.tickets.map(t => t.id === ticketId ? { ...t, status: 'in_progress' } : t)
                }));
                startServiceAction(ticketId);
            },

            addItemToTicket: (ticketId, item) => {
                set((state) => {
                    const ticketIndex = state.tickets.findIndex(t => t.id === ticketId);
                    if (ticketIndex === -1) return state;

                    const updatedTickets = [...state.tickets];
                    updatedTickets[ticketIndex].items.push(item);
                    return { tickets: updatedTickets };
                });
                addItemToTicketAction(ticketId, item);
            },

            submitTicket: (ticketId) => {
                set((state) => ({
                    tickets: state.tickets.map(t => t.id === ticketId ? { ...t, status: 'waiting_validation' } : t)
                }));
                submitTicketAction(ticketId);
            },

            // ADMIN: Generic generic update for tickets
            updateTicket: (ticketId, updates) => {
                set((state) => ({
                    tickets: state.tickets.map(t => t.id === ticketId ? { ...t, ...updates } : t)
                }));
                updateTicketAction(ticketId, updates);
            },


            updateItemValidation: (ticketId, itemId, status, notes) => {
                set((state) => {
                    const ticketIndex = state.tickets.findIndex(t => t.id === ticketId);
                    if (ticketIndex === -1) return state;

                    const updatedTickets = [...state.tickets];
                    const itemIndex = updatedTickets[ticketIndex].items.findIndex(i => i.id === itemId);
                    if (itemIndex > -1) {
                        updatedTickets[ticketIndex].items[itemIndex].validationStatus = status;
                        if (notes) updatedTickets[ticketIndex].items[itemIndex].serverNotes = notes;
                    }
                    return { tickets: updatedTickets };
                });
                updateItemValidationAction(ticketId, itemId, status, notes);
            },
            updateSectorResponsible: (sectorId, data) => {
                set((state) => ({
                    sectors: state.sectors.map(s => {
                        if (s.id !== sectorId) return s;
                        return {
                            ...s,
                            responsible: { ...s.responsible, ...data }
                        };
                    })
                }));
                updateSectorResponsibleAction(sectorId, data);
            },
            changeSectorResponsible: (sectorId: string, newResponsible: Omit<import('@/types').SectorResponsible, 'id' | 'isActive'>) => {
                let historyItem: any;
                let nextResp: any;

                set((state) => ({
                    sectors: state.sectors.map(s => {
                        if (s.id !== sectorId) return s;

                        // Archive current responsible to history
                        const archivedResponsible = {
                            ...s.responsible,
                            isActive: false,
                            terminationDate: new Date().toISOString() // Auto close current
                        };
                        historyItem = archivedResponsible;

                        // Create new active responsible
                        const nextResponsible: import('@/types').SectorResponsible = {
                            id: Math.random().toString(),
                            isActive: true, // Auto active
                            ...newResponsible
                        };
                        nextResp = nextResponsible;

                        return {
                            ...s,
                            responsible: nextResponsible,
                            responsibleHistory: [archivedResponsible, ...s.responsibleHistory]
                        };
                    })
                }));

                if (historyItem && nextResp) {
                    changeSectorResponsibleAction(sectorId, historyItem, nextResp);
                }
            },

            addContract: (contract) => {
                set((state) => ({ contracts: [...(state.contracts || []), contract] }));
                // addContractAction(contract); // TODO: Implement
            },

            submitQuotation: (ticketId, quotation) => {
                set((state) => ({
                    tickets: state.tickets.map(t => t.id === ticketId ? {
                        ...t,
                        status: 'awaiting_approval',
                        quotation: quotation
                    } : t)
                }));
                // submitQuotationAction(ticketId, quotation); // TODO: Implement
            },

            approveQuotation: (ticketId, approvedById) => {
                set((state) => ({
                    tickets: state.tickets.map(t => {
                        if (t.id !== ticketId) return t;
                        const quotation = t.quotation;
                        if (!quotation) return t;

                        return {
                            ...t,
                            status: 'authorized',
                            quotation: {
                                ...quotation,
                                approvedById,
                                approvedAt: new Date().toISOString()
                            }
                        };
                    })
                }));
                // approveQuotationAction(ticketId, approvedById); // TODO: Implement
            },
        }),
        {
            name: 'valid-ar-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
