export type Bucket = {
  name: string;
  display_name: string;
  public: boolean;
  file_size_limit: number | null;
  allowed_mime_types: string[] | null;
  created_at: string;
  updated_at: string;
  file_count?: number | null;
};

export type BucketCreatePayload = {
  name: string;
  public?: boolean;
  allowed_mime_types?: string[] | null;
  file_size_limit?: number | null;
};

export type BucketUpdatePayload = {
  public?: boolean;
  allowed_mime_types?: string[] | null;
  file_size_limit?: number | null;
};

export type StorageFile = {
  name: string;
  size: number | null;
  content_type: string | null;
};

export type SignedUrlResponse = {
  url: string;
  token: string | null;
  expires_in: number;
};

export type AuthUserProfile = {
  user_id: string;
  email: string | null;
  role: string;
  provider: string | null;
  is_google_user: boolean;
};

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
] as const;

export const MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024;
