# Step-by-step - Hotfix Tailwind no deploy

## Objetivo

Corrigir ausencia de estilos no deploy da Vercel causada por mistura de configuracao Tailwind v4 com sintaxe de projeto em v3.

## Diagnostico

1. `package.json` estava com `tailwindcss: ^4` e `@tailwindcss/postcss: ^4`.
2. `src/app/globals.css` estava no padrao v3:
   - `@tailwind base;`
   - `@tailwind components;`
   - `@tailwind utilities;`
3. `tailwind.config.ts` tambem estava no formato v3 (content/theme/plugins).
4. `postcss.config.mjs` estava no formato v4 com `@tailwindcss/postcss`.

## Correcao aplicada (downgrade seguro para v3)

1. Remocao de pacotes v4:
   - `tailwindcss`, `@tailwindcss/postcss`, `@tailwindcss/vite`.
2. Instalacao de stack v3:
   - `tailwindcss@^3.4.0`, `postcss`, `autoprefixer`, `@tailwindcss/typography`.
3. Atualizacao de `postcss.config.mjs` para v3:
   - plugins `tailwindcss` e `autoprefixer`.

## Validacao

1. Build limpo:
   - `rm -rf .next && npm run build` concluido com sucesso.
2. CSS gerado corretamente:
   - `ls -la .next/static/css/` exibiu arquivo `.css`.
3. Validacao visual local:
   - `/login` carregando com tema dark blue-to-black, gradientes, tabs, campos e botao estilizados.

## Resultado

- Tailwind voltou a aplicar estilos no pipeline de build.
- Projeto pronto para deploy da branch `dev` com o visual esperado.
