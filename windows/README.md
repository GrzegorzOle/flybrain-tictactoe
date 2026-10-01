# FlyBrain on Windows and IIS

`FlyBrain.exe` is the whole web app in one file: Python, the model, the web
page and the FlyWire connectome extract are inside. Nothing else needs to be
installed. The exe runs the app with the [waitress](https://docs.pylonsproject.org/projects/waitress/)
web server, and it can install itself as a Windows service. IIS then publishes
it to the outside world as a reverse proxy.

```
browser ──HTTPS──> IIS (URL Rewrite + ARR) ──HTTP──> FlyBrain.exe on 127.0.0.1:8090
```

## Getting the exe

* **Download.** On GitHub, open *Actions → Windows build → the latest run* and
  download the `FlyBrain-windows` artifact. When a release is published, the
  same files are attached to it as `FlyBrain-windows.zip`. The package holds
  `FlyBrain.exe`, this README, `web.config` and `LICENSE`.
* **Build it yourself.** On Windows with 64-bit Python 3.12 on `PATH`:

  ```powershell
  powershell -ExecutionPolicy Bypass -File windows\build.ps1
  ```

  The result is `windows\dist\FlyBrain.exe`, about 30–40 MB.

The exe is not code-signed. If Windows marks the downloaded file as blocked,
run `Unblock-File .\FlyBrain.exe` or tick *Unblock* in its properties.

## Quick test

Put the exe in its own folder, for example `C:\FlyBrain\`. Do not use a user
profile or `Program Files`, because the service account must be able to read
the exe and write next to it. Then run:

```powershell
cd C:\FlyBrain
.\FlyBrain.exe run
```

Open <http://127.0.0.1:8090>. Press Ctrl+C to stop.

## Commands and parameters

```
FlyBrain.exe run       [options]   serve in this console
FlyBrain.exe install   [options]   install the Windows service (as Administrator)
FlyBrain.exe start | stop | restart | status | uninstall
```

`run` and `install` take the same options:

| Option | Default | Meaning |
|---|---|---|
| `--host` | `127.0.0.1` | Address to listen on. Keep `127.0.0.1` when IIS runs on the same machine, so nobody can bypass IIS. |
| `--port` | `8090` | Port. It must match the port in `web.config`. |
| `--threads` | `8` | Worker threads. |
| `--data-dir` | `<exe folder>\data` | Where the visitors' flies are stored (about 20 KB each). |
| `--log-dir` | `<exe folder>\logs` | Log files (`FlyBrain.log`, rotated at 5 MB). |
| `--behind-proxy` / `--no-behind-proxy` | behind proxy | Trust `X-Forwarded-For/Proto/Host` from the proxy. With HTTPS in IIS this marks the session cookie `Secure`. |
| `--trusted-proxy` | `127.0.0.1` | Address the proxy connects from. Headers from any other address are ignored. |
| `--connectome` | `auto` | `auto`/`flywire` = the bundled FlyWire wiring, `synthetic` = random wiring. |
| `--max-sessions` | `5000` | Maximum number of stored flies; the oldest are removed. |
| `--session-ttl-days` | `30` | Flies unused for this many days are removed. |
| `--max-train-chunk` | `500` | Maximum games per training request. |
| `--account` (install only) | `LocalService` | Service account: `LocalService`, `NetworkService` or `LocalSystem`. |

## Running as a Windows service

Open PowerShell **as Administrator**:

```powershell
cd C:\FlyBrain
.\FlyBrain.exe install            # add options here, e.g. --port 8095
.\FlyBrain.exe start
.\FlyBrain.exe status             # state, account and the full command line
```

What `install` sets up:

* service `FlyBrain` ("FlyBrain Tic-Tac-Toe"), started automatically (delayed
  start) after every reboot;
* it restarts automatically if the process dies (after 5 s, 10 s, then 60 s);
* it runs as `LocalService`, a low-privilege account; `install` gives this
  account write access to the data and log folders;
* the options are stored in the service's command line. To change them, run
  `uninstall` and then `install` with the new options. The flies are kept.

The service can also be managed in `services.msc` or with `sc.exe`. To update
the exe: `.\FlyBrain.exe stop`, replace the file, then `.\FlyBrain.exe start`.
Updates keep the flies. A new connectome is the only exception: the page then
tells each visitor that their fly was rewired.

Logs are in `C:\FlyBrain\logs`. Start and stop events also appear in the
Windows *Application* event log.

## Publishing through IIS (reverse proxy)

### 1. Install the IIS modules

Install both from Microsoft (Web Platform Installer is retired, so use the
direct downloads):

* **URL Rewrite 2.1**: <https://www.iis.net/downloads/microsoft/url-rewrite>
* **Application Request Routing (ARR) 3.0**: <https://www.iis.net/downloads/microsoft/application-request-routing>

### 2. Enable the proxy and allow the header (once per server)

In an Administrator console:

```bat
%windir%\system32\inetsrv\appcmd.exe set config -section:system.webServer/proxy /enabled:"True" /preserveHostHeader:"True" /commit:apphost
%windir%\system32\inetsrv\appcmd.exe set config -section:system.webServer/rewrite/allowedServerVariables /+"[name='HTTP_X_FORWARDED_PROTO']" /commit:apphost
```

The same can be done in IIS Manager:

* *server node → Application Request Routing Cache → Server Proxy Settings →
  Enable proxy*;
* *site → URL Rewrite → View Server Variables → Add `HTTP_X_FORWARDED_PROTO`*.

If you skip the second command, every request returns HTTP 500.50.

### 3. Create the site

1. Create an empty folder, e.g. `C:\inetpub\flybrain`. Copy **only**
   `web.config` from this package into it. Never point the site at the
   FlyBrain.exe folder, because that would publish the data and logs.
2. In IIS Manager, add a new website with that physical path and a host name
   binding such as `flybrain.example.com`. Add an HTTPS binding with a
   certificate if the site is public.
3. If FlyBrain listens on a port other than 8090, change the port in both rules
   of `web.config`.

The app must be the root of its own site or host name. The page loads `/api/…`
and `/static/…` from the root, so a sub-folder such as
`www.example.com/flybrain` does not work without changes.

To send all visitors to HTTPS, uncomment the redirect rule at the top of
`web.config`.

### 4. Check

* `http://127.0.0.1:8090` on the server shows the app, so FlyBrain itself works.
* `https://flybrain.example.com` shows the app, so IIS forwards correctly.
* Play a move and reload the page. The fly's game count must stay the same.

### Troubleshooting

| Symptom | Cause |
|---|---|
| 502.3 Bad Gateway | FlyBrain is not running or listens on another port: `FlyBrain.exe status`, `logs\FlyBrain.log`. |
| 500.50 URL Rewrite Module Error | `HTTP_X_FORWARDED_PROTO` is not in the allowed server variables (step 2). |
| 404 from IIS for every page | The ARR proxy is not enabled (step 2). |
| Every reload creates a new, naive fly | The cookie is not stored. On plain HTTP check that the HTTPS rule is not matching; if IIS runs on another machine, start FlyBrain with `--host 0.0.0.0 --trusted-proxy <IIS address>`. |
| The service stops right after starting | Read `logs\FlyBrain.log` and `logs\FlyBrain-output.log`. Usually the port is taken or the folder is not writable for the service account. |

Training requests take a few seconds at most, well within ARR's default
timeout. No WebSockets are used.

## Testing a build

`windows\smoke-test.ps1` (run as Administrator) exercises console mode and the
service, including restart persistence and the proxy headers. The GitHub
Actions workflow runs it on every build.

## Licence and data

The code is MIT licensed (see `LICENSE`). The exe contains connectivity data
derived from the FlyWire connectome v783 (Dorkenwald et al. 2024, *Nature*;
Schlegel et al. 2024, *Nature*), distributed under CC-BY 4.0. Keep this notice
with the package.
