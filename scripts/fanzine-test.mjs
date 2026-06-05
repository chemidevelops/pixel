import puppeteer from 'puppeteer';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function img64(path) {
  const ext = path.split('.').pop().toLowerCase();
  const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'png' ? 'image/png' : 'image/webp';
  const data = readFileSync(resolve(root, 'public/images', path)).toString('base64');
  return `data:${mime};base64,${data}`;
}

const i1 = img64('mina-1-gameplay.jpg');
const i2 = img64('mina-2-gameplay.jpg');
const i3 = img64('mina-3-gameplay.jpg');
const i4 = img64('mina-4-gameplay.jpg');
const i5 = img64('mina-5-gameplay.jpg');

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Special+Elite&family=Oswald:wght@400;700&family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }
@page { size: A5; margin: 0; }

body {
  font-family: 'Courier Prime', 'Courier New', monospace;
  font-size: 9pt;
  line-height: 1.5;
  color: #000;
  background: #fff;
}

.page {
  width: 148mm;
  height: 210mm;
  position: relative;
  overflow: hidden;
  page-break-after: always;
  background: #fff;
}
.page:last-child { page-break-after: avoid; }

/* ══ PÁGINA 1 ══ */
/* imagen sangre completa fondo */
.p1-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(100%) contrast(1.6) brightness(0.5);
}

/* título ransom note encima */
.p1-title-block {
  position: absolute;
  top: 6mm;
  left: 5mm;
  right: 5mm;
}
.p1-t1 {
  font-family: 'Oswald', sans-serif;
  font-size: 72pt;
  font-weight: 700;
  line-height: 0.85;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: -2pt;
}
.p1-t2 {
  font-family: 'Special Elite', cursive;
  font-size: 14pt;
  color: #fff;
  letter-spacing: 0.05em;
  line-height: 1.2;
  margin-top: 2mm;
}
.p1-t3 {
  font-family: 'Courier Prime', monospace;
  font-size: 7pt;
  color: #ccc;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-top: 1mm;
}

/* imagen superpuesta recortada */
.p1-img2 {
  position: absolute;
  bottom: 28mm;
  right: 0;
  width: 72mm;
  height: 54mm;
  object-fit: cover;
  object-position: center;
  filter: grayscale(100%) contrast(1.7) brightness(0.85);
  transform: rotate(-2deg);
  border-left: 3pt solid #fff;
  border-top: 3pt solid #fff;
}

/* cita superpuesta sobre imagen */
.p1-quote {
  position: absolute;
  bottom: 40mm;
  left: 5mm;
  width: 68mm;
  font-family: 'Oswald', sans-serif;
  font-size: 16pt;
  font-weight: 700;
  line-height: 1.1;
  color: #fff;
  text-transform: uppercase;
}
.p1-quote::before {
  content: '❝ ';
  font-size: 20pt;
}

/* barra info abajo */
.p1-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 26mm;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 5mm;
  border-top: 3pt solid #000;
}
.p1-bar-title {
  font-family: 'Oswald', sans-serif;
  font-size: 8.5pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  line-height: 1.3;
}
.p1-bar-tag {
  font-family: 'Courier Prime', monospace;
  font-size: 7pt;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-align: right;
  line-height: 1.6;
}

/* franja diagonal en página 1 */
.p1-stripe {
  position: absolute;
  top: 0;
  left: -10mm;
  width: 8mm;
  height: 100%;
  background: repeating-linear-gradient(
    45deg,
    #fff 0, #fff 2pt,
    transparent 2pt, transparent 6pt
  );
  opacity: 0.3;
}

/* ══ PÁGINAS INTERNAS ══ */
.running {
  position: absolute;
  top: 4.5mm;
  font-size: 5.5pt;
  font-family: 'Courier Prime', monospace;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #555;
}
.running.l { left: 8mm; }
.running.r { right: 8mm; }

.pnum {
  position: absolute;
  bottom: 4mm;
  font-family: 'Oswald', sans-serif;
  font-size: 8pt;
  letter-spacing: 0.08em;
  color: #555;
}
.pnum.l { left: 8mm; }
.pnum.r { right: 8mm; }

