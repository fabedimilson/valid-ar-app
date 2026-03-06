
'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Sector, Asset, Company, CatalogItem, ProblemType, TechnicianProfile, Ticket, ServiceItem } from "@/types";
import bcrypt from "bcryptjs";

// --- HELPERS PARA MAPEAR ENUMS ---

function mapAssetStatusToPrisma(status: string) {
    // Front: 'ok' | 'waiting_tech' | 'maintenance' | 'paralyzed' | 'condemned'
    // Prisma: OPERATIONAL, DEFECTIVE, UNDER_MAINTENANCE, RETIRED
    // Note: Adjust according to your actual Prisma Enum if needed. Assuming strict mapping or string.
    // For now returning undefined to let Prisma use default or error if type mismatch.
    // Ideally this should map to valid enums if defined in schema.
    return undefined;
}

function mapTicketStatusToPrisma(status: string) {
    // Front: 'open' | 'in_progress' | 'waiting_validation' | 'validated' | 'completed'
    switch (status) {
        case 'open': return 'OPEN';
        case 'in_progress': return 'IN_PROGRESS';
        case 'waiting_validation': return 'WAITING_VALIDATION';
        case 'validated': return 'VALIDATED';
        case 'completed': return 'VALIDATED';
        default: return 'OPEN';
    }
}

// --- SECTORS ---

export async function addSectorAction(sectorData: Sector) {
    try {
        console.log('Criando setor:', sectorData.name);

        // 1. Criar o Setor
        const newSector = await prisma.sector.create({
            data: {
                id: sectorData.id,
                name: sectorData.name,
                block: sectorData.block,
                floor: sectorData.floor,
                room: sectorData.room,
                responsibleHistory: [] // Initialize empty JSON array
            }
        });



        // 2. Se tiver dados de responsavel, criar usuario
        const respData = sectorData.responsible;
        if (respData && respData.email) {
            console.log('Criando responsavel:', respData.email);
            const hashedPassword = await bcrypt.hash(respData.password || '123456', 10);

            // Verifica se usuario ja existe
            const existingUser = await prisma.user.findUnique({ where: { email: respData.email } });

            let userId = existingUser?.id;

            if (!existingUser) {
                const newUser = await prisma.user.create({
                    data: {
                        name: respData.name,
                        email: respData.email,
                        role: 'SERVER',
                        passwordHash: hashedPassword,
                        active: true,
                        metadata: {
                            siape: respData.siape,
                            designationDate: respData.designationDate,
                        }
                    } as any
                });
                userId = newUser.id;
            } else {
                // Ensure active if reusing
                await prisma.user.update({
                    where: { id: userId },
                    data: { active: true } as any
                });
            }

            // 3. Vincular setor ao usuario
            if (userId) {
                const updateData: any = { responsibleId: userId };
                if (respData.ordinanceNumber) updateData.ordinanceNumber = respData.ordinanceNumber;

                await prisma.sector.update({
                    where: { id: newSector.id },
                    data: updateData
                });
            }
        }

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Erro ao criar setor:", error);
        return { success: false, error };
    }
}

export async function changeSectorResponsibleAction(sectorId: string, historyItem: any, newResponsible: any) {
    try {
        console.log(`Trocando responsável do setor ${sectorId}`);

        // 1. Get current sector to find current responsible
        const currentSector = await prisma.sector.findUnique({
            where: { id: sectorId },
            include: { responsible: true }
        });

        if (currentSector?.responsibleId) {
            // Deactivate OLD responsible
            console.log(`Desativando usuário antigo: ${currentSector.responsible?.email}`);
            await prisma.user.update({
                where: { id: currentSector.responsibleId },
                data: { active: false } as any
            });
        }

        // 2. Preparar o novo responsável (User)
        let newUserId: string | undefined;

        // Verificar se usuário já existe
        const existingUser = await prisma.user.findUnique({ where: { email: newResponsible.email } });
        if (existingUser) {
            newUserId = existingUser.id;
            // Reactivate if existing
            await prisma.user.update({
                where: { id: newUserId },
                data: { active: true } as any
            });
        } else {
            // Criar novo usuário
            const hashedPassword = await bcrypt.hash(newResponsible.password || '123456', 10);
            const newUser = await prisma.user.create({
                data: {
                    name: newResponsible.name,
                    email: newResponsible.email,
                    role: 'SERVER',
                    passwordHash: hashedPassword,
                    active: true,
                    metadata: { // Store extra fields in metadata
                        siape: newResponsible.siape,
                        designationDate: newResponsible.designationDate || new Date().toISOString()
                    }
                } as any
            });
            newUserId = newUser.id;
        }

        // 3. Atualizar o Setor e arquivar histórico
        if (newUserId) {
            // Cast existing history to array or empty
            const existingHistory = (currentSector?.responsibleHistory as any[]) || [];

            await prisma.sector.update({
                where: { id: sectorId },
                data: {
                    responsibleId: newUserId,
                    ordinanceNumber: newResponsible.ordinanceNumber, // Update ordinance too
                    responsibleHistory: [historyItem, ...existingHistory]
                } as any
            });
            revalidatePath('/');
            return { success: true };
        } else {
            throw new Error("Falha ao obter ID do novo usuário");
        }

    } catch (error) {
        console.error("Erro ao trocar responsável:", error);
        return { success: false, error };
    }
}

