import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Reglas de dependencias entre capas. El flujo permitido es:
 *
 *   app → features → shared → domain          server → domain
 *
 *   domain/music/core  → no importa nada
 *   domain/music/{theory,notation,instruments} → solo core (no se importan entre sí)
 *   domain → ni React ni Next ni nada de las capas superiores
 *
 * `no-restricted-imports` no se mezcla entre bloques: si un archivo coincide con varios,
 * gana el último. Por eso cada bloque compone su lista completa.
 */

/** Cubre la carpeta ('@/x') y todo lo que hay dentro ('@/x/…'). */
const within = (...folders) => folders.flatMap((f) => [f, `${f}/**`]);

const forbid = (...patterns) => ({
  "no-restricted-imports": ["error", { patterns }],
});

const NO_REACT_NEXT = {
  group: ["react", "react/*", "react-dom", "react-dom/*", "next", "next/*"],
  message: "El dominio es TypeScript puro: no importa React ni Next.",
};
const NO_APP = {
  group: [...within("@/app"), "**/app/**"],
  message: "Nada importa de app/: solo se llega a ella desde el enrutador.",
};
const NO_FEATURES = {
  group: [...within("@/features"), "**/features/**"],
  message: "Capa incorrecta: el flujo es app → features → shared → domain.",
};
const NO_SHARED_UI = {
  group: within("@/shared"),
  message: "El dominio no conoce la UI compartida (src/shared).",
};
const NO_SERVER = {
  group: ["server-only", ...within("@/server")],
  message: "El código de servidor solo lo importa app/ (páginas y route handlers).",
};
const NO_PARENT_RELATIVE = {
  group: ["../**"],
  message: "Importa de otra carpeta con el alias @/ (por ejemplo '@/domain/…').",
};

/** Áreas de domain que no son música: la música no conoce canciones, charts ni secciones. */
const OTHER_DOMAIN = {
  group: within(...["chart", "chordsheet", "score", "sections", "shared", "song"].map((n) => `@/domain/${n}`)),
  message: "domain/music no depende del modelo de canción: es la capa más baja.",
};

const music = (...names) => ({
  group: within(...names.map((n) => `@/domain/music/${n}`)),
});

const DOMAIN = [NO_REACT_NEXT, NO_APP, NO_FEATURES, NO_SHARED_UI, NO_SERVER, NO_PARENT_RELATIVE];

const FEATURES = ["chart", "chordsheet", "score", "songs", "theory"];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // --- domain: TypeScript puro ---
  { files: ["src/domain/**/*.{ts,tsx}"], rules: forbid(...DOMAIN) },

  // core: no importa nada fuera de core
  {
    files: ["src/domain/music/core/**/*.{ts,tsx}"],
    rules: forbid(...DOMAIN, OTHER_DOMAIN, {
      ...music("theory", "notation", "instruments"),
      message: "domain/music/core es la base: no importa nada fuera de core.",
    }),
  },

  // theory, notation e instruments: solo core; no se importan entre sí
  {
    files: ["src/domain/music/theory/**/*.{ts,tsx}"],
    rules: forbid(...DOMAIN, OTHER_DOMAIN, {
      ...music("notation", "instruments"),
      message: "theory solo puede importar core.",
    }),
  },
  {
    files: ["src/domain/music/notation/**/*.{ts,tsx}"],
    rules: forbid(...DOMAIN, OTHER_DOMAIN, {
      ...music("theory", "instruments"),
      message: "notation solo puede importar core.",
    }),
  },
  {
    files: ["src/domain/music/instruments/**/*.{ts,tsx}"],
    rules: forbid(...DOMAIN, OTHER_DOMAIN, {
      ...music("theory", "notation"),
      message: "instruments solo puede importar core.",
    }),
  },

  // --- shared: no conoce las features ---
  { files: ["src/shared/**/*.{ts,tsx}"], rules: forbid(NO_APP, NO_FEATURES, NO_SERVER) },

  // --- features: no importan app ni servidor; solo songs compone otras features ---
  { files: ["src/features/**/*.{ts,tsx}"], rules: forbid(NO_APP, NO_SERVER) },
  ...FEATURES.filter((f) => f !== "songs").map((feature) => ({
    files: [`src/features/${feature}/**/*.{ts,tsx}`],
    rules: forbid(NO_APP, NO_SERVER, {
      group: within(...FEATURES.filter((f) => f !== feature).map((f) => `@/features/${f}`)),
      message: "Una feature no importa otra: solo features/songs las compone.",
    }),
  })),

  // --- server: solo depende de domain ---
  { files: ["src/server/**/*.{ts,tsx}"], rules: forbid(NO_APP, NO_FEATURES, NO_SHARED_UI) },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
