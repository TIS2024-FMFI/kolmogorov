import itertools as it

"""
Statement
    label: the label of the statement (str)
    tag: the type of statement ("$p", "$a", etc., str)
    tokens[n]: the nth token in the statement math symbol string (str)
    proof[n]: the nth token in the proof (str)
Rule:
    consequent: the rule's conclusion statement
    essentials[n]: the nth essential hypothesis statement
    floatings[n]: the nth floating hypothesis statement
Frame:
    frame[tag][n]: the nth
        constant or variable symbol if tag in "cv"
        list of disjoint variables if tag is "d"
        hypothesis if tag in "ef"
"""
#Statement = namedtuple('Statement', ('label', 'tag', 'tokens', 'proof'))
class Statement:
    def __init__(self, label, tag, tokens, proof):
        self.label = label
        self.tag = tag
        self.tokens = tokens
        self.proof = proof
        self.comment = ""
    
        self.is_referenced_by = set()
        self.proved_from_statements = []
         

    def __str__(self):
        return (
            f"Label: {self.label}\n"
            f"Tag: {self.tag}\n"
            f"Tokens: {' '.join(self.tokens)}\n"
            f"Proof: {' '.join(self.proof) if self.proof else '(no proof)'}\n"
            f"Comment: {self.comment}\n"
        )
        
    def extract_statements_from(self):
            # If proof is a list, join it into a single string
        if isinstance(self.proof, list):
            text = " ".join(self.proof)
        elif isinstance(self.proof, str):
            text = self.proof
        else:
            raise TypeError("The proof must be a string or a list.")

        # Find the portion of the text enclosed in parentheses
        start_idx = text.find("(")
        end_idx = text.find(")")
        
        if start_idx == -1 or end_idx == -1:
            return
        
        # Extract the content within parentheses
        statements_block = text[start_idx + 1:end_idx]
        
        # Split by spaces to get individual statements
        self.proved_from_statements = statements_block.split()
        
    def get_statements(self):
        return self.proved_from_statements
    
    def put_statement_in_ref(self,id):
        self.is_referenced_by.add(id)
    
    def get_is_referenced_by(self):
        return self.is_referenced_by
        
    def get_tag(self):
        return self.label
    
    def get_referenced_by(self):
        return self.is_referenced_by
    


class Rule:
    def __init__(self, consequent, essentials, floatings, disjoint, variables):
        self.consequent = consequent
        self.essentials = essentials
        self.floatings = floatings
        self.disjoint = disjoint
        self.variables = variables
        self.comment = "" 
    def finalize(self):
        self.hypotheses = self.floatings + self.essentials
    def __str__(self):
        s = f"{self.consequent.label} {self.consequent.tag} {' '.join(self.consequent.tokens)} $.\n"
        s += f"disjoint variable sets: {self.disjoint}\n"
        for hypothesis in self.hypotheses:
            s += f"  {hypothesis.label} {hypothesis.tag} {' '.join(hypothesis.tokens)} $.\n"
        return s

def new_frame(): return {tag: [] for tag in "cvdfe"}

class Database:
    def __init__(self):
        self.statements = {} # looks up statements by label
        self.rules = {} # looks up rules by consequent's label

    def print(self, start=0, stop=0):
        if start < 0: start = len(self.rules) + start
        if stop <= 0: stop = len(self.rules) + stop
        for r, rule in enumerate(self.rules.values()):
            if not (start <= r < stop): continue
            print(rule)

    def dump(self, fname):
        tokens = set([tok for stmt in self.statements.values() for tok in stmt.tokens])
        variables = set([var for rule in self.rules.values() for var in rule.variables])
        constants = tokens - variables
        
    def fill_references(self):
        for statement in self.statements:
            proved_from = self.statements[statement].proved_from_statements
            stat = self.statements[statement]
            for proof_statement in proved_from:
                self.statements[proof_statement].put_statement_in_ref(stat.get_tag())
            

