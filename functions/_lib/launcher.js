/**
 * Shared helpers for the flip-phone launcher unlock codes.
 *
 * A code is 8 digits derived from HMAC-SHA256(LAUNCHER_SECRET, "<device>:<window>"),
 * where window = 10-minute slot. It differs per phone and per window, and only the
 * server (holding LAUNCHER_SECRET) can produce it. The phone never sees the secret;
 * it asks /api/launcher/verify whether what the user typed is right.
 *
 * Requires encrypted Pages environment variables:
 *   LAUNCHER_SECRET            long random string
 *   SUPABASE_SERVICE_ROLE_KEY  (already used by /api/event)
 */

export const SUPABASE_URL = 'https://qvoxpfigbukidlmshiei.supabase.co';
export const WINDOW_SECONDS = 600;
export const MAX_FAILS = 5;            // wrong codes per device...
export const FAIL_WINDOW_MINUTES = 15; // ...within this many minutes before lockout

const enc = new TextEncoder();

export function cleanDevice(id) {
  return typeof id === 'string' && /^[A-Za-z0-9_-]{4,64}$/.test(id) ? id : null;
}

async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(msg)));
}

export function currentWindow(now = Date.now()) {
  return Math.floor(now / 1000 / WINDOW_SECONDS);
}

export async function codeFor(secret, device, window) {
  const mac = await hmac(secret, `${device}:${window}`);
  // Dynamic truncation (as in TOTP) to a 31-bit int, then 8 digits.
  const off = mac[mac.length - 1] & 0x0f;
  const bin = ((mac[off] & 0x7f) << 24) | (mac[off + 1] << 16) | (mac[off + 2] << 8) | mac[off + 3];
  return String(bin % 100000000).padStart(8, '0');
}

/** Constant-time string compare. */
export function sameCode(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra },
  });
}

/** Supabase REST call with the service role (server side only). */
export async function db(env, path, init = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

/**
 * Resolves the caller's Supabase session token to a user, then checks the
 * admin_users table (same rule as admin.js). Returns the email or null.
 */
export async function adminEmail(env, request) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return null;

  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const user = await res.json();
  if (!user?.email) return null;

  const q = await db(env, `admin_users?select=email&email=eq.${encodeURIComponent(user.email)}&limit=1`);
  if (!q.ok) return null;
  const rows = await q.json();
  return rows.length ? user.email : null;
}
