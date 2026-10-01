"""A fruit-fly brain model that learns to play tic-tac-toe.

The architecture follows the learning circuit described by the Drosophila
connectome (FlyWire / HHMI Janelia / Cambridge / Google): the mushroom body.

    visual system (photoreceptors + line detectors)
        -> projection neurons (PN)
        -> Kenyon cells (KC): sparse code, global inhibition by the APL neuron
        -> mushroom body output neurons (MBON "approach" / "avoid")
        -> central complex (action selection)
        -> descending neurons (DN) = the move that is played

PNs also feed the lateral horn (LH), whose output neurons converge with the
MBONs. Learning happens only at the KC -> MBON and LH -> output synapses and
is gated by dopamine: PAM neurons report "better than expected" (reward),
PPL1 neurons report "worse than expected" (punishment).

The PN -> KC wiring is the real one when connectome/flywire_mb_right.npz
exists (built by flywire_import.py from the FlyWire v783 release): every
Kenyon cell of the right mushroom body, with the synapse counts it receives
from each input neuron type. Without that file a synthetic wiring with the
same statistics (random inputs per KC) is used. In both cases about 5% of
KCs are active at a time.
"""

import hashlib
import os

import numpy as np

LINES = [
    (0, 1, 2), (3, 4, 5), (6, 7, 8),
    (0, 3, 6), (1, 4, 7), (2, 5, 8),
    (0, 4, 8), (2, 4, 6),
]

# Line pattern types: (own marks, opponent marks)
LINE_PATTERNS = [(m, o) for m in range(4) for o in range(4) if m + o <= 3]
PATTERN_INDEX = {p: i for i, p in enumerate(LINE_PATTERNS)}

N_CELL = 27                               # 9 cells x {own, opponent, empty}
N_LINE = len(LINES) * len(LINE_PATTERNS)  # line detectors (optic lobe)
N_PN = N_CELL + N_LINE
N_PN_ACTIVE = 9 + len(LINES)              # active PNs for any board

KC_W_MAX = 1.0
LH_W_MAX = 10.0  # LH synapses are few but strong

REWARD_WIN = 1.0
REWARD_DRAW = 0.3
REWARD_LOSS = -1.0


def winner(board):
    """Return 1 or -1 for the winner, 0 for a draw, None while in progress."""
    for a, b, c in LINES:
        s = board[a] + board[b] + board[c]
        if s == 3:
            return 1
        if s == -3:
            return -1
    if all(v != 0 for v in board):
        return 0
    return None


def winning_line(board):
    for line in LINES:
        if abs(sum(board[i] for i in line)) == 3:
            return line
    return None


def legal_moves(board):
    return [i for i in range(9) if board[i] == 0]


def encode(board, me):
    """Sensory neuron activity for the board as seen by player `me`."""
    x = np.zeros(N_PN, dtype=np.float32)
    for i, v in enumerate(board):
        if v == me:
            x[i * 3] = 1.0
        elif v == -me:
            x[i * 3 + 1] = 1.0
        else:
            x[i * 3 + 2] = 1.0
    for li, line in enumerate(LINES):
        m = sum(1 for i in line if board[i] == me)
        o = sum(1 for i in line if board[i] == -me)
        x[N_CELL + li * len(LINE_PATTERNS) + PATTERN_INDEX[(m, o)]] = 1.0
    return x


KC_SPARSITY = 0.05  # fraction of KCs allowed to fire (APL inhibition)
WIRING_SEED = 7
CONNECTOME_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "connectome")
FLYWIRE_FILE = os.path.join(CONNECTOME_DIR, "flywire_mb_right.npz")


class Connectome:
    """The fixed PN -> KC wiring shared by every fly (it is genetic, not learned).

    pn_kc[k, i] is the strength of the input that board feature i delivers to
    Kenyon cell k. `info` describes the circuit for the web page.
    """

    def __init__(self, cid, pn_kc, info, rng=None):
        self.id = cid
        self.pn_kc = np.ascontiguousarray(pn_kc, dtype=np.float32)
        self.n_kc = self.pn_kc.shape[0]
        self.k_active = int(self.n_kc * KC_SPARSITY)
        # Tiny fixed jitter breaks ties between equally driven KCs. It is
        # seeded, so the same board always activates the same KCs.
        rng = rng or np.random.default_rng(WIRING_SEED)
        self.noise = rng.random(self.n_kc).astype(np.float32) * 1e-3
        self.info = info


