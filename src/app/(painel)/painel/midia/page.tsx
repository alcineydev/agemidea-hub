import MidiaClient from './MidiaClient'
import { listMediaFiles } from './actions'

export const metadata = {
  title: 'Mídia — Agemidea HUB',
}

export default async function MidiaPage() {
  const { files } = await listMediaFiles()

  return <MidiaClient initialFiles={files} />
}
