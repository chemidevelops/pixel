#!/usr/bin/env bash
set -euo pipefail

ISSUE=${1:-1}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR/.."
POSTS_DIR="$ROOT/src/content/posts"
TEMPLATE="$ROOT/fanzine/template.tex"
OUT_DIR="$ROOT/public/pdfs"
OUT_FILE="$OUT_DIR/numero-${ISSUE}.pdf"

mkdir -p "$OUT_DIR"

# Collect posts for this issue, sorted by date
TMPDIR_WORK=$(mktemp -d)
trap 'rm -rf "$TMPDIR_WORK"' EXIT

COMBINED="$TMPDIR_WORK/combined.md"
> "$COMBINED"

# Extract issue date
ISSUE_JSON="$ROOT/src/content/issues/${ISSUE}.json"
if [[ -f "$ISSUE_JSON" ]]; then
  ISSUE_DATE=$(python3 -c "import json,sys; d=json.load(open('$ISSUE_JSON')); print(d.get('date',''))")
else
  ISSUE_DATE=$(date +"%Y-%m")
fi

# Find all posts for this issue
declare -a POST_FILES=()
while IFS= read -r -d '' file; do
  # Check if file has issue: N in frontmatter
  if grep -q "^issue: ${ISSUE}$" "$file"; then
    POST_FILES+=("$file")
  fi
done < <(find "$POSTS_DIR" -name "*.md" -print0)

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
title_match = re.search(r'^title:\s*["\']?(.+?)["\']?\s*$', frontmatter, re.MULTILINE)
if title_match:
    print(f"# {title_match.group(1)}\n")
print(body.strip())
print("\n")
PYEOF

done

COVER_FRONT="$ROOT/fanzine/numero-${ISSUE}-front.png"
COVER_BACK="$ROOT/fanzine/numero-${ISSUE}-back.png"

echo "Running pandoc..."
pandoc "$COMBINED" \
  --pdf-engine=lualatex \
  --template="$TEMPLATE" \
  --variable="issue:$ISSUE" \
  --variable="date:$ISSUE_DATE" \
  --variable="cover_front:$COVER_FRONT" \
  --variable="cover_back:$COVER_BACK" \
  --toc \
  --toc-depth=1 \
  -o "$OUT_FILE"

echo "PDF generated: $OUT_FILE"
