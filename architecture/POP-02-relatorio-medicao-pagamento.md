# POP-02: Procedimento Operacional Padrão - Relatório Financeiro e Prestação de Contas (SIPAC)

**Protocolo:** V.L.A.E.G. - Camada 1 (Arquitetura)  
**Projeto:** Plataforma VOS / ValidAr (IFAM Campus Manaus Centro)  
**Revisão:** 2.1 (Gestão Financeira e Gráficos de Custos)

---

## 1. Objetivo
Padronizar a gestão financeira, o acompanhamento gráfico temporal de despesas e a emissão do Demonstrativo Financeiro Mensal de Serviços de Climatização para servir como peça probatória obrigatória de liquidação e atesto de pagamento no SIPAC do IFAM.

---

## 2. Princípio da Conformidade Pública e Gestão no IFAM
A fiscalização técnica de contratos do IFAM gerencia os custos e atesta a prestação de serviços com base em:
1. **Demonstrativo Financeiro do ValidAr:** Relação completa e discriminada de OSs com status `VALIDATED` no mês, com gráficos de evolução de gastos.
2. **Atesto Descentralizado:** Assinatura/carimbo eletrônico do Fiscal de Setor em cada ordem de serviço comprovada com fotos de "Antes" e "Depois".
3. **Cotações de Mercado da Empresa:** Anexo em PDF com as cotações de preços de terceiros providenciadas diretamente pelo prestador e juntadas aos autos do processo no SIPAC.

---

## 3. Regras de Composição de Valores

$$ \text{Total Consolidado Mensal} = \text{Total Preventivas (Ata/Pregão)} + \text{Total Corretivas (Valor Cobrado)} $$

### A. Serviços Preventivos (`type: PREVENTIVE`)
- Tarifados automaticamente pelos valores unitários contratados na Ata de Registro de Preços do Pregão:
  $$ \text{Total Preventivas} = \sum (\text{Preço do Serviço na Ata} \times \text{Quantidade}) $$

### B. Serviços Corretivos (`type: CORRECTIVE`)
- Composto pelo valor total registrado pelo prestador no sistema para cada OS validada pelo fiscal de setor:
  $$ \text{Total Corretivas} = \sum (\text{Valor Total Cobrado da OS Validada}) $$

---

## 4. Perfil e Responsabilidade do Fiscal de Contrato
- O Fiscal de Contrato acessa o sistema com permissão de visualização e auditoria administrativa global (`role: ADMIN` ou visualização unificada).
- Tem acesso irrestrito ao painel **Financeiro** (`PaymentReportManager`) para analisar gráficos temporais de despesas, filtrar por mês/ano, inspecionar cada OS e exportar o demonstrativo financeiro consolidado em PDF para instruir a nota de empenho e atesto fiscal no SIPAC.
