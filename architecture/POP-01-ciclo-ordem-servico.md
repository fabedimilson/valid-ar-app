# POP-01: Procedimento Operacional Padrão - Ciclo de Vida da Ordem de Serviço (OS)

**Protocolo:** V.L.A.E.G. - Camada 1 (Arquitetura)  
**Projeto:** Plataforma VOS / ValidAr (IFAM Campus Manaus Centro)  
**Revisão:** 2.0 (Integração Direta com Processo SIPAC)

---

## 1. Objetivo
Padronizar de ponta a ponta as transições de estado, responsabilidades, registro do valor cobrado pela empresa e comprovação fotográfica (Antes/Depois) para ordens de serviço corretivas e preventivas.

---

## 2. Atores Envolvidos
- **Solicitante / Fiscal de Setor (`SERVER`):** Servidor titular do setor físico (SIAPE + Portaria). Inspeciona o serviço executado no local.
- **Fiscal de Contrato (`FISCAL_CONTRATO` / `ADMIN`):** Acesso administrativo global. Analisa relatórios para atesto do processo de pagamento no SIPAC.
- **Técnico Operacional (`TECHNICIAN`):** Executante do reparo/manutenção. Realiza os uploads fotográficos de Antes e Depois.
- **Técnico Líder / Preposto (`TECHNICIAN` com `isManager: true`):** Registra o valor cobrado pela corretiva no sistema.

---

## 3. Fluxo de Estados Determinístico

```
[1. ABERTURA]
  - Corretiva: Fiscal de Setor ou Admin abre chamado -> Status: OPEN
  - Preventiva: Gestor agenda data periódica de rotina -> Status: SCHEDULED

[2. ATENDIMENTO TÉCNICO]
  - Técnico assume a OS -> Transição para: IN_PROGRESS
  - Registro de Serviços/Peças: Lançamento de itens executados (`ServiceItem`)
  - Evidências Obrigatórias:
    * Foto tipo BEFORE (Antes do reparo/limpeza)
    * Foto tipo AFTER (Depois do reparo/limpeza)
    * Foto INSPECTION (Plaqueta de identificação / QR Code)
  - Registro do Valor Cobrado: Em OS corretiva, o prestador/líder registra o valor total cobrado pela manutenção.

[3. SUBMISSÃO PARA FISCALIZAÇÃO]
  - Técnico conclui -> Transição para: WAITING_VALIDATION

[4. AUDITORIA E VALIDAÇÃO LOCAL (FISCAL DE SETOR)]
  - Fiscal do setor analisa as fotos e o funcionamento do equipamento em `/server/validate/[id]`
  - SE APROVADO:
    * Transição para: VALIDATED
    * Criação de registro em `validations` com carimbo de SIAPE, data e hora.
  - SE REJEITADO:
    * Transição de volta para: IN_PROGRESS
    * Justificativa textual obrigatória gravada em auditoria para o técnico corrigir.

[5. DISPONIBILIZAÇÃO PARA MEDIÇÃO E SIPAC]
  - Assim que validada, a OS entra automaticamente no cálculo do Relatório de Medição Mensal.
  - O Fiscal de Contrato extrai o espelho consolidado no ValidAr e junta com as 3 cotações apresentadas pela empresa para tramitação do pagamento no SIPAC.
```

---

## 4. Invariantes e Casos de Borda
1. **Sem foto de antes/depois, sem validação:** Nenhuma OS pode ser aprovada sem conferência de evidências visuais.
2. **Rejeição com justificativa obrigatória:** Ação `REJECTED` sem motivo (`reason`) é terminantemente bloqueada.
3. **Auditoria:** Todo atesto, alteração de valor ou cancelamento grava carimbo imutável com `userId` e data/hora.
