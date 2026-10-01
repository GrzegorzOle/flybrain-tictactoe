"""Headless training: let the fly play many games quickly and report progress.

Usage:
    python train.py --games 5000 --opponent mix --brain fly_brain.npz
"""

import argparse
import os

import numpy as np

from brain import CONNECTOME, FlyBrain, benchmark, play_training_game


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--games", type=int, default=5000)
    ap.add_argument("--opponent", default="mix",
                    choices=["mix", "random", "heuristic", "self"])
    ap.add_argument("--brain", default="fly_brain.npz",
                    help="brain file to load (if it exists) and save")
    ap.add_argument("--report", type=int, default=1000,
                    help="benchmark every N games")
    ap.add_argument("--fresh", action="store_true",
                    help="ignore an existing brain file and start from scratch")
    args = ap.parse_args()

    brain = FlyBrain()
    print(f"Connectome: {CONNECTOME.id} ({brain.n_kc} Kenyon cells)")
    if os.path.exists(args.brain) and not args.fresh:
        try:
            brain.load(args.brain)
        except ValueError as e:
            raise SystemExit(f"Cannot continue {args.brain}: {e}\n"
                             "Use --fresh to start a new fly, or --brain with another file.")
        print(f"Loaded {args.brain} ({brain.games} games of experience)")

    rng = np.random.default_rng()
    mix = ["random", "heuristic", "self"]

    def report(label):
        r = benchmark(brain, "random")
        h = benchmark(brain, "heuristic")
        print(f"{label:>8} | vs random  W {r[0]:.0%} D {r[1]:.0%} L {r[2]:.0%}"
              f" | vs heuristic  W {h[0]:.0%} D {h[1]:.0%} L {h[2]:.0%}")

    report("start")
    for g in range(1, args.games + 1):
        opp = mix[g % 3] if args.opponent == "mix" else args.opponent
        play_training_game(brain, opp, 1 if g % 2 else -1, rng)
        if g % args.report == 0:
            report(f"+{g}")
    brain.save(args.brain)
    print(f"Saved {args.brain} ({brain.games} games of experience)")


if __name__ == "__main__":
    main()
