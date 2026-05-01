from flask import Flask
from flask_cors import CORS

from app.routes import register_blueprints
from app.models import db
from app import models

import os


def create_app():
    app = Flask(__name__)

    # =========================
    # CORS
    # =========================
    CORS(app, supports_credentials=True)

    # =========================
    # Config
    # =========================
    app.config.from_object("app.config.Config")

    # Render PostgreSQL compatibility
    database_url = os.getenv("DATABASE_URL")

    if database_url:
        # fix old postgres:// format
        if database_url.startswith("postgres://"):
            database_url = database_url.replace(
                "postgres://",
                "postgresql://",
                1
            )

        app.config["SQLALCHEMY_DATABASE_URI"] = database_url

    # =========================
    # Init database
    # =========================
    db.init_app(app)

    # =========================
    # Register routes
    # =========================
    register_blueprints(app)

    # =========================
    # Create tables
    # =========================
    with app.app_context():
        db.create_all()

    return app