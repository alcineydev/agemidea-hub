# Step-by-step — Prompt 09 (Redesign Configurações + Logo Dinâmica)

## Objetivo

Refatorar a UX da página `/painel/configuracoes` com estrutura fixa (topbar/tabs) e conteúdo scrollável, ajustar cards de identidade visual/empresa e aplicar logo dinâmica na sidebar e no login.

## Avanços e alterações

### Etapa 1 — Estrutura de layout da página de configurações
- Arquivo: `src/app/(painel)/painel/configuracoes/ConfiguracoesClient.tsx`
- Alteração:
  - container em coluna com altura controlada e `overflow-hidden`;
  - topbar fixa no fluxo (fora da área scrollável);
  - tabs fixas no fluxo (fora da área scrollável);
  - conteúdo principal em `flex-1 overflow-y-auto`.
- Função/Utilidade:
  - eliminar transbordo e separar claramente área fixa de navegação e área de leitura/edição.

### Etapa 2 — Tabs e blocos visuais
- Arquivos:
  - `src/app/(painel)/painel/configuracoes/components/SettingsTabs.tsx`
  - `src/app/(painel)/painel/configuracoes/components/VisualIdentityTab.tsx`
- Alteração:
  - tabs sem sticky interno redundante;
  - cards com base visual padronizada (`bg-[#111827] border-[#1e3a5f] rounded-xl`).
- Função/Utilidade:
  - manter consistência visual e evitar conflito de múltiplos elementos sticky.

### Etapa 3 — Redesign do favicon
- Arquivo: `src/app/(painel)/painel/configuracoes/components/FaviconUpload.tsx`
- Alteração:
  - layout horizontal compacto (preview + specs + botões);
  - refinamento de tipografia e responsividade no mobile;
  - botão principal padronizado (`Escolher Favicon`).
- Função/Utilidade:
  - tornar o card legível, proporcional e sem artefatos do layout anterior.

### Etapa 4 — Redesign da logo (imagem/texto)
- Arquivos:
  - `src/app/(painel)/painel/configuracoes/components/LogoEditor.tsx`
  - `src/app/(painel)/painel/configuracoes/components/LogoImageMode.tsx`
  - `src/app/(painel)/painel/configuracoes/components/LogoTextMode.tsx`
- Alteração:
  - modo imagem com preview fixo `220px`, aspecto `10/3` e theme switcher abaixo;
  - specs e ações à direita em layout horizontal;
  - copy field da URL usando domínio via `toAbsoluteMediaUrl`;
  - modo texto em estrutura horizontal com preview + grid de configurações.
- Função/Utilidade:
  - garantir proporção correta da logo e controles claros em desktop/mobile.

### Etapa 5 — Redesign da aba de empresa
- Arquivos:
  - `src/app/(painel)/painel/configuracoes/components/CompanyInfoTab.tsx`
  - `src/app/(painel)/painel/configuracoes/components/BusinessHours.tsx`
  - `src/app/(painel)/painel/configuracoes/components/SocialLinks.tsx`
- Alteração:
  - cards reforçados por seção;
  - inputs/labels ajustados para o design token definido;
  - horários com rows em `bg-[#1a2236]` e toggle mais visível;
  - redes sociais em grid responsivo.
- Função/Utilidade:
  - melhorar escaneabilidade e reduzir sensação de formulário “longo e quebrado”.

### Etapa 6 — Logo dinâmica no painel e login
- Arquivos:
  - `src/components/layout/DynamicLogo.tsx` (novo)
  - `src/components/layout/PainelSidebar.tsx`
  - `src/app/(public)/login/page.tsx`
- Alteração:
  - componente client para carregar logo/config de texto via `site_settings`;
  - render de imagem quando `logo_type=image`, fallback textual quando não houver;
  - integração no cabeçalho da sidebar e branding da tela de login.
- Função/Utilidade:
  - refletir automaticamente mudanças de identidade visual em múltiplos pontos do produto.

## Arquivos e responsabilidades

- `ConfiguracoesClient.tsx`: layout macro (fixo vs scroll).
- `SettingsTabs.tsx`: navegação de abas sem sobreposição de sticky.
- `FaviconUpload.tsx`: card compacto de favicon com UX responsiva.
- `LogoImageMode.tsx` / `LogoTextMode.tsx`: edição visual da logo com preview proporcional.
- `CompanyInfoTab.tsx`, `BusinessHours.tsx`, `SocialLinks.tsx`: estrutura de formulário empresarial em seções.
- `DynamicLogo.tsx`: carregamento e renderização dinâmica da marca.
- `PainelSidebar.tsx` e `login/page.tsx`: consumo da logo dinâmica.

## Validação planejada

- `npm run build` para validar tipagem e composição final.
- validação manual da página `/painel/configuracoes` em desktop e mobile.
- validação manual de sidebar/login para logo imagem e logo texto.
