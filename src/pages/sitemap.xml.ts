import { getCollection } from 'astro:content';

const SITE = 'https://bitmag.es';

export async function GET() {
  const posts = await getCollection('posts');
  const urls: { loc: string; lastmod?: string }[] = [
    { loc: `${SITE}/` },
    { loc: `${SITE}/posts/` },
    { loc: `${SITE}/sobre/` },
    { loc: `${SITE}/descargas/` },
  ];
  for (const post of posts) {
    urls.push({
      loc: `${SITE}/posts/${post.id}/`,
      lastmod: new Date(post.data.date).toISOString().slice(0, 10),
    });
  }
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`,
      )
      .join('\n') +
    `\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
