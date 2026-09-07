#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

REPO="ivanzigoni/pochete-cli"
INSTALL_DIR="${POCHETE_INSTALL_DIR:-$HOME/.local/bin}"
DOWNLOAD_URL="https://github.com/${REPO}/releases/latest/download/pochete"
JITI_VERSION="2.7.0"

if ! command -v node >/dev/null 2>&1; then
  echo "erro: pochete requer Node.js instalado e disponível no PATH." >&2
  echo "instale o Node (https://nodejs.org) e rode este instalador novamente." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "erro: pochete requer npm instalado e disponível no PATH (normalmente já vem com o Node.js)." >&2
  exit 1
fi

mkdir -p "$INSTALL_DIR"
curl -fsSL --max-time 60 "$DOWNLOAD_URL" -o "$INSTALL_DIR/pochete"
chmod +x "$INSTALL_DIR/pochete"

echo "==> instalando dependência de runtime do comando 'build' (jiti)"
npm install --prefix "$INSTALL_DIR" --no-save --no-audit --no-fund "jiti@${JITI_VERSION}" >/dev/null

echo "pochete instalado em $INSTALL_DIR/pochete"

case ":$PATH:" in
  *":$INSTALL_DIR:"*) ;;
  *)
    echo "atenção: $INSTALL_DIR não está no seu PATH."
    echo "adicione ao seu ~/.bashrc: export PATH=\"$INSTALL_DIR:\$PATH\""
    ;;
esac
