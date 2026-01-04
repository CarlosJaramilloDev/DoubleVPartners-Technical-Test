# API Documentation - DoubleV Debt Management

Documentación completa de todos los endpoints disponibles en la API.

## Base URL

```
http://localhost:3000
```

## Autenticación

La mayoría de los endpoints requieren autenticación mediante JWT. Incluye el token en el header:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## Endpoints de Autenticación

### POST /api/auth/register

Registra un nuevo usuario en el sistema.

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "securepassword123"
  }'
```

**Body Parameters:**
- `email` (string, required): Email único del usuario
- `name` (string, required): Nombre del usuario (mínimo 2 caracteres)
- `password` (string, required): Contraseña (mínimo 6 caracteres)

**Response 201:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-04T12:00:00.000Z"
  }
}
```

**Error 409:**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

---

### POST /api/auth/login

Inicia sesión y obtiene un token JWT.

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

**Body Parameters:**
- `email` (string, required): Email del usuario
- `password` (string, required): Contraseña del usuario

**Response 200:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

**Error 401:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## Endpoints de Deudas

Todos los endpoints de deudas requieren autenticación.

### GET /api/debts

Obtiene todas las deudas del usuario autenticado (como acreedor o deudor).

**Request:**
```bash
curl -X GET http://localhost:3000/api/debts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Query Parameters:**
- `status` (optional): Filtro por estado
  - `pending`: Solo deudas pendientes
  - `paid`: Solo deudas pagadas
  - `all` o sin parámetro: Todas las deudas

**Ejemplos:**
```bash
# Todas las deudas
curl -X GET http://localhost:3000/api/debts \
  -H "Authorization: Bearer YOUR_TOKEN"

# Solo pendientes
curl -X GET "http://localhost:3000/api/debts?status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Solo pagadas
curl -X GET "http://localhost:3000/api/debts?status=paid" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "creditorId": "uuid",
      "debtorId": "uuid",
      "amount": "150.50",
      "description": "Almuerzo del viernes",
      "isPaid": false,
      "paidAt": null,
      "createdAt": "2024-01-04T12:00:00.000Z",
      "creditor": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "debtor": {
        "id": "uuid",
        "name": "Jane Smith",
        "email": "jane@example.com"
      }
    }
  ]
}
```

---

### GET /api/debts/:id

Obtiene el detalle de una deuda específica.

**Request:**
```bash
curl -X GET http://localhost:3000/api/debts/DEBT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Path Parameters:**
- `id` (string, required): UUID de la deuda

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "creditorId": "uuid",
    "debtorId": "uuid",
    "amount": "150.50",
    "description": "Almuerzo del viernes",
    "isPaid": false,
    "paidAt": null,
    "createdAt": "2024-01-04T12:00:00.000Z",
    "creditor": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "debtor": {
      "id": "uuid",
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  }
}
```

**Error 404:**
```json
{
  "success": false,
  "message": "Debt not found"
}
```

---

### POST /api/debts

Crea una nueva deuda.

**Request:**
```bash
curl -X POST http://localhost:3000/api/debts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "debtorId": "uuid-del-deudor",
    "amount": 150.50,
    "description": "Almuerzo del viernes"
  }'
```

**Body Parameters:**
- `debtorId` (string, required): UUID del usuario deudor
- `amount` (number, required): Monto de la deuda (debe ser mayor a 0)
- `description` (string, optional): Descripción de la deuda

**Validaciones:**
- El `debtorId` debe ser un UUID válido
- El `amount` debe ser mayor a 0
- No puedes crear una deuda contigo mismo

**Response 201:**
```json
{
  "success": true,
  "message": "Debt created successfully",
  "data": {
    "id": "uuid",
    "creditorId": "uuid-del-acreedor",
    "debtorId": "uuid-del-deudor",
    "amount": "150.50",
    "description": "Almuerzo del viernes",
    "isPaid": false,
    "paidAt": null,
    "createdAt": "2024-01-04T12:00:00.000Z",
    "creditor": { ... },
    "debtor": { ... }
  }
}
```

**Error 400:**
```json
{
  "success": false,
  "message": "Cannot create debt with yourself"
}
```

**Error 404:**
```json
{
  "success": false,
  "message": "Debtor not found"
}
```

---

### PUT /api/debts/:id

Actualiza una deuda existente. Solo el acreedor puede editar.

**Request:**
```bash
curl -X PUT http://localhost:3000/api/debts/DEBT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 200.00,
    "description": "Almuerzo actualizado"
  }'
