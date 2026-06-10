# 🅰️ Orders Front - Angular 19

![Angular](https://img.shields.io/badge/Angular-19-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Standalone](https://img.shields.io/badge/Arquitectura-Standalone-purple)
![JWT](https://img.shields.io/badge/Auth-JWT%20en%20Memoria-green)
![Build](https://img.shields.io/badge/Build-Passing-brightgreen)

Frontend desarrollado en **Angular 19 Standalone** para consumir la [Orders API (.NET 9)](https://github.com/manuelsalgadof/orders-api-dotnet). Implementa autenticación JWT en memoria, guards, interceptors y arquitectura Core/Features.

---

## 🌐 Backend

Este frontend consume:

👉 [orders-api-dotnet](https://github.com/manuelsalgadof/orders-api-dotnet) — API REST .NET 9 en Azure Container Apps

---

## 🧠 Descripción

Este proyecto demuestra un flujo frontend completo con Angular moderno:

- Arquitectura standalone (sin NgModules)
- Señales Angular (Signals) para estado reactivo
- JWT almacenado en memoria (sin localStorage)
- HttpClient con interceptor funcional de autenticación
- Guards funcionales para rutas protegidas
- Formularios reactivos con validación
- Consumo de API REST paginada
- Polling de estado de jobs en tiempo real
- Sistema de diseño CSS propio (sin dependencias de UI externas)

---

## 🏗️ Arquitectura

Core (modelos / servicios / interceptors / guards) → Features (login / pedidos / jobs / usuarios)

---

## 📂 Estructura

```
src/app/
├── core/
│   ├── models/        → Interfaces TypeScript (contratos con backend)
│   ├── services/      → AuthService, OrderService, JobService, UserService
│   ├── interceptors/  → authInterceptor (token Bearer automático)
│   └── guards/        → authGuard (protección de rutas)
└── features/
    ├── login/         → Formulario de autenticación
    ├── orders/        → Lista paginada + crear pedido con ítems
    ├── jobs/          → Reprocesamiento batch + polling de estado
    └── users/         → Gestión de usuarios (rol Admin)
```

---

## ⚙️ Funcionalidades

### 🔑 Autenticación

```
POST /api/Auth/Generartoken
```

✔ Formulario reactivo con validación  
✔ Manejo de credenciales inválidas (401)  
✔ Redirección automática a `/orders` tras login exitoso  
✔ JWT almacenado en memoria — nunca localStorage  

---

### 🛒 Pedidos

```
GET  /api/Orders?page=1&pageSize=10
POST /api/Orders
```

✔ Lista paginada con información de cliente  
✔ Crear pedido con múltiples ítems (FormArray dinámico)  
✔ Manejo de duplicados (409 Conflict)  

---

### 🔄 Jobs de Reprocesamiento

```
POST /api/Jobs/reprocess-orders
GET  /api/Jobs/{id}
```

✔ Lanza procesamiento batch (Stored Procedure en SQL Server)  
✔ Polling automático de estado cada 2 segundos  
✔ Limpieza de recursos en `ngOnDestroy`  

---

### 👥 Usuarios (Admin)

```
GET    /api/Users
POST   /api/Users
DELETE /api/Users/{id}
```

✔ Solo visible para usuarios con rol `Admin`  
✔ Creación de usuarios con hash seguro en backend (PBKDF2-SHA256)  
✔ Protección contra auto-eliminación en servidor  

---

## 🔐 Seguridad

- JWT almacenado en memoria del servicio Angular (señal reactiva)
- Sin uso de `localStorage` ni `sessionStorage`
- `authInterceptor` inyecta `Authorization: Bearer {token}` automáticamente
- `authGuard` redirige a `/login` si no hay sesión activa
- Sin `innerHTML`, sin `any`, sin bypass de seguridad del framework

---

## ⚡ Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| Angular | 19 | Framework principal |
| TypeScript | 5.6 | Tipado estricto |
| RxJS | 7.8 | Operadores reactivos |
| Angular Signals | integrado | Estado reactivo |
| Reactive Forms | integrado | Formularios tipados |
| HttpClient | integrado | Consumo de API REST |
| Karma + Jasmine | 6.4 / 5.4 | Pruebas unitarias |

---

## 🧪 Testing

Proyecto de pruebas: `AppComponent` (3 tests)

Incluye pruebas unitarias sobre el componente raíz: creación, disponibilidad del servicio de auth y comportamiento de navegación sin sesión activa.

---

## 🚀 Instalación y uso

### Requisitos

- Node.js 20+
- Angular CLI 19+
- [Orders API (.NET 9)](https://github.com/manuelsalgadof/orders-api-dotnet) corriendo en `http://localhost:5199`

### Instalar dependencias

```bash
npm install
```

### Servidor de desarrollo

```bash
ng serve
```

Abrir `http://localhost:4200` — redirige automáticamente a `/login`.

### Build

```bash
ng build --configuration development    # desarrollo
ng build --configuration production     # producción (requiere apiUrl configurada)
```

### Pruebas

```bash
ng test --watch=false --browsers=ChromeHeadless
```

---

## 🔧 Configuración

### Desarrollo (automático)

El archivo `src/environments/environment.development.ts` apunta a `http://localhost:5199`.

### Producción

Actualizar `src/environments/environment.ts` con la URL del backend desplegado antes de hacer build:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-api-url.azurecontainerapps.io'
};
```

---

## 🛡️ Buenas prácticas aplicadas

- Arquitectura Angular moderna (Standalone + Signals)
- JWT en memoria — sin exposición ante XSS
- TypeScript estricto (sin `any`, sin `innerHTML`)
- Separación de responsabilidades (Core / Features)
- Contratos tipados entre frontend y backend (interfaces TypeScript)
- Formularios reactivos con validación en cliente
- Limpieza de recursos en ciclo de vida del componente
- Manejo correcto de errores HTTP (401, 403, 409)

---

## 🧠 Qué demuestra este proyecto

✔ Desarrollo frontend completo con Angular moderno  
✔ Pensamiento orientado a seguridad (JWT sin localStorage)  
✔ Consumo correcto de API REST con contratos tipados  
✔ Formularios reactivos con FormArray dinámico  
✔ Polling reactivo con limpieza de recursos  
✔ Separación de responsabilidades (Core / Features)  
✔ TypeScript estricto sin atajos  

---

## 👨‍💻 Autor

Proyecto desarrollado como ejercicio práctico de portfolio para demostrar habilidades en desarrollo frontend con Angular 19, TypeScript y consumo de APIs REST seguras.

Parte del stack completo:

- 🔵 Backend: [orders-api-dotnet](https://github.com/manuelsalgadof/orders-api-dotnet) — .NET 9 + SQL Server + Azure
- 🔴 Frontend: este repositorio — Angular 19
