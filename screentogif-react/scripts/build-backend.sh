#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend/ScreenToGif.Backend"
BINARIES_DIR="$PROJECT_ROOT/src-tauri/binaries"

# Detect current platform
if [[ "$OSTYPE" == "darwin"* ]]; then
    if [[ $(uname -m) == "arm64" ]]; then
        TARGET="osx-arm64"
        SUFFIX="-aarch64-apple-darwin"
    else
        TARGET="osx-x64"
        SUFFIX="-x86_64-apple-darwin"
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    TARGET="linux-x64"
    SUFFIX="-x86_64-unknown-linux-gnu"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    TARGET="win-x64"
    SUFFIX="-x86_64-pc-windows-msvc.exe"
else
    echo "Unknown platform: $OSTYPE"
    exit 1
fi

echo "Building C# backend for $TARGET..."
echo "Backend directory: $BACKEND_DIR"
echo "Binaries directory: $BINARIES_DIR"

# Create binaries directory if it doesn't exist
mkdir -p "$BINARIES_DIR"

# Build the backend
cd "$BACKEND_DIR"
dotnet publish -c Release -r "$TARGET" --self-contained -o "$BINARIES_DIR/publish"

# Copy and rename the executable for Tauri sidecar naming convention
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    cp "$BINARIES_DIR/publish/screentogif-backend.exe" "$BINARIES_DIR/screentogif-backend$SUFFIX"
else
    cp "$BINARIES_DIR/publish/screentogif-backend" "$BINARIES_DIR/screentogif-backend$SUFFIX"
    chmod +x "$BINARIES_DIR/screentogif-backend$SUFFIX"
fi

echo "Backend built successfully: $BINARIES_DIR/screentogif-backend$SUFFIX"
