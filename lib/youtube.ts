const RE = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/

export function getYouTubeId(url: string): string | null {
  return url.match(RE)?.[1] ?? null
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const id = getYouTubeId(url)
  return id ? `https://www.youtube.com/embed/${id}?rel=0` : null
}

export function getYouTubeThumbnail(url: string): string | null {
  const id = getYouTubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}
