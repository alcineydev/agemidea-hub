# Step-by-step — Prompt 08-FIX-2 (Favicon não persiste após refresh)

## Objetivo

Garantir persistência imediata de `favicon_url` (e logo em modo imagem) no banco `site_settings` ao selecionar/remover via MediaPicker, sem depender do botão global "Salvar Alterações".

## Avanços e alterações

### Etapa 1 — Server action para salvar setting individual
- Arquivo: `src/app/(painel)/painel/configuracoes/actions.ts`
- Alteração:
  - criação de `saveSetting(key, value)` com `upsert` por `key`;
  - revalidação de `/painel/configuracoes` e layout público após salvar.
- Função/Utilidade:
  - persistir ajustes pontuais imediatamente.

### Etapa 2 — Persistência imediata no Favicon
- Arquivo: `src/app/(painel)/painel/configuracoes/components/FaviconUpload.tsx`
- Alteração:
  - seleção via MediaPicker agora:
    - atualiza estado local;
    - salva `favicon_url` com `saveSetting`;
    - aplica favicon na aba somente após sucesso;
    - reverte estado se salvar falhar.
  - remoção agora:
    - limpa estado local;
    - salva `favicon_url = ''` no banco;
    - remove favicon do head após sucesso;
    - reverte estado se falhar.
- Função/Utilidade:
  - impedir perda de favicon ao recarregar a página.

### Etapa 3 — Persistência imediata no Logo (imagem)
- Arquivo: `src/app/(painel)/painel/configuracoes/components/LogoImageMode.tsx`
- Alteração:
  - seleção salva `logo_image_url` e `logo_image_id` imediatamente com `saveSetting`;
  - remoção limpa ambos também com persistência imediata;
  - rollback local em caso de erro.
- Função/Utilidade:
  - manter consistência entre state do painel e `site_settings` sem depender do save geral.

## Arquivos e responsabilidades

- `actions.ts`: endpoint server-side para salvar setting unitária.
- `FaviconUpload.tsx`: UX de favicon com persistência imediata + atualização da aba.
- `LogoImageMode.tsx`: persistência imediata para URL/ID da logo.

## Validação planejada

- selecionar favicon, recarregar, confirmar persistência no preview e aba;
- remover favicon, recarregar, confirmar ausência persistida;
- repetir fluxo com logo imagem e validar persistência após refresh.
