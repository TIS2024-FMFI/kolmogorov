from flask import Flask # type: ignore

from .routes import home, parse_database, get_statement, theory, parse_set_mm, graph, get_statements_batch, search_statements

def create_app():
    app = Flask(__name__)
    
    app.add_url_rule('/', 'home', home, methods=['GET'])
    app.add_url_rule('/theory', 'theory', theory, methods=['GET'])
    
    app.add_url_rule('/parse_database', 'parse_database', parse_database, methods=['POST'])
    app.add_url_rule('/statement/<label>', 'get_statement', get_statement, methods=['GET'])
    app.add_url_rule('/parse_set_mm', 'parse_set_mm', parse_set_mm, methods=['POST'])
    app.add_url_rule('/graph', 'graph', graph, methods=['GET'])

    app.add_url_rule('/search/<query>', 'search_statements', search_statements, methods=['GET'])

    app.add_url_rule('/statements/batch', 'get_statements_batch', get_statements_batch, methods=['POST'])

    return app
