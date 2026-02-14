// Centralized TypeScript types for API responses
// These match the Laravel API structure

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  posts_count?: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  posts_count?: number;
}

export interface Media {
  id: number;
  url: string;
  thumbnail_url?: string;
  alt?: string;
  type: 'image' | 'video' | 'document';
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  status?: 'draft' | 'pending' | 'published' | 'archived';
  excerpt?: string | null;
  content_html?: string | null;
  content_markdown?: string | null;
  published_at?: string | null;
  cover_image?: Media | null;
  categories?: Category[];
  tags?: Tag[];
  gallery?: Media[];
  reading_time?: number;
  is_slide?: boolean;
  is_important?: boolean;
  views_count?: number;
  unique_views_count?: number;
}

export interface PresidentMessage {
  id: number;
  title: string;
  intro?: string | null;
  content: string;
  president_name: string;
  president_title?: string | null;
  mandate_period?: string | null;
  photo?: Media | null;
  is_active: boolean;
}

export interface DocumentCategory {
  id: number;
  name: string;
  slug: string;
  documents_count?: number;
}

export interface Document {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  file_url?: string | null;
  file_size?: number | null;
  file_type?: string | null;
  category?: DocumentCategory | null;
  is_important?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Etablissement {
  id: number;
  name: string;
  slug: string;
  short_name?: string | null;
  description?: string | null;
  logo_url?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  dean_name?: string | null;
  dean_title?: string | null;
}

export interface Partner {
  id: number;
  name: string;
  logo_url?: string | null;
  website_url?: string | null;
  description?: string | null;
  type?: 'national' | 'international';
  is_active: boolean;
}

export interface Project {
  id: number;
  slug: string;
  kicker?: string | null;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  meta?: Record<string, unknown> | null;
  hero_image_id?: number | null;
  hero_image_url?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Event {
  id: number;
  title: string;
  description?: string | null;
  start_date: string;
  end_date?: string | null;
  location?: string | null;
  is_featured?: boolean;
}

export interface Announcement {
  id: number;
  title: string;
  content?: string | null;
  priority: 'low' | 'medium' | 'high';
  is_active: boolean;
  link_url?: string | null;
  created_at: string;
  expires_at?: string | null;
}

// API Response wrappers
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links?: {
    first?: string;
    last?: string;
    prev?: string | null;
    next?: string | null;
  };
}

export interface SingleResponse<T> {
  data: T;
}

// Page props types
export interface NewsPageProps {
  posts: Post[];
  categories: Category[];
  tags: Tag[];
  announcements: Announcement[];
  events: Event[];
  pagination: PaginatedResponse<Post>['meta'];
}

export interface DocumentsPageProps {
  documents: Document[];
  categories: DocumentCategory[];
  pagination: PaginatedResponse<Document>['meta'];
}

export interface SiteSettings {
  site_name: string;
  site_description: string;
  site_keywords: string;
  site_email: string;
  site_phone: string;
  site_address: string;
  logo_url?: string | null;
  favicon_url?: string | null;
  about_video_url?: string | null;
  about_video_poster_url?: string | null;
  social: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
}