.inner {
  position: absolute;
  inset: 10mm 7mm 9mm 7mm;
}

/* grid asimétrico */
.g-asym { display: grid; grid-template-columns: 58mm 1fr; gap: 4mm; height: 100%; }
.g-sym  { display: grid; grid-template-columns: 1fr 1fr;   gap: 4mm; height: 100%; }
.g-wide { display: grid; grid-template-columns: 1fr 44mm;  gap: 4mm; height: 100%; }
.col { overflow: hidden; }

h2.s {
  font-family: 'Oswald', sans-serif;
  font-size: 10pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-top: 2.5pt solid #000;
  border-bottom: 0.5pt solid #000;
  padding: 1.5pt 0;
  margin-bottom: 4pt;
  margin-top: 9pt;
  break-after: avoid;
}
h2.s:first-child { margin-top: 0; }

p { margin-top: 5pt; hyphens: auto; orphans: 3; widows: 3; }
p.j { text-align: justify; }

/* drop cap */
.dc::first-letter {
  font-family: 'Oswald', sans-serif;
  font-size: 4.2em;
  font-weight: 700;
  float: left;
  line-height: 0.72;
  margin-right: 2pt;
  margin-top: 5pt;
}

/* imagen integrada */
.fi {
  width: 100%;
  display: block;
  filter: grayscale(100%) contrast(1.5) brightness(0.88);
  break-inside: avoid;
}
.fi.rot1 { transform: rotate(1.5deg); width: 108%; margin-left: -4%; }
.fi.rot2 { transform: rotate(-1deg); }
.fi.bleed { width: 115%; margin-left: -7%; margin-right: -7%; }

.cap {
  font-size: 6pt;
  letter-spacing: 0.06em;
  margin-top: 1.5pt;
  margin-bottom: 4pt;
  text-transform: uppercase;
  color: #444;
}

/* imagen a sangre lateral */
.bleed-right {
  position: absolute;
  right: 0;
  width: 40mm;
  filter: grayscale(100%) contrast(1.5) brightness(0.85);
  object-fit: cover;
}

/* pullquote */
bq {
  display: block;
  border-left: 4pt solid #000;
  padding: 4pt 6pt;
  margin: 7pt 0;
  break-inside: avoid;
  background: #eee;
}
bq p {
  font-family: 'Oswald', sans-serif;
  font-size: 13pt;
  line-height: 1.15;
  font-weight: 700;
  text-transform: uppercase;
  text-align: left;
  letter-spacing: 0.02em;
}

/* caja recorte */
.cut {
  border: 2pt solid #000;
  padding: 4pt 5pt;
  margin: 6pt 0;
  font-size: 7.5pt;
  line-height: 1.4;
  font-family: 'Special Elite', cursive;
  break-inside: avoid;
}
.cut-label {
  font-family: 'Oswald', sans-serif;
  font-size: 6.5pt;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  border-bottom: 1pt solid #000;
  margin-bottom: 3pt;
  padding-bottom: 1pt;
}

