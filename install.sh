#!/usr/bin/env bash
set -euo pipefail

REPO="ivanzigoni/pochete-cli"
INSTALL_DIR="${POCHETE_INSTALL_DIR:-$HOME/.local/bin}"
DOWNLOAD_URL="https://github.com/${REPO}/releases/latest/download/pochete"

if ! command -v node >/dev/null 2>&1; then
  echo "erro: pochete requer Node.js instalado e disponível no PATH." >&2
  echo "instale o Node (https://nodejs.org) e rode este instalador novamente." >&2
  exit 1
fi

mkdir -p "$INSTALL_DIR"
curl -fsSL "$DOWNLOAD_URL" -o "$INSTALL_DIR/pochete"
chmod +x "$INSTALL_DIR/pochete"

echo "pochete instalado em $INSTALL_DIR/pochete"

case ":$PATH:" in
  *":$INSTALL_DIR:"*) ;;
  *)
    echo "atenção: $INSTALL_DIR não está no seu PATH."
    echo "adicione ao seu ~/.bashrc: export PATH=\"$INSTALL_DIR:\$PATH\""
    ;;
esac
