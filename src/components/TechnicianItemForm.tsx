import { useState, useEffect, useRef } from "react";
import { ServiceItem } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/useStore";
import { Camera, Check, ArrowRight, Wrench, Package, ArrowLeft, AlertCircle, Loader2, Search, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Props {
    ticketId?: string;
    onAdd: (item: ServiceItem) => void;
}

// Steps configuration for better UX
const FORM_STEPS = [
    { id: 1, label: 'Tipo', icon: Package },
    { id: 2, label: 'Item', icon: Wrench },
    { id: 3, label: 'Fotos', icon: Camera },
    { id: 4, label: 'Revisar', icon: Check }
] as const;

export function TechnicianItemForm({ ticketId, onAdd }: Props) {
    const { catalog, tickets } = useAppStore();

    // Multi-step state
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [serviceType, setServiceType] = useState<"service" | "part" | null>(null);

    // Form State — free-entry combobox
    const [freeText, setFreeText] = useState(""); // What the tech typed
    const [selectedCatalogId, setSelectedCatalogId] = useState(""); // Set only when chosen from catalog
    const [showSuggestions, setShowSuggestions] = useState(false);
    const comboRef = useRef<HTMLDivElement>(null);

    const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
    const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadingType, setUploadingType] = useState<'before' | 'after' | null>(null);

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const selectedItem = catalog.find(c => c.id === selectedCatalogId);
    // Suggestions: filter by type + what was typed
    const suggestions = catalog.filter(item => {
        const matchType = serviceType ? item.type === serviceType : true;
        const matchText = freeText.length > 0
            ? item.name.toLowerCase().includes(freeText.toLowerCase())
            : true;
        return matchType && matchText;
    }).slice(0, 8);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (comboRef.current && !comboRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Real-time validation
    useEffect(() => {
        const newErrors: Record<string, string> = {};
        if (step === 2 && touched.catalogItem && !freeText.trim() && !selectedCatalogId) {
            newErrors.catalogItem = "Digite ou selecione um item";
        }
        setErrors(newErrors);
    }, [freeText, selectedCatalogId, step, touched]);

    // Helper to trigger hidden file input
    const triggerFileInput = (id: string) => {
        document.getElementById(id)?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Touch the field for validation
        setTouched(prev => ({ ...prev, [`${type}Photo`]: true }));

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Arquivo muito grande! Máximo 5MB");
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error("Apenas imagens são permitidas");
            return;
        }

        setIsUploading(true);
        setUploadingType(type);

        try {
            const formData = new FormData();
            formData.append('file', file);
            const { uploadFileAction } = await import('@/app/actions/upload-actions');
            const result = await uploadFileAction(formData);

            if (result.success && result.url) {
                if (type === 'before') setBeforePhoto(result.url);
                else setAfterPhoto(result.url);
                toast.success("Foto enviada com sucesso! ✓");
            } else {
                toast.error("Erro ao enviar foto");
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro no upload");
        } finally {
            setIsUploading(false);
            setUploadingType(null);
        }
    };

    const canProceedToNextStep = () => {
        switch (step) {
            case 1:
                return serviceType !== null;
            case 2:
                // Allow free text OR catalog selection
                return freeText.trim().length > 0 || selectedCatalogId !== "";
            case 3:
                return true; // Fotos são opcionais
            default:
                return true;
        }
    };

    const handleNextStep = () => {
        if (step < 4 && canProceedToNextStep()) {
            setStep((prev) => (prev + 1) as typeof step);

            // Touch fields when moving forward for validation
            if (step === 2) setTouched(prev => ({ ...prev, catalogItem: true }));
            if (step === 3) setTouched(prev => ({ ...prev, beforePhoto: true, afterPhoto: true }));
        }
    };

    const handleSubmit = () => {
        const itemTitle = selectedItem ? selectedItem.name : freeText.trim();
        if (!itemTitle || !serviceType) {
            toast.error("Preencha o nome do item");
            return;
        }

        if (ticketId && itemTitle.toLowerCase().includes('preventiva')) {
            const isMonthly = itemTitle.toLowerCase().includes('mensal');
            const isQuarterly = itemTitle.toLowerCase().includes('trimestral');
            const isSemiAnnual = itemTitle.toLowerCase().includes('semestral');

            if (isMonthly || isQuarterly || isSemiAnnual) {
                const currentTicket = tickets.find(t => t.id === ticketId);

                if (currentTicket) {
                    // Check items in THIS OS
                    const hasSameFreqInOS = currentTicket.items.some(it => {
                        const t = (it as any).titleSnapshot || it.title;
                        if (!t) return false;
                        if (isMonthly) return t.toLowerCase().includes('mensal');
                        if (isQuarterly) return t.toLowerCase().includes('trimestral');
                        if (isSemiAnnual) return t.toLowerCase().includes('semestral');
                        return false;
                    });

                    if (hasSameFreqInOS) {
                        toast.error("Você já adicionou esta frequência de manutenção nesta OS.");
                        return;
                    }

                    // Check items in OTHER OS in the same period
                    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
                    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
                    const semiAnnualDaysAgo = Date.now() - 180 * 24 * 60 * 60 * 1000;

                    const hasSameFreqGlobally = tickets.some(t => {
                        if (t.assetId !== currentTicket.assetId || t.id === currentTicket.id) return false;

                        // Check time window according to frequency
                        if (isMonthly && t.openedAt < thirtyDaysAgo) return false;
                        if (isQuarterly && t.openedAt < ninetyDaysAgo) return false;
                        if (isSemiAnnual && t.openedAt < semiAnnualDaysAgo) return false;

                        return t.items.some(it => {
                            const title = (it as any).titleSnapshot || it.title;
                            if (!title) return false;
                            if (isMonthly) return title.toLowerCase().includes('mensal');
                            if (isQuarterly) return title.toLowerCase().includes('trimestral');
                            if (isSemiAnnual) return title.toLowerCase().includes('semestral');
                            return false;
                        });
                    });

                    if (hasSameFreqGlobally) {
                        toast.error("O sistema identificou que este serviço já foi faturado ou registrado recentemente para esta mesma máquina. Não é possível faturar novamente neste período.");
                        return;
                    }
                }
            }
        }

        const photos: any[] = [];
        if (beforePhoto) {
            photos.push({ id: Math.random().toString(), url: beforePhoto, timestamp: Date.now(), type: 'before' as const });
        }
        if (afterPhoto) {
            photos.push({ id: Math.random().toString(), url: afterPhoto, timestamp: Date.now(), type: 'after' as const });
        }

        const newItem: ServiceItem = {
            id: Math.random().toString(),
            // Only set catalogItemId if chosen from catalog
            catalogItemId: selectedItem ? selectedItem.id : undefined,
            title: itemTitle,
            description: description,
            category: serviceType === 'service' ? 'cleaning' : 'part_replacement',
            estimatedValue: selectedItem ? selectedItem.estimatedCost : 0,
            quantity: 1,
            technicianPhotos: photos,
            validationStatus: 'pending',
            serverPhotos: []
        };

        onAdd(newItem);
        toast.success("Item adicionado com sucesso! ✓");

        // Reset form
        resetForm();
    };

    const resetForm = () => {
        setStep(1);
        setServiceType(null);
        setFreeText("");
        setSelectedCatalogId("");
        setShowSuggestions(false);
        setBeforePhoto(null);
        setAfterPhoto(null);
        setDescription("");
        setErrors({});
        setTouched({});
    };

    // Step 1: Choose service type
    if (step === 1) {
        return (
            <div className="space-y-6 p-4 sm:p-6">
                <div className="text-center space-y-2 mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-neutral-800">Adicionar Item</h2>
                    <p className="text-sm text-neutral-500">Escolha o tipo de item para adicionar à OS</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={() => { setServiceType('service'); setStep(2); }}
                        className="group relative overflow-hidden bg-white p-6 sm:p-8 rounded-2xl border-2 border-slate-100 shadow-sm hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col items-center gap-3 active:scale-95"
                    >
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Wrench className="w-16 h-16 text-emerald-600" />
                        </div>
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <Wrench className="w-7 h-7 sm:w-8 sm:h-8" />
                        </div>
                        <span className="font-bold text-sm sm:text-base text-neutral-800">Serviço / Limpeza</span>
                        <span className="text-xs text-neutral-400 font-medium text-center">Mão de obra técnica</span>
                    </button>

                    <button
                        onClick={() => { setServiceType('part'); setStep(2); }}
                        className="group relative overflow-hidden bg-white p-6 sm:p-8 rounded-2xl border-2 border-slate-100 shadow-sm hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 flex flex-col items-center gap-3 active:scale-95"
                    >
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Package className="w-16 h-16 text-blue-600" />
                        </div>
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <Package className="w-7 h-7 sm:w-8 sm:h-8" />
                        </div>
                        <span className="font-bold text-sm sm:text-base text-neutral-800">Peça / Material</span>
                        <span className="text-xs text-neutral-400 font-medium text-center">Substituição</span>
                    </button>
                </div>
            </div>
        );
    }

    // Steps 2-4: Main form
    return (
        <Card className="border-none shadow-lg bg-white overflow-hidden animate-in slide-in-from-right-4 duration-300 ring-1 ring-neutral-100">
            {/* Header with Back Button and Progress */}
            <div className="bg-gradient-to-r from-neutral-50 to-white px-4 py-3 border-b flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setStep((prev) => Math.max(1, prev - 1) as typeof step)}
                        className="h-8 w-8 -ml-2 rounded-full hover:bg-neutral-100"
                    >
                        <ArrowLeft className="w-4 h-4 text-neutral-600" />
                    </Button>
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block leading-none mb-0.5">
                            Passo {step}/4
                        </span>
                        <span className={`text-sm font-bold ${serviceType === 'service' ? 'text-emerald-700' : 'text-blue-700'}`}>
                            {serviceType === 'service' ? 'Serviço ou Limpeza' : 'Peça ou Material'}
                        </span>
                    </div>
                </div>

                {/* Step indicators */}
                <div className="hidden sm:flex gap-2">
                    {FORM_STEPS.map((s) => {
                        const Icon = s.icon;
                        const isActive = s.id === step;
                        const isComplete = s.id < step;

                        return (
                            <div
                                key={s.id}
                                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${isActive
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : isComplete
                                        ? 'bg-emerald-50 text-emerald-600'
                                        : 'bg-neutral-100 text-neutral-400'
                                    }`}
                            >
                                {isComplete ? (
                                    <Check className="w-3 h-3" />
                                ) : (
                                    <Icon className="w-3 h-3" />
                                )}
                                <span className="text-xs font-medium hidden md:inline">{s.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Progress Bar Mobile */}
            <div className="flex gap-1 px-4 pt-3 sm:hidden">
                {FORM_STEPS.map((s, idx) => (
                    <div
                        key={s.id}
                        className={`flex-1 h-1 rounded-full transition-all duration-300 ${idx < step ? 'bg-emerald-500' : idx === step - 1 ? 'bg-emerald-400' : 'bg-neutral-200'
                            }`}
                    />
                ))}
            </div>

            <CardContent className="space-y-6 pt-6 pb-6 px-4 sm:px-6">
                {/* Step 2: Free-entry combobox with catalog suggestions */}
                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase text-neutral-500 ml-1 flex items-center gap-2">
                                {serviceType === 'service' ? 'Serviço Realizado' : 'Peça Utilizada'}
                                <span className="text-red-500">*</span>
                            </Label>
                            <p className="text-xs text-neutral-400 ml-1">Digite livremente ou escolha do catálogo como sugestão.</p>

                            {/* Combobox container */}
                            <div ref={comboRef} className="relative">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <Input
                                        value={freeText}
                                        onChange={(e) => {
                                            setFreeText(e.target.value);
                                            setSelectedCatalogId(""); // Clear catalog choice when typing
                                            setShowSuggestions(true);
                                            setTouched(prev => ({ ...prev, catalogItem: true }));
                                        }}
                                        onFocus={() => setShowSuggestions(true)}
                                        placeholder={`Ex: ${serviceType === 'service' ? 'Limpeza de filtros...' : 'Compressor 18k BTUs...'}`}
                                        className={`h-12 sm:h-14 pl-10 text-sm font-medium bg-neutral-50 border-neutral-200 rounded-xl focus:ring-emerald-500 ${errors.catalogItem && touched.catalogItem ? 'border-red-500' : ''
                                            } ${selectedCatalogId ? 'border-emerald-400 bg-emerald-50' : ''}`}
                                    />
                                    {selectedCatalogId && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                                <BookOpen className="w-2.5 h-2.5" /> Catálogo
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Suggestions dropdown */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden">
                                        <div className="px-3 py-1.5 bg-neutral-50 border-b border-neutral-100">
                                            <p className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider">Sugestões do catálogo</p>
                                        </div>
                                        <div className="max-h-52 overflow-y-auto">
                                            {suggestions.map(item => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setFreeText(item.name);
                                                        setSelectedCatalogId(item.id);
                                                        setShowSuggestions(false);
                                                        setTouched(prev => ({ ...prev, catalogItem: true }));
                                                    }}
                                                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-emerald-50 transition-colors text-left border-b border-neutral-50 last:border-0"
                                                >
                                                    <div>
                                                        <p className="text-sm font-semibold text-neutral-800">{item.name}</p>
                                                        {item.description && (
                                                            <p className="text-xs text-neutral-400 truncate max-w-[240px]">{item.description}</p>
                                                        )}
                                                    </div>
                                                    {item.estimatedCost > 0 && (
                                                        <span className="text-xs font-mono font-bold text-emerald-600 ml-3 shrink-0">
                                                            R$ {item.estimatedCost.toFixed(2)}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {errors.catalogItem && touched.catalogItem && (
                                <div className="flex items-center gap-1 text-red-500 text-xs ml-1 animate-in fade-in slide-in-from-top-1">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>{errors.catalogItem}</span>
                                </div>
                            )}
                        </div>

                        {/* Selected item preview */}
                        {selectedItem && (
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Check className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-emerald-700 uppercase mb-0.5">Item do Catálogo</p>
                                        <p className="font-bold text-neutral-800 text-sm mb-1">{selectedItem.name}</p>
                                        {selectedItem.estimatedCost > 0 && (
                                            <p className="text-emerald-700 font-mono font-bold text-lg">R$ {selectedItem.estimatedCost.toFixed(2)}</p>
                                        )}
                                        {selectedItem.description && (
                                            <p className="text-xs text-neutral-600 mt-1">{selectedItem.description}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Free text confirmation (when not from catalog) */}
                        {!selectedItem && freeText.trim().length > 0 && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl animate-in fade-in">
                                <p className="text-xs text-blue-700">
                                    <span className="font-bold">Entrada livre:</span> "{freeText.trim()}" será salvo no histórico deste equipamento.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Photos */}
                {step === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                        <Label className="text-xs font-bold uppercase text-neutral-500 ml-1 mb-2 block flex items-center gap-2">
                            Evidências Fotográficas
                            <span className="text-neutral-400 font-normal normal-case">(Opcional)</span>
                        </Label>

                        {/* Hidden Inputs */}
                        <input
                            type="file"
                            id="file-before"
                            className="hidden"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handleFileChange(e, 'before')}
                        />
                        <input
                            type="file"
                            id="file-after"
                            className="hidden"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handleFileChange(e, 'after')}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* BEFORE BOX */}
                            <div className="space-y-2">
                                <div
                                    onClick={() => !isUploading && triggerFileInput('file-before')}
                                    className={`
                                        aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group
                                        ${beforePhoto
                                            ? 'border-emerald-500 bg-neutral-900'
                                            : 'border-neutral-300 bg-neutral-50 hover:bg-white hover:border-emerald-400'}
                                        ${isUploading && uploadingType === 'before' ? 'pointer-events-none' : ''}
                                    `}
                                >
                                    {isUploading && uploadingType === 'before' ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                                            <span className="text-xs text-neutral-600 font-medium">Enviando foto...</span>
                                        </div>
                                    ) : beforePhoto ? (
                                        <>
                                            <img src={beforePhoto} alt="Antes" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-center backdrop-blur-sm">
                                                <span className="text-xs font-bold text-white uppercase tracking-wider">1. Antes</span>
                                            </div>
                                            <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-1.5 shadow-lg">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <span className="text-white text-xs font-bold bg-neutral-900/80 px-3 py-1 rounded-full">Trocar foto</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform bg-red-100">
                                                <Camera className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />
                                            </div>
                                            <span className="text-sm font-bold text-red-500 uppercase">1. Antes</span>
                                            <span className="text-xs text-neutral-400 mt-1">Toque para tirar foto</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* AFTER BOX */}
                            <div className="space-y-2">
                                <div
                                    onClick={() => !isUploading && triggerFileInput('file-after')}
                                    className={`
                                        aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group
                                        ${afterPhoto
                                            ? 'border-emerald-500 bg-neutral-900'
                                            : 'border-neutral-300 bg-neutral-50 hover:bg-white hover:border-emerald-400'}
                                        ${isUploading && uploadingType === 'after' ? 'pointer-events-none' : ''}
                                    `}
                                >
                                    {isUploading && uploadingType === 'after' ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                                            <span className="text-xs text-neutral-600 font-medium">Enviando foto...</span>
                                        </div>
                                    ) : afterPhoto ? (
                                        <>
                                            <img src={afterPhoto} alt="Depois" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-center backdrop-blur-sm">
                                                <span className="text-xs font-bold text-white uppercase tracking-wider">2. Depois</span>
                                            </div>
                                            <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-1.5 shadow-lg">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <span className="text-white text-xs font-bold bg-neutral-900/80 px-3 py-1 rounded-full">Trocar foto</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-2 transition-transform bg-emerald-100 group-hover:scale-110">
                                                <Camera className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
                                            </div>
                                            <span className="text-sm font-bold uppercase text-emerald-600">2. Depois</span>
                                            <span className="text-xs text-neutral-400 mt-1">Toque para tirar foto</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Info box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-3">
                            <Camera className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-xs text-blue-900">
                                <p className="font-bold mb-1">📸 Fotos opcionais, mas recomendadas!</p>
                                <p className="text-blue-800 mb-2">As fotos ajudam na documentação e validação do serviço.</p>
                                <p className="text-blue-700 text-[11px] italic">Você pode pular esta etapa e adicionar fotos depois, se necessário.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Review and Optional Notes */}
                {step === 4 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                        <Label className="text-xs font-bold uppercase text-neutral-500 ml-1 mb-2 block">
                            Revisar e Finalizar
                        </Label>

                        {/* Summary Card */}
                        {selectedItem && (
                            <div className="p-4 bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-xl space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                        {serviceType === 'service' ? (
                                            <Wrench className="w-6 h-6 text-white" />
                                        ) : (
                                            <Package className="w-6 h-6 text-white" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-emerald-700 font-bold uppercase mb-1">
                                            {serviceType === 'service' ? 'Serviço' : 'Peça'}
                                        </p>
                                        <p className="font-bold text-neutral-800 text-base">{selectedItem.name}</p>
                                        <p className="text-emerald-700 font-mono font-bold text-xl mt-1">
                                            R$ {selectedItem.estimatedCost.toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                {/* Photos preview */}
                                <div className="grid grid-cols-2 gap-2">
                                    {beforePhoto && (
                                        <div className="relative rounded-lg overflow-hidden aspect-square">
                                            <img src={beforePhoto} alt="Antes" className="w-full h-full object-cover" />
                                            <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1 text-center backdrop-blur-sm">
                                                <span className="text-[10px] font-bold text-white uppercase">Antes</span>
                                            </div>
                                        </div>
                                    )}
                                    {afterPhoto && (
                                        <div className="relative rounded-lg overflow-hidden aspect-square">
                                            <img src={afterPhoto} alt="Depois" className="w-full h-full object-cover" />
                                            <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1 text-center backdrop-blur-sm">
                                                <span className="text-[10px] font-bold text-white uppercase">Depois</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Optional Description */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-neutral-500 ml-1">
                                Observações / Serial (Opcional)
                            </Label>
                            <Input
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Ex: Nº de série da peça ou detalhe..."
                                className="bg-neutral-50 border-neutral-200 h-12 text-sm rounded-xl focus:ring-emerald-500"
                            />
                            <p className="text-xs text-neutral-400 ml-1">
                                Adicione informações extras se necessário
                            </p>
                        </div>

                        {/* Final Submit Button */}
                        <Button
                            onClick={handleSubmit}
                            className="w-full h-14 sm:h-16 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
                        >
                            <Check className="w-5 h-5 mr-2" />
                            Confirmar e Adicionar Item
                        </Button>
                    </div>
                )}

                {/* Navigation Buttons for steps 2-3 */}
                {step < 4 && (
                    <div className="flex gap-3 pt-2">
                        <Button
                            onClick={() => setStep((prev) => Math.max(1, prev - 1) as typeof step)}
                            variant="outline"
                            className="flex-1 h-12 sm:h-14 text-sm font-bold rounded-xl"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar
                        </Button>
                        <Button
                            onClick={handleNextStep}
                            disabled={!canProceedToNextStep()}
                            className="flex-1 h-12 sm:h-14 text-sm font-bold bg-neutral-900 hover:bg-black text-white rounded-xl shadow-lg shadow-neutral-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Próximo
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
