# 📋 Sistema de Formulários - ValidAr/VAR

Documentação dos componentes de formulário modernizados com foco em UX mobile-first.

## 🎯 Objetivo

Criar uma experiência consistente, acessível e agradável em todos os formulários da plataforma, tanto em dispositivos móveis quanto desktop.

## 📁 Estrutura de Componentes

```
src/components/
├── TechnicianItemForm.tsx (✅ Modernizado - 4 steps com validação)
└── admin/
    ├── forms/
    │   ├── FormField.tsx (✅ Componentes base reutilizáveis)
    │   └── AssetForm.tsx (✅ Formulário completo de equipamentos)
    ├── dialogs/
    │   ├── ResponsiveDialog.tsx (✅ Dialog responsivo base)
    │   └── AssetDialog.tsx (✅ Exemplo de integração)
    └── AdminForms.tsx (⚠️ A refatorar - 1209 linhas)
```

## ✅ Componentes Implementados

### 1. **TechnicianItemForm** (Modernizado)

Formulário usado por técnicos no campo para adicionar serviços/peças.

**Melhorias implementadas:**
- ✅ Sistema de 4 steps visuais (Tipo → Item → Fotos → Revisar)
- ✅ Validação em tempo real com feedback de erros
- ✅ Upload de fotos otimizado com loading states
- ✅ Preview de imagens antes de enviar
- ✅ Buttons touch-friendly (min 48px altura em mobile)
- ✅ Animações suaves entre steps
- ✅ Card de revisão final antes de submeter
- ✅ Mensagens de sucesso/erro com toast
- ✅ Capture de câmera nativa em mobile (`capture="environment"`)

**Como usar:**
```tsx
import { TechnicianItemForm } from "@/components/TechnicianItemForm";

<TechnicianItemForm 
  onAdd={(item) => {
    // Handle item addition
  }} 
/>
```

---

### 2. **FormField Components** (Novo)

Componentes base reutilizáveis para todos os formulários.

#### **FormInputField**
Campo de input com validação, labels, help text e erros.

```tsx
import { FormInputField } from "@/components/admin/forms/FormField";

<FormInputField
  id="patrimonyNumber"
  label="Número do Patrimônio"
  value={value}
  onChange={(val) => setValue(val)}
  placeholder="Ex: 123456"
  required
  error={errors.patrimonyNumber}
  helpText="Número único de identificação"
/>
```

**Props:**
- `label` (string): Label do campo
- `id` (string): ID único
- `type` (string): text | email | number | date
- `value` (string | number): Valor atual
- `onChange` (function): Callback de mudança
- `placeholder` (string): Placeholder
- `error` (string): Mensagem de erro
- `required` (boolean): Campo obrigatório
- `helpText` (string): Texto de ajuda
- `disabled` (boolean): Desabilitar campo

#### **FormSelectField**
Campo de seleção com validação.

```tsx
import { FormSelectField } from "@/components/admin/forms/FormField";

<FormSelectField
  id="sectorId"
  label="Setor"
  value={sectorId}
  onChange={(val) => setSectorId(val)}
  options={[
    { value: "1", label: "Setor A" },
    { value: "2", label: "Setor B" }
  ]}
  required
  error={errors.sectorId}
/>
```

#### **FormSection**
Organizador visual de seções em formulários.

```tsx
import { FormSection } from "@/components/admin/forms/FormField";

<FormSection 
  title="Informações Básicas"
  description="Dados principais do equipamento"
>
  {/* Campos do formulário */}
</FormSection>
```

---

### 3. **ResponsiveDialog** (Novo)

Dialog otimizado para mobile e desktop.

**Recursos:**
- ✅ Full-screen em mobile, modal em desktop
- ✅ Header e footer sticky com scroll no conteúdo
- ✅ Loading states automáticos
- ✅ Tamanhos customizáveis (sm, md, lg, xl, full)
- ✅ Acessibilidade (ARIA, keyboard navigation)
- ✅ Animações suaves

```tsx
import { ResponsiveDialog } from "@/components/admin/dialogs/ResponsiveDialog";

<ResponsiveDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Novo Equipamento"
  description="Preencha os dados do equipamento"
  size="lg"
  isSubmitting={loading}
  onSubmit={handleSubmit}
  submitLabel="Salvar"
  onCancel={handleCancel}
>
  {/* Conteúdo do dialog */}
</ResponsiveDialog>
```

#### **ConfirmDialog** (Variante)
Dialog simplificado para confirmações.

```tsx
import { ConfirmDialog } from "@/components/admin/dialogs/ResponsiveDialog";

<ConfirmDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Confirmar exclusão?"
  description="Esta ação não pode ser desfeita."
  variant="danger" // danger | warning | info
  onConfirm={handleDelete}
  confirmLabel="Excluir"
/>
```

---

### 4. **AssetForm** (Novo)

Formulário completo para cadastro/edição de equipamentos.

**Recursos:**
- ✅ Validação em tempo real
- ✅ Campos condicionais (ex: BTU só para ar-condicionado)
- ✅ Organizado em seções lógicas
- ✅ Help text contextual
- ✅ Grid responsivo (1 col mobile, 2 cols desktop)
- ✅ Feedback visual de erros
- ✅ Suporte para criação e edição

```tsx
import { AssetForm } from "@/components/admin/forms/AssetForm";

<AssetForm
  asset={existingAsset} // null para novo
  onSave={(assetData) => {
    // Handle save
  }}
  isEditing={!!existingAsset}
/>
```

---

### 5. **AssetDialog** (Exemplo de integração)

Exemplo de como combinar ResponsiveDialog + AssetForm.

