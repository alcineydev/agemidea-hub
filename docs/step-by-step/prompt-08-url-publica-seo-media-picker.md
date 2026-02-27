# Step-by-step — Prompt 08 (URL pública no domínio + SEO + Media Picker)

## Objetivo

Implementar URL de mídia no domínio via rewrite (`/media/...`), adicionar metadados SEO para arquivos de mídia e criar um `MediaPicker` reutilizável para uso em favicon/logo e futuros módulos.

## Avanços e alterações

### Etapa 1 — Rewrite de mídia no Next
- Arquivo: `next.config.ts`
- Alteração:
  - adição de `rewrites()` com regra `/media/:path*` para `.../storage/v1/object/public/site-assets/:path*`.
- Função/Utilidade:
  - expor arquivos no domínio da aplicação sem alterar o dado salvo no banco.

### Etapa 2 — Helper de URL de mídia
- Arquivo: `src/lib/media-url.ts`
- Alteração:
  - criação de `toMediaUrl()` para converter URL do Supabase em `/media/...`;
  - criação de `toAbsoluteMediaUrl()` para meta tags/SEO que exigem URL absoluta.
- Função/Utilidade:
  - centralizar a regra de transformação de URL para evitar duplicação.

### Etapa 3 — Actions de metadados SEO
- Arquivo: `src/app/(painel)/painel/midia/actions.ts`
- Alteração:
  - inclusão de `getMediaMetadata`, `saveMediaMetadata`, `deleteMediaMetadata`, `getMediaMetadataBatch`;
  - upload de mídia agora cria metadata inicial (`original_name`, `mime_type`, `size_bytes`);
  - exclusão de mídia remove metadata antes de remover no Storage.
- Função/Utilidade:
  - manter SEO por arquivo desacoplado do objeto de storage e pronto para reuso.

### Etapa 4 — DetailPanel com campos SEO
- Arquivo: `src/app/(painel)/painel/midia/components/DetailPanel.tsx`
- Alteração:
  - carregamento de metadata ao abrir painel;
  - seção de SEO com campos editáveis (alt, title, description, caption);
  - contador de `alt` até 125 caracteres;
  - botão `Salvar SEO`;
  - exibição de URL Supabase + URL no domínio.
- Função/Utilidade:
  - permitir gestão de acessibilidade e SEO direto no painel de mídia.

### Etapa 5 — Media Picker reutilizável
- Arquivos:
  - `src/components/media/MediaPickerModal.tsx`
  - `src/components/media/useMediaPicker.tsx`
  - `src/components/media/index.ts`
- Alteração:
  - modal com tabs Galeria/Upload, busca, filtros e seleção;
  - upload com validação de tipo/tamanho e status visual por arquivo;
  - sidebar (desktop) com preview e campos SEO;
  - autosave de SEO com debounce de 1s;
  - hook `useMediaPicker` com API baseada em Promise.
- Função/Utilidade:
  - componente compartilhável para seleção/envio de mídia em qualquer módulo.

### Etapa 6 — Integração no módulo de configurações
- Arquivos:
  - `src/app/(painel)/painel/configuracoes/components/FaviconUpload.tsx`
  - `src/app/(painel)/painel/configuracoes/components/LogoImageMode.tsx`
- Alteração:
  - remoção do upload local direto;
  - abertura do `MediaPicker` para escolher arquivo existente ou enviar novo;
  - persistência de URL original no setting e renderização via `toMediaUrl`;
  - manutenção dos fluxos de preview e remoção.
- Função/Utilidade:
  - unificar origem dos assets de branding no mesmo fluxo de mídia.

### Etapa 7 — Ajustes de renderização do módulo de mídia
- Arquivos:
  - `src/app/(painel)/painel/midia/components/MediaCard.tsx`
  - `src/app/(painel)/painel/midia/components/MediaRow.tsx`
- Alteração:
  - previews de imagem renderizando com `toMediaUrl`.
- Função/Utilidade:
  - validar na prática o rewrite `/media` em toda a UI do painel.

## Arquivos e responsabilidades

- `next.config.ts`: mapeamento de rota `/media` para Storage público.
- `src/lib/media-url.ts`: conversão de URL Supabase para URL do domínio.
- `midia/actions.ts`: CRUD de storage + CRUD de metadata SEO.
- `DetailPanel.tsx`: edição manual de SEO por arquivo.
- `MediaPickerModal.tsx`: galeria/upload/preview/SEO em modal reutilizável.
- `useMediaPicker.tsx`: interface simples para abrir picker via Promise.
- `components/media/index.ts`: ponto único de export para consumo em módulos futuros.
- `FaviconUpload.tsx` e `LogoImageMode.tsx`: integração do picker no fluxo de configurações.

## Validação planejada

- `npm run build` para validação de tipagem/rotas.
- teste manual do rewrite (`/media/...`) em preview de imagem.
- teste manual de SEO (carregar, editar e salvar) no `DetailPanel`.
- teste manual do picker (seleção, upload, autosave SEO, retorno no callback).
