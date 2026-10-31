# ChartMaker

Aplicación web para crear, visualizar y exportar **cifrados**, **charts** y **charts avanzados** de canciones, pensada para equipos de alabanza y músicos.

Cada canción reúne tres recursos en un solo lugar:

| Recurso            | Qué es                                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Cifrado**        | Letra con acordes sobre las sílabas, escrita en formato ChordPro.                                                                                      |
| **Chart**          | Estructura por secciones y compases, con un acorde por tiempo.                                                                                         |
| **Chart avanzado** | Chart con marca de todos los tiempos, barras de repetición, casillas 1./2./3., `%` y símbolos de partitura (segno, coda, calderón, D.C., D.S., Fine…). |

## Características

- **Transposición** por semitonos o eligiendo la tonalidad, compartida entre las tres vistas.
- **Notación** americana (C D E), latina (Do Re Mi), Nashville y números romanos.
- **Cifrado** en modos *letra + acordes*, *solo acordes* y *solo letra*.
- **Secciones**: Intro, Verso, Pre coro, Coro, Puente, Interludio, Estribillo, Final, Instrumental y Tag, con repeticiones.
- **Disposición** en lista o en dos columnas.
- **Exportación** a PDF, PNG y archivos `.chartmaker`.
- **Importación** de canciones desde archivos `.chartmaker`.
- **Editores** con vista previa en vivo.

## Stack

