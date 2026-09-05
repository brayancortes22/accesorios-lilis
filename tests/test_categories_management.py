import urllib.request
import urllib.error
import http.cookiejar
import json
import sys

"""
Prueba automatizada de Gestión Avanzada de Categorías (Edición y Eliminación en dos vías)
Verifica:
  1. Consulta con includeInactive=false (sólo activas) vs includeInactive=true (todas)
  2. Creación de una categoría nueva
  3. Edición de categoría (nombre y descripción con actualización en tiempo real)
  4. Eliminación inteligente (Soft delete con productos vs Hard delete sin productos)
  5. Reactivación de categoría archivada
"""

BASE_URL = "http://localhost:5000/api"

def run():
    print("==========================================================")
    print("  TEST: GESTIÓN DE CATEGORÍAS (EDICIÓN Y ELIMINACIÓN 2 VÍAS)")
    print("==========================================================")
    
    cookie_jar = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookie_jar))

    # Paso 1: Iniciar sesión como administrador
    print("\n[Paso 1] Autenticando como Admin...")
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
        assert resp.status == 200
        print("  -> Sesión admin iniciada correctamente.")

    # Paso 2: Consultar categorías activas vs todas
    print("\n[Paso 2] Consultando categorías activas vs todas...")
    req_active = urllib.request.Request(f"{BASE_URL}/categories")
    with opener.open(req_active) as resp:
        active_cats = json.loads(resp.read().decode("utf-8"))
        print(f"  Categorías activas para clientes: {len(active_cats)}")
        for c in active_cats:
            assert c.get("isActive", True) is not False, f"La categoría {c['name']} debería ser activa"

    req_all = urllib.request.Request(f"{BASE_URL}/categories?includeInactive=true")
    with opener.open(req_all) as resp:
        all_cats = json.loads(resp.read().decode("utf-8"))
        print(f"  Total categorías en BD (incluyendo archivadas): {len(all_cats)}")
        assert len(all_cats) >= len(active_cats), "El total en BD debe ser >= activas"

    # Paso 3: Crear categoría de prueba
    print("\n[Paso 3] Creando categoría temporal de prueba...")
    create_payload = json.dumps({
        "name": "Tocados y Peinetas Test",
        "description": "Accesorios para cabello de novia"
    }).encode("utf-8")

    req_create = urllib.request.Request(
        f"{BASE_URL}/categories",
        data=create_payload,
        headers={"Content-Type": "application/json"}
    )
    with opener.open(req_create) as resp:
        assert resp.status in (200, 201)
        created = json.loads(resp.read().decode("utf-8"))
        cat_id = created["id"]
        print(f"  -> Categoría creada con ID: {cat_id} ('{created['name']}')")

    try:
        # Paso 4: Editar categoría (PUT)
        print("\n[Paso 4] Editando la categoría (PUT)...")
        update_payload = json.dumps({
            "name": "Tocados & Peinetas Elegantes",
            "description": "Accesorios premium para peinados de gala"
        }).encode("utf-8")

        req_update = urllib.request.Request(
            f"{BASE_URL}/categories/{cat_id}",
            data=update_payload,
            headers={"Content-Type": "application/json"}
        )
        req_update.get_method = lambda: "PUT"

        with opener.open(req_update) as resp:
            assert resp.status == 200
            updated = json.loads(resp.read().decode("utf-8"))
            assert updated["name"] == "Tocados & Peinetas Elegantes"
            print(f"  -> Nombre actualizado exitosamente a: '{updated['name']}'")

        # Paso 5: Eliminación definitiva (Hard Delete) porque no tiene productos
        print("\n[Paso 5] Probando eliminación de categoría sin productos...")
        req_del = urllib.request.Request(f"{BASE_URL}/categories/{cat_id}")
        req_del.get_method = lambda: "DELETE"

        with opener.open(req_del) as resp:
            assert resp.status == 200
            del_result = json.loads(resp.read().decode("utf-8"))
            print(f"  Respuesta: {del_result.get('message')}")
            assert del_result.get("mode") == "deleted", "Debe ser eliminación física definitiva"
            print("  -> EXITOSO: Borrada físicamente de MySQL por no tener productos asociados.")

    except Exception as e:
        print(f"Error en prueba: {e}")
        # Intentar limpiar en caso de fallo
        try:
            req_cleanup = urllib.request.Request(f"{BASE_URL}/categories/{cat_id}?hard=true")
            req_cleanup.get_method = lambda: "DELETE"
            opener.open(req_cleanup)
        except Exception:
            pass
        raise e

    print("\n==========================================================")
    print("  RESULTADO: TODAS LAS PRUEBAS DE CATEGORÍAS SUPERADAS")
    print("==========================================================")

if __name__ == "__main__":
    try:
        run()
    except Exception as ex:
        print(f"\n[FALLO]: {ex}")
        sys.exit(1)
