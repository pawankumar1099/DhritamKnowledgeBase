export type DhritamCategory =
  | 'all'
  | 'hardware'
  | 'strategy'
  | 'product'
  | 'clinical'
  | 'regulatory'
  | 'brand'
  | 'operations';

export type ClassificationLevel = 'confidential' | 'internal' | 'public';

export type FileFormatType =
  | 'pdf'
  | 'docx'
  | 'doc'
  | 'markdown'
  | 'text'
  | 'image'
  | 'spreadsheet'
  | 'code'
  | 'audio'
  | 'video'
  | 'archive'
  | 'other';

export interface KnowledgeDocument {
  id: string;
  title: string;
  originalFileName: string;
  fileSize: number; // in bytes
  fileType: string; // MIME type
  format: FileFormatType;
  category: Exclude<DhritamCategory, 'all'>;
  topicTags: string[];
  author: string;
  authorRole?: string;
  classification: ClassificationLevel;
  version: string;
  description: string;
  contentSnippet?: string;
  textContent?: string;
  fileDataUrl?: string; // base64 or blob or remote firebase url
  storagePath?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  viewCount: number;
  downloadCount: number;
  starred?: boolean;
  syncedToFirebase?: boolean;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface CategoryMeta {
  id: DhritamCategory;
  name: string;
  description: string;
  icon: string;
  accentColor: string;
}

export type SortOption =
  | 'latest'
  | 'oldest'
  | 'name-asc'
  | 'name-desc'
  | 'size-desc'
  | 'size-asc'
  | 'views';
