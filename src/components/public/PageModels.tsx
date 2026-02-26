import { getModelsForPage } from '@/lib/actions/models'

import { ModelHtmlRenderer } from './ModelHtmlRenderer'
import { PopupRenderer } from './PopupRenderer'

interface PageModelsProps {
  pageId: string
  position: 'header' | 'footer' | 'popup'
}

export async function PageModels({ pageId, position }: PageModelsProps) {
  const models = await getModelsForPage(pageId)

  const composeModelHtml = (htmlContent: string, cssContent: string, jsContent: string) =>
    `${cssContent ? `<style>${cssContent}</style>` : ''}${htmlContent || ''}${jsContent ? `<script>${jsContent}<\/script>` : ''}`

  if (position === 'header') {
    return (
      <>
        {models.headers.map((header) => (
          <ModelHtmlRenderer
            key={header.id}
            html={composeModelHtml(header.html_content || '', header.css_content || '', header.js_content || '')}
          />
        ))}
      </>
    )
  }

  if (position === 'footer') {
    return (
      <>
        {models.footers.map((footer) => (
          <ModelHtmlRenderer
            key={footer.id}
            html={composeModelHtml(footer.html_content || '', footer.css_content || '', footer.js_content || '')}
          />
        ))}
      </>
    )
  }

  if (position === 'popup') {
    return (
      <div data-ag-popup-scope={pageId}>
        <PopupRenderer popups={models.popups} />
      </div>
    )
  }

  return null
}