export async function updateSectorResponsibleAction(sectorId: string, data: Partial<import('@/types').SectorResponsible>) {
    try {
        const sector = await prisma.sector.findUnique({
            where: { id: sectorId },
            include: { responsible: true }
        });

        if (!sector || !sector.responsibleId) {
            return { success: false, error: "Setor sem responsável" };
        }

        // Update User fields
        if (data.name || data.email || data.isActive !== undefined || data.siape || data.designationDate) {
            const updateData: any = {};
            if (data.name) updateData.name = data.name;
            if (data.email) updateData.email = data.email;
            if (data.isActive !== undefined) updateData.active = data.isActive;

            // Update metadata (siape, designationDate)
            if (data.siape || data.designationDate) {
                const currentMeta = (sector.responsible?.metadata as any) || {};
                updateData.metadata = {
                    ...currentMeta,
                    ...(data.siape ? { siape: data.siape } : {}),
                    ...(data.designationDate ? { designationDate: data.designationDate } : {})
                };
            }

            if (Object.keys(updateData).length > 0) {
                await prisma.user.update({
                    where: { id: sector.responsibleId },
                    data: updateData
                });
            }
        }

        // Update Sector fields (ordinanceNumber)
        if (data.ordinanceNumber) {
            await prisma.sector.update({
                where: { id: sectorId },
                data: { ordinanceNumber: data.ordinanceNumber }
            });
        }

        revalidatePath('/');
        return { success: true };

    } catch (error) {
        console.error("Erro ao atualizar responsável:", error);
        return { success: false, error };
    }
}

export async function updateSectorAction(id: string, data: { name: string, block?: string, floor?: string, room?: string }) {
    try {
        await prisma.sector.update({
            where: { id },
            data: {
                name: data.name,
                block: data.block,
                floor: data.floor,
                room: data.room
            }
        });
        revalidatePath('/');
        return { success: true };
    } catch (e) { return { success: false } }
}


// --- ASSETS ---

export async function addAssetAction(asset: Asset) {
    try {
        await prisma.asset.create({
            data: {
                id: asset.id,
                name: asset.name,
                patrimonyNumber: asset.patrimonyNumber,
                brand: asset.brand,
                model: asset.model,
                acquisitionDate: asset.acquisitionDate ? new Date(asset.acquisitionDate) : undefined,
                sectorId: asset.sectorId,
                // New Fields
                serialNumber: asset.serialNumber,
                category: asset.category,
                subType: asset.subType,
                capacityBTU: asset.capacityBTU,
                capacityLiters: asset.capacityLiters,
                voltage: asset.voltage,
                gasType: asset.gasType,
                compressorType: asset.compressorType,
                criticality: asset.criticality,
                power: asset.power
            }
        });
        revalidatePath('/');
        return { success: true };
    } catch (e) {
        console.error("Erro asset:", e);
        return { success: false };
    }
}

export async function updateAssetAction(id: string, data: Partial<Asset>) {
    try {
        await prisma.asset.update({
            where: { id },
            data: {
                name: data.name,
                patrimonyNumber: data.patrimonyNumber,
                brand: data.brand,
                model: data.model,
                acquisitionDate: data.acquisitionDate ? new Date(data.acquisitionDate) : undefined,
                sectorId: data.sectorId,
                serialNumber: data.serialNumber,
                category: data.category,
                subType: data.subType,
                capacityBTU: data.capacityBTU,
                capacityLiters: data.capacityLiters,
                voltage: data.voltage,
                gasType: data.gasType,
                compressorType: data.compressorType,
                criticality: data.criticality,
                power: data.power
            }
        });
        revalidatePath('/');
        return { success: true };
    } catch (e) { return { success: false } }
}

