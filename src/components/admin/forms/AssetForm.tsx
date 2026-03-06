import { useState, useEffect } from "react";
import { Asset } from "@/types";
import { FormInputField, FormSelectField, FormSection } from "./FormField";
import { useAppStore } from "@/store/useStore";

interface AssetFormProps {
    asset: Partial<Asset> | null;
    onSave: (asset: Partial<Asset>) => void;
    isEditing?: boolean;
}

// Asset categories and sub-types
const ASSET_CATEGORIES = [
    { value: "Ar-Condicionado", label: "Ar-Condicionado" },
    { value: "Refrigerador", label: "Refrigerador" },
    { value: "Freezer", label: "Freezer" },
    { value: "Bebedouro", label: "Bebedouro" },
    { value: "Câmara Fria", label: "Câmara Fria" },
    { value: "Outros", label: "Outros" }
];

const ASSET_SUB_TYPES: Record<string, string[]> = {
    "Ar-Condicionado": ["Split Hi-Wall", "Split Piso-Teto", "Split Cassete", "Janela (ACJ)", "Portátil", "Cortina de Ar", "Multi-Split", "Chiller/Central"],
    "Refrigerador": ["Refrigerador Duplex", "Refrigerador Frost-Free", "Refrigerador Compacto"],
    "Freezer": ["Freezer Horizontal", "Freezer Vertical"],
    "Bebedouro": ["Bebedouro Industrial", "Bebedouro Garrafão", "Purificador Parede", "Bebedouro de Pressão"],
    "Câmara Fria": ["Resfriada", "Congelada"],
    "Outros": []
};

const VOLTAGE_OPTIONS = [
    { value: "110V", label: "110V" },
    { value: "220V", label: "220V" },
    { value: "380V", label: "380V (Trifásico)" },
    { value: "bifásico", label: "Bifásico" }
];

const GAS_TYPES = [
    { value: "R22", label: "R22" },
    { value: "R134a", label: "R134a" },
    { value: "R404A", label: "R404A" },
    { value: "R410A", label: "R410A" },
    { value: "R600a", label: "R600a (Isobutano)" }
];

const CRITICALITY_LEVELS = [
    { value: "baixa", label: "Baixa" },
    { value: "média", label: "Média" },
    { value: "alta", label: "Alta" },
    { value: "crítica", label: "Crítica" }
];

/**
 * Modern Asset Form Component
 * Feature-rich form for creating/editing assets with validation
 * Mobile-first responsive design
 */
