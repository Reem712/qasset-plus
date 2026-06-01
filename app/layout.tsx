import type { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'قسّط موبايلك',
  description: 'تقسيط الهواتف الذكية بأسهل الشروط',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}