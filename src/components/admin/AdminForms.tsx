"use client";

import { useAppStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Asset, Sector, Company, CatalogItem } from "@/types";
import { Plus, Building, User, Trash2, Pencil, Package, UserCog, History, Settings, Eye, ChevronDown, Search, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HistoryList } from "@/components/HistoryList";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { QuotationApprovalTab } from "@/components/admin/QuotationApprovalTab";

// Placeholder for HistoryDialog
function HistoryDialog({ asset }: { asset: Asset }) {
    const { tickets, sectors, companies } = useAppStore();

    // Filtrar tickets relacionados ao patrimônio
    const assetTickets = tickets.filter(t => t.assetId === asset.id);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-300 hover:bg-slate-50">
                    <Eye className="w-4 h-4 text-slate-600" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Histórico - {asset.patrimonyNumber}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                    <div className="bg-slate-50 p-4 rounded-lg border">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="block text-xs text-slate-500 uppercase font-bold">Equipamento</span>
                                <span className="font-medium">{asset.name}</span>
                            </div>
                            <div>
                                <span className="block text-xs text-slate-500 uppercase font-bold">Patrimônio</span>
                                <span className="font-medium font-mono">{asset.patrimonyNumber}</span>
                            </div>
                            <div>
                                <span className="block text-xs text-slate-500 uppercase font-bold">Investimento Total</span>
                                <span className="font-bold text-blue-700">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                        assetTickets.reduce((acc, t) => acc + t.items.reduce((sum, item) => sum + (item.estimatedValue || 0), 0), 0)
                                    )}
                                </span>
                            </div>
                            <div>
                                <span className="block text-xs text-slate-500 uppercase font-bold">Status Atual</span>
                                <Badge variant="outline" className="bg-white">{asset.status.toUpperCase()}</Badge>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-sm">Histórico de Peças e Serviços Aplicados</h4>
                            <span className="text-[10px] text-slate-500">Última atualização: {new Date().toLocaleDateString()}</span>
                        </div>

                        {assetTickets.length === 0 ? (
                            <div className="text-center text-slate-400 py-8 bg-slate-50 rounded-lg border-2 border-dashed">
                                Nenhuma intervenção registrada para este equipamento.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {assetTickets.map(ticket => {
                                    const sector = sectors.find(s => s.id === ticket.sectorId);
                                    const company = companies.find(c => c.id === ticket.companyId);
                                    const ticketTotal = ticket.items.reduce((sum, item) => sum + (item.estimatedValue || 0), 0);

                                    return (
                                        <div key={ticket.id} className="border rounded-xl overflow-hidden bg-white shadow-sm">
                                            <div className="bg-slate-50 px-4 py-2 border-b flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <Badge className="font-mono text-[10px] bg-slate-900">
                                                        {ticket.code ? `VOS ${String(ticket.code).padStart(6, '0')}` : `#${ticket.id.slice(0, 6)}`}
                                                    </Badge>
                                                    <span className="text-xs font-bold text-slate-600">
                                                        {ticket.type === 'preventive' ? 'Manutenção Preventiva' : 'Manutenção Corretiva'}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {new Date(ticket.updatedAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <div className="p-4 space-y-3">
                                                <div className="grid grid-cols-2 gap-4 text-[11px] text-slate-500 mb-2">
                                                    <span>📍 {sector?.name}</span>
                                                    <span className="text-right">🏢 {company?.name || 'Sistema/Próprio'}</span>
                                                </div>

                                                {/* LIST OF ITEMS IN THIS TICKET */}
                                                <div className="space-y-1">
                                                    {ticket.items.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between items-center text-sm py-1 border-b border-slate-50 last:border-0">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                                                <span className="text-slate-700">{item.title}</span>
                                                            </div>
                                                            <span className="font-mono font-medium text-slate-600">
                                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.estimatedValue)}
                                                            </span>
                                                        </div>
                                                    ))}

                                                    {ticket.items.length === 0 && (
                                                        <p className="text-[11px] text-slate-400 italic">Nenhum item detalhado nesta OS.</p>
                                                    )}
                                                </div>

                                                <div className="pt-2 flex justify-between items-center">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total da OS</span>
                                                    <span className="text-sm font-black text-slate-800">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ticketTotal)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

const formatCNPJ = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .substring(0, 18);
};

const formatCPF = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1')
        .substring(0, 14);
};

const assetSubTypes: Record<string, string[]> = {
    "Ar-Condicionado": ["Split Hi-Wall", "Split Piso-Teto", "Split Cassete", "Janela (ACJ)", "Portátil", "Cortina de Ar", "Multi-Split", "Chiller/Central"],
    "Geladeira/Refrigerador": ["Geladeira Duplex", "Geladeira 1 Porta", "Expositor Vertical", "Frigobar", "Expositor Horizontal"],
    "Freezer": ["Freezer Horizontal", "Freezer Vertical"],
    "Bebedouro": ["Bebedouro Industrial", "Bebedouro Garrafão", "Purificador Parede", "Bebedouro de Pressão"],
    "Câmara Fria": ["Resfriada", "Congelada"]
};

export function AdminForms() {
    const {
        sectors, addSector, updateSector,
        addAsset, assets, updateAsset,
        addCompany, companies, updateCompany, deleteCompany,
        addTechnician, updateTechnician, deleteTechnician,
        catalog, addCatalogItem, updateCatalogItem, deleteCatalogItem,
        problemTypes, addProblemType, updateProblemType, deleteProblemType,
        changeSectorResponsible, updateSectorResponsible, tickets
    } = useAppStore();

    const pendingTickets = tickets.filter(t => t.status === 'awaiting_approval');

    // --- STATES ---

    // Assets
    const [assetName, setAssetName] = useState("");
    const [assetPatrimony, setAssetPatrimony] = useState("");
    const [assetBrand, setAssetBrand] = useState("");
    const [assetModel, setAssetModel] = useState("");
    const [assetSector, setAssetSector] = useState("");
    const [acquisitionDate, setAcquisitionDate] = useState("");
    const [assetSerial, setAssetSerial] = useState("");
    const [assetCategory, setAssetCategory] = useState("");
    const [assetSubType, setAssetSubType] = useState("");
    const [assetBTU, setAssetBTU] = useState("");
    const [assetLiters, setAssetLiters] = useState("");
    const [assetVoltage, setAssetVoltage] = useState("");
    const [assetGas, setAssetGas] = useState("");
    const [assetCompressor, setAssetCompressor] = useState("");
    const [assetCriticality, setAssetCriticality] = useState("");
    const [assetPower, setAssetPower] = useState("");
    const [decommissionDate, setDecommissionDate] = useState("");
    const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
    // View Mode & Search for Assets
    const [assetViewMode, setAssetViewMode] = useState<'list' | 'form'>('list');
    const [assetSearch, setAssetSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [sectorFilter, setSectorFilter] = useState<string>("all");

    // Sectors
    const [sectorName, setSectorName] = useState("");
    const [sectorBlock, setSectorBlock] = useState("");
    const [sectorFloor, setSectorFloor] = useState("");
    const [sectorRoom, setSectorRoom] = useState("");
    const [respName, setRespName] = useState("");
    const [respSiape, setRespSiape] = useState("");
    const [respEmail, setRespEmail] = useState("");
    const [respOrdinance, setRespOrdinance] = useState("");
    const [respDate, setRespDate] = useState("");
    const [respTermination, setRespTermination] = useState("");
    const [editingSectorId, setEditingSectorId] = useState<string | null>(null);
    const [sectorSearch, setSectorSearch] = useState("");
    const [sectorViewMode, setSectorViewMode] = useState<"list" | "form">("list");
    const [sectorDialogOpen, setSectorDialogOpen] = useState(false);
    const [ageFilter, setAgeFilter] = useState("all");

    // Change Responsible Dialog States
    const [newRespName, setNewRespName] = useState("");
    const [newRespSiape, setNewRespSiape] = useState("");
    const [newRespEmail, setNewRespEmail] = useState("");
    const [newRespOrdinance, setNewRespOrdinance] = useState("");
    const [newRespDate, setNewRespDate] = useState("");
    const [changeRespDialogOpen, setChangeRespDialogOpen] = useState(false);
    const [selectedSectorForRespChange, setSelectedSectorForRespChange] = useState<Sector | null>(null);

    // History Dialog States
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
    const [selectedSectorForHistory, setSelectedSectorForHistory] = useState<Sector | null>(null);

    const openHistoryDialog = (s: Sector) => {
        setSelectedSectorForHistory(s);
        setHistoryDialogOpen(true);
    };


    // Edit Responsible Dialog States
    const [editRespName, setEditRespName] = useState("");
    const [editRespSiape, setEditRespSiape] = useState("");
    const [editRespEmail, setEditRespEmail] = useState("");
    const [editRespOrdinance, setEditRespOrdinance] = useState("");
    const [editRespDate, setEditRespDate] = useState("");
    const [editRespActive, setEditRespActive] = useState(true);
    const [editRespDialogOpen, setEditRespDialogOpen] = useState(false);
    const [selectedSectorForRespEdit, setSelectedSectorForRespEdit] = useState<Sector | null>(null);

    // Companies & Techs
    const [compName, setCompName] = useState("");
    const [compCnpj, setCompCnpj] = useState("");
    const [editingCompId, setEditingCompId] = useState<string | null>(null);
    const [companyDialogOpen, setCompanyDialogOpen] = useState(false);

    const [techName, setTechName] = useState("");
    const [techCpf, setTechCpf] = useState("");
    const [techEmail, setTechEmail] = useState("");
    const [selectedCompId, setSelectedCompId] = useState("");
    const [techDialogOpen, setTechDialogOpen] = useState(false);
    const [editingTechId, setEditingTechId] = useState<string | null>(null);
    const [techIsManager, setTechIsManager] = useState(false);

    // Catalog (Items & Problems) - Legacy Logic
    const [catItemName, setCatItemName] = useState("");
    const [catItemCost, setCatItemCost] = useState("");
    const [catItemType, setCatItemType] = useState<"service" | "part">("service");
    const [catItemDesc, setCatItemDesc] = useState("");
    const [catItemIsContracted, setCatItemIsContracted] = useState(false);
    const [editingCatItemId, setEditingCatItemId] = useState<string | null>(null);
    const [probLabel, setProbLabel] = useState("");
    const [probDesc, setProbDesc] = useState("");
    const [editingProbTypeId, setEditingProbTypeId] = useState<string | null>(null);

    // Fiscal de Contrato
    const [fiscalName, setFiscalName] = useState("");
    const [fiscalEmail, setFiscalEmail] = useState("");
    const [fiscalPassword, setFiscalPassword] = useState("");


    // --- HELPERS ---
    const calculateAssetAge = (dateString?: string | Date | null) => {
        if (!dateString) return "-";
        const acquisition = new Date(dateString);
        const today = new Date();

        let years = today.getFullYear() - acquisition.getFullYear();
        let months = today.getMonth() - acquisition.getMonth();

        if (months < 0) {
            years--;
            months += 12;
        }

        if (years === 0 && months === 0) return "Novo";
        if (years === 0) return `${months} m`;
        if (months === 0) return `${years} a`;

        return `${years}a ${months}m`;
    };

    const checkAgeFilter = (dateString: string | Date | null | undefined, filter: string) => {
        if (filter === "all") return true;
        if (!dateString) return false;

        const acquisition = new Date(dateString);
        const today = new Date();
        let years = today.getFullYear() - acquisition.getFullYear();
        let months = today.getMonth() - acquisition.getMonth();
        if (months < 0) { years--; months += 12; }

        const totalMonths = (years * 12) + months;

        switch (filter) {
            case "0-1": return totalMonths <= 12;
            case "1-3": return totalMonths > 12 && totalMonths <= 36;
            case "3-5": return totalMonths > 36 && totalMonths <= 60;
            case "5+": return totalMonths > 60;
            case "10+": return totalMonths > 120;
            default: return true;
        }
    };

    // --- HANDLERS ---

    // Assets
    const handleSaveAsset = async () => {
        // Auto-generate name if empty, combining Category + Brand + Model
        let finalName = assetName;
        if (!finalName.trim()) {
            finalName = `${assetCategory} ${assetBrand} ${assetModel}`.trim();
        }

        if (!finalName || !assetPatrimony || !assetSector) {
            toast.error("Preencha os campos obrigatórios (Categoria, Patrimônio, Setor).");
            return;
        }

        const payload = {
            name: finalName,
            patrimonyNumber: assetPatrimony,
            brand: assetBrand,
            model: assetModel,
            sectorId: assetSector,
            acquisitionDate,
            serialNumber: assetSerial,
            category: assetCategory,
            subType: assetSubType, // Adicionado campo de Subtipo
            capacityBTU: assetBTU,
            capacityLiters: assetLiters ? parseFloat(assetLiters) : undefined,
            voltage: assetVoltage,
            gasType: assetGas,
            compressorType: assetCompressor,
            criticality: assetCriticality,
            powerUnit: assetPower,
            decommissionDate: decommissionDate || undefined,
            status: 'ok' as const,
        };
        if (editingAssetId) {
            updateAsset(editingAssetId, payload);
        } else {
            addAsset({
                id: uuidv4(),
                ...payload,
                status: 'ok', // Fixed to match type
                // history: []
            } as any);
        }
        // Reset Success
        toast.success(editingAssetId ? "Patrimônio atualizado!" : "Patrimônio cadastrado!");
        setAssetViewMode('list');
        resetAssetForm();
    };

    const deleteAssetItem = async (id: string) => {
        // Implement delete logic if needed
    };

    const resetAssetForm = () => {
        setAssetName(""); setAssetPatrimony(""); setAssetBrand(""); setAssetModel(""); setAssetSector(""); setAcquisitionDate("");
        setAssetSerial(""); setAssetCategory(""); setAssetSubType(""); setAssetBTU(""); setAssetLiters("");
        setAssetVoltage(""); setAssetGas(""); setAssetCompressor(""); setAssetCriticality(""); setAssetPower("");
        setDecommissionDate("");
        setEditingAssetId(null);
    };

    const startEditingAsset = (a: Asset) => {
        setEditingAssetId(a.id);
        setAssetName(a.name);
        setAssetPatrimony(a.patrimonyNumber);
        setAssetBrand(a.brand || "");
        setAssetModel(a.model || "");
        setAssetSector(a.sectorId);
        setAcquisitionDate(a.acquisitionDate ? new Date(a.acquisitionDate).toISOString().split('T')[0] : "");
        setAssetSerial(a.serialNumber || "");
        setAssetCategory(a.category || "");
        setAssetSubType(a.subType || "");
        setAssetBTU(a.capacityBTU || "");
        setAssetLiters(a.capacityLiters ? String(a.capacityLiters) : "");
        setAssetVoltage(a.voltage || "");
        setAssetGas(a.gasType || "");
        setAssetCompressor(a.compressorType || "");
        setAssetCriticality(a.criticality || "");
        setAssetPower(a.power || "");
        setDecommissionDate(a.decommissionDate ? new Date(a.decommissionDate).toISOString().split('T')[0] : "");
        setAssetViewMode('form');
    };

    const openNewAssetDialog = () => {
        resetAssetForm();
        setAssetViewMode('form');
    };

    // Sectors
    // Sectors
    const handleSaveSector = () => {
        if (!sectorName) {
            toast.error("Nome do setor é obrigatório");
            return;
        }

        const sectorData = {
            name: sectorName,
            block: sectorBlock,
            floor: sectorFloor,
            room: sectorRoom,
        };

        if (editingSectorId) {
            // Edit Mode
            updateSector(editingSectorId, sectorData);
            toast.success("Setor atualizado!");
        } else {
            // Create Mode - Full Data
            if (!respName || !respEmail) {
                toast.error("Dados do responsável são obrigatórios para novos setores");
                return;
            }

            addSector({
                id: uuidv4(),
                ...sectorData,
                responsible: {
                    id: uuidv4(),
                    name: respName,
                    siape: respSiape,
                    email: respEmail,
                    ordinanceNumber: respOrdinance,
                    designationDate: respDate,
                    isActive: true
                },
                responsibleHistory: []
            });
            toast.success("Setor cadastrado com sucesso!");
        }
        setSectorDialogOpen(false);
        resetSectorForm();
    };

    const resetSectorForm = () => {
        setSectorName(""); setSectorBlock(""); setSectorFloor(""); setSectorRoom("");
        setRespName(""); setRespSiape(""); setRespEmail("");
        setRespOrdinance(""); setRespDate(""); setRespTermination("");
        setEditingSectorId(null);
    };

    const startEditingSector = (s: Sector) => {
        setEditingSectorId(s.id);
        setSectorName(s.name);
        setSectorBlock(s.block || "");
        setSectorFloor(s.floor || "");
        setSectorRoom(s.room || "");
        setSectorDialogOpen(true);
    };

    const openNewSectorDialog = () => {
        resetSectorForm();
        setSectorDialogOpen(true);
    };

    const openChangeRespDialog = (s: Sector) => {
        setSelectedSectorForRespChange(s);
        setNewRespName(""); setNewRespSiape(""); setNewRespEmail("");
        setNewRespOrdinance(""); setNewRespDate("");
        setChangeRespDialogOpen(true);
    };

    const handleSaveNewResponsible = () => {
        if (!selectedSectorForRespChange || !newRespName || !newRespEmail) {
            toast.error("Preencha os campos obrigatórios!");
            return;
        }

        changeSectorResponsible(selectedSectorForRespChange.id, {
            name: newRespName,
            siape: newRespSiape,
            email: newRespEmail,
            password: '123456', // Default new password
            ordinanceNumber: newRespOrdinance,
            designationDate: newRespDate || new Date().toISOString()
        });

        toast.success(`Responsável atualizado para o setor ${selectedSectorForRespChange.name}!`);
        setChangeRespDialogOpen(false);
        setSelectedSectorForRespChange(null);
    };

    // --- EDIT RESPONSIBLE LOGIC ---
    const openEditRespDialog = (s: Sector) => {
        if (!s.responsible) return;
        setSelectedSectorForRespEdit(s);
        setEditRespName(s.responsible.name);
        setEditRespSiape(s.responsible.siape || "");
        setEditRespEmail(s.responsible.email);
        setEditRespOrdinance(s.responsible.ordinanceNumber || ""); // Or sector ordinance?
        setEditRespDate(s.responsible.designationDate || "");
        // @ts-ignore - Handle missing isActive in some types temporarily
        setEditRespActive(s.responsible.isActive !== undefined ? s.responsible.isActive : true);
        setEditRespDialogOpen(true);
    };

    const handleSaveEditedResponsible = () => {
        if (!selectedSectorForRespEdit) return;

        updateSectorResponsible(selectedSectorForRespEdit.id, {
            name: editRespName,
            email: editRespEmail,
            siape: editRespSiape,
            ordinanceNumber: editRespOrdinance,
            designationDate: editRespDate,
            isActive: editRespActive
        });

        toast.success("Dados do responsável atualizados!");
        setEditRespDialogOpen(false);
        setSelectedSectorForRespEdit(null);
    };


    // Companies
    const handleSaveCompany = () => {
        if (!compName || !compCnpj) {
            toast.error("Nome e CNPJ são obrigatórios!");
            return;
        }

        if (editingCompId) {
            updateCompany(editingCompId, { name: compName, cnpj: compCnpj });
            toast.success("Empresa atualizada!");
        } else {
            addCompany({
                id: uuidv4(),
                name: compName,
                cnpj: compCnpj,
                technicians: []
            });
            toast.success("Empresa cadastrada!");
        }
        setCompanyDialogOpen(false);
        resetCompanyForm();
    };

    const resetCompanyForm = () => {
        setCompName(""); setCompCnpj(""); setEditingCompId(null);
    };

    const startEditingCompany = (c: Company) => {
        setEditingCompId(c.id);
        setCompName(c.name);
        setCompCnpj(c.cnpj);
        setCompanyDialogOpen(true);
    };

    const openNewCompanyDialog = () => {
        resetCompanyForm();
        setCompanyDialogOpen(true);
    };

    // Technicians
    // Technicians
    const handleSaveTechnician = () => {
        if (!selectedCompId || !techName || !techCpf) {
            toast.error("Selecione a empresa e preencha os dados do técnico.");
            return;
        }

        if (editingTechId) {
            updateTechnician(editingTechId, {
                name: techName,
                cpf: techCpf,
                email: techEmail,
                isManager: techIsManager
            });
            toast.success("Técnico atualizado com sucesso!");
        } else {
            addTechnician(selectedCompId, {
                id: uuidv4(),
                name: techName,
                cpf: techCpf,
                email: techEmail,
                isManager: techIsManager
            });
            toast.success("Técnico cadastrado com sucesso!");
        }

        resetTechForm();
        setTechDialogOpen(false);
    };

    const resetTechForm = () => {
        setTechName(""); setTechCpf(""); setTechEmail("");
        setEditingTechId(null);
        setTechIsManager(false);
    };

    const startEditingTechnician = (companyId: string, tech: import('@/types').TechnicianProfile) => {
        setSelectedCompId(companyId);
        setEditingTechId(tech.id);
        setTechName(tech.name);
        setTechCpf(tech.cpf);
        setTechEmail(tech.email || "");
        setTechIsManager(tech.isManager || false);
        setTechDialogOpen(true);
    };

    const openNewTechDialog = (companyId?: string) => {
        if (companyId) setSelectedCompId(companyId);
        resetTechForm();
        setTechDialogOpen(true);
    };

    // Catalog Handlers
    // Catalog Handlers
    const handleSaveCatalogItem = () => {
        if (!catItemName || !catItemCost) return;

        const cost = parseFloat(catItemCost.toString().replace(',', '.'));

        if (editingCatItemId) {
            updateCatalogItem(editingCatItemId, {
                name: catItemName,
                type: catItemType,
                estimatedCost: cost,
                description: catItemDesc,
                isContracted: catItemIsContracted
            });
            toast.success("Item atualizado!");
        } else {
            addCatalogItem({
                id: uuidv4(),
                name: catItemName,
                type: catItemType,
                estimatedCost: cost,
                description: catItemDesc,
                isContracted: catItemIsContracted
            });
            toast.success("Item adicionado ao catálogo!");
        }
        setCatItemName(""); setCatItemCost(""); setCatItemDesc("");
        setCatItemIsContracted(false);
        setEditingCatItemId(null);
    };

    const startEditingCatalogItem = (item: import('@/types').CatalogItem) => {
        setEditingCatItemId(item.id);
        setCatItemName(item.name);
        setCatItemCost(item.estimatedCost.toString());
        setCatItemType(item.type);
        setCatItemDesc(item.description || "");
        setCatItemIsContracted(item.isContracted || false);
    };

    const cancelEditingCatalogItem = () => {
        setEditingCatItemId(null);
        setCatItemName(""); setCatItemCost(""); setCatItemDesc("");
        setCatItemIsContracted(false);
    };

    const handleSaveProblemType = () => {
        if (!probLabel) return;

        if (editingProbTypeId) {
            updateProblemType(editingProbTypeId, {
                label: probLabel,
                description: probDesc
            });
            toast.success("Tipo de defeito atualizado!");
        } else {
            addProblemType({
                id: uuidv4(),
                label: probLabel,
                description: probDesc
            });
            toast.success("Tipo de defeito adicionado!");
        }
        setProbLabel(""); setProbDesc("");
        setEditingProbTypeId(null);
    };

    const startEditingProblemType = (prob: import('@/types').ProblemType) => {
        setEditingProbTypeId(prob.id);
        setProbLabel(prob.label);
        setProbDesc(prob.description || "");
    };

    const cancelEditingProblemType = () => {
        setEditingProbTypeId(null);
        setProbLabel(""); setProbDesc("");
    };


    return (
        <Tabs defaultValue="assets" className="space-y-4">
            <TabsList className="bg-slate-100 p-1 rounded-lg w-full grid grid-cols-2 md:grid-cols-5">
                <TabsTrigger value="assets">Ativos (Patrimônio)</TabsTrigger>
                <TabsTrigger value="sectors">Setores & Ficais</TabsTrigger>
                <TabsTrigger value="companies">Empresas & Técnicos</TabsTrigger>
                <TabsTrigger value="catalog">Catálogo & Preços</TabsTrigger>
                <TabsTrigger value="quotations" className="gap-2">
                    Cotações <Badge variant="secondary" className="bg-amber-100 text-amber-700 h-5 px-1.5">{pendingTickets.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-1.5">
                    <History className="w-4 h-4" /> Histórico de OS
                </TabsTrigger>
            </TabsList>

            <TabsContent value="quotations" className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <QuotationApprovalTab />
                </div>
            </TabsContent>

            {/* --- ASSETS TAB --- */}
            <TabsContent value="assets" className="space-y-4">

                {/* LIST VIEW - TABLE WITH FILTERS */}
                {assetViewMode === 'list' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-800">Gerenciamento de Ativos</h2>
                                <p className="text-slate-500 text-sm">Cadastre e gerencie o parque de equipamentos.</p>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <Input
                                        placeholder="Buscar por tag, modelo ou setor..."
                                        className="pl-2 h-10"
                                        value={assetSearch}
                                        onChange={e => setAssetSearch(e.target.value)}
                                    />
                                </div>
                                <Button onClick={() => { resetAssetForm(); setAssetViewMode('form'); }} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-10 px-4">
                                    <Plus className="w-4 h-4 mr-2" /> Novo Patrimônio
                                </Button>
                            </div>
                        </div>

                        {/* Barra de filtros */}
                        <div className="bg-white p-3 rounded-lg border shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:flex lg:justify-between lg:w-full gap-4 items-center text-sm">
                            <div className="flex items-center gap-2 lg:flex-1">
                                <Label className="text-xs text-slate-600 whitespace-nowrap">Setor:</Label>
                                <Select value={sectorFilter} onValueChange={setSectorFilter}>
                                    <SelectTrigger className="h-8 w-full text-xs">
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        {sectors.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2 lg:flex-1">
                                <Label className="text-xs text-slate-600 whitespace-nowrap">Categoria:</Label>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="h-8 w-full text-xs">
                                        <SelectValue placeholder="Todas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas</SelectItem>
                                        <SelectItem value="Ar-Condicionado">Ar-Condicionado</SelectItem>
                                        <SelectItem value="Bebedouro">Bebedouro</SelectItem>
                                        <SelectItem value="Geladeira/Refrigerador">Geladeira/Refrigerador</SelectItem>
                                        <SelectItem value="Freezer">Freezer</SelectItem>
                                        <SelectItem value="Câmara Fria">Câmara Fria</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2 lg:flex-1">
                                <Label className="text-xs text-slate-600 whitespace-nowrap">Status:</Label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="h-8 w-full text-xs">
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="ok">✅ Funcionando</SelectItem>
                                        <SelectItem value="maintenance">🔧 Em Manutenção</SelectItem>
                                        <SelectItem value="stopped">⏸️ Parado</SelectItem>
                                        <SelectItem value="decommissioned">🗑️ Inservível</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2 lg:flex-1">
                                <Label className="text-xs text-slate-600 whitespace-nowrap">Idade:</Label>
                                <Select value={ageFilter} onValueChange={setAgeFilter}>
                                    <SelectTrigger className="h-8 w-full text-xs">
                                        <SelectValue placeholder="Todas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas</SelectItem>
                                        <SelectItem value="0-1">Até 1 ano</SelectItem>
                                        <SelectItem value="1-3">1 a 3 anos</SelectItem>
                                        <SelectItem value="3-5">3 a 5 anos</SelectItem>
                                        <SelectItem value="5+">Mais de 5 anos</SelectItem>
                                        <SelectItem value="10+">Mais de 10 anos</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end sm:col-span-2 lg:w-auto">
                                {(statusFilter !== "all" || categoryFilter !== "all" || sectorFilter !== "all" || ageFilter !== "all") && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setStatusFilter("all");
                                            setCategoryFilter("all");
                                            setSectorFilter("all");
                                            setAgeFilter("all");
                                        }}
                                        className="h-8 text-xs text-slate-500 hover:text-slate-700 w-full lg:w-auto whitespace-nowrap"
                                    >
                                        Limpar filtros
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* TABLE VIEW */}
                        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Patrimônio</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Equipamento</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Setor</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tempo de Uso</th>

                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {assets
                                            .filter(a => {
                                                const term = assetSearch.toLowerCase();
                                                const sectorName = sectors.find(s => s.id === a.sectorId)?.name.toLowerCase() || "";
                                                const matchesSearch = (
                                                    a.name.toLowerCase().includes(term) ||
                                                    a.patrimonyNumber.toLowerCase().includes(term) ||
                                                    sectorName.includes(term) ||
                                                    (a.model && a.model.toLowerCase().includes(term)) ||
                                                    (a.brand && a.brand.toLowerCase().includes(term)) ||
                                                    (a.category && a.category.toLowerCase().includes(term))
                                                );
                                                const matchesStatus = statusFilter === "all" || a.status === statusFilter;
                                                const matchesCategory = categoryFilter === "all" || a.category === categoryFilter;
                                                const matchesSector = sectorFilter === "all" || a.sectorId === sectorFilter;
                                                const matchesAge = checkAgeFilter(a.acquisitionDate, ageFilter);
                                                return matchesSearch && matchesStatus && matchesCategory && matchesSector && matchesAge;
                                            })
                                            .map(a => {
                                                const sector = sectors.find(s => s.id === a.sectorId);

                                                // Helper para renderizar status como ícone
                                                const getStatusIcon = (status: string) => {
                                                    switch (status) {
                                                        case 'ok':
                                                            return <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100" title="Funcionando">✅</div>;
                                                        case 'maintenance':
                                                            return <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100" title="Em Manutenção">🔧</div>;
                                                        case 'stopped':
                                                            return <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100" title="Parado">⏸️</div>;
                                                        case 'decommissioned':
                                                            return <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100" title="Inservível">🗑️</div>;
                                                        default:
                                                            return <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100" title="N/A">❓</div>;
                                                    }
                                                };

                                                return (
                                                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-1 h-10 rounded-full ${a.status === 'ok' ? 'bg-emerald-500' :
                                                                    a.status === 'maintenance' ? 'bg-blue-500' :
                                                                        a.status === 'stopped' ? 'bg-amber-500' : 'bg-red-500'
                                                                    }`} />
                                                                <div className="bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded text-xs flex items-center gap-1">
                                                                    <Package className="w-3 h-3" />
                                                                    {a.patrimonyNumber}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="font-medium text-slate-800">{a.name}</div>
                                                            <div className="text-xs text-slate-500">
                                                                {a.brand} {a.model && `• ${a.model}`}
                                                                {a.capacityBTU && ` • ${a.capacityBTU} BTUs`}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-1 text-sm text-slate-700">
                                                                <Building className="w-3 h-3" />
                                                                {sector?.name || 'Sem setor'}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-xs font-medium text-slate-600">
                                                            {calculateAssetAge(a.acquisitionDate)}
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            {getStatusIcon(a.status)}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex gap-2 justify-center">
                                                                <HistoryDialog asset={a} />
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 border-slate-300 hover:bg-blue-50 hover:text-blue-600"
                                                                    onClick={() => startEditingAsset(a)}
                                                                >
                                                                    <Pencil className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        {assets.filter(a => {
                                            const term = assetSearch.toLowerCase();
                                            const sectorName = sectors.find(s => s.id === a.sectorId)?.name.toLowerCase() || "";
                                            const matchesSearch = (
                                                a.name.toLowerCase().includes(term) ||
                                                a.patrimonyNumber.toLowerCase().includes(term) ||
                                                sectorName.includes(term) ||
                                                (a.model && a.model.toLowerCase().includes(term)) ||
                                                (a.brand && a.brand.toLowerCase().includes(term)) ||
                                                (a.category && a.category.toLowerCase().includes(term))
                                            );
                                            const matchesStatus = statusFilter === "all" || a.status === statusFilter;
                                            const matchesCategory = categoryFilter === "all" || a.category === categoryFilter;
                                            const matchesSector = sectorFilter === "all" || a.sectorId === sectorFilter;
                                            return matchesSearch && matchesStatus && matchesCategory && matchesSector;
                                        }).length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="text-center text-slate-400 py-10 bg-slate-50">
                                                        Nenhum ativo encontrado com os filtros aplicados.
                                                    </td>
                                                </tr>
                                            )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer com total e exportação */}
                            <div className="bg-slate-50 px-4 py-3 border-t flex justify-between items-center">
                                <span className="text-sm text-slate-600 font-medium">
                                    Total: <strong>{assets.filter(a => {
                                        const term = assetSearch.toLowerCase();
                                        const sectorName = sectors.find(s => s.id === a.sectorId)?.name.toLowerCase() || "";
                                        const matchesSearch = (
                                            a.name.toLowerCase().includes(term) ||
                                            a.patrimonyNumber.toLowerCase().includes(term) ||
                                            sectorName.includes(term) ||
                                            (a.model && a.model.toLowerCase().includes(term)) ||
                                            (a.brand && a.brand.toLowerCase().includes(term)) ||
                                            (a.category && a.category.toLowerCase().includes(term))
                                        );
                                        const matchesStatus = statusFilter === "all" || a.status === statusFilter;
                                        const matchesCategory = categoryFilter === "all" || a.category === categoryFilter;
                                        const matchesSector = sectorFilter === "all" || a.sectorId === sectorFilter;
                                        return matchesSearch && matchesStatus && matchesCategory && matchesSector;
                                    }).length}</strong> {assets.length > 1 ? 'equipamentos' : 'equipamento'}
                                </span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="h-8 text-xs">
                                        📊 Excel
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-8 text-xs">
                                        📄 PDF
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* FORM VIEW */}
                {assetViewMode === 'form' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 bg-white p-6 rounded-lg border shadow-sm">
                        <div className="flex justify-between items-center border-b pb-4">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-800">{editingAssetId ? 'Editar Patrimônio' : 'Novo Equipamento'}</h2>
                                <p className="text-slate-500 text-sm">Preencha os dados técnicos do equipamento de refrigeração.</p>
                            </div>
                            <Button variant="ghost" onClick={() => setAssetViewMode('list')}>Voltar para Lista</Button>
                        </div>

                        {/* GRUPO 1: IDENTIFICAÇÃO */}
                        <div className="space-y-4 border rounded-lg p-4 bg-slate-50/50">
                            <h3 className="text-sm font-bold uppercase text-slate-500 border-b pb-1 mb-3 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs">1</div>
                                Identificação do Bem
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Nº Patrimônio (Tag) *</Label>
                                    <Input placeholder="Ex: 001234" value={assetPatrimony} onChange={e => setAssetPatrimony(e.target.value)} className="bg-white !h-10" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nº de Série (SN)</Label>
                                    <Input placeholder="Serial do fabricante" value={assetSerial} onChange={e => setAssetSerial(e.target.value)} className="bg-white !h-10" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Data de Aquisição</Label>
                                    <Input type="date" value={acquisitionDate} onChange={e => setAcquisitionDate(e.target.value)} className="bg-white !h-10" />
                                </div>
                            </div>
                        </div>

                        {/* GRUPO 2: CLASSIFICAÇÃO, DETALHES & ESPECIFICAÇÕES TÉCNICAS */}
                        <div className="space-y-4 border rounded-lg p-4 bg-slate-50/50">
                            <h3 className="text-sm font-bold uppercase text-slate-500 border-b pb-1 mb-3 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs">2</div>
                                Classificação, Detalhes &amp; Especificações Técnicas
                            </h3>

                            {/* Categoria, Subtipo, Marca, Modelo, Tensão, Unidade de Potência */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Categoria *</Label>
                                    <Select value={assetCategory} onValueChange={(v) => { setAssetCategory(v); setAssetName(`${v} ${assetBrand}`); }}>
                                        <SelectTrigger className="bg-white !h-10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                        <SelectContent>
                                            {["Ar-Condicionado", "Bebedouro", "Geladeira/Refrigerador", "Freezer", "Câmara Fria"].map(c => (
                                                <SelectItem key={c} value={c}>{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Subtipo *</Label>
                                    <Select value={assetSubType} onValueChange={setAssetSubType}>
                                        <SelectTrigger className="bg-white !h-10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                        <SelectContent>
                                            {(assetCategory && assetSubTypes[assetCategory] ? assetSubTypes[assetCategory] : []).map(s => (
                                                <SelectItem key={s} value={s}>{s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Fabricante / Marca</Label>
                                    <Select value={assetBrand} onValueChange={setAssetBrand}>
                                        <SelectTrigger className="bg-white !h-10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                        <SelectContent className="max-h-60">
                                            {["Agratto", "Begel", "Brastemp", "Carrier", "Consul", "Daikin", "Electrolux", "Elgin", "Esmaltec", "Fontaine", "Fujitsu", "Gelopar", "Gree", "Hitachi", "IBBL", "Komeco", "LG", "Metalfrio", "Midea", "Panasonic", "Philco", "Samsung", "Springer", "Trane", "York", "Outro"].map(m => (
                                                <SelectItem key={m} value={m}>{m}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Modelo</Label>
                                    <Input placeholder="Ex: US-Q122HSG3" value={assetModel} onChange={e => setAssetModel(e.target.value)} className="bg-white !h-10" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tensão (Voltagem)</Label>
                                    <Select value={assetVoltage} onValueChange={setAssetVoltage}>
                                        <SelectTrigger className="!h-10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                        <SelectContent>
                                            {["127V", "220V Monofásico", "220V Bifásico", "220V Trifásico", "380V Trifásico", "440V Trifásico"].map(v => (
                                                <SelectItem key={v} value={v}>{v}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {assetCategory !== 'Ar-Condicionado' && (
                                    <div className="space-y-2">
                                        <Label>Unidade de Potência</Label>
                                        <Select value={assetPower} onValueChange={setAssetPower}>
                                            <SelectTrigger className="!h-10"><SelectValue placeholder="Opcional..." /></SelectTrigger>
                                            <SelectContent>
                                                {["BTUs", "TR", "Litros", "HP"].map(p => (
                                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>

                            {/* Divisor visual */}
                            <div className="border-t border-slate-300 my-4"></div>

                            {/* Especificações Técnicas - Campos específicos por categoria */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {assetCategory === 'Ar-Condicionado' && (
                                    <>
                                        <div className="space-y-2">
                                            <Label>Capacidade (BTUs)</Label>
                                            <Select value={assetBTU} onValueChange={setAssetBTU}>
                                                <SelectTrigger className="!h-10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                                <SelectContent className="max-h-60">
                                                    {["7.000", "9.000", "12.000", "18.000", "22.000", "24.000", "30.000", "36.000", "48.000", "60.000", "80.000", "Acima de 80.000"].map(b => (
                                                        <SelectItem key={b} value={b}>{b}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tecnologia</Label>
                                            <Select value={assetCompressor} onValueChange={setAssetCompressor}>
                                                <SelectTrigger className="!h-10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Inverter">Inverter</SelectItem>
                                                    <SelectItem value="Convencional">Convencional (On/Off)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Gás Refrigerante</Label>
                                            <Select value={assetGas} onValueChange={setAssetGas}>
                                                <SelectTrigger className="!h-10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                                <SelectContent>
                                                    {["R-22", "R-410A", "R-32", "R-134a", "R-600a", "R-290", "Não Identificado"].map(g => (
                                                        <SelectItem key={g} value={g}>{g}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                )}

                                {(assetCategory === 'Geladeira/Refrigerador' || assetCategory === 'Freezer' || assetCategory === 'Bebedouro') && (
                                    <div className="space-y-2">
                                        <Label>Capacidade (Litros)</Label>
                                        <Input type="number" placeholder="Ex: 350" value={assetLiters} onChange={e => setAssetLiters(e.target.value)} className="!h-10" />
                                    </div>
                                )}

                                {(assetCategory === 'Geladeira/Refrigerador' || assetCategory === 'Freezer' || assetCategory === 'Bebedouro' || assetCategory === 'Câmara Fria') && (
                                    <div className="space-y-2">
                                        <Label>Gás Refrigerante</Label>
                                        <Select value={assetGas} onValueChange={setAssetGas}>
                                            <SelectTrigger className="!h-10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                            <SelectContent>
                                                {["R-134a", "R-600a", "R-290", "R-404A", "R-22", "Não Identificado"].map(g => (
                                                    <SelectItem key={g} value={g}>{g}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* GRUPO 3: LOCALIZAÇÃO & GRAU DE IMPORTÂNCIA */}
                        <div className="space-y-4 border rounded-lg p-4 bg-gradient-to-br from-blue-50/30 to-white border-blue-200">
                            <h3 className="text-sm font-bold uppercase text-slate-500 border-b pb-1 mb-3 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">3</div>
                                Localização &amp; Grau de Importância
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Localização (Setor) *</Label>
                                    <Select value={assetSector} onValueChange={setAssetSector}>
                                        <SelectTrigger className="bg-white !h-10">
                                            <SelectValue placeholder="Selecione o setor..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sectors.map(s => (
                                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Grau de Importância</Label>
                                    <Select value={assetCriticality} onValueChange={setAssetCriticality}>
                                        <SelectTrigger className="bg-white !h-10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Alta">Alta (Crítico)</SelectItem>
                                            <SelectItem value="Média">Média</SelectItem>
                                            <SelectItem value="Baixa">Baixa</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Label>Data de Baixa</Label>
                                        <div className="group relative inline-block">
                                            <svg className="w-4 h-4 text-blue-500 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                <div className="font-bold mb-1">📋 Procedimento de Baixa:</div>
                                                Quando o equipamento ficar <strong>inservível</strong>, registre a data aqui e altere o setor para <strong>"Sucata"</strong> ou setor destinado a equipamentos descartados.
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <Input type="date" value={decommissionDate} onChange={e => setDecommissionDate(e.target.value)} className="bg-white !h-10" placeholder="Deixe vazio se em uso" />
                                </div>
                            </div>

                            {/* Location Info Card: mostra detalhes quando um setor é selecionado */}
                            {assetSector && (() => {
                                const selectedSector = sectors.find(s => s.id === assetSector);
                                if (!selectedSector) return null;

                                return (
                                    <div className="p-4 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl mt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold uppercase text-blue-700 mb-1">
                                                    Localização Selecionada
                                                </p>
                                                <p className="font-bold text-neutral-800 text-base mb-2">
                                                    {selectedSector.name}
                                                </p>

                                                {(selectedSector.block || selectedSector.room) && (
                                                    <div className="grid grid-cols-2 gap-3 mt-3">
                                                        {selectedSector.block && (
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                                                                    <span className="text-blue-700 text-xs font-bold">B</span>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] text-blue-600 uppercase font-bold">Bloco</p>
                                                                    <p className="text-neutral-800 font-medium">{selectedSector.block}</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {selectedSector.room && (
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                                                                    <span className="text-blue-700 text-xs font-bold">S</span>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] text-blue-600 uppercase font-bold">Sala</p>
                                                                    <p className="text-neutral-800 font-medium">{selectedSector.room}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {selectedSector.responsible && (
                                                    <div className="mt-3 pt-3 border-t border-blue-200">
                                                        <p className="text-[10px] text-blue-600 uppercase font-bold mb-1">
                                                            Responsável
                                                        </p>
                                                        <p className="text-sm text-neutral-700 font-medium">
                                                            {selectedSector.responsible.name}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>


                        <div className="flex justify-between items-center bg-slate-100 p-4 rounded-b-lg -mx-6 -mb-6 mt-4">
                            <span className="text-xs text-slate-500">* Campos obrigatórios</span>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setAssetViewMode('list')}>Cancelar</Button>
                                <Button onClick={handleSaveAsset} className="bg-emerald-600 hover:bg-emerald-700 min-w-[150px]">
                                    {editingAssetId ? 'Salvar Alterações' : 'Cadastrar Ativo'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </TabsContent>

            {/* --- SECTORS TAB --- */}
            <TabsContent value="sectors" className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Setores & Fiscais</h2>
                        <p className="text-slate-500">Administre os locais auditados e seus servidores responsáveis.</p>
                    </div>
                    <Button onClick={openNewSectorDialog} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                        <Plus className="w-4 h-4 mr-2" /> Novo Setor
                    </Button>
                </div>

                {/* Barra de Filtros */}
                <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full md:max-w-sm">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar setor ou responsável..."
                            className="pl-9 bg-slate-50"
                            value={sectorSearch}
                            onChange={(e) => setSectorSearch(e.target.value)}
                        />
                    </div>
                    {/* Filtro simples de status */}
                    {/* Futuramente pode ser expandido */}
                </div>

                <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Setor</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Responsável</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Contato</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sectors
                                    .filter(s => {
                                        const term = sectorSearch.toLowerCase();
                                        return (
                                            s.name.toLowerCase().includes(term) ||
                                            (s.responsible?.name || "").toLowerCase().includes(term) ||
                                            (s.block || "").toLowerCase().includes(term) ||
                                            (s.room || "").toLowerCase().includes(term)
                                        );
                                    })
                                    .map(s => (
                                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                                        <Building className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-900">{s.name}</div>
                                                        <div className="text-xs text-slate-500 flex flex-wrap gap-2 items-center mt-1">
                                                            {s.block && <span className="font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-sm">{s.block}</span>}
                                                            {s.floor && <span>• {s.floor}</span>}
                                                            {s.room && <span>• Sala {s.room}</span>}
                                                            {!s.block && !s.floor && !s.room && <span className="italic text-slate-400 text-[10px]">Sem loc. detalhada</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {s.responsible ? (
                                                    <div>
                                                        <div className="font-medium text-slate-900 flex items-center gap-2">
                                                            <User className="w-3 h-3 text-slate-400" />
                                                            {s.responsible.name}
                                                        </div>
                                                        <div className="text-xs text-slate-500 pl-5">
                                                            SIAPE: {s.responsible.siape || "N/A"}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">
                                                        Pendente
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {s.responsible?.email || <span className="text-slate-400 italic">—</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                                        title="Editar Nome do Setor"
                                                        onClick={() => startEditingSector(s)}
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </Button>

                                                    {s.responsible && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-500 hover:text-orange-600 hover:bg-orange-50"
                                                            title="Editar Dados do Responsável"
                                                            onClick={() => openEditRespDialog(s)}
                                                        >
                                                            <Settings className="w-4 h-4" />
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                                                        title="Alterar/Substituir Responsável"
                                                        onClick={() => openChangeRespDialog(s)}
                                                    >
                                                        <UserCog className="w-4 h-4" />
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-500 hover:text-purple-600 hover:bg-purple-50"
                                                        title="Histórico de Responsáveis"
                                                        onClick={() => openHistoryDialog(s)}
                                                    >
                                                        <History className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                {sectors.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-12 text-slate-500">
                                            Nenhum setor cadastrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* SECTOR DIALOG */}
                <Dialog open={sectorDialogOpen} onOpenChange={setSectorDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingSectorId ? 'Renomear Setor' : 'Novo Setor & Responsável'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2 col-span-3">
                                    <Label>Nome do Setor *</Label>
                                    <Input placeholder="Ex: Laboratório de Informática 1" value={sectorName} onChange={e => setSectorName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Bloco</Label>
                                    <Input placeholder="Ex: Bloco B" value={sectorBlock} onChange={e => setSectorBlock(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Andar</Label>
                                    <Select value={sectorFloor} onValueChange={setSectorFloor}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Térreo">Térreo</SelectItem>
                                            <SelectItem value="1º Andar">1º Andar</SelectItem>
                                            <SelectItem value="2º Andar">2º Andar</SelectItem>
                                            <SelectItem value="3º Andar">3º Andar</SelectItem>
                                            <SelectItem value="4º Andar">4º Andar</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Sala</Label>
                                    <Input placeholder="Ex: 102" value={sectorRoom} onChange={e => setSectorRoom(e.target.value)} />
                                </div>
                            </div>

                            {!editingSectorId && (
                                <div className="border-t pt-4 mt-4">
                                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                        <User className="w-4 h-4" /> Dados do Servidor Responsável (Fiscal)
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2 col-span-2">
                                            <Label>Nome Completo *</Label>
                                            <Input placeholder="Nome do Servidor" value={respName} onChange={e => setRespName(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>SIAPE</Label>
                                            <Input placeholder="1234567" value={respSiape} onChange={e => setRespSiape(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>E-mail Institucional *</Label>
                                            <Input type="email" placeholder="servidor@ifam.edu.br" value={respEmail} onChange={e => setRespEmail(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Portaria</Label>
                                            <Input placeholder="Ex: 123/2024" value={respOrdinance} onChange={e => setRespOrdinance(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Data Designação</Label>
                                            <Input type="date" value={respDate} onChange={e => setRespDate(e.target.value)} />
                                        </div>
                                    </div>
                                    <p className="text-xs text-orange-600 mt-2 bg-orange-50 p-2 rounded border border-orange-100">
                                        * Uma senha temporária (123456) será gerada para este usuário.
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setSectorDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSaveSector} className="bg-blue-600 hover:bg-blue-700">
                                {editingSectorId ? 'Salvar Alterações' : 'Cadastrar Setor'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* EDIT RESPONSIBLE DIALOG */}
                <Dialog open={editRespDialogOpen} onOpenChange={setEditRespDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Editar Responsável do Setor</DialogTitle>
                            <CardDescription>
                                Atualize os dados cadastrais do servidor responsável por este setor.
                            </CardDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <Label>Nome Completo *</Label>
                                    <Input placeholder="Nome do Servidor" value={editRespName} onChange={e => setEditRespName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>SIAPE</Label>
                                    <Input placeholder="1234567" value={editRespSiape} onChange={e => setEditRespSiape(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>E-mail Institucional *</Label>
                                    <Input type="email" placeholder="servidor@ifam.edu.br" value={editRespEmail} onChange={e => setEditRespEmail(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Portaria de Designação</Label>
                                    <Input placeholder="Ex: 123/2024" value={editRespOrdinance} onChange={e => setEditRespOrdinance(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Data de Início</Label>
                                    <Input type="date" value={editRespDate} onChange={e => setEditRespDate(e.target.value)} />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="activeStatus"
                                            checked={editRespActive}
                                            onChange={(e) => setEditRespActive(e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <Label htmlFor="activeStatus">Acesso Ativo?</Label>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Se desmarcado, o usuário não poderá acessar o sistema.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setEditRespDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSaveEditedResponsible} className="bg-blue-600 hover:bg-blue-700">
                                Salvar Alterações
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>


                {/* CHANGE RESPONSIBLE DIALOG */}
                <Dialog open={changeRespDialogOpen} onOpenChange={setChangeRespDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Substituição de Responsável (Fiscal)</DialogTitle>
                            <CardDescription>
                                O responsável atual será arquivado no histórico e o novo servidor assumirá o setor <b>{selectedSectorForRespChange?.name}</b>.
                            </CardDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <Label>Nome Completo do Novo Servidor *</Label>
                                    <Input placeholder="Nome do Servidor" value={newRespName} onChange={e => setNewRespName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>SIAPE</Label>
                                    <Input placeholder="1234567" value={newRespSiape} onChange={e => setNewRespSiape(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>E-mail Institucional *</Label>
                                    <Input type="email" placeholder="servidor@ifam.edu.br" value={newRespEmail} onChange={e => setNewRespEmail(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nova Portaria</Label>
                                    <Input placeholder="Ex: 123/2024" value={newRespOrdinance} onChange={e => setNewRespOrdinance(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Data Início (Designação)</Label>
                                    <Input type="date" value={newRespDate} onChange={e => setNewRespDate(e.target.value)} />
                                </div>
                            </div>
                            <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-100 flex items-center gap-2">
                                ⚠️ A senha de acesso do novo servidor será: <strong>123456</strong>
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setChangeRespDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSaveNewResponsible} className="bg-orange-600 hover:bg-orange-700 text-white">
                                Confirmar Substituição
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>



                {/* HISTORY DIALOG */}
                <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Histórico de Gestão - {selectedSectorForHistory?.name}</DialogTitle>
                            <CardDescription>
                                Registro de fiscais e responsáveis que já gerenciaram este setor.
                            </CardDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                            {selectedSectorForHistory?.responsibleHistory && selectedSectorForHistory.responsibleHistory.length > 0 ? (
                                <div className="space-y-3">
                                    {selectedSectorForHistory.responsibleHistory.map((h, i) => (
                                        <div key={i} className="bg-white border text-sm rounded-lg p-3 hover:bg-slate-50 transition-colors shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2 font-medium text-slate-800">
                                                    <User className="w-4 h-4 text-slate-400" />
                                                    {h.name}
                                                </div>
                                                <Badge variant="secondary" className="text-xs font-normal bg-slate-100 text-slate-500">
                                                    Ex-Fiscal
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 bg-slate-50/50 p-2 rounded border border-slate-100/50">
                                                <div>
                                                    <span className="block font-semibold text-slate-400 mb-0.5">SIAPE / E-mail</span>
                                                    {h.siape || '—'} • {h.email}
                                                </div>
                                                <div>
                                                    <span className="block font-semibold text-slate-400 mb-0.5">Período de Gestão</span>
                                                    <div className="flex items-center gap-1">
                                                        <span>{h.designationDate ? new Date(h.designationDate).toLocaleDateString("pt-BR") : 'Início desc.'}</span>
                                                        <span className="text-slate-300">→</span>
                                                        <span>{h.terminationDate ? new Date(h.terminationDate).toLocaleDateString("pt-BR") : '—'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-lg bg-slate-50/30">
                                    <History className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                                    <p className="font-medium text-slate-600">Nenhum histórico registrado</p>
                                    <p className="text-xs mt-1">As alterações de responsáveis aparecerão aqui.</p>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <Button variant="outline" onClick={() => setHistoryDialogOpen(false)}>Fechar</Button>
                        </div>
                    </DialogContent>
                </Dialog>

            </TabsContent>

            {/* --- COMPANIES TAB --- */}
            < TabsContent value="companies" className="space-y-4" >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Empresas e Técnicos</h2>
                        <p className="text-slate-500">Gerencie as empresas terceirizadas e seus técnicos credenciados.</p>
                    </div>
                    <Button onClick={openNewCompanyDialog} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                        <Plus className="w-4 h-4 mr-2" /> Nova Empresa
                    </Button>
                </div>

                <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-1/3">Empresa / CNPJ</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Técnicos Credenciados</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {companies.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 align-top">
                                            <div>
                                                <div className="font-bold text-slate-800 text-base">{c.name}</div>
                                                <div className="text-xs font-mono text-slate-500 mt-1">{c.cnpj}</div>
                                                <div className="flex gap-2 mt-3">
                                                    <Button variant="outline" size="sm" className="h-7 text-xs border-slate-200 text-slate-600 hover:text-blue-600" onClick={() => startEditingCompany(c)}>
                                                        <Pencil className="w-3 h-3 mr-1" /> Editar
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="h-7 text-xs border-slate-200 text-slate-600 hover:text-red-600" onClick={() => deleteCompany(c.id)}>
                                                        <Trash2 className="w-3 h-3 mr-1" /> Excluir
                                                    </Button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lista de Técnicos ({c.technicians.length})</span>
                                                <Button size="sm" variant="ghost" className="h-7 text-blue-600 hover:bg-blue-50 text-xs px-2 border border-dashed border-blue-200" onClick={() => openNewTechDialog(c.id)}>
                                                    <Plus className="w-3 h-3 mr-1" /> Adicionar Técnico
                                                </Button>
                                            </div>
                                            {c.technicians.length > 0 ? (
                                                <div className="space-y-2">
                                                    {c.technicians.map((t) => (
                                                        <div key={t.id} className="border p-3 my-2 bg-yellow-50 rounded shadow-sm">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-bold text-slate-800">{t.name}</span>
                                                                        {t.isManager ? (
                                                                            <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">LÍDER</span>
                                                                        ) : (
                                                                            <span className="text-slate-500 text-[10px] border border-slate-300 px-1 rounded uppercase tracking-wider">Técnico</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-xs text-slate-600 mt-1 font-mono">
                                                                        CPF: {t.cpf || "SEM CPF"} • {t.email}
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => startEditingTechnician(c.id, t)}>
                                                                        Editar
                                                                    </Button>
                                                                    <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => deleteTechnician(c.id, t.id)}>
                                                                        Excluir
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-slate-400 italic bg-slate-50/30 p-4 rounded border border-dashed border-slate-200 text-center">
                                                    Nenhum técnico cadastrado para esta empresa.
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {companies.length === 0 && (
                                    <tr>
                                        <td colSpan={2} className="py-12 text-center text-slate-400 bg-slate-50/20">
                                            <div className="flex flex-col items-center justify-center">
                                                <Building className="w-10 h-10 text-slate-200 mb-2" />
                                                <p>Nenhuma empresa cadastrada.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Dialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingCompId ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Razão Social / Nome *</Label>
                                <Input placeholder="Ex: Clima Bom Ltda" value={compName} onChange={e => setCompName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>CNPJ *</Label>
                                <Input placeholder="00.000.000/0000-00" maxLength={18} value={compCnpj} onChange={e => setCompCnpj(formatCNPJ(e.target.value))} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setCompanyDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSaveCompany} className="bg-blue-600 hover:bg-blue-700">
                                {editingCompId ? 'Salvar' : 'Cadastrar'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={techDialogOpen} onOpenChange={setTechDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingTechId ? 'Editar Técnico' : 'Novo Técnico'}</DialogTitle>
                            <CardDescription>
                                {editingTechId ? 'Atualize os dados do técnico.' : <span>Adicionando técnico para: <span className="font-bold text-slate-800">{companies.find(c => c.id === selectedCompId)?.name}</span></span>}
                            </CardDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Nome Completo *</Label>
                                <Input placeholder="Nome do Técnico" value={techName} onChange={e => setTechName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>CPF *</Label>
                                <Input placeholder="000.000.000-00" maxLength={14} value={techCpf} onChange={e => setTechCpf(formatCPF(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label>E-mail (Opcional)</Label>
                                <Input placeholder="tecnico@empresa.com" type="email" value={techEmail} onChange={e => setTechEmail(e.target.value)} />
                            </div>
                            <div className="pt-2">
                                <div className="flex items-start space-x-2">
                                    <input
                                        type="checkbox"
                                        id="techManager"
                                        checked={techIsManager}
                                        onChange={e => setTechIsManager(e.target.checked)}
                                        className="h-4 w-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <Label htmlFor="techManager" className="font-medium cursor-pointer text-slate-700">
                                            Perfil de Liderança (Encarregado)
                                        </Label>
                                        <p className="text-[11px] text-slate-500 text-muted-foreground">
                                            Permite gerenciar chamados e atribuir tarefas para outros técnicos da equipe.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setTechDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSaveTechnician} className="bg-blue-600 hover:bg-blue-700">
                                {editingTechId ? 'Salvar Alterações' : 'Cadastrar Técnico'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </TabsContent >

            {/* --- CATALOG TAB --- */}
            < TabsContent value="catalog" >
                <Tabs defaultValue="items" className="mt-2">
                    <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="items">Serviços e Peças</TabsTrigger>
                        <TabsTrigger value="problems">Tipos de Defeito</TabsTrigger>
                    </TabsList>

                    <TabsContent value="items" className="space-y-4 mt-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">{editingCatItemId ? 'Editar Item' : 'Novo Item de Catálogo'}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <div className="flex flex-col md:flex-row gap-4 items-end">
                                    <div className="space-y-2 flex-1">
                                        <Label>Nome do Item / Serviço</Label>
                                        <Input placeholder="Ex: Recarga de Gás" value={catItemName} onChange={e => setCatItemName(e.target.value)} />
                                    </div>
                                    <div className="space-y-2 w-full md:w-32">
                                        <Label>Tipo</Label>
                                        <Select value={catItemType} onValueChange={(v: "service" | "part") => setCatItemType(v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="service">Serviço</SelectItem>
                                                <SelectItem value="part">Peça</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 w-full md:w-32">
                                        <Label>Custo Unitário</Label>
                                        <Input type="number" placeholder="0.00" value={catItemCost} onChange={e => setCatItemCost(e.target.value)} />
                                    </div>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <input
                                            type="checkbox"
                                            id="isContracted"
                                            checked={catItemIsContracted}
                                            onChange={e => setCatItemIsContracted(e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <Label htmlFor="isContracted" className="font-medium cursor-pointer text-xs text-slate-700">
                                            Item de Pregão (TR)
                                        </Label>
                                    </div>
                                    <div className="flex gap-2">
                                        {editingCatItemId && (
                                            <Button variant="outline" onClick={cancelEditingCatalogItem} className="border-red-200 text-red-600 hover:bg-red-50">
                                                Cancelar
                                            </Button>
                                        )}
                                        <Button onClick={handleSaveCatalogItem} className={editingCatItemId ? "bg-blue-600" : "bg-emerald-600"}>
                                            {editingCatItemId ? 'Salvar' : <><Plus className="w-4 h-4 mr-1" /> Adicionar</>}
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-3 space-y-2">
                                    <Label>Descrição (Especificação Técnica)</Label>
                                    <Input placeholder="Ex: Compressor Rotativo 18.000 BTUs, R-410A, 220V" value={catItemDesc} onChange={e => setCatItemDesc(e.target.value)} />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {catalog.map(item => (
                                <div key={item.id} className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all group ${editingCatItemId === item.id ? 'border-blue-500 ring-2 ring-blue-50' : 'border-slate-200'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className={`text-[10px] ${item.type === 'service' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                            {item.type === 'service' ? 'SERVIÇO' : 'PEÇA'}
                                        </Badge>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEditingCatalogItem(item)}>
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deleteCatalogItem(item.id)}>
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>

                                    <h4 className="font-bold text-slate-800 text-sm mb-1 leading-tight">{item.name}</h4>
                                    <p className="text-[10px] text-slate-500 line-clamp-2 mb-3 h-5">{item.description || 'Sem descrição técnica.'}</p>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                        {item.isContracted ? (
                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 text-[9px] font-bold">PREGÃO / TR</Badge>
                                        ) : (
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter italic">Sob Demanda</span>
                                        )}
                                        <span className={`text-sm font-black ${item.isContracted ? 'text-slate-900' : 'text-blue-600 italic'}`}>
                                            {item.estimatedCost > 0
                                                ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.estimatedCost)
                                                : "Sob Orçamento"
                                            }
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="problems" className="space-y-4 mt-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">{editingProbTypeId ? 'Editar Defeito' : 'Novo Tipo de Defeito'}</CardTitle>
                                <CardDescription>Opções que aparecem para o servidor abrir chamado.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <div className="space-y-2">
                                    <Label>Título Curto</Label>
                                    <Input placeholder="Ex: Barulho Alto" value={probLabel} onChange={e => setProbLabel(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Descrição / Dica</Label>
                                    <Input placeholder="Ex: Equipamento vibrando ou fazendo sons anormais." value={probDesc} onChange={e => setProbDesc(e.target.value)} />
                                </div>
                                <div className="flex gap-2">
                                    {editingProbTypeId && (
                                        <Button variant="outline" onClick={cancelEditingProblemType} className="w-full border-red-200 text-red-600 hover:bg-red-50">
                                            Cancelar
                                        </Button>
                                    )}
                                    <Button onClick={handleSaveProblemType} className={editingProbTypeId ? "bg-blue-600 hover:bg-blue-700 w-full" : "bg-purple-600 w-full"}>
                                        {editingProbTypeId ? 'Salvar Alterações' : <><Plus className="w-4 h-4 mr-2" /> Adicionar Defeito</>}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {problemTypes.map(prob => (
                                <div key={prob.id} className={`bg-white p-3 border rounded hover:shadow-sm transition-all relative group ${editingProbTypeId === prob.id ? 'border-purple-400 ring-1 ring-purple-100' : ''}`}>
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-neutral-400 hover:text-blue-600 hover:bg-blue-50"
                                            onClick={() => startEditingProblemType(prob)}
                                        >
                                            <Pencil className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-neutral-400 hover:text-red-500 hover:bg-red-50"
                                            onClick={() => deleteProblemType(prob.id)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                    <h4 className="font-bold text-sm text-purple-900 pr-16">{prob.label}</h4>
                                    <p className="text-xs text-neutral-500 line-clamp-2">{prob.description}</p>
                                </div>
                            ))}
                        </div>
                        {/* Close Problems Tab */}
                    </TabsContent>
                </Tabs>
            </TabsContent>

            {/* --- FISCAIS DE CONTRATO TAB --- */}
            <TabsContent value="history" className="space-y-4">
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Fiscais de Contrato</h3>
                            <p className="text-sm text-slate-500">Gerencie os usuários com permissão para aprovar orçamentos.</p>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="bg-slate-900 text-white gap-2">
                                    <Plus className="w-4 h-4" /> Novo Fiscal
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Cadastro de Fiscal de Contrato</DialogTitle>
                                    <DialogDescription>
                                        O fiscal terá acesso ao painel de aprovação de cotações.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Nome Completo</Label>
                                        <Input value={fiscalName} onChange={e => setFiscalName(e.target.value)} placeholder="Ex: Maria Oliveira" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>E-mail Institucional</Label>
                                        <Input type="email" value={fiscalEmail} onChange={e => setFiscalEmail(e.target.value)} placeholder="maria.oliveira@ifam.edu.br" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Senha Temporária</Label>
                                        <Input type="password" value={fiscalPassword} onChange={e => setFiscalPassword(e.target.value)} placeholder="******" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={() => {
                                        if (!fiscalName || !fiscalEmail) {
                                            toast.error("Preencha os campos obrigatórios.");
                                            return;
                                        }
                                        // Mock action
                                        toast.success(`Fiscal ${fiscalName} cadastrado com sucesso!`);
                                        setFiscalName(""); setFiscalEmail(""); setFiscalPassword("");
                                    }}>
                                        Cadastrar Fiscal
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left font-bold text-slate-600">Nome</th>
                                    <th className="px-4 py-3 text-left font-bold text-slate-600">E-mail</th>
                                    <th className="px-4 py-3 text-left font-bold text-slate-600">Status</th>
                                    <th className="px-4 py-3 text-right font-bold text-slate-600">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                <tr>
                                    <td className="px-4 py-3 font-medium">Beatriz Santos</td>
                                    <td className="px-4 py-3 text-slate-500">beatriz.santos@ifam.edu.br</td>
                                    <td className="px-4 py-3">
                                        <Badge className="bg-emerald-100 text-emerald-700">Ativo</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <Trash2 className="w-4 h-4 text-slate-400" />
                                        </Button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium">Ricardo Lima</td>
                                    <td className="px-4 py-3 text-slate-500">ricardo.lima@ifam.edu.br</td>
                                    <td className="px-4 py-3">
                                        <Badge className="bg-emerald-100 text-emerald-700">Ativo</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <Trash2 className="w-4 h-4 text-slate-400" />
                                        </Button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </TabsContent>

            {/* --- HISTORY TAB --- */}
            <TabsContent value="history" className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <History className="w-5 h-5 text-slate-500" />
                            Histórico de Ordens de Serviço
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Todas as OS geradas no sistema — corretivas e preventivas. Use os filtros para buscar por equipamento, período ou status.
                        </p>
                    </div>
                    <HistoryList role="admin" />
                </div>
            </TabsContent>
        </Tabs >
    );
}
