import type { Request } from 'express';

// Private/reserved ranges plus loopback and link-local — ip-api.com always
// returns status:"fail" for these (and every local-dev request is one of
// them), so skip the network call entirely instead of eating the latency
// and logging a confusing failure every time.
const PRIVATE_IPV4 =
  /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.)/;

export function isPrivateOrLocalIp(ip: string): boolean {
  if (!ip) return true;
  const normalized = ip.replace(/^::ffff:/, '');
  if (normalized === '::1' || normalized === '127.0.0.1') return true;
  if (PRIVATE_IPV4.test(normalized)) return true;
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true; // IPv6 ULA
  if (normalized.startsWith('fe80:')) return true; // IPv6 link-local
  return false;
}

/** `req.ip` reflects X-Forwarded-For only once `trust proxy` is set (main.ts) — this app sits behind Render/Cloudflare. */
export function getClientIp(req: Request): string {
  return req.ip ?? req.socket.remoteAddress ?? '';
}
