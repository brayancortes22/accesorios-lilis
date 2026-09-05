# 💎 Accesorios Lilís - Plataforma Web Oficial & E-Commerce Artesanal

Plataforma de comercio electrónico y catálogo interactivo creada para el emprendimiento familiar de **Liliana Lombana Polanía** en **Algeciras (Huila, Colombia)**. Especializada en la confección minuciosa de bisutería, aretes, collares, pulseras y piezas exclusivas 100% hechas a mano.

---

## 📌 Datos Generales del Emprendimiento

* **Fundadora & Artesana:** Liliana Lombana Polanía
* **Desarrollador & Administrador Tecnológico:** Brayan Stid Cortés Lombana
* **Ubicación Principal (Google Maps):** Algeciras, Huila (Lat: `2.5343338`, Lng: `-75.3057016`)
* **Sedes:**
  * 🏡 **Taller Artesanal:** Lugar de confección, pedidos personalizados y despachos.
  * 🛒 **Punto de Venta Fin de Semana:** Carrito artesanal en la Galería Municipal de Algeciras (sábados y domingos).
* **Canal de Contacto Oficial:** WhatsApp (+57 317 481 1570)
* **Tienda Web en Vivo (Producción):** [https://accesorios-lilis-2026.vercel.app](https://accesorios-lilis-2026.vercel.app)

---

## 🏗️ Arquitectura del Sistema

El proyecto está diseñado bajo una arquitectura desacoplada y moderna:

```text
accesorios-lilis/
├── frontend/                          # Cliente Web (React 19 + TypeScript + Vite)
│   ├── public/                        # Archivos estáticos de verificación, robots y favicons
│   │   ├── favicon.svg                # Ícono oficial de la marca para navegadores
│   │   ├── robots.txt                 # Control de rastreo para buscadores
│   │   ├── sitemap.xml                # Mapa de indexación para Google
│   │   └── google3aa4b55c9aef9eb7.html# Archivo de verificación Google Search Console
│   ├── src/
│   │   ├── api/                       # Clientes HTTP (Axios) para Auth, Productos y Pedidos
│   │   ├── app/App.tsx                # Componente raíz y orquestador de vistas
│   │   ├── components/                # Componentes modulares (Hero, Catálogo, Login, Admin, Carrito, Historia)
│   │   ├── hooks/                     # Hooks reutilizables (useAuth, useCart, useProducts)
│   │   ├── styles/                    # Sistema de diseño modular en CSS puro
│   │   └── types/                     # Interfaces TypeScript estrictas
│   └── index.html                     # Entrada HTML con metadatos OpenGraph y Schema.org LocalBusiness
│
├── backend/                           # API REST (ASP.NET Core Web API + C#)
│   └── AccesoriosLilis.Api/
│       ├── Business/                  # Lógica del negocio y reglas de validación
│       ├── Data/                      # Capa de persistencia y consultas Entity Framework
│       ├── Entity/                    # Modelos, DTOs, DbContext y migraciones
│       ├── Utilities/                 # Hashing de claves PBKDF2 y seguridad
│       └── Web/Controllers/           # Controladores REST expuestos
│
├── .github/workflows/                 # Automatización CI/CD
│   ├── promote-pipeline.yml           # Pipeline de auto-escalado a Producción
│   └── keep-alive.yml                 # Pulso anti-suspensión cada 14 min (Backend + DB)
├── escalar.bat                        # Script local de 1 solo clic para despliegues
└── README.md
```

---

## 🔐 Seguridad y Autenticación

El sistema implementa un modelo de autenticación robusto y transparente:

### 1. Autenticación Dinámica en 2 Pasos
* **Paso 1 (Identificación):** El usuario ingresa su correo y el sistema consulta (`POST /api/auth/check-email`).
* **Paso 2A (Cliente Existente):** Reconoce su nombre y solicita su contraseña para acceder.
* **Paso 2B (Nuevo Registro):** Solicita nombre, creación de contraseña y confirmación en tiempo real con validación visual.
* **Cifrado Fuerte:** Las contraseñas se almacenan con salt individual y algoritmo PBKDF2-SHA256 (100.000 iteraciones).

### 2. Inicio de Sesión Oficial con Google
* Integración con **Google Identity Services** oficial.
* Intercambio de tokens seguros en backend para autenticación sin fricción.

### 3. Roles de Usuario
* **`Admin`:** Concede acceso al Panel de Control de Inventario, Gestión de Pedidos con trazabilidad de paquetería y chats directos de WhatsApp.
* **`Customer`:** Acceso a compras, historial personal de pedidos y seguimiento.

---

## ⚙️ Variables de Entorno (Plantilla de Seguridad)

> [!IMPORTANT]
> **Nunca incluyas contraseñas reales ni claves secretas en este archivo ni en el repositorio.**  
> Todos los valores confidenciales se configuran como variables de entorno privadas en el servidor de despliegue.

### Frontend (`frontend/.env`)
```env
# URL de la API Backend (en desarrollo local o servidor cloud)
VITE_API_URL=http://localhost:5000/api

# Client ID de Google Cloud Console (Identificador público)
VITE_GOOGLE_CLIENT_ID=tu_google_client_id_aqui.apps.googleusercontent.com
```

### Backend (`appsettings.json` / Variables de Entorno)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=accesorios_lilis;Uid=tu_usuario_db;Pwd=tu_contrasena_db;"
  },
  "Jwt": {
    "Key": "tu_clave_secreta_jwt_minimo_32_caracteres_aleatorios",
    "Issuer": "AccesoriosLilis",
    "Audience": "AccesoriosLilis",
    "ExpireHours": "48"
  },
  "AdminEmails": "lombanaliliana64@gmail.com,brayanstidcorteslombana@gmail.com",
  "Google": {
    "ClientId": "tu_google_client_id_aqui.apps.googleusercontent.com"
  }
}
```

---

## 🚀 Estrategia de Ramas y Pipeline CI/CD

El proyecto utiliza un flujo de despliegue continuo escalonado:

$$\text{development} \xrightarrow{\text{Tests \& Build}} \text{qa} \xrightarrow{\text{Estabilidad}} \text{main (Vercel Producción)}$$

### Despliegue Automático en la Nube
Al hacer push a `development`, el workflow [`.github/workflows/promote-pipeline.yml`](file:///.github/workflows/promote-pipeline.yml):
1. Instala y compila el frontend con TypeScript estricto (`npm run build`).
2. Si la compilación es exitosa, fusiona y sube a `qa`.
3. Posteriormente fusiona y sube a `main`.
4. Vercel detecta la actualización en `main` y despliega la versión de producción en vivo.

### Despliegue Local de 1 Clic (`escalar.bat`)
Desde la terminal en tu computadora puedes ejecutar:
```cmd
.\escalar.bat "descripción de las mejoras realizadas"
```
El script se encarga de confirmar cambios, sincronizar las ramas y regresar a `development` de forma desatendida.

### ⏰ Pulso Anti-Suspensión Keep-Alive (`keep-alive.yml`)
Los planes gratuitos de hosting cloud (ej. Render, Alwaysdata, Clever Cloud) suspenden o apagan las instancias tras 15 minutos de inactividad, provocando demoras de hasta 50 segundos al despertar.
* **Frecuencia:** Se ejecuta de manera automática cada 14 minutos (`cron: '*/14 * * * *'`).
* **Acción:** Envía una solicitud HTTP a `/health` y `/api/products` del backend, ejecutando una verificación ligera sobre MySQL (`db.Database.CanConnectAsync()`).
* **Efecto:** Mantiene tanto el contenedor web como el pool de conexiones de la base de datos despiertos 24/7.
* **Configuración del Secreto en GitHub:**
  1. Ve al repositorio en GitHub -> **Settings** -> **Secrets and variables** -> **Actions**.
  2. En **Repository secrets** o **Variables**, agrega `BACKEND_URL` con tu URL pública (ejemplo: `https://tu-backend.onrender.com`).

---

## 📈 Optimización para Buscadores (SEO) y Google Maps

* **Google Search Console:** Propiedad verificada oficialmente mediante archivo HTML y metaetiqueta.
* **Sitemap & Robots:** Archivos [`sitemap.xml`](file:///frontend/public/sitemap.xml) y [`robots.txt`](file:///frontend/public/robots.txt) dinámicos para guiar a los rastreadores.
* **Datos Estructurados (Schema.org):** Declaración de comercio local (`JewelryStore`) con geolocalización satelital precisa de Algeciras, datos de contacto y horarios.
* **Mapa Embebido Oficial:** Mapa interactivo con enlace directo a la ficha comercial en Google Maps.
* **Open Graph:** Tarjetas enriquecidas al compartir enlaces en WhatsApp, Facebook e Instagram con logotipo oficial.

---

## 🛠️ Comandos de Desarrollo Local

### Iniciar Frontend:
```bash
cd frontend
npm install
npm run dev
```

### Iniciar Backend:
```bash
cd backend/AccesoriosLilis.Api
dotnet restore
dotnet run
```