// --- COMPANIES & TECHNICIANS ---

export async function addCompanyAction(company: Company) {
    try {
        await prisma.company.create({
            data: {
                id: company.id,
                name: company.name,
                cnpj: company.cnpj
            }
        });
        revalidatePath('/');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false };
    }
}

export async function addTechnicianAction(companyId: string, tech: TechnicianProfile) {
    try {
        console.log(">>> [SERVER] addTechnicianAction RAW FORCE");
        // Criar User primeiro
        const generatedEmail = `tech.${tech.name.split(' ')[0].toLowerCase()}.${Math.floor(Math.random() * 1000)}@empresa.com`;
        const finalEmail = tech.email && tech.email.trim() !== '' ? tech.email : generatedEmail;

        const passHash = await bcrypt.hash('123456', 10);

        // 1. Create User via Prisma (standard works for core fields)
        // Avoid setting complex relations or metadata here to bypass potential schema cache issues
        const user = await prisma.user.create({
            data: {
                name: tech.name,
                email: finalEmail,
                role: 'TECHNICIAN',
                passwordHash: passHash,
            }
        });

        // 2. Force Update Metadata (CPF) via Raw SQL
        if (tech.cpf) {
            const metaJson = { cpf: tech.cpf };
            await prisma.$executeRaw`UPDATE "users" SET "metadata" = ${metaJson} WHERE "id" = ${user.id}`;
        }

        // 3. Create Technician via Raw SQL
        const isMgr = tech.isManager === true;
        // tech.id comes from frontend (uuidv4)

        await prisma.$executeRaw`
            INSERT INTO "technicians" ("id", "user_id", "company_id", "is_manager")
            VALUES (${tech.id}, ${user.id}, ${companyId}, ${isMgr})
        `;

        revalidatePath('/');
        return { success: true };
    } catch (e) {
        console.error(">>> [SERVER] Create Error RAW:", e);
        return { success: false };
    }
}

export async function updateCompanyAction(id: string, data: Partial<Company>) {
    try {
        await prisma.company.update({
            where: { id },
            data: {
                name: data.name,
                cnpj: data.cnpj
            }
        });
        revalidatePath('/');
        return { success: true };
    } catch (e) { return { success: false } }
}

export async function deleteCompanyAction(id: string) {
    try {
        await prisma.company.delete({ where: { id } });
        revalidatePath('/');
        return { success: true };
    } catch (e) { return { success: false } }
}

export async function deleteTechnicianAction(companyId: string, technicianId: string) {
    try {
        // Find user by technician profile? Or simpler, delete via Technician model
        await prisma.technician.delete({ where: { id: technicianId } });
        revalidatePath('/');
        return { success: true };
    } catch (e) { return { success: false } }
}

export async function updateTechnicianAction(id: string, data: Partial<import('@/types').TechnicianProfile>) {
    console.log(">>> [SERVER] updateTechnicianAction RAW FORCE:", { id, data });
    try {
        // 1. Force Update isManager via Raw SQL
        if (data.isManager !== undefined) {
            const isMgr = data.isManager === true;
            await prisma.$executeRaw`UPDATE "technicians" SET "is_manager" = ${isMgr} WHERE "id" = ${id}`;
            console.log(">>> [SERVER] Raw SQL Updated isManager:", isMgr);
        }

        // 2. Get User ID
        const tech = await prisma.technician.findUnique({ where: { id }, select: { userId: true } });

        if (tech) {
            // 3. Force Update Metadata (CPF) via Raw SQL
            if (data.cpf) {
                const metaJson = { cpf: data.cpf };
                await prisma.$executeRaw`UPDATE "users" SET "metadata" = ${metaJson} WHERE "id" = ${tech.userId}`;
                console.log(">>> [SERVER] Raw SQL Updated Metadata:", metaJson);
            }

            // 4. Update Name/Email (Standard Prisma)
            if (data.name || data.email) {
                const userUpdate: any = {};
                if (data.name) userUpdate.name = data.name;
                if (data.email) userUpdate.email = data.email;

                await prisma.user.update({
                    where: { id: tech.userId },
                    data: userUpdate
                });
            }
        }

        revalidatePath('/');
        return { success: true };
    } catch (e) {
        console.error(">>> [SERVER] Erro updateTechnician:", e);
        return { success: false, error: String(e) }
    }
}

