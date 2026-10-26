import { ClassificationLevel, FileFormatType } from '@/types/knowledgeBase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Recently';
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 30) return formatDate(dateString);
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMin > 0) return `${diffMin}m ago`;
    return 'Just now';
  } catch {
    return 'Recently';
  }
}

export function detectFileFormat(fileName: string, mimeType?: string): FileFormatType {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  if (ext === 'pdf' || mimeType?.includes('pdf')) return 'pdf';
  if (['docx'].includes(ext) || mimeType?.includes('wordprocessingml')) return 'docx';
  if (['doc'].includes(ext) || mimeType?.includes('msword')) return 'doc';
  if (['md', 'markdown'].includes(ext)) return 'markdown';
  if (['txt', 'log', 'rtf'].includes(ext) || mimeType?.startsWith('text/plain')) return 'text';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'avif'].includes(ext) || mimeType?.startsWith('image/'))
    return 'image';
  if (['csv', 'xlsx', 'xls', 'tsv'].includes(ext) || mimeType?.includes('spreadsheet') || mimeType?.includes('excel'))
    return 'spreadsheet';
  if (['js', 'jsx', 'ts', 'tsx', 'json', 'py', 'c', 'cpp', 'h', 'html', 'css', 'go', 'rs', 'sh'].includes(ext))
    return 'code';
  if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext) || mimeType?.startsWith('audio/')) return 'audio';
  if (['mp4', 'mov', 'webm', 'avi', 'mkv'].includes(ext) || mimeType?.startsWith('video/')) return 'video';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archive';

  return 'other';
}

export function getClassificationMeta(level?: ClassificationLevel | string) {
  const norm = level ? String(level).toLowerCase().trim() : 'internal';
  switch (norm) {
    case 'confidential':
      return {
        label: 'Confidential',
        bg: 'bg-red-50 text-red-700 border-red-200',
        dot: 'bg-red-500',
        badge: 'CONFIDENTIAL // RESTRICTED',
      };
    case 'public':
      return {
        label: 'Public Document',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        badge: 'PUBLIC // DISTRIBUTABLE',
      };
    case 'internal':
    default:
      return {
        label: 'Internal Reference',
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-[#0070f3]',
        badge: 'INTERNAL // TEAM ONLY',
      };
  }
}

export function getFormatIconBadge(format: FileFormatType) {
  switch (format) {
    case 'pdf':
      return { label: 'PDF', bg: 'bg-[#ee0000]/10 text-[#ee0000] border-[#ee0000]/20' };
    case 'docx':
    case 'doc':
      return { label: 'DOCX', bg: 'bg-[#0070f3]/10 text-[#0070f3] border-[#0070f3]/20' };
    case 'markdown':
      return { label: 'MD', bg: 'bg-neutral-100 text-neutral-800 border-neutral-300' };
    case 'text':
      return { label: 'TXT', bg: 'bg-neutral-100 text-neutral-700 border-neutral-300' };
    case 'image':
      return { label: 'IMG', bg: 'bg-[#7928ca]/10 text-[#7928ca] border-[#7928ca]/20' };
    case 'spreadsheet':
      return { label: 'DATA', bg: 'bg-[#50e3c2]/20 text-emerald-800 border-[#50e3c2]/40' };
    case 'code':
      return { label: 'CODE', bg: 'bg-neutral-900 text-neutral-100 border-neutral-800' };
    case 'audio':
      return { label: 'AUDIO', bg: 'bg-[#eb367f]/10 text-[#eb367f] border-[#eb367f]/20' };
    case 'video':
      return { label: 'VIDEO', bg: 'bg-[#f5a623]/15 text-[#ab570a] border-[#f5a623]/30' };
    case 'archive':
      return { label: 'ZIP', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
    default:
      return { label: 'FILE', bg: 'bg-neutral-100 text-neutral-700 border-neutral-200' };
  }
}
