"""
data structure:

    label -> floating | essential | axiom | proposition
    floating: (label, symbol, type)
    essential: (label, symbols)
    axiom: (label, symbols)
    proposition: (label, symbols, hypotheses, proof)

    scopes? constants? variables? proofs?

"""
from collections import namedtuple
import numpy as np
import os

Declaration = namedtuple("Declaration", ("block", "tag", "symbols"))
Hypothesis = namedtuple("Hypothesis", ("block", "label", "tag", "symbols"))
Axiom = namedtuple("Axiom", ("block", "label", "tag", "symbols"))
Proposition = namedtuple("Proposition", ("block", "label", "tag", "symbols", "proof"))
Scope = namedtuple("Scope", ("c", "v", "d", "f", "e"))

class Rule:
    def __init__(self, conclusion_label, hypothesis_labels):
        self.conclusion = conclusion_label
        self.hypotheses = hypothesis_labels

class Block:
    def __init__(self, parent):
        self.parent = parent
        self.children = []

    def __repr__(self):
        return "${...$}"

    def parent_block(self):
        return self.parent

    def add_sub_block(self):
        self.children.append(Block(parent = self))
        return self.children[-1]

    def add_statement(self, tag, label=None):

        if tag in ("$c", "$v", "$d"):
            statement = Declaration(self, tag, [])
        elif tag == "$p":
            statement = Proposition(self, label, tag, [], [])
        elif tag == "$a":
            statement = Axiom(self, label, tag, [])
        else:
            statement = Hypothesis(self, label, tag, [])

        self.children.append(statement)
        return statement

    def get_scope(self, statement):
        if self.parent == None:
            scope = Scope([], [], [], [], [])
        else:
            scope = self.parent.get_scope(self)

        for child in self.children:
            if child is statement: break
            if type(child) == Block: continue
            if child.tag == "$c": scope.c.extend(child.symbols)
            if child.tag == "$v": scope.v.extend(child.symbols)
            if child.tag == "$f": scope.f.append(child)
            if child.tag == "$e": scope.e.append(child)

        return scope

    def print(self, prefix):
        for child in self.children:
            if type(child) == Block:
                print(prefix + "${")
                child.print(prefix + " ")
                print(prefix + "$}")

            if type(child) == Declaration:
                print(f"{prefix}{child.tag} {' '.join(child.symbols)} $.")
    
            if type(child) == Hypothesis:
                print(f"{prefix}{child.label} {child.tag} {' '.join(child.symbols)} $.")
    
            if type(child) == Proposition:
                print(f"{prefix}{child.label} {child.tag} {' '.join(child.symbols)} $= {' '.join(child.proof)} $.")

class Database:
    def __init__(self):
        self.root_block = Block(parent=None)
        self.statements = {} # looks up statements by label
        self.rules = {} # looks up rules by conclusion's label
    def get_statement(self, label):
        return self.statements[label]
    def get_rule(self, label):
        return self.rules[label]
    def print(self):
        self.root_block.print(prefix = "")

def parse(fpath):

    db = Database()
    block = db.root_block # current database block

    # parser state
    in_comment = False # True if currently in a comment
    in_symbol_list = False # True if currently in a symbol list
    in_proof = False # True if currently in a proof
    label = None # most recent label
    statement = None # most recent statement
    hypotheses = [[]] # stack of hypotheses in current scope

    with open(fpath, "r") as f:
        for n, line in enumerate(f):
            for token in line.strip().split():

                # comments
                if token == "$(": in_comment = True
                if token == "$)": in_comment = False
                if in_comment: continue

                # end of symbol lists or proofs
                if token == "$.":
                    in_symbol_list = in_proof = False

                # scope
                if token == "${":
                    block = block.add_sub_block()
                    hypotheses.append([])
                if token == "$}":
                    block = block.parent_block()
                    hypotheses.pop()

                # declarations
                if token in ("$c", "$v", "$d"):
                    statement = block.add_statement(tag=token, label=None)
                    in_symbol_list = True

                # labeled statements
                if token in ("$f", "$e", "$a", "$p"):
                    assert label != None, \
                           f"line {n+1}: {token} not preceded by label"

                    statement = block.add_statement(tag=token, label=label)
                    db.statements[label] = statement
                    in_symbol_list = True

                    if token in ("$f", "$e"):
                        hypotheses[-1].append(label)
                    else:
                        hyps = [lab for hyps in hypotheses for lab in hyps]
                        db.rules[label] = Rule(label, hyps)

                if token == "$=":
                    in_symbol_list = False
                    in_proof = True
                    assert type(statement) == Proposition, \
                           f"line {n+1}: non-proposition with a proof"

                if token[0] != "$":
                    assert "$" not in token, \
                           f"line {n+1}: '$' not allowed in middle of {token}"

                    if in_symbol_list:
                        statement.symbols.append(token)
                    elif in_proof:
                        statement.proof.append(token)
                    else:
                        label = token

    return db

if __name__ == "__main__":

    fpath = os.path.join(os.environ["HOME"], "metamath", "set.mm")
    # fpath = 'badparse.mm'

    db = parse(fpath)

    # print(db)
    # dbprint(db[-100:])
    db.root_block.children = db.root_block.children[-100:]
    db.print()

    print(f"{len(db.statements)} statements total")
    

    # ### numpy stuff

    # print("loading...")

    # # with open(fpath, "r") as f: raw = f.read()
    # # tokens = raw.split()
    # # line_numbers = []

    # tokens = []
    # line_numbers = []
    # with open(fpath, "r") as f:
    #     for n, line in enumerate(f):
    #         line_tokens = line.strip().split()
    #         tokens.extend(line_tokens)
    #         line_numbers.extend([n]*len(line_tokens))

    # tokens = np.array(tokens)
    # line_numbers = np.array(line_numbers)

    # print(len(tokens))
    # print(len(line_numbers))

    # print("removing comments...")

    # comments = ((tokens == "$(").cumsum() - (tokens == "$)").cumsum()) > 0
    # keep = ~comments & ~(tokens == "$)")    
    # tokens = tokens[keep]
    # line_numbers = line_numbers[keep]

    # print(len(tokens))
    # print(len(line_numbers))

    # print("calculating scope depths...")
    # scope_depth = ((tokens == "${").cumsum() - (tokens == "$}").cumsum())
    # keep = ~(tokens == "${") & ~(tokens == "$}")
    # tokens = tokens[keep]
    # line_numbers = line_numbers[keep]

    # print(len(tokens))
    # print(len(line_numbers))

    # # raw = " ".join(tokens)
    # # assert raw[1:].count("$") == raw.count(" $")

    
