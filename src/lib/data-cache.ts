import type { StorageFile } from '@/types/bucket';

const CACHE_TTL_MS = 30_000;

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

type BucketListItem = {
  name: string;
  display_name: string;
  public: boolean;
  file_size_limit: number | null;
  allowed_mime_types: string[] | null;
  created_at: string;
  updated_at: string;
  file_count?: number | null;
  fileCount?: number;
};

let bucketsCache: CacheEntry<BucketListItem[]> | null = null;
const filesCache = new Map<string, CacheEntry<StorageFile[]>>();

function isFresh<T>(entry: CacheEntry<T> | null | undefined) {
  return Boolean(entry && entry.expiresAt > Date.now());
}

export function getCachedBuckets() {
  return isFresh(bucketsCache) ? bucketsCache!.data : null;
}

export function setCachedBuckets(data: BucketListItem[]) {
  bucketsCache = {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };
}

export function invalidateBucketsCache() {
  bucketsCache = null;
}

export function getCachedFiles(bucketName: string) {
  const entry = filesCache.get(bucketName);
  return isFresh(entry) ? entry!.data : null;
}

export function setCachedFiles(bucketName: string, data: StorageFile[]) {
  filesCache.set(bucketName, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export function invalidateFilesCache(bucketName?: string) {
  if (bucketName) {
    filesCache.delete(bucketName);
    return;
  }
  filesCache.clear();
}
