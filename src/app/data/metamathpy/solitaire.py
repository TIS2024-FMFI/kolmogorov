from .setmm import load_pl
from .environment import Environment

def print_env(env):
    print("proof: " + " ".join(map(str, env.proof)))
    print("stack:")
    for s, step in enumerate(env.stack):
        print(" ", s, step)
    print(f"{len(env.proof)} steps so far...\n")

if __name__ == "__main__":

    db = load_pl()
    envs = [Environment(db)]
    
    while True:
        label = input("Enter label (q to quit, r to restart, u to undo, 0<i> for index): ")

        if label == "q":
            break

        if label == "r":
            envs = [Environment(db)]
            continue

        if label == "u":
            if len(envs) > 1:
                envs = envs[:-1]
                print_env(envs[-1])
            continue

        if label[0] != "0" and label not in db.rules:
            print("No rule called {label}, try again.")
            continue

        if label[0] == "0": label = int(label)

        env = envs[-1].copy()
        _, msg = env.step(label)

        if msg != "":
            print("Invalid rule: " + msg)
            print("try again.")
            continue

        envs.append(env)

        print_env(env)    
