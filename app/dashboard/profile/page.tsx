/**
 * Profile Page
 */

'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useProjects } from '@/lib/hooks/useProjects'
import { useAssets } from '@/lib/hooks/useAssets'
import { Calendar, Mail, Award, FolderOpen, Layers } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const { data: projects } = useProjects()
  const { data: assets } = useAssets()

  const getUserInitials = () => {
    if (!user?.user_metadata?.full_name) return 'U'
    const names = user.user_metadata.full_name.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    }
    return names[0][0].toUpperCase()
  }

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown'

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="p-8 mb-6">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {getUserInitials()}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {user?.user_metadata?.full_name || 'User'}
              </h1>
              <div className="flex items-center gap-4 text-text-secondary">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {joinDate}</span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <Button variant="outline">Edit Profile</Button>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{projects?.length || 0}</div>
                <div className="text-sm text-text-secondary">Projects</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Layers className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{assets?.length || 0}</div>
                <div className="text-sm text-text-secondary">Assets</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">FREE</div>
                <div className="text-sm text-text-secondary">Plan</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {projects?.slice(0, 5).map((project) => (
              <div key={project.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <div className="font-medium">{project.name}</div>
                  <div className="text-sm text-text-secondary">
                    Updated {new Date(project.updated_at).toLocaleDateString()}
                  </div>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </div>
            ))}
            {(!projects || projects.length === 0) && (
              <div className="text-center py-8 text-text-secondary">
                No recent activity
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
