# Descobertas Técnicas e Restrições (findings.md)

**Data de Início:** 2026-10-07  
**Projeto:** ValidAr (VOS)

---

## 1. Ambiente e Ferramentas
- **Sistema Operacional:** Windows com PowerShell.
- **Ambiente Antigravity:** Um hook residual quebrado (`datacloud_telemetry`) foi identificado e removido definitivamente do diretório de plugins do usuário (`C:\Users\otran\.gemini\config\plugins\googlecloudtools.datacloud_telemetry`).
- **Execução das ferramentas:** Ferramentas de terminal, leitura e escrita operando com 100% de estabilidade.

---

## 2. Codebase e Arquitetura do ValidAr
- **Frontend / Framework:** Next.js 16 (App Router) + React 19 + Tailwind CSS v4.
- **ORM / Persistência:** Prisma ORM 5.22 conectado a PostgreSQL (`DATABASE_URL`).
- **Autenticação:** NextAuth v5 (beta) com Credentials Provider e bcryptjs.
- **Componentes:** Baseados em Radix UI com customizações responsivas para desktop e mobile (`ResponsiveDialog`, `FormField`, etc.).
- **Estado:** Zustand (`useStore.ts`) consumindo dados sincronizados pelas Server Actions (`dashboard-data.ts` e `server-actions.ts`).

---

## 3. Restrições e Pontos Críticos do Domínio
- **Setor Público / Conformidade:** A plataforma atende ao IFAM - Campus Manaus Centro.
- **Fiscalização Tripartite:**
  - Fiscal de Setor é identificado por SIAPE e Portaria.
  - Orçamentos corretivos exigem 3 cotações em PDF antes de aprovação pelo Fiscal de Contrato.
  - Validação de execução exige fotos obrigatórias de "Antes" e "Depois".
- **Medição Mensal:** Totalização de preventivas (preço tabelado de pregão) + corretivas (lançadas após atesto).
