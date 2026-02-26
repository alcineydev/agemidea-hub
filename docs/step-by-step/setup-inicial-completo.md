# Step-by-step - Setup inicial do Agemidea Hub

## Visao geral

Este documento registra cada etapa executada no setup inicial do projeto e descreve a funcao/utilidade dos arquivos criados na base.

## Etapas executadas

1. Projeto Next.js criado com App Router, TypeScript, Tailwind e ESLint.
2. Branch `dev` criada para desenvolvimento.
3. Dependencias de Supabase, UI, forms, charts, editor e utilitarios instaladas.
4. Estrutura de pastas de `app`, `components`, `lib`, `hooks`, `types` e `api` criada.
5. Cliente Supabase de browser criado em `src/lib/supabase/client.ts`.
6. Cliente Supabase server/admin criado em `src/lib/supabase/server.ts`.
7. Middleware de sessao/autorizacao Supabase criado em `src/lib/supabase/middleware.ts`.
8. Middleware do Next criado em `src/middleware.ts`.
9. Tipagens de dominio completas criadas em `src/types/index.ts`.
10. Schemas Zod e tipos inferidos criados em `src/lib/validations/index.ts`.
11. Utilitarios gerais e configs de status criados em `src/lib/utils.ts`.
12. Variaveis de ambiente base criadas em `.env.local`.
13. Root layout atualizado com metadados e `Toaster`.
14. Endpoint cron de publicacao de posts criado em `src/app/api/cron/publish-posts/route.ts`.
15. Placeholders de todas as paginas definidas criados.
16. Tailwind configurado com `content`, paleta `brand` e plugin `typography`.

## Funcao e utilidade dos arquivos principais

- `.env.local`: concentra configuracoes locais sensiveis (Supabase e dados do app).
- `tailwind.config.ts`: define paths de scan, cores de marca e plugins Tailwind.
- `src/app/layout.tsx`: layout raiz global da aplicacao e toaster de notificacoes.
- `src/middleware.ts`: conecta o middleware do Next ao controle de sessao customizado.
- `src/lib/supabase/client.ts`: instancia cliente Supabase para uso em browser/client components.
- `src/lib/supabase/server.ts`: instancia clientes Supabase para server components e uso admin.
- `src/lib/supabase/middleware.ts`: protege rotas de `admin` e `painel` e aplica RBAC por perfil.
- `src/lib/validations/index.ts`: validacoes centralizadas de formularios (auth, leads, blog, suporte etc).
- `src/lib/utils.ts`: helper de classes, datas, moeda, telefone, slug e configs de status.
- `src/types/index.ts`: contratos TypeScript do dominio (profiles, projects, blog, support, dashboard, API).
- `src/app/api/cron/publish-posts/route.ts`: rota segura para publicar posts agendados via cron.

## Funcao e utilidade dos grupos de paginas

- `src/app/(public)/*`: rotas publicas (home, login, pre-cadastro, blog e pagina dinamica CMS).
- `src/app/(admin)/*`: rotas internas de operacao administrativa (clientes, projetos, paginas, blog, suporte, configuracoes).
- `src/app/(client)/*`: area do cliente (painel, projetos, suporte e arquivos).

## Pastas de componentes preparadas para implementacao futura

- `src/components/ui`: componentes base de UI.
- `src/components/layout`: elementos de estrutura visual (header/sidebars).
- `src/components/dashboard`: cards e graficos.
- `src/components/support`: blocos de chat e atendimento.
- `src/components/editor`: componentes para editor de codigo.
- `src/hooks`: hooks customizados reutilizaveis.

## Pendencias identificadas para concluir fluxo Git/Deploy

- Push da branch `dev` falhou por ausencia de remoto `origin` configurado.
- Configuracao de preview da branch `dev` na Vercel depende do projeto estar conectado.
