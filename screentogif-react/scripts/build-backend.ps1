# PowerShell script for building C# backend on Windows
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$BackendDir = Join-Path $ProjectRoot "backend\ScreenToGif.Backend"
$BinariesDir = Join-Path $ProjectRoot "src-tauri\binaries"

$Target = "win-x64"
$Suffix = "-x86_64-pc-windows-msvc.exe"

Write-Host "Building C# backend for $Target..."
Write-Host "Backend directory: $BackendDir"
Write-Host "Binaries directory: $BinariesDir"

# Create binaries directory if it doesn't exist
New-Item -ItemType Directory -Force -Path $BinariesDir | Out-Null

# Build the backend
Push-Location $BackendDir
try {
    dotnet publish -c Release -r $Target --self-contained -o "$BinariesDir\publish"

    # Copy and rename the executable for Tauri sidecar naming convention
    Copy-Item "$BinariesDir\publish\screentogif-backend.exe" "$BinariesDir\screentogif-backend$Suffix" -Force

    Write-Host "Backend built successfully: $BinariesDir\screentogif-backend$Suffix"
}
finally {
    Pop-Location
}
