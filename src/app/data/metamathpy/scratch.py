import os

def remove_comments(raw):

    # separate into chunks starting with comment text (except first)
    split = raw.split("$(")
    line = split[0].count(os.linesep) + 1 # track line numbers for error message
    
    # remove leading comment text from each chunk
    for i in range(1, len(split)):
    
        # get endpoint of leading comment, crash if unbalanced
        close = split[i].find("$)")
        assert close > -1, f"unbalanced '$(' starting on line {line}"
    
        # update line count and remove leading comment
        line += split[i].count(os.linesep)
        split[i] = split[i][close+2:]
    
    # join back into text with comments removed
    return "".join(split)

fpath = os.path.join(os.environ["HOME"], "metamath", "set.mm")
# fpath = 'badparse.mm'

with open(fpath, "r") as f: raw = f.read()

# # ### with re.sub?
# import re
# commentless = re.sub(r"\$\(.+?\$\)", "", raw)

commentless = remove_comments(raw)

tokens = commentless.split()

print(tokens[:20])
        



