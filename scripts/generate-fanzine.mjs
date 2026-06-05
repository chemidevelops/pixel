import puppeteer from 'puppeteer';
import matter from 'gray-matter';
import { marked } from 'marked';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const ISSUE = 1;

// ── Helpers ──────────────────────────────────────────────────────────────────

function img64(filename) {
  const path = resolve(root, 'public/images', filename);
  if (!existsSync(path)) return null;
  const ext = filename.split('.').pop().toLowerCase();
  const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
             : ext === 'png' ? 'image/png' : 'image/webp';
  return `data:${mime};base64,${readFileSync(path).toString('base64')}`;
}

function cover64(filename) {
  const path = resolve(root, 'public/covers', filename);
  if (!existsSync(path)) return null;
  const ext = filename.split('.').pop().toLowerCase();
  const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
  return `data:${mime};base64,${readFileSync(path).toString('base64')}`;
}

function getGalleryImages(galleryField) {
  if (!galleryField) return [];
  return galleryField
    .map(g => typeof g === 'string' ? g : g.src)
    .filter(Boolean)
    .map(src => src.replace('/images/', ''))
    .map(img64)
    .filter(Boolean);
}

function stripMdx(content) {
  return content
    .replace(/^import\s.+$/gm, '')
    .replace(/<Gallery[\s\S]*?\/>/g, '')
    .trim();
}

function mdToHtml(md) {
  let html = marked.parse(md);
  // blockquote → pullquote
  html = html.replace(/<blockquote>\s*<p>([\s\S]*?)<\/p>\s*<\/blockquote>/g,
    '<div class="pullquote"><p>$1</p></div>');
  // strip links — keep text, remove <a> tags
  html = html.replace(/<a[^>]*>([\s\S]*?)<\/a>/g, '$1');
  return html;
}

// ── Cargar artículos ──────────────────────────────────────────────────────────

const postDir = resolve(root, 'src/content/posts');
const issue = JSON.parse(readFileSync(resolve(root, 'src/content/issues/1.json'), 'utf8'));

const articles = readdirSync(postDir)
  .filter(f => f.endsWith('.mdx'))
  .map(f => {
    const raw = readFileSync(resolve(postDir, f), 'utf8');
    const { data, content } = matter(raw);
    return { ...data, content: stripMdx(content), file: f };
  })
  .filter(a => a.issue === ISSUE)
  .sort((a, b) => new Date(a.date) - new Date(b.date));

console.log(`Generando nº${ISSUE} con ${articles.length} artículos...`);
articles.forEach(a => console.log(`  + ${a.title}`));

// ── Portadas ──────────────────────────────────────────────────────────────────

const frontCover = cover64('numero-1-front.png') || cover64('numero-1.jpg') || cover64('numero-1.png');
const backCover  = cover64('numero-1-back.png');

const coverFrontHtml = frontCover ? `
<div class="cover-page">
  <img src="${frontCover}" style="width:100%;height:100%;object-fit:cover;display:block;">
</div>` : `
<div class="cover-page" style="background:#111;display:flex;align-items:center;justify-content:center;">
  <div style="color:#fff;font-family:'Oswald',sans-serif;font-size:60pt;text-align:center;">PIXEL<br><span style="font-size:20pt;">Nº1</span></div>
</div>`;

const coverBackHtml = backCover ? `
<div class="cover-page">
  <img src="${backCover}" style="width:100%;height:100%;object-fit:cover;display:block;">
</div>` : `
<div class="cover-page" style="background:#111;"></div>`;

// ── TOC ───────────────────────────────────────────────────────────────────────

const tocHtml = `
<div class="plain-page">
  <div class="plain-inner">
    <div class="page-label">ÍNDICE</div>
    <div class="label-rule"></div>
    <div class="toc-list">
      ${articles.map((a, i) => `
        <div class="toc-item">
          <span class="toc-num">${String(i+1).padStart(2,'0')}</span>
          <span class="toc-title">${a.title}</span>
          <span class="toc-tags">${(a.tags||[]).slice(0,2).join(' · ')}</span>
        </div>`).join('')}
    </div>
  </div>
</div>`;

// ── Editorial ────────────────────────────────────────────────────────────────

const editorialHtml = `
<div class="plain-page">
  <div class="plain-inner">
    <div class="page-label">EDITORIAL</div>
    <div class="label-rule"></div>
    <div class="editorial-text">
      ${issue.editorial.split('\n\n').map(p => `<p>${p}</p>`).join('')}
    </div>
  </div>
</div>`;

