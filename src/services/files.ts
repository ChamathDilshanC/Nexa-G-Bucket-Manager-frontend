import { authFetch } from '@/services/api-client';
import type { SignedUrlResponse, StorageFile } from '@/types/bucket';

export function listFiles(bucketName: string, prefix?: string) {
  const query = prefix ? `?prefix=${encodeURIComponent(prefix)}` : '';
  return authFetch<StorageFile[]>(`/buckets/${encodeURIComponent(bucketName)}/files${query}`);
}

export function deleteFile(bucketName: string, objectPath: string) {
  return authFetch<void>(
    `/buckets/${encodeURIComponent(bucketName)}/files/${encodeURIComponent(objectPath)}`,
    { method: 'DELETE' },
  );
}

export function getUploadUrl(payload: {
  bucket: string;
  path: string;
  content_type: string;
  file_size_bytes?: number;
}) {
  return authFetch<SignedUrlResponse>('/files/upload-url', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getDownloadUrl(bucket: string, path: string) {
  return authFetch<SignedUrlResponse>('/files/download-url', {
    method: 'POST',
    body: JSON.stringify({ bucket, path }),
  });
}

export async function uploadFileToSignedUrl(
  signedUrl: string,
  token: string | null,
  localUri: string,
  contentType: string,
) {
  const fileResponse = await fetch(localUri);
  const blob = await fileResponse.blob();

  const headers: Record<string, string> = {
    'Content-Type': contentType,
    'x-upsert': 'true',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(signedUrl, {
    method: 'PUT',
    headers,
    body: blob,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Upload failed (${response.status})${detail ? `: ${detail.slice(0, 120)}` : ''}.`);
  }
}
