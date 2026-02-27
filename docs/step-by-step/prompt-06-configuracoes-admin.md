# Step-by-step — Prompt 06 (Configurações do Painel Admin)

## Objetivo

Implementar a página `/painel/configuracoes` com abas de **Identidade Visual** e **Informações da Empresa**, persistindo em `site_settings` (Supabase) e usando Storage no bucket `site-assets` para favicon/logo.

## Avanços e alterações

### Etapa 1 — Base de dados e tipagem
- Arquivo: `src/app/(painel)/painel/configuracoes/types.ts`
- Alteração:
  - criação de tipos para settings, horários, tema de preview e modo da logo;
  - criação de `DEFAULT_BUSINESS_HOURS`.
- Função/Utilidade:
  - padronizar estrutura de dados da tela e simplificar parse/stringify de horários.

### Etapa 2 — Server Actions de configurações
- Arquivo: `src/app/(painel)/painel/configuracoes/actions.ts`
- Alteração:
  - `getSettings()` para leitura chave/valor da `site_settings`;
  - `saveSettings()` para atualização em lote;
  - `uploadSiteImage()` para upload de favicon/logo no bucket `site-assets` com remoção do anterior;
  - `removeSiteImage()` para limpeza de assets por pasta.
- Função/Utilidade:
  - centralizar toda regra de persistência do módulo (DB + Storage) no servidor.

### Etapa 3 — Entrada da rota e cliente principal
- Arquivos:
  - `src/app/(painel)/painel/configuracoes/page.tsx`
  - `src/app/(painel)/painel/configuracoes/ConfiguracoesClient.tsx`
- Alteração:
  - `page.tsx` server-side carregando settings iniciais;
  - client principal com `useTransition` para salvar sem bloquear UI;
  - leitura de `?tab=visual|empresa` para estado inicial da aba;
  - topbar com breadcrumb e CTA de salvar.
- Função/Utilidade:
  - estruturar fluxo completo de edição/salvamento em tela única full-width.

### Etapa 4 — Componentes de Identidade Visual
- Arquivos:
  - `components/SettingsTabs.tsx`
  - `components/VisualIdentityTab.tsx`
  - `components/FaviconUpload.tsx`
  - `components/LogoEditor.tsx`
  - `components/LogoImageMode.tsx`
  - `components/LogoTextMode.tsx`
  - `components/ThemeSwitcher.tsx`
  - `components/ImageUpload.tsx`
  - `components/CopyField.tsx`
- Alteração:
  - upload/remoção de favicon com preview;
  - logo com toggle Imagem/Texto;
  - modo imagem com preview dark/light, upload e campos copiáveis (URL/ID);
  - modo texto com preview ao vivo e controles de fonte, peso, cor, tamanho e espaçamento.
- Função/Utilidade:
  - permitir gestão visual da marca sem alterar código-fonte.

### Etapa 5 — Componentes de Informações da Empresa
- Arquivos:
  - `components/CompanyInfoTab.tsx`
  - `components/BusinessHours.tsx`
  - `components/SocialLinks.tsx`
- Alteração:
  - cards para dados da empresa, endereço, contato, horários e redes sociais;
  - editor de horários por dia com toggle ativo/inativo;
  - `hours` persistido em JSON string.
- Função/Utilidade:
  - consolidar dados institucionais para uso dinâmico em header, rodapé e páginas públicas.

### Etapa 6 — Submenu de Configurações na sidebar
- Arquivo: `src/components/layout/PainelSidebar.tsx`
- Alteração:
  - item Configurações convertido para botão com flyout;
  - novos subitens:
    - `Identidade Visual` → `/painel/configuracoes?tab=visual`
    - `Informações` → `/painel/configuracoes?tab=empresa`
  - fechamento do flyout ao clicar fora.
- Função/Utilidade:
  - melhorar navegação direta para cada seção da página de configurações.

## Validação executada
- `npm run build` executado com sucesso após implementação.
- `ReadLints` dos arquivos alterados sem erros.

## Observações de manutenção
- A aba de empresa foi dividida em componentes (`BusinessHours`, `SocialLinks`) para reduzir acoplamento e facilitar evolução.
- Como próximo passo, vale adicionar validação de formato (telefone, e-mail, URL) antes do `saveSettings` para evitar dados inconsistentes.

### Etapa 7 — Validações de input + robustez de uploads/copy
- Arquivos:
  - `src/app/(painel)/painel/configuracoes/utils/masks.ts`
  - `src/app/(painel)/painel/configuracoes/utils/validation.ts`
  - `src/app/(painel)/painel/configuracoes/ConfiguracoesClient.tsx`
  - `src/app/(painel)/painel/configuracoes/components/CompanyInfoTab.tsx`
  - `src/app/(painel)/painel/configuracoes/components/FaviconUpload.tsx`
  - `src/app/(painel)/painel/configuracoes/components/LogoImageMode.tsx`
  - `src/app/(painel)/painel/configuracoes/components/LogoTextMode.tsx`
  - `src/app/(painel)/painel/configuracoes/components/CopyField.tsx`
- Alteração:
  - criação de máscaras de CNPJ, telefone e CEP;
  - criação de validações de e-mail, URL, CNPJ, telefone e CEP com lista de erros por campo;
  - bloqueio de salvamento quando houver erro e rolagem para o primeiro campo inválido;
  - exibição de erros inline e limpeza automática do erro ao editar o campo;
  - validação de tipo/tamanho no upload de favicon (2MB) e logo (5MB), com loading visual;
  - fallback de cópia no `CopyField` para compatibilidade com browsers;
  - preview de logo texto ajustado para dark/light com contraste melhor.
- Função/Utilidade:
  - aumentar confiabilidade dos dados salvos e garantir UX consistente no fluxo de identidade visual.
