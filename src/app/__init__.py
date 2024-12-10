from flask import Flask # type: ignore
from .routes import home

def create_app():
    app = Flask(__name__)
    
    app.add_url_rule('/', 'home', home, methods=['GET', 'POST'])
    
    return app
