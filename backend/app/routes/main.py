import os
import mimetypes
from flask import Blueprint, Response

main_bp = Blueprint('main', __name__)

FRONTEND_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', '..', '..', 'frontend')
)

def _serve(rel_path):
    full = os.path.realpath(os.path.join(FRONTEND_DIR, rel_path))
    # security: block path traversal
    if not full.startswith(FRONTEND_DIR):
        return Response('Forbidden', status=403)
    if not os.path.isfile(full):
        return None
    mime, _ = mimetypes.guess_type(full)
    with open(full, 'rb') as f:
        return Response(f.read(), mimetype=mime or 'application/octet-stream')


@main_bp.route('/', defaults={'path': ''})
@main_bp.route('/<path:path>')
def serve_frontend(path):
    if not path:
        path = 'login/login.html'

    # try exact file first
    resp = _serve(path)
    if resp:
        return resp

    # fallback to login page
    return _serve('login/login.html')
