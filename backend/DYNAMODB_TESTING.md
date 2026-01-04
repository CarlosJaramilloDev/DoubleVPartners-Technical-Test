# Cómo Probar y Validar el Caché de DynamoDB

Esta guía te explica cómo verificar que el caché de DynamoDB está funcionando correctamente, **sin necesidad de acceder a la consola de AWS**. Todo lo que necesitas es observar los logs del servidor y las respuestas de la API.

## ¿Qué es el Caché y Por Qué lo Usamos?

El caché es como una "memoria rápida" que guarda temporalmente los resultados de consultas frecuentes. En lugar de consultar la base de datos PostgreSQL cada vez, primero revisamos si ya tenemos la información guardada en DynamoDB. Esto hace que las consultas sean más rápidas.

**Flujo normal:**
1. Primera consulta → PostgreSQL (más lento) → Guarda en DynamoDB
2. Consultas siguientes → DynamoDB (más rápido) → Retorna inmediatamente
3. Cuando cambias algo → Se borra el caché → Próxima consulta va a PostgreSQL de nuevo

## Preparación

Antes de empezar, asegúrate de que:

1. El servidor esté corriendo (`npm run dev`)
2. Tengas un token de autenticación válido (haz login primero)
3. Tengas al menos una deuda creada en el sistema

## Prueba 1: Verificar que el Caché se Crea

### Paso 1: Primera Consulta (Crea el Caché)

Ejecuta este comando para listar tus deudas:

```bash
curl -X GET http://localhost:3000/api/debts \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**¿Qué deberías ver en los logs del servidor?**

Busca un mensaje que diga algo como:
```
Debts cached { userId: '...', status: 'all', count: X }
```

Este mensaje significa que:
- ✅ La consulta fue exitosa
- ✅ Los datos se guardaron en DynamoDB
- ✅ El caché está funcionando

**Si NO ves este mensaje:**
- Revisa que las variables de entorno de AWS estén configuradas
- Verifica que no haya errores en los logs relacionados con DynamoDB
- El sistema seguirá funcionando, solo que sin caché (más lento)

## Prueba 2: Verificar que el Caché se Usa

### Paso 2: Segunda Consulta Inmediata (Lee del Caché)

Ejecuta **exactamente el mismo comando** otra vez, inmediatamente después:

```bash
curl -X GET http://localhost:3000/api/debts \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**¿Qué deberías ver en los logs del servidor?**

Busca un mensaje que diga:
```
Debts retrieved from cache { userId: '...', status: 'all' }
```

Este mensaje significa que:
- ✅ El caché funcionó correctamente
- ✅ Los datos vinieron de DynamoDB (más rápido)
- ✅ No se consultó PostgreSQL esta vez

**Comparación de velocidad:**
- Primera consulta (PostgreSQL): ~100-300ms
- Segunda consulta (DynamoDB): ~10-50ms (mucho más rápido)

## Prueba 3: Verificar que el Caché se Invalida

Cuando creas, editas o pagas una deuda, el caché debe borrarse automáticamente para que la próxima consulta traiga los datos actualizados.

### Paso 3: Crear una Nueva Deuda

```bash
curl -X POST http://localhost:3000/api/debts \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "debtorId": "UUID_DEL_DEUDOR",
    "amount": 50.00,
    "description": "Prueba de invalidación de caché"
  }'
```

**¿Qué deberías ver?**

En los logs deberías ver que se invalida el caché (aunque puede no aparecer un mensaje explícito, el caché se borra internamente).

### Paso 4: Consultar Después de Crear (Debe Ir a PostgreSQL)

Ahora consulta las deudas de nuevo:

```bash
curl -X GET http://localhost:3000/api/debts \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**¿Qué deberías ver?**

Deberías ver de nuevo el mensaje:
```
Debts cached { userId: '...', status: 'all', count: X }
```

Esto significa que:
- ✅ El caché anterior fue invalidado correctamente
- ✅ Se consultó PostgreSQL para obtener datos actualizados
- ✅ Se creó un nuevo caché con la información actualizada

**Verificación:** La nueva deuda que creaste debería aparecer en la lista.

## Prueba 4: Probar con Diferentes Filtros

El caché guarda resultados separados para cada tipo de filtro.

### Paso 5: Consultar Solo Pendientes

```bash
curl -X GET "http://localhost:3000/api/debts?status=pending" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Primera vez:** Verás `Debts cached { status: 'pending' }`  
**Segunda vez:** Verás `Debts retrieved from cache { status: 'pending' }`

### Paso 6: Consultar Solo Pagadas

```bash
curl -X GET "http://localhost:3000/api/debts?status=paid" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

Cada filtro tiene su propio caché independiente.

## Cómo Interpretar los Logs

### Mensajes Positivos (Todo Funciona Bien)

✅ **`Debts cached`**
- Significa que se guardó en DynamoDB correctamente
- Aparece después de consultar PostgreSQL

✅ **`Debts retrieved from cache`**
- Significa que se leyó de DynamoDB
- Aparece cuando hay caché válido disponible

### Mensajes de Advertencia (Funciona pero con Fallback)

⚠️ **`Error reading from cache, falling back to database`**
- No pudo leer de DynamoDB
- El sistema sigue funcionando consultando PostgreSQL
- Revisa configuración de AWS

⚠️ **`Error caching debts`**
- No pudo guardar en DynamoDB
- El sistema sigue funcionando normalmente
- Las consultas serán más lentas (sin caché)

### Errores Críticos

❌ Si ves errores de conexión a AWS o permisos:
- Revisa las variables de entorno (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`)
- Verifica que las credenciales sean correctas
- El sistema seguirá funcionando sin caché

## Resumen: Checklist de Validación

Marca cada punto cuando lo hayas verificado:

- [ ] Primera consulta muestra `Debts cached` en los logs
- [ ] Segunda consulta muestra `Debts retrieved from cache` en los logs
- [ ] Después de crear una deuda, la próxima consulta muestra `Debts cached` de nuevo
- [ ] La nueva deuda aparece en la lista después de crearla
- [ ] Los filtros (`pending`, `paid`) funcionan correctamente
- [ ] No hay errores críticos en los logs relacionados con DynamoDB

## Preguntas Frecuentes

### ¿Qué pasa si DynamoDB no está disponible?

El sistema sigue funcionando perfectamente. Simplemente consultará PostgreSQL directamente cada vez. Será un poco más lento, pero completamente funcional.

### ¿Cuánto tiempo dura el caché?

El caché expira automáticamente después de 5 minutos. Después de ese tiempo, la próxima consulta irá a PostgreSQL y creará un nuevo caché.

### ¿Puedo desactivar el caché?

Sí, simplemente no configures las variables de entorno de AWS. El sistema funcionará sin caché.

### ¿El caché afecta la funcionalidad?

No. El caché es completamente transparente. Si funciona, las consultas son más rápidas. Si no funciona, simplemente son un poco más lentas, pero todo sigue funcionando igual.

## Notas Finales

- El caché es una optimización, no un requisito crítico
- Los errores de caché no afectan la funcionalidad principal
- Siempre puedes verificar que los datos son correctos consultando directamente
- Si tienes dudas, compara los resultados de las consultas con y sin caché (deberían ser idénticos)

---

**¿Todo funcionó correctamente?** Si ves los mensajes esperados en los logs, ¡el caché de DynamoDB está funcionando perfectamente! 🎉

