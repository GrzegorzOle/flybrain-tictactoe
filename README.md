# FlyBrain Tic-Tac-Toe

A web app where anyone can teach a model of the fruit-fly brain to play
tic-tac-toe, and watch how its memory is built step by step.

Each visitor gets their own fly, which starts with no memories at all. It
learns only from rewards and punishments. A win releases "reward" dopamine,
a loss releases "punishment" dopamine, and these signals rewrite the synapses
of the mushroom body, the fly's learning centre. The page animates every step:

1. **Perception**: the board activates sensory (projection) neurons.
2. **Imagination**: for every possible move the fly pictures the resulting
   board. A sparse set of Kenyon cells fires and recalls how good that
   situation was in the past.
3. **Decision**: the central complex compares the options, and descending
   neurons trigger the chosen move.
4. **Outcome**: at the end of the game dopamine neurons fire. PAM neurons
   signal reward, PPL1 neurons signal punishment.
5. **Memory**: the fly replays each of its moves and compares the expected
   value with the actual outcome. The prediction error δ decides which
   synapses are strengthened and which are weakened.
6. **Observation**: the fly also learns from the opponent's moves.
7. **Consolidation**: the memory map shows the updated synapses, and the
   learning journal records the game.

A training camp lets the fly play thousands of fast games against a sparring
partner. You can watch the learning curve and the memory map change, then
take an exam (100 games with learning switched off) to measure progress. The
interface is available in English and Polish.

![One learning step: the fly lost and PPL1 punishment dopamine rewrites the synapses of the active Kenyon cells](docs/learning-step.png)

![After 1000 training games: the mushroom body is full of "approach" (green) and "avoid" (red) memories](docs/after-training.png)

## Quick start

Requirements: Python 3.10 or newer.

```bash
git clone <this repository>
cd FlaysBrainGame
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
python server.py
```

Then open <http://127.0.0.1:8000>.

## Running on a server

The app is a small Flask application with no build step. Use gunicorn in
production:

```bash
pip install -r requirements.txt
gunicorn -w 2 -b 0.0.0.0:8000 server:app
```

Put it behind a reverse proxy (nginx, Caddy, ...) that terminates HTTPS, and
set `FLY_BEHIND_PROXY=1`. The session cookie is then marked `Secure`. A
minimal nginx location block:

