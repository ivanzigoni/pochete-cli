#!/usr/bin/env bash
set -euo pipefail

REPO_RAW_URL="https://raw.githubusercontent.com/ivanzigoni/pochete-cli/main/bin/pochete"
INSTALL_DIR="${POCHETE_INSTALL_DIR:-$HOME/.local/bin}"

mkdir -p "$INSTALL_DIR"
curl -fsSL "$REPO_RAW_URL" -o "$INSTALL_DIR/pochete"
chmod +x "$INSTALL_DIR/pochete"

echo "pochete instalado em $INSTALL_DIR/pochete"

case ":$PATH:" in
  *":$INSTALL_DIR:"*) ;;
  *)
    echo "atenção: $INSTALL_DIR não está no seu PATH."
    echo "adicione ao seu ~/.bashrc: export PATH=\"$INSTALL_DIR:\$PATH\""
    ;;
esac
