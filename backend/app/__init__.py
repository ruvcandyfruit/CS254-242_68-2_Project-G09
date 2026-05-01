from flask import Flask, jsonify
from flask_cors import CORS
from app.routes import register_blueprints
from app.models import db
from app import models

ALLOWED_ORIGINS = ["http://localhost:5500", "http://localhost:5173"]

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')

    CORS(app,
         supports_credentials=True,
         origins=ALLOWED_ORIGINS,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])

    @app.after_request
    def add_cors(response):
        from flask import request
        req_origin = request.headers.get('Origin', '')
        if req_origin in ALLOWED_ORIGINS:
            response.headers['Access-Control-Allow-Origin'] = req_origin
            response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response

    db.init_app(app)
    register_blueprints(app)

    with app.app_context():
        db.create_all()

    return app