

## Plan: Reemplazar iframes de YouTube por videos directos

### Situación
Los iframes de YouTube están bloqueados en el preview. El usuario quiere subir los videos directamente al proyecto.

### Importante
Lovable tiene un **límite de 20MB por archivo**. Los videos de alta calidad pueden superar ese límite. Necesitarás subir los archivos .mp4 (comprimidos si es necesario).

### Cambios

1. **`src/components/BrandsShowcase.tsx`** — Reemplazar el `<iframe>` de YouTube por un `<video>` nativo HTML5 con `autoPlay`, `muted`, `loop` y `playsInline`, apuntando al archivo de video subido (ej: `/videos/marcas.mp4`).

2. **`src/components/ReelSection.tsx`** — Mismo cambio: reemplazar el `<iframe>` por un `<video>` nativo apuntando al archivo del reel (ej: `/videos/reel.mp4`).

3. **Archivos de video** — Necesitarás subir los dos archivos .mp4 en el chat. Los colocaré en `public/videos/`.

### Siguiente paso
Sube los dos archivos de video (.mp4) al chat y los integro de inmediato.

