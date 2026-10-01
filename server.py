"""Web server: every visitor gets their own fly and can watch it learn.

Run locally:   python server.py
Production:    gunicorn -w 2 -b 0.0.0.0:8000 server:app
"""

import fcntl
import json
import os
import re
import secrets
import time
from contextlib import contextmanager

import numpy as np
from flask import Flask, jsonify, make_response, request, send_from_directory
from werkzeug.middleware.proxy_fix import ProxyFix

from brain import (
    CONNECTOME, K_ACTIVE, LINE_PATTERNS, LINES, N_CELL, N_KC, N_PN, REWARD_DRAW,
    REWARD_LOSS, REWARD_WIN, ConnectomeMismatch, FlyBrain, benchmark, encode, legal_moves,
    play_training_game, reward_for, winner, winning_line,
)

DATA_DIR = os.environ.get("FLY_DATA_DIR", os.path.join(os.path.dirname(__file__), "data", "sessions"))
MAX_SESSIONS = int(os.environ.get("FLY_MAX_SESSIONS", "5000"))
SESSION_TTL_DAYS = float(os.environ.get("FLY_SESSION_TTL_DAYS", "30"))
MAX_TRAIN_CHUNK = int(os.environ.get("FLY_MAX_TRAIN_CHUNK", "500"))
COOKIE = "fly_session"
TOKEN_RE = re.compile(r"^[A-Za-z0-9_-]{16,64}$")

os.makedirs(DATA_DIR, exist_ok=True)
app = Flask(__name__, static_folder="static", static_url_path="/static")
if os.environ.get("FLY_BEHIND_PROXY") == "1":
    # Trust X-Forwarded-* from one reverse proxy (nginx, Caddy, ...), so that
    # the session cookie is marked Secure when the site is served over HTTPS.
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)


# ---------- sessions ----------
def _paths(token):
    base = os.path.join(DATA_DIR, token)
    return base + ".npz", base + ".json", base + ".lock"


def _cleanup():
    """Drop sessions untouched for too long, and the oldest if over the cap."""
    now = time.time()
    files = []
    for name in os.listdir(DATA_DIR):
        if name.endswith(".json"):
            path = os.path.join(DATA_DIR, name)
            try:
                files.append((os.path.getmtime(path), name[:-5]))
            except OSError:
                pass
    files.sort()
    expired = [t for m, t in files if now - m > SESSION_TTL_DAYS * 86400]
    overflow = [t for _, t in files[: max(0, len(files) - MAX_SESSIONS + 1)]]
    for token in set(expired + overflow):
        for p in _paths(token):
            try:
                os.remove(p)
            except OSError:
                pass


def _new_game_state(fly_symbol=-1):
    return {"board": [0] * 9, "fly": fly_symbol, "turn": 1,
            "trails": {"1": [], "-1": []}, "moves": {"1": [], "-1": []},
            "over": False}


class Session:
    def __init__(self, token):
        self.token = token
        self.brain = FlyBrain()
        self.meta = {"game": _new_game_state(), "exams": [], "journal": 0}


@contextmanager
def session(create=True):
    """Load the visitor's fly under a file lock, save it afterwards."""
    token = request.cookies.get(COOKIE, "")
    is_new = not TOKEN_RE.match(token) or not os.path.exists(_paths(token)[1])
    if is_new:
        if not create:
            yield None
            return
        _cleanup()
        token = secrets.token_urlsafe(24)
    npz, meta_path, lock_path = _paths(token)
    with open(lock_path, "a") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        s = Session(token)
        if not is_new:
            try:
                s.brain.load(npz)
                with open(meta_path) as f:
                    s.meta = json.load(f)
            except ConnectomeMismatch:
                # The server now runs a different wiring diagram, so the old
                # memories cannot be mapped onto it: start a new fly.
                s = Session(token)
                s.meta["notice"] = "connectome_changed"
            except (OSError, ValueError, KeyError):
                s = Session(token)
        yield s
        s.brain.save(npz)
        tmp = meta_path + ".tmp"
        with open(tmp, "w") as f:
            json.dump(s.meta, f)
        os.replace(tmp, meta_path)


def respond(s, payload):
    resp = make_response(jsonify(payload))
    resp.set_cookie(COOKIE, s.token, max_age=int(SESSION_TTL_DAYS * 86400),
                    httponly=True, samesite="Lax",
                    secure=request.is_secure)
    return resp


