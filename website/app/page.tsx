import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Download, 
  Monitor, 
  Minimize2, 
  Image, 
  VolumeX, 
  BellOff,
  Check,
  Presentation,
  Users,
  Video,
  Zap,
  Github
} from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: Monitor,
      title: 'Hide Desktop Icons',
      description: 'Temporarily hide desktop icons on macOS for a clean presentation view.',
    },
    {
      icon: Minimize2,
      title: 'Minimize All Windows',
      description: 'Instantly minimize all open application windows to your taskbar or dock.',
    },
    {
      icon: Image,
      title: 'Change Wallpaper',
      description: 'Switch to a neutral, professional wallpaper that won\'t distract from your presentation.',
    },
    {
      icon: VolumeX,
      title: 'Mute System Audio',
      description: 'Silence all system sounds and audio output to avoid interruptions during your presentation.',
    },
    {
      icon: BellOff,
      title: 'Disable Notifications',
      description: 'Suppress system notifications to prevent embarrassing interruptions during important moments.',
    },
    {
      icon: Zap,
      title: 'One-Click Toggle',
      description: 'Enable or disable all features at once with a single master toggle button.',
    },
  ]

  const useCases = [
    {
      icon: Presentation,
      title: 'Business Presentations',
      description: 'Present to clients and stakeholders with confidence. No distractions, no interruptions.',
    },
    {
      icon: Video,
      title: 'Video Calls & Webinars',
      description: 'Look professional in online meetings. Clean desktop, no notifications, no background noise.',
    },
    {
      icon: Users,
      title: 'Teaching & Training',
      description: 'Focus your students\' attention on your content, not your cluttered desktop.',
    },
  ]

  const steps = [
    {
      number: '1',
      title: 'Download & Install',
      description: 'Download PresentBuddy for macOS. Windows and Linux versions coming soon. Installation takes less than a minute.',
    },
    {
      number: '2',
      title: 'Launch & Configure',
      description: 'Open PresentBuddy and customize which features you want to enable. All settings are optional.',
    },
    {
      number: '3',
      title: 'One-Click Activation',
      description: 'Click the master toggle or use individual controls. Your screen is ready in seconds.',
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'PresentBuddy',
            applicationCategory: 'UtilityApplication',
            operatingSystem: ['Windows', 'macOS', 'Linux'],
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            description: 'Free, open-source tool to prepare your screen for presentations. Hide desktop icons, minimize windows, change wallpaper, mute audio, and disable notifications with one click.',
            url: 'https://github.com/pkspyder007/presentbuddy',
            author: {
              '@type': 'Person',
              name: 'Praveen',
              url: 'https://github.com/pkspyder007',
            },
            license: 'https://opensource.org/licenses/MIT',
            screenshot: 'https://github.com/pkspyder007/presentbuddy/website/public/screenshot.png',
            featureList: [
              'Hide Desktop Icons',
              'Minimize All Windows',
              'Change Wallpaper',
              'Mute System Audio',
              'Disable Notifications',
              'One-Click Toggle',
              'Auto-Restore Settings',
            ],
          }),
        }}
      />
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="container mx-auto px-6 md:px-8">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full mb-8 text-sm font-medium text-gray-700">
              <Zap className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Free & Open Source</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-gray-950 tracking-tight mb-6 leading-tight">
              Prepare Your Screen for
              <br />
              Professional Presentations
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto leading-relaxed">
              PresentBuddy is a free, open-source tool that helps you prepare your screen for presentations. 
              Hide desktop icons, minimize windows, change wallpaper, mute audio, 
              and disable notifications—all with one click.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
              <Button 
                size="lg" 
                className="w-full sm:w-auto"
                asChild
              >
                <a 
                  href="https://github.com/pkspyder007/presentbuddy/actions/runs/19802763954/artifacts/4717926343" 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="mr-2 w-4 h-4" />
                  Download for macOS
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto"
                asChild
              >
                <a 
                  href="https://github.com/pkspyder007/presentbuddy" 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="mr-2 w-4 h-4" />
                  View on GitHub
                </a>
              </Button>
            </div>

            {/* Download Info */}
            <div className="mb-8">
              <p className="text-sm text-gray-500 mb-4">
                Click "Download for macOS" to view the latest builds. Select the most recent workflow run and download the DMG artifact.
              </p>
              <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                <span className="font-medium">macOS Available Now</span>
                <span className="text-blue-500">•</span>
                <span>Windows & Linux Coming Soon</span>
              </div>
            </div>

            {/* Feature List */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4 flex-shrink-0 text-gray-400" />
                <span>macOS Available</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4 flex-shrink-0 text-gray-400" />
                <span>One-Click Toggle</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4 flex-shrink-0 text-gray-400" />
                <span>Auto-Restore Settings</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4 flex-shrink-0 text-gray-400" />
                <span>100% Free & Open Source</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-6 md:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-medium text-gray-950 mb-3 tracking-tight">
                Everything You Need
              </h2>
              <p className="text-base text-gray-600 max-w-xl mx-auto">
                PresentBuddy gives you complete control over your screen presentation setup.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card key={index} className="h-full border-0 bg-white">
                    <CardHeader className="pb-3 p-6">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5 text-gray-700" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription>{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6 md:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-medium text-gray-950 mb-3 tracking-tight">
                Perfect For
              </h2>
              <p className="text-base text-gray-600 max-w-xl mx-auto">
                Whether you're presenting to clients, teaching students, or hosting webinars.
              </p>
            </div>

            {/* Use Cases List */}
            <div className="space-y-3">
              {useCases.map((useCase, index) => {
                const Icon = useCase.icon
                return (
                  <Card
                    key={index}
                    className="border-0 bg-gray-50 p-6 flex items-start gap-5"
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-gray-700 flex-shrink-0" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-gray-950 mb-1.5">
                        {useCase.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-gray-600 font-normal">
                        {useCase.description}
                      </p>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-6 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-medium text-gray-950 mb-3 tracking-tight">
                How It Works
              </h2>
              <p className="text-base text-gray-600 max-w-xl mx-auto">
                Get started in three simple steps.
              </p>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-gray-950 text-white rounded-lg flex items-center justify-center mx-auto mb-5 font-medium text-lg">
                    {step.number}
                  </div>
                  <h3 className="text-base font-medium text-gray-950 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600 font-normal">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6 md:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center border border-gray-200 bg-white p-12">
              <h2 className="text-3xl md:text-4xl font-medium text-gray-950 mb-4 tracking-tight">
                Ready to Present Like a Pro?
              </h2>
              <p className="text-base text-gray-600 mb-8 leading-relaxed">
                Download PresentBuddy for macOS and transform your screen in seconds. 
                Windows and Linux versions coming soon. No sign-up required. No credit card needed. Just download and go.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto"
                  asChild
                >
                  <a 
                    href="https://github.com/pkspyder007/presentbuddy/actions" 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-2 w-4 h-4" />
                    Download for macOS
                  </a>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  asChild
                >
                  <a 
                    href="https://github.com/pkspyder007/presentbuddy" 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="mr-2 w-4 h-4" />
                    View Source Code
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="container mx-auto px-6 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-base font-medium text-gray-950 mb-1">PresentBuddy</h3>
                <p className="text-sm font-normal text-gray-500">
                  Free, open-source presentation tool
                </p>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-5 text-sm font-normal text-gray-600">
                <a 
                  href="https://github.com/pkspyder007/presentbuddy" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-950 transition-colors"
                >
                  GitHub
                </a>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm font-normal text-gray-500">
              <p>
                Made with ❤️ by{' '}
                <a 
                  href="https://github.com/pkspyder007" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-gray-950 transition-colors underline"
                >
                  Praveen
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
}
