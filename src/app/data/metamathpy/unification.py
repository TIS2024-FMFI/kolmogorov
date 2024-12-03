"""
symbols[n]: nth token in symbol string
substitution[v]: symbol string to put in place of symbol v
returns result[n]: nth token after substitutions applied
"""
# @profile
def substitute(symbols, substitution):
    result = ()
    for symbol in symbols:
        if symbol in substitution: result += substitution[symbol]
        else: result += (symbol,)
    return result
# from substitute import substitute # cython version

# a subform function for set.mm
def subform_set(s):
    pass

# unify essential hypotheses of a rule with a sequence of dependencies
# each dependency is a ProofStep object
# also required function handle subform
#   subform(s) returns leading string s[:n] that is a well-formed formula
def unify(rule, dependencies, subform):

    # need enough dependencies to match essential hypotheses
    if len(dependencies) < len(rule.essentials):
        return False, {}

    # match with dependencies at top of stack
    dependencies = dependencies[len(dependencies)-len(rule.essentials):]

    # concatenate single symbol strings for essentials and dependencies
    hyp_tokens, dep_tokens = (), ()
    for hyp, dep in zip(rule.essentials, dependencies):
        hyp_tokens += hyp.tokens
        dep_tokens += dep.conclusion.tokens

    # standardize apart the rule variables, assuming dependencies have no $n tokens
    standardizer = {v: f"${n}" for n, v in enumerate(rule.variables)}
    hyp_tokens = substitute(hyp_tokens, standardizer)

    while hyp_tokens != dep_tokens:
        pass

