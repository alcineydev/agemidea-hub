# Step-by-step — Prompt 04 (Módulo de Modelos CMS)

## Objetivo

Implementar o módulo de modelos reutilizáveis (Header, Footer, Popup e Card) com CRUD administrativo, editor com Monaco + preview, regras de visibilidade por página e injeção automática nas rotas públicas.

## Avanços e alterações

### Etapa 1 — Helper de autenticação compartilhado
- Arquivo: `src/lib/auth-helpers.ts`
- Alteração: criação do helper `getAuthenticatedProfileId()`.
- Função/Utilidade: centralizar a resolução de `profiles.id` do usuário autenticado para auditoria e autoria em múltiplos módulos.

### Etapa 2 — Reuso do helper no módulo de páginas
- Arquivo: `src/lib/actions/pages.ts`
- Alteração: remoção da função duplicada local e import do helper compartilhado.
- Função/Utilidade: reduzir duplicação de código e manter manutenção mais simples.

### Etapa 3 — Server Actions de Modelos
- Arquivo: `src/lib/actions/models.ts`
- Alteração:
  - criação de tipos (`ModelType`, `VisibilityMode`, `PopupTrigger`, `PopupFrequency`, `ModelStatus`);
  - implementação de CRUD, duplicação e estatísticas;
  - implementação de consulta pública por página (`getModelsForPage`) com regras de visibilidade;
  - revalidação de rotas públicas e administrativas.
- Função/Utilidade: encapsular toda regra de negócio dos templates reutilizáveis no backend.

### Etapa 4 — Editor de Modelos
- Arquivo: `src/components/editor/ModelEditor.tsx`
- Alteração:
  - formulário completo de modelo (nome, tipo, prioridade, status);
  - regras de visibilidade (all/specific/exclude) com checklist de páginas;
  - configurações de popup (trigger, delay, scroll, frequência, mobile, overlay);
  - editor de código com Monaco (HTML/CSS/JS) e preview com debounce de 500ms.
- Função/Utilidade: criar/editar modelos com UX consistente com o módulo de páginas e preview imediato.

### Etapa 5 — Listagem administrativa de Modelos
- Arquivos:
  - `src/app/(painel)/painel/paginas/modelos/page.tsx`
  - `src/app/(painel)/painel/paginas/modelos/_components/models-list-client.tsx`
- Alteração:
  - listagem com busca, filtros por tipo/status, tabela desktop e cards mobile;
  - ações de editar, duplicar e excluir (com `ConfirmModal`);
  - rodapé de métricas gerais e por tipo.
- Função/Utilidade: governança de modelos reutilizáveis em operação diária.

### Etapa 6 — Rotas de criação e edição
- Arquivos:
  - `src/app/(painel)/painel/paginas/modelos/novo/page.tsx`
  - `src/app/(painel)/painel/paginas/modelos/[id]/editar/page.tsx`
- Alteração: páginas administrativas conectadas ao `ModelEditor` e ao carregamento das páginas para visibilidade.
- Função/Utilidade: fluxo completo de criação e edição com base única de componente.

### Etapa 7 — Renderização pública de modelos
- Arquivos:
  - `src/components/public/PageModels.tsx`
  - `src/components/public/PopupRenderer.tsx`
  - `src/app/(public)/page.tsx`
  - `src/app/(public)/[slug]/page.tsx`
- Alteração:
  - injeção de headers antes do conteúdo;
  - injeção de footers após o conteúdo;
  - renderização de popups com triggers (`page_load`, `timer`, `scroll_percent`, `exit_intent`, `click`);
  - controle de frequência (`always`, `once`, `once_per_session`, `once_per_day`) via storage do navegador.
- Função/Utilidade: permitir personalização dinâmica de layout/comunicação sem editar o código da página.

### Etapa 8 — Sidebar do admin
- Arquivo: `src/app/(painel)/layout.tsx`
- Alteração: adição dos subitens:
  - `🧩 Modelos` → `/painel/paginas/modelos`
  - `Criar Modelo` → `/painel/paginas/modelos/novo`
- Função/Utilidade: acesso rápido ao módulo de templates.

## Próximos passos
- Rodar `npm run build`.
- Validar listagem/edição de modelos no painel.
- Validar injeção de header/footer/popup no ambiente DEV.
- Commitar e push para `origin/dev`.
