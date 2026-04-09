#!/usr/bin/env bash
# Re-encode homepage hero background for smaller file size (macOS avconvert).
# Usage: ./scripts/compress-hero-video.sh [source.mp4]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${1:-}"
OUT="$ROOT/videos/hero-home-loop.mp4"

if [[ -z "$SRC" ]]; then
  echo "Usage: $0 <source-video.mp4>" >&2
  exit 1
fi

if ! command -v avconvert >/dev/null 2>&1; then
  echo "avconvert not found (macOS only)." >&2
  exit 1
fi

mkdir -p "$ROOT/videos"

# Preset1280x720: good balance of sharpness vs size for full-width hero + object-fit: cover
avconvert \
  --source "$SRC" \
  --preset Preset1280x720 \
  --output "$OUT" \
  --replace \
  --progress

echo "Wrote $OUT"
ls -lh "$OUT"
