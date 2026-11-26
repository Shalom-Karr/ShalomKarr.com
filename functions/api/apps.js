/**
 * GET /api/apps
 * Returns the list of apps available in the SK-AppStore.
 * Edit the APPS array below to add/remove apps.
 */
import { json } from '../_lib/launcher.js';

const APPS = [
  {
    name: "Zemer",
    package_name: "com.jtech.zemer",
    version: "41",
    apk_url: "https://apps.shalomkarr.com/apks/zemer.apk",
    description: "Jewish Music Player",
  },
];

export function onRequestGet() {
  return json({ apps: APPS });
}
