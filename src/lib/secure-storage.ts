import * as SecureStore from 'expo-secure-store';

const MAX_SECURE_STORE_BYTES = 1800;

async function clearSecureItem(key: string) {
  await SecureStore.deleteItemAsync(key).catch(() => undefined);

  const meta = await SecureStore.getItemAsync(`${key}__meta`);
  if (!meta) return;

  const chunkCount = Number(meta);
  await SecureStore.deleteItemAsync(`${key}__meta`).catch(() => undefined);

  for (let i = 0; i < chunkCount; i++) {
    await SecureStore.deleteItemAsync(`${key}__${i}`).catch(() => undefined);
  }
}

export async function setSecureItem(key: string, value: string) {
  await clearSecureItem(key);

  if (value.length <= MAX_SECURE_STORE_BYTES) {
    await SecureStore.setItemAsync(key, value);
    return;
  }

  const chunkCount = Math.ceil(value.length / MAX_SECURE_STORE_BYTES);
  await SecureStore.setItemAsync(`${key}__meta`, String(chunkCount));

  for (let i = 0; i < chunkCount; i++) {
    const chunk = value.slice(i * MAX_SECURE_STORE_BYTES, (i + 1) * MAX_SECURE_STORE_BYTES);
    await SecureStore.setItemAsync(`${key}__${i}`, chunk);
  }
}

export async function getSecureItem(key: string) {
  const direct = await SecureStore.getItemAsync(key);
  if (direct) return direct;

  const meta = await SecureStore.getItemAsync(`${key}__meta`);
  if (!meta) return null;

  const chunkCount = Number(meta);
  if (!Number.isFinite(chunkCount) || chunkCount <= 0) return null;

  let value = '';
  for (let i = 0; i < chunkCount; i++) {
    const chunk = await SecureStore.getItemAsync(`${key}__${i}`);
    if (!chunk) return null;
    value += chunk;
  }

  return value;
}

export async function removeSecureItem(key: string) {
  await clearSecureItem(key);
}
