# Step-by-step - Hotfix Next.js 15.3.3

## Objetivo

Atualizar Next.js para uma versao mais recente da linha 15 para mitigar o bloqueio de deploy relacionado ao CVE-2025-66478.

## Etapas executadas

1. `package.json` atualizado:
   - `next`: `15.1.6` -> `15.3.3`
   - `eslint-config-next`: `15.1.6` -> `15.3.3`
2. Reinstalacao limpa de dependencias:
   - remocao de `node_modules`, `package-lock.json` e `.next`
   - execucao de `npm install`
3. Verificacao de versao:
   - `npx next --version` retornando `Next.js v15.3.3`
4. Validacao de build:
   - `npm run build` concluido com sucesso e banner `▲ Next.js 15.3.3`

## Estado final

- Projeto compilando corretamente em Next.js 15.3.3.
- Branch `dev` pronta para novo deploy na Vercel.
