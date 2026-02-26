# Step-by-step - Hotfix final Next 15.3.8

## Objetivo

Aplicar a versao final segura recomendada pelo `fix-react2shell-next`, mantendo o projeto compativel e pronto para deploy.

## Etapas executadas

1. Branch `dev` confirmada.
2. Limpeza total de ambiente local:
   - `node_modules`, `package-lock.json` e `.next` removidos.
3. Execucao do fix automatico:
   - `npx fix-react2shell-next --fix`
   - atualizou `next` para `15.3.8`.
4. Conferencia de `package.json`:
   - `next` em `15.3.8`.
   - `react` e `react-dom` mantidos conforme sugestao do fix.
5. Instalacao de dependencias:
   - `npm install`
6. Verificacao de versao:
   - `npx next --version` => `15.3.8`
7. Validacao de build:
   - `npm run build` concluido com sucesso (`▲ Next.js 15.3.8`).

## Resultado

- Projeto atualizado para `next@15.3.8`.
- Build local ok e branch pronta para deploy na Vercel.
