/**
 * Secure logger utility
 *
 * Masks sensitive data (emails, addresses, user IDs) and limits
 * verbose output in production to prevent information disclosure.
 */

const isDev = process.env.NODE_ENV === 'development';

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '[invalid-email]';
  const [local, domain] = email.split('@');
  return `${local.slice(0, 2)}***@${domain}`;
}

function maskAddress(address: string): string {
  if (!address || address.length < 10) return '[invalid]';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function maskUserId(id: string): string {
  if (!id) return '[no-id]';
  return `${id.slice(0, 8)}...`;
}

export const logger = {
  debug(message: string, data?: unknown) {
    if (isDev) {
      console.log(message, data ?? '');
    }
  },

  info(message: string) {
    console.log(message);
  },

  warn(message: string) {
    console.warn(message);
  },

  error(message: string, error?: unknown) {
    if (isDev) {
      console.error(message, error);
    } else {
      // In production, only log error message, not full stack
      const errorMsg = error instanceof Error ? error.message : String(error ?? '');
      console.error(message, errorMsg);
    }
  },

  // Helpers for safe logging
  maskEmail,
  maskAddress,
  maskUserId,
};
