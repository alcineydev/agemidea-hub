export interface MediaFile {
  id: string
  name: string
  bucket: string
  folder: string
  size: number
  type: string
  created_at: string
  updated_at: string
  public_url: string
  path: string
  metadata?: {
    width?: number
    height?: number
    mimetype?: string
    size?: number
  }
}

export interface MediaMetadata {
  id: string
  storage_path: string
  bucket: string
  alt_text: string
  title: string
  description: string
  caption: string
  original_name: string
  mime_type: string
  size_bytes: number
  width: number | null
  height: number | null
  created_at: string
  updated_at: string
}

export type MediaFilter = 'all' | 'images' | 'documents' | 'videos' | 'svg'
export type ViewMode = 'grid' | 'list'

export interface MediaStats {
  total: number
  images: number
  documents: number
  videos: number
  svg: number
  totalSize: number
}
