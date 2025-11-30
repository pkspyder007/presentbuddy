import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PresentBuddy - Prepare Your Screen for Professional Presentations',
  description: 'Free, open-source tool to prepare your screen for presentations. Hide desktop icons, minimize windows, change wallpaper, mute audio, and disable notifications with one click.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

