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
