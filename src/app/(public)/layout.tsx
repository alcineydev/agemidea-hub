import { DynamicFavicon } from '@/components/layout/DynamicFavicon'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <DynamicFavicon />
      {children}
    </>
  )
}
