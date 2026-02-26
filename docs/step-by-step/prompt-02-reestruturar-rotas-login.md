# Step-by-step - Prompt 02

## Objetivo

Reestruturar completamente as rotas para `/painel` unificado por role, implementar login funcional com Supabase Auth, aplicar paleta blue-to-black e atualizar tipos/validacoes para `page_type`.

## Etapas executadas

1. Branch `dev` validada e ambiente preparado.
2. Estrutura antiga de `src/app` removida integralmente.
3. Nova estrutura de `src/app` recriada com grupos `(public)` e `(painel)`.
4. `globals.css` atualizado com paleta tech blue-to-black e utilitarios visuais (grid, dot pattern, animacoes).
5. `layout.tsx` raiz refeito com metadata SEO, robots condicional por dominio e Toaster dark.
6. `not-found.tsx` criado com fallback visual customizado 404.
7. Home publica implementada com leitura CMS por `page_type = home`.
8. Login funcional implementado em `src/app/(public)/login/page.tsx`:
   - autenticao com `signInWithPassword`
   - validacao de perfil ativo
   - redirecionamento para `/painel`
   - formulario de interesse gravando em `leads`
   - recuperacao de senha por email
9. Middleware global atualizado para proteger apenas `/painel` e `/login`.
10. Middleware do Supabase refeito para:
    - validar usuario logado em `/painel`
    - exigir perfil ativo
    - bloquear rotas admin para role `client`
    - redirecionar usuario logado em `/login` para `/painel`
11. Types CMS atualizados (`Page`, `PageInsert`, `PageUpdate`) com `page_type`.
12. `pageSchema` atualizado em validacoes para `page_type`.
13. Layout e placeholders do painel recriados no novo namespace `(painel)`.
14. Placeholders publicos de blog e pagina dinamica `slug` adicionados.
15. Rota cron `publish-posts` mantida na nova arvore.
16. `tailwind.config.ts` atualizado com `darkMode: 'class'` e novas cores `brand`.

## Funcao dos arquivos principais criados/alterados

- `src/app/layout.tsx`: metadados globais, politica de indexacao e toaster.
- `src/app/(public)/login/page.tsx`: login, lead form e fluxo de recuperacao de senha.
- `src/app/(painel)/layout.tsx`: shell inicial do painel com navegacao condicional por role.
- `src/lib/supabase/middleware.ts`: regra central de sessao, autorizacao e redirecionamentos.
- `src/types/index.ts`: contratos de pagina CMS com `page_type`.
- `src/lib/validations/index.ts`: validacao de pagina com enum de tipo.
- `tailwind.config.ts`: tema dark e paleta blue-to-black.

## Observacoes importantes

- O SQL de migracao da coluna `page_type` deve ser executado manualmente no Supabase DEV e PROD.
- As rotas administrativas agora estao dentro de `/painel/*` e filtradas por role.
- Layout, sidebar e telas do painel ainda estao em placeholder por etapa (evolucao nos proximos prompts).
