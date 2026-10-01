# End-to-end test of FlyBrain.exe: console mode first, then the Windows service.
# Run it as Administrator (it installs and removes the FlyBrain service):
#
#   powershell -ExecutionPolicy Bypass -File windows\smoke-test.ps1
#
# Do not run it on a machine where the FlyBrain service is already installed.
param(
    [string]$Exe = "$PSScriptRoot\dist\FlyBrain.exe",
    [string]$Dir = "C:\FlyBrainTest"
)
$ErrorActionPreference = "Stop"

function Fly {
    & $script:Target @args
    if ($LASTEXITCODE) { throw "FlyBrain.exe $args failed with exit code $LASTEXITCODE" }
}
function Wait-Up([string]$Url) {
    for ($i = 0; $i -lt 90; $i++) {
        try { Invoke-WebRequest $Url -UseBasicParsing -TimeoutSec 5 | Out-Null; return }
        catch { Start-Sleep -Seconds 1 }
    }
    throw "No answer from $Url"
}
function Check($Ok, [string]$What) {
    if (-not $Ok) { throw "FAILED: $What" }
    Write-Host "ok   $What"
}
function Cookie($Response) { $Response.Headers["Set-Cookie"] -join "; " }

# the service account must be able to read the exe, so test from a plain folder
New-Item -ItemType Directory -Force $Dir | Out-Null
Copy-Item $Exe "$Dir\FlyBrain.exe" -Force
$script:Target = "$Dir\FlyBrain.exe"
$json = "application/json"

# ---- 1. console mode ----
$p = Start-Process $Target -PassThru -NoNewWindow -ArgumentList `
    "run", "--port", "8091", "--data-dir", "$Dir\console-data", "--log-dir", "$Dir\console-logs"
try {
    $base = "http://127.0.0.1:8091"
    Wait-Up "$base/"
    Check ((Invoke-WebRequest "$base/" -UseBasicParsing).Content -match "btn-auto") "index page served"
    $s = Invoke-RestMethod "$base/api/structure"
    Check ($s.connectome.id -like "flywire-*") "FlyWire connectome bundled ($($s.connectome.id))"
    $r = Invoke-RestMethod "$base/api/train" -Method Post -ContentType $json `
        -Body '{"games": 10, "show": true}' -SessionVariable web
    Check ($r.games -eq 10 -and $r.chunk.last_game.steps.Count -ge 5) "training with a replayed game"
    $r = Invoke-RestMethod "$base/api/state" -WebSession $web
    Check ($r.games -eq 10) "the session cookie keeps the fly"
    Check (Test-Path "$Dir\console-data\*.npz") "flies stored in --data-dir"
}
finally {
    taskkill /PID $p.Id /T /F | Out-Null
}

# ---- 2. Windows service ----
$base = "http://127.0.0.1:8092"
Fly install --port 8092
try {
    Fly start
    Wait-Up "$base/"
    $r = Invoke-RestMethod "$base/api/train" -Method Post -ContentType $json `
        -Body '{"games": 20}' -SessionVariable svc
    Check ($r.games -eq 20) "the service answers and trains"
    Fly status
    Fly restart
    Wait-Up "$base/"
    $r = Invoke-RestMethod "$base/api/state" -WebSession $svc
    Check ($r.games -eq 20) "the fly survives a service restart"
    Check (Test-Path "$Dir\data\*.npz") "service data next to FlyBrain.exe"
    $account = (Get-CimInstance Win32_Service -Filter "Name='FlyBrain'").StartName
    Check ($account -like "*LocalService") "runs as LocalService ($account)"
    $h = Invoke-WebRequest "$base/api/state" -UseBasicParsing -Headers @{ "X-Forwarded-Proto" = "https" }
    Check ((Cookie $h) -match "Secure") "Secure cookie behind an HTTPS proxy"
    $h = Invoke-WebRequest "$base/api/state" -UseBasicParsing
    Check ((Cookie $h) -notmatch "Secure") "no Secure cookie over plain HTTP"
}
finally {
    & $Target uninstall
}
for ($i = 0; $i -lt 10 -and (Get-Service FlyBrain -ErrorAction SilentlyContinue); $i++) { Start-Sleep 1 }
Check (-not (Get-Service FlyBrain -ErrorAction SilentlyContinue)) "service removed"
Write-Host "All tests passed."
