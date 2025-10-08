from flask import Flask, jsonify
from flask_cors import CORS
import json
from pathlib import Path


def load_json(path: Path):
    with path.open('r', encoding='utf-8') as f:
        return json.load(f)


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:4200", "http://127.0.0.1:5174"]}})

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / 'data'


@app.get('/routes/clients')
def get_clients():
    data = load_json(DATA_DIR / 'clients.json')
    return jsonify(data)


@app.get('/routes/vehicles')
def get_vehicles():
    data = load_json(DATA_DIR / 'vehicles.json')
    return jsonify(data)


@app.get('/health')
def health():
    return {'ok': True}


if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', '5001'))
    app.run(host='0.0.0.0', port=port, debug=True)


