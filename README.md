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
- Usar arquitectura MVC en backend con C# y MySQL, y componentes reutilizables en React + Vite + TypeScript en frontend.
- Mantener la configuración de conexión local fuera del repositorio para no publicar credenciales de base de datos.

## Arquitectura propuesta

### Frontend

- React + Vite + TypeScript
- Componentes reutilizables para catálogo, carrito, detalle de producto, formulario y panel administrativo.
- Enfoque dinámico y modular para facilitar cambios rápidos del contenido.
- Estructura organizada en `src/api`, `src/types`, `src/components` y `src/hooks`.

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
│   │   ├── api/
│   │   ├── app/
│   │   │   └── App.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── tsconfig.json
│   ├── vite.config.js
│   └── package.json
├── backend/
│   └── AccesoriosLilis.Api/
│       ├── Business/
│       │   ├── GenericCrudBase.cs
│       │   ├── Implements/
│       │   └── Interfaces/
│       ├── Data/
│       │   ├── Implements/
│       │   └── Interfaces/
│       ├── Entity/
│       │   ├── Context/
│       │   ├── Dtos/
│       │   ├── Model/
│       │   └── Migrations/
│       ├── Web/
│       │   ├── Controllers/
│       │   ├── ServiceExtension/
│       │   └── Properties/
│       ├── Program.cs
│       ├── appsettings.json
│       ├── appsettings.Development.json  # local, no subir a Git
│       ├── .env
│       ├── .env.example
│       ├── AccesoriosLilis.Api.csproj
│       └── README.md (si aplica por proyecto)
├── .gitignore
├── README.md
└── .github/
```

## Patrón que implementamos en el backend

La estructura del backend sigue la referencia de la plantilla de C# que nos sirvió de base, conservando la separación de capas y dejando la capa `Web` como entrada HTTP y capa de presentación de la API.

```text
backend/AccesoriosLilis.Api/
├── Business/
│   ├── Implements/
│   │   ├── BaseBusiness.cs
│   │   ├── ProductBusiness.cs
│   │   └── UserBusiness.cs
│   ├── Interfaces/
│   │   ├── IBaseBusiness.cs
│   │   ├── IProductBusiness.cs
│   │   └── IUserBusiness.cs
│   └── GenericCrudBase.cs
├── Data/
│   ├── Implements/
│   │   ├── BaseData.cs
│   │   ├── ProductData.cs
│   │   └── UserData.cs
│   ├── Interfaces/
│   │   ├── IBaseData.cs
│   │   ├── IProductData.cs
│   │   └── IUserData.cs
│   └── DatabaseContext.cs (si aplica)
├── Entity/
│   ├── Context/
│   │   └── ApplicationDbContext.cs
│   ├── Dtos/
│   │   ├── Base/
│   │   │   └── BaseDto.cs
│   │   ├── ProductDto.cs
│   │   └── UserDto.cs
│   ├── Model/
│   │   ├── Base/
│   │   │   └── BaseModel.cs
│   │   ├── Product.cs
│   │   └── User.cs
│   └── Migrations/
├── Utilities/
│   ├── Exceptions/
│   │   ├── BusinessException.cs
│   │   ├── ControllerException.cs
│   │   └── DataException.cs
│   └── Mappers/
│       └── Profiles/
├── Web/
│   ├── Controllers/
│   ├── ServiceExtension/
│   ├── Properties/
│   ├── Program.cs
│   ├── appsettings.json
│   └── appsettings.Development.json
├── .env
├── .env.example
├── AccesoriosLilis.Api.csproj
└── README.md (si aplica)
```

Regla de diseño del proyecto:
- La capa `Web` debe alojar la parte HTTP: controladores, extensiones de servicios, configuración y punto de entrada de la API.
- `Business` concentra la lógica y validaciones del dominio.
- `Data` es la capa de acceso a MySQL.
- `Entity` define modelos, DTOs, contexto y migraciones.
- `Utilities` sólo se usa cuando realmente aporta reutilización útil (mappers, excepciones, helpers).

Esta estructura es la base que se usa para el backend de Accesorios Lilis. La diferencia con la plantilla genérica es funcional: en este proyecto no se implementan módulos completos de seguridad con permisos, roles y formularios, sino las entidades reales del negocio del catálogo y ventas: productos, categorías, clientes, pedidos y detalles de pedido.

Regla general:
- La plantilla aporta la arquitectura base.
- El dominio real del proyecto define qué entidades se concretan.
- Las capas se respetan siempre: Web → Business → Data → Entity.
- La lógica reutilizable debe ir a una base genérica y no duplicarse por cada entidad.
- La capa `Utilities` sólo se agrega si hace falta un helper o mapper real para una funcionalidad concreta; no se deja como artefacto genérico innecesario.
## Variables de entorno para la API

La API usa un archivo local `.env` para no exponer credenciales ni cadenas de conexión dentro del repositorio.

```env
DB_CONNECTION_STRING="Server=localhost;Database=accesorios_lilis;Uid=bscl;Pwd=@bscl1129844804;"
DB_HOST=localhost
DB_PORT=3306
DB_NAME=accesorios_lilis
DB_USER=bscl
DB_PASSWORD=@bscl1129844804
```

Regla:
- `.env` se deja local y no se sube a Git.
- `.env.example` sirve como plantilla de referencia para otros desarrolladores.
- El proyecto usa esos valores para poblar la configuración de la conexión dentro de la API.

## Configuración genérica para CRUD

La capa base debe centralizar el comportamiento común del CRUD y permitir personalizaciones por entidad cuando haya reglas especiales.

El proyecto ya cuenta con una base genérica para el CRUD en:
- `backend/AccesoriosLilis.Api/Business/GenericCrudBase.cs`

Esta base define la estructura principal para operaciones de tipo:
- GetAllAsync
- GetByIdAsync
- CreateAsync
- UpdateAsync
- SoftDeleteAsync
- HardDeleteAsync

A partir de ahí, cada entidad puede personalizar su lógica sin duplicar el patrón base.

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
