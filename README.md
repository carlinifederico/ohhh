# OHHH™ — site

Landing de una sola página. HTML, CSS y JS planos: no hay build, no hay dependencias.
Lo que está en este repo es lo que se publica.

**Online:** https://carlinifederico.github.io/ohhh/

```
index.html      markup completo (los TODO de links viven acá)
styles.css      todo el diseño
main.js         reveals + preferencias de movimiento
assets/         logo, reel, poster, favicon
```

---

## Pendientes

Tres cosas quedaron como placeholder. Se cambian en un minuto:

| Qué | Dónde | Valor actual |
|---|---|---|
| Mail de contacto | `index.html`, atributo `href` del `.cta` | `mailto:hello@ohhh.tv` |
| LinkedIn de Santiago | `index.html`, primer `.person__link` | `https://www.linkedin.com/` |
| Reel definitivo | `assets/reel.mp4` | placeholder |

Los dos primeros están marcados con un comentario `<!-- TODO -->` justo arriba.

## Cambiar el reel

El video de fondo tiene que ser liviano (el actual pesa 640 KB). Con el reel nuevo en
`reel-nuevo.mp4`, desde la raíz del repo:

```bash
# video: sin audio, 1600px de ancho, optimizado para empezar a reproducir enseguida
ffmpeg -i reel-nuevo.mp4 -an -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p \
       -vf "scale=1600:-2" -movflags +faststart -y assets/reel.mp4

# poster: primer frame, es lo que se ve mientras el video carga
ffmpeg -i reel-nuevo.mp4 -frames:v 1 -vf "scale=1600:-2" -q:v 6 -y assets/reel-poster.jpg
```

Subí `crf` (28, 30) si querés menos peso, bajalo (23, 20) si querés más calidad.
Después `git add -A && git commit -m "nuevo reel" && git push`.

## Ver el sitio local

```bash
npx serve .        # o: python -m http.server 8080
```

Abrilo por `http://localhost:...`, no con doble clic en `index.html`
(el video no carga desde `file://`).

## Publicar

Cada `git push` a `main` actualiza el sitio publicado en GitHub Pages,
normalmente en menos de un minuto.

---

## Diseño

- **Violeta** `#7F00FF` (el del logo) · **negro** `#0A0A0A` · **hueso** `#F2F0EB`.
- **Archivo Black** para los titulares, **Instrument Serif** *itálica* para las palabras
  intercaladas y los roles, **Space Mono** para las etiquetas chicas.
- El logo del hero es el PNG violeta: se lo pinta de blanco por CSS
  (`filter: brightness(0) invert(1)`), así hay un solo archivo para mantener.
