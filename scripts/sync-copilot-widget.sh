#!/usr/bin/env bash
# Refresh the vendored Orbit Copilot chat widget from a local Orbit-Copilot checkout.
#   usage: scripts/sync-copilot-widget.sh [path-to-orbit-copilot]   (default: ../orbit-copilot)
# The widget's source of truth is Orbit-Copilot/web/src. Don't edit the vendored copy here;
# change it there, then run this.
set -euo pipefail
cd "$(dirname "$0")/.."
SRC="${1:-../orbit-copilot}"
DEST="src/vendor/orbit-copilot"
[ -d "$SRC/web/src" ] || { echo "No widget at $SRC/web/src" >&2; exit 1; }
rm -rf "$DEST"
mkdir -p "$DEST"
cp "$SRC"/web/src/*.ts "$SRC"/web/src/*.tsx "$DEST"/
SHA="$(git -C "$SRC" rev-parse --short HEAD 2>/dev/null || echo unknown)"
cat > "$DEST/SOURCE.md" <<MD
# Vendored: Orbit Copilot chat widget

Copied from [Nags-gk/Orbit-Copilot](https://github.com/Nags-gk/Orbit-Copilot) \`web/src\` at commit \`$SHA\`.

Don't edit these files here. Change them in Orbit-Copilot, then run \`scripts/sync-copilot-widget.sh\`.
MD
echo "Synced widget from $SRC @ $SHA → $DEST"