// ── Artículos ────────────────────────────────────────────────────────────────

function articleHtml(a, idx) {
  const imgs = getGalleryImages(a.gallery);
  const bodyHtml = mdToHtml(a.content);
  const tags = (a.tags || []).join(' · ').toUpperCase();

  // Inyectar imágenes en el flujo del body
  // Dividimos el HTML en párrafos y metemos imágenes cada ~1/3 y ~2/3
  const parts = bodyHtml.split(/(?=<h[12])|(?<=<\/p>)/).filter(p => p.trim());
  const n = parts.length;
  const injected = [...parts];
  if (imgs[0] && n > 3) {
    const pos = Math.floor(n / 3);
    injected.splice(pos, 0, `<figure class="inline-fig"><img src="${imgs[0]}"><figcaption>${a.title} — gameplay</figcaption></figure>`);
  }
  if (imgs[1] && n > 5) {
    const pos = Math.floor((2 * n) / 3) + 1;
    injected.splice(pos, 0, `<figure class="inline-fig fig-rot"><img src="${imgs[1]}"><figcaption>${a.title} — gameplay</figcaption></figure>`);
  }

  const num = String(idx + 1).padStart(2, '0');

  return `
<div class="article">
  <!-- apertura -->
  <div class="art-header">
    <div class="art-header-meta">
      <span class="art-num">${num}</span>
      <span class="art-tags">${tags}</span>
      <span class="art-pixel">PIXEL — Nº${ISSUE}</span>
    </div>
    <h1 class="art-title">${a.title.toUpperCase()}</h1>
    ${a.excerpt ? `<p class="art-excerpt">${a.excerpt}</p>` : ''}
  </div>
  <!-- contenido en columnas -->
  <div class="art-body">
    ${injected.join('')}
    <div class="art-end">★</div>
  </div>
</div>`;
}

const articlesHtml = articles.map((a, i) => articleHtml(a, i)).join('\n');

// ── Colofón ───────────────────────────────────────────────────────────────────

const colophonHtml = `
<div class="colophon">
  <strong>PIXEL</strong> — Nº${ISSUE} — ${issue.date}<br>
  Revista independiente de videojuegos.<br>
  Hecha con tiempo libre y opiniones propias.
</div>`;

// ── CSS ───────────────────────────────────────────────────────────────────────

