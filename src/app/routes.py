from flask import render_template, Flask, request, jsonify # type: ignore
from werkzeug.utils import secure_filename
import os
from .DataHandler import DataHandler

app = Flask(__name__)
data_handler = DataHandler()

# Configure upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def home():
    return render_template('welcome.html')

def theory():
    return render_template('theory.html')

def graph():
    return render_template('graph.html')


def parse_database():
    """Endpoint to parse a Metamath database file."""
    if 'file' not in request.files:
        return jsonify({"message": "No file provided"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "No file selected"}), 400
        
    if not file.filename.endswith('.mm'):
        return jsonify({"message": "Invalid file format. Please upload .mm file"}), 400

    try:
        # Save file securely
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Parse the saved file
        result = data_handler.parse_database(filepath)
        
        # Optionally clean up the file after parsing
        # os.remove(filepath)
        
        return jsonify({"message": result})
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500


def get_statement(label):
    """Endpoint to fetch a statement by label."""
    try:
        statement = data_handler.get_statement(label)
        if isinstance(statement, str):
            return jsonify({"error, statement probably not found": statement}), 404
        
        # Return statement details as JSON 
        return jsonify({
            "id": label,
            "description": statement.comment,
            "proof": statement.proof,
            "type": statement.tag,
            "referencedBy": list(statement.is_referenced_by),  
            "provedFrom": statement.proved_from_statements 
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def parse_set_mm():
    """Endpoint to parse the predefined set.mm file."""
    try:
        # Path to the predefined set.mm file
        filepath = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'set.mm')
        if not os.path.exists(filepath):
            return jsonify({"message": "Predefined set.mm file not found"}), 404
            
        result = data_handler.parse_database(filepath)
        return jsonify({"message": result})
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500

# Add this to create_app() in __init__.py
app.add_url_rule('/parse_set_mm', 'parse_set_mm', parse_set_mm, methods=['POST'])