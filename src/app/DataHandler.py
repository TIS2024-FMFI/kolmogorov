from .data import metamath as md
import os

class DataHandler:
    def __init__(self):
        self.db = None
        
    def parse_database(self, fpath):
        if not os.path.exists(fpath):
           return "Error: File not found."
        try:
            self.db = md.parse(fpath)
            return "Database parsed successfully."
        except Exception as e:
            return f"Error: Failed to parse database: {str(e)}"
        
    def findStatements(self, prompt):
        return "Not implemented"
    
    def get_statement(self, label):
        try:
            statement = self.db.statements.get(label)
            if not statement:
                return "Error: Statement not found."
            return statement
        except Exception as e:
            return f"Error: {str(e)}"
        
    def get_description(self, label):
        try:
            statement = self.get_statement(label)
            if isinstance(statement, str):
                return statement
            return statement.comment
        except Exception as e:
            return f"Error: {str(e)}"
        
    def get_proof(self, label):
        try:
            statement = self.get_statement(label)
            if isinstance(statement, str):
                return statement
            return statement.proof
        except Exception as e:
            return f"Error: {str(e)}"
        
    
    def get_tag(self, label):
        try:
            statement = self.get_statement(label)
            if isinstance(statement, str):
                return statement
            return statement.tag
        except Exception as e:
            return f"Error: {str(e)}"
        
    def list_statements(self):
        try:
            return list(self.db.statements.keys())
        except Exception as e:
            return f"Error: {str(e)}"