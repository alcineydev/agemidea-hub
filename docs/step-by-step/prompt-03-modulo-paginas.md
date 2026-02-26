# Step-by-step — Prompt 03 (Módulo de Páginas CMS)

## Objetivo

Implementar o módulo completo de páginas (CMS) com CRUD via Server Actions, listagem admin com filtros/busca, editor com Monaco + preview ao vivo, rotas públicas dinâmicas, endpoint de seed e ajustes de navegação.

## Avanços e alterações

### Etapa 1 — Base Supabase para o CMS
- Arquivo: `src/lib/supabase/server.ts`
- Alteração: adição das funções `createServerClient` e `createAdminClient`, mantendo compatibilidade com funções já existentes (`createServerSupabase` e `createServerSupabaseAdmin`).
- Função/Utilidade: padronizar o acesso do módulo CMS para client autenticado (RLS) e client admin (seed).

### Etapa 2 — Server Actions de páginas
- Arquivo: `src/lib/actions/pages.ts`
- Alteração: criação completa das actions de listagem, busca por id/slug/tipo, criação, atualização, exclusão e estatísticas.
- Função/Utilidade: centralizar a regra de negócio do CMS (unicidade de tipo especial e slug, revalidação de rotas e retorno tipado para UI).

### Etapa 3 — UI base para exclusão
- Arquivo: `src/components/ui/confirm-modal.tsx`
- Alteração: criação do modal de confirmação reutilizável para operações destrutivas.
- Função/Utilidade: confirmar exclusão de página com estado de loading e feedback visual consistente.

### Etapa 4 — Editor visual e técnico
- Arquivo: `src/components/editor/PageEditor.tsx`
- Alteração: criação do editor compartilhado (nova/editar) com:
  - campos de configuração da página;
  - SEO colapsável;
  - Monaco dinâmico por aba (HTML/CSS/JS);
  - preview via `iframe` com debounce de 500ms;
  - validações de título/slug;
  - ações de salvar rascunho/publicar.
- Função/Utilidade: oferecer fluxo completo de autoria de páginas com experiência de edição e preview em tempo real.

### Etapa 5 — Listagem administrativa de páginas
- Arquivos:
  - `src/app/(painel)/painel/paginas/page.tsx`
  - `src/app/(painel)/painel/paginas/_components/pages-list-client.tsx`
- Alteração: implementação da tela com:
  - título, CTA de nova página;
  - busca;
  - filtros por tipo;
  - tabela desktop;
  - cards mobile;
  - ações editar/ver/excluir;
  - rodapé com métricas.
- Função/Utilidade: permitir governança de conteúdo com navegação rápida e gestão por status/tipo.

### Etapa 6 — Rotas de criação e edição
- Arquivos:
  - `src/app/(painel)/painel/paginas/nova/page.tsx`
  - `src/app/(painel)/painel/paginas/[id]/editar/page.tsx`
  - `src/app/(painel)/painel/paginas/[id]/page.tsx`
- Alteração: rota nova e rota editar conectadas ao `PageEditor`; rota legada `[id]` redirecionada para `/editar`.
- Função/Utilidade: consolidar UX no novo fluxo de edição sem quebrar links antigos.

### Etapa 7 — Rotas públicas dinâmicas
- Arquivos:
  - `src/app/(public)/page.tsx`
  - `src/app/(public)/[slug]/page.tsx`
  - `src/app/not-found.tsx`
- Alteração: renderização pública baseada no conteúdo do banco (home, páginas por slug e 404 customizável).
- Função/Utilidade: desacoplar conteúdo da camada de código para permitir gestão total via CMS.

### Etapa 8 — Endpoint de seed das páginas obrigatórias
- Arquivo: `src/app/api/seed-pages/route.ts`
- Alteração: endpoint protegido por `Authorization: Bearer <CRON_SECRET>` para criar páginas iniciais quando ausentes.
- Função/Utilidade: acelerar bootstrap do projeto e garantir páginas legais/institucionais mínimas.

### Etapa 9 — Sidebar admin (atalhos de páginas)
- Arquivo: `src/app/(painel)/layout.tsx`
- Alteração: subitens adicionados no menu de páginas:
  - Todas as Páginas;
  - Criar Nova.
- Função/Utilidade: navegação mais direta para operação diária do CMS.

## Próximos passos (pendentes de validação)
- Commit com mensagem solicitada.
- Push para `origin/dev`.

## Validação executada
- Build validado com sucesso: `npm run build`.
- Rotas geradas incluem:
  - `/painel/paginas`
  - `/painel/paginas/nova`
  - `/painel/paginas/[id]/editar`
  - `/api/seed-pages`
  - `/(public)/[slug]` e `not-found` customizado.
