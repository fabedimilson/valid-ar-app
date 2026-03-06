# 🚀 Guia Rápido - Novos Componentes UX

**5 minutos para começar a usar os novos componentes**

---

## 1️⃣ Criar um formulário simples

```tsx
import { FormInputField, FormSection } from "@/components/admin/forms/FormField";

function MeuFormulario() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");

  return (
    <FormSection title="Dados Básicos" description="Preencha seus dados">
      <FormInputField
        id="nome"
        label="Nome Completo"
        value={nome}
        onChange={setNome}
        placeholder="Digite seu nome"
        required
      />
      
      <FormInputField
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        required
        helpText="Usaremos para contato"
      />
    </FormSection>
  );
}
```

---

## 2️⃣ Adicionar validação em tempo real

```tsx
import { useEffect, useState } from "react";
import { FormInputField } from "@/components/admin/forms/FormField";

function FormularioValidado() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [touched, setTouched] = useState(false);

  // Validação automática
  useEffect(() => {
    if (touched && email && !email.includes("@")) {
      setErro("Email inválido");
    } else {
      setErro("");
    }
  }, [email, touched]);

  return (
    <FormInputField
      id="email"
      label="Email"
      value={email}
      onChange={(val) => {
        setEmail(val);
        setTouched(true);
      }}
      error={erro}
      required
    />
  );
}
```

---

## 3️⃣ Criar um Dialog com formulário

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/admin/dialogs/ResponsiveDialog";
import { FormInputField } from "@/components/admin/forms/FormField";

function MeuComponente() {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");

  const handleSalvar = () => {
    console.log("Salvando:", nome);
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Abrir Dialog
      </Button>

      <ResponsiveDialog
        open={open}
        onOpenChange={setOpen}
        title="Novo Item"
        description="Preencha os dados abaixo"
        onSubmit={handleSalvar}
        submitLabel="Salvar"
      >
        <FormInputField
          id="nome"
          label="Nome"
          value={nome}
          onChange={setNome}
          required
        />
      </ResponsiveDialog>
    </>
  );
}
```

---

## 4️⃣ Usar o AssetForm completo

```tsx
import { AssetDialog } from "@/components/admin/dialogs/AssetDialog";
import { useState } from "react";

function GerenciarEquipamentos() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState(null);

  return (
    <>
      <button onClick={() => {
        setEquipamentoSelecionado(null);
        setDialogOpen(true);
      }}>
        Novo Equipamento
      </button>

      <AssetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        asset={equipamentoSelecionado}
        onSuccess={() => {
          // Atualizar lista, etc
          console.log("Equipamento salvo!");
        }}
      />
    </>
  );
}
```

---

## 5️⃣ Criar confirmação de exclusão

```tsx
import { ConfirmDialog } from "@/components/admin/dialogs/ResponsiveDialog";
import { useState } from "react";

function ListaComExclusao() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemId, setItemId] = useState<string | null>(null);

  const handleExcluir = () => {
    console.log("Excluindo:", itemId);
    setConfirmOpen(false);
  };

  return (
    <>
      <button onClick={() => {
        setItemId("123");
        setConfirmOpen(true);
      }}>
        Excluir Item
      </button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirmar exclusão?"
        description="Esta ação não pode ser desfeita. Deseja continuar?"
        variant="danger"
        onConfirm={handleExcluir}
        confirmLabel="Sim, excluir"
      />
    </>
  );
}
```

---

## 📋 Componentes Disponíveis

### **Formulários**
- `FormInputField` - Input com validação
- `FormSelectField` - Select com validação
- `FormSection` - Organizador de seções
- `AssetForm` - Formulário completo de equipamentos
- `SectorForm` - Formulário completo de setores

### **Dialogs**
- `ResponsiveDialog` - Dialog responsivo genérico
- `ConfirmDialog` - Dialog de confirmação
- `AssetDialog` - Dialog de equipamento (exemplo)

### **Formulário Técnico**
- `TechnicianItemForm` - Formulário de serviços (modernizado)

---

## 🎨 Props Principais

### **FormInputField**
```tsx
id: string              // ID único
label: string           // Label do campo
value: string | number  // Valor atual
onChange: (val) => void // Callback
type?: string           // text|email|number|date
placeholder?: string    // Placeholder
required?: boolean      // Campo obrigatório
error?: string          // Mensagem de erro
helpText?: string       // Texto de ajuda
disabled?: boolean      // Desabilitar
```

### **ResponsiveDialog**
```tsx
open: boolean                  // Aberto/fechado
onOpenChange: (open) => void   // Callback
title: string                  // Título
description?: string           // Descrição
onSubmit?: () => void          // Ao salvar
submitLabel?: string           // Label do botão
onCancel?: () => void          // Ao cancelar
isSubmitting?: boolean         // Loading
size?: "sm"|"md"|"lg"|"xl"    // Tamanho
```

---

## 💡 Dicas Rápidas

### ✅ **DO** (Faça)
```tsx
// Use componentes base para consistência
<FormInputField 
  label="Nome"
  required
  helpText="Nome completo"
/>

// Valide em tempo real
useEffect(() => {
  if (touched && !value) setError("Obrigatório");
}, [value, touched]);

// Use grid responsivo
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
```

### ❌ **DON'T** (Não faça)
```tsx
// Não use campos pequenos em mobile
<input style={{ height: 30 }} /> // ❌

// Não valide só no submit
<form onSubmit={validate}> // ❌

// Não ignore help text
<input /> // ❌ Sem dica para usuário
```

---

## 🐛 Troubleshooting

### Problema: "Zoom no iOS ao focar"
```tsx
// Use font-size 16px ou maior em mobile
className="text-base sm:text-sm"
```

### Problema: "Validação não aparece"
```tsx
// Passe erro apenas se campo foi tocado
error={touched ? errors.field : undefined}
```

### Problema: "Dialog cortado em mobile"
```tsx
// Use ResponsiveDialog ao invés de Dialog padrão
<ResponsiveDialog size="lg"> // Auto-ajusta
```

---

## 📚 Mais Informações

- **Documentação completa:** `src/components/admin/README.md`
- **Resumo de melhorias:** `MELHORIAS_UX.md`
- **Exemplos:** Ver arquivos `*Form.tsx` e `*Dialog.tsx`

---

**Dúvidas?** Consulte a documentação completa ou os exemplos de código! 🚀
