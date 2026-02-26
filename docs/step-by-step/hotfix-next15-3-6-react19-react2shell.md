# Step-by-step - Hotfix Next 15.3.6 + React 19.1.2

## Objetivo

Atualizar dependencias para a combinacao solicitada de seguranca:
- Next.js `15.3.6`
- React `19.1.2`

## Etapas executadas

1. Branch `dev` validada.
2. Tentativa automatica executada:
   - `npx fix-react2shell-next --fix`
   - ferramenta ajustou somente `next` para `15.3.8`.
3. Ajuste manual aplicado no `package.json` para alinhar com a solicitacao:
   - `next`: `15.3.6`
   - `react`: `19.1.2`
   - `react-dom`: `19.1.2`
   - `@types/react`: `^19.1.0`
   - `@types/react-dom`: `^19.1.0`
   - `eslint-config-next`: `15.3.6`
4. Reinstalacao limpa:
   - remocao de `node_modules`, `package-lock.json` e `.next`
   - `npm install`
5. Verificacao de versao:
   - `npx next --version` => `Next.js v15.3.6`
6. Build local validado:
   - `npm run build` concluido com `▲ Next.js 15.3.6`

## Resultado

- Projeto compilando com a versao alvo solicitada.
- Branch `dev` pronta para deploy na Vercel.
