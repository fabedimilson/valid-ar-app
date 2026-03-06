import { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";

interface ResponsiveDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
    actions?: ReactNode;
    isSubmitting?: boolean;
    onSubmit?: () => void;
    submitLabel?: string;
    onCancel?: () => void;
    cancelLabel?: string;
    size?: "sm" | "md" | "lg" | "xl" | "full";
    hideActions?: boolean;
}

/**
 * Responsive Dialog Component
 * 
 * Features:
 * - Mobile-first design with full-screen on small devices
 * - Smooth animations
 * - Accessible keyboard navigation
 * - Loading states
 * - Customizable actions
 */
export function ResponsiveDialog({
    open,
    onOpenChange,
    title,
    description,
    children,
    actions,
    isSubmitting = false,
    onSubmit,
    submitLabel = "Salvar",
    onCancel,
    cancelLabel = "Cancelar",
    size = "md",
    hideActions = false
}: ResponsiveDialogProps) {

    const handleCancel = () => {
        if (isSubmitting) return;
        onCancel?.();
        onOpenChange(false);
    };

    const handleSubmit = () => {
        if (isSubmitting) return;
        onSubmit?.();
    };

    // Size mapping for responsive design
    const sizeClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        full: "max-w-full"
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={`
                    ${sizeClasses[size]}
                    w-[calc(100vw-2rem)] sm:w-full
                    max-h-[90vh] sm:max-h-[85vh]
                    overflow-hidden
                    flex flex-col
                    gap-0 p-0
                    rounded-2xl
                    animate-in fade-in-0 slide-in-from-bottom-4 duration-300
                `}
            >
                {/* Header - Sticky */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-neutral-50 to-white border-b border-neutral-200 px-4 sm:px-6 py-4">
                    <DialogHeader>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <DialogTitle className="text-lg sm:text-xl font-bold text-neutral-800 pr-8">
                                    {title}
                                </DialogTitle>
                                {description && (
                                    <DialogDescription className="text-xs sm:text-sm text-neutral-500 mt-1.5">
                                        {description}
                                    </DialogDescription>
                                )}
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
                    {children}
                </div>

                {/* Actions - Sticky */}
                {!hideActions && (
                    <div className="sticky bottom-0 z-10 bg-white border-t border-neutral-200 px-4 sm:px-6 py-4">
                        {actions || (
                            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-2 sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={isSubmitting}
                                    className="h-11 sm:h-10 rounded-xl font-medium"
                                >
                                    {cancelLabel}
                                </Button>

                                {onSubmit && (
                                    <Button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="h-11 sm:h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Salvando...
                                            </>
                                        ) : (
                                            submitLabel
                                        )}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

/**
 * Confirmation Dialog variant
 * Simpler dialog for yes/no confirmations
 */
interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "warning" | "info";
    isLoading?: boolean;
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    variant = "info",
    isLoading = false
}: ConfirmDialogProps) {

    const variantStyles = {
        danger: "bg-red-600 hover:bg-red-700 shadow-red-500/20",
        warning: "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20",
        info: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md w-[calc(100vw-2rem)] rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-neutral-800">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-neutral-600 mt-2">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-2 mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="h-11 sm:h-10 rounded-xl font-medium flex-1"
                    >
                        {cancelLabel}
                    </Button>

                    <Button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`h-11 sm:h-10 text-white rounded-xl font-bold shadow-lg flex-1 ${variantStyles[variant]}`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processando...
                            </>
                        ) : (
                            confirmLabel
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
