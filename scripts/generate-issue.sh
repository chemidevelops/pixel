#!/usr/bin/env bash
set -euo pipefail

ISSUE=${1:-1}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR/.."
POSTS_DIR="$ROOT/src/content/posts"
TEMPLATE="$ROOT/fanzine/template.html"
OUT_DIR="$ROOT/public/pdfs"
OUT_FILE="$OUT_DIR/numero-${ISSUE}.pdf"

mkdir -p "$OUT_DIR"

# Collect posts for this issue, sorted by date
TMPDIR_WORK=$(mktemp -d)
trap 'cp "$TMPDIR_WORK/output.html" /tmp/pixel-debug.html 2>/dev/null; rm -rf "$TMPDIR_WORK"' EXIT

COMBINED="$TMPDIR_WORK/combined.md"
> "$COMBINED"

# Extract issue date
ISSUE_JSON="$ROOT/src/content/issues/${ISSUE}.json"
if [[ -f "$ISSUE_JSON" ]]; then
  ISSUE_DATE=$(python3 -c "import json,sys; d=json.load(open('$ISSUE_JSON')); print(d.get('date',''))")
  ISSUE_EDITORIAL=$(python3 -c "import json,sys; d=json.load(open('$ISSUE_JSON')); print(d.get('editorial',''))")
else
  ISSUE_DATE=$(date +"%Y-%m")
  ISSUE_EDITORIAL=""
fi

# Find all posts for this issue
declare -a POST_FILES=()
while IFS= read -r -d '' file; do
  # Check if file has issue: N in frontmatter
  if grep -q "^issue: ${ISSUE}$" "$file"; then
    POST_FILES+=("$file")
  fi
done < <(find "$POSTS_DIR" \( -name "*.md" -o -name "*.mdx" \) -print0)

