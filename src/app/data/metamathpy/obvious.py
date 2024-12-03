def hist(data):
    freqs = {}
    for val in data:
        freqs[val] = freqs.get(val, 0) + 1

    sorted_vals = sorted(freqs.keys())
    sorted_freqs = [freqs[val] for val in sorted_vals]
    print(f"{len(freqs)} unique vals, {np.min(sorted_vals)} to {np.max(sorted_vals)}")

    buckets = {}
    for val, freq in zip(sorted_vals, sorted_freqs):
        bucket = round(val, 1)
        buckets[bucket] = buckets.get(bucket, 0) + freq

    pt.plot(sorted_vals, sorted_freqs, 'k-')
    pt.plot(list(buckets.keys()), list(buckets.values()), 'bo-')

if __name__ == "__main__":

    import os
    import pickle as pk
    import numpy as np
    import matplotlib.pyplot as pt
    from database import parse
    from proof import verify_proof

    do_gen = True
    do_gen = False

    if do_gen:

        fpath = os.path.join(os.environ["HOME"], "metamath", "set.mm")
        db = parse(fpath)
        print("parsed.")
    
        # lengths of rule consequents before and after substitutions
        sublens = []
        rule_labels = []
        for c, claim in enumerate(db.rules.values()):
    
            # if c >= 10000: break
    
            # skip non-$p rules (axioms)
            if claim.consequent.tag != "$p": continue
            print(c, claim.consequent.label)
    
            root, _ = verify_proof(db, claim)
            steps = root.all_steps()

            # grouped by claim
            sublens_c = []
            for step in steps:

                # grouped by step
                sublens_s = []

                sublens_s.append((len(step.rule.consequent.tokens), len(step.conclusion)))
                for lab, dep in step.dependencies.items():
                    sublens_s.append((len(db.statements[lab].tokens), len(dep.conclusion)))

                sublens_c.append(sublens_s)
            sublens.append(sublens_c)
            rule_labels.append(claim.consequent.label)

        with open("obvious.pkl", "wb") as f: pk.dump((sublens, rule_labels), f)

    with open("obvious.pkl", "rb") as f: (sublens, rule_labels) = pk.load(f)

    # ratios = [num/den for sublens_c in sublens for sublens_s in sublens_c for (num, den) in sublens_s]
    # hist(ratios)

    eqlens = [np.mean([
        np.min([before == after for (before, after) in sublens_s])
            for sublens_s in sublens_c])
                for sublens_c in sublens]
    idx = rule_labels.index('infpnlem2')
    print(f"infpnlem2: eqlen = {eqlens[idx]}")

    hist(eqlens)
    # pt.xscale('log')
    pt.yscale('log')
    pt.show()
