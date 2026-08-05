// Cloudflare Pages Function: dynamic sitemap.xml.
//
// Queries Supabase for every published blog post and emits one <url>
// per post plus the static homepage / blog / contact / about entries.
// Replaces the hand-maintained sitemap.xml so adding a post only
// requires publishing it in the admin — no sitemap edit needed.
//
// SUPABASE_URL and SUPABASE_ANON_KEY are baked in at build time by
// scripts/inject-env.js (see _lib/supabase-config.js). We fall back
// to context.env for environments where the build hasn't run.

import { SUPABASE_URL as BUILT_URL, SUPABASE_ANON_KEY as BUILT_KEY } from './_lib/supabase-config.js';

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Always advertise the canonical host, never the host the request arrived on.
// shalomkarr.pages.dev and every preview deploy run this same Function, and
// emitting their origins would hand Google a parallel set of URLs that
// contradict the <link rel="canonical"> on every page.
const CANONICAL_ORIGIN = 'https://shalomkarr.com';

export async function onRequest(context) {
  const origin = CANONICAL_ORIGIN;
  const today  = new Date().toISOString().slice(0, 10);

  const supaUrl = BUILT_URL || context.env.SUPABASE_URL;
  const supaKey = BUILT_KEY || context.env.SUPABASE_ANON_KEY;

  // Diagnostic state — surfaced as an XML comment in the response so
  // you can view-source the sitemap and see what went wrong without
  // having to read CF logs. Splits "did the build inject?" from
  // "did the runtime env binding work?" so we can tell where the
  // pipeline broke.
  const diag = {
    builtUrl:    !!BUILT_URL,
    builtKey:    !!BUILT_KEY,
    envUrl:      !!context.env.SUPABASE_URL,
    envKey:      !!context.env.SUPABASE_ANON_KEY,
    fetchStatus: null,
    fetchError:  null,
    rowCount:    0,
  };

  let posts = [];
  if (supaUrl && supaKey) {
    try {
      const r = await fetch(
        `${supaUrl}/rest/v1/posts` +
        `?select=slug,created_at&is_published=eq.true&order=created_at.desc`,
        { headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}` } }
      );
      diag.fetchStatus = r.status;
      if (r.ok) {
        posts = await r.json();
        diag.rowCount = Array.isArray(posts) ? posts.length : 0;
      } else {
        diag.fetchError = (await r.text()).slice(0, 300);
      }
    } catch (e) {
      diag.fetchError = String(e).slice(0, 300);
    }
  }

  const entries = [
    { loc: `${origin}/`,              lastmod: today, changefreq: 'monthly', priority: '1.0' },
    { loc: `${origin}/blog/`,         lastmod: today, changefreq: 'daily',   priority: '0.9' },
    { loc: `${origin}/blog/about/`,   lastmod: today, changefreq: 'monthly', priority: '0.7' },
    { loc: `${origin}/blog/contact/`, lastmod: today, changefreq: 'monthly', priority: '0.7' },
    ...posts.map(p => ({
      loc: `${origin}/blog/post/${encodeURIComponent(p.slug)}`,
      lastmod: (p.created_at || today + 'T00:00:00Z').slice(0, 10),
      changefreq: 'monthly',
      priority: '0.8',
    })),
  ];

  // Diagnostic info is exposed via a custom header instead of an XML
  // comment — Google Search Console's sitemap parser is strict about
  // anything sitting between <?xml ?> and the root <urlset>, and a
  // comment there can flip the report to "Sitemap could not be read".
  const diagHeader = `builtUrl=${diag.builtUrl} builtKey=${diag.builtKey} ` +
                     `envUrl=${diag.envUrl} envKey=${diag.envKey} ` +
                     `fetchStatus=${diag.fetchStatus} rowCount=${diag.rowCount}` +
                     (diag.fetchError ? ` fetchError="${diag.fetchError}"` : '');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(e => `  <url>
    <loc>${xmlEscape(e.loc)}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: {
      'Content-Type':  'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      'X-Sitemap-Diag': diagHeader,
    },
  });
}
