---
name: accesorios-lilis-architecture
description: Define la arquitectura definitiva para el proyecto Accesorios Lilis, con frontend React + TypeScript, backend C# + MySQL y separación clara por capas.
---

# Arquitectura de Accesorios Lilis

## Propósito

Esta skill conserva la arquitectura definitiva del proyecto para que futuras sesiones no vuelvan a mezclar prototipos, frontend monolítico, backend improvisado o decisiones técnicas frágiles.

## Principios base

- Separar frontend y backend completamente.
- Priorizar React + TypeScript en el cliente y ASP.NET Core Web API con C# en el backend.
- Usar MySQL como base principal con Swagger para documentación y pruebas.
- Mantener una arquitectura por capas para evitar lógica acoplada.
- Usar el patrón MVC o Web API con separación clara de responsabilidades.
- Diseñar el sistema para catálogo + carrito + pedidos con un enfoque móvil y comercial.

## Frontend

### Stack recomendado

- React + Vite + TypeScript
- Componentes reutilizables y desacoplados
- Estado manejado de forma predecible
- Servicios centralizados en `src/api`
- Tipos definidos en `src/types`

### Estructura esperada

```text
frontend/
├── src/
│   ├── api/
│   │   ├── config.ts
│   │   └── products.ts
│   ├── app/
│   │   └── App.tsx
│   ├── components/
│   ├── hooks/
│   ├── types/
│   │   ├── product.ts
│   │   └── index.ts
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.js
└── index.html
```

### Reglas

- No mezclar lógica de negocio en componentes.
- Los servicios de API deben centralizar fetch, headers y manejo de errores.
- Los tipos deben vivir separados de la UI.
- Las pantallas se construyen con componentes reutilizables y datos dinámicos.
- El frontend debe estar orientado a la experiencia móvil y a una compra rápida desde WhatsApp o formulario local.

## Backend

### Stack recomendado

- ASP.NET Core Web API / MVC
- C# con arquitectura en capas
- MySQL
- Swagger/OpenAPI
- Entity Framework Core si se requiere acceso ORM
- CRUD genérico con personalización por entidad

### Estructura base adoptada

La plantilla base que se usa para este proyecto es la siguiente, siguiendo la referencia oficial del repositorio de backend C#:

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

### Capa de responsabilidad

- Web: capa de presentación HTTP, controladores, extensión de servicios, configuración y bootstrapping.
- Business: reglas del negocio y validaciones.
- Data: acceso a BD y persistencia.
- Entity: modelos, DTOs, contexto y migraciones.
- Utilities: helpers, excepciones y mappers solo si aportan reutilización real.

Regla clave: la capa `Web` debe existir como la parte de entrada del backend y no se debe mezclar el control HTTP con la lógica de negocio ni con acceso a datos.

### Reglas para este proyecto

- Se conserva la estructura del repositorio de plantilla, pero se adapta al dominio real de Accesorios Lilis.
- No se implementan módulos de seguridad genéricos si no hacen falta.
- Las entidades principales serán catálogo, clientes, pedidos y detalle de pedido; la seguridad se agrega solo cuando haga falta.
- Los controladores deben ir dentro de `Web/Controllers`, no mezclados con capas de negocio.

### Regla del negocio en este proyecto

- No se implementan todos los módulos de seguridad genéricos de la plantilla si el proyecto no lo necesita.
- Se conserva la misma arquitectura base, pero se limitan las entidades al dominio real de Accesorios Lilis.
- Las entidades principales serán catálogo, clientes, pedidos y detalle de pedido; la seguridad se agrega solo cuando haga falta.

### CRUD base

- Create: crear registros
- Read: consultar lista y detalle
- Update: parcial o total
- Delete: soft delete por defecto y hard delete cuando se requiera explícitamente

## Reglas de diseño para el proyecto

- No volver a usar prototipos de Node/Express si el objetivo real es C# + MySQL.
- No crear una UI estática cuando ya se definió un diseño modular y dinámico.
- No mezclar autenticación/validación con lógica de acceso a datos.
- No guardar credenciales reales en el repositorio.
- No construir un VPS monolítico cuando el proyecto se puede separar por frontend/backend y desplegar por capas.

## Cómo aplicar la arquitectura en desarrollo

1. Empezar por una entidad principal del negocio: producto, pedido, carrito o cliente.
2. Definir DTOs, modelos y flujo CRUD en capas.
3. Crear servicio API y conexión con MySQL.
4. Construir UI React con componentes reutilizables.
5. Conectar UI con API mediante `src/api`.
6. Validar flujo completo antes de agregar complejidad extra.

## Ejemplo de flujo correcto

- Frontend: se llama a `productsApi.getProducts()`
- API: el endpoint en `ProductsController` delega a una capa Business
- Business: valida la regla del negocio y llama a `ProductData`
- Data: consulta o persiste en MySQL
- Respuesta: DTO listo para renderizar en React

## Aprendizajes clave

- La separación por capas hace que el proyecto sea mantenible, testeable y escalable.
- El frontend debe ser rápido y modular; el backend debe ser sólido y explícito en reglas del negocio.
- El diseño correcto del CRUD base evita duplicación y reduce errores de mantenimiento.
- Los cambios de negocio no deben depender del estilo de la UI ni de la base de datos en sí.
