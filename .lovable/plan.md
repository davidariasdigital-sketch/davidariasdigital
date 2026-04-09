

## Plan: Estructura de Costos Profesionales — Vista por Módulos Editables

### Resumen

Reemplazar la vista actual de "Costos" (tabla simple de servicios) con una vista modular que refleje las 4 secciones del PDF, cada una con su propia tabla editable inline. Los datos se almacenan como JSONB para manejar las diferentes estructuras de columnas por módulo.

### 1. Migración de base de datos — Nueva tabla `cost_modules`

Crear una tabla flexible con JSONB para columnas y filas:

```sql
CREATE TABLE public.cost_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module_key text NOT NULL,
  title text NOT NULL,
  subtitle text,
  columns jsonb NOT NULL DEFAULT '[]',
  rows jsonb NOT NULL DEFAULT '[]',
  notes text,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_key)
);

ALTER TABLE public.cost_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own cost modules"
  ON public.cost_modules FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

Cada módulo tiene:
- `module_key`: "nomina", "freelance", "equipos", "proyectos"
- `columns`: array de nombres de columna (ej. `["Concepto", "Servicio Completo", "Servicio Básico", "Solo Edición"]`)
- `rows`: array de arrays con los valores de cada fila
- `notes`: texto libre para notas aclaratorias

### 2. Reescribir `ServiceCostsView.tsx` completamente

La nueva vista tendrá:

**Header**: "Estructura de Costos Profesionales 2026" con subtítulo "Creativo Audiovisual"

**4 módulos en tabs o secciones colapsables**, cada uno con:
- Titulo del módulo y descripción
- Tabla renderizada dinámicamente desde el JSONB (columnas y filas)
- Celdas editables inline (click para editar el valor)
- Botones para agregar/eliminar filas
- Fila de totales calculada automáticamente (donde aplique)
- Notas editables al pie de cada módulo

**Los 4 módulos (precargados con la data del PDF):**

1. **Nómina (Contrato Laboral)** — 10 filas x 4 columnas (Concepto, Servicio Completo R-III, Servicio Básico R-III, Solo Edición R-I), con fila de total
2. **Prestación de Servicios (Freelance)** — 10 filas x 4 columnas, misma estructura, con total mínimo a facturar
3. **Alquiler de Equipos (Por Día)** — 3 filas x 4 columnas (Escenario, Valor Activo, Depreciación Mensual, Alquiler/Día)
4. **Proyectos y Servicios Específicos** — 5 filas x 4 columnas (Tipo, Despliegue de Costos, Margen, Valor Referencia)

**Funcionalidad de edición:**
- Click en cualquier celda para editarla inline
- Botón "Agregar fila" al final de cada tabla
- Botón eliminar (icono) por fila
- Auto-guardado al salir de la celda (blur)
- Sección de notas editable con textarea

**Inicialización:** Al abrir la vista por primera vez y no tener datos, se crean los 4 módulos con la data del PDF como valores por defecto.

### 3. Mantener tabla `service_costs` existente

La tabla `service_costs` sigue existiendo para el tarifario rápido de servicios individuales. La nueva vista mostrará ambas cosas: los módulos de estructura de costos arriba, y abajo (opcionalmente en un tab separado) el listado de servicios individuales existente.

### Archivos a modificar/crear:
1. **Migración SQL** — crear tabla `cost_modules` con RLS
2. **Reescribir** `src/components/dashboard/ServiceCostsView.tsx` — nueva UI con módulos + tablas editables + tabs
3. Sin cambios en sidebar ni routing (ya existe la ruta "service-costs")

