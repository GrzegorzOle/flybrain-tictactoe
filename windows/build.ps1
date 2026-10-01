# Builds windows\dist\FlyBrain.exe: a single file with Python, the web app,
# the static files and the FlyWire connectome extract inside.
#
#   powershell -ExecutionPolicy Bypass -File windows\build.ps1
#
# Needs Python 3.12 (64-bit) on PATH. Run it from any folder.
$ErrorActionPreference = "Stop"
$here = $PSScriptRoot
$root = Split-Path -Parent $here

python -m pip install --upgrade -r "$here\requirements-build.txt"
if ($LASTEXITCODE) { throw "pip install failed" }

python -m PyInstaller --noconfirm --clean --onefile --name FlyBrain `
    --paths "$root" `
    --add-data "$root\static;static" `
    --add-data "$root\connectome\flywire_mb_right.npz;connectome" `
    --hidden-import win32timezone `
    --exclude-module tkinter `
    --distpath "$here\dist" --workpath "$here\build" --specpath "$here\build" `
    "$here\flybrain_win.py"
if ($LASTEXITCODE) { throw "PyInstaller failed" }

Get-Item "$here\dist\FlyBrain.exe" | Format-Table Name, @{n="MB"; e={[math]::Round($_.Length / 1MB, 1)}}
