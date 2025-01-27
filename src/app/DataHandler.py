from .data import metamath as md
import os
from fuzzywuzzy import fuzz # type: ignore

class DataHandler:
    def __init__(self):
        self.db = None
        self.search_index = {}  # Add search index
        
    def parse_database(self, fpath):
        try:
            self.db = md.parse(fpath)
            self._build_search_index()  # Build index after parsing
            return "Database parsed successfully."
        except Exception as e:
            return f"Error: Failed to parse database: {str(e)}"
        
    def _build_search_index(self):
        """Build search index for faster lookups"""
        self.search_index = {}
        
        # Keywords that indicate important mathematical content
        math_keywords = {'theorem', 'rule', 'law', 'formula', 'equation', 'lemma'}
        
        # Keywords that indicate helper/implementation statements
        helper_keywords = {'inference', 'implementation', 'helper', 'internal', 'development'}
        
        for label, statement in self.db.statements.items():
            description = statement.comment if hasattr(statement, 'comment') else ""
            desc_lower = description.lower()
            
            # Calculate statement importance
            importance = 1.0
            
            # Boost importance for statements with mathematical keywords
            if any(keyword in desc_lower for keyword in math_keywords):
                importance *= 2.0
                
            # Reduce importance for helper statements
            if any(keyword in desc_lower for keyword in helper_keywords):
                importance *= 0.3
                
            # Reduce importance for statements with implementation-related names
            if any(x in label.lower() for x in ['impl', 'ii', 'lem', 'helper']):
                importance *= 0.2
                
            # Boost importance for statements with Wikipedia references
            if 'wikipedia' in desc_lower:
                importance *= 1.5
                
            # Boost importance for statements with longer, meaningful descriptions
            if len(description) > 100 and not description.startswith("This inference"):
                importance *= 1.5
                
            self.search_index[label.lower()] = {
                'label': label,
                'description': description,
                'importance': importance,
                'tokens': set(label.lower().split() + desc_lower.split())
            }
        
    def findStatements(self, prompt):
        if not self.db or not prompt:
            return []
        
        prompt = prompt.lower().strip()
        prompt_tokens = set(prompt.split())
        matches = []
        
        # Common abbreviations and variations mapping
        common_variations = {
            'axiom': ['ax'],
            'theorem': ['thm', 'th'],
            'pythagorean': ['pythag', 'pyth'],
            'equation': ['eq'],
            'definition': ['def', 'dfn', 'df'],
            'addition': ['add'],
            'multiplication': ['mult', 'mul'],
            'subtraction': ['sub'],
            'division': ['div'],
            'number': ['num'],
            'square': ['sq'],
            'mathematics': ['math'],
            'function': ['func', 'fn'],
            'property': ['prop'],
            'example': ['ex'],
            'sequence': ['seq'],
            'polynomial': ['poly']
        }
        
        # Expand search tokens with variations
        expanded_tokens = set(prompt_tokens)
        for token in prompt_tokens:
            # Add common abbreviations
            for full, abbrevs in common_variations.items():
                if token == full:
                    expanded_tokens.update(abbrevs)
                elif token in abbrevs:
                    expanded_tokens.add(full)
                
        for indexed_data in self.search_index.values():
            score = 0
            label = indexed_data['label'].lower()
            description = indexed_data['description'].lower()
            importance = indexed_data['importance']
            
            # Exact matches get highest priority
            if prompt == label:
                score = 1000
            
            # ID/label matching with expanded tokens
            label_tokens = set(label.split())
            token_matches = expanded_tokens & label_tokens
            if token_matches:
                # More matches = higher score
                score += len(token_matches) * 400
                # Bonus for consecutive token matches
                if any(all(token in label for token in consecutive_tokens) 
                      for consecutive_tokens in zip(prompt_tokens, prompt_tokens[1:])):
                    score += 200
            
            # Main theorem/rule name matches
            if any(f"{token} rule" in description or f"{token} theorem" in description 
                    for token in expanded_tokens):
                score += 800
                
            # Direct substring matches in label
            if prompt in label:
                score += 500
                
            # Token matching with position importance
            for token in expanded_tokens:
                if token in label:
                    # Tokens at start of label are more important
                    if label.startswith(token):
                        score += 300
                    else:
                        score += 150
                        
                if token in description:
                    # Tokens in first sentence are more important
                    first_sentence = description.split('.')[0]
                    if token in first_sentence:
                        score += 200
                    else:
                        score += 50
            
            # Apply importance multiplier
            score *= importance
            
            if score > 0:
                matches.append({
                    'label': indexed_data['label'],
                    'score': score,
                    'description': indexed_data['description']
                })
        
        # Sort by score and return top 10
        return sorted(matches, key=lambda x: x['score'], reverse=True)[:10]
        
    def get_statement(self, label):
        try:
            statement = self.db.statements.get(label)
            if not statement:
                return "Error: Statement not found."
            return statement
        except Exception as e:
            return f"Error: {str(e)}"