```tsx
import { AssetDialog } from "@/components/admin/dialogs/AssetDialog";

<AssetDialog
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  asset={selectedAsset}
  onSuccess={() => {
    // Refresh list, etc
  }}
/>
```

---

## 🎨 Design System

### **Cores**
- **Primary**: Emerald (#10b981) - Ações principais
- **Secondary**: Blue (#3b82f6) - Informações
- **Danger**: Red (#ef4444) - Ações destrutivas
- **Warning**: Amber (#f59e0b) - Avisos
- **Neutral**: Gray - Textos e bordas

### **Espaçamento Mobile-First**
```css
/* Mobile */
- Campo altura: 48px (touch-friendly)
- Font size: 16px (previne zoom iOS)
- Spacing: 16px entre campos

/* Desktop (sm:) */
- Campo altura: 40-44px
- Font size: 14px
- Spacing: 12px entre campos
```

### **Tipografia**
- Labels: `text-xs font-bold uppercase text-neutral-500`
- Inputs: `text-sm`
- Errors: `text-xs text-red-600`
- Help text: `text-xs text-neutral-400`

---

## 📱 Responsividade

### **Breakpoints Tailwind**
```
sm: 640px   (Tablet pequeno)
md: 768px   (Tablet)
lg: 1024px  (Desktop)
xl: 1280px  (Desktop grande)
```

### **Padrões de Grid**
```tsx
// Mobile: 1 coluna, Desktop: 2 colunas
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

// Mobile: Stack vertical, Desktop: Horizontal
<div className="flex flex-col sm:flex-row gap-3">
```

---

## ♿ Acessibilidade

Todos os componentes seguem as melhores práticas:

- ✅ Labels associados com `htmlFor`
- ✅ ARIA attributes (`aria-describedby`, `aria-invalid`)
- ✅ Keyboard navigation
- ✅ Focus states visíveis
- ✅ Mensagens de erro anunciadas
- ✅ Contraste de cores adequado (WCAG AA)

---

## 🚀 Próximos Passos

### **Fase 2: Refatoração Completa**

1. **Criar formulários adicionais:**
   - [ ] SectorForm.tsx
   - [ ] CompanyForm.tsx
   - [ ] TechnicianForm.tsx
   - [ ] CatalogForm.tsx

2. **Refatorar AdminForms.tsx:**
   - [ ] Quebrar em componentes menores
   - [ ] Usar novos componentes base
   - [ ] Adicionar validação consistente
   - [ ] Melhorar responsividade

3. **Melhorias no Banco de Dados:**
   - [ ] Adicionar campos ausentes (floor, building, coordinates)
   - [ ] Implementar histórico de alterações
   - [ ] Adicionar metadata para rastreabilidade

4. **Polimento:**
   - [ ] Adicionar testes
   - [ ] Documentar casos de uso
   - [ ] Criar Storybook
   - [ ] Otimizar performance

---

## 📖 Exemplos de Uso

### **Exemplo 1: Dialog com Formulário Simples**

```tsx
import { useState } from "react";
import { ResponsiveDialog } from "@/components/admin/dialogs/ResponsiveDialog";
import { FormInputField } from "@/components/admin/forms/FormField";

function MyComponent() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>
      
      <ResponsiveDialog
        open={open}
        onOpenChange={setOpen}
        title="Novo Item"
        onSubmit={() => console.log(name)}
      >
        <FormInputField
          id="name"
          label="Nome"
          value={name}
          onChange={setName}
          required
        />
      </ResponsiveDialog>
    </>
  );
}
```

### **Exemplo 2: Formulário com Validação**

```tsx
import { useState, useEffect } from "react";
import { FormInputField } from "@/components/admin/forms/FormField";

function ValidatedForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (email && !email.includes("@")) {
      setError("Email inválido");
    } else {
      setError("");
    }
  }, [email]);

  return (
    <FormInputField
      id="email"
      label="Email"
      type="email"
      value={email}
      onChange={setEmail}
      error={error}
      required
    />
  );
}
```

---

## 🐛 Troubleshooting

### **Problema: Zoom no iOS ao focar input**
**Solução:** Use `font-size: 16px` ou maior em inputs mobile.

```tsx
className="text-base sm:text-sm" // 16px em mobile, 14px em desktop
```

### **Problema: Dialog não abre em mobile**
**Solução:** Verifique se o Dialog está dentro de um elemento com `position: fixed`.

### **Problema: Validação não funciona**
**Solução:** Certifique-se de passar o erro quando o campo foi "touched":

```tsx
error={touched.fieldName ? errors.fieldName : undefined}
```

---

## 📝 Convenções de Código

1. **Nomenclatura:**
   - Componentes: PascalCase (`AssetForm`)
   - Props: camelCase (`onOpenChange`)
   - Arquivos: PascalCase (`AssetForm.tsx`)

2. **Organização:**
   - 1 componente principal por arquivo
   - Helpers/types no mesmo arquivo se pequenos
   - Extrair em arquivo separado se > 50 linhas

3. **Comentários:**
   - JSDoc para componentes exportados
   - Comentários inline para lógica complexa
   - Examples em comentários quando útil

---

## 🤝 Contribuindo

Ao criar novos componentes de formulário:

1. Use os componentes base (`FormInputField`, `FormSelectField`)
2. Siga o padrão mobile-first
3. Adicione validação em tempo real
4. Inclua help text quando apropriado
5. Teste em mobile e desktop
6. Documente no README

---

**Última atualização:** 2026-02-08  
**Autor:** Sistema de melhorias UX ValidAr/VAR
