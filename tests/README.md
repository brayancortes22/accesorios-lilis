# 🧪 Centro de Pruebas Automatizadas - Accesorios Lilís

Este directorio contiene la suite completa de pruebas unitarias, de integración y de seguridad del sistema **Accesorios Lilís**.

---

## 📁 Estructura de Archivos

| Archivo / Carpeta | Descripción | Qué evalúa |
| :--- | :--- | :--- |
| **`test_cookie_auth.py`** | Autenticación y ciclo de vida de cookies | Emisión de cookie `HttpOnly` en login, acceso a `/api/auth/me` sin Bearer token, protección de rutas con `[Authorize]`, y cierre de sesión con `/api/auth/logout`. |
| **`test_security_hardening.py`** | Blindaje OWASP y Rate Limiting | Inyección de cabeceras de seguridad (`nosniff`, `DENY`, `Referrer-Policy`), ocultamiento de la cabecera `Server`, sanitización de inyecciones XSS (`<script>`), y bloqueo automático por Rate Limiter en la petición #11 con HTTP `429 Too Many Requests`. |
| **`test_orders_and_stock.py`** | Gestión de pedidos e inventario | Consulta de stock disponible, creación de pedidos, descuento atómico en base de datos mediante transacciones ACID, y rechazo de compras con stock insuficiente. |
| **`run_all_tests.py`** | Runner maestro en Python | Ejecuta todas las suites en orden secuencial y genera un reporte consolidado con tiempos y estado de aprobación. |
| **`run_tests.bat`** | Acceso rápido para Windows | Script ejecutable (.bat) que permite correr todas las pruebas con un solo clic o desde la terminal. |
| **`backend/AccesoriosLilis.Tests/`** | Pruebas Unitarias .NET (xUnit) | Pruebas de código en C# para `InputSanitizer` (detección y neutralización de XSS) y `PasswordHasher` (cifrado PBKDF2 y validación con tiempo constante). |

---

## 🚀 Cómo Ejecutar las Pruebas

### Opción 1: Ejecutar Todo con un solo comando (Recomendado)
Asegúrate de que el backend esté corriendo (`dotnet run` en el puerto 5000) y ejecuta:
```bash
python tests/run_all_tests.py
```
O en Windows:
```cmd
.\tests\run_tests.bat
```

### Opción 2: Ejecutar Pruebas Individuales
Puedes correr cualquier prueba de forma independiente:
```bash
# Probar autenticación por cookies
python tests/test_cookie_auth.py

# Probar blindaje OWASP y Rate Limiting
python tests/test_security_hardening.py

# Probar pedidos e inventario
python tests/test_orders_and_stock.py
```

### Opción 3: Ejecutar Pruebas Unitarias de .NET (xUnit)
```bash
dotnet test backend/AccesoriosLilis.Tests/AccesoriosLilis.Tests.csproj --no-build
```
