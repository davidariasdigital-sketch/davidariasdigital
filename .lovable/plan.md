## Objetivo

Mejorar el ritmo vertical del bloque de título del Hero (`David Arias` → logo `DIGITAL` → `Creativo Audiovisual`) para que respire mejor y tenga una jerarquía más clara, sin tocar el resto de la sección.

## Cambios propuestos en `src/components/HeroSection.tsx`

**1. Espacio entre "David Arias" y el logo DIGITAL** (línea 20)
- Aumentar de `mb-2 md:mb-3` → `mb-3 md:mb-5`
- Razón: hoy el nombre queda casi pegado al logotipo grande; un poco más de aire reforzará la jerarquía.

**2. Espacio entre el logo DIGITAL y "Creativo Audiovisual"** (línea 24)
- Cambiar `mt-3 md:mt-4` → `mt-4 md:mt-6`
- Y aflojar el `leading-none` del párrafo a `leading-tight` para que el texto en mayúsculas con tracking amplio no se vea apretado.

**3. Ritmo general de la columna de texto** (línea 18)
- Cambiar `space-y-5` → `space-y-6 md:space-y-7`
- Razón: los bloques (título, contactos, CTAs) ganan separación coherente con el aire añadido arriba.

**4. Separación entre los dos enlaces de contacto** (línea 27)
- Cambiar `gap-1.5 md:gap-2` → `gap-2 md:gap-2.5`
- Pequeño ajuste para que email y teléfono no se vean amontonados.

**5. Separación arriba de los botones CTA** (línea 36)
- Eliminar `pt-1 md:pt-2` (redundante con el nuevo `space-y-6/7`) y dejar solo `gap-2.5 md:gap-3` entre botones.

## Lo que NO se toca
- Tamaños de fuente, colores, avatar, ni layout general (mobile/desktop split).
- Padding de la sección ni alturas mínimas.

## Resultado esperado
Un bloque de título más respirado, con jerarquía visual clara entre nombre, logotipo y rol, manteniendo el estilo Apple-like minimal del proyecto.

---

💡 Nota: para ajustes visuales tan puntuales como cambiar márgenes o paddings, también puedes usar **Visual Edits** (botón ✏️ abajo a la izquierda del chat) — seleccionas el elemento y editas en vivo sin gastar créditos.
