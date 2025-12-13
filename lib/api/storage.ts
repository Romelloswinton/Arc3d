/**
 * Storage API - File upload helpers for Supabase Storage
 */

import { createClient } from '@/lib/supabase/client'

/**
 * Upload a project thumbnail
 */
export async function uploadProjectThumbnail(
  projectId: string,
  file: File
): Promise<string> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${projectId}.${fileExt}`

  const { error } = await supabase.storage
    .from('project-thumbnails')
    .upload(fileName, file, { upsert: true })

  if (error) throw error

  const { data } = supabase.storage
    .from('project-thumbnails')
    .getPublicUrl(fileName)

  return data.publicUrl
}

/**
 * Upload asset media (thumbnail or preview)
 */
export async function uploadAssetMedia(
  assetId: string,
  file: File,
  type: 'thumbnail' | 'preview'
): Promise<string> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${assetId}-${type}.${fileExt}`

  const { error } = await supabase.storage
    .from('asset-media')
    .upload(fileName, file, { upsert: true })

  if (error) throw error

  const { data } = supabase.storage
    .from('asset-media')
    .getPublicUrl(fileName)

  return data.publicUrl
}

/**
 * Upload a project export
 */
export async function uploadExport(
  projectId: string,
  format: string,
  blob: Blob
): Promise<string> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const timestamp = new Date().getTime()
  const fileName = `${user.id}/${projectId}-${timestamp}.${format}`

  const { error } = await supabase.storage
    .from('exports')
    .upload(fileName, blob)

  if (error) throw error

  // For private bucket, create signed URL
  const { data } = await supabase.storage
    .from('exports')
    .createSignedUrl(fileName, 3600) // 1 hour expiry

  if (!data) throw new Error('Failed to create signed URL')

  return data.signedUrl
}

/**
 * Upload user avatar
 */
export async function uploadAvatar(file: File): Promise<string> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/avatar.${fileExt}`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true })

  if (error) throw error

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  return data.publicUrl
}

/**
 * Generate thumbnail from canvas
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string = 'image/png',
  quality: number = 0.95
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to convert canvas to blob'))
        }
      },
      type,
      quality
    )
  })
}
