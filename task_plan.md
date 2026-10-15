# Plano de Tarefas (task_plan.md) - Protocolo V.L.A.E.G.

**Status Atual:** Concluído com sucesso (Revisão 2.0 - Integração SIPAC).  
**Meta da Sessão:** Simplificação das regras de negócio (cotações tripartite no SIPAC), inclusão do perfil do Fiscal de Contrato com visão administrativa global e disponibilização direta da aba de Medição Mensal no Painel Administrativo.

---

## Fases do Projeto

- [x] **Protocolo 0: Inicialização**
  - [x] Memória do projeto criada (`gemini.md`, `task_plan.md`, `findings.md`, `progress.md`).
  - [x] Diretórios criados (`architecture/`, `tools/`, `.tmp/`).

- [x] **Fase 1: V - Visão (e Lógica)**
  - [x] Regra de negócio atualizada: fim da aprovação tripartite no app (cotações anexadas pela empresa no SIPAC).
  - [x] Prestador lança o valor cobrado pela corretiva diretamente no sistema.
  - [x] Fiscal de Contrato com login próprio e visão administrativa global para atesto e fiscalização.

- [x] **Fase 2: L - Link (Conectividade)**
  - [x] Conexão com o banco Neon PostgreSQL (`neondb` v17.11) homologada.

- [x] **Fase 3: A - Arquitetura (Construção A.N.T.)**
  - [x] **Camada 1 (POPs):** Revisados `POP-01` e `POP-02` com o fluxo direto para o SIPAC.
  - [x] **Camada 2 (Navegação):**
    - [x] Incluída aba **Medição Mensal (SIPAC)** no `AdminDashboard.tsx`.
    - [x] Acesso concedido para `fiscal_contrato` e `admin` visualizarem todas as funções de gestão.
    - [x] Adicionado perfil `Fiscal Contrato` no seletor de papéis (`RoleSwitcher.tsx`).
  - [x] **Camada 3 (Ferramentas):** Simulação determinística de OSs preventivas e corretivas no Neon.

- [x] **Fase 4: E - Estilo (Refinamento UX e Relatórios)**
  - [x] Painel de medição ajustado para permitir acesso direto e emissão de espelho probatório para SIPAC.
  - [x] Totais mensais auditáveis: Preventivas (tabela da ata) + Corretivas (valor cobrado).

- [x] **Fase 5: G - Gatilho (Prontidão para Deploy)**
  - [x] Executado `npm run build` com sucesso (Exit Code 0, 9 rotas compiladas no Turbopack).
  - [x] Código validado para deploy na Vercel e sincronização com GitHub.
