import { ApiError } from '@/lib/api-error';
import { signOutEverywhere } from '@/lib/sign-out';

type SignOutHandler = () => void | Promise<void>;

let signOutHandler: SignOutHandler | null = null;
let unauthorizedHandled = false;

export function resetUnauthorizedGuard() {
  unauthorizedHandled = false;
}

export function registerAuthSignOutHandler(handler: SignOutHandler) {
  signOutHandler = handler;
  unauthorizedHandled = false;
  return () => {
    if (signOutHandler === handler) {
      signOutHandler = null;
    }
  };
}

export async function handleUnauthorized() {
  if (unauthorizedHandled) return;
  unauthorizedHandled = true;

  try {
    if (signOutHandler) {
      await signOutHandler();
      return;
    }

    await signOutEverywhere();
  } finally {
    setTimeout(() => {
      unauthorizedHandled = false;
    }, 1000);
  }
}

export function isUnauthorizedError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}
