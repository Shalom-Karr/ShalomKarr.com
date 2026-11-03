/**
 * POST /api/launcher/verify   { device, code, model? }
 * Called by the flip-phone launcher. Answers { ok: true|false }.
 *
 * Accepts the current and previous 10-minute code (so a code read just before a
 * window rolls over still works). Wrong guesses are logged per device; after
 * MAX_FAILS within FAIL_WINDOW_MINUTES the device is locked out until they age out,
 * which makes guessing an 8-digit code impractical.
 */
import {
  cleanDevice, codeFor, currentWindow, db, json, sameCode, MAX_FAILS, FAIL_WINDOW_MINUTES,
} from '../../_lib/launcher.js';

export async function onRequestPost({ request, env }) {
  if (!env.LAUNCHER_SECRET || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return json({ ok: false, error: 'Server not configured' }, 500);
  }

  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'Bad request' }, 400); }

  const device = cleanDevice(body?.device);
  const code = typeof body?.code === 'string' ? body.code.trim() : '';
  if (!device || !/^\d{8}$/.test(code)) return json({ ok: false, error: 'Bad request' }, 400);

  // Remember the phone so the admin page can list it.
  const model = typeof body?.model === 'string' ? body.model.slice(0, 60) : null;
  await db(env, 'launcher_devices?on_conflict=device_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ device_id: device, model, last_seen: new Date().toISOString() }),
  });

  // Lockout check.
  const since = new Date(Date.now() - FAIL_WINDOW_MINUTES * 60000).toISOString();
  const fails = await db(env,
    `launcher_attempts?select=id&device_id=eq.${device}&ok=eq.false&created_at=gte.${encodeURIComponent(since)}`,
    { headers: { Prefer: 'count=exact', Range: '0-0' } });
  const count = parseInt((fails.headers.get('content-range') || '*/0').split('/')[1], 10) || 0;
  if (count >= MAX_FAILS) {
    return json({ ok: false, error: `Too many wrong codes. Try again in ${FAIL_WINDOW_MINUTES} minutes.` }, 429);
  }

  const w = currentWindow();
  const ok = sameCode(code, await codeFor(env.LAUNCHER_SECRET, device, w)) ||
             sameCode(code, await codeFor(env.LAUNCHER_SECRET, device, w - 1));

  const ip = request.headers.get('CF-Connecting-IP');
  await db(env, 'launcher_attempts', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ device_id: device, ok, ip }),
  });

  return json({ ok });
}
