from .data import metamath as md
import os
from fuzzywuzzy import fuzz

class DataHandler:
    def __init__(self):
        self.db = None
        
    def parse_database(self, fpath):
        try:
            self.db = md.parse(fpath)
            return "Database parsed successfully."
        except Exception as e:
            return f"Error: Failed to parse database: {str(e)}"
        
    def findStatements(self, prompt):
        if not self.db or not prompt:
            return []
        
        prompt = prompt.lower().strip()
        matches = []
        
        # Split prompt into words for multi-word matching
        prompt_words = prompt.split()
        
        for label, statement in self.db.statements.items():
            description = statement.comment if hasattr(statement, 'comment') else ""
            score = 0
            
            # Fuzzy matching for label
            label_ratio = fuzz.ratio(prompt, label.lower())
            partial_label_ratio = fuzz.partial_ratio(prompt, label.lower())
            
            # Multi-word matching for label
            label_word_scores = []
            for word in prompt_words:
                word_ratio = fuzz.partial_ratio(word, label.lower())
                label_word_scores.append(word_ratio)
            avg_word_score = sum(label_word_scores) / len(label_word_scores) if label_word_scores else 0
            
            # Fuzzy matching for description
            desc_ratio = 0
            partial_desc_ratio = 0
            desc_word_scores = []
            if description:
                desc_ratio = fuzz.ratio(prompt, description.lower())
                partial_desc_ratio = fuzz.partial_ratio(prompt, description.lower())
                
                # Multi-word matching for description
                for word in prompt_words:
                    word_ratio = fuzz.partial_ratio(word, description.lower())
                    desc_word_scores.append(word_ratio)
            avg_desc_word_score = sum(desc_word_scores) / len(desc_word_scores) if desc_word_scores else 0
            
            # Calculate total score
            if label_ratio > 80:  # Almost exact match
                score += 50
            elif label_ratio > 60:  # Similar match
                score += 30
            elif partial_label_ratio > 80:  # Good partial match
                score += 20
            
            # Add multi-word match scores
            if avg_word_score > 80:
                score += 25
            elif avg_word_score > 60:
                score += 15
            
            # Add description match scores
            if desc_ratio > 80:
                score += 15
            elif partial_desc_ratio > 80:
                score += 10
            
            # Add multi-word description match scores
            if avg_desc_word_score > 80:
                score += 10
            elif avg_desc_word_score > 60:
                score += 5
            
            # Add bonus for substring matches
            if prompt in label.lower():
                score += 15
            if description and prompt in description.lower():
                score += 5
            
            if score > 0:
                matches.append({
                    'label': label,
                    'score': score,
                    'description': description,
                    'match_details': {
                        'label_ratio': label_ratio,
                        'partial_label_ratio': partial_label_ratio,
                        'avg_word_score': avg_word_score,
                        'desc_ratio': desc_ratio,
                        'partial_desc_ratio': partial_desc_ratio,
                        'avg_desc_word_score': avg_desc_word_score
                    }
                })
        
        # Sort by score in descending order
        matches.sort(key=lambda x: x['score'], reverse=True)
        
        # Return top 5 matches
        return matches[:10]
        
    def get_statement(self, label):
        try:
            statement = self.db.statements.get(label)
            if not statement:
                return "Error: Statement not found."
            return statement
        except Exception as e:
            return f"Error: {str(e)}"