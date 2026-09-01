# Accesorios Lilis

Proyecto de e-commerce femenino para la venta de accesorios para dama, pensado para la vendedora Liliana Lombana Polania, quien vende en la Galería Municipal del Algeciras (Huila, Colombia).

## Datos del negocio

- Propietaria: Liliana Lombana Polania
- WhatsApp: +57 3174811570
- Facebook: https://www.facebook.com/liliana.lombana.1

## Alcance y objetivo

- Crear una tienda online con catálogo de accesorios para dama.
- Permitir la toma de pedidos por WhatsApp y contacto directo.
- Diseñar una experiencia visual moderna, clara y mobile-first.
- Separar backend y frontend para mantener un código más sostenible y escalable.
- Usar arquitectura MVC en backend con C# y MySQL, y componentes reutilizables en React + Vite en frontend.

## Arquitectura propuesta

### Frontend

- React + Vite
- Componentes reutilizables para catálogo, carrito, detalle de producto, formulario y panel administrativo.
- Enfoque dinámico y modular para facilitar cambios rápidos del contenido.

### Backend

- ASP.NET Core MVC / Web API
- Swagger para documentación de APIs
- MySQL como base de datos principal
- Patrones de separación por capas:
  - Controllers
  - Business
  - Data
  - Models / DTOs

## Estructura de carpetas

```text
Accesorios lilis/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── backend/
│   ├── AccesoriosLilis.Api/
│   │   ├── Controllers/
│   │   ├── Business/
│   │   ├── Data/
│   │   ├── Models/
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   └── AccesoriosLilis.Api.csproj
│   └── legacy/
│       └── prototype-node/
├── .gitignore
├── README.md
└── .github/
```

## Patrón sugerido para el backend

```text
Controllers
  ├── AuthController
  ├── ProductsController
  ├── CartController
  └── OrdersController

Business
  ├── UsuarioBusiness
  ├── ProductoBusiness
  ├── CarritoBusiness
  └── PedidoBusiness

Data
  ├── UsuarioData
  ├── ProductoData
  ├── CarritoData
  └── PedidoData

Entity / Models
  ├── Models
  ├── DTOs
  ├── Context
  └── Mapper / Helpers
```

## Configuración genérica para CRUD

La capa base debe centralizar el comportamiento común del CRUD y permitir personalizaciones por entidad cuando haya reglas especiales.

```json
{
  "ConnectionStrings": {
    "SqlServer": "Server=localhost;Database=AccesoriosLilis;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true",
    "MySql": "Server=localhost;Database=accesorios_lilis;Uid=root;Pwd=;",
    "Postgres": "Host=localhost;Database=accesorios_lilis;Username=postgres;Password=postgres"
  },
  "DatabaseProvider": "MySql",
  "CrudSettings": {
    "EnableSoftDelete": true,
    "EnableAuditFields": true,
    "DefaultPageSize": 20,
    "AllowHardDelete": false
  }
}
```

Regla de diseño:
- La configuración base sirve para todas las entidades que siguen el patrón CRUD clásico.
- Si una entidad necesita validaciones especiales, se define un `Business` o `Validator` específico.
- Si una entidad requiere campos distintos, se extiende su DTO o modelo sin romper la estructura base.

## CRUD recomendado

- Create: crear un registro
- Read: consultar lista y detalle
- Update: actualizar el producto completo o solo un campo específico
- Delete: soft delete para conservar historial y hard delete para borrado total

## GitHub y ramas

Se recomienda trabajar con ramas separadas por proyecto y por ambiente:

### Frontend

- frontend/desarrollo
- frontend/test
- frontend/produccion

### Backend

- backend/desarrollo
- backend/test
- backend/produccion

Regla general:
- Desarrollo: tareas en progreso
- Test: validación antes de producción
- Produccion: versión estable para lanzamiento

## Stack técnico recomendado

- Frontend: React + Vite + componentes reutilizables
- Backend: ASP.NET Core MVC / Web API + Swagger + MySQL
- ORM: Entity Framework Core + MySql.EntityFrameworkCore
- Control de versiones: Git + GitHub
- Documentación de API: Swagger/OpenAPI
- Seguridad: JWT + roles + permisos por módulo y formulario

## Reglas para personalizar el CRUD

1. Empezar con una configuración base reutilizable.
2. Cuando la entidad sea común, usar el flujo genérico sin duplicar lógica.
3. Cuando la entidad sea especial, crear la regla en la capa de negocio y no en la UI.
4. Mantener el controlador delgado: solo recibe la petición y delega.
5. Mantener el `Data` orientado a acceso a datos; no mezclar validaciones ni transformaciones de negocio.

## Estado actual

La estructura base del frontend ya quedó separada en `frontend/` y esta documentación define la arquitectura final del proyecto. El backend C# MVC se deja como base para el desarrollo real con Swagger y MySQL.
