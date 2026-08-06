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
  En los nombres, el hover trae **amarillo** `#FFE500` (Santiago) y **cian** `#16E0FF`
  (Federico), que son los dos únicos acentos del sitio.
- **Archivo Black** para los titulares, **Instrument Serif** *itálica* para las palabras
  intercaladas y los roles, **Space Mono** para las etiquetas chicas.
- El logo del hero usa `assets/logo.png`, el violeta, para que la primera pantalla
  ya traiga el color de la segunda. Ojo: el PNG tiene que venir del color final.
  Nunca teñirlo con un `filter` de CSS — así estaba antes y en mobile el navegador
  alcanzaba a pintar un frame del paso intermedio en negro. Queda
  `assets/logo-white.png` por si alguna vez hace falta sobre fondo oscuro:

  ```bash
  ffmpeg -i assets/logo.png -filter_complex \
    "[0:v]alphaextract[a];color=white:s=1400x451[w];[w][a]alphamerge" \
    -frames:v 1 -y assets/logo-white.png
  ```

### La segunda pantalla entra en una pantalla

El statement, los dos nombres, el botón y el footer tienen que verse juntos sin
scrollear, en cualquier teléfono. Dos condiciones a la vez: ninguna línea del
statement puede cortarse, y la columna entera tiene que terminar arriba del
fold. Las dos se pagan con lo mismo —el cuerpo de la tipografía— así que se mide
en vez de adivinarse: `fitStatement()` en `main.js` calcula el tamaño contra el
ancho de la línea más larga, y si algo todavía cuelga por abajo lo descuenta del
tipo (hasta un piso del 58%). El resultado va a `--fit`; el `clamp` del CSS es lo
que se ve hasta que corre. **Sólo achica**: donde el tamaño del CSS ya entraba,
no toca nada.

Por eso `.statement .line` es `white-space: nowrap` y `.about__inner` es
`flex: 1 0 auto` — si algo no entra, la sección crece (y el fit lo ve) en lugar
de comprimir los hijos hasta que el footer se meta adentro del botón.

Si algún día se edita el texto del statement, no hay nada que recalcular: la
línea más larga se vuelve a medir sola.

### El hover de los nombres

Todo el bloque de cada persona es un solo botón: `.person__link::after` se estira
sobre la tarjeta, así que apuntar el nombre ya es apuntar el link. El desenfoque
es un clon del nombre (`::after` con `content: attr(data-name)`) que vive
*detrás* del texto y se ve sólo a través de una máscara que lo cruza — el nombre
en sí nunca se desenfoca, se lee igual. Si se cambia un nombre en el HTML hay que
cambiar también su `data-name`, donde `&#10;` es el salto de línea.

### Transición entre las dos pantallas

Está toda en `main.js` y se ajusta con dos funciones:

- **Snap.** Al primer clic de rueda —o a la primera flecha, o al empujón más
  chico con el dedo— arranca el viaje entero a la otra pantalla, con easing
  propio (`easeInOutCubic`, ~660 ms). No espera a que frenes ni mide distancia:
  alcanza con la dirección del gesto. Mientras dura, el resto del gesto y su
  inercia se descartan para que nada pelee con la animación.
  Sólo actúa en la costura entre las dos secciones: si la violeta no entra
  entera en pantalla, adentro se scrollea nativo y no se mete nadie.
- **Disolución líquida.** El progreso del scroll (`p`, de 0 a 1) maneja opacidad,
  desenfoque, escala y un `feDisplacementMap` (el filtro `#liquid` en el HTML)
  que deforma el logo al salir y el titular al entrar. La deformación es máxima a
  mitad de camino y vuelve a cero en los dos extremos.

Los filtros se activan sólo mientras dura el cruce (clase `is-morphing` en el
`body`): en reposo no hay ningún filtro aplicado y no cuesta un solo frame.
Con `prefers-reduced-motion` se desactiva todo — snap incluido.

Para calibrar, los números están juntos en la función `paint()`: `7` es el
desenfoque máximo de salida, `12` la fuerza del warp, `0.07` el parallax.