// --- CATALOG & PROBLEM TYPES ---
export async function addCatalogItemAction(item: CatalogItem) {
    try {
        await prisma.catalogItem.create({
            data: {
                id: item.id,
                name: item.name,
                type: item.type,
                estimatedCost: item.estimatedCost,
                description: item.description
            }
        });
        revalidatePath('/');
        return { success: true };
    } catch (e) {
        console.error("Erro ao adicionar item catalogo:", e);
        return { success: false };
    }
}

export async function updateCatalogItemAction(id: string, data: Partial<CatalogItem>) {
    try {
        await prisma.catalogItem.update({
            where: { id },
            data: {
                name: data.name,
                type: data.type,
                estimatedCost: data.estimatedCost,
                description: data.description
            }
        });
        revalidatePath('/');
        return { success: true };
    } catch (e) {
        console.error("Erro ao atualizar item catalogo:", e);
        return { success: false };
    }
}

export async function deleteCatalogItemAction(id: string) {
    try {
        await prisma.catalogItem.delete({ where: { id } });
        revalidatePath('/');
        return { success: true };
    } catch (e) { return { success: false } }
}

// --- PROBLEM TYPES ---
export async function addProblemTypeAction(problem: ProblemType) {
    try {
        await prisma.problemType.create({
            data: {
                id: problem.id,
                label: problem.label,
                description: problem.description
            }
        });
        revalidatePath('/');
        return { success: true };
    } catch (e) {
        console.error("Erro ao adicionar tipo de defeito:", e);
        return { success: false };
    }
}

export async function updateProblemTypeAction(id: string, data: Partial<ProblemType>) {
    try {
        await prisma.problemType.update({
            where: { id },
            data: {
                label: data.label,
                description: data.description
            }
        });
        revalidatePath('/');
        return { success: true };
    } catch (e) {
        console.error("Erro ao atualizar tipo de defeito:", e);
        return { success: false };
    }
}

export async function deleteProblemTypeAction(id: string) {
    try {
        await prisma.problemType.delete({ where: { id } });
        revalidatePath('/');
        return { success: true };
    } catch (e) { return { success: false } }
}


// --- TICKETS WORKFLOW ---

/**
 * Dedicated action to schedule a preventive maintenance OS.
 * Returns the generated ticket with its DB code so the UI can display VOS-XXXXXX immediately.
 */
export async function schedulePreventiveAction(params: {
    id: string;
    assetId: string;
    sectorId: string;
    technicianId?: string;
    scheduledAt: number; // timestamp ms
    description: string;
}) {
    try {
        // Find a valid requester (prefer ADMIN)
        let requester = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
        if (!requester) requester = await prisma.user.findFirst();
        if (!requester) throw new Error("Nenhum usuário encontrado para criar o ticket.");

        const ticket = await prisma.ticket.create({
            data: {
                id: params.id,
                description: params.description,
                status: 'SCHEDULED',
                type: 'PREVENTIVE',
                assetId: params.assetId,
                sectorId: params.sectorId,
                requesterId: requester.id,
                technicianId: params.technicianId || null,
                scheduledAt: new Date(params.scheduledAt),
            }
        });

        console.log(`[schedulePreventive] OS preventiva criada: #${ticket.code} (${ticket.id})`);
        revalidatePath('/');
        return { success: true, ticket: { id: ticket.id, code: ticket.code } };
    } catch (e) {
        console.error("[schedulePreventive] Erro:", e);
        return { success: false, error: String(e) };
    }
}

/**
 * Updates the scheduledAt date of an existing preventive OS.
 * Used when the leader wants to change the date without creating a new OS.
 */
export async function reschedulePreventiveAction(ticketId: string, scheduledAt: number) {
    try {
        await prisma.ticket.update({
            where: { id: ticketId },
            data: { scheduledAt: new Date(scheduledAt) }
        });
        console.log(`[reschedule] OS ${ticketId} reagendada para ${new Date(scheduledAt).toLocaleDateString('pt-BR')}`);
        revalidatePath('/');
        return { success: true };
    } catch (e) {
        console.error('[reschedule] Erro:', e);
        return { success: false, error: String(e) };
    }
}

