"""FlyBrain for Windows: one executable that serves the web app and can run
itself as a Windows service.

    FlyBrain.exe run [options]       serve in this console (Ctrl+C stops it)
    FlyBrain.exe install [options]   install the Windows service (as Administrator)
    FlyBrain.exe start | stop | restart | status | uninstall

`install` takes the same options as `run` and stores them in the service's
command line, so `FlyBrain.exe status` (or `sc qc FlyBrain`) shows them.
To change them later: uninstall, then install again. The flies are kept.
"""

import argparse
import logging
import logging.handlers
import os
import subprocess
import sys
import threading

SERVICE_NAME = "FlyBrain"
DISPLAY_NAME = "FlyBrain Tic-Tac-Toe"
DESCRIPTION = ("Fruit-fly mushroom-body model that learns tic-tac-toe. "
               "Web app, usually published through an IIS reverse proxy.")
# service account -> (name for the service manager, SID for icacls)
ACCOUNTS = {
    "LocalService": (r"NT AUTHORITY\LocalService", "*S-1-5-19"),
    "NetworkService": (r"NT AUTHORITY\NetworkService", "*S-1-5-20"),
    "LocalSystem": (None, None),
}

log = logging.getLogger("flybrain")

if not getattr(sys, "frozen", False):
    # running from source: the web app lives one folder up
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def home():
    """Folder of FlyBrain.exe (or of this script when run from source)."""
    if getattr(sys, "frozen", False):
        return os.path.dirname(os.path.abspath(sys.executable))
    return os.path.dirname(os.path.abspath(__file__))


# ---------- options ----------
def add_server_options(p):
    g = p.add_argument_group("server options")
    g.add_argument("--host", default="127.0.0.1",
                   help="address to listen on (default 127.0.0.1: only IIS on this machine can connect)")
    g.add_argument("--port", type=int, default=8090, help="port (default 8090)")
    g.add_argument("--threads", type=int, default=8, help="worker threads (default 8)")
    g.add_argument("--data-dir", help=r"where the flies are stored (default <exe folder>\data)")
    g.add_argument("--log-dir", help=r"log folder (default <exe folder>\logs)")
    g.add_argument("--behind-proxy", dest="behind_proxy", action="store_true", default=True,
                   help="trust X-Forwarded-* headers from the reverse proxy, e.g. IIS (default)")
    g.add_argument("--no-behind-proxy", dest="behind_proxy", action="store_false",
                   help="browsers connect directly: ignore X-Forwarded-* headers")
    g.add_argument("--trusted-proxy", default="127.0.0.1",
                   help="address the reverse proxy connects from (default 127.0.0.1)")
    g.add_argument("--connectome", choices=["auto", "flywire", "synthetic"], default="auto",
                   help="wiring diagram (default auto = the bundled FlyWire extract)")
    g.add_argument("--max-sessions", type=int, default=5000,
                   help="maximum number of stored flies; the oldest are removed (default 5000)")
    g.add_argument("--session-ttl-days", type=float, default=30,
                   help="remove flies unused for this many days (default 30)")
    g.add_argument("--max-train-chunk", type=int, default=500,
                   help="maximum games per training request (default 500)")


def finish_options(ns):
    ns.data_dir = os.path.abspath(ns.data_dir or os.path.join(home(), "data"))
    ns.log_dir = os.path.abspath(ns.log_dir or os.path.join(home(), "logs"))
    return ns


def option_args(ns):
    """The options again as a command line, for the service."""
    args = ["--host", ns.host, "--port", str(ns.port), "--threads", str(ns.threads),
            "--data-dir", ns.data_dir, "--log-dir", ns.log_dir,
            "--connectome", ns.connectome, "--max-sessions", str(ns.max_sessions),
            "--session-ttl-days", str(ns.session_ttl_days),
            "--max-train-chunk", str(ns.max_train_chunk), "--trusted-proxy", ns.trusted_proxy]
    args.append("--behind-proxy" if ns.behind_proxy else "--no-behind-proxy")
    return args


def parser():
    p = argparse.ArgumentParser(
        prog="FlyBrain.exe", description=__doc__.split("\n\n")[0],
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="Run 'FlyBrain.exe <command> --help' for the options of a command.")
    sub = p.add_subparsers(dest="command", metavar="command")
    run = sub.add_parser("run", help="serve in this console")
    add_server_options(run)
    inst = sub.add_parser("install", help="install the Windows service (as Administrator)")
    add_server_options(inst)
    inst.add_argument("--account", choices=list(ACCOUNTS), default="LocalService",
                      help="account the service runs as (default LocalService)")
    for name, text in [("start", "start the service"), ("stop", "stop the service"),
                       ("restart", "restart the service"),
                       ("status", "show the service state and its options"),
                       ("uninstall", "stop and remove the service (the flies are kept)")]:
        sub.add_parser(name, help=text)
    return p


