
export type UserRole = 'admin' | 'technician' | 'server' | 'fiscal_contrato';

export type AssetStatus = 'ok' | 'maintenance' | 'stopped' | 'decommissioned' | 'paralyzed' | 'waiting_tech';

export interface CatalogItem {
  id: string;
  name: string; // "Capacitor 35uF"
  type: 'service' | 'part';
  estimatedCost: number;
  description?: string;
  isContracted: boolean;
}

export interface ProblemType {
  id: string;
  label: string; // e.g., "Ar não gela"
  description?: string;
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  technicians: TechnicianProfile[];
}

export interface TechnicianProfile {
  id: string;
  name: string;
  cpf: string;
  email?: string;
  isManager?: boolean;
}

export interface SectorResponsible {
  id: string; // New: Unique ID for history tracking
  name: string;
  siape: string;
  email: string;
  password?: string; // default 123456
  ordinanceNumber?: string;
  designationDate?: string; // ISO Date YYYY-MM-DD
  terminationDate?: string; // ISO Date YYYY-MM-DD
  isActive: boolean;
}

export interface Sector {
  id: string;
  name: string;
  block?: string;
  floor?: string;
  room?: string;
  responsible: SectorResponsible; // Currently active
  responsibleHistory: SectorResponsible[]; // Past responsibles
}

export interface Asset {
  id: string;
  patrimonyNumber: string;
  name: string;
  sectorId: string;
  acquisitionDate: string; // ISO Date
  status: AssetStatus;
  brand?: string;
  model?: string;
  notes?: string;

  // Refrigeration Details
  serialNumber?: string;
  category?: string;
  subType?: string;
  capacityBTU?: string;
  capacityLiters?: number;
  voltage?: string;
  gasType?: string;
  compressorType?: string;
  criticality?: string;
  power?: string;
  decommissionDate?: string; // Data de baixa quando equipamento ficar inservível

  // Maintenance Control
  lastMaintenance?: string; // ISO Date
  nextMaintenance?: string; // ISO Date
}

// ... existing types for Ticket/ServiceItem ...
// Adapting Ticket to match new requirements if needed

export interface PhotoEvidence {
  id: string;
  url: string;
  timestamp: number;
  type: 'before' | 'after' | 'plate' | 'inspection';
  description?: string;
}

export type ValidationStatus = 'pending' | 'knoch' | 'approved' | 'rejected';

export interface ServiceItem {
  id: string;
  catalogItemId?: string; // Link to catalog
  title: string;
  description: string;
  category: 'cleaning' | 'part_replacement' | 'gas_refill' | 'other';
  estimatedValue: number;

  technicianPhotos: PhotoEvidence[];
  technicianNotes?: string;

  validationStatus: ValidationStatus;
  serverPhotos: PhotoEvidence[];
  serverNotes?: string;
  validatedValue?: number;
  quantity: number;
}

export interface Quotation {
  id: string;
  ticketId: string;
  totalValue: number;
  fileUrl: string; // The PDF containing the 3 quotations
  approvedById?: string;
  approvedAt?: string;
}

export interface Contract {
  id: string;
  number: string;
  companyId: string;
  startDate: string;
  endDate: string;
  active: boolean;
  services: ContractService[];
}

export interface ContractService {
  id: string;
  contractId: string;
  description: string;
  priceMonthly?: number;
  priceQuarterly?: number;
  priceSemiAnnual?: number;
}

export interface Ticket {
  id: string;
  code?: number; // Short Integer ID for display
  assetId: string;
  sectorId: string;
  companyId?: string; // Who is servicing
  technicianId?: string;

  requesterName: string;
  description: string;
  type: 'corrective' | 'preventive';

  status:
  | 'open'
  | 'awaiting_quotation'
  | 'awaiting_approval'
  | 'authorized'
  | 'scheduled'
  | 'in_progress'
  | 'waiting_validation'
  | 'validated'
  | 'rejected'
  | 'completed';

  items: ServiceItem[];
  quotation?: Quotation;

  openedAt: number;
  scheduledAt?: number;
  updatedAt: number;
}

export interface Data {
  sectors: Sector[];
  assets: Asset[];
  tickets: Ticket[];
  companies: Company[];
  catalog: CatalogItem[];
  problemTypes: ProblemType[];
}
