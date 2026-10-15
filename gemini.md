# Constituição do Projeto: ValidAr / VOS

**Protocolo:** V.L.A.E.G. + Arquitetura A.N.T.  
**Projeto:** Plataforma VOS (Validação de Ordens de Serviço de Refrigeração e Climatização)  
**Instituição:** IFAM - Campus Manaus Centro (Departamento de Manutenção e Infraestrutura)  
**Repositório:** `https://github.com/fabedimilson/valid-ar-app`  
**Deploy Produção:** Vercel (`https://vercel.com/edimilsons-projects-b28b7c84/valid-ar-app`)  
**Banco de Dados Primário:** PostgreSQL Neon Serverless (`neondb`)

---

## 1. Princípios Operacionais Invariantes

1. **Determinismo sobre Probabilidade:** Toda lógica de negócio, transições de status e regras financeiras são determinísticas.
2. **Regra dos Dados Primeiro:** Schemas em Prisma e interfaces em TypeScript governam as ações e componentes.
3. **Comprovação e Conformidade Pública:** A administração pública só liquida e atesta serviços devidamente comprovados com evidências de "Antes" e "Depois", atesto formal do Fiscal de Setor e itens com valores de ata de registro de preços / pregão.
4. **Regra de Ouro da Arquitetura:** Mudanças de lógica exigem atualização prévia do Procedimento Operacional Padrão (`architecture/`) antes do código.
5. **Integração Externa com SIPAC:** O ValidAr atua como sistema de campo para controle operacional, registro fotográfico e geração de demonstrativo financeiro. A tramitação de processos e anexação das 3 cotações de mercado da empresa ocorrem formalmente no SIPAC do IFAM.

---

## 2. Escopo Operacional e Entregáveis

- **Equipamentos e Inventário:** Cadastro e gestão de aparelhos de climatização (Split, AC de Janela, VRF, Chiller, Bebeouro/Refrigerador) com atributos técnicos (BTUs, tipo de gás, voltagem, criticidade).
- **Reparos (OS Corretiva):** Abertura pelo solicitante -> Execução pelo técnico com upload de evidências (Antes/Depois) e registro do valor cobrado -> Validação/atesto pelo Fiscal de Setor.
- **Controle de Manutenção Preventiva:** Agendamento periódico de rotina, acompanhamento em calendário/agenda e baixa com atesto técnico e valores fixados na ata de registro de preços.
- **Painel Financeiro e Fiscalização Mensal:** Consolidação mensal (`Preventiva + Corretiva`) com gráficos de custos e espelho financeiro de pagamento para instruir o processo de empenho e liquidação no SIPAC.

---

## 3. Esquemas de Dados e Relações

### A. Perfis de Usuário (RBAC) e Rastreabilidade
- `ADMIN` & `FISCAL_CONTRATO`: Acesso administrativo global (todos os setores, equipamentos, OSs, relatórios e auditoria). O Fiscal de Contrato possui login próprio com privilégios administrativos para fiscalização e extração de dados para o SIPAC.
- `SERVER`: Fiscal de Setor (SIAPE, Portaria, Atesto no local).
- `TECHNICIAN`: Técnico operacional terceirizado (Execução e fotos). Líder (`isManager: true`) registra valores cobrados das corretivas.
- **Logs de Auditoria:** Toda ação relevante (criação, edição, validação, alteração de valor) grava carimbo imutável com `userId`, `action` e `timestamp`.

### B. Ciclo de Vida da Ordem de Serviço Simplificado
```
OPEN (Corretiva) / SCHEDULED (Preventiva) -> IN_PROGRESS -> WAITING_VALIDATION -> VALIDATED (ou REJECTED)
```
*(Nota: A antiga etapa de aprovação de cotação tripartite no app foi transferida para anexação direta da empresa no processo de pagamento no SIPAC).*

---

## 4. Limites Operacionais & "O que NÃO fazer"

- **NUNCA** permitir validação de OS sem conferência de evidências de fotos de antes e depois.
- **NUNCA** permitir rejeição de serviço sem justificativa textual detalhada.
- **NUNCA** apagar dados de produção do Neon sem backup/verificação prévia.
- **NUNCA** gravar arquivos intermediários fora de `.tmp/`.