export async function createTicketAction(ticket: Ticket) {
    try {
        console.log("Iniciando criação de ticket:", ticket);

        // 1. Tentar encontrar um solicitante válido (ADMIN preferencialmente)
        let requester = await prisma.user.findFirst({ where: { role: 'ADMIN', id: { not: '' } } });

        // 2. Fallback: Qualquer usuário válido
        if (!requester?.id) {
            console.log("Admin não encontrado, buscando qualquer usuário...");
            requester = await prisma.user.findFirst({ where: { id: { not: '' } } });
        }

        // 3. Fallback Final: Criar usuário do sistema se ninguém existir
        if (!requester?.id) {
            console.log("Nenhum usuário encontrado. Criando usuário do sistema...");
            const hashedPassword = await bcrypt.hash('system123', 10);
            requester = await prisma.user.create({
                data: {
                    name: 'System User',
                    email: 'system@validar.com',
                    passwordHash: hashedPassword,
                    role: 'ADMIN',
                    active: true
                }
            });
        }

        if (!requester?.id) {
            throw new Error("Falha crítica: Não foi possível definir um solicitante para o ticket.");
        }

        console.log("Solicitante definido:", requester.email, requester.id);

        let prismaStatus: any = 'OPEN';
        let prismaType: any = 'CORRECTIVE';

        if (ticket.status === 'scheduled') prismaStatus = 'SCHEDULED';
        if (ticket.type === 'preventive') prismaType = 'PREVENTIVE';

        await prisma.ticket.create({
            data: {
                id: ticket.id,
                description: ticket.description,
                status: prismaStatus,
                type: prismaType,
                assetId: ticket.assetId,
                sectorId: ticket.sectorId,
                requesterId: requester.id,
                technicianId: ticket.technicianId || null,
                scheduledAt: ticket.scheduledAt ? new Date(ticket.scheduledAt) : null,
            }
        });

        console.log("Ticket criado com sucesso no banco.");
        revalidatePath('/');
        return { success: true };
    } catch (e) {
        console.error("Erro crítico ao criar ticket:", e);
        return { success: false, error: String(e) };
    }
}

export async function startServiceAction(ticketId: string) {
    try {
        await prisma.ticket.update({
            where: { id: ticketId },
            data: { status: 'IN_PROGRESS' } // Should correspond to enum
        });
        revalidatePath('/');
        return { success: true };
    } catch (e) { return { success: false } }
}

export async function submitTicketAction(ticketId: string) {
    try {
        await prisma.ticket.update({
            where: { id: ticketId },
            data: { status: 'WAITING_VALIDATION' }
        });
        revalidatePath('/');
        return { success: true };
    } catch (e) { return { success: false } }
}

// Stubs for complex updates (implemented in future)
// Stubs for complex updates (implemented in future)
export async function addItemToTicketAction(ticketId: string, item: ServiceItem) {
    try {
        console.log(`Adicionando item ao ticket ${ticketId}`, item);

        // 1. Create Service Item
        const newItem = await prisma.serviceItem.create({
            data: {
                id: item.id, // Use ID from front if possible, or let default
                ticketId: ticketId,
                titleSnapshot: item.title,
                priceSnapshot: item.estimatedValue,
                technicianNotes: item.description,
                validationStatus: 'PENDING',
                // category is not in schema directly? Ah, schema has no category. It's implicit or missing.
                // Checking schema: ServiceItem has catalogReferenceId but no category enum.
                // Ideally we should map catalogReferenceId.
                catalogReferenceId: item.catalogItemId
            }
        });


        // 2. Add Evidence
        if (item.technicianPhotos && item.technicianPhotos.length > 0) {
            // Find a valid user to attribute upload to (Mocking session)
            const uploader = await prisma.user.findFirst();
            const uploaderId = uploader?.id || 'admin-temp'; // Fallback will fail if empty DB

            for (const photo of item.technicianPhotos) {
                // Ensure valid enum for type
                const evType = photo.type === 'before' ? 'BEFORE' : (photo.type === 'after' ? 'AFTER' : 'INSPECTION');

                await prisma.evidenceLink.create({
                    data: {
                        serviceItemId: newItem.id,
                        url: photo.url,
                        type: evType,
                        uploadedById: uploaderId
                    }
                });
            }
        }

        revalidatePath('/');
        return { success: true };

    } catch (e) {
        console.error("Erro ao adicionar item:", e);
        return { success: false, error: e };
    }
}

export async function updateTicketAction(ticketId: string, updates: Partial<Ticket>) { return { success: false }; }
export async function updateItemValidationAction(ticketId: string, itemId: string, status: ServiceItem['validationStatus'], notes?: string) { return { success: false }; }