- [Next.js](https://nextjs.org) 16.4 (App Router, Turbopack, `cacheComponents`)
- [React](https://react.dev) 19.3 y [TypeScript](https://www.typescriptlang.org) 5
- [ChordSheetJS](https://github.com/martijnversluis/ChordSheetJS) 18 para la matemática de acordes
- [html-to-image](https://github.com/bubkoo/html-to-image) 1.11 y [jsPDF](https://github.com/parallax/jsPDF) 4 para exportar
- [Tailwind CSS](https://tailwindcss.com) 4 mediante `@tailwindcss/turbopack`, usado solo por su base, más hojas de estilo propias en `src/styles`
- [ESLint](https://eslint.org) 9 con `eslint-config-next`

## Requisitos

- Node.js 20.9 o superior
- npm

## Puesta en marcha

```bash
git clone <url-del-repositorio>
cd chartmaker
npm install
npm run dev
```

La app queda en <http://localhost:3000>.

| Script              | Descripción                                                                         |
| ------------------- | ----------------------------------------------------------------------------------- |
| `npm run dev`       | Servidor de desarrollo                                                              |
| `npm run build`     | Compilación de producción                                                           |
| `npm run start`     | Sirve la compilación de producción                                                  |
| `npm run lint`      | Revisión con ESLint                                                                 |
| `npm run lint:fix`  | ESLint con corrección automática                                                    |
| `npm run typecheck` | Genera los tipos de rutas de Next y revisa TypeScript sin compilar                  |
| `npm run check`     | Lint, tipos y compilación en secuencia (lo que debe pasar antes de un Pull Request) |
| `npm run clean`     | Borra la caché `.next`                                                              |

Si cambias la estructura de carpetas y algo no se actualiza, ejecuta `npm run clean` y vuelve a arrancar.

## Rutas

| Ruta                        | Descripción                                          |
| --------------------------- | ---------------------------------------------------- |
| `/`                         | Inicio                                               |
| `/songs`                    | Listado de canciones, con los recursos de cada una   |
| `/songs/new`                | Crear una canción                                    |
| `/songs/[id]`               | Canción con pestañas Cifrado, Chart y Chart avanzado |
| `/songs/[id]?view=chart`    | Abre directamente la pestaña del chart               |
| `/songs/[id]?view=advanced` | Abre directamente la pestaña del chart avanzado      |
| `/songs/[id]/edit`          | Editor de datos y cifrado                            |
| `/songs/[id]/chart/edit`    | Editor del chart                                     |
| `/songs/[id]/advanced/edit` | Editor del chart avanzado                            |


## API

| Método   | Ruta              | Descripción                                                          |
| -------- | ----------------- | -------------------------------------------------------------------- |
| `GET`    | `/api/songs`      | Lista resumida de canciones                                          |
| `POST`   | `/api/songs`      | Crea una canción (acepta `chart` y `score`)                          |
| `GET`    | `/api/songs/[id]` | Devuelve una canción                                                 |
| `PATCH`  | `/api/songs/[id]` | Actualiza campos sueltos; `chart: null` o `score: null` los eliminan |
| `DELETE` | `/api/songs/[id]` | Elimina una canción                                                  |

Toda entrada se valida en `src/domain/song/validation.ts` (tipos, longitudes, formato de tonalidad y compás, ids únicos de sección).

## Estructura del proyecto

```
data/
└── songs.json                Datos en ejecución (ruta configurable, ver Persistencia)
src/
├── app/                      Rutas de Next.js
│   ├── api/songs/            Route handlers (CRUD)
│   ├── songs/                Listado, nueva canción y detalle
│   │   └── [id]/
│   │       ├── page.tsx      Canción con pestañas
│   │       ├── edit/         Editor de cifrado
│   │       ├── chart/edit/   Editor de chart
│   │       └── advanced/edit/ Editor de chart avanzado
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── page.tsx              Inicio
├── features/                 Interfaz por funcionalidad
│   ├── chart/components/     Visor y editor del chart
│   ├── chordsheet/components/ Visor y editor del cifrado
│   ├── score/components/     Visor y editor del chart avanzado
│   └── songs/                Compone las tres vistas y gestiona la canción
│       ├── components/       SongWorkspace, ResourceEditorPage y acciones
│       └── hooks/            useSaveSong
├── config/                   Nombre de la app y rutas
├── domain/                   Lógica pura de TypeScript (sin React, Next ni Node)
│   ├── chart/                Tipos y utilidades del chart
│   ├── chordsheet/           Parser ChordPro, modos de vista, repeticiones
│   ├── music/                Motor de acordes, formato de superíndices, compás
│   ├── score/                Tipos y utilidades del chart avanzado
│   ├── sections/             Tipos de sección
│   ├── shared/               Utilidades comunes (ids)
│   └── song/                 Tipos, constantes, validación y formato .chartmaker
├── server/
│   └── songs/                Repositorio de canciones (solo servidor)
├── shared/                   Piezas reutilizables sin lógica de negocio
│   ├── editor/               EditorLayout, SectionTypeButtons, SectionMetaFields
│   ├── export/               ExportMenu, ExportHead y exportación a PDF/PNG
│   ├── layout/               Navbar y Footer
│   ├── ui/                   EmptyState, ViewSkeleton
│   └── viewer/               ViewerFrame, toolbar, tarjetas de sección, cabecera, acordes
└── styles/
    ├── global.css            Punto de entrada único (importa el resto en orden)
    ├── base.css              Variables, reset y foco
    ├── layout.css            Estructura, navbar y footer
    ├── components.css        Botones, etiquetas, modales, menús
    ├── app/
    │   └── pages.css         Inicio y not-found
    ├── features/
    │   ├── songs.css         Listado, cabecera y pestañas
    │   ├── chart.css         Chart simple
    │   └── score.css         Chart avanzado
    └── shared/
        ├── viewer.css        Visor del cifrado y hoja exportable
        └── editor.css        Paneles de edición
```

### Reglas de dependencia

```
app  →  features  →  shared  →  domain
app  →  server      →  domain
```

- `domain` no importa React, Next ni Node: es TypeScript puro, fácil de probar y de reutilizar.
- `server` solo se importa desde `app` (rutas y páginas de servidor). Lleva `import 'server-only'`, así que importarlo desde un componente cliente rompe la compilación.
- `shared` no importa `features`, `server` ni `app`.
- `chordsheet`, `chart` y `score` no se importan entre sí: solo `songs` las compone.
- Los componentes nunca leen datos directamente: reciben lo que necesitan por props.

## Modelo de datos

```ts
interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  imageUrl?: string;
  key: string;        // C, F#, Am…
  tempo: number;      // 20–300
  compas: string;     // 4/4, 3/4, 6/8…
  body: string;       // cifrado en ChordPro
  chart?: Chart;      // chart simple
  score?: Score;      // chart avanzado
  createdAt: string;
  updatedAt: string;
}
```

Los acordes se guardan **siempre en notación americana**. Lo que se escribe en latín (`Mim`, `Sol/Si`) se normaliza al guardar, y la notación elegida solo se aplica al mostrar.

## Formato del cifrado (ChordPro)

```
{start_of_verse: Verso 1}
{comment: Pad & Piano}
{repeat: 2}
[F]A tus pies [C]arde mi corazón
{end_of_verse}
```

| Directiva                                         | Uso                                                                               |
| ------------------------------------------------- | --------------------------------------------------------------------------------- |
| `{start_of_<tipo>: Etiqueta}` / `{end_of_<tipo>}` | Abre y cierra una sección                                                         |
| `{comment: texto}`                                | La primera es la anotación de la sección; las siguientes son comentarios de línea |
| `{repeat: N}`                                     | Veces que se repite la sección (extensión propia de ChartMaker)                   |

Tipos de sección: `intro`, `verse`, `prechorus`, `chorus`, `bridge`, `interlude`, `refrain`, `outro`, `instrumental`, `tag`.

## Formato `.chartmaker`

Archivo JSON con sobre y versión, para exportar e importar canciones completas:

```json
{
  "format": "chartmaker",
  "version": 1,
  "exportedAt": "2026-10-27T15:00:00.000Z",
  "song": { "title": "…", "artist": "…", "key": "G", "tempo": 68, "compas": "4/4", "body": "…", "chart": {}, "score": {} }
}
```

`chart` y `score` son opcionales. La importación pasa por las mismas reglas de validación que la API y siempre crea una canción nueva, sin pisar las existentes. Tamaño máximo: 2 MB.

## Persistencia

Las canciones se guardan en `data/songs.json`, fuera de `src/`, y se leen con `fs`. La ruta se puede cambiar con la variable de entorno `CHARTMAKER_DATA_FILE`:

```bash
CHARTMAKER_DATA_FILE=/var/lib/chartmaker/songs.json npm run start
```

Las escrituras son atómicas (archivo temporal y renombrado) y se serializan con una cola, para que dos peticiones simultáneas no se pisen. Una canción se lee una sola vez por petición aunque la pidan varias partes de la página.

El acceso a datos sigue el patrón repositorio:

| Archivo                               | Función                                                                 |
| ------------------------------------- | ----------------------------------------------------------------------- |
| `src/server/songs/repository.ts`      | Contrato `SongRepository` (`list`, `get`, `create`, `update`, `remove`) |
| `src/server/songs/file-repository.ts` | Implementación con archivo JSON                                         |
| `src/server/songs/index.ts`           | Instancia el repositorio y exporta las funciones que usa la app         |

> **Importante:** el almacenamiento en archivo solo funciona en local o en un servidor con disco persistente. En plataformas serverless (Vercel y similares) el sistema de archivos es de solo lectura o efímero. Para desplegar ahí, escribe otra implementación de `SongRepository` (SQLite, Postgres, etc.) y cámbiala en `src/server/songs/index.ts`; el resto de la app no se toca.

El módulo de servidor usa `node:fs` y `server-only`: impórtalo únicamente desde Server Components y route handlers.

## Exportación

- **PDF**: la hoja se captura en tema claro y se reparte en páginas A4.
- **PNG**: la misma hoja en una sola imagen.
- **`.chartmaker`**: la canción original, sin transponer.

La cabecera exportada muestra título, artista y álbum, y una línea con tono, tempo y compás. La portada no se incluye, porque las imágenes de otros dominios sin CORS hacen fallar la captura.

## Convenciones

- **Ramas**: [Git Flow](#git-flow) (ver más abajo).
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/) (`feat`, `fix`, `refactor`, `docs`, `style`, `chore`…).
- **Componentes**: Server Components por defecto; `'use client'` solo donde hay estado o eventos.
- **Datos dinámicos**: con `cacheComponents`, cualquier lectura de `params`, `searchParams` o del JSON debe ir dentro de un `<Suspense>`.
- **Estilos**: variables de diseño en `base.css` (`--cm-*`) y una hoja por área, organizadas en `app/`, `shared/` y `features/` como el código y cargadas, en orden, desde `src/styles/global.css`.


### Git Flow
 
El proyecto sigue el modelo de ramas de [Git Flow](https://www.atlassian.com/es/git/tutorials/comparing-workflows/gitflow-workflow).
 
| Rama                | Origen    | Se fusiona en      | Propósito                                                                   |
| ------------------- | --------- | ------------------ | --------------------------------------------------------------------------- |
| `main`              | —         | —                  | Código en producción. Cada fusión lleva una etiqueta de versión (`v1.2.0`). |
| `develop`           | `main`    | —                  | Integración de lo siguiente a publicar. Nunca se trabaja directo en ella.   |
| `feature/<nombre>`  | `develop` | `develop`          | Funcionalidad nueva.                                                        |
| `release/<versión>` | `develop` | `main` y `develop` | Preparación de una versión: ajustes finales, versión y changelog.           |
| `hotfix/<nombre>`   | `main`    | `main` y `develop` | Corrección urgente en producción.                                           |

Nombres de ramas en minúsculas y con guiones, por ejemplo `feature/chart-avanzado`, `release/1.2.0` o `hotfix/exportar-pdf`.


## Limitaciones conocidas

- El PDF es una imagen: el texto no se puede seleccionar ni buscar.
- El chart avanzado no admite cambios de compás a mitad de canción.
- En 6/8 se cuentan 2 tiempos por compás.
- Sin autenticación ni usuarios: cualquiera con acceso a la app puede editar y borrar canciones.
- Dos pestañas editando el mismo campo a la vez: gana el último guardado.

## Pendientes

- Reordenar compases en el chart simple.
- Botón para eliminar solo el chart o el chart avanzado de una canción.
- Hoja de estilos de impresión para generar PDF vectorial.
- Base de datos para despliegues en la nube.