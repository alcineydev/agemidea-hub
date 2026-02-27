import ConfiguracoesClient from './ConfiguracoesClient'
import { getSettings } from './actions'

export const metadata = {
  title: 'Configurações — Agemidea HUB',
}

export default async function ConfiguracoesPage() {
  const settings = await getSettings()
  return <ConfiguracoesClient initialSettings={settings} />
}
