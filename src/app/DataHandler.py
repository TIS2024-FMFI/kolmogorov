from .data import metamath as md
import os

class DataHandler:
    def __init__(self):
        self.db = None
        
    def parse_database(self, fpath):
        try:
            self.db = md.parse(fpath)
            return "Database parsed successfully."
        except Exception as e:
            return f"Error: Failed to parse database: {str(e)}"
        
    def findStatements(self, prompt): #prompt search engine 
        return "Not implemented"
    
    def get_statement(self, label):
        try:
            statement = self.db.statements.get(label)
            if not statement:
                return "Error: Statement not found."
            return statement
        except Exception as e:
            return f"Error: {str(e)}"