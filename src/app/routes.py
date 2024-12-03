# routes.py
from flask import render_template, request, redirect, url_for, flash, jsonify, Blueprint, current_app # type: ignore
from werkzeug.utils import secure_filename # type: ignore
import os
#from . import app, meta_api

bp = Blueprint('routes', __name__)

def home():
    return render_template('welcome.html')

def upload_file():
    if request.method == 'POST':
        file = request.files.get('file')
        if not file:
            return jsonify({'error': 'No file uploaded'}), 400
        if not file.filename.endswith('.mm'):
            return jsonify({'error': 'Wrong file format'}), 400

        upload_path = os.path.join('uploads', file.filename)
        os.makedirs(os.path.dirname(upload_path), exist_ok=True)

        file.save(upload_path)

        meta = current_app.config['metamath_api']
        try:
            result = meta.parse_database(upload_path)
            if "Error" in result:
                return jsonify({'error': result}), 400
        except Exception as e:
            return jsonify({'error': str(e)}), 500

        return jsonify({'message': 'File uploaded successfully'})  # Return JSON for fetch

    # For GET requests, render the `theory.html`
    return render_template('theory.html')

def test():
    return render_template('theory.html')



def get_statement():
    print("TAK TU SOM TAK TU SOM")
    data = request.get_json()
    label = data.get('label', '').strip()

    if not label:
        return jsonify({'error': 'Statement ID is required'}), 400

    # Get the MetaMathAPI instance from the app config
    api = current_app.config['metamath_api']

    # Get the statement using the give_statement method
    statement = api.give_statement(label)

    if isinstance(statement, str):  # If the result is an error message
        return jsonify({'error': statement}), 400

    # Return the statement (you can return other details as well)
    return jsonify({'statement': str(statement)})