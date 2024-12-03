from metamathpy.database import parse
from metamathpy.proof import verify_proof

if __name__ == "__main__":

    import os
    fpath = os.path.join(os.environ["HOME"], "metamath", "set.mm")
    db = parse(fpath)
    print("parsed.")

    # needs outer loop over all proofs in db, and all wrapped in helper function
    rule = db.rules["a1i"]
    _, proof_steps = verify_proof(db, rule)

    examples = []
    for proof_step in proof_steps.values():

        prompt = " ".join(proof_step.conclusion)
        for hyp in rule.essentials:
            prompt += " " + " ".join(hyp.tokens)

        output = " ".join(proof_step.rule.consequent.tokens)
        for hyp in proof_step.rule.essentials:
            output += " " + " ".join(hyp.tokens)

        examples.append( (prompt, output) )

    for n, (prompt, output) in enumerate(examples):
        print(n)
        print(prompt)
        print(output)
        

