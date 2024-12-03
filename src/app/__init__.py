from flask import Flask # type: ignore
from .routes import home, upload_file, test, get_statement
from .meta_api import MetaMathAPI

def create_app():
    app = Flask(__name__)

    app.config['metamath_api'] = MetaMathAPI()

    from app.routes import bp
    app.register_blueprint(bp)
    
    # Initialize routes and other components
    app.add_url_rule('/', 'home', home, methods=['GET', 'POST'])
    app.add_url_rule('/test', 'test', test, methods=['GET', 'POST'])
    app.add_url_rule('/upload', 'upload_file', upload_file, methods=['GET', 'POST'])
    app.add_url_rule('/get_statement', 'get_statement', get_statement, methods=['POST'])

    return app
