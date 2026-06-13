export function withTimeout<T>(promise: Promise<T>, ms: number, message = 'Request timed out.') {
  return Promise.race<T>([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}