/* línea dashed */
.dash { border-top: 1pt dashed #000; margin: 6pt 0; }

/* sello */
.sello {
  display: inline-block;
  border: 1.5pt solid #000;
  padding: 1pt 5pt;
  font-family: 'Courier Prime', monospace;
  font-size: 6pt;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transform: rotate(-2.5deg);
  margin: 2pt 0;
}

/* número enorme de fondo */
.ghost {
  position: absolute;
  font-family: 'Oswald', sans-serif;
  font-size: 220pt;
  font-weight: 700;
  color: #000;
  opacity: 0.04;
  line-height: 1;
  pointer-events: none;
  z-index: 0;
  user-select: none;
}
.inner-z { position: relative; z-index: 1; height: 100%; }
</style>
</head>
<body>

<!-- ══ PÁGINA 1: apertura rupturista ══ -->
<div class="page">
  <span class="ghost" style="right:-20mm; top:-10mm;">M</span>
  <div class="inner">
    <div class="inner-z">

      <!-- cabecera del artículo -->
      <div style="border-top:4pt solid #000; border-bottom:1pt solid #000; padding:2mm 0; margin-bottom:3mm; display:flex; justify-content:space-between; align-items:baseline;">
        <span style="font-family:'Courier Prime',monospace; font-size:6pt; letter-spacing:0.14em; text-transform:uppercase;">PIXEL — Nº1 · INDIE · ACCIÓN</span>
        <span style="font-family:'Courier Prime',monospace; font-size:6pt; letter-spacing:0.1em;">★★★★☆</span>
      </div>

      <!-- título brutal -->
      <div style="margin-bottom:2mm;">
        <div style="font-family:'Oswald',sans-serif; font-size:54pt; font-weight:700; line-height:0.88; text-transform:uppercase; letter-spacing:-1pt;">MINA<br>THE HOL-<br>LOWER</div>
        <div style="font-family:'Special Elite',cursive; font-size:9pt; margin-top:2mm; border-left:3pt solid #000; padding-left:4pt; line-height:1.4;">La herencia que se gana — Yacht Club no imita<br>a Castlevania. Lo entiende y lo reconstruye.</div>
      </div>

      <!-- imagen a sangre izquierda + texto derecha -->
      <div style="display:grid; grid-template-columns:62mm 1fr; gap:4mm; margin-top:2mm;">
        <div>
          <img class="fi" style="transform:rotate(-1deg);" src="${i3}">
          <p class="cap">▲ gameplay — 2025</p>
          <img class="fi" style="margin-top:5pt;" src="${i1}">
          <p class="cap">▲ sistema de barrena</p>
        </div>
        <div>
          <h2 class="s" style="margin-top:0;">El peso de los referentes</h2>
          <p class="j dc">Hay juegos que nacen con una deuda visible. Mina llega con el apellido de Shovel Knight grabado en la frente y la sombra de Castlevania sobre cada píxel. Yacht Club no ha disimulado sus influencias: las exhibe con provocación.</p>
          <p class="j">Lo que consigue no es nostalgia, sino <strong>convicción.</strong> Mina es una ingeniera ratón que desciende a un mundo de monstruos y maquinaria. Los juegos clásicos no eran perfectos, eran intensos.</p>
          <div class="cut" style="margin-top:6pt;">
            <div class="cut-label">nota</div>
            Mina no ofrece tutoriales ni flechas. En 2025, confiar en el jugador es un acto radical.
          </div>
          <bq><p>Cada muerte es un diagnóstico, no un castigo.</p></bq>
        </div>
      </div>

    </div>
  </div>
  <span class="pnum l">— 1 —</span>
</div>

<!-- ══ PÁGINA 2 ══ -->
<div class="page">
  <span class="ghost" style="right:-15mm; bottom:-30mm;">1</span>
  <span class="running l">PIXEL — Nº1</span>
  <span class="running r">MINA THE HOLLOWER</span>
  <div class="inner">
    <div class="inner-z">
      <div class="g-asym">
        <div class="col">
          <h2 class="s">El peso de los referentes</h2>
          <p class="j dc">Hay juegos que nacen con una deuda visible. Mina llega con el apellido de Shovel Knight grabado en la frente y la sombra de Castlevania sobre cada píxel. Yacht Club no ha disimulado sus influencias: las exhibe con provocación. Lo que consigue no es nostalgia, sino <strong>convicción.</strong></p>
          <p class="j">Mina es una ingeniera ratón que desciende a un mundo de monstruos y maquinaria. Los juegos clásicos no eran perfectos, eran intensos. La dificultad era el medio para construir la relación entre el jugador y el mundo.</p>
          <div class="cut">
            <div class="cut-label">nota del editor</div>
            Mina no ofrece tutoriales ni flechas. Confía en que quien la sostiene sabe jugar, o está dispuesto a aprender. En 2025, eso es un acto radical.
          </div>
          <h2 class="s">Movimiento</h2>
          <p class="j">La protagonista no salta: se desplaza bajo tierra con una barrena, emerge, golpea y se hunde. Un verbo nuevo en un género que lleva décadas usando los mismos. La barrena tiene inercia. Salir en el momento equivocado es fatal.</p>
          <p class="j">Los niveles son laberínticos con atajos que se desbloquean hacia atrás, secretos que premian la curiosidad sin castigar la ignorancia.</p>
        </div>
        <div class="col">
          <img class="fi rot1" src="${i1}">
          <p class="cap">▲ gameplay — año 2025</p>

          <h2 class="s">El mundo</h2>
          <p class="j">Cada zona tiene una paleta, una lógica enemiga, un ritmo. Pasar de las catacumbas a la fábrica no se siente como un cambio de nivel: se siente como cruzar una frontera.</p>

          <img class="fi" style="margin-top:6pt;" src="${i4}">
          <p class="cap">▲ uno de los jefes</p>

          <bq><p>Yacht Club no imita: estudia.</p></bq>

          <span class="sello">★ recomendado</span>
        </div>
      </div>
    </div>
  </div>
  <span class="pnum l">— 2 —</span>
</div>

<!-- ══ PÁGINA 3 ══ -->
<div class="page">
  <span class="ghost" style="left:-20mm; top:-20mm;">2</span>
  <span class="running l">PIXEL — Nº1</span>
  <span class="running r">MINA THE HOLLOWER</span>
  <div class="inner">
    <div class="inner-z">
      <div class="g-wide">
        <div class="col">
          <h2 class="s">La dificultad como idioma</h2>
          <p class="j">Mina no es difícil por capricho: la dificultad es el canal por el que fluye la información. Cada muerte devuelve algo: un patrón identificado, una distancia calibrada, una ruta que antes parecía innecesaria.</p>

          <img class="fi bleed" style="margin:7pt 0;" src="${i5}">
          <p class="cap">▲ Mina the Hollower, Yacht Club Games</p>

          <p class="j">Los juegos que usan la dificultad como barrera buscan la exclusividad. Los que la usan como lenguaje buscan la comunicación. Mina pertenece a la segunda categoría.</p>

          <div class="dash"></div>

          <h2 class="s">Una herencia que se gana</h2>
          <p class="j">Yacht Club no ha hecho un juego retro. Ha hecho un juego clásico, que es una cosa completamente distinta. Un juego retro mira hacia atrás con melancolía. Un juego clásico mira hacia adelante con los principios del pasado.</p>
          <p class="j">Mina no es perfecta. Tiene momentos de frustración legítima. Pero esa imperfección también es honesta. Lo que tiene es carácter. Y el carácter, en los videojuegos como en las personas, vale más que la perfección.</p>
        </div>
        <div class="col">
          <img class="fi rot2" src="${i2}">
          <p class="cap">▲ escenario</p>

          <div class="cut" style="margin-top:8pt;">
            <div class="cut-label">en pocas palabras</div>
            No es un estudio que imita: es un estudio que estudia. En un momento en que la industria indie tiende a la referencia superficial, eso tiene un valor que va más allá del juego en sí.
          </div>

          <div class="dash"></div>

          <bq><p>La herencia se gana, no se hereda.</p></bq>

          <p style="font-size:7.5pt; margin-top:6pt; font-family:'Special Elite',cursive; line-height:1.45;">
            «El mercado indie está lleno de juegos que usan la estética retro como disfraz. Mina the Hollower la usa como idioma.»
          </p>

          <div style="margin-top:8pt; text-align:right;">
            <span class="sello" style="transform:rotate(2deg);">PIXEL nº1</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <span class="pnum r">— 3 —</span>
</div>

</body>
</html>`;

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle0' });
await page.pdf({
  path: resolve(root, 'public/pdfs/mina-test.pdf'),
  format: 'A5',
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
});
await browser.close();
console.log('PDF generado: public/pdfs/mina-test.pdf');
