import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | number) {
  return format(new Date(date), "yyyy/MM/dd")
}

export function formatDateTime(date: Date | string | number) {
  return format(new Date(date), "yyyy/MM/dd HH:mm:ss")
}

export function getEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // Handle standard YouTube watch URL
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  if (youtubeMatch && youtubeMatch[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Handle already embedded YouTube URL
  if (url.includes('youtube.com/embed/')) {
    return url;
  }

  // Handle Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Handle already embedded Vimeo
  if (url.includes('player.vimeo.com/video/')) {
    return url;
  }

  // Handle Streamable
  const streamableMatch = url.match(/streamable\.com\/([a-zA-Z0-9]+)/);
  if (streamableMatch && streamableMatch[1]) {
    return `https://streamable.com/e/${streamableMatch[1]}`;
  }

  // Handle already embedded Streamable
  if (url.includes('streamable.com/e/')) {
    return url;
  }

  return url;
}
