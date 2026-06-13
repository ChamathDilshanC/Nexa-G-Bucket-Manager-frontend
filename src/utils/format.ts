export function formatBytes(bytes: number | null | undefined) {
  if (bytes == null || Number.isNaN(bytes)) return '—';
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;

  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
}

export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getFileName(path: string) {
  const parts = path.split('/');
  return parts[parts.length - 1] || path;
}

export function getFileExtension(path: string) {
  const name = getFileName(path);
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : '';
}

export function getMimeLabel(mime: string | null) {
  if (!mime) return 'File';
  if (mime.startsWith('image/')) return 'Image';
  if (mime === 'application/pdf') return 'PDF';
  return mime.split('/').pop()?.toUpperCase() ?? 'File';
}

export function isImageFile(contentType: string | null, path: string) {
  if (contentType?.startsWith('image/')) return true;
  const ext = getFileExtension(path);
  return ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'webp';
}