# ---------- the web server ----------
def setup_logging(ns, console):
    os.makedirs(ns.log_dir, exist_ok=True)
    fmt = logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s")
    handlers = [logging.handlers.RotatingFileHandler(
        os.path.join(ns.log_dir, "FlyBrain.log"), maxBytes=5_000_000, backupCount=5, encoding="utf-8")]
    if console:
        handlers.append(logging.StreamHandler(sys.stdout))
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    for h in handlers:
        h.setFormatter(fmt)
        root.addHandler(h)


def make_server(ns):
    os.makedirs(ns.data_dir, exist_ok=True)
    os.environ["FLY_DATA_DIR"] = ns.data_dir
    os.environ["FLY_CONNECTOME"] = ns.connectome
    os.environ["FLY_MAX_SESSIONS"] = str(ns.max_sessions)
    os.environ["FLY_SESSION_TTL_DAYS"] = str(ns.session_ttl_days)
    os.environ["FLY_MAX_TRAIN_CHUNK"] = str(ns.max_train_chunk)
    # waitress handles the proxy headers itself (only from the trusted address)
    os.environ.pop("FLY_BEHIND_PROXY", None)
    # server reads the settings above when it is imported
    import server
    from waitress.server import create_server

    proxy = {}
    if ns.behind_proxy:
        proxy = {"trusted_proxy": ns.trusted_proxy, "trusted_proxy_count": 1,
                 "trusted_proxy_headers": {"x-forwarded-for", "x-forwarded-proto",
                                           "x-forwarded-host"}}
    srv = create_server(server.app, host=ns.host, port=ns.port, threads=ns.threads,
                        ident="FlyBrain", **proxy)
    log.info("FlyBrain on http://%s:%d, connectome %s, data in %s",
             ns.host, ns.port, server.CONNECTOME.id, ns.data_dir)
    return srv


def cmd_run(ns):
    setup_logging(ns, console=True)
    srv = make_server(ns)
    log.info("Press Ctrl+C to stop.")
    try:
        srv.run()
    except KeyboardInterrupt:
        log.info("Stopped.")
    finally:
        srv.close()


# ---------- Windows service ----------
def windows_only():
    if os.name != "nt":
        sys.exit("This command is only available on Windows.")


def cmd_service(ns):
    """Entry point when the Windows service manager starts the executable."""
    windows_only()
    import servicemanager
    import win32service
    import win32serviceutil

    setup_logging(ns, console=False)
    # a service has no console: keep anything printed in the log folder
    out = open(os.path.join(ns.log_dir, "FlyBrain-output.log"), "a", buffering=1, encoding="utf-8")
    sys.stdout = sys.stderr = out

    class FlyBrainService(win32serviceutil.ServiceFramework):
        _svc_name_ = SERVICE_NAME
        _svc_display_name_ = DISPLAY_NAME
        _svc_description_ = DESCRIPTION

        def __init__(self, args):
            super().__init__(args)
            self.stopping = threading.Event()

        def SvcStop(self):
            self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
            self.stopping.set()

        def SvcDoRun(self):
            try:
                srv = make_server(ns)
            except Exception:
                log.exception("FlyBrain could not start")
                raise
            web = threading.Thread(target=srv.run, name="waitress", daemon=True)
            web.start()
            servicemanager.LogInfoMsg(f"{SERVICE_NAME} listening on http://{ns.host}:{ns.port}")
            while not self.stopping.wait(5):
                if not web.is_alive():
                    # let the service manager's recovery settings restart us
                    log.error("The web server stopped unexpectedly.")
                    logging.shutdown()
                    os._exit(1)
            log.info("Service stopping.")
            srv.close()

    servicemanager.Initialize()
    servicemanager.PrepareToHostSingle(FlyBrainService)
    servicemanager.StartServiceCtrlDispatcher()


def win_error(e):
    import pywintypes

    if not isinstance(e, pywintypes.error):
        raise e
    hints = {5: "Access denied: run this command in a console opened as Administrator.",
             1060: f"The {SERVICE_NAME} service is not installed.",
             1073: f"The {SERVICE_NAME} service is already installed. "
                   "Run 'FlyBrain.exe uninstall' first to change its options.",
             1056: f"The {SERVICE_NAME} service is already running.",
             1062: f"The {SERVICE_NAME} service is not running."}
    sys.exit(hints.get(e.winerror, f"{e.funcname}: {e.strerror} (error {e.winerror})"))


