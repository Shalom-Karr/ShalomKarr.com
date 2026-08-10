// Cloudflare Pages Function: send the pages.dev project hostname to the
// canonical custom domain.
//
// Both hostnames serve this identical project, so without this every page
// exists at two live URLs. The <link rel="canonical"> tags tell crawlers which
// one counts, but a canonical is a hint — a 301 is an instruction, and it also
// fixes the human case of an old pages.dev link being shared.
//
// This has to live in a Function. Cloudflare's _redirects file cannot match on
// hostname (domain-level redirects are explicitly unsupported), and a Redirect
// Rule cannot be written for pages.dev because that zone is not ours. The
// client-side host bounces elsewhere in this repo only fire after the HTML has
// already been served and only on pages carrying the script; this catches
// everything, including crawlers that never run JS.
//
// Matched exactly rather than by suffix: preview deployments are served at
// <hash>.<project>.pages.dev and must stay reachable for testing.
const PAGES_HOSTNAME   = 'shalomkarr.pages.dev';
const CANONICAL_ORIGIN = 'https://shalomkarr.com';

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // GET/HEAD only. /api/event takes a sendBeacon POST and sets no CORS headers,
  // so redirecting it cross-origin would turn a working ingest into a blocked
  // one — analytics from pages.dev is worth less than a broken endpoint.
  const navigational = request.method === 'GET' || request.method === 'HEAD';

  if (url.hostname === PAGES_HOSTNAME && navigational) {
    return Response.redirect(CANONICAL_ORIGIN + url.pathname + url.search, 301);
  }

  return context.next();
}
