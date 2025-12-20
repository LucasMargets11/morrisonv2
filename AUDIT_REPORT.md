# Reporte de Auditoría y Fixes: "Tipo de Alquiler"

## Fase A: Auditoría

### 1. Home Page (Hero.tsx)
- **Estado:** ✅ Cumple.
- **Hallazgos:**
  - El calendario fue eliminado correctamente.
  - El dropdown "Tipo de Alquiler" es obligatorio (el botón de búsqueda se deshabilita si no hay selección).
  - La navegación incluye el parámetro `propertyType`.

### 2. Listado de Propiedades (PropertiesPage.tsx)
- **Estado:** ⚠️ Parcialmente Cumple (Corregido en Fase B).
- **Hallazgos:**
  - **Gap Crítico:** No se estaba enviando explícitamente `status='published'` (o activa) al backend, confiando en el default. Se corrigió para ser explícito.
  - **Gap UX:** Si el usuario entraba directo a `/properties` (sin parámetros), se mostraban todas las propiedades (`propertyType='all'`). Se implementó un "Empty State" para forzar la selección del tipo.
  - **Gap UI:** La barra de búsqueda interna permitía abrir el calendario y seleccionar huéspedes incluso para tipos "Temporal" y "Tradicional". Se deshabilitaron estos botones si el tipo no es "Vacacional".

### 3. Detalle de Propiedad (PropertyDetails.tsx)
- **Estado:** ✅ Cumple (Mejorado en Fase B).
- **Hallazgos:**
  - El calendario ya estaba condicionado a `property_type === 'vacacional'`.
  - **Mejora:** Se implementó `React.lazy` para cargar el componente `Calendar` solo cuando es necesario, mejorando la performance inicial para propiedades no vacacionales.

---

## Fase B: Fixes Implementados

### 1. Filtrado Real y Estado Activo
- **Archivo:** `src/pages/PropertiesPage.tsx`
- **Cambio:** Se agregó `status: 'published'` a la llamada `adminApi.getProperties`.
- **Cambio:** Se condicionó la query (`enabled: propertyType !== 'all'`) para no hacer fetch innecesario si no hay tipo seleccionado.

### 2. Manejo de Estado Vacío (Empty State)
- **Archivo:** `src/pages/PropertiesPage.tsx`
- **Cambio:** Si `propertyType === 'all'`, en lugar del grid de propiedades se muestra un mensaje centrado: "Selecciona un tipo de alquiler".

### 3. UI Condicional en Barra de Búsqueda
- **Archivo:** `src/pages/PropertiesPage.tsx`
- **Cambio:** Los botones de "Fechas" y "Huéspedes" ahora tienen `disabled={propertyType !== 'vacacional'}` y clases visuales de estado deshabilitado (`opacity-40`).
- **Cambio:** Al cambiar de "Vacacional" a otro tipo, se limpian automáticamente los parámetros de fecha y huéspedes de la URL.

### 4. Performance (Lazy Loading)
- **Archivo:** `src/components/PropertyDetails.tsx`
- **Cambio:** `import Calendar` reemplazado por `React.lazy(() => import('./Calendar'))` y envuelto en `<Suspense>`.

---

## Checklist de Verificación Manual (QA)

1.  **Caso: Home -> Búsqueda Vacacional**
    -   Ir a `/` (Home).
    -   Verificar que NO hay calendario.
    -   Seleccionar "Vacacional" -> Buscar.
    -   URL esperada: `/properties?propertyType=vacacional`.
    -   Verificar que los botones de Fechas/Huéspedes en la barra superior están **habilitados**.

2.  **Caso: Home -> Búsqueda Temporal**
    -   Ir a `/` (Home).
    -   Seleccionar "Temporal" -> Buscar.
    -   URL esperada: `/properties?propertyType=temporal`.
    -   Verificar que los botones de Fechas/Huéspedes en la barra superior están **deshabilitados** (grisados).

3.  **Caso: Navegación Directa (Sin Tipo)**
    -   Ir a `/properties` (sin params).
    -   Verificar que NO se listan propiedades.
    -   Verificar mensaje: "Selecciona un tipo de alquiler".
    -   Usar el botón "Seleccionar Tipo" -> Elegir "Tradicional".
    -   Verificar que cargan las propiedades y la URL cambia.

4.  **Caso: Cambio de Tipo (Limpieza)**
    -   Estando en "Vacacional", seleccionar fechas.
    -   Cambiar tipo a "Temporal".
    -   Verificar que las fechas desaparecen de la URL y del botón de fechas (que ahora debe estar deshabilitado).

5.  **Caso: Detalle Propiedad**
    -   Entrar a una propiedad Vacacional: Verificar que el calendario carga y funciona.
    -   Entrar a una propiedad Temporal: Verificar que NO hay calendario y se ve el precio mensual.
