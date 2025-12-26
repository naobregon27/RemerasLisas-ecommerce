# Documentación de API - Backend RemerasLisas

## 📋 Índice
- [Información General](#información-general)
- [Autenticación](#autenticación)
- [Roles y Permisos](#roles-y-permisos)
- [Endpoints Públicos](#endpoints-públicos)
- [Endpoints de Usuario](#endpoints-de-usuario)
- [Endpoints de Administración](#endpoints-de-administración)
- [Códigos de Estado HTTP](#códigos-de-estado-http)

---

## 🔐 Información General

### URL Base
```
http://localhost:3000/api
```

### Formato de Respuestas
Todas las respuestas del API siguen este formato:

**Éxito:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Mensaje descriptivo"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Mensaje de error",
  "error": "Detalle del error"
}
```

---

## 🔑 Autenticación

### Header de Autenticación
Para endpoints protegidos, incluir el token en el header:
```
Authorization: Bearer {token}
```

### Obtención del Token
El token se obtiene al hacer login exitoso y debe almacenarse de forma segura en el cliente.

---

## 👥 Roles y Permisos

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| `usuario` | Usuario normal del sistema | Endpoints públicos + carrito + pedidos propios |
| `admin` | Administrador de local | Todo lo de usuario + gestión de su local |
| `superAdmin` | Super Administrador | Acceso total al sistema |

**Leyenda:**
- 🌍 **PÚBLICO** - No requiere autenticación
- 🔒 **PROTEGIDO** - Requiere autenticación
- 👤 **USUARIO** - Requiere rol: usuario o superior
- 🛡️ **ADMIN** - Requiere rol: admin o superAdmin
- ⚡ **SUPERADMIN** - Solo superAdmin

---

# 📚 ENDPOINTS

## 1️⃣ Autenticación (`/api/auth`)

### 1.1 Registro de Usuario
**🌍 PÚBLICO**
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@email.com",
  "password": "Password123!",
  "phone": "+54911234567",
  "role": "usuario"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente. Te hemos enviado un código de 6 dígitos a tu email.",
  "data": {
    "user": {
      "id": "657abc123def...",
      "name": "Juan Pérez",
      "email": "juan@email.com",
      "role": "usuario",
      "isEmailVerified": false
    },
    "requiresEmailVerification": true
  }
}
```

### 1.2 Verificar Email
**🌍 PÚBLICO**
```http
POST /api/auth/verify-email
```

**Request Body:**
```json
{
  "email": "juan@email.com",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verificado exitosamente. Ya puedes iniciar sesión.",
  "data": {
    "user": {
      "id": "657abc123def...",
      "name": "Juan Pérez",
      "email": "juan@email.com",
      "role": "usuario",
      "isEmailVerified": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.3 Reenviar Código de Verificación
**🌍 PÚBLICO**
```http
POST /api/auth/resend-verification
```

**Request Body:**
```json
{
  "email": "juan@email.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Si el email existe y no está verificado, recibirás un nuevo código"
}
```

### 1.4 Login
**🌍 PÚBLICO**
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "juan@email.com",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "657abc123def...",
      "name": "Juan Pérez",
      "email": "juan@email.com",
      "role": "usuario",
      "isEmailVerified": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errores Comunes:**
- `403` - Email no verificado
- `401` - Credenciales inválidas
- `401` - Cuenta desactivada

### 1.5 Recuperar Contraseña
**🌍 PÚBLICO**
```http
POST /api/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "juan@email.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Si el email existe, recibirás un código de recuperación"
}
```

### 1.6 Restablecer Contraseña
**🌍 PÚBLICO**
```http
POST /api/auth/reset-password
```

**Request Body:**
```json
{
  "email": "juan@email.com",
  "code": "123456",
  "password": "NuevaPassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.7 Obtener Perfil del Usuario
**🔒 PROTEGIDO**
```http
GET /api/auth/profile
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "657abc123def...",
      "name": "Juan Pérez",
      "email": "juan@email.com",
      "phone": "+54911234567",
      "role": "usuario",
      "isEmailVerified": true,
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### 1.8 Actualizar Perfil
**🔒 PROTEGIDO**
```http
PUT /api/auth/profile
```

**Request Body:**
```json
{
  "name": "Juan Carlos Pérez",
  "email": "juanc@email.com",
  "phone": "+54911234567"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "user": {
      "id": "657abc123def...",
      "name": "Juan Carlos Pérez",
      "email": "juanc@email.com",
      "phone": "+54911234567",
      "role": "usuario",
      "isEmailVerified": true
    }
  }
}
```

### 1.9 Cambiar Contraseña
**🔒 PROTEGIDO**
```http
PUT /api/auth/update-password
```

**Request Body:**
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword456!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.10 Logout
**🔒 PROTEGIDO**
```http
POST /api/auth/logout
```

**Response (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

---

## 2️⃣ Productos (`/api/productos`)

### 2.1 Obtener Todos los Productos
**🌍 PÚBLICO**
```http
GET /api/productos
```

**Query Parameters:**
- `destacado` (boolean) - Filtrar productos destacados
- `enOferta` (boolean) - Filtrar productos en oferta
- `sort` (string) - Ordenamiento: `-createdAt`, `precio`, `-precio`
- `limit` (number) - Productos por página (default: 10)
- `page` (number) - Número de página (default: 1)
- `search` (string) - Búsqueda por nombre o descripción

**Ejemplo:**
```http
GET /api/productos?destacado=true&limit=20&page=1
```

**Response (200):**
```json
{
  "productos": [
    {
      "_id": "657abc123def...",
      "nombre": "Remera Básica",
      "descripcion": "Remera de algodón 100%",
      "precio": 5000,
      "precioAnterior": 6000,
      "imagenes": [
        {
          "url": "data:image/jpeg;base64,...",
          "alt": "Remera básica blanca"
        }
      ],
      "stock": 50,
      "categoria": {
        "_id": "657abc...",
        "nombre": "Remeras"
      },
      "local": {
        "_id": "657def...",
        "nombre": "Local Centro",
        "direccion": "Av. Corrientes 1234"
      },
      "destacado": true,
      "enOferta": true,
      "porcentajeDescuento": 15,
      "slug": "remera-basica",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "paginacion": {
    "total": 100,
    "paginas": 10,
    "paginaActual": 1,
    "porPagina": 10
  }
}
```

### 2.2 Obtener Producto por ID
**🌍 PÚBLICO**
```http
GET /api/productos/:id
```

**Response (200):**
```json
{
  "_id": "657abc123def...",
  "nombre": "Remera Básica",
  "descripcion": "Remera de algodón 100%",
  "precio": 5000,
  "precioAnterior": 6000,
  "imagenes": [
    {
      "url": "data:image/jpeg;base64,...",
      "alt": "Remera básica blanca"
    }
  ],
  "stock": 50,
  "etiquetas": ["básica", "algodón", "unisex"],
  "caracteristicas": [
    {
      "nombre": "Material",
      "valor": "Algodón 100%"
    },
    {
      "nombre": "Talle",
      "valor": "S, M, L, XL"
    }
  ],
  "variantes": [
    {
      "nombre": "Color",
      "opciones": ["Blanco", "Negro", "Gris"]
    }
  ],
  "categoria": {
    "_id": "657abc...",
    "nombre": "Remeras"
  },
  "local": {
    "_id": "657def...",
    "nombre": "Local Centro",
    "direccion": "Av. Corrientes 1234"
  },
  "destacado": true,
  "enOferta": true,
  "porcentajeDescuento": 15,
  "slug": "remera-basica",
  "reviews": [],
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### 2.3 Obtener Productos por Categoría
**🌍 PÚBLICO**
```http
GET /api/productos/categoria/:id
```

**Query Parameters:**
- `sort` - Ordenamiento
- `limit` - Productos por página
- `page` - Número de página

**Response:** Similar a 2.1 pero filtrado por categoría

### 2.4 Obtener Productos por Local
**🌍 PÚBLICO**
```http
GET /api/productos/local/:id
```

**Query Parameters:**
- `sort` - Ordenamiento
- `limit` - Productos por página
- `page` - Número de página

**Response:** Similar a 2.1 pero filtrado por local

### 2.5 Crear Producto
**🛡️ ADMIN ONLY**
```http
POST /api/productos
Content-Type: multipart/form-data
```

**Request Body (form-data):**
```
nombre: "Remera Premium"
descripcion: "Remera de alta calidad"
precio: 8000
precioAnterior: 10000
stock: 30
categoria: "657abc123def..."
local: "657def456ghi..."
imagenes: [archivo de imagen]
etiquetas: ["premium", "algodón"]
caracteristicas: [{"nombre":"Material","valor":"Algodón"}]
destacado: true
enOferta: true
porcentajeDescuento: 20
```

**Response (201):**
```json
{
  "_id": "nuevo123...",
  "nombre": "Remera Premium",
  "descripcion": "Remera de alta calidad",
  "precio": 8000,
  "slug": "remera-premium",
  "createdAt": "2024-01-20T15:00:00.000Z",
  ...
}
```

**Permisos:**
- `admin`: Solo puede crear productos para su local asignado
- `superAdmin`: Puede crear productos para cualquier local

### 2.6 Actualizar Producto
**🛡️ ADMIN ONLY**
```http
PUT /api/productos/:id
Content-Type: multipart/form-data
```

**Request Body:** Similar a 2.5

**Permisos:**
- `admin`: Solo puede actualizar productos de su local
- `superAdmin`: Puede actualizar cualquier producto

### 2.7 Eliminar Producto (Soft Delete)
**🛡️ ADMIN ONLY**
```http
DELETE /api/productos/:id
```

**Response (200):**
```json
{
  "mensaje": "Producto eliminado correctamente"
}
```

### 2.8 Restaurar Producto
**🛡️ ADMIN ONLY**
```http
PATCH /api/productos/:id/restore
```

**Response (200):**
```json
{
  "mensaje": "Producto restaurado correctamente"
}
```

---

## 3️⃣ Categorías (`/api/categorias`)

### 3.1 Obtener Todas las Categorías
**🌍 PÚBLICO**
```http
GET /api/categorias
```

**Query Parameters:**
- `local` (string) - Filtrar por ID de local

**Response (200):**
```json
[
  {
    "_id": "657abc123def...",
    "nombre": "Remeras",
    "descripcion": "Todo tipo de remeras",
    "slug": "remeras",
    "imagen": "/uploads/categoria-123.jpg",
    "local": {
      "_id": "657def...",
      "nombre": "Local Centro",
      "direccion": "Av. Corrientes 1234"
    },
    "categoriaPadre": null,
    "isActive": true,
    "createdAt": "2024-01-10T08:00:00.000Z"
  }
]
```

### 3.2 Obtener Categoría por ID o Slug
**🌍 PÚBLICO**
```http
GET /api/categorias/:id
```

**Response (200):**
```json
{
  "_id": "657abc123def...",
  "nombre": "Remeras",
  "descripcion": "Todo tipo de remeras",
  "slug": "remeras",
  "imagen": "/uploads/categoria-123.jpg",
  "local": {
    "_id": "657def...",
    "nombre": "Local Centro"
  },
  "categoriaPadre": null,
  "isActive": true
}
```

### 3.3 Obtener Subcategorías
**🌍 PÚBLICO**
```http
GET /api/categorias/:id/subcategorias
```

**Response (200):**
```json
[
  {
    "_id": "657abc456...",
    "nombre": "Remeras Manga Corta",
    "slug": "remeras-manga-corta",
    "categoriaPadre": "657abc123def..."
  }
]
```

### 3.4 Obtener Categorías por Local
**🌍 PÚBLICO**
```http
GET /api/categorias/local/:localId
```

**Response:** Array de categorías del local especificado

### 3.5 Crear Categoría
**🛡️ ADMIN ONLY**
```http
POST /api/categorias
Content-Type: multipart/form-data
```

**Request Body:**
```
nombre: "Buzos"
descripcion: "Buzos y sudaderas"
localId: "657def456ghi..."
categoriaPadreId: null
imagen: [archivo de imagen]
```

**Response (201):**
```json
{
  "_id": "nueva123...",
  "nombre": "Buzos",
  "slug": "buzos",
  "descripcion": "Buzos y sudaderas",
  "imagen": "/uploads/categoria-nueva.jpg",
  "local": "657def456ghi...",
  "categoriaPadre": null,
  "isActive": true
}
```

**Permisos:**
- `admin`: Solo puede crear categorías para su local
- `superAdmin`: Puede crear categorías para cualquier local

### 3.6 Actualizar Categoría
**🛡️ ADMIN ONLY**
```http
PUT /api/categorias/:id
```

### 3.7 Eliminar Categoría
**🛡️ ADMIN ONLY**
```http
DELETE /api/categorias/:id
```

### 3.8 Restaurar Categoría
**🛡️ ADMIN ONLY**
```http
PATCH /api/categorias/:id/restore
```

---

## 4️⃣ Carrito (`/api/carrito`)

### 4.1 Obtener Carrito del Usuario
**🔒 PROTEGIDO**
```http
GET /api/carrito
```

**Response (200):**
```json
{
  "_id": "carrito123...",
  "usuario": "usuario123...",
  "local": "local123...",
  "productos": [
    {
      "producto": {
        "_id": "producto123...",
        "nombre": "Remera Básica",
        "precio": 5000,
        "imagenes": [...],
        "stock": 50,
        "slug": "remera-basica",
        "categoria": {
          "nombre": "Remeras"
        },
        "local": {
          "nombre": "Local Centro"
        }
      },
      "cantidad": 2,
      "variante": {
        "Color": "Blanco",
        "Talle": "M"
      },
      "precioUnitario": 5000,
      "subtotal": 10000
    }
  ],
  "guardados": [],
  "totalProductos": 2,
  "total": 10000,
  "createdAt": "2024-01-20T10:00:00.000Z",
  "updatedAt": "2024-01-20T14:30:00.000Z"
}
```

### 4.2 Agregar Producto al Carrito
**🔒 PROTEGIDO**
```http
POST /api/carrito
```

**Request Body:**
```json
{
  "productoId": "producto123...",
  "cantidad": 2,
  "variante": {
    "Color": "Blanco",
    "Talle": "M"
  }
}
```

**Response (200):**
```json
{
  "_id": "carrito123...",
  "productos": [...],
  "total": 15000
}
```

### 4.3 Actualizar Cantidad de Producto
**🔒 PROTEGIDO**
```http
PUT /api/carrito/:productoId
```

**Request Body:**
```json
{
  "cantidad": 3,
  "variante": {
    "Color": "Blanco",
    "Talle": "M"
  }
}
```

**Response (200):**
```json
{
  "_id": "carrito123...",
  "productos": [...],
  "total": 15000
}
```

**Nota:** Si `cantidad` es 0, el producto se elimina del carrito

### 4.4 Eliminar Producto del Carrito
**🔒 PROTEGIDO**
```http
DELETE /api/carrito/:productoId
```

**Request Body:**
```json
{
  "variante": {
    "Color": "Blanco",
    "Talle": "M"
  }
}
```

**Response (200):**
```json
{
  "mensaje": "Producto eliminado del carrito",
  "carrito": {...}
}
```

### 4.5 Vaciar Carrito
**🔒 PROTEGIDO**
```http
DELETE /api/carrito
```

**Response (200):**
```json
{
  "mensaje": "Carrito vaciado",
  "carrito": {
    "productos": [],
    "total": 0
  }
}
```

### 4.6 Guardar Producto para Después
**🔒 PROTEGIDO**
```http
POST /api/carrito/guardar/:productoId
```

**Request Body:**
```json
{
  "variante": {
    "Color": "Negro"
  }
}
```

**Response (200):**
```json
{
  "guardados": [
    {
      "producto": {...},
      "variante": {...}
    }
  ]
}
```

### 4.7 Mover de Guardados al Carrito
**🔒 PROTEGIDO**
```http
POST /api/carrito/mover/:productoId
```

**Request Body:**
```json
{
  "variante": {
    "Color": "Negro"
  },
  "cantidad": 1
}
```

**Response (200):**
```json
{
  "productos": [...],
  "guardados": [...],
  "total": 5000
}
```

---

## 5️⃣ Pedidos (`/api/pedidos`)

### 5.1 Crear Pedido
**🔒 PROTEGIDO**
```http
POST /api/pedidos
```

**Request Body:**
```json
{
  "direccionEnvio": {
    "calle": "Av. Corrientes",
    "numero": "1234",
    "piso": "5",
    "departamento": "A",
    "ciudad": "Buenos Aires",
    "provincia": "CABA",
    "codigoPostal": "1043",
    "telefono": "+54911234567"
  },
  "metodoPago": "mercadopago",
  "impuestos": 500,
  "costoEnvio": 1000,
  "notas": "Tocar timbre 5A"
}
```

**Response (201):**
```json
{
  "_id": "pedido123...",
  "codigoPedido": "PED-20240120-001",
  "usuario": {
    "_id": "user123...",
    "name": "Juan Pérez",
    "email": "juan@email.com"
  },
  "productos": [
    {
      "producto": {
        "nombre": "Remera Básica",
        "precio": 5000,
        "imagenes": [...]
      },
      "cantidad": 2,
      "variante": {...},
      "precio": 5000,
      "subtotal": 10000
    }
  ],
  "direccionEnvio": {...},
  "metodoPago": "mercadopago",
  "subtotal": 10000,
  "impuestos": 500,
  "costoEnvio": 1000,
  "descuento": 0,
  "total": 11500,
  "estadoPedido": "pendiente",
  "estadoPago": "pendiente",
  "local": {
    "nombre": "Local Centro",
    "direccion": "Av. Corrientes 1234"
  },
  "createdAt": "2024-01-20T15:00:00.000Z"
}
```

**Notas:**
- El carrito se vacía automáticamente después de crear el pedido
- Se envía un email de confirmación al usuario
- El stock de los productos se reduce automáticamente

### 5.2 Obtener Pedidos del Usuario
**🔒 PROTEGIDO**
```http
GET /api/pedidos/mispedidos
```

**Response (200):**
```json
[
  {
    "_id": "pedido123...",
    "codigoPedido": "PED-20240120-001",
    "productos": [...],
    "total": 11500,
    "estadoPedido": "procesando",
    "estadoPago": "completado",
    "local": {...},
    "createdAt": "2024-01-20T15:00:00.000Z"
  }
]
```

### 5.3 Obtener Pedido por ID
**🔒 PROTEGIDO**
```http
GET /api/pedidos/:id
```

**Response (200):**
```json
{
  "_id": "pedido123...",
  "codigoPedido": "PED-20240120-001",
  "usuario": {...},
  "productos": [...],
  "direccionEnvio": {...},
  "metodoPago": "mercadopago",
  "subtotal": 10000,
  "impuestos": 500,
  "costoEnvio": 1000,
  "total": 11500,
  "estadoPedido": "procesando",
  "estadoPago": "completado",
  "historialEstados": [
    {
      "estado": "pendiente",
      "fecha": "2024-01-20T15:00:00.000Z",
      "usuario": {...},
      "notas": ""
    },
    {
      "estado": "procesando",
      "fecha": "2024-01-20T16:00:00.000Z",
      "usuario": {...},
      "notas": "Pedido en preparación"
    }
  ],
  "historialPagos": [...],
  "local": {...},
  "createdAt": "2024-01-20T15:00:00.000Z"
}
```

**Permisos:**
- Usuario: Solo puede ver sus propios pedidos
- Admin/SuperAdmin: Puede ver cualquier pedido

### 5.4 Obtener Todos los Pedidos (Admin)
**🛡️ ADMIN ONLY**
```http
GET /api/pedidos/admin/pedidos
```

**Query Parameters:**
- `estadoPedido` - Filtrar por estado: `pendiente`, `procesando`, `enviado`, `entregado`, `cancelado`
- `estadoPago` - Filtrar por pago: `pendiente`, `procesando`, `completado`, `fallido`, `reembolsado`
- `page` - Número de página (default: 1)
- `limit` - Pedidos por página (default: 10)

**Ejemplo:**
```http
GET /api/pedidos/admin/pedidos?estadoPedido=pendiente&page=1&limit=20
```

**Response (200):**
```json
{
  "pedidos": [
    {
      "_id": "pedido123...",
      "codigoPedido": "PED-20240120-001",
      "usuario": {
        "name": "Juan Pérez",
        "email": "juan@email.com"
      },
      "productos": [...],
      "total": 11500,
      "estadoPedido": "pendiente",
      "estadoPago": "completado",
      "local": {
        "nombre": "Local Centro"
      },
      "createdAt": "2024-01-20T15:00:00.000Z"
    }
  ],
  "paginacion": {
    "total": 50,
    "paginas": 5,
    "paginaActual": 1,
    "porPagina": 10
  }
}
```

**Permisos:**
- `admin`: Solo ve pedidos de su local
- `superAdmin`: Ve todos los pedidos

### 5.5 Actualizar Estado del Pedido
**🛡️ ADMIN ONLY**
```http
PUT /api/pedidos/:id/estado
```

**Request Body:**
```json
{
  "estado": "procesando",
  "notas": "Pedido en preparación"
}
```

**Estados válidos:**
- `pendiente`
- `procesando`
- `enviado`
- `entregado`
- `cancelado`

**Response (200):**
```json
{
  "_id": "pedido123...",
  "estadoPedido": "procesando",
  "historialEstados": [...],
  ...
}
```

**Notas:**
- Al cambiar a `entregado`, se registra automáticamente `fechaEntrega`
- Al cambiar a `cancelado`, se restaura el stock de productos
- Se envía email de notificación al usuario

**Permisos:**
- `admin`: Solo puede actualizar pedidos de su local
- `superAdmin`: Puede actualizar cualquier pedido

### 5.6 Actualizar Estado de Pago
**🛡️ ADMIN ONLY**
```http
PUT /api/pedidos/:id/pago
```

**Request Body:**
```json
{
  "estadoPago": "completado",
  "idTransaccion": "MP-123456789",
  "notas": "Pago verificado"
}
```

**Estados válidos:**
- `pendiente`
- `procesando`
- `completado`
- `fallido`
- `reembolsado`

**Response (200):**
```json
{
  "_id": "pedido123...",
  "estadoPago": "completado",
  "datosTransaccion": {
    "idTransaccion": "MP-123456789",
    "fechaTransaccion": "2024-01-20T15:30:00.000Z"
  },
  "historialPagos": [...],
  ...
}
```

### 5.7 Eliminar Pedido
**🛡️ ADMIN ONLY**
```http
DELETE /api/pedidos/:id
```

**Response (200):**
```json
{
  "mensaje": "Pedido eliminado permanentemente"
}
```

**Notas:**
- Elimina el pedido de la base de datos (no es soft delete)
- Si el pedido no está cancelado, restaura el stock de productos

**Permisos:**
- `admin`: Solo puede eliminar pedidos de su local
- `superAdmin`: Puede eliminar cualquier pedido

---

## 6️⃣ Gestión de Usuarios (`/api/users`)

**⚠️ TODOS LOS ENDPOINTS DE ESTA SECCIÓN SON SOLO PARA ADMIN/SUPERADMIN**

### 6.1 Obtener Todos los Usuarios
**🛡️ ADMIN ONLY**
```http
GET /api/users
```

**Query Parameters:**
- `role` - Filtrar por rol: `usuario`, `admin`, `superAdmin`
- `isActive` - Filtrar por estado: `true`, `false`
- `isEmailVerified` - Filtrar por verificación: `true`, `false`
- `search` - Buscar por nombre, email o teléfono
- `page` - Número de página (default: 1)
- `limit` - Usuarios por página (default: 10)

**Ejemplo:**
```http
GET /api/users?role=usuario&isActive=true&search=juan&page=1&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "user123...",
        "name": "Juan Pérez",
        "email": "juan@email.com",
        "phone": "+54911234567",
        "role": "usuario",
        "isActive": true,
        "isEmailVerified": true,
        "lastLogin": "2024-01-20T10:00:00.000Z",
        "loginCount": 15,
        "local": {
          "nombre": "Local Centro",
          "direccion": "Av. Corrientes 1234"
        },
        "createdBy": {
          "name": "Admin",
          "email": "admin@local.com"
        },
        "createdAt": "2024-01-10T08:00:00.000Z",
        "updatedAt": "2024-01-20T10:00:00.000Z",
        "daysSinceCreation": 10,
        "daysSinceLastLogin": 0,
        "hasRecentLogin": true,
        "status": "active"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPreviousPage": false
    },
    "statistics": {
      "total": 50,
      "active": 45,
      "inactive": 5,
      "verified": 48,
      "unverified": 2,
      "recentLogins": 30,
      "byRole": {
        "usuario": 40,
        "admin": 9,
        "superAdmin": 1
      }
    },
    "filters": {
      "role": null,
      "isActive": null,
      "isEmailVerified": null,
      "search": null
    }
  },
  "meta": {
    "timestamp": "2024-01-20T15:00:00.000Z",
    "requestId": "1705762800000"
  }
}
```

### 6.2 Obtener Usuario por ID
**🛡️ ADMIN ONLY**
```http
GET /api/users/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user123...",
      "name": "Juan Pérez",
      "email": "juan@email.com",
      "phone": "+54911234567",
      "role": "usuario",
      "isActive": true,
      "isEmailVerified": true,
      "lastLogin": "2024-01-20T10:00:00.000Z",
      "loginCount": 15,
      "local": {...},
      "createdBy": {...},
      "createdAt": "2024-01-10T08:00:00.000Z",
      "accountInfo": {
        "daysSinceCreation": 10,
        "accountAge": "10 días",
        "createdAt": "2024-01-10T08:00:00.000Z",
        "updatedAt": "2024-01-20T10:00:00.000Z"
      },
      "loginInfo": {
        "hasLoggedIn": true,
        "daysSinceLastLogin": 0,
        "isRecentLogin": true,
        "loginFrequency": 1
      },
      "passwordInfo": {
        "hasChangedPassword": false,
        "daysSincePasswordChange": null,
        "passwordAge": null
      },
      "statusInfo": {
        "isActive": true,
        "isEmailVerified": true,
        "status": "active",
        "verificationStatus": "verified"
      },
      "security": {
        "isEmailVerified": true,
        "lastIp": "192.168.1.1",
        "lastUserAgent": "Mozilla/5.0...",
        "loginCount": 15
      }
    },
    "metadata": {
      "role": "usuario",
      "permissions": {
        "canBeDeleted": true,
        "canBeModified": true,
        "canChangeRole": false
      }
    }
  }
}
```

### 6.3 Crear Usuario
**🛡️ ADMIN ONLY**
```http
POST /api/users
```

**Request Body:**
```json
{
  "name": "María González",
  "email": "maria@email.com",
  "password": "Password123!",
  "role": "usuario"
}
```

**Response (201):**
```json
{
  "_id": "newuser123...",
  "name": "María González",
  "email": "maria@email.com",
  "role": "usuario",
  "createdAt": "2024-01-20T15:00:00.000Z",
  "createdBy": "admin123..."
}
```

**Permisos:**
- `admin`: No puede crear usuarios con rol `superAdmin`
- `superAdmin`: Puede crear usuarios con cualquier rol

### 6.4 Actualizar Usuario
**🛡️ ADMIN ONLY**
```http
PUT /api/users/:id
```

**Request Body:**
```json
{
  "name": "María G. González",
  "email": "mariag@email.com",
  "role": "admin",
  "password": "NewPassword123!"
}
```

**Response (200):**
```json
{
  "_id": "user123...",
  "name": "María G. González",
  "email": "mariag@email.com",
  "role": "admin",
  "lastLogin": "2024-01-20T10:00:00.000Z",
  "loginCount": 5,
  "isActive": true,
  "updatedAt": "2024-01-20T15:30:00.000Z"
}
```

**Restricciones:**
- `admin` no puede modificar usuarios `superAdmin`
- `admin` no puede asignar rol `superAdmin`

### 6.5 Desactivar Usuario
**🛡️ ADMIN ONLY**
```http
DELETE /api/users/:id
```

**Response (200):**
```json
{
  "message": "Usuario desactivado",
  "user": {
    "_id": "user123...",
    "name": "Juan Pérez",
    "email": "juan@email.com",
    "isActive": false,
    "deactivatedAt": "2024-01-20T15:30:00.000Z",
    "deactivatedBy": "admin123..."
  }
}
```

**Nota:** Es un soft delete, el usuario no se elimina de la base de datos

### 6.6 Activar Usuario
**🛡️ ADMIN ONLY**
```http
PATCH /api/users/:id/restore
```

**Response (200):**
```json
{
  "message": "Usuario activado",
  "user": {
    "_id": "user123...",
    "name": "Juan Pérez",
    "email": "juan@email.com",
    "isActive": true,
    "activatedAt": "2024-01-20T16:00:00.000Z",
    "activatedBy": "admin123..."
  }
}
```

### 6.7 Cambiar Estado de Usuario
**🛡️ ADMIN ONLY**
```http
PATCH /api/users/:id/toggle-status
```

**Response (200):**
```json
{
  "message": "Usuario activado",
  "user": {
    "_id": "user123...",
    "name": "Juan Pérez",
    "email": "juan@email.com",
    "isActive": true,
    "statusChangedAt": "2024-01-20T16:00:00.000Z",
    "statusChangedBy": "admin123..."
  }
}
```

### 6.8 Obtener Usuarios Inactivos
**🛡️ ADMIN ONLY**
```http
GET /api/users/inactive
```

**Response (200):**
```json
[
  {
    "_id": "user456...",
    "name": "Usuario Desactivado",
    "email": "desactivado@email.com",
    "isActive": false,
    "deactivatedBy": {...},
    "deactivatedAt": "2024-01-15T10:00:00.000Z"
  }
]
```

### 6.9 Obtener Usuarios por Local
**🛡️ ADMIN ONLY**
```http
GET /api/users/local
```

**Response (200):**
```json
[
  {
    "_id": "user123...",
    "name": "Juan Pérez",
    "email": "juan@email.com",
    "role": "usuario",
    "local": {
      "nombre": "Local Centro",
      "direccion": "Av. Corrientes 1234"
    }
  }
]
```

**Nota:** Solo devuelve usuarios del local asignado al admin que hace la petición

---

## 7️⃣ Gestión de Locales (`/api/locales`)

**⚠️ TODOS LOS ENDPOINTS DE ESTA SECCIÓN REQUIEREN AUTENTICACIÓN**

### 7.1 Obtener Todos los Locales
**⚡ SUPERADMIN ONLY**
```http
GET /api/locales
```

**Response (200):**
```json
[
  {
    "_id": "local123...",
    "nombre": "Local Centro",
    "slug": "local-centro",
    "direccion": "Av. Corrientes 1234",
    "telefono": "+541143211234",
    "email": "centro@remeras.com",
    "horarioAtencion": "Lunes a Viernes 9:00 - 18:00",
    "ubicacionGPS": {
      "lat": -34.6037,
      "lng": -58.3816
    },
    "administrador": {
      "_id": "admin123...",
      "name": "Admin Local",
      "email": "admin@local.com",
      "role": "admin"
    },
    "empleados": [
      {
        "_id": "emp123...",
        "name": "Empleado 1",
        "email": "emp1@local.com"
      }
    ],
    "createdBy": {
      "name": "Super Admin",
      "email": "super@admin.com"
    },
    "isActive": true,
    "createdAt": "2024-01-05T08:00:00.000Z"
  }
]
```

### 7.2 Obtener Local por ID
**🛡️ ADMIN ONLY**
```http
GET /api/locales/:id
```

**Response (200):**
```json
{
  "_id": "local123...",
  "nombre": "Local Centro",
  "slug": "local-centro",
  "direccion": "Av. Corrientes 1234",
  "telefono": "+541143211234",
  "email": "centro@remeras.com",
  "horarioAtencion": "Lunes a Viernes 9:00 - 18:00",
  "ubicacionGPS": {
    "lat": -34.6037,
    "lng": -58.3816
  },
  "administrador": {...},
  "empleados": [...],
  "createdBy": {...},
  "isActive": true,
  "createdAt": "2024-01-05T08:00:00.000Z"
}
```

**Permisos:**
- `admin`: Solo puede ver su local asignado
- `superAdmin`: Puede ver cualquier local

### 7.3 Crear Local
**⚡ SUPERADMIN ONLY**
```http
POST /api/locales
```

**Request Body:**
```json
{
  "nombre": "Local Palermo",
  "direccion": "Av. Santa Fe 3456",
  "telefono": "+541148765432",
  "email": "palermo@remeras.com",
  "horarioAtencion": "Lunes a Sábado 10:00 - 20:00",
  "ubicacionGPS": {
    "lat": -34.5875,
    "lng": -58.4213
  },
  "administradorId": "admin456..."
}
```

**Response (201):**
```json
{
  "_id": "newlocal123...",
  "nombre": "Local Palermo",
  "slug": "local-palermo",
  "direccion": "Av. Santa Fe 3456",
  "administrador": "admin456...",
  "isActive": true,
  "createdAt": "2024-01-20T15:00:00.000Z"
}
```

### 7.4 Actualizar Local
**⚡ SUPERADMIN ONLY**
```http
PUT /api/locales/:id
```

**Request Body:**
```json
{
  "nombre": "Local Palermo - Renovado",
  "direccion": "Av. Santa Fe 3456, CABA",
  "telefono": "+541148765432",
  "email": "palermo@remeras.com",
  "horarioAtencion": "Lunes a Domingo 10:00 - 21:00",
  "ubicacionGPS": {
    "lat": -34.5875,
    "lng": -58.4213
  },
  "administradorId": "newadmin789..."
}
```

**Response (200):**
```json
{
  "_id": "local123...",
  "nombre": "Local Palermo - Renovado",
  "direccion": "Av. Santa Fe 3456, CABA",
  ...actualizados campos
}
```

### 7.5 Desactivar Local
**⚡ SUPERADMIN ONLY**
```http
DELETE /api/locales/:id
```

**Response (200):**
```json
{
  "message": "Local desactivado",
  "local": {
    "_id": "local123...",
    "nombre": "Local Centro",
    "isActive": false,
    "deactivatedAt": "2024-01-20T15:00:00.000Z"
  }
}
```

### 7.6 Activar Local
**⚡ SUPERADMIN ONLY**
```http
PATCH /api/locales/:id/restore
```

**Response (200):**
```json
{
  "message": "Local activado",
  "local": {
    "_id": "local123...",
    "nombre": "Local Centro",
    "isActive": true,
    "activatedAt": "2024-01-20T16:00:00.000Z"
  }
}
```

### 7.7 Asignar Administrador a Local
**⚡ SUPERADMIN ONLY**
```http
PATCH /api/locales/:id/asignar-admin/:userId
```

**Response (200):**
```json
{
  "message": "Administrador asignado correctamente",
  "local": {
    "_id": "local123...",
    "nombre": "Local Centro"
  },
  "administrador": {
    "_id": "admin123...",
    "name": "Nuevo Admin",
    "email": "nuevo@admin.com"
  }
}
```

### 7.8 Agregar Empleado a Local
**🛡️ ADMIN ONLY**
```http
PATCH /api/locales/:id/agregar-empleado/:userId
```

**Response (200):**
```json
{
  "message": "Empleado agregado correctamente",
  "local": {
    "_id": "local123...",
    "nombre": "Local Centro"
  },
  "empleado": {
    "_id": "emp123...",
    "name": "Empleado Nuevo",
    "email": "empleado@local.com"
  }
}
```

**Permisos:**
- `admin`: Solo puede agregar empleados a su local
- `superAdmin`: Puede agregar empleados a cualquier local

### 7.9 Quitar Empleado de Local
**🛡️ ADMIN ONLY**
```http
PATCH /api/locales/:id/quitar-empleado/:userId
```

**Response (200):**
```json
{
  "message": "Empleado quitado correctamente",
  "local": {
    "_id": "local123...",
    "nombre": "Local Centro"
  },
  "empleado": {
    "_id": "emp123...",
    "name": "Empleado",
    "email": "empleado@local.com"
  }
}
```

---

## 8️⃣ Tienda Pública (`/api/tiendas`)

**🌍 MAYORMENTE PÚBLICO - Endpoints para el frontend de la tienda**

### 8.1 Obtener Información de la Tienda
**🌍 PÚBLICO**
```http
GET /api/tiendas/:slug
```

**Response (200):**
```json
{
  "_id": "local123...",
  "nombre": "Local Centro",
  "direccion": "Av. Corrientes 1234",
  "telefono": "+541143211234",
  "email": "centro@remeras.com",
  "horarioAtencion": "Lunes a Viernes 9:00 - 18:00",
  "ubicacionGPS": {
    "lat": -34.6037,
    "lng": -58.3816
  },
  "configuracionTienda": {
    "colorPrimario": "#FF5733",
    "colorSecundario": "#33FF57",
    "colorTexto": "#000000",
    "mensaje": "Bienvenidos a nuestra tienda",
    "metaTitulo": "Local Centro - Remeras",
    "metaDescripcion": "Las mejores remeras de Buenos Aires",
    "logo": {
      "url": "/storage/images/logos/logo-123.jpg",
      "alt": "Logo Local Centro"
    },
    "bannerPrincipal": [
      {
        "url": "data:image/jpeg;base64,...",
        "alt": "Banner promocional"
      }
    ],
    "carrusel": [
      {
        "url": "data:image/jpeg;base64,...",
        "alt": "Slide 1",
        "titulo": "Nueva Colección",
        "subtitulo": "Descubrí lo nuevo",
        "botonTexto": "Ver más",
        "botonUrl": "/productos",
        "orden": 0
      }
    ],
    "secciones": [
      {
        "id": "seccion123...",
        "titulo": "Sobre Nosotros",
        "contenido": "Somos una tienda con 10 años de experiencia...",
        "imagen": "/storage/images/secciones/seccion-1.jpg",
        "orden": 0
      }
    ]
  },
  "configuracionNegocio": {
    "habilitarCarrito": true,
    "habilitarPagos": true,
    "metodosEnvio": ["retiro", "envio"],
    "metodosPago": ["efectivo", "tarjeta", "mercadopago"]
  },
  "isActive": true
}
```

### 8.2 Obtener Productos Destacados
**🌍 PÚBLICO**
```http
GET /api/tiendas/:slug/destacados
```

**Response (200):**
```json
[
  {
    "_id": "producto123...",
    "nombre": "Remera Premium",
    "descripcion": "Remera de alta calidad",
    "precio": 8000,
    "imagenes": [...],
    "slug": "remera-premium",
    "stock": 25,
    "descuento": 10
  }
]
```

### 8.3 Obtener Categorías de la Tienda
**🌍 PÚBLICO**
```http
GET /api/tiendas/:slug/categorias
```

**Response (200):**
```json
[
  {
    "_id": "cat123...",
    "nombre": "Remeras",
    "slug": "remeras",
    "descripcion": "Todo tipo de remeras",
    "imagen": "/uploads/cat-remeras.jpg"
  }
]
```

### 8.4 Obtener Productos por Categoría
**🌍 PÚBLICO**
```http
GET /api/tiendas/:slug/categorias/:categoriaSlug
```

**Query Parameters:**
- `page` - Número de página (default: 1)
- `limit` - Productos por página (default: 12)

**Response (200):**
```json
{
  "productos": [...],
  "paginacion": {
    "total": 45,
    "paginas": 4,
    "paginaActual": 1,
    "porPagina": 12
  }
}
```

### 8.5 Buscar Productos
**🌍 PÚBLICO**
```http
GET /api/tiendas/:slug/buscar?q=remera
```

**Query Parameters:**
- `q` - Término de búsqueda (requerido)
- `page` - Número de página
- `limit` - Productos por página

**Response (200):**
```json
{
  "productos": [...],
  "paginacion": {...}
}
```

### 8.6 Obtener Detalle de Producto
**🌍 PÚBLICO**
```http
GET /api/tiendas/:slug/productos/:productoSlug
```

**Response (200):**
```json
{
  "producto": {
    "_id": "producto123...",
    "nombre": "Remera Básica",
    "descripcion": "Remera de algodón 100%",
    "precio": 5000,
    "imagenes": [...],
    "stock": 50,
    "categoria": {
      "nombre": "Remeras",
      "slug": "remeras"
    },
    ...
  },
  "productosRelacionados": [...]
}
```

### 8.7 Obtener Todos los Productos
**🌍 PÚBLICO**
```http
GET /api/tiendas/:slug/productos
```

**Query Parameters:**
- `page` - Número de página
- `limit` - Productos por página
- `ordenar` - Ordenamiento: `precio-asc`, `precio-desc`, `recientes`

**Response (200):**
```json
{
  "productos": [...],
  "paginacion": {...}
}
```

### 8.8 Obtener Configuración Pública
**🌍 PÚBLICO**
```http
GET /api/tiendas/:slug/configuracion/publica
```

**Response (200):**
```json
{
  "configuracionTienda": {
    "colorPrimario": "#FF5733",
    "colorSecundario": "#33FF57",
    "colorTexto": "#000000",
    "mensaje": "Bienvenidos",
    "logo": {...},
    "bannerPrincipal": [...],
    "carrusel": [...],
    "secciones": [...]
  }
}
```

---

## 9️⃣ Administración de Tienda (`/api/tiendas/:slug`)

**🛡️ TODOS ESTOS ENDPOINTS REQUIEREN ADMIN O SUPERADMIN**

### 9.1 Obtener Configuración Completa (Admin)
**🛡️ ADMIN ONLY**
```http
GET /api/tiendas/:slug/configuracion
```

**Response (200):**
```json
{
  "configuracionTienda": {
    "colorPrimario": "#FF5733",
    "colorSecundario": "#33FF57",
    "colorTexto": "#000000",
    "mensaje": "Bienvenidos a nuestra tienda",
    "metaTitulo": "Local Centro - Remeras",
    "metaDescripcion": "Las mejores remeras",
    "logo": {...},
    "bannerPrincipal": [...],
    "carrusel": [...],
    "secciones": [...],
    "menuPersonalizado": [...],
    "piePagina": {...}
  },
  "configuracionNegocio": {
    "habilitarCarrito": true,
    "habilitarPagos": true,
    "metodosEnvio": ["retiro", "envio"],
    "metodosPago": ["efectivo", "tarjeta", "mercadopago"]
  }
}
```

**Permisos:**
- `admin`: Solo su tienda asignada
- `superAdmin`: Cualquier tienda

### 9.2 Actualizar Configuración Visual
**🛡️ ADMIN ONLY**
```http
PUT /api/tiendas/:slug/configuracion/visual
```

**Request Body:**
```json
{
  "colorPrimario": "#3498db",
  "colorSecundario": "#2ecc71",
  "colorTexto": "#2c3e50",
  "mensaje": "¡Nuevo mensaje de bienvenida!",
  "metaTitulo": "Mi Tienda - Título Actualizado",
  "metaDescripcion": "Descripción SEO actualizada"
}
```

**Response (200):**
```json
{
  "msg": "Configuración visual actualizada correctamente",
  "configuracion": {...}
}
```

### 9.3 Subir Logo
**🛡️ ADMIN ONLY**
```http
PUT /api/tiendas/:slug/configuracion/logo
Content-Type: multipart/form-data
```

**Request Body (form-data):**
```
logo: [archivo de imagen]
logoAlt: "Logo de mi tienda"
```

**O mediante JSON:**
```json
{
  "logoUrl": "https://ejemplo.com/logo.jpg",
  "logoAlt": "Logo de mi tienda"
}
```

**Response (200):**
```json
{
  "msg": "Logo actualizado correctamente",
  "logo": {
    "url": "/storage/images/logos/logo-123.jpg",
    "alt": "Logo de mi tienda"
  }
}
```

### 9.4 Subir Banner Principal
**🛡️ ADMIN ONLY**
```http
PUT /api/tiendas/:slug/configuracion/banner
Content-Type: multipart/form-data
```

**Request Body (form-data):**
```
banners: [archivo 1]
banners: [archivo 2]
mantenerImagenes: false
```

**Response (200):**
```json
{
  "msg": "Banner actualizado correctamente",
  "banner": [
    {
      "url": "data:image/jpeg;base64,...",
      "alt": "Banner 1"
    },
    {
      "url": "data:image/jpeg;base64,...",
      "alt": "Banner 2"
    }
  ],
  "cantidad": 2
}
```

**Notas:**
- Máximo 5 imágenes
- Si `mantenerImagenes=true`, agrega las nuevas a las existentes
- Las imágenes se convierten y almacenan en base64

### 9.5 Actualizar Carrusel
**🛡️ ADMIN ONLY**
```http
PUT /api/tiendas/:slug/configuracion/carrusel
Content-Type: multipart/form-data
```

**Request Body (form-data):**
```
imagenes: [archivo 1]
imagenes: [archivo 2]
titulo_0: "Slide 1"
subtitulo_0: "Descripción 1"
botonTexto_0: "Ver más"
botonUrl_0: "/productos"
orden_0: 0
alt_0: "Imagen 1"
titulo_1: "Slide 2"
...
```

**O mediante JSON:**
```json
{
  "imagenes": [
    {
      "url": "https://ejemplo.com/slide1.jpg",
      "alt": "Slide 1",
      "titulo": "Nueva Colección",
      "subtitulo": "Descubrí lo nuevo",
      "botonTexto": "Ver más",
      "botonUrl": "/productos",
      "orden": 0
    }
  ]
}
```

**Response (200):**
```json
{
  "msg": "Carrusel actualizado correctamente",
  "carrusel": [...]
}
```

### 9.6 Agregar Sección Personalizada
**🛡️ ADMIN ONLY**
```http
POST /api/tiendas/:slug/configuracion/secciones
Content-Type: multipart/form-data
```

**Request Body:**
```
titulo: "Sobre Nosotros"
contenido: "Somos una tienda con 10 años..."
imagen: [archivo opcional]
orden: 0
```

**Response (200):**
```json
{
  "msg": "Sección agregada correctamente",
  "seccion": {
    "id": "seccion123...",
    "titulo": "Sobre Nosotros",
    "contenido": "Somos una tienda con 10 años...",
    "imagen": "/storage/images/secciones/seccion-1.jpg",
    "orden": 0
  }
}
```

### 9.7 Eliminar Sección Personalizada
**🛡️ ADMIN ONLY**
```http
DELETE /api/tiendas/:slug/configuracion/secciones/:seccionId
```

**Response (200):**
```json
{
  "msg": "Sección eliminada correctamente"
}
```

### 9.8 Actualizar Menú Personalizado
**🛡️ ADMIN ONLY**
```http
PUT /api/tiendas/:slug/admin/menu
```

**Request Body:**
```json
{
  "items": [
    {
      "texto": "Inicio",
      "url": "/",
      "orden": 0
    },
    {
      "texto": "Productos",
      "url": "/productos",
      "orden": 1
    },
    {
      "texto": "Contacto",
      "url": "/contacto",
      "orden": 2
    }
  ]
}
```

**Response (200):**
```json
{
  "msg": "Menú personalizado actualizado correctamente",
  "menu": [...]
}
```

### 9.9 Actualizar Pie de Página
**🛡️ ADMIN ONLY**
```http
PUT /api/tiendas/:slug/admin/pie-pagina
```

**Request Body:**
```json
{
  "columnas": [
    {
      "titulo": "Información",
      "enlaces": [
        { "texto": "Sobre nosotros", "url": "/about" },
        { "texto": "Contacto", "url": "/contact" }
      ]
    },
    {
      "titulo": "Redes Sociales",
      "enlaces": [
        { "texto": "Facebook", "url": "https://facebook.com/..." },
        { "texto": "Instagram", "url": "https://instagram.com/..." }
      ]
    }
  ],
  "textoCopyright": "© 2024 Local Centro. Todos los derechos reservados."
}
```

**Response (200):**
```json
{
  "msg": "Pie de página actualizado correctamente",
  "piePagina": {...}
}
```

### 9.10 Actualizar Sección Específica
**🛡️ ADMIN ONLY**
```http
PUT /api/tiendas/:slug/admin/secciones/:seccionId
```

**Request Body:**
```json
{
  "titulo": "Sobre Nosotros - Actualizado",
  "contenido": "Nueva descripción...",
  "imagen": "https://ejemplo.com/nueva-imagen.jpg",
  "orden": 1
}
```

**Response (200):**
```json
{
  "msg": "Sección actualizada correctamente",
  "seccion": {...}
}
```

### 9.11 Ordenar Carrusel
**🛡️ ADMIN ONLY**
```http
PUT /api/tiendas/:slug/admin/carrusel/orden
```

**Request Body:**
```json
{
  "orden": [
    "imagen2_id",
    "imagen1_id",
    "imagen3_id"
  ]
}
```

**Response (200):**
```json
{
  "msg": "Carrusel reordenado correctamente",
  "carrusel": [...]
}
```

### 9.12 Exportar Configuración
**🛡️ ADMIN ONLY**
```http
GET /api/tiendas/:slug/admin/exportar
```

**Response (200):**
```json
{
  "nombre": "Local Centro",
  "configuracionTienda": {...},
  "configuracionNegocio": {...},
  "exportadoEn": "2024-01-20T15:00:00.000Z"
}
```

### 9.13 Importar Configuración
**🛡️ ADMIN ONLY**
```http
POST /api/tiendas/:slug/admin/importar
```

**Request Body:**
```json
{
  "configuracion": {
    "configuracionTienda": {...},
    "configuracionNegocio": {...}
  }
}
```

**Response (200):**
```json
{
  "msg": "Configuración importada correctamente",
  "configuracionTienda": {...},
  "configuracionNegocio": {...}
}
```

### 9.14 Previsualizar Configuración
**🛡️ ADMIN ONLY**
```http
POST /api/tiendas/:slug/admin/previsualizar
```

**Request Body:**
```json
{
  "colorPrimario": "#FF0000",
  "colorSecundario": "#00FF00",
  "mensaje": "Vista previa del mensaje"
}
```

**Response (200):**
```json
{
  "_id": "local123...",
  "nombre": "Local Centro",
  "slug": "local-centro",
  "configuracionTienda": {
    ...configuración con cambios aplicados
  },
  "modoPrevisualización": true
}
```

---

## 🎨 Códigos de Estado HTTP

### Éxito (2xx)
- `200 OK` - Solicitud exitosa
- `201 Created` - Recurso creado exitosamente

### Errores del Cliente (4xx)
- `400 Bad Request` - Datos inválidos o faltantes
- `401 Unauthorized` - No autenticado o token inválido
- `403 Forbidden` - No tiene permisos para esta acción
- `404 Not Found` - Recurso no encontrado

### Errores del Servidor (5xx)
- `500 Internal Server Error` - Error interno del servidor

---

## 🔒 Consideraciones de Seguridad

### Tokens JWT
- **Expiración**: 7 días por defecto
- **Almacenamiento**: Guardar en localStorage o sessionStorage
- **Renovación**: Hacer login nuevamente cuando expire
- **Header**: Siempre enviar como `Authorization: Bearer {token}`

### Códigos de Verificación
- **Email**: Válido por 24 horas
- **Password Reset**: Válido por 1 hora
- **Formato**: 6 dígitos numéricos

### Manejo de Errores
Siempre verificar el campo `success` en la respuesta:

```javascript
if (response.success) {
  // Manejar éxito
  console.log(response.data);
} else {
  // Manejar error
  console.error(response.message);
}
```

---

## 📝 Ejemplos de Uso

### Ejemplo: Login y Uso del Token

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'usuario@email.com',
    password: 'Password123!'
  })
});

const loginData = await loginResponse.json();

if (loginData.success) {
  const token = loginData.data.token;
  
  // 2. Guardar token
  localStorage.setItem('token', token);
  
  // 3. Usar token en peticiones protegidas
  const profileResponse = await fetch('http://localhost:3000/api/auth/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const profileData = await profileResponse.json();
  console.log(profileData.data.user);
}
```

### Ejemplo: Crear Producto con Imagen

```javascript
const formData = new FormData();
formData.append('nombre', 'Remera Nueva');
formData.append('descripcion', 'Descripción del producto');
formData.append('precio', 5000);
formData.append('stock', 50);
formData.append('categoria', 'categoriaId123');
formData.append('local', 'localId456');
formData.append('imagenes', imageFile); // File object
formData.append('destacado', true);

const response = await fetch('http://localhost:3000/api/productos', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const data = await response.json();
console.log(data);
```

### Ejemplo: Agregar Producto al Carrito

```javascript
const response = await fetch('http://localhost:3000/api/carrito', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    productoId: 'producto123',
    cantidad: 2,
    variante: {
      Color: 'Blanco',
      Talle: 'M'
    }
  })
});

const carrito = await response.json();
console.log('Total:', carrito.total);
```

---

## 📞 Soporte

Para cualquier duda o problema con la API, contactar al equipo de desarrollo.

**Última actualización**: Enero 2024
**Versión de la API**: 1.0

---

**FIN DE LA DOCUMENTACIÓN**

