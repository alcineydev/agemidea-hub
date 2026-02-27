# Step-by-step — Prompt 07 (Fix Favicon + Módulo Mídia)

## Objetivo

Corrigir o bug de preview do favicon em `/painel/configuracoes` e implementar o módulo completo de mídia em `/painel/midia` com listagem, upload, filtros, busca, detalhe e ações em massa.

## Avanços e alterações

### Etapa 1 — Fix do fluxo de favicon/logo
- Arquivos:
  - `src/app/(painel)/painel/configuracoes/components/FaviconUpload.tsx`
  - `src/app/(painel)/painel/configuracoes/actions.ts`
  - `src/app/(painel)/painel/configuracoes/components/LogoImageMode.tsx`
- Alteração:
  - validação de retorno da URL pública após upload;
  - fallback visual no preview da favicon quando a imagem falha;
  - atualização imediata de estado após upload/remoção;
  - robustez na geração da URL pública completa (`https://...`) no server action;
  - ajuste defensivo no upload de logo para evitar estado com URL inválida.
- Função/Utilidade:
  - garantir que o preview renderize imediatamente e persista com URL válida do Supabase Storage.

### Etapa 2 — Base do módulo de mídia
- Arquivos:
  - `src/app/(painel)/painel/midia/types.ts`
  - `src/app/(painel)/painel/midia/actions.ts`
  - `src/app/(painel)/painel/midia/page.tsx`
- Alteração:
  - criação dos tipos principais (`MediaFile`, filtros, modo de visualização e estatísticas);
  - criação de server actions para listar, enviar e excluir arquivos do bucket `site-assets`;
  - criação da página server component para carregar dados iniciais.
- Função/Utilidade:
  - concentrar contrato de dados e integração com Supabase em um único módulo previsível e reaproveitável.

### Etapa 3 — Interface de mídia (cliente e componentes)
- Arquivos:
  - `src/app/(painel)/painel/midia/MidiaClient.tsx`
  - `src/app/(painel)/painel/midia/components/MediaToolbar.tsx`
  - `src/app/(painel)/painel/midia/components/UploadZone.tsx`
  - `src/app/(painel)/painel/midia/components/MediaGrid.tsx`
  - `src/app/(painel)/painel/midia/components/MediaCard.tsx`
  - `src/app/(painel)/painel/midia/components/MediaList.tsx`
  - `src/app/(painel)/painel/midia/components/MediaRow.tsx`
  - `src/app/(painel)/painel/midia/components/DetailPanel.tsx`
  - `src/app/(painel)/painel/midia/components/StorageStats.tsx`
- Alteração:
  - client principal com state de filtros, busca, seleção, modo de visualização e painel de detalhe;
  - upload via drag and drop/click com validação de tipo e tamanho;
  - visualização em grade e lista;
  - ações em massa (copiar URLs e excluir com confirmação em código de 4 dígitos);
  - painel lateral com preview, metadados, cópia de URL/path e exclusão;
  - rodapé com estatísticas e barra de uso de storage.
- Função/Utilidade:
  - entregar gestão de mídia ponta a ponta no painel, com UX consistente e foco operacional.

### Etapa 4 — Navegação do painel
- Arquivo:
  - `src/components/layout/PainelSidebar.tsx`
- Alteração:
  - inclusão do item `Mídia` sem submenu;
  - posicionamento do item entre `Páginas` e `Clientes`.
- Função/Utilidade:
  - expor a nova rota `/painel/midia` no fluxo principal do admin.

## Arquivos e responsabilidades

- `types.ts`: tipa o domínio de mídia e reduz acoplamento entre actions e UI.
- `actions.ts`: camada server-side de storage (list/upload/delete) com revalidação de rota.
- `page.tsx`: entrada server da rota e hidratação inicial do cliente.
- `MidiaClient.tsx`: orquestra toda a lógica de estado, filtros e ações em massa.
- `MediaToolbar.tsx`: busca, filtros e alternância de visualização.
- `UploadZone.tsx`: envio de arquivos com drag and drop e validação no cliente.
- `MediaGrid.tsx`/`MediaCard.tsx`: renderização em cards responsivos.
- `MediaList.tsx`/`MediaRow.tsx`: renderização tabular para gestão detalhada.
- `DetailPanel.tsx`: painel lateral com preview, metadados, cópia e exclusão.
- `StorageStats.tsx`: resumo de contagem e consumo total do bucket.
- `PainelSidebar.tsx`: navegação para o módulo de mídia.

## Validação planejada

- `npm run build` para garantir integridade de tipagem/rotas.
- validação manual do fluxo de favicon (upload, reload, remoção e novo upload).
- validação manual do fluxo de mídia (upload, filtros, busca, detalhe, bulk copy/delete).