```nginx
location / {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Docker

```bash
docker build -t flybrain .
docker run -d -p 8000:8000 -v flybrain-data:/data flybrain
```

Add `-e FLY_BEHIND_PROXY=1` when the container runs behind a reverse proxy.

### Configuration

| Variable | Default | Meaning |
|---|---|---|
| `FLY_DATA_DIR` | `./data/sessions` | where each visitor's fly is stored |
| `FLY_MAX_SESSIONS` | `5000` | maximum number of stored flies; the oldest are removed first |
| `FLY_SESSION_TTL_DAYS` | `30` | flies untouched for this long are deleted |
| `FLY_MAX_TRAIN_CHUNK` | `500` | maximum number of training games per request |
| `FLY_BEHIND_PROXY` | unset | `1` = trust `X-Forwarded-*` headers from one proxy |
| `HOST`, `PORT` | `127.0.0.1`, `8000` | address for `python server.py` |

### Per-visitor flies

A visitor is identified by a random, HTTP-only cookie (`fly_session`). No
personal data is collected. Each fly is stored as two small files
(`<token>.npz` with the synapse weights and `<token>.json` with the game state
and exam history, about 35 KB together). Access is serialised with a file
lock, so any number of gunicorn workers can share the data directory.
Clearing cookies or pressing **New fly** starts again from a naive brain.

## The model

### What comes from the connectome

In 2024 the FlyWire consortium (Princeton and collaborators, with Google's
automated reconstruction) published the complete wiring diagram of an adult
fruit-fly brain: about 140,000 neurons and 50 million synapses. The Janelia
hemibrain (HHMI Janelia with Google) and the larval connectome (Cambridge and
Janelia) mapped the same learning circuit, the **mushroom body**, in detail.
This project reproduces that circuit's architecture and its known
learning rule:

| Part of the fly brain | In the model |
|---|---|
| Projection neurons (sensory input) | 107 neurons: 27 for cell states (own / opponent / empty) and 80 line detectors |
| Kenyon cells (KCs) | 4000 cells. Each samples ~7 random projection neurons, as the connectome shows (random, unstructured PN→KC wiring) |
| APL neuron | global inhibition: only the 5% most strongly driven KCs fire (sparse coding) |
| MBONs (mushroom body output neurons) | two output neurons, "approach" and "avoid" |
| KC→MBON synapses | **the memory**: the only plastic synapses in the mushroom body |
| PAM dopamine neurons | reward signal: potentiate KC→approach and depress KC→avoid |
| PPL1 dopamine neurons | punishment signal: the opposite |
| Lateral horn | a parallel sensory→output pathway |
| Central complex, descending neurons | compare the imagined options and execute the chosen move |

### Learning rule

Plasticity is three-factor, as in the real mushroom body. A synapse changes
only when (1) its Kenyon cell was active, (2) it connects to an output
neuron, and (3) dopamine arrives. Dopamine follows the **reward prediction
error**:

```
value(board)  = Σ active KCs (w_approach − w_avoid) + lateral horn term
target_t      = reward × γ^(T−1−t)        γ = 0.9, t = move index, T = number of moves
δ_t           = target_t − value(board_t)
δ > 0  → PAM fires  → w_approach += η·δ,  w_avoid −= η·δ   (for active KCs only)
δ < 0  → PPL1 fires → the opposite
```

Rewards are: win +1, draw +0.3, loss −1. Moves close to the end of the game
carry more of the credit. Weights are bounded, and the learning rate `η`
slowly decreases with experience (`η = 0.05 / (1 + games/5000)`), which
stabilises long-term memory. To choose a move, the fly evaluates the board
after each legal move and picks the most valuable one.

### Simplifications and modelling choices

This is a model of the **learning principle**. It is not a neuron-by-neuron
simulation of the real fly brain:

- The actual FlyWire / hemibrain data is **not** loaded. The model uses the
  mushroom body's architecture and statistics: the number of inputs per
  Kenyon cell, the sparsity, and the dopamine compartments. Neuron counts are
  scaled (4000 KCs; a real fly has about 2,000–2,500 per hemisphere).
- The board is not seen through a realistic visual system. The "eyes" layer
  is a hand-designed encoding (cell states plus line detectors).
- The lateral horn is made plastic here. In real flies it mostly carries
  innate behaviour, but in the model it helps generalise across boards.
- MBON output is reduced to two neurons (approach, avoid). The central
  complex and descending neurons are represented only functionally.
- The draw reward (+0.3) and the discount factor are modelling choices.

### How well does it learn?

Typical results for a fresh fly trained against the mixed sparring partner
(random, clever and itself in turn), measured by the exam:

| Games | vs random (W / D / L) | vs clever (W / D / L) |
|---|---|---|
| 0 | ~45% / 15% / 40% | ~3% / 10% / 87% |
| 100 | ~80% / 15% / 5% | ~5% / 47% / 48% |
| 1000 | ~90% / 8% / 1–3% | ~20% / 68% / 8–14% |
| 3000 | ~92% / 8% / 0% | ~24% / 70% / 6% |

The clever opponent always completes a line and blocks yours, so a draw
against it is a good result. Perfect play can only draw.

## Headless training

`train.py` trains a fly from the command line and prints periodic exam
results. It is useful for experiments with the model.

```bash
python train.py --games 5000 --opponent mix --brain fly_brain.npz
python train.py --games 2000 --opponent heuristic --fresh
```

| Option | Default | Meaning |
|---|---|---|
| `--games` | 5000 | number of training games |
| `--opponent` | `mix` | `mix`, `random`, `heuristic` or `self` |
| `--brain` | `fly_brain.npz` | brain file to continue from and save to |
| `--report` | 1000 | run an exam every N games |
| `--fresh` | off | ignore an existing brain file |

## HTTP API

All endpoints return JSON and use the `fly_session` cookie. A new fly is
created on the first request.

| Method and path | Body | Returns |
|---|---|---|
| `GET /api/structure` | | circuit sizes, line definitions, rewards |
| `GET /api/state` | | games, totals, learning curve, memory map, synapse counts, exams, current game |
| `POST /api/new_game` | `{"fly_starts": bool}` | new game; if the fly starts, also its thinking (`think`) |
| `POST /api/move` | `{"cell": 0..8}` | `perception`, the fly's `think` (all candidate moves with active neurons and values), `learning` when the game ended (reward, dopamine, step-by-step `replay`, observational learning), `game`, `state` |
| `POST /api/train` | `{"games": n, "opponent": "mix"}` | state plus `chunk` (results, dopamine totals, number of KCs changed) |
| `POST /api/exam` | | state plus `exam` (100 games vs random and 100 vs clever, no learning) |
| `POST /api/reset` | | a new, naive fly |

## Project layout

```
brain.py         mushroom-body model: encoding, KC layer, dopamine learning, opponents
server.py        Flask app with per-visitor flies
train.py         command-line training
static/          single-page front end (HTML, CSS, JavaScript, no build step)
Dockerfile
requirements.txt
```

## References

- Dorkenwald et al. (2024). Neuronal wiring diagram of an adult brain. *Nature* 634.
- Schlegel et al. (2024). Whole-brain annotation and multi-connectome cell typing of *Drosophila*. *Nature* 634.
- Scheffer et al. (2020). A connectome and analysis of the adult *Drosophila* central brain. *eLife* 9.
- Li et al. (2020). The connectome of the adult *Drosophila* mushroom body provides insights into function. *eLife* 9.
- Eichler et al. (2017). The complete connectome of a learning and memory centre in an insect brain. *Nature* 548.
- Aso et al. (2014). The neuronal architecture of the mushroom body provides a logic for associative learning. *eLife* 3.
- Caron et al. (2013). Random convergence of olfactory inputs in the *Drosophila* mushroom body. *Nature* 497.
- Lin et al. (2014). Sparse, decorrelated odor coding in the mushroom body enhances learned odor discrimination. *Nature Neuroscience* 17.
- Hige et al. (2015). Heterosynaptic plasticity underlies aversive olfactory learning in *Drosophila*. *Neuron* 88.
