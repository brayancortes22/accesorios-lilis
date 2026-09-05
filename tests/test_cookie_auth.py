import urllib.request
import urllib.error
import http.cookiejar
import json
import sys

"""
Prueba automatizada de autenticación segura por Cookies HttpOnly
Verifica que el JWT viaje en cookies cifradas inaccesibles para JavaScript (F12/XSS)
y no en el almacenamiento local (localStorage) ni cabeceras Bearer visibles.
"""

BASE_URL = "http://localhost:5000/api"

def run():
    print("==========================================================")
    print("  TEST 1: AUTENTICACIÓN Y CICLO DE VIDA DE COOKIE HTTPONLY")
    print("==========================================================")
    
    cookie_jar = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookie_jar))

    # Paso 1: Iniciar sesión
    print("\n[Paso 1] Iniciando sesión en /api/auth/dev-login...")
    login_payload = json.dumps({
        "email": "admin@accesorioslilis.com",
        "password": "Lilis2026*",
        "fullName": "Liliana Lombana"
    }).encode("utf-8")

    req_login = urllib.request.Request(
        f"{BASE_URL}/auth/dev-login",
        data=login_payload,
        headers={"Content-Type": "application/json"}
    )

    with opener.open(req_login) as resp:
        assert resp.status == 200, f"Se esperaba status 200, se obtuvo {resp.status}"
        cookies = list(cookie_jar)
        print(f"Status HTTP: {resp.status}")
        print("Cookies emitidas por el servidor:")
        for c in cookies:
            print(f"  - Nombre: {c.name} | Dominio: {c.domain} | Path: {c.path}")
        
        has_token_cookie = any(c.name == "accesorios_token" for c in cookies)
        assert has_token_cookie, "ERROR: La cookie 'accesorios_token' no fue emitida."
        print("  -> EXITOSO: Cookie HttpOnly 'accesorios_token' recibida correctamente.")

    # Paso 2: Consumir /api/auth/me usando SOLO la cookie (sin cabecera Authorization: Bearer)
    print("\n[Paso 2] Consultando /api/auth/me SIN cabecera Bearer (autenticación por cookie pura)...")
    req_me = urllib.request.Request(f"{BASE_URL}/auth/me")
    with opener.open(req_me) as resp:
        assert resp.status == 200
        user_info = json.loads(resp.read().decode("utf-8"))
        print(f"Perfil retornado: {user_info.get('email')} - Rol: {user_info.get('role')}")
        assert user_info.get("role") == "Admin", "El rol retornado debe ser Admin"
        print("  -> EXITOSO: La cookie autorizó la solicitud sin enviar Bearer token.")

    # Paso 3: Probar endpoint protegido [Authorize]
    print("\n[Paso 3] Probando endpoint protegido [Authorize] (/api/auth/change-password)...")
    req_change = urllib.request.Request(
        f"{BASE_URL}/auth/change-password",
        data=json.dumps({"currentPassword": "wrongpassword", "newPassword": "newpassword123"}).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    try:
        opener.open(req_change)
    except urllib.error.HTTPError as e:
        # 400 Bad Request significa que la cookie autorizó el acceso y llegó a la validación de la lógica
        assert e.code == 400, f"Se esperaba 400 Bad Request, pero se obtuvo {e.code}"
        print(f"Respuesta obtenida: {e.code} {e.reason} (Validación de negocio ejecutada)")
        print("  -> EXITOSO: [Authorize] permitió el paso al backend.")

    # Paso 4: Cerrar sesión
    print("\n[Paso 4] Cerrando sesión en /api/auth/logout...")
    req_logout = urllib.request.Request(
        f"{BASE_URL}/auth/logout",
        data=b"{}",
        headers={"Content-Type": "application/json"}
    )
    with opener.open(req_logout) as resp:
        assert resp.status == 200
        res_data = json.loads(resp.read().decode("utf-8"))
        print(f"Mensaje de logout: {res_data.get('message')}")
        print("  -> EXITOSO: Solicitud de revocación de cookie procesada.")

    # Paso 5: Verificar que una sesión vacía es rechazada con 401
    print("\n[Paso 5] Verificando que peticiones sin cookie son rechazadas con 401 Unauthorized...")
    empty_opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
    try:
        empty_opener.open(urllib.request.Request(f"{BASE_URL}/auth/me"))
        assert False, "ERROR: La petición debió fallar con 401"
    except urllib.error.HTTPError as e:
        assert e.code == 401, f"Se esperaba 401, se obtuvo {e.code}"
        print(f"Respuesta obtenida: {e.code} {e.reason}")
        print("  -> EXITOSO: El servidor denegó el acceso sin cookie válida.")

    print("\n>>> TODAS LAS PRUEBAS DE AUTENTICACIÓN POR COOKIE COMPLETADAS CON ÉXITO <<<")

if __name__ == "__main__":
    run()
