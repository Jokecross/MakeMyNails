import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Transforms a Supabase Storage URL to use the image render endpoint
 * which serves a resized and compressed version for fast display.
 * Falls back to the original URL for non-Supabase URLs.
 */
export function optimizeImageUrl(url, width = 600, quality = 80) {
  if (!url) return url
  if (!url.includes('/storage/v1/object/public/')) return url
  return url
    .replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')
    + `?width=${width}&quality=${quality}&resize=contain`
}
