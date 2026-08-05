#!/usr/bin/env node
/**
 * Generate sitemap.xml with static pages and dynamic blog posts from Supabase
 * Usage: node scripts/generate-sitemap.js
 * Requires: SUPABASE_URL and SUPABASE_ANON_KEY environment variables
 */

const fs = require('fs');
const path = require('path');

async function generateSitemap() {
  const baseUrl = 'https://shalomkarr.com';
  const today = new Date().toISOString().split('T')[0];

  // Static pages with priority and change frequency
  const staticPages = [
    { url: '/', changefreq: 'monthly', priority: '1.0', lastmod: today },
    { url: '/blog/', changefreq: 'daily', priority: '0.9', lastmod: today },
    { url: '/blog/about/', changefreq: 'monthly', priority: '0.7', lastmod: today },
    { url: '/blog/contact/', changefreq: 'monthly', priority: '0.7', lastmod: today },
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add static pages
  staticPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
    xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  // Fetch and add blog posts if Supabase credentials are available
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      );

      const { data: posts, error } = await supabase
        .from('posts')
        .select('slug, updated_at, created_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (!error && posts) {
        posts.forEach(post => {
          const lastmod = post.updated_at || post.created_at;
          const formattedDate = new Date(lastmod).toISOString().split('T')[0];

          // Clean path, not ?slug= — this has to match the canonical each
          // post declares, or the sitemap advertises a duplicate of itself.
          xml += '  <url>\n';
          xml += `    <loc>${baseUrl}/blog/post/${encodeURIComponent(post.slug)}</loc>\n`;
          xml += `    <lastmod>${formattedDate}</lastmod>\n`;
          xml += `    <changefreq>monthly</changefreq>\n`;
          xml += `    <priority>0.8</priority>\n`;
          xml += '  </url>\n';
        });
        console.log(`Added ${posts.length} blog posts to sitemap`);
      } else if (error) {
        console.error('Error fetching posts:', error);
      }
    } catch (e) {
      console.error('Error connecting to Supabase:', e);
      console.log('Continuing with static pages only...');
    }
  } else {
    console.log('Supabase credentials not found, generating sitemap with static pages only');
  }

  xml += '</urlset>\n';

  // Write to sitemap.xml
  const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml, 'utf8');
  console.log(`Sitemap generated successfully at ${sitemapPath}`);
}

generateSitemap().catch(console.error);
