import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PresentBuddy - Prepare Your Screen for Professional Presentations',
  description: 'Free, open-source tool to prepare your screen for presentations. Hide desktop icons, minimize windows, change wallpaper, mute audio, and disable notifications with one click.',
  keywords: [
    'presentation tool',
    'screen preparation',
    'presentation software',
    'hide desktop icons',
    'minimize windows',
    'presentation mode',
    'macOS presentation',
    'Windows presentation',
    'Linux presentation',
    'free presentation tool',
    'open source presentation',
    'presentation helper',
    'screen sharing',
    'video call preparation',
    'webinar preparation',
    'professional presentations',
  ],
  authors: [{ name: 'Praveen', url: 'https://github.com/pkspyder007' }],
  creator: 'Praveen',
  publisher: 'PresentBuddy',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://github.com/pkspyder007/presentbuddy'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'PresentBuddy - Prepare Your Screen for Professional Presentations',
    description: 'Free, open-source tool to prepare your screen for presentations. Hide desktop icons, minimize windows, change wallpaper, mute audio, and disable notifications with one click.',
    url: 'https://github.com/pkspyder007/presentbuddy',
    siteName: 'PresentBuddy',
    images: [
      {
        url: '/screenshot.png',
        width: 1200,
        height: 630,
        alt: 'PresentBuddy application interface',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PresentBuddy - Prepare Your Screen for Professional Presentations',
    description: 'Free, open-source tool to prepare your screen for presentations. Hide desktop icons, minimize windows, change wallpaper, mute audio, and disable notifications with one click.',
    images: ['/screenshot.png'],
    creator: '@pkspyder007',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
  category: 'software',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PresentBuddy" />
      </head>
      <body>{children}</body>
    </html>
  )
}

