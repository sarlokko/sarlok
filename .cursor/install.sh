#!/usr/bin/env bash
# Idempotent dependency bootstrap for the MediaFlow Proxy Cloud Agent environment.
set -euo pipefail

cd "$(dirname "$0")/.."

# python venv support is not present in the base image by default.
if ! python3 -m venv --help >/dev/null 2>&1 || ! python3 -c "import ensurepip" >/dev/null 2>&1; then
  echo "Installing python3-venv..."
  sudo apt-get update -qq
  sudo apt-get install -y -qq python3-venv
fi

if [ ! -d .venv ]; then
  echo "Creating virtual environment..."
  python3 -m venv .venv
fi

# shellcheck disable=SC1091
. .venv/bin/activate

python -m pip install --upgrade pip
pip install -r requirements.txt

echo "Install complete: $(python --version)"
