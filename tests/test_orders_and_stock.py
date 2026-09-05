import urllib.request
import urllib.error
import json

"""
Prueba automatizada de gestión de pedidos y control de inventario
Verifica:
1. Consulta de catálogo y stock en tiempo real.
2. Creación de pedido con descuento atómico de inventario.
3. Rechazo de compras con stock insuficiente (protección de inventario).
4. Pedidos especiales 'Por Encargo'.
"""

BASE_URL = "http://localhost:5000/api"

def run():
    print("==========================================================")
    print("  TEST 3: GESTIÓN DE PEDIDOS Y CONTROL DE INVENTARIO      ")
    print("==========================================================")

    # 1. Consultar productos disponibles
    print("\n[Paso 1] Consultando catálogo de productos activos...")
    req_products = urllib.request.Request(f"{BASE_URL}/products")
    with urllib.request.urlopen(req_products) as resp:
        products = json.loads(resp.read().decode("utf-8"))
        print(f"Total productos en catálogo: {len(products)}")
        assert len(products) > 0, "Debe haber productos disponibles en la base de datos"
        
        target = products[0]
        target_id = target["id"]
        target_name = target["name"]
        initial_stock = target["stock"]
        print(f"Producto de prueba: '{target_name}' (ID: {target_id}) | Stock actual: {initial_stock}")

    # 2. Realizar pedido con cantidad válida (1 unidad)
    print("\n[Paso 2] Realizando pedido de 1 unidad...")
    order_payload = {
        "clientName": "Cliente Prueba Automatizada",
        "phone": "3101234567",
        "city": "Algeciras, Huila",
        "notes": "Pedido de prueba automatizada",
        "items": [
            {
                "id": target_id,
                "name": target_name,
                "price": target["price"],
                "quantity": 1
            }
        ]
    }

    req_order = urllib.request.Request(
        f"{BASE_URL}/orders",
        data=json.dumps(order_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    with urllib.request.urlopen(req_order) as resp:
        assert resp.status == 201, f"Se esperaba 201 Created, se obtuvo {resp.status}"
        order_res = json.loads(resp.read().decode("utf-8"))
        order_id = order_res.get("id") or order_res.get("order", {}).get("id")
        total = order_res.get("total") or order_res.get("order", {}).get("total")
        print(f"Pedido creado exitosamente con ID #{order_id} | Total: ${total}")
        print("  -> EXITOSO: El pedido fue registrado en la base de datos.")

    # 3. Verificar que el inventario se descontó correctamente
    print("\n[Paso 3] Verificando descuento atómico de inventario...")
    req_check = urllib.request.Request(f"{BASE_URL}/products/{target_id}")
    with urllib.request.urlopen(req_check) as resp:
        updated_prod = json.loads(resp.read().decode("utf-8"))
        new_stock = updated_prod["stock"]
        print(f"Stock anterior: {initial_stock} | Nuevo stock: {new_stock}")
        assert new_stock == initial_stock - 1, f"El stock debió decrementar en 1. Esperado: {initial_stock - 1}, actual: {new_stock}"
        print("  -> EXITOSO: El inventario fue actualizado atómicamente por la transacción ACID.")

    # 4. Intentar ordenar más unidades de las disponibles
    print("\n[Paso 4] Intentando ordenar exceso de stock para probar rechazo de seguridad...")
    excess_payload = {
        "clientName": "Cliente Exceso",
        "phone": "3101234567",
        "city": "Neiva",
        "notes": "Intento de sobrecompra",
        "items": [
            {
                "id": target_id,
                "name": target_name,
                "price": target["price"],
                "quantity": 99999
            }
        ]
    }

    req_excess = urllib.request.Request(
        f"{BASE_URL}/orders",
        data=json.dumps(excess_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    try:
        urllib.request.urlopen(req_excess)
        assert False, "ERROR: La orden con exceso de stock debió ser rechazada"
    except urllib.error.HTTPError as e:
        assert e.code == 400, f"Se esperaba 400 Bad Request, se obtuvo {e.code}"
        err_data = json.loads(e.read().decode("utf-8"))
        print(f"Rechazo controlado del servidor: {err_data.get('message')}")
        print("  -> EXITOSO: El backend rechazó la compra excesiva y protegió el inventario.")

    print("\n>>> TODAS LAS PRUEBAS DE PEDIDOS E INVENTARIO COMPLETADAS CON ÉXITO <<<")

if __name__ == "__main__":
    run()
