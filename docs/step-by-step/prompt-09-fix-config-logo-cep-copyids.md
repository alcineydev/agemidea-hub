# Step-by-step — Prompt 09-FIX (Config + Logo dinâmica + CEP + Copy IDs)

## Objetivo

Corrigir renderização da logo dinâmica na sidebar/login, ajustar posicionamento do toggle de tema da logo, adicionar copy de IDs (`{{key}}`) nos campos da aba empresa e implementar busca automática de endereço por CEP (ViaCEP).

## Avanços e alterações

### Etapa 1 — DynamicLogo resiliente
- Arquivo: `src/components/layout/DynamicLogo.tsx`
- Alteração:
  - simplificação da lógica para priorizar `logo_image_url`;
  - fallback robusto com ícone + texto + badge;
  - estado de loading sem flicker;
  - fallback automático se imagem falhar.
- Função/Utilidade:
  - garantir que logo de imagem apareça mesmo sem dependência rígida de modo.

### Etapa 2 — Integração da logo no painel e login
- Arquivos:
  - `src/components/layout/PainelSidebar.tsx`
  - `src/app/(public)/login/page.tsx`
- Alteração:
  - ajuste de props (`showIcon`) e largura máxima da imagem (`max-w`) para não quebrar layout.
- Função/Utilidade:
  - padronizar visual da marca e evitar overflow na sidebar/login.

### Etapa 3 — Toggle de tema da logo sem sobreposição
- Arquivo: `src/app/(painel)/painel/configuracoes/components/ThemeSwitcher.tsx`
- Alteração:
  - remove posicionamento absoluto;
  - posiciona como bloco de layout normal (abaixo do preview).
- Função/Utilidade:
  - impedir sobreposição com controles e topbar.

### Etapa 4 — CompanyInfo com copy de keys
- Arquivo: `src/app/(painel)/painel/configuracoes/components/CompanyInfoTab.tsx`
- Alteração:
  - criação de `FieldLabel` com botão de copiar `{{setting_key}}`;
  - aplicação em campos de empresa, endereço e contato;
  - feedback visual de cópia (check temporário).
- Função/Utilidade:
  - acelerar uso de variáveis dinâmicas em templates/modelos.

### Etapa 5 — Busca por CEP (ViaCEP) + Bairro
- Arquivo: `src/app/(painel)/painel/configuracoes/components/CompanyInfoTab.tsx`
- Alteração:
  - `handleCepChange` com máscara + busca automática ao completar 8 dígitos;
  - preenchimento de logradouro, bairro, cidade, estado e complemento (quando aplicável);
  - spinner de carregamento no campo CEP;
  - inclusão do campo `address_neighborhood` (bairro) no formulário.
- Função/Utilidade:
  - reduzir digitação manual e melhorar consistência dos dados de endereço.

### Etapa 6 — Copy IDs também nas redes
- Arquivo: `src/app/(painel)/painel/configuracoes/components/SocialLinks.tsx`
- Alteração:
  - rótulo com copy `{{social_*}}` para cada rede social.
- Função/Utilidade:
  - manter padrão de copy de chaves em toda a aba de empresa.

## Validação executada

- `npm run build` executado com sucesso.
- lints de acessibilidade nos campos alterados corrigidos.
