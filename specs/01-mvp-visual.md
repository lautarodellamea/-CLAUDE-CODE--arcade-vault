# SPEC 01 — MVP visual de Arcade Vault

> **Status:** Aprobado
> **Depends on:** Ninguna (primera spec del proyecto)
> **Date:** 2026-07-28
> **Objective:** Implementar en Next.js App Router las 5 pantallas visuales de Arcade Vault (Biblioteca, Detalle, Reproductor, Auth y Salón de la Fama) replicando el tema, los datos mock y el comportamiento de `references/templates/`, sin lógica de juego real.

## Scope

**In:**

- Ruta `/` (Biblioteca): grid de 8 juegos con búsqueda por texto y filtro por categoría (estado local, sin sincronizar con la URL).
- Ruta `/juego/[id]` (Detalle): info del juego, tags, stats, leaderboard mock (top 10 vía `seededScores`), botón "Jugar ahora".
- Ruta `/jugar/[id]` (Reproductor): pantalla CRT decorativa (grid animado, naves/enemigos CSS), HUD con puntaje que sube solo por timer, pausa, fin de juego y modal de guardado de puntaje — sin lógica de juego real (sin inputs, sin colisiones).
- Ruta `/auth`: formulario de login/registro mock (tabs "Iniciar sesión" / "Crear cuenta"), botón "Jugar como invitado", botones sociales decorativos (no funcionales).
- Ruta `/salon` (Salón de la Fama): tabs por juego, podio top 3, tabla completa, fila "tu mejor marca" si hay sesión iniciada.
- `Nav` compartido en el layout: logo, links con estado activo por ruta (`usePathname`), contador de créditos estático "03", menú hamburguesa responsive (<840px), botón de sesión (Iniciar Sesión / nombre de usuario que cierra sesión al click).
- Footer estático compartido en el layout, igual texto que la referencia.
- `lib/games.ts`: `GAMES` (8 juegos), `CATEGORIES`, `PLAYERS`, `seededScores()` — tipados en TypeScript.
- Sesión de usuario en `localStorage` (`av_user`): login, invitado, logout, compartida entre Nav y las 5 pantallas vía un `SessionProvider` de contexto en el layout.
- Guardado de puntaje en `localStorage` (`av_scores`) al terminar una partida — se escribe pero no se lee para mostrar leaderboards (igual que la referencia).
- `metadata.title` específico por ruta (ej. "Detalle · Arcade Vault", "Salón de la Fama · Arcade Vault").
- Responsive según los breakpoints ya definidos en `globals.css` (840px nav, 900px detalle, 720px salón/grid).

**Out of scope (for future specs):**

- Backend real, API routes, base de datos o validación de credenciales — el login es 100% mock.
- Lógica de juego real en `/jugar/[id]` (canvas, inputs de teclado, colisiones, niveles reales).
- Lectura de `av_scores` para mostrar leaderboards reales — el leaderboard sigue siendo mock generado por seed.
- Login social real (Google/GitHub).
- Sistema de créditos dinámico/economía del juego.
- Menú desplegable de cuenta con más opciones que "cerrar sesión".
- Tests automatizados (el proyecto no tiene test suite configurado).

## Data model

**`lib/games.ts`** — catálogo de juegos y generador de puntajes mock (portado de `data.jsx`):

```ts
export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type GameColor = "cyan" | "magenta" | "yellow" | "green";

export interface Game {
  id: string;        // slug usado en /juego/[id] y /jugar/[id]
  title: string;
  short: string;
  long: string;
  cat: GameCategory;
  cover: string;      // clase CSS del cover, ej. "cover-bricks"
  color: GameColor;
  best: number;
  plays: string;      // ej. "12.4K"
}

export const GAMES: Game[];                 // los 8 juegos de la referencia
export const CATEGORIES: ("TODOS" | GameCategory)[];
export const PLAYERS: string[];              // 18 nombres para el generador de scores

export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string;       // "DD/MM/2026"
}

export function seededScores(seed: number, count?: number): ScoreRow[];
// generador pseudo-aleatorio determinista, mismo algoritmo que data.jsx
```

**`lib/session.ts`** — sesión de usuario persistida en `localStorage`:

```ts
export interface Session {
  name: string; // mayúsculas, máx. 10 caracteres
}

// clave localStorage: "av_user" → JSON.stringify(Session | null)
```

