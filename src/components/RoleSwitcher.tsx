"use client";

import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useStore";
import { UserRole } from "@/types";
import { ShieldCheck, Wrench, Building2 } from "lucide-react";

export function RoleSwitcher() {
    const { currentUserRole, setRole } = useAppStore();

    const handleRoleChange = (role: UserRole) => {
        setRole(role);
    };

    return (
        <div className="flex bg-neutral-100 p-1 rounded-lg border border-neutral-200 overflow-hidden">
            <Button
                variant={currentUserRole === "admin" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleRoleChange("admin")}
                className="flex-1 gap-1 text-xs"
            >
                <Building2 className="w-3 h-3" />
                Admin
            </Button>
            <div className="w-[1px] bg-neutral-200" />
            <Button
                variant={currentUserRole === "server" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleRoleChange("server")}
                className="flex-1 gap-1 text-xs"
            >
                <ShieldCheck className="w-3 h-3" />
                Setor
            </Button>
            <div className="w-[1px] bg-neutral-200" />
            <Button
                variant={currentUserRole === "technician" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleRoleChange("technician")}
                className="flex-1 gap-1 text-xs"
            >
                <Wrench className="w-3 h-3" />
                Técnico
            </Button>
        </div>
    );
}
