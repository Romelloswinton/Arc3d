/**
 * Settings Page
 */

'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings as SettingsIcon, User, Bell, Shield, Palette } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-text-secondary">
            Manage your account preferences and application settings
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Account Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold">Account</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-border rounded-md bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue={user?.user_metadata?.full_name || ''}
                  className="w-full px-4 py-2 border border-border rounded-md bg-background"
                />
              </div>
              <Button>Save Changes</Button>
            </div>
          </Card>

          {/* Notifications */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold">Notifications</h2>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm">Email notifications for project updates</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-sm">Marketing emails</span>
              </label>
            </div>
          </Card>

          {/* Appearance */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold">Appearance</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">Theme</label>
                <select className="w-full px-4 py-2 border border-border rounded-md bg-background">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>System</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Privacy & Security */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold">Privacy & Security</h2>
            </div>
            <div className="space-y-3">
              <Button variant="outline">Change Password</Button>
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                Delete Account
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