def parse(fpath, max_rules=-1, last_rule=""):
    db = Database()
        
    # import os
    # fpath = os.path.join("uploads","set.mm")
    
    in_comment = False  # whether currently in comment
    current_tag = None  # most recent tag (excluding comments)
    label = None  # most recent label
    statement = None  # most recent statement
    rule = None  # most recent rule
    frames = [new_frame()]  # stack of frames in current scope
    current_comment = ""  # stores the current comment

    with open(fpath, "r") as f:
        
        for n, line in enumerate(f):
            if len(db.rules) == max_rules: break
            if rule is not None and rule.consequent.label == last_rule: break

            for token in line.strip().split():

                # skip comments and store them
                if token == "$(":
                    in_comment = True
                    current_comment = ""  # reset current comment
                elif token == "$)":
                    in_comment = False
                if in_comment:
                    current_comment += token + " "
                    continue

                # update scope
                if token == "${": frames.append(new_frame())
                elif token == "$}": frames.pop()

                # initialize declarations
                elif token in ("$c", "$v", "$d"):
                    statement = Statement(label, token, [], [])
                    statement.comment = current_comment.strip()  # associate comment
                    current_comment = ""  # reset after associating

                # initialize labeled statements
                elif token in ("$f", "$e", "$a", "$p"):
                    assert label is not None, \
                        f"line {n+1}: {token} not preceded by label"

                    statement = Statement(label, token, [], [])
                    statement.comment = current_comment.strip()  # associate comment
                    current_comment = ""  # reset after associating
                    db.statements[label] = statement

                # handle non-tag tokens
                elif token[0] != "$":

                    # update label
                    label = token

                    # update statements
                    if current_tag is not None:
                        if current_tag in "cvdfeap":
                            statement.tokens.append(token)
                        elif current_tag == "=":
                            statement.proof.append(token)

                # handle completed statements and rules
                elif token == "$.":

                    # update frame
                    if current_tag in "cv":
                        frames[-1][current_tag].extend(statement.tokens)
                    if current_tag == "d":
                        frames[-1][current_tag].append(sorted(statement.tokens))
                    if current_tag in "fe":
                        frames[-1][current_tag].append(statement)

                    # include placeholder "rules" for hypotheses
                    if current_tag in "fea=":
                        rule = Rule(statement, [], [], set(), set())

                    # attach scope to axioms and propositions
                    if current_tag in "a=":

                        # get all variables and essential hypotheses in current scope
                        for frame in frames:
                            rule.variables.update(frame["v"])
                            rule.essentials.extend(frame["e"])

                        # identify mandatory variables
                        tokens = set(statement.tokens)
                        for essential in rule.essentials:
                            tokens.update(essential.tokens)
                        mandatory = rule.variables & tokens

                        # save mandatory floating hypotheses
                        for frame in frames:
                            for floating in frame["f"]:
                                if floating.tokens[1] in mandatory:
                                    rule.floatings.append(floating)

                        # get disjoint variable pairs
                        for frame in frames:
                            for disjoint in frame["d"]:
                                rule.disjoint.update(it.combinations(disjoint, 2))

                    # add completed statements and finalized rules to database
                    if current_tag in "fea=":
                        rule.finalize()
                        db.statements[statement.label] = statement
                        db.rules[statement.label] = rule
                    statement.extract_statements_from()

                # update current tag
                if token[0] == "$" and token[1] not in "()": current_tag = token[1]
                if current_tag in ("$.", "$}"): current_tag = None
                
    db.fill_references()
    return db

if __name__ == "__main__":

    import os

    fpath = os.path.join(os.environ["HOME"], "metamath", "set.mm")

    db = parse(fpath)
    
    #db.fill_references()

    print(db.statements["2p2e4"])
    print(db.statements["2p2e4"].is_referenced_by)
    print("---------")
    print(db.statements["2p2e4"].proved_from_statements)
    #print(db.statements["ax-mp"].get_referenced_by())
    #print(f"{len(db.statements)} statements total, {len(db.rules)} rules total")

    # for (label, stmt) in db.statements.items():
    #     print(label, stmt)
    
    # print(db.rules['df-alsc'])
    # print(db.rules['alsconv'])

