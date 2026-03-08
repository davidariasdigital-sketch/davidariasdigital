

## Plan: PDF de cotización con diseño premium

El PDF actual es funcional pero básico. Lo vamos a rediseñar con un estilo editorial oscuro que refleje tu identidad visual (fondo oscuro, acentos mostaza).

### Mejoras visuales

1. **Header con banda oscura** — Franja superior de color oscuro (#1A1A1A) con "COTIZACIÓN" en mostaza (#E1AD01) y número/fecha en blanco, dando presencia inmediata.

2. **Sidebar con datos del negocio** — Columna izquierda estrecha con tu nombre/marca, email, teléfono y sitio web en texto pequeño gris.

3. **Sección de cliente destacada** — Caja con borde mostaza mostrando nombre y datos del cliente.

4. **Tabla de conceptos con filas alternadas** — Filas con fondo alterno (blanco / gris muy claro), numeración automática, y header con fondo oscuro y texto mostaza.

5. **Bloque de total prominente** — Caja con fondo oscuro, total en grande con color mostaza, subtotal y número de conceptos arriba.

6. **Footer profesional** — Línea mostaza separadora, texto de condiciones/validez configurable, y "Documento generado automáticamente" centrado.

7. **Número de cotización** — Generar un número basado en la fecha (ej: COT-20260308-001) para dar formalidad.

### Archivo a modificar
- `src/lib/quotation-pdf.ts` — Reescribir completamente con el nuevo diseño

No se necesitan nuevas dependencias; todo se logra con jsPDF usando rectángulos, colores y tipografía bien distribuida.

