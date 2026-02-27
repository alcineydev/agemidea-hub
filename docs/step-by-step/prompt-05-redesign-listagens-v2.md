# Step-by-step — Prompt 05 (Redesign Listagens v2)

## Objetivo

Unificar listagens de Páginas e Modelos em uma única tela com tabs, redesign completo de tabela/ações, seleção em massa, bulk actions, modal de exclusão com código e paginação client-side.

## Avanços e alterações

### Etapa 1 — Componentes UI reutilizáveis
- Arquivos:
  - `src/components/ui/BulkActionBar.tsx`
  - `src/components/ui/DeleteConfirmModal.tsx`
  - `src/components/ui/TriggerCopyModal.tsx`
  - `src/components/ui/Pagination.tsx`
- Alteração:
  - barra de ações em massa para publicar/rascunho (ou ativar/desativar), excluir e limpar seleção;
  - modal de exclusão com código numérico de 4 dígitos regenerado a cada abertura;
  - modal de snippets de trigger para popups com copiar e feedback visual;
  - paginação client-side com botões prev/next, páginas numéricas e faixa de itens.
- Função/Utilidade:
  - padronizar UX entre tabelas e reduzir duplicação de lógica visual.

### Etapa 2 — Bulk actions no backend
- Arquivos:
  - `src/lib/actions/pages.ts`
  - `src/lib/actions/models.ts`
- Alteração:
  - criação de `bulkUpdatePagesStatus(ids, status)` e `bulkDeletePages(ids)`;
  - criação de `bulkUpdateModelsStatus(ids, status)` e `bulkDeleteModels(ids)`;
  - revalidação das rotas administrativas e públicas após ações em lote.
- Função/Utilidade:
  - permitir operações em massa com regra de negócio centralizada no servidor.

### Etapa 3 — Refactor de listagem de páginas
- Arquivo: `src/app/(painel)/painel/paginas/_components/pages-list-client.tsx`
- Alteração:
  - tabela nova com colunas: checkbox, título, slug, tipo, status, exibição, atualizado, ações;
  - badges por tipo, status com dot e ações apenas com ícones + tooltip;
  - seleção individual/total, integração com `BulkActionBar` e `DeleteConfirmModal`;
  - paginação local de 20 itens e footer com métricas.
- Função/Utilidade:
  - entregar layout v2 com fluxo de gestão rápida e segura de múltiplas páginas.

### Etapa 4 — Refactor de listagem de modelos
- Arquivo: `src/app/(painel)/painel/paginas/modelos/_components/models-list-client.tsx`
- Alteração:
  - tabela nova com colunas: checkbox, nome, tipo, status, visibilidade, prioridade, atualizado, ações;
  - ação de trigger apenas para `popup`, além de editar, duplicar e excluir por ícones;
  - seleção em massa com ações de ativar/desativar/excluir;
  - integração com `TriggerCopyModal`, paginação e footer de métricas.
- Função/Utilidade:
  - manter consistência visual com Páginas e otimizar manutenção operacional de modelos.

### Etapa 5 — Tabs em página única
- Arquivos:
  - `src/app/(painel)/painel/paginas/page.tsx`
  - `src/app/(painel)/painel/paginas/_components/pages-models-tabs.tsx`
  - `src/app/(painel)/painel/paginas/modelos/page.tsx`
- Alteração:
  - rota principal `/painel/paginas` passa a carregar páginas + modelos e renderizar tabs;
  - criação do componente `PagesModelsTabs` com contador e CTA contextual;
  - rota antiga `/painel/paginas/modelos` passa a redirecionar para `/painel/paginas?tab=models`.
- Função/Utilidade:
  - eliminar a separação de fluxo entre módulos e concentrar navegação em uma única tela.

## Validação executada
- `npm run build` executado com sucesso após as alterações.
- Lints dos arquivos alterados revisados e sem erros.

## Observações de manutenção
- As listagens ficaram grandes devido ao volume de regras visuais e estados locais; próximo passo recomendado é extrair subcomponentes de linha/ações para reduzir tamanho dos arquivos.
