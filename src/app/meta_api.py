from .data.metamathpy import database as md
from .data.metamathpy.proof import verify_proof
import os

class MetaMathAPI:
    def __init__(self):
        self.db = None

    def parse_database(self, fpath):
        if not os.path.exists(fpath):
           return "Error: File not found."
        try:
            print("TU SOM ~SA DOSTAL")
            self.db = md.parse(fpath)
            return "Database parsed successfully."
        except Exception as e:
            return f"Error: Failed to parse database: {str(e)}"

    def give_statement(self, label):
        try:
            statement = self.db.statements.get(label)
            if not statement:
                return "Error: Statement not found."
            return statement
        except Exception as e:
            return f"Error: {str(e)}"

    def give_proof(self, label):
        try:
            statement = self.give_statement(label)
            if isinstance(statement, str):
                return statement
            if not statement.proof:
                return "Error: Proof not found for the given statement."
            return statement.proof
        except Exception as e:
            return f"Error: {str(e)}"

    def give_description(self, label):
        try:
            statement = self.give_statement(label)
            if isinstance(statement, str):
                return statement
            return statement.comment
        except Exception as e:
            return f"Error: {str(e)}"

    def list_statements(self):
        try:
            return list(self.db.statements.keys())
        except Exception as e:
            return f"Error: {str(e)}"

    def list_rules(self):
        try:
            return list(self.db.rules.keys())
        except Exception as e:
            return f"Error: {str(e)}"

    def verify_statement(self, label):
        try:
            rule = self.db.rules.get(label)
            if not rule:
                return "Error: Rule not found."
            root, proof_steps = verify_proof(self.db, rule)
            return "Proof verified successfully."
        except Exception as e:
            return f"Error: {str(e)}"
        

# Example usage
if __name__ == "__main__":
    db_path = os.path.join(os.environ["HOME"], "metamath", "set.mm")
    api = MetaMathAPI()

    # Example calls
    print("------start-----")
    print(api.parse_database(db_path))
    print("-----------")
    print(api.give_statement("pythag"))
    print("-----------")
    print(api.give_proof("pythag"))
    print("-----------")
    print(api.give_description("pythag"))
    print("-----------")
    #print(api.list_statements())
    print("-----------")
    #print(api.list_rules())
    print("-----------")
    print(api.verify_statement("a1i"))