if [[ ${#POST_FILES[@]} -eq 0 ]]; then
  echo "No posts found for issue $ISSUE" >&2
  exit 1
fi

# Sort by date field in frontmatter
declare -a SORTED_FILES=()
while IFS= read -r line; do
  SORTED_FILES+=("$line")
done < <(
  for f in "${POST_FILES[@]}"; do
    d=$(grep "^date:" "$f" | head -1 | tr -d '"' | awk '{print $2}')
    printf '%s\t%s\n' "$d" "$f"
  done | sort | cut -f2
)

echo "Building issue $ISSUE with ${#SORTED_FILES[@]} articles..."

for file in "${SORTED_FILES[@]}"; do
  title=$(grep "^title:" "$file" | head -1 | sed 's/title: *"\?\([^"]*\)"\?/\1/')
  echo "  + $title"

  # Strip YAML frontmatter (between --- delimiters)
  python3 - "$file" <<'PYEOF' >> "$COMBINED"
import sys, re
with open(sys.argv[1]) as f:
    raw = f.read()
parts = raw.split('---', 2)
frontmatter = parts[1] if len(parts) >= 3 else ''
body = parts[2] if len(parts) >= 3 else raw

# Strip MDX import lines and JSX component tags
body = re.sub(r'^import .+$', '', body, flags=re.MULTILINE)
body = re.sub(r'<[A-Z][^>]*/>', '', body)

# Fix image paths: /images/foo.jpg → images/foo.jpg
body = re.sub(r'!\[([^\]]*)\]\(/images/', r'![\1](images/', body)

# If no inline image, inject first gallery image from frontmatter
if not re.search(r'!\[', body):
    gallery_match = re.search(r'^gallery:\s*\n((?:\s+-\s+.+\n)+)', frontmatter, re.MULTILINE)
    if gallery_match:
        first_img = re.search(r'-\s+(/images/\S+)', gallery_match.group(1))
        if first_img:
            img_path = first_img.group(1).replace('/images/', 'images/')
            body = body.strip() + f'\n\n![gameplay]({img_path})\n'

title_match = re.search(r'^title:\s*["\']?(.+?)["\']?\s*$', frontmatter, re.MULTILINE)
if title_match:
    print(f"# {title_match.group(1)}\n")
print(body.strip())
print("\n")
PYEOF

done

COVER_FRONT="$ROOT/public/covers/numero-${ISSUE}-front.png"
COVER_BACK="$ROOT/public/covers/numero-${ISSUE}-back.png"

HTML_FILE="$TMPDIR_WORK/output.html"

echo "Running pandoc → HTML..."
pandoc "$COMBINED" \
  --to=html5 \
  --template="$TEMPLATE" \
  --lua-filter="$ROOT/fanzine/dropcap.lua" \
  --resource-path="$ROOT/public" \
  --variable="issue:$ISSUE" \
  --variable="date:$ISSUE_DATE" \
  --variable="cover_front:$COVER_FRONT" \
  --variable="cover_back:$COVER_BACK" \
  --toc \
  --toc-depth=1 \
  -o "$HTML_FILE"

# Inyectar editorial y limpiar TOC
python3 - <<PYEOF
import json, re

with open('$ISSUE_JSON') as f:
    d = json.load(f)

# Editorial
text = d.get('editorial', '')
paras = [p.strip() for p in text.split('\n\n') if p.strip()]
html_editorial = '\n'.join(f'<p>{p}</p>' for p in paras)

with open('$HTML_FILE') as f:
    html = f.read()

html = html.replace('%%EDITORIAL%%', html_editorial)

# Dividir en bloques por artículo — cada h1 abre un nuevo .content
# Esto evita los problemas de break-before:page dentro de column-count
parts = re.split(r'(?=<h1[^>]*>)', html)
new_parts = []
in_content = False
for i, part in enumerate(parts):
    if re.match(r'<h1[^>]*>', part):
        if in_content:
            part = '</div><div class="content">' + part
        in_content = True
    new_parts.append(part)
html = ''.join(new_parts)

# Si una <figure> viene justo después de <h1>, moverla tras el primer <p>
def move_figure_after_h1(m):
    h1 = m.group(1)
    fig = m.group(2)
    rest = m.group(3)
    # Buscar el primer <p>...</p> en el resto
    p_match = re.search(r'(<p>.*?</p>)', rest, re.DOTALL)
    if p_match:
        first_p = p_match.group(1)
        after_p = rest[p_match.end():]
        return h1 + '\n' + first_p + '\n' + fig + after_p
    return m.group(0)

html = re.sub(
    r'(<h1[^>]*>.*?</h1>)\s*(<figure>.*?</figure>)(.*?)(?=<h1|</div>)',
    move_figure_after_h1,
    html,
    flags=re.DOTALL
)

# Convertir imagen de Mina a escala de grises
import os
from PIL import Image
import base64, io
def grayscale_img(m):
    src = m.group(1)
    # Resolver ruta relativa al directorio public
    if src.startswith('file://'):
        path = src[7:]
    else:
        path = os.path.join('$ROOT/public', src.lstrip('/'))
    if not os.path.exists(path):
        return m.group(0)
    try:
        img = Image.open(path).convert('L').convert('RGB')
        buf = io.BytesIO()
        img.save(buf, format='JPEG', quality=85)
        b64 = base64.b64encode(buf.getvalue()).decode()
        return f'src="data:image/jpeg;base64,{b64}"'
    except Exception:
        return m.group(0)
html = re.sub(r'src="([^"]+\.(jpg|jpeg|png|webp))"', grayscale_img, html)

# Convertir <ul>/<li> del TOC en <div> para evitar bullets en WeasyPrint
def fix_toc_block(m):
    inner = m.group(0)
    inner = re.sub(r'<ul[^>]*>', '<div class="toc-list">', inner)
    inner = re.sub(r'</ul>', '</div>', inner)
    inner = re.sub(r'<li[^>]*>', '<div class="toc-item">', inner)
    inner = re.sub(r'</li>', '</div>', inner)
    return inner

html = re.sub(r'<ul>.*?</ul>', fix_toc_block, html, flags=re.DOTALL)

with open('$HTML_FILE', 'w') as f:
    f.write(html)
PYEOF

echo "Running WeasyPrint → PDF..."
weasyprint "$HTML_FILE" "$OUT_FILE" \
  --base-url="$ROOT/public" \
  2>&1 | grep -v "^WARNING:" | grep -v "^$" || true

echo "PDF generated: $OUT_FILE"

# Generar versión de impresión (imposición en cuadernillo)
PRINT_FILE="${OUT_DIR}/numero-${ISSUE}-print.pdf"
python3 "$SCRIPT_DIR/impose.py" "$OUT_FILE" "$PRINT_FILE"
echo "Print PDF:    $PRINT_FILE"
