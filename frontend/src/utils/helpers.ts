import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO } from 'date-fns'

// TailwindCSS class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format dates
export function formatDate(dateString: string, pattern = 'MMM dd, yyyy'): string {
  try {
    return format(parseISO(dateString), pattern)
  } catch {
    return dateString
  }
}

export function timeAgo(dateString: string): string {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true })
  } catch {
    return dateString
  }
}

// Format duration in seconds to mm:ss
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Score to color
export function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-amber-400'
  if (score >= 40) return 'text-orange-400'
  return 'text-red-400'
}

export function scoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500/15 border-emerald-500/20'
  if (score >= 60) return 'bg-amber-500/15 border-amber-500/20'
  if (score >= 40) return 'bg-orange-500/15 border-orange-500/20'
  return 'bg-red-500/15 border-red-500/20'
}

// Score label
export function scoreLabel(score: number): string {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 55) return 'Average'
  if (score >= 40) return 'Needs Work'
  return 'Poor'
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// File size formatter
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Random between
export function randBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Debounce
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// Download blob as file
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
