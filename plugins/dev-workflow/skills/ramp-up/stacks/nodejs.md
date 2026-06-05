# Node.js

## Look at

- `package.json` — `scripts`, `dependencies`, `devDependencies`, `engines.node`, `workspaces`.
- Lockfile: `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, or `bun.lockb`. Pick the one that matches the manifest; mismatches mean drift.
- `tsconfig.json` if present — `compilerOptions.paths`, `include`, `strict`.
- Entry: `main`/`module`/`exports` in `package.json`, or `src/index.*` / `bin/*`.
- Tooling configs at root: `.eslintrc*`, `.prettierrc*`, `vitest.config.*`, `jest.config.*`.

## Tests

- Look for `*.test.*`, `*.spec.*`, `__tests__/`, or `test/`.
- Skipped: `grep -rn --include='*.test.*' --include='*.spec.*' -E '\b(xit|xdescribe|\.skip|\.todo)\b'`.

## Runtime + env

- `.env.example` or `env.d.ts` — required vars.
- `Dockerfile`, `docker-compose.yml`, `Procfile`, `fly.toml`, `vercel.json`.

## Run / build

- Note (don't execute) the scripts: `dev`, `build`, `start`, `test`, `lint`, `typecheck`.
