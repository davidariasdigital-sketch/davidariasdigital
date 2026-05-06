## Calculadora de Alquiler de Equipos

Añadir una herramienta de selección dentro de la pestaña **Equipos AV** que te permita marcar los equipos que vas a usar en un servicio y sumar automáticamente el valor de alquiler diario, multiplicado por los días que necesites.

### Cómo funcionará

1. En la pestaña **Equipos AV**, junto al botón "Agregar fila", aparecerá un nuevo botón **"Calcular alquiler"**.
2. Al hacer clic se abre un panel desplegable (debajo de la tabla) con:
   - Un **checkbox por cada equipo** del inventario, mostrando nombre y valor de alquiler/día.
   - Un input numérico para los **días de alquiler** (default: 1).
   - Un input opcional para **margen comercial %** (default: 0, sugerencia visible: 30–60% para alquileres externos).
   - Búsqueda rápida por nombre para filtrar el listado largo.
   - Botones: **"Seleccionar todo"**, **"Limpiar"**.
3. En la parte inferior del panel se muestra en vivo:
   - Cantidad de equipos seleccionados.
   - **Subtotal** (suma de alquileres × días).
   - **Total con margen** (subtotal × (1 + margen)).
   - Botón **"Copiar resumen"** que copia al portapapeles el listado de equipos + valores + total (útil para pegar en cotizaciones).
4. Las selecciones y configuración se guardan en `localStorage` para que persistan entre sesiones (no necesita tabla nueva, es una herramienta de cálculo local).

### Detalles técnicos

- Modificar `src/components/dashboard/ServiceCostsView.tsx`:
  - Nuevo subcomponente `RentalCalculator` que recibe las filas del módulo `equipos_av` como prop.
  - Estado local: `selectedIds: Set<number>`, `days: number`, `margin: number`, `search: string`, `open: boolean`.
  - Persistencia en `localStorage` bajo la clave `equipos_av_rental_calc`.
  - Renderizado solo cuando la tab activa es `equipos_av` (añadir debajo de la tabla, antes/después de los botones existentes).
  - Cálculo: para cada fila seleccionada, parsear `row[2]` (Alquiler/Día) con `parseNum`, sumar, multiplicar por días, aplicar margen.
  - Estilo consistente con `dash-tile`, mobile-friendly (grid de 1 col en móvil, 2 cols en desktop para el listado de checkboxes).
- No se requieren cambios en base de datos ni en otros archivos.
