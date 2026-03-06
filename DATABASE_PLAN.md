# Planejamento do Banco de Dados SQL (VOS)

Este documento detalha a estrutura proposta para o banco de dados Relacional (PostgreSQL) da plataforma VOS. A migração para SQL permitirá maior integridade de dados, relacionamentos complexos e escalabilidade.

## Diagrama de Entidade-Relacionamento (Conceitual)

O fluxo principal gira em torno da **Ordem de Serviço (Ticket)**, que conecta um **Equipamento (Asset)** a um **Técnico** e requer **Evidência** para ser **Validada** por um **Fiscal (Server)**.

### Modelos propostos

#### 1. Users (Usuários)
Centraliza o acesso.
- `id`: UUID (PK)
- `name`: Verchar
- `email`: Varchar (Unique)
- `password_hash`: Varchar
- `role`: Enum (`admin`, `server`, `technician`)
- `metadata`: JSONB (Para guardar SIAPE, CPF, Telefone de forma flexível)
- `created_at`: Timestamp

#### 2. Sectors (Setores)
Locais físicos (Salas, Prédios).
- `id`: UUID (PK)
- `name`: Varchar
- `responsible_id`: UUID (FK -> Users) *O fiscal atual*
- `ordinance_number`: Varchar (Portaria)
- `active`: Boolean

#### 3. Assets (Equipamentos)
O inventário a ser mantido.
- `id`: UUID (PK)
- `sector_id`: UUID (FK -> Sectors)
- `patrimony_number`: Varchar (Unique, Indexed)
- `name`: Varchar
- `brand`: Varchar
- `model`: Varchar
- `acquisition_date`: Date
- `qr_code`: Varchar (Unique)

#### 4. Companies (Empresas)
Terceirizadas que prestam serviço.
- `id`: UUID (PK)
- `name`: Varchar
- `cnpj`: Varchar (Unique)
- `active`: Boolean

#### 5. Technicians (Técnicos)
Vinculados a uma empresa.
- `id`: UUID (PK)
- `user_id`: UUID (FK -> Users)
- `company_id`: UUID (FK -> Companies)

#### 6. Tickets (Ordens de Serviço)
O coração do sistema.
- `id`: UUID (PK)
- `code`: Serial/Sequence (Ex: OS-2024-001) para fácil leitura
- `asset_id`: UUID (FK -> Assets)
- `requester_id`: UUID (FK -> Users) *Quem abriu*
- `technician_id`: UUID (FK -> Technicians, Nullable)
- `description`: Text
- `status`: Enum (`open`, `scheduled`, `in_progress`, `waiting_validation`, `validated`, `rejected`, `cancelled`)
- `opened_at`: Timestamp
- `closed_at`: Timestamp

#### 7. ServiceItems (Itens da OS)
Serviços ou peças específicas dentro de uma OS.
- `id`: UUID (PK)
- `ticket_id`: UUID (FK -> Tickets)
- `catalog_refernece_id`: UUID (FK -> Catalog)
- `title_snapshot`: Varchar *Cópia do nome do serviço no momento*
- `price_snapshot`: Decimal *Cópia do valor no momento*
- `technician_notes`: Text
- `validation_status`: Enum (`pending`, `approved`, `rejected`)

#### 8. EvidenceLinks (Evidências)
Fotos que comprovam o serviço.
- `id`: UUID (PK)
- `service_item_id`: UUID (FK -> ServiceItems)
- `url`: Varchar (URL do bucket S3/R2)
- `type`: Enum (`before`, `after`, `inspection`)
- `uploaded_by`: UUID (FK -> Users)
- `created_at`: Timestamp

#### 9. Validations (Histórico de Validação)
Auditoria de quem aprovou/rejeitou o quê.
- `id`: UUID (PK)
- `ticket_id`: UUID (FK -> Tickets)
- `validator_id`: UUID (FK -> Users)
- `action`: Enum (`approved`, `rejected`)
- `reason`: Text (Obrigatório se rejeitado)
- `timestamp`: Timestamp

## Próximos Passos para Implementação

1.  **Container Docker**: Subir uma instância PostgreSQL localmente via docker-compose.
2.  **Atualizar Prisma**: Reescrever o `schema.prisma` com os novos modelos e mudar o provider para `postgresql`.
3.  **Refatorar Actions**: Adaptar as Server Actions para lidar com os novos relacionamentos e tipos de dados.