// --- VALOR DA OS (Técnico Líder) ---

export async function setTicketTotalValueAction(ticketId: string, totalValue: number) {
    try {
        await prisma.ticket.update({
            where: { id: ticketId },
            data: { totalValue: totalValue } as any
        });
        revalidatePath('/');
        return { success: true };
    } catch (e) {
        console.error("Erro ao definir valor da OS:", e);
        return { success: false, error: String(e) };
    }
}

// Retorna apenas OS corretivas validadas para o técnico líder lançar valores.
// OS preventivas têm valor calculado automaticamente pelo catálogo do pregão.
export async function getValidatedTicketsAction(companyId?: string) {
    try {
        const ticketsRaw = await prisma.ticket.findMany({
            where: { status: 'VALIDATED', type: 'CORRECTIVE' },
            orderBy: { updatedAt: 'desc' },
            include: {
                asset: { select: { name: true, patrimonyNumber: true } },
                sector: { select: { name: true } },
                items: { select: { titleSnapshot: true, priceSnapshot: true, quantity: true } }
            }
        });

        return {
            success: true,
            tickets: ticketsRaw.map((t: any) => ({
                id: t.id,
                code: t.code,
                type: t.type === 'PREVENTIVE' ? 'preventive' : 'corrective',
                description: t.description,
                assetName: t.asset?.name,
                patrimonyNumber: t.asset?.patrimonyNumber,
                sectorName: t.sector?.name,
                closedAt: t.closedAt?.toISOString() || t.updatedAt.toISOString(),
                totalValue: t.totalValue ? Number(t.totalValue) : null,
                items: (t.items || []).map((i: any) => ({
                    title: i.titleSnapshot,
                    price: Number(i.priceSnapshot || 0),
                    quantity: i.quantity
                }))
            }))
        };
    } catch (e) {
        console.error("Erro ao buscar OS validadas:", e);
        return { success: false, tickets: [] };
    }
}

// --- RELATÓRIO CONSOLIDADO DE PAGAMENTO ---

export async function getPaymentReportDataAction(month: number, year: number, companyId?: string) {
    try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const ticketsRaw = await prisma.ticket.findMany({
            where: {
                status: 'VALIDATED',
                updatedAt: { gte: startDate, lte: endDate }
            },
            orderBy: { type: 'asc' },
            include: {
                asset: { select: { name: true, patrimonyNumber: true } },
                sector: { select: { name: true } },
                items: {
                    select: { titleSnapshot: true, priceSnapshot: true, quantity: true, validationStatus: true }
                }
            }
        });

        const preventive = ticketsRaw.filter((t: any) => t.type === 'PREVENTIVE');
        const corrective = ticketsRaw.filter((t: any) => t.type === 'CORRECTIVE');

        const preventiveTotal = preventive.reduce((sum: number, t: any) => {
            const itemsTotal = (t.items || []).reduce((s: number, i: any) => s + Number(i.priceSnapshot || 0) * i.quantity, 0);
            return sum + itemsTotal;
        }, 0);

        const correctiveTotal = corrective.reduce((sum: number, t: any) => {
            return sum + (t.totalValue ? Number(t.totalValue) : 0);
        }, 0);

        const mapTicket = (t: any) => ({
            id: t.id,
            code: t.code,
            type: t.type === 'PREVENTIVE' ? 'preventive' : 'corrective',
            description: t.description,
            assetName: t.asset?.name,
            patrimonyNumber: t.asset?.patrimonyNumber,
            sectorName: t.sector?.name,
            closedAt: t.closedAt?.toISOString() || t.updatedAt.toISOString(),
            totalValue: t.totalValue ? Number(t.totalValue) : null,
            items: (t.items || []).map((i: any) => ({
                title: i.titleSnapshot,
                price: Number(i.priceSnapshot || 0),
                quantity: i.quantity,
                approved: i.validationStatus === 'APPROVED'
            }))
        });

        return {
            success: true,
            month,
            year,
            preventiveTickets: preventive.map(mapTicket),
            correctiveTickets: corrective.map(mapTicket),
            preventiveTotal,
            correctiveTotal,
            grandTotal: preventiveTotal + correctiveTotal
        };
    } catch (e) {
        console.error("Erro ao buscar dados do relatório:", e);
        return {
            success: false,
            month, year,
            preventiveTickets: [], correctiveTickets: [],
            preventiveTotal: 0, correctiveTotal: 0, grandTotal: 0
        };
    }
}
