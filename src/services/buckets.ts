import { authFetch } from '@/services/api-client';
import type { Bucket, BucketCreatePayload, BucketUpdatePayload } from '@/types/bucket';

export function listBuckets() {
  return authFetch<Bucket[]>('/buckets');
}

export function createBucket(payload: BucketCreatePayload) {
  return authFetch<Bucket>('/buckets', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateBucket(bucketName: string, payload: BucketUpdatePayload) {
  return authFetch<Bucket>(`/buckets/${encodeURIComponent(bucketName)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteBucket(bucketName: string, force = false) {
  const query = force ? '?force=true' : '';
  return authFetch<void>(`/buckets/${encodeURIComponent(bucketName)}${query}`, {
    method: 'DELETE',
  });
}
