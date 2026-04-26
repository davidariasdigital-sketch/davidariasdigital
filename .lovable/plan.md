## Plan: Nueva ventana de Salud

### Qué se va a añadir

Crearé una nueva sección en el dashboard llamada **Salud**, accesible desde el menú lateral y la navegación móvil. Allí podrás registrar y consultar:

```text
┌─ Salud ───────────────────────────────────────────────┐
│                                                       │
│  Peso actual       Cambio total       Tendencia        │
│                                                       │
│  ┌──────────── Gráfica de peso mensual ────────────┐  │
│  │ línea histórica con tus pesajes 2022–2026        │  │
│  └─────────────────────────────────────────────────┘  │
│                                                       │
│  Registrar peso mensual                               │
│  Fecha + peso + botón Guardar                         │
│                                                       │
│  Rutina de comida              Rutina de ejercicios   │
│  Cards editables/checklist     Cards editables        │
│                                                       │
│  Historial de pesajes recientes                       │
└───────────────────────────────────────────────────────┘
```

### Funcionalidades

1. **Nueva pestaña “Salud”**
   - Añadiré un icono de salud al sidebar de escritorio.
   - Añadiré la opción también en la barra inferior móvil.
   - El dashboard tendrá un nuevo `view: "health"`.

2. **Historial de peso**
   - Crearé una tabla para guardar pesajes por usuario.
   - Cargaré tu historial inicial con los datos que enviaste, normalizando fechas y pesos.
   - Corregiré formatos ambiguos como:
     - `67-1` → `67.1 kg`
     - `08 otc` → `08 oct`
     - fechas en inglés/español a formato estándar.

3. **Registro mensual de peso**
   - Formulario compacto con fecha y peso.
   - Si registras otro peso para la misma fecha, se actualizará en vez de duplicarse.
   - Validación: peso positivo y fecha obligatoria.

4. **Estadísticas**
   - Peso actual.
   - Peso inicial del historial.
   - Cambio total.
   - Cambio del último registro vs el anterior.
   - Promedio reciente y tendencia visual.

5. **Gráfica**
   - Gráfica de línea/área usando `recharts`, siguiendo el estilo del dashboard.
   - Mostrará la evolución histórica completa.
   - En móvil se mantendrá compacta y legible.

6. **Rutina de comida y ejercicios**
   - Crearé módulos editables para:
     - **Rutina de comida**
     - **Rutina de ejercicios**
   - Cada rutina permitirá añadir elementos, marcarlos como activos/completados y editarlos/eliminarlos.
   - Quedarán guardados por usuario para que no se reinicien al salir.

### Datos iniciales que se cargarán

Se insertará el historial de pesajes enviado desde 2022 hasta 2026 como registros iniciales de tu usuario. Ejemplos:

- 2022-12-19: 70.3 kg
- 2023-01-03: 70.2 kg
- 2024-02-04: 64.0 kg
- 2025-10-07: 70.8 kg
- 2026-03-10: 68.0 kg

### Detalles técnicos

- Nueva tabla `health_weight_entries`:
  - `id`, `user_id`, `entry_date`, `weight_kg`, `notes`, `created_at`, `updated_at`
  - RLS para que cada usuario solo gestione sus propios datos.
  - restricción única por `user_id + entry_date` para evitar duplicados diarios.

- Nueva tabla `health_routine_items`:
  - `id`, `user_id`, `routine_type` (`food` o `exercise`), `title`, `description`, `completed`, `sort_order`, timestamps.
  - RLS por usuario.

- Nuevo componente:
  - `src/components/dashboard/HealthView.tsx`

- Archivos a actualizar:
  - `src/pages/Dashboard.tsx`
  - `src/components/dashboard/DashboardSidebar.tsx`
  - `src/components/dashboard/MobileBottomNav.tsx`

### Validación y seguridad

- Validaré inputs en el cliente con límites razonables.
- La base de datos también tendrá políticas de seguridad por usuario.
- No se tocarán archivos autogenerados de la integración backend.

### Resultado esperado

Tendrás una ventana nueva de **Salud** donde podrás ver tu evolución de peso desde 2022, añadir nuevos pesajes mensuales, ver estadísticas rápidas y mantener rutinas de comida/ejercicio persistentes.