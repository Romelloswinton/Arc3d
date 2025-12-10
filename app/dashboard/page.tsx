import Link from 'next/link';
import { Palette, Cpu, Award, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-text-secondary text-lg">
            Welcome back! Choose a tool to start creating
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Link href="/dashboard/overlay-builder" className="group">
            <Card className="h-full hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Palette className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Overlay Builder</CardTitle>
                <CardDescription>
                  Design custom overlays with our canvas editor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Open Builder
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/widgets" className="group">
            <Card className="h-full hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-info/10 flex items-center justify-center mb-4 group-hover:bg-info/20 transition-colors">
                  <Cpu className="h-6 w-6 text-info" />
                </div>
                <CardTitle>Widget Library</CardTitle>
                <CardDescription>
                  Browse and customize pre-built widgets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Browse Widgets
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/badges" className="group">
            <Card className="h-full hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center mb-4 group-hover:bg-success/20 transition-colors">
                  <Award className="h-6 w-6 text-success" />
                </div>
                <CardTitle>Badge Designer</CardTitle>
                <CardDescription>
                  Create custom badges for your channel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Design Badges
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* AI Assistant Preview */}
        <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle>AI Assistant</CardTitle>
                  <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">PRO</span>
                </div>
                <CardDescription>
                  Get AI-powered design suggestions and auto-generate overlays
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary mb-4">
              Upgrade to Pro to unlock AI-powered customization tools
            </p>
            <Button>Upgrade to Pro</Button>
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Recent Projects</h2>
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-text-secondary">
                <p>No projects yet</p>
                <p className="text-sm mt-2">Start creating to see your projects here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
