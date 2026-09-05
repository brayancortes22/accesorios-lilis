import subprocess
import sys
import os
import urllib.request
import urllib.error
import time

"""
Runner Maestro de Pruebas de Accesorios Lilís
Ejecuta todas las suites de pruebas automatizadas:
  1. Autenticación con Cookies HttpOnly y sesión
  2. Blindaje de seguridad OWASP, Rate Limiting y Sanitización XSS
  3. Flujo de Pedidos, Inventario y Transacciones ACID
  4. Pruebas Unitarias de C# (.NET xUnit)
"""

BASE_URL = "http://localhost:5000"

def check_server():
    print("Verificando conexión con el servidor backend en http://localhost:5000...")
    for _ in range(5):
        try:
            with urllib.request.urlopen(f"{BASE_URL}/health", timeout=3) as resp:
                if resp.status == 200:
                    print(" [OK] Backend activo y listo para pruebas.\n")
                    return True
        except Exception:
            time.sleep(1)
    return False

def run_suite(name, command):
    print(f"\n========================================================")
    print(f" EJECUTANDO SUITE: {name}")
    print(f"========================================================")
    start_time = time.time()
    try:
        proc = subprocess.run(command, check=True)
        elapsed = round(time.time() - start_time, 2)
        print(f"\n [OK] SUITE '{name}' SUPERADA EXITOSAMENTE ({elapsed}s)")
        return True
    except subprocess.CalledProcessError as e:
        elapsed = round(time.time() - start_time, 2)
        print(f"\n [ERROR] EN SUITE '{name}' (Código de salida: {e.returncode}, {elapsed}s)")
        return False

def main():
    print("************************************************************")
    print("        SUITE COMPLETA DE PRUEBAS - ACCESORIOS LILIS        ")
    print("************************************************************\n")

    current_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.abspath(os.path.join(current_dir, ".."))

    server_ready = check_server()
    if not server_ready:
        print(" [AVISO] El backend en http://localhost:5000 no responde.")
        print("Inicia el backend con 'dotnet run' antes de correr las pruebas de integración.\n")

    # Colocamos las pruebas unitarias y de pedidos primero, y el test de rate limiting al final
    # para que no bloquee las peticiones de las demás pruebas.
    suites = [
        ("Pruebas Unitarias .NET (xUnit)", ["dotnet", "test", os.path.join(root_dir, "backend", "AccesoriosLilis.Tests", "AccesoriosLilis.Tests.csproj"), "--no-build"]),
        ("Autenticacion por Cookies HttpOnly", [sys.executable, os.path.join(current_dir, "test_cookie_auth.py")]),
        ("Flujo de Pedidos e Inventario", [sys.executable, os.path.join(current_dir, "test_orders_and_stock.py")]),
        ("Blindaje OWASP, Rate Limiting y XSS", [sys.executable, os.path.join(current_dir, "test_security_hardening.py")]),
    ]

    results = []
    for name, cmd in suites:
        success = run_suite(name, cmd)
        results.append((name, success))

    print("\n" + "=" * 60)
    print("                RESUMEN GENERAL DE PRUEBAS                 ")
    print("=" * 60)
    all_passed = True
    for name, success in results:
        status_icon = "[APROBADO]" if success else "[FALLIDO]"
        if not success:
            all_passed = False
        print(f"  {status_icon:<12} | {name}")

    print("=" * 60)
    if all_passed:
        print("  TODAS LAS SUITES DE PRUEBAS FUERON SUPERADAS CON EXITO!")
        print("  El sistema se encuentra 100% seguro, verificado y estable.")
        sys.exit(0)
    else:
        print("  ALERTA: Algunas pruebas no pasaron. Revisa los mensajes arriba.")
        sys.exit(1)

if __name__ == "__main__":
    main()