def synthetic_connectome(n_kc=4000, claws=7):
    """Random wiring with the statistics of the real mushroom body."""
    rng = np.random.default_rng(WIRING_SEED)
    pn_kc = np.zeros((n_kc, N_PN), dtype=np.float32)
    for k in range(n_kc):
        pn_kc[k, rng.choice(N_PN, size=claws, replace=False)] = 1.0
    return Connectome(f"synthetic-{n_kc}-{claws}", pn_kc, {
        "kind": "synthetic", "n_kc": n_kc, "claws": claws,
    }, rng)


def flywire_connectome(path=FLYWIRE_FILE):
    """Real wiring of one mushroom body, extracted by flywire_import.py.

    Board feature i drives the i-th input neuron type (sorted by how many
    Kenyon cells it reaches); its weight onto each KC is the number of
    synapses FlyWire found between them.
    """
    with np.load(path) as d:
        counts = d["pn_kc"]
        if counts.shape[1] < N_PN:
            raise ValueError(f"{path}: only {counts.shape[1]} input types, need {N_PN}")
        pn_kc = counts[:, :N_PN].astype(np.float32)
        kc_types, kc_n = np.unique(d["kc_types"], return_counts=True)
        kc_mbon = d["kc_mbon"].astype(np.int64)
        mbons = [{"type": str(t), "valence": int(v), "kc_synapses": int(n)}
                 for t, v, n in zip(d["mbon_types"], d["mbon_valence"], kc_mbon.sum(0))]
        info = {
            "kind": "flywire",
            "source": str(d["source"]), "side": str(d["side"]),
            "n_kc": int(counts.shape[0]),
            "n_kc_silent": int((pn_kc.sum(1) == 0).sum()),
            "kc_types": sorted(([str(t), int(n)] for t, n in zip(kc_types, kc_n)),
                               key=lambda x: -x[1]),
            "inputs": [str(t) for t in d["pn_types"][:N_PN]],
            "input_classes": [str(c) for c in d["pn_class"][:N_PN]],
            "n_input_types": int(counts.shape[1]),
            "claws": round(float((pn_kc > 0).sum(1).mean()), 1),
            "pn_kc_synapses": int(pn_kc.sum()),
            "mbons": mbons,
            "n_pam": int(d["n_pam"]), "n_ppl1": int(d["n_ppl1"]),
        }
    digest = hashlib.sha1(pn_kc.tobytes()).hexdigest()[:8]
    return Connectome(f"flywire-783-{info['side']}-{digest}", pn_kc, info)


def load_connectome(choice=None):
    """FLY_CONNECTOME: 'auto' (FlyWire if the extract exists), 'flywire' or 'synthetic'."""
    choice = choice or os.environ.get("FLY_CONNECTOME", "auto")
    path = os.environ.get("FLY_CONNECTOME_FILE", FLYWIRE_FILE)
    if choice == "synthetic" or (choice == "auto" and not os.path.exists(path)):
        return synthetic_connectome()
    if choice not in ("auto", "flywire"):
        raise ValueError(f"FLY_CONNECTOME must be auto, flywire or synthetic, not {choice!r}")
    return flywire_connectome(path)


CONNECTOME = load_connectome()
N_KC = CONNECTOME.n_kc
K_ACTIVE = CONNECTOME.k_active


class ConnectomeMismatch(ValueError):
    """A saved fly was grown on a different wiring diagram."""