```

**Path Parameters:**
- `id` (string, required): UUID de la deuda

**Body Parameters:**
- `amount` (number, optional): Nuevo monto (debe ser mayor a 0)
- `description` (string, optional): Nueva descripción

**Validaciones:**
- Solo el acreedor puede editar la deuda
- Las deudas pagadas no pueden modificarse
- El `amount` debe ser mayor a 0

**Response 200:**
```json
{
  "success": true,
  "message": "Debt updated successfully",
  "data": {
    "id": "uuid",
    "amount": "200.00",
    "description": "Almuerzo actualizado",
    ...
  }
}
```

**Error 400:**
```json
{
  "success": false,
  "message": "Cannot modify a paid debt"
}
```

**Error 404:**
```json
{
  "success": false,
  "message": "Debt not found or you do not have permission to edit it"
}
```

---

### DELETE /api/debts/:id

Elimina una deuda. Solo el acreedor puede eliminar.

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/debts/DEBT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Path Parameters:**
- `id` (string, required): UUID de la deuda

**Validaciones:**
- Solo el acreedor puede eliminar la deuda
- Las deudas pagadas no pueden eliminarse

**Response 200:**
```json
{
  "success": true,
  "message": "Debt deleted successfully"
}
```

**Error 400:**
```json
{
  "success": false,
  "message": "Cannot delete a paid debt"
}
```

**Error 404:**
```json
{
  "success": false,
  "message": "Debt not found or you do not have permission to delete it"
}
```

---

### PATCH /api/debts/:id/pay

Marca una deuda como pagada.

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/debts/DEBT_ID/pay \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Path Parameters:**
- `id` (string, required): UUID de la deuda

**Validaciones:**
- Tanto el acreedor como el deudor pueden marcar como pagada
- La deuda no puede estar ya pagada

**Response 200:**
```json
{
  "success": true,
  "message": "Debt marked as paid",
  "data": {
    "id": "uuid",
    "isPaid": true,
    "paidAt": "2024-01-04T15:00:00.000Z",
    ...
  }
}
```

**Error 400:**
```json
{
  "success": false,
  "message": "Debt is already paid"
}
```

**Error 404:**
```json
{
  "success": false,
  "message": "Debt not found"
}
```

---

### GET /api/debts/export

Exporta las deudas del usuario autenticado en formato JSON o CSV.

**Request:**
```bash
curl -X GET "http://localhost:3000/api/debts/export?format=json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Query Parameters:**
- `format` (optional): Formato de exportación
  - `json` (default): Exporta como JSON
  - `csv`: Exporta como CSV
- `status` (optional): Filtro por estado
  - `pending`: Solo deudas pendientes
  - `paid`: Solo deudas pagadas
  - `all` o sin parámetro: Todas las deudas

