# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository

`zustand-with-suspense` (aka `sustand`) — a superset of [zustand](https://github.com/pmndrs/zustand) that adds computed properties, Suspense/loadable async state, a `setState(partial, desc)` signature, key-based selection/setter hooks, and `renderToPipeableStream` SSR support. Published as a dual ES/CJS package with TypeScript types.

The README (in Chinese) is the primary API reference.

## Commands

```bash
# Dev demo (webpack-dev-server on :7000, serves demo/src/index.js)
npm run dev

# Full publish build: clean → emit .d.ts → build ES → build CJS
npm run build

# Individual build steps
npm run types      # tsc -p tsconfig.build.json (declaration-only into types/)
npm run build:es   # NODE_ENV=es  babel src -d es   (ESM output)
npm run build:cjs  # NODE_ENV=cjs babel src -d lib  (CJS output)
npm run clean      # rm -rf lib types es
```

No test runner is configured. The `test` script is a placeholder that exits with an error — do not run it. Validate changes via the demo (`npm run dev`) and the type-check pass in `npm run types`.

## Build pipeline specifics

- Babel handles JS/TS transform for both library output and webpack; `babel.config.js` toggles `modules: false` only when `NODE_ENV=es`. When editing babel config, keep both env branches working.
- TypeScript emits declarations only (`emitDeclarationOnly: true`, outDir `types/`). Runtime transpilation is Babel-only, so TS type errors do not fail the JS build — run `npm run types` to catch them.
- `tsconfig.json` includes both `src` and `demo`; `tsconfig.build.json` narrows to `src` for the published `types/`.
- The webpack demo aliases `sustand` → `src/` (see `demo/webpack/common.config.js`), so the demo imports the live source, not the built output.
- Published `files`: `lib` (CJS), `es` (ESM), `types` (.d.ts), `src`. Keep `package.json`'s `main`/`module`/`typings` in sync if paths change.

## Architecture

`create(stateCreator, options?)` in `src/sustand.ts` is the single entry point. It composes a pipeline of wrappers around zustand's `create`, then returns `{ useStore, useStoreSuspense, useStoreLoadable, store }`.

### Middleware pipeline (order matters)

Wrappers are applied in this order inside `createSustand` — each takes a `StateCreator` and returns one:

1. **`collect`** (`src/utils/collet.ts`) — runs the user's `stateCreator`, then walks the returned state once. Fields tagged `sustand_internal_iscomputed` are moved into a `computedCaches` map (wrapped in `proxy-memoize` when `window.Proxy` exists) and their slot is nulled. Fields tagged `sustand_internal_issuspense` are moved into `suspenseCaches` with per-`cacheKey` sub-entries and their slot becomes `{}`. After collection, each computed is evaluated once to seed initial values.
2. **`setMiddleware`** (`src/middlewares/setMiddware.ts`) — replaces `api.setState` so user calls become `setState(partial, desc)` (debug label passed as zustand's third "action" arg to devtools) and `replace` is always `false`. User code **must** call `set(partial, desc?)`, not `set(partial, replace, desc)`.
3. **`getMiddleware`** (`src/utils/getMiddleware.ts`) — overloads `get`/`api.getState` so it accepts a string key, a selector function, or no args (returns full state). Downstream middleware, including zustand's own devtools/persist, then see the enhanced signature.
4. **`subscribeWithSelector`** (`src/middlewares/subscribeWithSelector.ts`) — adds `store.subscribeWithSelector(selector, listener, { equalityFn, fireImmediately })`. Built in; do not re-wrap with zustand's own version.
5. **User `options.middwares`** (note the spelling: `middwares`, not `middlewares` — preserve this public API) are applied last, so they see all the enhancements above.

After zustand is created, a top-level `store.subscribe` re-runs every computed function on each state change and writes the result back into `state[key]`, keeping computed values live without relying on selector memoization at the hook layer.

### Three hook behaviors for `useStore`

`useStore` in `src/sustand.ts` branches on argument type — keep these three call shapes intact when editing:

- `useStore(selector, equalityFn?)` — default `equalityFn` is `shallow` (not `Object.is` as in vanilla zustand).
- `useStore('computedKey')` — returns the value; never returns a setter.
- `useStore('suspenseKey')` — delegates to `useStoreSuspense`.
- `useStore('normalKey')` — returns `[value, setter]`. The setter is lazily created and cached in a closure-local `lazySetActions` map, so the reference is stable across renders and never collides with real state keys. The setter dispatches through `store.setState({ [key]: v }, `setState: ${key}`)` so devtools sees a labeled action.

### Suspense / Loadable

`getStoreSuspense` (`src/getStoreSuspense.ts`) backs both `useStoreSuspense` and `useStoreLoadable`. Loadable is just `useStoreSuspense(..., { loadable: true })`. Per-key state is further keyed by `JSON.stringify(options.args) || 'default'`, so the same suspense definition can cache multiple parallel fetches. For SSR, `loadScript` emits a `<script>` that hydrates `window.__ssrstreamingdata__[key + cacheKey]` into the client cache (used for `renderToPipeableStream` streaming hydration).

Suspense definitions built with `suspense(action, { selector, equalityFn, initialValue })` can opt into auto-refresh: when `selector` is provided, a `store.subscribe` listener re-invokes the promise whenever the selector's output changes under `equalityFn` (default `shallow`).

### Marker convention

Computed and suspense fields are plain objects carrying an internal boolean tag (`sustand_internal_iscomputed`, `sustand_internal_issuspense`). If you add another field kind, follow the same pattern: tag it in `src/utils/*.ts`, detect it in `collect`, and surface a type in `src/types.ts` (see `Computed`, `Suspensed`, `Convert`, `FilterSuspenseKey`, `FilterComputedKey`, `FilterNormalKey`).

### Context mode

`createContext(createFn?)` in `src/createContext.ts` returns `{ Provider, useStore, useStoreSuspense, useStoreLoadable, getStore }`. The `createFn` argument is purely for TypeScript inference — it is never called inside `createContext`. The actual store is created by the consumer via `create(createFn)` and passed to `<Provider value={store}>`.

## TypeScript notes

- `create<T>()(stateCreator, options?)` is the required double-call form in TS (same trick as zustand; see README § "ts 使用"). Do not collapse it to a single call.
- `Convert<T>` rewrites computed fields to their return type and suspense fields to the `{ [cacheKey]: { data, status, error, refresh } }` shape. All `getState`/`setState`/selector types downstream are `Convert<T>`, not `T`.
- `StateCreator<T, S = T>` supports slice composition: a slice typed `StateCreator<FullStore, SliceShape>` can still `get()` across the full store. This enables the slice-split pattern documented in the README.
- The library requires TypeScript ≥ 4.5 because `Convert` uses `Awaited<…>`.

## Public API surface (`src/index.ts`)

Default export is `create`. Named exports: `compute`, `suspense`, `shallow` (re-exported from `zustand/shallow`), `devtools`, `persist`, `subscribeWithSelector`, `createContext`, plus the type exports from `src/types.ts`. When renaming or removing any of these, update `types/index.d.ts` as well (it is committed, not generated on install).

## Conventions to preserve

- Option key is spelled `middwares` (typo in the public API — keep it).
- `set` signature is `(partial, desc?)`; never expose zustand's `replace` flag through the sustand layer.
- Default equality for hooks and `subscribeWithSelector` is `shallow`, not `Object.is`.
- Computed fields cannot be `set`; the collector nulls their slot and the subscription recomputes them. Don't try to write-through.
- Demo code under `demo/` imports from the alias `sustand` — when adding new exports, verify the demo still builds with `npm run dev`.
