# Step-by-step - Hotfix build login (Suspense)

## Contexto

Build da Vercel falhando na rota `/login` com erro:
`useSearchParams() should be wrapped in a suspense boundary`.

## Ajuste aplicado

1. Arquivo ajustado: `src/app/(public)/login/page.tsx`.
2. Conteudo do arquivo substituido integralmente com a versao de hotfix solicitada (boundary de `Suspense` envolvendo `useSearchParams`).
3. Adicionado fallback de carregamento com spinner para o suspense.
4. O componente da pagina foi dividido em:
   - `LoginContent` (conteudo principal, onde `useSearchParams` e usado).
   - `LoginFallback` (fallback de carregamento simples).
   - `LoginPage` (wrapper com `<Suspense fallback={<LoginFallback />}>`).
5. Nenhuma regra de autenticacao/negocio foi alterada; apenas estrutura de renderizacao para atender requisito do Next.js 16 em build.

## Validacao

- `npm run build` executado com sucesso.
- Rota `/login` passou a ser gerada sem erro de prerender.

## Observacoes

- Permanece apenas aviso deprecado do Next sobre `middleware` -> `proxy` (nao bloqueante).
