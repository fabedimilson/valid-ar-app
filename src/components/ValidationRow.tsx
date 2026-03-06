"use client";

import { ServiceItem, PhotoEvidence } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, X, Camera, AlertCircle, HelpCircle } from "lucide-react";
import { PhotoUploader } from "./PhotoUploader";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ValidationRowProps {
    item: ServiceItem;
    onValidate: (status: ServiceItem['validationStatus'], photos: PhotoEvidence[], notes?: string) => void;
}

export function ValidationRow({ item, onValidate }: ValidationRowProps) {
    const [status, setStatus] = useState<ServiceItem['validationStatus']>(item.validationStatus);
    const [serverPhotos, setServerPhotos] = useState<PhotoEvidence[]>(item.serverPhotos || []);
    const [notes, setNotes] = useState(item.serverNotes || "");
    const [showCamera, setShowCamera] = useState(false);

    // Simplified "Reference" images map (would be from a DB in real app)
    const REFERENCE_IMAGES: Record<string, string> = {
        'cleaning': 'https://plus.unsplash.com/premium_photo-1664302152994-633ebda4f208?w=400&h=300&fit=crop',
        'part_replacement': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
        'gas_refill': 'https://images.unsplash.com/photo-1581092334651-ddf26d9a091e?w=400&h=300&fit=crop'
    };

    const handleAction = (newStatus: 'approved' | 'rejected') => {
        setStatus(newStatus);
        onValidate(newStatus, serverPhotos, notes);
    };

    const techBefore = item.technicianPhotos.filter(p => p.type === 'before')[0];
    const techAfter = item.technicianPhotos.filter(p => p.type === 'after')[0];

    return (
        <Card className={`border-l-4 transition-colors ${status === 'approved' ? 'border-l-green-500 bg-green-50/50' :
            status === 'rejected' ? 'border-l-red-500 bg-red-50/50' : 'border-l-neutral-300'
            }`}>
            <CardContent className="p-4 space-y-4">
                {/* Header Question */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base">{item.title}</h3>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <HelpCircle className="w-4 h-4 text-neutral-400 hover:text-emerald-600" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p className="font-bold mb-2">Referência Visual:</p>
                                    <img
                                        src={REFERENCE_IMAGES[item.category] || REFERENCE_IMAGES['part_replacement']}
                                        className="w-full h-32 object-cover rounded mb-2"
                                    />
                                    <p className="text-xs">Isto é como um(a) {item.title} deve parecer.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="font-mono font-bold">R$ {item.estimatedValue}</div>
                </div>

                <p className="text-sm text-neutral-600">{item.description}</p>

                {/* COMPARISON GRID */}
                <div className="grid grid-cols-2 gap-4 mt-2 bg-white p-3 rounded-lg border shadow-sm">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase">Técnico (Antes)</span>
                        {techBefore ? (
                            <Dialog>
                                <DialogTrigger>
                                    <img src={techBefore.url} className="w-full h-24 object-cover rounded bg-neutral-100 hover:opacity-90 cursor-zoom-in" />
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl p-0 overflow-hidden">
                                    <img src={techBefore.url} className="w-full h-full object-contain" />
                                </DialogContent>
                            </Dialog>
                        ) : (
                            <div className="w-full h-24 bg-neutral-100 rounded flex items-center justify-center text-xs text-muted-foreground">Sem Foto</div>
                        )}
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase">Técnico (Depois)</span>
                        {techAfter ? (
                            <Dialog>
                                <DialogTrigger>
                                    <img src={techAfter.url} className="w-full h-24 object-cover rounded bg-neutral-100 hover:opacity-90 cursor-zoom-in" />
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl p-0 overflow-hidden">
                                    <img src={techAfter.url} className="w-full h-full object-contain" />
                                </DialogContent>
                            </Dialog>
                        ) : (
                            <div className="w-full h-24 bg-neutral-100 rounded flex items-center justify-center text-xs text-muted-foreground">Sem Foto</div>
                        )}
                    </div>
                </div>

                {/* Validation Actions containing Fiscal Photo */}
                <div className="space-y-3 pt-2">
                    {!showCamera && serverPhotos.length === 0 && (
                        <div className="flex gap-2">
                            <Button
                                variant={status === 'approved' ? 'default' : 'outline'}
                                className={`flex-1 gap-2 ${status === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50 text-green-700 border-green-200'}`}
                                onClick={() => handleAction('approved')}
                            >
                                <Check className="w-4 h-4" /> Aprovar
                            </Button>
                            <Button
                                variant={status === 'rejected' ? 'default' : 'outline'}
                                className={`flex-1 gap-2 ${status === 'rejected' ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-red-50 text-red-700 border-red-200'}`}
                                onClick={() => handleAction('rejected')}
                            >
                                <X className="w-4 h-4" /> Rejeitar
                            </Button>
                        </div>
                    )}

                    {/* Fiscal Evidence Section */}
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => setShowCamera(!showCamera)}
                            className="text-xs flex items-center gap-1 text-emerald-600 font-medium hover:underline self-start"
                        >
                            <Camera className="w-3 h-3" />
                            {serverPhotos.length > 0 ? 'Editar fotos da fiscalização' : 'Adicionar Foto de Fiscalização (Prova)'}
                        </button>

                        {(showCamera || serverPhotos.length > 0) && (
                            <div className="bg-neutral-50 p-3 rounded border space-y-3">
                                {/* Photo List */}
                                {serverPhotos.length > 0 && (
                                    <div className="flex gap-2 mb-2">
                                        {serverPhotos.map(p => (
                                            <div key={p.id} className="relative w-20 h-20 rounded border overflow-hidden">
                                                <img src={p.url} className="w-full h-full object-cover" />
                                                <button
                                                    className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl"
                                                    onClick={() => {
                                                        const newPhotos = serverPhotos.filter(ph => ph.id !== p.id);
                                                        setServerPhotos(newPhotos);
                                                        onValidate(status, newPhotos, notes);
                                                    }}
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <PhotoUploader
                                    label={serverPhotos.length === 0 ? "Sua Evidência (Fiscal)" : "Adicionar Mais Fotos"}
                                    onUpload={(url) => {
                                        const newPhoto: PhotoEvidence = {
                                            id: Math.random().toString(),
                                            url,
                                            type: 'inspection',
                                            timestamp: Date.now()
                                        };
                                        const updatedPhotos = [...serverPhotos, newPhoto];
                                        setServerPhotos(updatedPhotos);
                                        onValidate(status, updatedPhotos, notes);
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Rejection Reason Input */}
                    {status === 'rejected' && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="text-xs font-bold text-red-700">Motivo da Rejeição:</label>
                            <textarea
                                className="w-full p-2 text-sm border border-red-200 rounded bg-red-50 focus:outline-none focus:ring-1 focus:ring-red-500"
                                placeholder="Ex: Peça antiga não foi apresentada..."
                                value={notes}
                                onChange={(e) => {
                                    setNotes(e.target.value);
                                    onValidate(status, serverPhotos, e.target.value);
                                }}
                            />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
