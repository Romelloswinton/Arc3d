import Link from 'next/link';
import { Sparkles, Palette, Zap, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PricingCard } from '@/components/ui/PricingCard';
import { APP_NAME, APP_TAGLINE, TIERS } from '@/lib/constants';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(145,70,255,0.15),transparent_50%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          {/* Navigation */}
          <nav className="flex items-center justify-between mb-20">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">{APP_NAME}</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="#features">Features</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="#pricing">Pricing</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border-primary text-sm">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-text-secondary">Powered by AI</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary via-primary to-success bg-clip-text text-transparent">
                Ultimate Control
              </span>
              <br />
              Over Your Stream
            </h1>

            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              {APP_TAGLINE}. Design stunning overlays, badges, and widgets with our
              AI-powered platform built for Twitch creators.
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <Button size="lg" asChild>
                <Link href="/dashboard/overlay-builder">
                  <Palette className="mr-2" />
                  Start Creating
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
              <div>
                <div className="text-3xl font-bold text-foreground">1000+</div>
                <div className="text-sm text-text-secondary">Templates</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">50K+</div>
                <div className="text-sm text-text-secondary">Creators</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">100%</div>
                <div className="text-sm text-text-secondary">Customizable</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-text-secondary text-lg">
              Everything you need to create professional stream assets
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-xl border border-border-primary hover:border-primary transition-colors">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Palette className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Canvas Builder</h3>
              <p className="text-text-secondary">
                Drag-and-drop interface with powerful customization tools for overlays and alerts
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border-primary hover:border-primary transition-colors">
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Assistant</h3>
              <p className="text-text-secondary">
                Get smart suggestions and auto-generate designs based on your style preferences
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border-primary hover:border-primary transition-colors">
              <div className="h-12 w-12 rounded-lg bg-info/10 flex items-center justify-center mb-4">
                <Cpu className="h-6 w-6 text-info" />
              </div>
              <h3 className="text-xl font-bold mb-2">Widget Library</h3>
              <p className="text-text-secondary">
                Pre-built widgets for followers, subscribers, donations, and more
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-text-secondary text-lg">
              Start free, upgrade when you need more power
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <PricingCard {...TIERS.FREE} />
            <PricingCard {...TIERS.PRO} isPro />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Stream?</h2>
          <p className="text-text-secondary text-lg mb-8">
            Join thousands of creators using {APP_NAME} to stand out
          </p>
          <Button size="lg" asChild>
            <Link href="/dashboard/overlay-builder">
              Start Building Now
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-primary py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-text-secondary text-sm">
          <p>&copy; 2025 {APP_NAME}. Built for Twitch creators.</p>
        </div>
      </footer>
    </div>
  );
}
