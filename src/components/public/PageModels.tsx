import { getModelsForPage } from '@/lib/actions/models'

import { PopupRenderer } from './PopupRenderer'

interface PageModelsProps {
  pageId: string
  position: 'header' | 'footer' | 'popup'
}

export async function PageModels({ pageId, position }: PageModelsProps) {
  const models = await getModelsForPage(pageId)

  if (position === 'header') {
    return (
      <>
        {models.headers.map((header) => (
          <div key={header.id}>
            {header.css_content && <style dangerouslySetInnerHTML={{ __html: header.css_content }} />}
            <div dangerouslySetInnerHTML={{ __html: header.html_content || '' }} />
            {header.js_content && <script dangerouslySetInnerHTML={{ __html: header.js_content }} />}
          </div>
        ))}
      </>
    )
  }

  if (position === 'footer') {
    return (
      <>
        {models.footers.map((footer) => (
          <div key={footer.id}>
            {footer.css_content && <style dangerouslySetInnerHTML={{ __html: footer.css_content }} />}
            <div dangerouslySetInnerHTML={{ __html: footer.html_content || '' }} />
            {footer.js_content && <script dangerouslySetInnerHTML={{ __html: footer.js_content }} />}
          </div>
        ))}
      </>
    )
  }

  if (position === 'popup') {
    return <PopupRenderer popups={models.popups} />
  }

  return null
}
