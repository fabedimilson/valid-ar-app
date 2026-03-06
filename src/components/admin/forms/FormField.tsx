import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

interface BaseFieldProps {
    label: string;
    id: string;
    error?: string;
    required?: boolean;
    helpText?: string;
    className?: string;
}

interface InputFieldProps extends BaseFieldProps {
    type?: "text" | "email" | "number" | "date";
    value: string | number;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

interface SelectFieldProps extends BaseFieldProps {
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
    placeholder?: string;
    disabled?: boolean;
}

/**
 * Reusable Input Field Component with consistent styling
 * Mobile-first with touch-friendly sizes
 */
export function FormInputField({
    label,
    id,
    type = "text",
    value,
    onChange,
    placeholder,
    error,
    required,
    helpText,
    disabled,
    className = ""
}: InputFieldProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            <Label
                htmlFor={id}
                className="text-xs font-bold uppercase text-neutral-500 ml-1 flex items-center gap-1"
            >
                {label}
                {required && <span className="text-red-500">*</span>}
            </Label>

            <Input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
                aria-invalid={error ? 'true' : 'false'}
                className={`
                    h-12 sm:h-11 bg-neutral-50 border-neutral-200 text-sm rounded-xl 
                    focus:ring-emerald-500 focus:border-emerald-500
                    transition-all duration-200
                    ${error ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500' : ''}
                    ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
                `}
            />

            {error && (
                <div
                    id={`${id}-error`}
                    className="flex items-center gap-1.5 text-red-600 text-xs ml-1 animate-in fade-in slide-in-from-top-1"
                >
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {helpText && !error && (
                <p id={`${id}-help`} className="text-xs text-neutral-400 ml-1">
                    {helpText}
                </p>
            )}
        </div>
    );
}

/**
 * Reusable Select Field Component with consistent styling
 * Mobile-first with touch-friendly sizes
 */
export function FormSelectField({
    label,
    id,
    value,
    onChange,
    options,
    placeholder,
    error,
    required,
    helpText,
    disabled,
    className = ""
}: SelectFieldProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            <Label
                htmlFor={id}
                className="text-xs font-bold uppercase text-neutral-500 ml-1 flex items-center gap-1"
            >
                {label}
                {required && <span className="text-red-500">*</span>}
            </Label>

            <Select
                value={value}
                onValueChange={onChange}
                disabled={disabled}
            >
                <SelectTrigger
                    id={id}
                    className={`
                        h-12 sm:h-11 bg-neutral-50 border-neutral-200 text-sm rounded-xl
                        focus:ring-emerald-500 focus:border-emerald-500
                        transition-all duration-200
                        ${error ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500' : ''}
                        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
                    `}
                    aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
                    aria-invalid={error ? 'true' : 'false'}
                >
                    <SelectValue placeholder={placeholder || `Selecione ${label.toLowerCase()}...`} />
                </SelectTrigger>

                <SelectContent className="max-h-[300px]">
                    {options.length === 0 ? (
                        <div className="p-4 text-center text-sm text-neutral-500">
                            Nenhuma opção disponível
                        </div>
                    ) : (
                        options.map((option) => (
                            <SelectItem
                                key={option.value}
                                value={option.value}
                                className="cursor-pointer py-3"
                            >
                                {option.label}
                            </SelectItem>
                        ))
                    )}
                </SelectContent>
            </Select>

            {error && (
                <div
                    id={`${id}-error`}
                    className="flex items-center gap-1.5 text-red-600 text-xs ml-1 animate-in fade-in slide-in-from-top-1"
                >
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {helpText && !error && (
                <p id={`${id}-help`} className="text-xs text-neutral-400 ml-1">
                    {helpText}
                </p>
            )}
        </div>
    );
}

/**
 * Form Section Divider with title
 */
export function FormSection({
    title,
    description,
    children,
    className = ""
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`space-y-4 ${className}`}>
            <div className="border-b border-neutral-200 pb-3">
                <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wide">
                    {title}
                </h3>
                {description && (
                    <p className="text-xs text-neutral-500 mt-1">{description}</p>
                )}
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
}
