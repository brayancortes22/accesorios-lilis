import urllib.request
import urllib.error
import json

"""
Suite de pruebas automatizadas de protección contra bots y scraping malicioso:
1. Detección de trampa Honeypot (rechazo inmediato si un bot llena el campo oculto).
2. Bloqueo de mutaciones con User-Agent vacío (HTTP 403).
3. Bloqueo de firmas de escáneres de hacking y bots maliciosos (sqlmap, nikto, etc.) (HTTP 403).
4. Procesamiento normal y exitoso de pedidos legítimos con navegador/cliente válido.
"""

BASE_URL = "http://localhost:5000/api"

def run():
    print("==========================================================")
    print("      TEST: PROTECCIÓN INTEGRAL CONTRA BOTS Y SCRAPERS    ")
    print("==========================================================")

    # 1. PRUEBA DE TRAMPA HONEYPOT
    print("\n[Paso 1] Probando trampa invisible Honeypot en pedidos...")
    bot_order_payload = {
        "clientName": "Bot Spammer",
        "phone": "3000000000",
        "city": "Algeciras",
        "notes": "Intento de bot masivo",
        "trapField": "auto_filled_by_bot_crawler_123",
        "items": [
            {
                "id": 1,
                "name": "Aretes Flor Tejidos a Mano",
                "price": 35000,
                "quantity": 1
            }
        ]
    }

    req_honeypot = urllib.request.Request(
        f"{BASE_URL}/orders",
        data=json.dumps(bot_order_payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
    )

    try:
        urllib.request.urlopen(req_honeypot)
        assert False, "ERROR: La orden con campo Honeypot relleno debió ser rechazada!"
    except urllib.error.HTTPError as e:
        assert e.code == 400, f"Se esperaba HTTP 400 para Honeypot, se obtuvo {e.code}"
        content = e.read().decode("utf-8")
        print(f"  - Código HTTP: {e.code}")
        print(f"  - Mensaje de respuesta: {content}")
        assert "automatizada sospechosa" in content or "actividad automatizada" in content.lower()
        print("  -> EXITOSO: El bot cayó en la trampa Honeypot y fue neutralizado antes de tocar stock.")

    # 2. PRUEBA DE BLOQUEO POR USER-AGENT VACÍO
    print("\n[Paso 2] Probando bloqueo de petición de mutación sin User-Agent...")
    req_no_ua = urllib.request.Request(
        f"{BASE_URL}/orders",
        data=json.dumps(bot_order_payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "User-Agent": ""
        }
    )

    try:
        urllib.request.urlopen(req_no_ua)
        assert False, "ERROR: Debió rechazar la petición POST sin User-Agent!"
    except urllib.error.HTTPError as e:
        assert e.code == 403, f"Se esperaba HTTP 403 Forbidden para UA vacío, se obtuvo {e.code}"
        content = e.read().decode("utf-8")
        print(f"  - Código HTTP: {e.code}")
        print(f"  - Mensaje: {content}")
        assert "User-Agent" in content
        print("  -> EXITOSO: Petición sin User-Agent bloqueada perimetralmente con HTTP 403.")

    # 3. PRUEBA DE BLOQUEO POR HERRAMIENTAS DE ESCANEO / HACKING CONOCIDAS (sqlmap)
    print("\n[Paso 3] Probando bloqueo por firma de herramienta maliciosa (sqlmap)...")
    req_sqlmap = urllib.request.Request(
        f"{BASE_URL}/orders",
        data=json.dumps(bot_order_payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "User-Agent": "sqlmap/1.6.12#stable (https://sqlmap.org)"
        }
    )

    try:
        urllib.request.urlopen(req_sqlmap)
        assert False, "ERROR: Debió bloquear la petición con User-Agent de sqlmap!"
    except urllib.error.HTTPError as e:
        assert e.code == 403, f"Se esperaba HTTP 403 para sqlmap, se obtuvo {e.code}"
        content = e.read().decode("utf-8")
        print(f"  - Código HTTP: {e.code}")
        print(f"  - Mensaje: {content}")
        assert "automatizada maliciosa" in content
        print("  -> EXITOSO: Herramienta automatizada bloqueada con HTTP 403.")

    # 4. PRUEBA DE BLOQUEO POR ESCÁNER NIKTO
    print("\n[Paso 4] Probando bloqueo por firma de escáner web (Nikto)...")
    req_nikto = urllib.request.Request(
        f"{BASE_URL}/orders",
        data=json.dumps(bot_order_payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.00 (Nikto/2.1.6) (Evasions:None) (Test:Port Check)"
        }
    )

    try:
        urllib.request.urlopen(req_nikto)
        assert False, "ERROR: Debió bloquear la petición de Nikto!"
    except urllib.error.HTTPError as e:
        assert e.code == 403, f"Se esperaba HTTP 403 para Nikto, se obtuvo {e.code}"
        print("  -> EXITOSO: Escáner Nikto bloqueado con HTTP 403.")

    # 5. PRUEBA DE PEDIDO LEGÍTIMO (CLIENTE HUMANO REAL)
    print("\n[Paso 5] Verificando que una solicitud legítima con Honeypot limpio sea aceptada...")
    legit_order = {
        "clientName": "Liliana Verificación Humana",
        "phone": "3174811570",
        "city": "Algeciras",
        "notes": "[POR ENCARGO] Pedido legítimo de prueba",
        "trapField": None,
        "items": [
            {
                "id": 1,
                "name": "Aretes Flor Tejidos a Mano",
                "price": 35000,
                "quantity": 1
            }
        ]
    }

    req_legit = urllib.request.Request(
        f"{BASE_URL}/orders",
        data=json.dumps(legit_order).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AccesoriosLilis/Client"
        }
    )

    try:
        with urllib.request.urlopen(req_legit) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            print(f"  - Código HTTP: {resp.status}")
            print(f"  - Pedido creado con ID: {data.get('order', {}).get('id')}")
            assert resp.status in (200, 201)
            print("  -> EXITOSO: Los clientes humanos con solicitudes limpias procesan pedidos normalmente.")
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        print(f"  - HTTP Error: {e.code} - {content}")
        raise e

    print("\n>>> TODAS LAS PRUEBAS DE PROTECCIÓN CONTRA BOTS SUPERADAS CON ÉXITO <<<")

if __name__ == "__main__":
    run()