# ---------- payload helpers ----------
def _r(x, n=4):
    return round(float(x), n)


def memory_payload(brain):
    return {
        "kc": [_r(v, 3) for v in brain.memory_map()],
        "lh": [_r(v, 3) for v in (brain.lh_approach - brain.lh_avoid)],
    }


def curve(history, points=120, window=50):
    """Win/draw/loss fractions over the fly's whole life (moving window)."""
    n = len(history)
    if n == 0:
        return []
    h = np.array(history)
    step = max(1, int(np.ceil(n / points)))
    window = max(window, step)
    out = []
    for end in list(range(step, n, step)) + [n]:
        chunk = h[max(0, end - window):end]
        out.append([end, _r((chunk == 1).mean(), 3),
                    _r((chunk == 0).mean(), 3), _r((chunk == -1).mean(), 3)])
    return out


def active(vec):
    return np.flatnonzero(vec).tolist()


def think(brain, board, me):
    """The fly imagines every legal move and picks one."""
    move, evals = brain.choose(board, me)
    candidates = []
    for cell, r in evals.items():
        candidates.append({
            "cell": cell, "value": _r(r["value"]),
            "approach": _r(r["approach"]), "avoid": _r(r["avoid"]),
            "kc_value": _r(r["kc_value"]), "lh_value": _r(r["lh_value"]),
            "pn": active(r["pn"]), "kc": active(r["kc"]),
        })
    return move, {"board": list(board), "candidates": candidates, "chosen": move}


def game_view(g):
    w = winner(g["board"])
    return {"board": g["board"], "fly": g["fly"], "turn": g["turn"],
            "over": g["over"], "winner": w,
            "line": winning_line(g["board"])}


def state_payload(s):
    b = s.brain
    mem = b.memory_map()
    return {
        "games": b.games,
        "totals": {"win": b.history.count(1), "draw": b.history.count(0),
                   "loss": b.history.count(-1)},
        "curve": curve(b.history),
        "memory": memory_payload(b),
        "synapses": {"strengthened": int((mem > 0.02).sum()),
                     "weakened": int((mem < -0.02).sum())},
        "plasticity": _r(b.lr / b.base_lr, 3),
        "exams": s.meta.get("exams", [])[-20:],
        "game": game_view(s.meta["game"]),
        "notice": s.meta.pop("notice", None),
    }


def finish_game(s):
    """Game over: dopamine is released and the fly's memory changes."""
    b, g = s.brain, s.meta["game"]
    g["over"] = True
    w = winner(g["board"])
    fly = g["fly"]
    reward = reward_for(w, fly)
    trail = [encode(board, fly) for board in g["trails"][str(fly)]]
    pam, ppl1, _, steps = b.learn(trail, reward, detail=True)
    mem = b.memory_map()
    replay = []
    for board, cell, st in zip(g["trails"][str(fly)], g["moves"][str(fly)], steps):
        replay.append({
            "board": board, "cell": cell,
            "expected": _r(st["expected"]), "outcome": _r(st["outcome"]),
            "delta": _r(st["delta"]), "after": _r(st["after"]),
            "kc": st["kc"], "kc_values": [_r(mem[k], 3) for k in st["kc"]],
        })
    # Observational learning: the fly also learns from the opponent's moves
    other = -fly
    trail_o = [encode(board, other) for board in g["trails"][str(other)]]
    pam_o, ppl1_o, dw_o = b.learn(trail_o, reward_for(w, other))
    result = 0 if w == 0 else (1 if w == fly else -1)
    b.record(result)
    s.meta["journal"] = s.meta.get("journal", 0) + 1
    return {
        "result": result, "reward": reward, "pam": _r(pam), "ppl1": _r(ppl1),
        "replay": replay,
        "observed": {"pam": _r(pam_o), "ppl1": _r(ppl1_o),
                     "kc_changed": int((np.abs(dw_o) > 1e-4).sum())},
        "gamma": b.gamma,
    }


def fly_turn(s):
    g = s.meta["game"]
    move, thought = think(s.brain, g["board"], g["fly"])
    g["board"][move] = g["fly"]
    g["trails"][str(g["fly"])].append(list(g["board"]))
    g["moves"][str(g["fly"])].append(move)
    g["turn"] = -g["fly"]
    out = {"think": thought}
    if winner(g["board"]) is not None:
        out["learning"] = finish_game(s)
    return out


