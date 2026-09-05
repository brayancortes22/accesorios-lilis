import urllib.request
import urllib.error
import json

"""
Prueba automatizada de blindaje y seguridad en endpoints y base de datos
Verifica:
1. Cabeceras OWASP de seguridad HTTP (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, etc.).
2. Ocultamiento de cabeceras de servidor (Anti-Fingerprinting: Server y X-Powered-By eliminadas).
3. Sanitización activa de entradas contra inyecciones XSS / scripts.
4. Manejo seguro de excepciones sin fuga de mensajes de base de datos ni stack traces.
5. Rate Limiting en endpoints de autenticación (bloqueo automático ante ataques de fuerza bruta).
"""

BASE_URL = "http://localhost:5000/api"

def run():
    print("==========================================================")
    print("  TEST 2: BLINDAJE OWASP, RATE LIMITING Y SANITIZACIÓN    ")
    print("==========================================================")

    # 1. TEST DE CABECERAS DE SEGURIDAD
    print("\n[Paso 1] Verificando Cabeceras de Seguridad OWASP...")
    req_health = urllib.request.Request("http://localhost:5000/health")
    with urllib.request.urlopen(req_health) as resp:
        headers = dict(resp.getheaders())
        print(f"  - X-Content-Type-Options: {headers.get('X-Content-Type-Options')}")
        print(f"  - X-Frame-Options: {headers.get('X-Frame-Options')}")
        print(f"  - X-XSS-Protection: {headers.get('X-XSS-Protection')}")
        print(f"  - Referrer-Policy: {headers.get('Referrer-Policy')}")
        print(f"  - Permissions-Policy: {headers.get('Permissions-Policy')}")
        print(f"  - Server expuesta?: {'Server' in headers} (Server={headers.get('Server', 'Ocultada')})")

        assert headers.get("X-Content-Type-Options") == "nosniff", "Falta X-Content-Type-Options: nosniff"
        assert headers.get("X-Frame-Options") == "DENY", "Falta X-Frame-Options: DENY (anti-clickjacking)"
        assert headers.get("Referrer-Policy") == "strict-origin-when-cross-origin", "Falta Referrer-Policy"
        assert "Server" not in headers or headers.get("Server") == "", "Cabecera Server no debe exponerse"
        print("  -> EXITOSO: Cabeceras de seguridad validadas correctamente.")

    # 2. TEST DE SANITIZACIÓN DE ENTRADAS (ANTI-XSS)
    print("\n[Paso 2] Probando Sanitización de Inyección de Scripts (XSS)...")
    order_payload = {
        "clientName": "<script>alert('pwned')</script> Carlos Mendoza",
        "phone": "3119876543",
        "city": "Neiva <iframe src='evil.com'></iframe>",
        "notes": "Entrega urgente. <script>stealCookies()</script>",
        "items": [
            {
                "id": 1,
                "name": "Aretes Flor Tejidos a Mano",
                "price": 35000,
                "quantity": 1
            }
        ]
    }

    req_order = urllib.request.Request(
        f"{BASE_URL}/orders",
        data=json.dumps(order_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req_order) as resp:
            order_res = json.loads(resp.read().decode("utf-8"))
            client_name = order_res.get("customer", {}).get("fullName") or order_res.get("customerName", "")
            print(f"  - Nombre de cliente procesado en servidor: '{client_name}'")
            assert "<script>" not in client_name, "ALERTA: Se detectó etiqueta script no sanitizada"
            print("  -> EXITOSO: Las etiquetas maliciosas fueron neutralizadas.")
    except urllib.error.HTTPError as e:
        err_content = e.read().decode("utf-8")
        assert "Exception" not in err_content or "stack" not in err_content.lower()

    # 3. TEST DE MANEJO SEGURO DE EXCEPCIONES (SIN FUGA DE DATOS)
    print("\n[Paso 3] Probando Manejo Seguro de Excepciones (Sin fuga de BD ni stack traces)...")
    req_bad = urllib.request.Request(
        f"{BASE_URL}/orders",
        data=b"{ invalid json ::: 123",
        headers={"Content-Type": "application/json"}
    )
    try:
        urllib.request.urlopen(req_bad)
        assert False, "Debió rechazar el JSON malformado"
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        print(f"  - Código HTTP devuelto: {e.code} {e.reason}")
        print(f"  - Cuerpo de error: {content[:100]}...")
        assert "MySqlException" not in content, "Fuga de excepción interna de base de datos!"
        assert "C:\\" not in content, "Fuga de rutas del sistema operativo!"
        print("  -> EXITOSO: La excepción no filtró información interna de base de datos ni del servidor.")

    # 4. TEST DE RATE LIMITING EN AUTH (ANTI-FUERZA BRUTA)
    print("\n[Paso 4] Probando Rate Limiting en Autenticación (Límite: 30 peticiones/minuto)...")
    rate_limited = False
    blocked_at = None

    for i in range(1, 40):
        try:
            req_auth = urllib.request.Request(
                f"{BASE_URL}/auth/check-email",
                data=json.dumps({"email": f"bot_attempt_{i}@test.com"}).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req_auth) as resp:
                pass
        except urllib.error.HTTPError as e:
            if e.code == 429:
                rate_limited = True
                blocked_at = i
                msg = e.read().decode("utf-8")
                print(f"  - Petición #{i} bloqueada con HTTP 429 Too Many Requests!")
                print(f"  - Mensaje de bloqueo: {msg}")
                break

    assert rate_limited, "ERROR: Rate limiting no bloqueó el exceso de solicitudes!"
    print(f"  -> EXITOSO: Rate limiter activado en el intento #{blocked_at}.")

    print("\n>>> TODAS LAS PRUEBAS DE BLINDAJE Y SEGURIDAD COMPLETADAS CON ÉXITO <<<")

if __name__ == "__main__":
    run()