Expuesta vía contexto (`SessionProvider` + hook `useSession()`) en el layout, para que `Nav` y las 5 pantallas compartan el mismo estado sin prop drilling entre rutas.

**Puntaje guardado** — escrito en `localStorage` al terminar una partida (clave `"av_scores"`, array de entradas, solo append, no se lee en esta spec):

```ts
export interface SavedScore {
  game: string;  // Game.id
  score: number;
  name: string;
  at: number;    // Date.now()
}
```

## Implementation plan

1. Crear `lib/games.ts` con `Game`, `ScoreRow`, `GAMES` (8 juegos), `CATEGORIES`, `PLAYERS` y `seededScores()`, portados 1:1 desde `references/templates/data.jsx`. Prueba manual: `npx tsc --noEmit` pasa sin errores.

2. Crear `lib/session.ts` (tipo `Session`, constante de clave `"av_user"`) y `components/session-provider.tsx` (cliente): contexto con `useSession()` que expone `user`, `login(name)`, `loginGuest()`, `logout()`, leyendo/escribiendo `localStorage`. Envolver `{children}` en `app/layout.tsx` con `<SessionProvider>`.

3. Crear `components/nav.tsx` (cliente): logo, links con estado activo vía `usePathname`, contador de créditos estático "03", botón de sesión (Iniciar Sesión / nombre de usuario que cierra sesión al click) usando `useSession()`, hamburguesa + panel móvil. Insertarlo en `app/layout.tsx` antes de `<main className="av-main">`.

4. Agregar el footer estático (mismo texto y estilo que `app.jsx`) directamente en `app/layout.tsx`, después de `<main>`.

5. Crear `components/game-card.tsx` (cliente): cover, título, descripción, badge de mejor puntuación, botón "Jugar", efecto tilt al mover el mouse, link a `/juego/[id]`.

6. Crear `components/library-screen.tsx` (cliente: hero, buscador, chips de categoría, grid de `GameCard`, estado vacío) y `app/page.tsx` (servidor, renderiza `<LibraryScreen />` con los datos de `lib/games.ts`).

7. Crear `app/juego/[id]/page.tsx` (servidor): `generateMetadata` con el título del juego, tags, stats, leaderboard vía `seededScores`, botones "Jugar ahora" / "Volver al Vault". `notFound()` si el `id` no existe en `GAMES`.

8. Crear `components/game-player.tsx` (cliente: HUD de puntaje/vidas/nivel, timer de puntaje automático, pausa, arena CRT decorativa, modal de fin de juego con guardado en `localStorage` `av_scores`) y `app/jugar/[id]/page.tsx` (servidor: `generateMetadata`, `notFound()` si el `id` no existe, renderiza `<GamePlayer game={game} />`).

9. Crear `components/auth-form.tsx` (cliente: tabs iniciar sesión / crear cuenta, campos, invitado, botones sociales decorativos, `router.push("/")` tras `login`/`loginGuest`) y `app/auth/page.tsx` (servidor: metadata estática, renderiza `<AuthForm />`).

10. Crear `components/hall-of-fame.tsx` (cliente: tabs por juego, podio top 3, tabla completa, fila "tu mejor marca" si hay sesión) y `app/salon/page.tsx` (servidor: metadata estática, renderiza `<HallOfFame />` con los datos de `lib/games.ts`).

## Acceptance criteria

