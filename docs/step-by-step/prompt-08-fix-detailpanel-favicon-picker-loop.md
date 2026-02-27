# Step-by-step — Prompt 08-FIX (DetailPanel, Favicon aba, loop do Media Picker)

## Objetivo

Corrigir bugs de URL e dimensões no `DetailPanel`, resolver atualização/persistência de favicon na aba do navegador e eliminar loop de carregamento no `MediaPicker`.

## Avanços e alterações

### Etapa 1 — URL final no DetailPanel
- Arquivo: `src/app/(painel)/painel/midia/components/DetailPanel.tsx`
- Alteração:
  - remoção completa do campo `URL pública (Supabase)`;
  - campo único `URL` usando `toAbsoluteMediaUrl(file.public_url)`;
  - botão `Copiar URL` atualizado para copiar URL absoluta.
- Função/Utilidade:
  - padronizar exibição/cópia com URL final do domínio.

### Etapa 2 — Dimensões reais de imagem
- Arquivo: `src/app/(painel)/painel/midia/components/DetailPanel.tsx`
- Alteração:
  - leitura de dimensões via `Image()` no client quando metadata não tiver width/height;
  - campo `Dimensões` exibido apenas para arquivos de imagem;
  - fallback `Carregando...` até obter as dimensões.
- Função/Utilidade:
  - eliminar valor inválido de dimensões e mostrar tamanho real do arquivo.

### Etapa 3 — URL absoluta helper
- Arquivo: `src/lib/media-url.ts`
- Alteração:
  - `toAbsoluteMediaUrl` passa a usar `window.location.origin` no client;
  - mantém fallback server com `NEXT_PUBLIC_SITE_URL`.
- Função/Utilidade:
  - garantir domínio correto em dev/preview/prod.

### Etapa 4 — Loop do Media Picker
- Arquivo: `src/components/media/MediaPickerModal.tsx`
- Alteração:
  - controle de carregamento com `loadedRef` para buscar arquivos apenas uma vez por abertura;
  - `useEffect` de carregamento dependente só do estado de abertura;
  - autosave SEO com dependências primitivas (evita re-trigger por objeto inteiro).
- Função/Utilidade:
  - remover requests infinitos e estabilizar performance do modal.

### Etapa 5 — Hook useMediaPicker estável
- Arquivo: `src/components/media/useMediaPicker.tsx`
- Alteração:
  - `PickerModal` agora é retornado como elemento JSX (`PickerModal: pickerElement`) e não função callback.
- Função/Utilidade:
  - evitar recriação desnecessária do componente e reduzir chance de loops de render.

### Etapa 6 — Favicon dinâmico na aba
- Arquivos:
  - `src/components/layout/DynamicFavicon.tsx` (novo)
  - `src/app/(painel)/layout.tsx`
  - `src/app/(public)/layout.tsx`
  - `src/app/(painel)/painel/configuracoes/components/FaviconUpload.tsx`
- Alteração:
  - carregamento de `favicon_url` via Supabase e aplicação dinâmica no `<head>`;
  - inclusão do componente dinâmico nos layouts público e painel;
  - atualização imediata do favicon ao selecionar/remover no `FaviconUpload`.
- Função/Utilidade:
  - favicon passa a aparecer na aba e persistir entre recarregamentos.

### Etapa 7 — Layout limpo do FaviconUpload
- Arquivo: `src/app/(painel)/painel/configuracoes/components/FaviconUpload.tsx`
- Alteração:
  - remoção de resquícios de upload direto antigo;
  - layout simplificado: preview + texto de especificação + botões (`Escolher favicon`, `Remover`).
- Função/Utilidade:
  - UI consistente com o fluxo novo do Media Picker.

### Etapa 8 — Salvar dimensões após upload
- Arquivos:
  - `src/components/media/MediaPickerModal.tsx`
  - `src/app/(painel)/painel/midia/components/UploadZone.tsx`
- Alteração:
  - após upload de imagem, leitura de `naturalWidth`/`naturalHeight` no client;
  - persistência de width/height em `media_metadata` via `saveMediaMetadata`.
- Função/Utilidade:
  - reduzir leituras repetidas de dimensões no painel e melhorar consistência dos metadados.

## Arquivos e responsabilidades

- `media-url.ts`: montagem de URL relativa e absoluta.
- `DetailPanel.tsx`: apresentação de metadados + SEO + dimensões reais + URL final.
- `MediaPickerModal.tsx`: galeria/upload e autosave SEO estável sem loop.
- `useMediaPicker.tsx`: API de abertura do picker com render estável.
- `DynamicFavicon.tsx`: sincronização do favicon do banco com `<head>`.
- `FaviconUpload.tsx`: seleção/remoção de favicon e atualização imediata da aba.
- `UploadZone.tsx`: upload padrão do painel com persistência de dimensões em metadata.

## Validação planejada

- `npm run build` sem erros.
- abrir picker de favicon/logo e confirmar ausência de loop de requests.
- confirmar URL absoluta no `DetailPanel`.
- confirmar dimensões reais em imagens e ocultação para não-imagens.
- selecionar/remover favicon e validar atualização imediata + persistência ao recarregar.
