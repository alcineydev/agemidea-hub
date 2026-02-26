# Step-by-step - Hotfix Next.js 15

## Objetivo

Fixar o projeto em Next.js 15.1.6 para evitar problemas de compatibilidade observados no deploy com Next 16.

## Etapas executadas

1. `package.json` atualizado para versoes fixas:
   - `next`: `15.1.6`
   - `react`: `^18.3.1`
   - `react-dom`: `^18.3.1`
   - `@types/react`: `^18.3.0`
   - `@types/react-dom`: `^18.3.0`
   - `eslint-config-next`: `15.1.6`
2. Limpeza local de dependencias e cache:
   - `node_modules`, `package-lock.json` e `.next` removidos.
3. Reinstalacao completa:
   - `npm install`
4. Verificacao de versao:
   - `npx next --version` retornando `Next.js v15.1.6`.
5. Build local validado:
   - `npm run build` concluido com `▲ Next.js 15.1.6`.
6. Ajuste de compatibilidade no `eslint.config.mjs`:
   - configuracao convertida para `FlatCompat` com `next/core-web-vitals` e `next/typescript`.
   - removeu erro de lint durante o build.

## Resultado

- Projeto rodando e buildando com Next 15.1.6.
- Sem aviso de deprecacao de `middleware` no build do Next 15.
- Preparado para novo deploy na Vercel pela branch `dev`.