def cmd_install(ns):
    windows_only()
    if not getattr(sys, "frozen", False):
        sys.exit("Install the service from FlyBrain.exe (see windows/README.md to build it).")
    import pywintypes
    import win32service

    account, sid = ACCOUNTS[ns.account]
    cmdline = subprocess.list2cmdline([sys.executable, "service", *option_args(ns)])
    try:
        scm = win32service.OpenSCManager(None, None, win32service.SC_MANAGER_ALL_ACCESS)
        try:
            hs = win32service.CreateService(
                scm, SERVICE_NAME, DISPLAY_NAME, win32service.SERVICE_ALL_ACCESS,
                win32service.SERVICE_WIN32_OWN_PROCESS, win32service.SERVICE_AUTO_START,
                win32service.SERVICE_ERROR_NORMAL, cmdline, None, 0, None, account, None)
            win32service.ChangeServiceConfig2(hs, win32service.SERVICE_CONFIG_DESCRIPTION, DESCRIPTION)
            win32service.ChangeServiceConfig2(
                hs, win32service.SERVICE_CONFIG_DELAYED_AUTO_START_INFO, True)
            win32service.CloseServiceHandle(hs)
        finally:
            win32service.CloseServiceHandle(scm)
    except pywintypes.error as e:
        win_error(e)
    # restart automatically if the process ever dies
    subprocess.run(["sc.exe", "failure", SERVICE_NAME, "reset=", "86400",
                    "actions=", "restart/5000/restart/10000/restart/60000"],
                   check=True, stdout=subprocess.DEVNULL)
    for d in (ns.data_dir, ns.log_dir):
        os.makedirs(d, exist_ok=True)
        if sid:
            subprocess.run(["icacls", d, "/grant", f"{sid}:(OI)(CI)M"],
                           check=True, stdout=subprocess.DEVNULL)
    print(f"Installed the {SERVICE_NAME} service (automatic start, account {ns.account}).")
    print(f"  listens on http://{ns.host}:{ns.port}")
    print(f"  data in    {ns.data_dir}")
    print(f"  logs in    {ns.log_dir}")
    print("Start it now with:  FlyBrain.exe start")


def cmd_control(command):
    windows_only()
    import pywintypes
    import win32service
    import win32serviceutil as su

    try:
        if command == "start":
            su.StartService(SERVICE_NAME)
            su.WaitForServiceStatus(SERVICE_NAME, win32service.SERVICE_RUNNING, 60)
            print(f"{SERVICE_NAME} is running.")
        elif command == "stop":
            su.StopService(SERVICE_NAME)
            su.WaitForServiceStatus(SERVICE_NAME, win32service.SERVICE_STOPPED, 60)
            print(f"{SERVICE_NAME} is stopped.")
        elif command == "restart":
            if su.QueryServiceStatus(SERVICE_NAME)[1] != win32service.SERVICE_STOPPED:
                su.StopService(SERVICE_NAME)
                su.WaitForServiceStatus(SERVICE_NAME, win32service.SERVICE_STOPPED, 60)
            su.StartService(SERVICE_NAME)
            su.WaitForServiceStatus(SERVICE_NAME, win32service.SERVICE_RUNNING, 60)
            print(f"{SERVICE_NAME} restarted.")
        elif command == "uninstall":
            if su.QueryServiceStatus(SERVICE_NAME)[1] != win32service.SERVICE_STOPPED:
                su.StopService(SERVICE_NAME)
                su.WaitForServiceStatus(SERVICE_NAME, win32service.SERVICE_STOPPED, 60)
            su.RemoveService(SERVICE_NAME)
            print(f"Removed the {SERVICE_NAME} service. The data and log folders were kept.")
        elif command == "status":
            states = {1: "stopped", 2: "starting", 3: "stopping", 4: "running",
                      5: "resuming", 6: "pausing", 7: "paused"}
            state = su.QueryServiceStatus(SERVICE_NAME)[1]
            scm = win32service.OpenSCManager(None, None, win32service.SC_MANAGER_CONNECT)
            hs = win32service.OpenService(scm, SERVICE_NAME, win32service.SERVICE_QUERY_CONFIG)
            cfg = win32service.QueryServiceConfig(hs)
            win32service.CloseServiceHandle(hs)
            win32service.CloseServiceHandle(scm)
            print(f"{SERVICE_NAME}: {states.get(state, state)}")
            print(f"  account:      {cfg[7]}")
            print(f"  command line: {cfg[3]}")
    except pywintypes.error as e:
        win_error(e)


def service_parser():
    # what the service manager runs; not listed in the help
    p = argparse.ArgumentParser(prog="FlyBrain.exe service")
    add_server_options(p)
    return p


def main(argv=None):
    argv = sys.argv[1:] if argv is None else argv
    if argv[:1] == ["service"]:
        ns = finish_options(service_parser().parse_args(argv[1:]))
        cmd_service(ns)
        return
    p = parser()
    ns = p.parse_args(argv)
    if ns.command is None:
        p.print_help()
        return
    if ns.command in ("run", "install"):
        finish_options(ns)
    if ns.command == "run":
        cmd_run(ns)
    elif ns.command == "install":
        cmd_install(ns)
    else:
        cmd_control(ns.command)


if __name__ == "__main__":
    main()
