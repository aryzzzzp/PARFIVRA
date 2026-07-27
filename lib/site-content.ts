import { createServerSupabaseClient } from '@/lib/supabase-server'
export { defaultAboutContent, defaultHomeContent } from '@/lib/site-content-defaults'
export type { AboutContent, HomeContent } from '@/lib/site-content-defaults'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function getSiteContent<T extends Record<string, string>>(slug: string, defaults: T): Promise<T> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.from('site_pages').select('content').eq('slug', slug).maybeSingle()
    if (error || !isObject(data?.content)) return defaults
    return Object.keys(defaults).reduce((result, key) => {
      const value = data.content[key]
      result[key as keyof T] = (typeof value === 'string' && value.trim() ? value : defaults[key as keyof T]) as T[keyof T]
      return result
    }, { ...defaults })
  } catch { return defaults }
}

