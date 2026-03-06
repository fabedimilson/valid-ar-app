
import { Label } from "@/components/ui/label";
import { Camera, Loader2, Image as ImageIcon } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

interface PhotoUploaderProps {
    onUpload: (url: string) => void;
    label?: string;
    className?: string;
}

export function PhotoUploader({ label, onUpload, className }: PhotoUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Size check (max 2MB to prevent freezing DB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("A imagem deve ter no máximo 2MB.");
            return;
        }

        setIsUploading(true);

        try {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                onUpload(base64String);
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            toast.error("Erro ao processar imagem.");
            setIsUploading(false);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={className}>
            {label && <Label className="block mb-2 text-xs font-bold text-neutral-500 uppercase">{label}</Label>}

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                capture="environment" // Prioritize rear camera on mobile
                onChange={handleFileChange}
            />

            <button
                type="button"
                onClick={handleClick}
                disabled={isUploading}
                className="w-full h-12 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center gap-2 text-neutral-500 hover:bg-neutral-50 hover:border-emerald-500 hover:text-emerald-600 transition-all active:scale-95 disabled:opacity-50"
            >
                {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Camera className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">
                    {isUploading ? "Processando..." : "Câmera / Galeria"}
                </span>
            </button>
        </div>
    );
}
