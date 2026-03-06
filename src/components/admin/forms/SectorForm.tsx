import { useState, useEffect } from "react";
import { Sector, SectorResponsible } from "@/types";
import { FormInputField, FormSelectField, FormSection } from "./FormField";
import { useAppStore } from "@/store/useStore";

interface SectorFormProps {
    sector: Partial<Sector> | null;
    onSave: (sector: Partial<Sector>) => void;
    isEditing?: boolean;
}

/**
 * Modern Sector Form Component
 * Form for creating/editing sectors with responsible person
 */
export function SectorForm({ sector, onSave, isEditing = false }: SectorFormProps) {
    const { sectors } = useAppStore();

    // Form state
    const [formData, setFormData] = useState<Partial<Sector>>({
        name: "",
        block: "",
        room: "",
        responsible: {
            id: "",
            name: "",
            siape: "",
            email: "",
            isActive: true
        } as SectorResponsible,
        ...sector
    });

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Update form when sector prop changes
    useEffect(() => {
        if (sector) {
            setFormData({ ...formData, ...sector });
        }
    }, [sector]);

    // Real-time validation
    useEffect(() => {
        validateForm();
    }, [formData]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Required fields
        if (touched.name && !formData.name?.trim()) {
            newErrors.name = "Nome do setor é obrigatório";
        }

        if (touched.responsibleName && !formData.responsible?.name?.trim()) {
            newErrors.responsibleName = "Nome do responsável é obrigatório";
        }

        if (touched.responsibleSiape && !formData.responsible?.siape?.trim()) {
            newErrors.responsibleSiape = "SIAPE é obrigatório";
        }

        if (touched.responsibleEmail && !formData.responsible?.email?.trim()) {
            newErrors.responsibleEmail = "Email é obrigatório";
        } else if (touched.responsibleEmail && formData.responsible?.email && !formData.responsible.email.includes("@")) {
            newErrors.responsibleEmail = "Email inválido";
        }

        setErrors(newErrors);
    };

    const handleFieldChange = (field: keyof Sector, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleResponsibleChange = (field: keyof SectorResponsible, value: any) => {
        setFormData(prev => ({
            ...prev,
            responsible: {
                ...(prev.responsible || {} as SectorResponsible),
                [field]: value
            }
        }));
        setTouched(prev => ({ ...prev, [`responsible${field.charAt(0).toUpperCase() + field.slice(1)}`]: true }));
    };

    const isFormValid = () => {
        return formData.name &&
            formData.responsible?.name &&
            formData.responsible?.siape &&
            formData.responsible?.email &&
            Object.keys(errors).length === 0;
    };

    return (
        <div className="space-y-6">
            {/* Sector Information */}
            <FormSection
                title="Informações do Setor"
                description="Localização e identificação do setor"
            >
                <FormInputField
                    id="name"
                    label="Nome do Setor"
                    value={formData.name || ""}
                    onChange={(val) => handleFieldChange("name", val)}
                    placeholder="Ex: Diretoria Acadêmica"
                    required
                    error={touched.name ? errors.name : undefined}
                    helpText="Nome completo do setor ou departamento"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInputField
                        id="block"
                        label="Bloco / Prédio"
                        value={formData.block || ""}
                        onChange={(val) => handleFieldChange("block", val)}
                        placeholder="Ex: Bloco A"
                        helpText="Identificação do bloco ou prédio"
                    />

                    <FormInputField
                        id="room"
                        label="Sala / Número"
                        value={formData.room || ""}
                        onChange={(val) => handleFieldChange("room", val)}
                        placeholder="Ex: Sala 201"
                        helpText="Número da sala ou ambiente"
                    />
                </div>
            </FormSection>

            {/* Responsible Person */}
            <FormSection
                title="Fiscal Responsável"
                description="Servidor público responsável pelo setor"
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInputField
                        id="responsibleName"
                        label="Nome Completo"
                        value={formData.responsible?.name || ""}
                        onChange={(val) => handleResponsibleChange("name", val)}
                        placeholder="Ex: João da Silva"
                        required
                        error={touched.responsibleName ? errors.responsibleName : undefined}
                    />

                    <FormInputField
                        id="responsibleSiape"
                        label="SIAPE"
                        value={formData.responsible?.siape || ""}
                        onChange={(val) => handleResponsibleChange("siape", val)}
                        placeholder="Ex: 1234567"
                        required
                        error={touched.responsibleSiape ? errors.responsibleSiape : undefined}
                        helpText="Matrícula SIAPE do servidor"
                    />
                </div>

                <FormInputField
                    id="responsibleEmail"
                    label="Email Institucional"
                    type="email"
                    value={formData.responsible?.email || ""}
                    onChange={(val) => handleResponsibleChange("email", val)}
                    placeholder="Ex: joao.silva@instituicao.gov.br"
                    required
                    error={touched.responsibleEmail ? errors.responsibleEmail : undefined}
                    helpText="Email para acesso ao sistema"
                />

                <FormInputField
                    id="ordinanceNumber"
                    label="Número da Portaria"
                    value={formData.responsible?.ordinanceNumber || ""}
                    onChange={(val) => handleResponsibleChange("ordinanceNumber", val)}
                    placeholder="Ex: Portaria nº 123/2024"
                    helpText="Portaria de designação do fiscal (opcional)"
                />

                {/* Info box */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex gap-3">
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">ℹ</span>
                        </div>
                        <div className="text-sm text-blue-900">
                            <p className="font-bold mb-1">Acesso do Fiscal</p>
                            <p className="text-blue-800">
                                A senha padrão inicial será <span className="font-mono font-bold">123456</span>.
                                O fiscal deverá alterá-la no primeiro acesso.
                            </p>
                        </div>
                    </div>
                </div>
            </FormSection>

            {/* Form validation summary */}
            {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-in fade-in slide-in-from-top-2">
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

            {/* Success indicator */}
            {isFormValid() && Object.keys(touched).length > 0 && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 text-emerald-700">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-sm font-medium">
                            Formulário válido! Você pode salvar agora.
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