const css = `
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400;1,700&family=JetBrains+Mono:wght@400;700&display=swap');

*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

@page { size: A5; }

body {
  font-family: 'Lora', Georgia, serif;
  font-size: 10pt;
  line-height: 1.55;
  color: #000;
  background: #fff;
}

/* ── PORTADAS ── */
.cover-page {
  width: 148mm;
  height: 210mm;
  break-after: page;
  position: relative;
  overflow: hidden;
  margin: -20mm -14mm -18mm -16mm;
}

/* Links: sin decoración en el PDF */
a { color: inherit !important; text-decoration: none !important; }
a::after { content: none !important; }

/* ── PÁGINAS PLANAS (TOC, EDITORIAL) ── */
.plain-page {
  width: 148mm;
  height: 210mm;
  break-after: page;
  position: relative;
}
.plain-inner {
  position: absolute;
  inset: 18mm 14mm 16mm 16mm;
}
.page-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8pt;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-bottom: 3mm;
}
.label-rule {
  border-top: 1.5pt solid #000;
  margin-bottom: 5mm;
}

/* TOC */
.toc-list { display: flex; flex-direction: column; }
.toc-item {
  padding: 8pt 0;
  border-bottom: 0.5pt dotted #999;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 6pt;
}
.toc-title { font-size: 11pt; font-weight: 700; line-height: 1.3; flex: 1; }
.toc-tags {
  font-family: 'JetBrains Mono', monospace;
  font-size: 6.5pt;
  letter-spacing: 0.06em;
  color: #666;
  text-transform: uppercase;
  flex-shrink: 0;
}

/* Editorial */
.editorial-text p { margin-top: 9pt; font-size: 10.5pt; line-height: 1.65; }
.editorial-text p:first-child { margin-top: 0; }

/* ── ARTÍCULOS ── */
.article { break-before: page; }

/* Cabecera */
.art-header {
  padding-bottom: 4mm;
}
.art-header-meta {
  font-family: 'JetBrains Mono', monospace;
  font-size: 6.5pt;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #666;
  margin-bottom: 3mm;
  display: flex;
  justify-content: space-between;
}
.art-title {
  font-family: 'Lora', serif;
  font-size: 22pt;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 3mm;
  break-after: avoid;
}
.art-excerpt {
  font-size: 9.5pt;
  line-height: 1.5;
  font-style: italic;
  color: #333;
  border-left: 2pt solid #000;
  padding-left: 6pt;
  margin-bottom: 1mm;
}
.art-rule {
  border-top: 1.5pt solid #000;
  margin: 0 14mm 0 16mm;
}

/* Cuerpo: columnas */
.art-body {
  column-count: 2;
  column-gap: 5mm;
  column-rule: 0.4pt solid #bbb;
  column-fill: auto;
  padding-top: 5mm;
}

.art-body h2 {
  font-family: 'JetBrains Mono', monospace;
  font-size: 7pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  border-bottom: 1pt solid #000;
  padding-bottom: 2pt;
  margin-top: 13pt;
  margin-bottom: 5pt;
  break-after: avoid;
}
.art-body h2:first-child { margin-top: 0; }

.art-body p {
  margin-top: 6pt;
  text-align: justify;
  hyphens: auto;
  orphans: 3;
  widows: 3;
}

/* drop cap */
.art-body > p:first-of-type::first-letter {
  font-size: 3.2em;
  font-weight: 700;
  float: left;
  line-height: 0.78;
  margin-right: 3pt;
  margin-top: 2pt;
}

/* Pullquote */
.pullquote {
  border-left: 2pt solid #000;
  padding: 4pt 8pt;
  margin: 10pt 0;
  break-inside: avoid;
}
.pullquote p {
  font-size: 10.5pt;
  font-weight: 700;
  font-style: italic;
  text-align: left !important;
  line-height: 1.4;
  margin-top: 0 !important;
}

/* Imágenes */
.inline-fig {
  break-inside: avoid;
  break-before: avoid;
  margin: 8pt 0 4pt 0;
}
.inline-fig img {
  width: 100%;
  display: block;
  filter: grayscale(100%) contrast(1.3);
}
.inline-fig figcaption {
  font-family: 'JetBrains Mono', monospace;
  font-size: 6pt;
  color: #555;
  border-top: 0.5pt solid #bbb;
  padding-top: 2pt;
  margin-top: 3pt;
}

/* Fin artículo */
.art-end {
  column-span: all;
  text-align: center;
  font-size: 10pt;
  color: #bbb;
  margin-top: 14pt;
  padding-top: 8pt;
  border-top: 0.5pt dashed #ccc;
}

/* Colofón */
.colophon {
  column-span: all;
  margin-top: 24pt;
  padding-top: 8pt;
  border-top: 2pt solid #000;
  font-family: 'JetBrains Mono', monospace;
  font-size: 7pt;
  color: #555;
  line-height: 1.8;
}
`;

// ── HTML completo ─────────────────────────────────────────────────────────────

const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<style>${css}</style>
</head>
<body>
${coverFrontHtml}
${tocHtml}
${editorialHtml}
<div style="padding: 0 12mm 0 14mm;">
${articlesHtml}
${colophonHtml}
</div>
${coverBackHtml}
</body>
</html>`;

// ── Generar PDF ───────────────────────────────────────────────────────────────

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

const outPath = resolve(root, 'public/pdfs/numero-1.pdf');
await page.pdf({
  path: outPath,
  format: 'A5',
  printBackground: true,
  margin: { top: '20mm', right: '14mm', bottom: '18mm', left: '16mm' },
});

await browser.close();
console.log(`✓ PDF A5 generado: ${outPath}`);

// ── PDFs A4 horizontal ────────────────────────────────────────────────────
import { execSync } from 'child_process';
const imposePy = resolve(__dirname, 'impose.py');
const spreadsPath = resolve(root, 'public/pdfs/numero-1-spreads.pdf');
const printPath   = resolve(root, 'public/pdfs/numero-1-print.pdf');

try {
  execSync(`python3 "${imposePy}" --spreads "${outPath}" "${spreadsPath}"`);
  console.log(`✓ PDF A4 lectura generado: ${spreadsPath}`);
} catch (e) {
  console.error('Error en spreads:', e.message);
}

try {
  execSync(`python3 "${imposePy}" "${outPath}" "${printPath}"`);
  console.log(`✓ PDF A4 impresión generado: ${printPath}`);
} catch (e) {
  console.error('Error en imposición:', e.message);
}
