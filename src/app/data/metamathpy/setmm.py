import os
from ..metamathpy import database as md

def load_imp(fpath = None):
    # last label before any ax-3 proofs is loowoz
    print('loading..')
    if fpath is None:
        fpath = os.path.join(os.environ["HOME"], "metamath", "set.mm")
    db = md.parse(fpath, last_rule="loowoz")
    # negation wffs and ax-3 not used
    db.rules.pop("wn")
    db.rules.pop("ax-3")
    return db

def load_ni(fpath = None):
    # last label before any new boolean operator definitions is bijust, "rule" 441
    print('loading..')
    if fpath is None:
        fpath = os.path.join(os.environ["HOME"], "metamath", "set.mm")
    db = md.parse(fpath, last_rule="bijust")
    return db

def load_pl(fpath = None):

    # last label before any FOL (universal quantifier) is xorexmid, it is "rule" 2849 (including hypotheses)
    print('loading..')
    if fpath is None:
        fpath = os.path.join(os.environ["HOME"], "metamath", "set.mm")
    db = md.parse(fpath, last_rule="xorexmid")
    return db

def load_all(fpath = None):
    print('loading..')
    if fpath is None:
        fpath = os.path.join(os.environ["HOME"], "metamath", "set.mm")
    db = md.parse(fpath)
    return db

if __name__ == "__main__":

    # db = load_imp()
    # db = load_ni()
    db = load_pl()
    db.print()

