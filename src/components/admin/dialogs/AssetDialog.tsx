import { useState } from "react";
import { Asset } from "@/types";
import { ResponsiveDialog } from "../dialogs/ResponsiveDialog";
import { AssetForm } from "../forms/AssetForm";
import { useAppStore } from "@/store/useStore";
import { toast } from "sonner";

interface AssetDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    asset?: Asset | null;
    onSuccess?: () => void;
}

/**
 * Asset Dialog Component
 * Combines ResponsiveDialog + AssetForm for a complete UX
 */
export function AssetDialog({ open, onOpenChange, asset, onSuccess }: AssetDialogProps) {
    const { addAsset, updateAsset } = useAppStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formRef, setFormRef] = useState<{ save: () => void } | null>(null);

    const isEditing = !!asset?.id;

    const handleSave = async (assetData: Partial<Asset>) => {
        setIsSubmitting(true);

        try {
            if (isEditing && asset?.id) {
                // Update existing asset
                await updateAsset(asset.id, assetData);
                toast.success("Equipamento atualizado com sucesso! ✓");
            } else {
                // Create new asset
                await addAsset(assetData as Omit<Asset, 'id'> as any);
                toast.success("Equipamento cadastrado com sucesso! ✓");
            }

            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            console.error("Error saving asset:", error);
            toast.error("Erro ao salvar equipamento. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (isSubmitting) return;
        onOpenChange(false);
    };

    return (
        <ResponsiveDialog
            open={open}
            onOpenChange={onOpenChange}
            title={isEditing ? "Editar Equipamento" : "Novo Equipamento"}
            description={
                isEditing
                    ? "Atualize as informações do equipamento abaixo"
                    : "Preencha os dados do novo equipamento"
            }
            size="lg"
            isSubmitting={isSubmitting}
            onSubmit={() => {
                // This will be handled by the form itself
                formRef?.save();
            }}
            submitLabel={isEditing ? "Atualizar" : "Cadastrar"}
            onCancel={handleCancel}
        >
            <AssetForm
                asset={asset || null}
                onSave={handleSave}
                isEditing={isEditing}
            />
        </ResponsiveDialog>
    );
}
