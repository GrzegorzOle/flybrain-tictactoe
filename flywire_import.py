"""Build the mushroom-body extract of the FlyWire connectome used by the fly.

Downloads (once, cached) the public FlyWire v783 data:
  * proofread_connections_783.feather  (Zenodo 10676866, CC-BY 4.0, 852 MB)
  * neuron annotations                (github.com/flyconnectome/flywire_annotations)
and writes a small file with everything the model needs from one hemisphere:

  * every Kenyon cell (KC) and its subtype,
  * excitatory (cholinergic) input neurons onto the KCs, grouped by cell type,
    with the synapse count of each type onto each KC (PN -> KC wiring),
  * APL -> KC synapse counts,
  * KC -> MBON synapse counts and, for each MBON, its dopamine input from PAM
    and PPL1 neurons, which decides whether the MBON is part of a reward
    (PAM) or punishment (PPL1) compartment,
  * the number of PAM and PPL1 dopamine neurons.

Usage:
    pip install -r requirements-import.txt
    python flywire_import.py                # right hemisphere (default)
    python flywire_import.py --side left
"""

import argparse
import os
import sys
import urllib.request

import numpy as np

ZENODO = "https://zenodo.org/api/records/10676866/files/{}/content"
CONNECTIONS = ("proofread_connections_783.feather", 852022274)
ANNOTATIONS_URL = ("https://raw.githubusercontent.com/flyconnectome/flywire_annotations/"
                   "a83b2776d60d5764cef36b927f5f9679c16c47a2/supplemental_files/"
                   "Supplemental_file1_neuron_annotations.tsv")

MIN_SYN = 3            # weaker connections are treated as noise
MIN_MBON_INPUT = 100   # MBONs with fewer KC synapses are ignored
VALENCE_DOMINANCE = 0.7