class FlyBrain:
    """One fly: the fixed wiring is shared, only the plastic synapses are its own."""

    def __init__(self, seed=None, connectome=None):
        self.rng = np.random.default_rng(seed)
        self.wiring = connectome or CONNECTOME
        self.n_kc = self.wiring.n_kc
        self.k_active = self.wiring.k_active
        # Plastic synapses onto the output neurons, all starting neutral
        self.w_approach = np.full(self.n_kc, KC_W_MAX / 2, dtype=np.float32)
        self.w_avoid = np.full(self.n_kc, KC_W_MAX / 2, dtype=np.float32)
        self.lh_approach = np.full(N_PN, LH_W_MAX / 2, dtype=np.float32)
        self.lh_avoid = np.full(N_PN, LH_W_MAX / 2, dtype=np.float32)
        self.base_lr = 0.05
        self.gamma = 0.9
        self.games = 0
        self.history = []  # results from the fly's point of view: 1 / 0 / -1

    @property
    def lr(self):
        # Plasticity slowly declines with experience, which stabilises memory
        return self.base_lr / (1 + self.games / 5000)

    # ---------- perception ----------
    def kc_activity(self, pn):
        drive = self.wiring.pn_kc @ pn + self.wiring.noise
        # APL: global inhibition - only the k most strongly driven KCs fire
        k = self.k_active
        active = np.argpartition(drive, -k)[-k:]
        kc = np.zeros(self.n_kc, dtype=np.float32)
        kc[active] = 1.0 / k
        return kc

    def respond(self, pn):
        """Full response of the brain to one (imagined) board."""
        kc = self.kc_activity(pn)
        lh = pn / N_PN_ACTIVE
        kc_app, kc_av = float(kc @ self.w_approach), float(kc @ self.w_avoid)
        lh_app, lh_av = float(lh @ self.lh_approach), float(lh @ self.lh_avoid)
        return {"pn": pn, "kc": kc,
                "approach": kc_app + lh_app, "avoid": kc_av + lh_av,
                "kc_value": kc_app - kc_av, "lh_value": lh_app - lh_av,
                "value": kc_app + lh_app - kc_av - lh_av}

    def evaluate(self, board, me):
        """Response to every legal move: the fly imagines each outcome."""
        out = {}
        for m in legal_moves(board):
            after = list(board)
            after[m] = me
            out[m] = self.respond(encode(after, me))
        return out

    def choose(self, board, me, temperature=0.0, epsilon=0.0):
        evals = self.evaluate(board, me)
        moves = list(evals)
        if epsilon and self.rng.random() < epsilon:
            return int(self.rng.choice(moves)), evals
        vals = np.array([evals[m]["value"] for m in moves])
        if temperature <= 0:
            best = np.flatnonzero(vals >= vals.max() - 1e-6)
            return int(moves[self.rng.choice(best)]), evals
        p = np.exp((vals - vals.max()) / temperature)
        p /= p.sum()
        return int(moves[self.rng.choice(len(moves), p=p)]), evals

    # ---------- learning (dopamine) ----------
    def learn(self, afterstates, reward, detail=False):
        """Three-factor plasticity: active KC x output neuron x dopamine.

        afterstates: encoded boards (PN vectors) after each of the player's
        moves; reward: game outcome from that player's point of view.
        Returns total PAM (reward) and PPL1 (punishment) dopamine, the net
        change of each KC's synapses and, with detail=True, one record per
        remembered move (expectation, outcome, prediction error, KCs changed).
        """
        pam = ppl1 = 0.0
        lr = self.lr
        dw = np.zeros(self.n_kc, dtype=np.float32)
        steps = []
        T = len(afterstates)
        for t, pn in enumerate(afterstates):
            target = reward * self.gamma ** (T - 1 - t)
            r = self.respond(pn)
            delta = target - r["value"]  # reward prediction error
            if delta > 0:
                pam += delta   # reward: strengthen "approach", weaken "avoid"
            else:
                ppl1 -= delta  # punishment: strengthen "avoid", weaken "approach"
            # the error is shared between both pathways
            step_kc = lr * delta * r["kc"] * self.k_active / 4
            step_lh = lr * delta * pn / 4
            before = self.w_approach - self.w_avoid
            self.w_approach += step_kc
            self.w_avoid -= step_kc
            self.lh_approach += step_lh
            self.lh_avoid -= step_lh
            np.clip(self.w_approach, 0.0, KC_W_MAX, out=self.w_approach)
            np.clip(self.w_avoid, 0.0, KC_W_MAX, out=self.w_avoid)
            np.clip(self.lh_approach, 0.0, LH_W_MAX, out=self.lh_approach)
            np.clip(self.lh_avoid, 0.0, LH_W_MAX, out=self.lh_avoid)
            change = (self.w_approach - self.w_avoid) - before
            dw += change
            if detail:
                steps.append({
                    "expected": r["value"], "outcome": target, "delta": delta,
                    "after": self.respond(pn)["value"],
                    "kc": np.flatnonzero(r["kc"]).tolist(),
                    "kc_change": float(np.abs(change).sum()),
                })
        if detail:
            return pam, ppl1, dw, steps
        return pam, ppl1, dw

    def record(self, result):
        self.games += 1
        self.history.append(int(result))

    def memory_map(self):
        """Net learned value stored at each KC's output synapses."""
        return self.w_approach - self.w_avoid

    # ---------- long-term memory ----------
    def save(self, path):
        np.savez_compressed(
            path, w_approach=self.w_approach, w_avoid=self.w_avoid,
            lh_approach=self.lh_approach, lh_avoid=self.lh_avoid,
            games=self.games, history=np.array(self.history, dtype=np.int8),
            connectome=np.array(self.wiring.id),
        )

    def load(self, path):
        with np.load(path) as d:
            # files written before the connectome was recorded used the synthetic wiring
            saved = str(d["connectome"]) if "connectome" in d.files else "synthetic-4000-7"
            if saved != self.wiring.id:
                raise ConnectomeMismatch(f"Saved fly uses {saved}, this brain uses {self.wiring.id}")
            for name in ("w_approach", "w_avoid", "lh_approach", "lh_avoid"):
                arr = d[name].astype(np.float32)
                if arr.shape != getattr(self, name).shape:
                    raise ValueError("Saved brain has a different size")
                setattr(self, name, arr)
            self.games = int(d["games"])
            self.history = d["history"].astype(int).tolist()