**Ejemplos:**
```bash
# Exportar como JSON (por defecto)
curl -X GET "http://localhost:3000/api/debts/export" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Exportar como CSV
curl -X GET "http://localhost:3000/api/debts/export?format=csv" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Exportar solo pendientes en CSV
curl -X GET "http://localhost:3000/api/debts/export?format=csv&status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Exportar solo pagadas en JSON
curl -X GET "http://localhost:3000/api/debts/export?format=json&status=paid" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response 200 (JSON):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "creditorName": "John Doe",
      "creditorEmail": "john@example.com",
      "debtorName": "Jane Smith",
      "debtorEmail": "jane@example.com",
      "amount": "150.50",
      "description": "Almuerzo del viernes",
      "isPaid": false,
      "paidAt": null,
      "createdAt": "2024-01-04T12:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Response 200 (CSV):**
```
ID,Acreedor,Email Acreedor,Deudor,Email Deudor,Monto,Descripción,Pagada,Fecha Pago,Fecha Creación
uuid,John Doe,john@example.com,Jane Smith,jane@example.com,150.50,Almuerzo del viernes,No,,2024-01-04T12:00:00.000Z
```

**Headers de respuesta:**
- `Content-Type`: `application/json` o `text/csv`
- `Content-Disposition`: `attachment; filename="deudas-[timestamp].json"` o `attachment; filename="deudas-[timestamp].csv"`

---

### GET /api/debts/stats

Obtiene estadísticas agregadas de las deudas del usuario autenticado.

**Request:**
```bash
curl -X GET http://localhost:3000/api/debts/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "totalPaid": 250.50,
    "totalPending": 150.00,
    "totalDebts": 5,
    "paidCount": 2,
    "pendingCount": 3
  }
}
```

**Campos de respuesta:**
- `totalPaid` (number): Suma total de deudas pagadas
- `totalPending` (number): Suma total de deudas pendientes (saldo pendiente)
- `totalDebts` (number): Total de deudas (pagadas + pendientes)
- `paidCount` (number): Cantidad de deudas pagadas
- `pendingCount` (number): Cantidad de deudas pendientes

**Nota:** Las deudas se cuentan tanto cuando el usuario es acreedor como cuando es deudor.

---

## Endpoint de Health Check

### GET /health

Verifica el estado del servidor. No requiere autenticación.

**Request:**
```bash
curl http://localhost:3000/health
```

**Response 200:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-04T12:00:00.000Z"
}
```

---

## Códigos de Estado HTTP

- `200 OK`: Operación exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Error de validación o solicitud inválida
- `401 Unauthorized`: Token faltante o inválido
- `404 Not Found`: Recurso no encontrado
- `409 Conflict`: Conflicto (ej: email ya existe)
- `500 Internal Server Error`: Error del servidor

---

## Ejemplos de Flujo Completo

### 1. Registrar dos usuarios y crear una deuda

```bash
# Registrar Usuario 1 (Acreedor)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com","name":"Usuario 1","password":"123456"}'

# Registrar Usuario 2 (Deudor)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@test.com","name":"Usuario 2","password":"123456"}'

# Login del Usuario 1
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com","password":"123456"}'
# Copiar el token de la respuesta

# Obtener ID del Usuario 2 (usar Prisma Studio o Supabase Dashboard)

# Crear deuda desde Usuario 1 hacia Usuario 2
curl -X POST http://localhost:3000/api/debts \
  -H "Authorization: Bearer TOKEN_DEL_USUARIO_1" \
  -H "Content-Type: application/json" \
  -d '{
    "debtorId": "UUID_DEL_USUARIO_2",
    "amount": 100.50,
    "description": "Almuerzo"
  }'

# Listar deudas del Usuario 1
curl -X GET http://localhost:3000/api/debts \
  -H "Authorization: Bearer TOKEN_DEL_USUARIO_1"
```

---

## Notas Importantes

1. **Tokens JWT**: Los tokens expiran según la configuración `JWT_EXPIRES_IN` (por defecto 7 días)
2. **Validaciones**: 
   - Los montos deben ser mayores a 0
   - Las deudas pagadas no pueden modificarse ni eliminarse
   - Solo el acreedor puede editar/eliminar deudas
3. **UUIDs**: Todos los IDs son UUIDs v4
4. **Montos**: Se almacenan como Decimal en la base de datos, se envían como números en JSON
5. **DynamoDB**: El servicio de caché está preparado pero aún no está integrado activamente en las consultas. Se invalidará automáticamente cuando se creen/editen/paguen deudas.