def download(url, path, size=None):
    if os.path.exists(path) and (size is None or os.path.getsize(path) == size):
        return path
    print(f"Downloading {os.path.basename(path)} ...", flush=True)
    tmp = path + ".part"
    with urllib.request.urlopen(url) as r, open(tmp, "wb") as f:
        total = int(r.headers.get("Content-Length") or 0)
        done = 0
        while chunk := r.read(1 << 20):
            f.write(chunk)
            done += len(chunk)
            if total:
                print(f"\r  {done / 1e6:7.0f} / {total / 1e6:.0f} MB", end="", flush=True)
    print()
    if size is not None and os.path.getsize(tmp) != size:
        sys.exit(f"{path}: unexpected size {os.path.getsize(tmp)}, expected {size}")
    os.replace(tmp, path)
    return path


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--side", default="right", choices=["right", "left"])
    ap.add_argument("--cache", default=os.path.join("data", "flywire"),
                    help="where the raw downloads are kept")
    ap.add_argument("--out", default=None,
                    help="output file (default connectome/flywire_mb_<side>.npz)")
    args = ap.parse_args()

    import pandas as pd
    import pyarrow as pa
    import pyarrow.compute as pc
    import pyarrow.feather as pf

    os.makedirs(args.cache, exist_ok=True)
    conn_path = download(ZENODO.format(CONNECTIONS[0]),
                         os.path.join(args.cache, CONNECTIONS[0]), CONNECTIONS[1])
    ann_path = download(ANNOTATIONS_URL, os.path.join(args.cache, "neuron_annotations.tsv"))

    ann = pd.read_csv(ann_path, sep="\t", dtype=str)
    ann["root_id"] = ann["root_id"].astype("int64")
    ann = ann.set_index("root_id")
    cls = ann["cell_class"].fillna("")
    ctype = ann["cell_type"].fillna(ann["hemibrain_type"]).fillna("")

    kcs = ann.index[(cls == "Kenyon_Cell") & (ann["side"] == args.side)]
    print(f"{len(kcs)} Kenyon cells in the {args.side} hemisphere")

    print("Reading connections ...", flush=True)
    table = pf.read_table(conn_path, columns=["pre_pt_root_id", "post_pt_root_id", "syn_count"])
    kc_arr = pa.array(kcs.to_numpy(), type=pa.int64())
    mask = pc.or_(pc.is_in(table["pre_pt_root_id"], kc_arr),
                  pc.is_in(table["post_pt_root_id"], kc_arr))
    dan_mbon = pa.array(ann.index[cls.isin(["DAN", "MBON"])].to_numpy(), type=pa.int64())
    mask = pc.or_(mask, pc.and_(pc.is_in(table["pre_pt_root_id"], dan_mbon),
                                pc.is_in(table["post_pt_root_id"], dan_mbon)))
    edges = table.filter(mask).to_pandas()
    # one row per neuron pair (the file has one row per pair and neuropil)
    edges = edges.groupby(["pre_pt_root_id", "post_pt_root_id"], as_index=False).syn_count.sum()
    edges = edges[edges.syn_count >= MIN_SYN]
    pre_cls = edges.pre_pt_root_id.map(cls).fillna("")
    post_cls = edges.post_pt_root_id.map(cls).fillna("")
    kc_index = {k: i for i, k in enumerate(kcs)}

    # ---- inputs onto KCs: excitatory neurons, grouped by cell type ----
    into_kc = edges[edges.post_pt_root_id.isin(kc_index)
                    & ~pre_cls.isin(["Kenyon_Cell", "MBIN", "DAN", "MBON"])].copy()
    into_kc["nt"] = into_kc.pre_pt_root_id.map(ann["top_nt"]).fillna("")
    into_kc = into_kc[into_kc.nt == "acetylcholine"]
    into_kc["type"] = into_kc.pre_pt_root_id.map(ctype)
    into_kc = into_kc[into_kc.type != ""]
    into_kc["kc"] = into_kc.post_pt_root_id.map(kc_index)
    coverage = into_kc.groupby("type").kc.nunique().sort_values(ascending=False)
    pn_types = coverage.index.tolist()
    pn_index = {t: i for i, t in enumerate(pn_types)}
    pn_kc = np.zeros((len(kcs), len(pn_types)), dtype=np.int16)
    for (k, t), n in into_kc.groupby(["kc", "type"]).syn_count.sum().items():
        pn_kc[k, pn_index[t]] = min(n, np.iinfo(np.int16).max)
    first = into_kc.drop_duplicates("type").set_index("type")
    pn_class = [cls.get(first.loc[t, "pre_pt_root_id"], "") or
                ann.loc[first.loc[t, "pre_pt_root_id"], "super_class"] for t in pn_types]
    pn_neurons = into_kc.groupby("type").pre_pt_root_id.nunique().reindex(pn_types).to_numpy()

    # ---- APL ----
    apl = ann.index[(ctype == "APL") & (ann["side"] == args.side)]
    apl_kc = np.zeros(len(kcs), dtype=np.int32)
    e = edges[edges.pre_pt_root_id.isin(apl) & edges.post_pt_root_id.isin(kc_index)]
    for k, n in zip(e.post_pt_root_id.map(kc_index), e.syn_count):
        apl_kc[k] += n

    # ---- KC -> MBON, and the dopamine input of each MBON ----
    out = edges[edges.pre_pt_root_id.isin(kc_index) & (post_cls == "MBON")]
    per_mbon = out.groupby("post_pt_root_id").syn_count.sum()
    mbons = per_mbon[per_mbon >= MIN_MBON_INPUT].sort_values(ascending=False).index
    mbon_index = {m: i for i, m in enumerate(mbons)}
    kc_mbon = np.zeros((len(kcs), len(mbons)), dtype=np.int16)
    out = out[out.post_pt_root_id.isin(mbon_index)]
    for k, m, n in zip(out.pre_pt_root_id.map(kc_index), out.post_pt_root_id.map(mbon_index),
                       out.syn_count):
        kc_mbon[k, m] = n
    dan_family = ctype.str.extract(r"^(PAM|PPL1)")[0]
    dm = edges[(pre_cls == "DAN") & edges.post_pt_root_id.isin(mbon_index)].copy()
    dm["family"] = dm.pre_pt_root_id.map(dan_family)
    fam = dm.groupby(["post_pt_root_id", "family"]).syn_count.sum().unstack(fill_value=0)
    fam = fam.reindex(index=mbons, columns=["PAM", "PPL1"], fill_value=0)
    mbon_pam = fam["PAM"].to_numpy()
    mbon_ppl1 = fam["PPL1"].to_numpy()
    total = np.maximum(mbon_pam + mbon_ppl1, 1)
    # Dopamine depresses KC->MBON synapses in its own compartment, so MBONs in
    # PAM (reward) compartments signal "avoid" and MBONs in PPL1 (punishment)
    # compartments signal "approach".
    valence = np.where(mbon_pam / total >= VALENCE_DOMINANCE, -1,
                       np.where(mbon_ppl1 / total >= VALENCE_DOMINANCE, 1, 0))
    valence[(mbon_pam + mbon_ppl1) < 5] = 0

    dans = ann[(cls == "DAN") & (ann["side"] == args.side)]
    n_pam = int(ctype[dans.index].str.startswith("PAM").sum())
    n_ppl1 = int(ctype[dans.index].str.startswith("PPL1").sum())

    path = args.out or os.path.join("connectome", f"flywire_mb_{args.side}.npz")
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    np.savez_compressed(
        path,
        source=np.array("FlyWire v783 (Dorkenwald et al. 2024; Schlegel et al. 2024), CC-BY 4.0"),
        side=np.array(args.side),
        kc_ids=kcs.to_numpy(), kc_types=np.array(ctype[kcs].tolist()),
        pn_types=np.array(pn_types), pn_class=np.array(pn_class), pn_neurons=pn_neurons,
        pn_kc=pn_kc, apl_kc=apl_kc,
        mbon_ids=mbons.to_numpy(), mbon_types=np.array(ctype[mbons].tolist()),
        mbon_valence=valence.astype(np.int8), mbon_pam=mbon_pam, mbon_ppl1=mbon_ppl1,
        kc_mbon=kc_mbon, n_pam=n_pam, n_ppl1=n_ppl1,
    )
    print(f"{len(pn_types)} excitatory input types, {len(mbons)} MBONs "
          f"({(valence == 1).sum()} approach, {(valence == -1).sum()} avoid), "
          f"{n_pam} PAM and {n_ppl1} PPL1 neurons")
    print(f"Saved {path} ({os.path.getsize(path) / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