# ---------- training opponents ----------
def random_player(board, me, rng):
    return int(rng.choice(legal_moves(board)))


def heuristic_player(board, me, rng):
    """Wins if it can, blocks if it must, otherwise plays (mostly) randomly."""
    moves = legal_moves(board)
    for who in (me, -me):
        for m in moves:
            b = list(board)
            b[m] = who
            if winner(b) == who:
                return m
    if 4 in moves and rng.random() < 0.5:
        return 4
    return int(rng.choice(moves))


OPPONENTS = {"random": random_player, "heuristic": heuristic_player}


def reward_for(w, player):
    if w == 0:
        return REWARD_DRAW
    return REWARD_WIN if w == player else REWARD_LOSS


def play_training_game(brain, opponent, fly_symbol, rng, epsilon=0.1,
                       observe=True, log=None):
    """One fast training game. opponent: 'random' | 'heuristic' | 'self'.

    With a `log` list, every move is appended to it (cell, player, board
    after the move and, for the fly's moves, the neurons that fired).
    """
    board = [0] * 9
    player = 1
    trails = {1: [], -1: []}
    while winner(board) is None:
        evals = None
        if player == fly_symbol or opponent == "self":
            m, evals = brain.choose(board, player, epsilon=epsilon)
        else:
            m = OPPONENTS[opponent](board, player, rng)
        board[m] = player
        trails[player].append(encode(board, player))
        if log is not None:
            step = {"cell": m, "player": player, "board": list(board)}
            if evals is not None:
                r = evals[m]
                step.update(pn=np.flatnonzero(r["pn"]).tolist(),
                            kc=np.flatnonzero(r["kc"]).tolist(), value=float(r["value"]))
            log.append(step)
        player = -player
    w = winner(board)
    pam, ppl1, _ = brain.learn(trails[fly_symbol], reward_for(w, fly_symbol))
    if observe:  # the fly also learns from the opponent's moves
        brain.learn(trails[-fly_symbol], reward_for(w, -fly_symbol))
    result = 0 if w == 0 else (1 if w == fly_symbol else -1)
    brain.record(result)
    return result, pam, ppl1


def benchmark(brain, opponent, games=200, seed=0):
    """Play without learning; return (win, draw, loss) fractions."""
    rng = np.random.default_rng(seed)
    counts = [0, 0, 0]
    for i in range(games):
        board = [0] * 9
        player = 1
        fly = 1 if i % 2 == 0 else -1
        while winner(board) is None:
            if player == fly:
                m, _ = brain.choose(board, player)
            else:
                m = OPPONENTS[opponent](board, player, rng)
            board[m] = player
            player = -player
        w = winner(board)
        counts[0 if w == fly else (1 if w == 0 else 2)] += 1
    return tuple(c / games for c in counts)
