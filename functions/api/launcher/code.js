/**
 * GET /api/launcher/code?device=<id>
 * Admin only (Supabase session + admin_users). Returns the phone's current unlock
 * code and how many seconds it stays valid. Without ?device, lists known phones.
 */
import {
  adminEmail, cleanDevice, codeFor, currentWindow, db, json, WINDOW_SECONDS,
} from '../../_lib/launcher.js';

export async function onRequestGet({ request, env }) {
  if (!env.LAUNCHER_SECRET || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return json({ error: 'Server not configured' }, 500);
  }
  if (!(await adminEmail(env, request))) {
    return json({ error: 'Not authorized' }, 401);
  }

  const url = new URL(request.url);
  const raw = url.searchParams.get('device');

  if (!raw) {
    const res = await db(env, 'launcher_devices?select=device_id,model,label,last_seen&order=last_seen.desc&limit=200');
    return json({ devices: res.ok ? await res.json() : [] });
  }

  const device = cleanDevice(raw);
  if (!device) return json({ error: 'Bad device id' }, 400);

  const now = Date.now();
  const window = currentWindow(now);
  const code = await codeFor(env.LAUNCHER_SECRET, device, window);
  const secondsLeft = WINDOW_SECONDS - Math.floor(now / 1000) % WINDOW_SECONDS;
  return json({ device, code, secondsLeft });
}