# ---------- routes ----------
@app.get("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


@app.get("/api/structure")
def structure():
    return jsonify({
        "n_pn": N_PN, "n_cell": N_CELL, "n_kc": N_KC, "k_active": K_ACTIVE,
        "connectome": {"id": CONNECTOME.id, **CONNECTOME.info},
        "lines": LINES, "line_patterns": LINE_PATTERNS,
        "rewards": {"win": REWARD_WIN, "draw": REWARD_DRAW, "loss": REWARD_LOSS},
    })


@app.get("/api/state")
def state():
    with session() as s:
        return respond(s, state_payload(s))


@app.post("/api/reset")
def reset():
    with session() as s:
        s.brain = FlyBrain()
        s.meta = {"game": _new_game_state(), "exams": [], "journal": 0}
        return respond(s, state_payload(s))


@app.post("/api/new_game")
def new_game():
    data = request.get_json(silent=True) or {}
    fly_starts = bool(data.get("fly_starts", False))
    with session() as s:
        s.meta["game"] = _new_game_state(1 if fly_starts else -1)
        out = {}
        if fly_starts:
            out = fly_turn(s)
        out["game"] = game_view(s.meta["game"])
        return respond(s, out)


@app.post("/api/move")
def move():
    data = request.get_json(silent=True) or {}
    cell = data.get("cell")
    with session() as s:
        g = s.meta["game"]
        human = -g["fly"]
        if (not isinstance(cell, int) or not 0 <= cell < 9 or g["over"]
                or g["turn"] != human or g["board"][cell] != 0):
            return respond(s, {"error": "illegal move", "game": game_view(g)}), 400
        g["board"][cell] = human
        g["trails"][str(human)].append(list(g["board"]))
        g["moves"][str(human)].append(cell)
        g["turn"] = g["fly"]
        out = {"perception": {"board": list(g["board"]),
                              "pn": active(encode(g["board"], g["fly"]))}}
        if winner(g["board"]) is not None:
            out["learning"] = finish_game(s)
        else:
            out.update(fly_turn(s))
        out["game"] = game_view(g)
        out["state"] = state_payload(s)
        return respond(s, out)


@app.post("/api/train")
def train():
    data = request.get_json(silent=True) or {}
    games = max(1, min(int(data.get("games", 100)), MAX_TRAIN_CHUNK))
    opponent = data.get("opponent", "mix")
    if opponent not in ("mix", "random", "heuristic", "self"):
        opponent = "mix"
    show = bool(data.get("show", False))
    mix = ["random", "heuristic", "self"]
    with session() as s:
        b = s.brain
        rng = np.random.default_rng()
        before = b.memory_map().copy()
        pam = ppl1 = 0.0
        results = []
        log = None
        for i in range(games):
            opp = mix[b.games % 3] if opponent == "mix" else opponent
            fly = 1 if (b.games % 2 == 0) else -1
            # with show=True the last game is recorded so the page can replay it
            log = [] if show and i == games - 1 else None
            r, p, q = play_training_game(b, opp, fly, rng, log=log)
            results.append(r)
            pam += p
            ppl1 += q
        change = b.memory_map() - before
        out = state_payload(s)
        out["chunk"] = {"games": games, "pam": _r(pam), "ppl1": _r(ppl1),
                        "results": results,
                        "kc_changed": int((np.abs(change) > 1e-4).sum())}
        if log is not None:
            out["chunk"]["last_game"] = {
                "fly": fly, "opponent": opp, "result": r,
                "steps": [{**st, "value": _r(st["value"])} if "value" in st else st
                          for st in log],
            }
        return respond(s, out)


@app.post("/api/exam")
def exam():
    """Test the fly without learning against two fixed opponents."""
    with session() as s:
        r = benchmark(s.brain, "random", games=100)
        h = benchmark(s.brain, "heuristic", games=100)
        entry = {"games": s.brain.games,
                 "random": [_r(x, 2) for x in r],
                 "heuristic": [_r(x, 2) for x in h]}
        s.meta.setdefault("exams", []).append(entry)
        out = state_payload(s)
        out["exam"] = entry
        return respond(s, out)


if __name__ == "__main__":
    app.run(host=os.environ.get("HOST", "127.0.0.1"),
            port=int(os.environ.get("PORT", "8000")), debug=False)
