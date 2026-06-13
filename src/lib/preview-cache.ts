import { getDownloadUrl } from '@/services/files';
import type { StorageFile } from '@/types/bucket';
import { isImageFile } from '@/utils/format';

type PreviewEntry = {
  url: string;
  expiresAt: number;
};

const previewCache = new Map<string, PreviewEntry>();
const inflight = new Map<string, Promise<string | null>>();

function cacheKey(bucketName: string, path: string) {
  return `${bucketName}:${path}`;
}

function isFresh(entry: PreviewEntry | undefined) {
  return Boolean(entry && entry.expiresAt > Date.now());
}

export function getCachedPreviewUrl(bucketName: string, path: string) {
  const entry = previewCache.get(cacheKey(bucketName, path));
  return isFresh(entry) ? entry!.url : null;
}

export function setCachedPreviewUrl(
  bucketName: string,
  path: string,
  url: string,
  expiresInSeconds: number,
) {
  const ttlMs = Math.max((expiresInSeconds - 30) * 1000, 60_000);
  previewCache.set(cacheKey(bucketName, path), {
    url,
    expiresAt: Date.now() + ttlMs,
  });
}

export function invalidatePreviewCache(bucketName?: string) {
  if (!bucketName) {
    previewCache.clear();
    inflight.clear();
    return;
  }

  for (const key of previewCache.keys()) {
    if (key.startsWith(`${bucketName}:`)) {
      previewCache.delete(key);
    }
  }

  for (const key of inflight.keys()) {
    if (key.startsWith(`${bucketName}:`)) {
      inflight.delete(key);
    }
  }
}

export async function resolvePreviewUrl(bucketName: string, path: string) {
  const cached = getCachedPreviewUrl(bucketName, path);
  if (cached) return cached;

  const key = cacheKey(bucketName, path);
  const pending = inflight.get(key);
  if (pending) return pending;

  const request = (async () => {
    try {
      const signed = await getDownloadUrl(bucketName, path);
      setCachedPreviewUrl(bucketName, path, signed.url, signed.expires_in);
      return signed.url;
    } catch {
      return null;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, request);
  return request;
}

export async function prefetchImagePreviews(bucketName: string, files: StorageFile[]) {
  const images = files.filter((file) => isImageFile(file.content_type, file.name));
  const batchSize = 4;

  for (let index = 0; index < images.length; index += batchSize) {
    const batch = images.slice(index, index + batchSize);
    await Promise.all(batch.map((file) => resolvePreviewUrl(bucketName, file.name)));
  }
}