- [ ] `/` muestra el hero, el buscador y el grid de los 8 juegos de `lib/games.ts`.
- [ ] Escribir en el buscador filtra el grid por título en tiempo real.
- [ ] Seleccionar una categoría filtra el grid; "TODOS" muestra los 8 juegos.
- [ ] Una búsqueda sin resultados muestra el estado "NO HAY RESULTADOS".
- [ ] Click en una card o en "JUGAR" navega a `/juego/[id]` con el juego correspondiente.
- [ ] `/juego/[id]` muestra tags, descripción, stats y un leaderboard de 10 filas.
- [ ] `/juego/[id]` con un `id` inexistente devuelve 404.
- [ ] "Jugar ahora" navega a `/jugar/[id]`; "Volver al Vault" navega a `/`.
- [ ] `/jugar/[id]` muestra el HUD y el puntaje sube automáticamente cada ~220ms.
- [ ] "Pausa" detiene el incremento del puntaje y muestra "EN PAUSA"; "Reanudar" lo retoma.
- [ ] "Fin" abre el modal de fin de juego con el puntaje final.
- [ ] Guardar el puntaje en el modal escribe una entrada en `localStorage["av_scores"]` y muestra "PUNTUACIÓN GUARDADA".
- [ ] "Jugar de nuevo" reinicia puntaje/vidas/nivel; "Volver al Vault" navega a `/`.
- [ ] `/auth` permite iniciar sesión con cualquier usuario/contraseña y redirige a `/`.
- [ ] `/auth` permite crear cuenta (tab "Crear cuenta") y redirige a `/`.
- [ ] "Jugar como invitado" inicia sesión sin nombre de usuario y redirige a `/`.
- [ ] Tras iniciar sesión, `Nav` muestra el nombre de usuario en vez de "Iniciar Sesión".
- [ ] Click en el nombre de usuario en `Nav` cierra sesión y vuelve a mostrar "Iniciar Sesión".
- [ ] La sesión persiste al recargar la página (`localStorage["av_user"]`).
- [ ] `/salon` muestra tabs por juego, podio top 3 y tabla completa del juego seleccionado.
- [ ] Cambiar de tab en `/salon` cambia el podio y la tabla mostrados.
- [ ] Con sesión iniciada, `/salon` muestra la fila "tu mejor marca"; sin sesión, no aparece.
- [ ] Los links de `Nav` resaltan la ruta activa según la pantalla actual.
- [ ] En viewport <840px, `Nav` muestra el botón de hamburguesa y el panel móvil abre/cierra correctamente.
- [ ] `npm run build` compila sin errores de TypeScript ni de Next.js.

## Decisions

- **Sí:** rutas reales de App Router (`/`, `/juego/[id]`, `/jugar/[id]`, `/auth`, `/salon`). Más idiomático en Next 16 que replicar el routing por hash de la SPA de referencia, y habilita metadata por ruta.
- **No:** replicar el patrón SPA con estado + `location.hash`. Hubiese ignorado las capacidades nativas de App Router sin ninguna ventaja real.
- **Sí:** slugs de URL en español. Consistente con todo el copy de la app, que está en español.
- **Sí:** `localStorage` con el mismo esquema que la referencia (`av_user`, `av_scores`). El MVP es puramente visual; no hay backend en esta spec.
- **No:** backend real, API routes o base de datos. Se deja para una spec futura cuando haya autenticación real.
- **Sí:** una sola spec para las 5 pantallas + Nav + Footer. Comparten el mismo tema, los mismos datos mock y la misma capa de sesión — separarlas hubiese forzado a coordinar esos elementos compartidos entre specs sin necesidad real.
- **Sí:** los datos mock viven en `lib/games.ts`. Convención estándar del proyecto, aprovecha el alias `@/*`.
- **Sí:** catálogo de 8 juegos idéntico a `data.jsx` (mismos textos, categorías, colores y covers). No hay motivo para reducir o ampliar el contenido en el MVP visual.
- **Sí:** créditos estáticos "03" y sign-out directo al click en el nombre de usuario. Replica fielmente la referencia; un menú de cuenta con más opciones no fue pedido y sería over-engineering.
- **Sí:** `metadata.title` específico por ruta. Mejor UX de pestaña que el único `<title>` de la SPA original, y no cuesta nada extra en App Router.
- **Sí:** el leaderboard (Detalle y Salón) siempre se genera con `seededScores()`, nunca lee `av_scores` real. Así se comporta la referencia; conectar el leaderboard a los puntajes reales queda para otra spec.
- **Sí:** `/juego/[id]` y `/jugar/[id]` son server components con `generateMetadata`, delegando la parte interactiva a componentes cliente aparte (`GamePlayer`, etc.). Permite exportar metadata dinámica sin mezclar `'use client'` en el mismo archivo.
- **No:** tests automatizados. El proyecto no tiene test runner configurado; la verificación de esta spec es revisión visual manual en el dev server.

## What is **not** in this spec

- Backend real, API routes, base de datos o validación de credenciales.
- Lógica de juego real en `/jugar/[id]` (canvas, inputs, colisiones, niveles).
- Lectura de `av_scores` para leaderboards reales.
- Login social real (Google/GitHub).
- Sistema de créditos dinámico/economía del juego.
- Menú de cuenta con más opciones que cerrar sesión.
- Tests automatizados.

Cada uno de estos, si se implementa, va en su propia spec.
