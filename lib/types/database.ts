/**
 * Extended Database Types
 *
 * Extends Supabase generated types with app-specific structures.
 */

import type { Database } from '@/lib/supabase/database.types'
import type { Shape } from './canvas'
import type { Layer } from './layers'

// Project data structure that matches our existing types
export interface ProjectData {
  shapes: Shape[]
  layers: Layer[]
}

// Extended project type with properly typed project_data
export type Project = Omit<Database['public']['Tables']['projects']['Row'], 'project_data'> & {
  project_data: ProjectData
}

export type ProjectInsert = Omit<Database['public']['Tables']['projects']['Insert'], 'project_data'> & {
  project_data?: ProjectData
}

export type ProjectUpdate = Omit<Database['public']['Tables']['projects']['Update'], 'project_data'> & {
  project_data?: ProjectData
}

// Profile types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

// Asset types
export type Asset = Database['public']['Tables']['assets']['Row']
export type AssetInsert = Database['public']['Tables']['assets']['Insert']
export type AssetUpdate = Database['public']['Tables']['assets']['Update']

// Asset category types
export type AssetCategory = Database['public']['Tables']['asset_categories']['Row']

// Project version types
export type ProjectVersion = Omit<Database['public']['Tables']['project_versions']['Row'], 'project_data'> & {
  project_data: ProjectData
}

export type ProjectVersionInsert = Omit<Database['public']['Tables']['project_versions']['Insert'], 'project_data'> & {
  project_data: ProjectData
}