export function AssetForm({ asset, onSave, isEditing = false }: AssetFormProps) {
    const { sectors } = useAppStore();

    // Form state
    const [formData, setFormData] = useState<Partial<Asset>>({
        patrimonyNumber: "",
        name: "",
        sectorId: "",
        brand: "",
        model: "",
        serialNumber: "",
        category: "",
        subType: "",
        capacityBTU: "",
        capacityLiters: undefined,
        voltage: "",
        gasType: "",
        compressorType: "",
        criticality: "",
        power: "",
        acquisitionDate: "",
        notes: "",
        status: "ok",
        ...asset
    });

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Update form when asset prop changes
    useEffect(() => {
        if (asset) {
            setFormData({ ...formData, ...asset });
        }
    }, [asset]);

    // Real-time validation
    useEffect(() => {
        validateForm();
    }, [formData]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Required fields
        if (touched.patrimonyNumber && !formData.patrimonyNumber?.trim()) {
            newErrors.patrimonyNumber = "Número do patrimônio é obrigatório";
        }

        if (touched.name && !formData.name?.trim()) {
            newErrors.name = "Nome do equipamento é obrigatório";
        }

        if (touched.sectorId && !formData.sectorId) {
            newErrors.sectorId = "Setor é obrigatório";
        }

        // Conditional validations
        if (formData.category === "Ar-Condicionado" && touched.capacityBTU && !formData.capacityBTU) {
            newErrors.capacityBTU = "Capacidade BTU é importante para ar-condicionado";
        }

        setErrors(newErrors);
    };

    const handleFieldChange = (field: keyof Asset, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleCategoryChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            category: value,
            subType: "" // Reset subtype when category changes
        }));
        setTouched(prev => ({ ...prev, category: true }));
    };

    const handleSubmit = () => {
        // Mark all fields as touched
        const allTouched = Object.keys(formData).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {} as Record<string, boolean>);
        setTouched(allTouched);

        // Validate
        validateForm();

        // Check for errors
        if (Object.keys(errors).length === 0) {
            onSave(formData);
        }
    };

    const isFormValid = () => {
        return formData.patrimonyNumber &&
            formData.name &&
            formData.sectorId &&
            Object.keys(errors).length === 0;
    };

    // Get sub-type options based on selected category
    const subTypeOptions = formData.category
        ? (ASSET_SUB_TYPES[formData.category] || []).map(st => ({ value: st, label: st }))
        : [];

    const sectorOptions = sectors.map(s => ({
        value: s.id,
        label: `${s.name}${s.block ? ` - Bloco ${s.block}` : ''}${s.room ? ` - Sala ${s.room}` : ''}`
    }));

    // Get selected sector details
    const selectedSector = sectors.find(s => s.id === formData.sectorId);

    return (
        <div className="space-y-6">
            {/* Basic Information */}
            <FormSection
                title="Informações Básicas"
                description="Dados principais do equipamento"
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInputField
                        id="patrimonyNumber"
                        label="Número do Patrimônio"
                        value={formData.patrimonyNumber || ""}
                        onChange={(val) => handleFieldChange("patrimonyNumber", val)}
                        placeholder="Ex: 123456"
                        required
                        error={touched.patrimonyNumber ? errors.patrimonyNumber : undefined}
                        helpText="Número único de identificação"
                    />

                    <FormInputField
                        id="serialNumber"
                        label="Número de Série"
                        value={formData.serialNumber || ""}
                        onChange={(val) => handleFieldChange("serialNumber", val)}
                        placeholder="Ex: ABC123XYZ"
                        helpText="Número de série do fabricante"
                    />
                </div>

                <FormInputField
                    id="name"
                    label="Nome do Equipamento"
                    value={formData.name || ""}
                    onChange={(val) => handleFieldChange("name", val)}
                    placeholder="Ex: Ar Condicionado Split 12000 BTUs"
                    required
                    error={touched.name ? errors.name : undefined}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInputField
                        id="brand"
                        label="Marca"
                        value={formData.brand || ""}
                        onChange={(val) => handleFieldChange("brand", val)}
                        placeholder="Ex: Samsung, LG, Consul"
                    />

                    <FormInputField
                        id="model"
                        label="Modelo"
                        value={formData.model || ""}
                        onChange={(val) => handleFieldChange("model", val)}
                        placeholder="Ex: AR12000"
                    />
                </div>

                <FormInputField
                    id="acquisitionDate"
                    label="Data de Aquisição"
                    type="date"
                    value={formData.acquisitionDate || ""}
                    onChange={(val) => handleFieldChange("acquisitionDate", val)}
                />
            </FormSection>

            {/* Location Section */}
            <FormSection
                title="Localização"
                description="Onde o equipamento está instalado"
            >
                <FormSelectField
                    id="sectorId"
                    label="Setor"
                    value={formData.sectorId || ""}
                    onChange={(val) => handleFieldChange("sectorId", val)}
                    options={sectorOptions}
                    placeholder="Selecione o setor..."
                    required
                    error={touched.sectorId ? errors.sectorId : undefined}
                />

                {/* Location Info Card */}
                {selectedSector && (
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl animate-in fade-in slide-in-from-bottom-2">
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
                )}
            </FormSection>

            {/* Technical Specifications */}
            <FormSection
                title="Especificações Técnicas"
                description="Detalhes técnicos do equipamento"
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormSelectField
                        id="category"
                        label="Categoria"
                        value={formData.category || ""}
                        onChange={handleCategoryChange}
                        options={ASSET_CATEGORIES}
                        placeholder="Selecione a categoria..."
                    />

                    {formData.category && subTypeOptions.length > 0 && (
                        <FormSelectField
                            id="subType"
                            label="Tipo Específico"
                            value={formData.subType || ""}
                            onChange={(val) => handleFieldChange("subType", val)}
                            options={subTypeOptions}
                            placeholder="Selecione o tipo..."
                        />
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInputField
                        id="capacityBTU"
                        label="Capacidade (BTU)"
                        value={formData.capacityBTU || ""}
                        onChange={(val) => handleFieldChange("capacityBTU", val)}
                        placeholder="Ex: 12000"
                        helpText="Para ar-condicionado"
                        error={touched.capacityBTU ? errors.capacityBTU : undefined}
                    />

                    <FormInputField
                        id="capacityLiters"
                        label="Capacidade (Litros)"
                        type="number"
                        value={formData.capacityLiters || ""}
                        onChange={(val) => handleFieldChange("capacityLiters", val ? parseFloat(val) : undefined)}
                        placeholder="Ex: 300"
                        helpText="Para refrigeradores/bebedouros"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormSelectField
                        id="voltage"
                        label="Voltagem"
                        value={formData.voltage || ""}
                        onChange={(val) => handleFieldChange("voltage", val)}
                        options={VOLTAGE_OPTIONS}
                    />

                    <FormSelectField
                        id="gasType"
                        label="Tipo de Gás"
                        value={formData.gasType || ""}
                        onChange={(val) => handleFieldChange("gasType", val)}
                        options={GAS_TYPES}
                        helpText="Gás refrigerante utilizado"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInputField
                        id="compressorType"
                        label="Tipo de Compressor"
                        value={formData.compressorType || ""}
                        onChange={(val) => handleFieldChange("compressorType", val)}
                        placeholder="Ex: Inverter, Rotativo"
                    />

                    <FormInputField
                        id="power"
                        label="Potência"
                        value={formData.power || ""}
                        onChange={(val) => handleFieldChange("power", val)}
                        placeholder="Ex: 1200W"
                        helpText="Potência em Watts"
                    />
                </div>

                <FormSelectField
                    id="criticality"
                    label="Grau de Importância"
                    value={formData.criticality || ""}
                    onChange={(val) => handleFieldChange("criticality", val)}
                    options={CRITICALITY_LEVELS}
                    helpText="Nível de importância do equipamento"
                />
            </FormSection>

            {/* Additional Notes */}
            <FormSection title="Observações">
                <div className="space-y-2">
                    <label htmlFor="notes" className="text-xs font-bold uppercase text-neutral-500 ml-1">
                        Notas Adicionais
                    </label>
                    <textarea
                        id="notes"
                        value={formData.notes || ""}
                        onChange={(e) => handleFieldChange("notes", e.target.value)}
                        placeholder="Informações adicionais sobre o equipamento..."
                        rows={4}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500 resize-none transition-all"
                    />
                    <p className="text-xs text-neutral-400 ml-1">
                        Adicione qualquer informação relevante que não se encaixe nos campos acima
                    </p>
                </div>
            </FormSection>

            {/* Form validation summary */}
            {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm font-bold text-red-800 mb-2">
                        Corrija os seguintes erros:
                    </p>
                    <ul className="text-sm text-red-700 space-y-1 ml-4 list-disc">
                        {Object.values(errors).map((error, idx) => (
                            <li key={idx}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
