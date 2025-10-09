from flask import Flask, jsonify
from flask_cors import CORS
import json
from pathlib import Path


def load_json(path: Path):
    with path.open('r', encoding='utf-8') as f:
        return json.load(f)


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / 'data'

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:4200",
    "http://127.0.0.1:5174",
    "http://localhost:5002",
    "http://MediSu-MediS-5XPY2MhrDivI-109634141.us-east-1.elb.amazonaws.com"
]}})

print("🚀 Backend Flask iniciado con CORS configurado")
print("📂 Directorio de datos:", DATA_DIR)


@app.get('/routes/clients')
def get_clients():
    print("🔍 Backend: Petición GET /routes/clients recibida")
    try:
        data = load_json(DATA_DIR / 'clients.json')
        print(f"✅ Backend: Clientes cargados exitosamente: {len(data)} registros")
        return jsonify(data)
    except Exception as e:
        print(f"❌ Backend: Error cargando clientes: {e}")
        return jsonify({"error": "Error cargando clientes"}), 500


@app.get('/routes/vehicles')
def get_vehicles():
    print("🚗 Backend: Petición GET /routes/vehicles recibida")
    try:
        data = load_json(DATA_DIR / 'vehicles.json')
        print(f"✅ Backend: Vehículos cargados exitosamente: {len(data)} registros")
        return jsonify(data)
    except Exception as e:
        print(f"❌ Backend: Error cargando vehículos: {e}")
        return jsonify({"error": "Error cargando vehículos"}), 500


@app.get('/health')
def health():
    return {'ok': True}


if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', '5002'))
    app.run(host='0.0.0.0', port=port, debug=True)


