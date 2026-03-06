$content = @"
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String // Hashed
  role          String // Enum: 'admin', 'server', 'technician' (Managed in App)
  
  // Specific Role Data (Flattened for SQLite simplicity instead of JSONB)
  siape         String?   // For Servers
  cpf           String?   // For Technicians
  
  // Relations
  responsibleFor Sector[] @relation("CurrentResponsible")
  sectorsHistory SectorResponsibleHistory[]
  
  companyId     String?
  company       Company?  @relation(fields: [companyId], references: [id])
  
  technicianTickets Ticket[] @relation("TechnicianAssigned")
  requestedTickets  Ticket[] @relation("TicketRequester")
  
  validations       ValidationHistory[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ------------------------------------------------------
// 2. Sectors (Physical Locations)
// ------------------------------------------------------
model Sector {
  id            String    @id @default(cuid())
  name          String
  
  responsibleId String?
  responsible   User?     @relation("CurrentResponsible", fields: [responsibleId], references: [id])
  
  // Current Access Context
  currentOrdinanceNumber String?
  active                 Boolean @default(true)
  
  history       SectorResponsibleHistory[]
  assets        Asset[]
  tickets       Ticket[]
}

model SectorResponsibleHistory {
  id              String   @id @default(cuid())
  sectorId        String
  sector          Sector   @relation(fields: [sectorId], references: [id])
  
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  
  ordinanceNumber String?
  designationDate DateTime?
  terminationDate DateTime?
  
  createdAt       DateTime @default(now())
}

// ------------------------------------------------------
// 3. Companies (Third Party)
// ------------------------------------------------------
model Company {
  id          String   @id @default(cuid())
  name        String
  cnpj        String   @unique
  active      Boolean  @default(true)
  
  technicians User[]
  tickets     Ticket[]
}

// ------------------------------------------------------
// 4. Assets (Inventory)
// ------------------------------------------------------
model Asset {
  id              String   @id @default(cuid())
  patrimonyNumber String   @unique // Tombamento
  name            String
  brand           String?
  model           String?
  acquisitionDate DateTime?
  
  sectorId        String
  sector          Sector   @relation(fields: [sectorId], references: [id])
  
  qrCode          String?  @unique
  status          String   @default("ok") // 'ok', 'broken'
  
  tickets         Ticket[]
}

// ------------------------------------------------------
// 5. Tickets (Service Orders)
// ------------------------------------------------------
model Ticket {
  id            String   @id @default(cuid())
  code          Int      @default(autoincrement()) // Human friendly ID
  
  assetId       String
  asset         Asset    @relation(fields: [assetId], references: [id])
  
  sectorId      String
  sector        Sector   @relation(fields: [sectorId], references: [id])
  
  requesterId   String
  requester     User     @relation("TicketRequester", fields: [requesterId], references: [id])
  
  technicianId  String?
  technician    User?    @relation("TechnicianAssigned", fields: [technicianId], references: [id])
  
  companyId     String?
  company       Company? @relation(fields: [companyId], references: [id])
  
  description   String
  status        String   @default("open") // 'open', 'scheduled', 'in_progress', 'waiting_validation', 'validated', 'rejected'
  
  openedAt      DateTime @default(now())
  closedAt      DateTime?
  updatedAt     DateTime @updatedAt

  items         ServiceItem[]
  validations   ValidationHistory[]
}

// ------------------------------------------------------
// 6. ServiceItems (Specific Tasks/Parts in a Ticket)
// ------------------------------------------------------
model ServiceItem {
  id              String   @id @default(cuid())
  ticketId        String
  ticket          Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  
  catalogItemId   String?
  catalogItem     CatalogItem? @relation(fields: [catalogItemId], references: [id])
  
  // Snapshots for Financial Integrity
  titleSnapshot   String
  priceSnapshot   Float    // Using Float for SQLite compatibility, would be Decimal in SQL
  
  technicianNotes String?
  
  validationStatus String @default("pending") // 'pending', 'approved', 'rejected'
  
  photos          PhotoEvidence[]
}

// ------------------------------------------------------
// 7. Evidence & Catalog
// ------------------------------------------------------
model PhotoEvidence {
  id            String   @id @default(cuid())
  serviceItemId String
  serviceItem   ServiceItem @relation(fields: [serviceItemId], references: [id], onDelete: Cascade)
  
  url           String
  type          String   // 'before', 'after', 'inspection'
  uploadedById  String?
  
  timestamp     DateTime @default(now())
}

model CatalogItem {
  id            String   @id @default(cuid())
  name          String
  type          String   // 'service', 'part'
  estimatedCost Float
  
  serviceItems  ServiceItem[]
}

// ------------------------------------------------------
// 8. Validation/Audit Logic
// ------------------------------------------------------
model ValidationHistory {
  id          String   @id @default(cuid())
  ticketId    String
  ticket      Ticket   @relation(fields: [ticketId], references: [id])
  
  validatorId String
  validator   User     @relation(fields: [validatorId], references: [id])
  
  action      String   // 'approved', 'rejected'
  reason      String?
  
  timestamp   DateTime @default(now())
}

model ProblemType { // Kept for UI helpers
  id          String @id @default(cuid())
  label       String
  description String?
}
"@

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("prisma\schema.prisma", $content, $utf8NoBom)
