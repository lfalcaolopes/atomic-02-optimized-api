# Repository Guidelines

## Project Structure & Module Organization
This is a minimal TypeScript Express API.
- `src/server.ts`: application entrypoint (Express app, middleware, route mounting, startup).
- `src/routes/index.ts`: HTTP route definitions (for example, `/health`).
- `src/middlewares/`: cross-cutting request/response logic (`error.ts`, `requestTimeLog.ts`).
- `src/config/`: environment and runtime config (`env.ts`, `cors.ts`).
- `dist/`: compiled output from `tsc` (generated, do not edit directly).

Keep new code in `src/` and group by concern (`routes`, `middlewares`, `config`) before adding new top-level folders.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
[You can't install dependencies, if anything needs to be downloaded return the command]
- `npm run dev`: run local server with `tsx` watch mode (`src/server.ts`).
- `npm.cmd run build`: compile TypeScript to `dist/`.
- `npm.cmd run lint`: run ESLint checks.
- `npm run lint:fix`: auto-fix lint issues where possible.
- `npm run format`: format files with Prettier.

There is currently no `npm test` script in this repository.

## Coding Style & Naming Conventions
- Language: TypeScript with `strict` compiler settings (`tsconfig.json`).
- Formatting: Prettier (`singleQuote: true`, `semi: false`, `printWidth: 100`, trailing commas).
- Linting: ESLint + `typescript-eslint` + `simple-import-sort`.
- Naming: use clear module names (`requestTimeLog.ts`, `cors.ts`), `camelCase` for variables/functions, `PascalCase` for types/interfaces.
- Exports: prefer explicit named exports for shared modules.

## Testing Guidelines
Automated tests are not yet configured. Until a test framework is added:
- Run `npm run lint && npm run build` before opening a PR.
- Manually verify key endpoints (for example `GET /health`).
- Include reproducible verification steps in PR descriptions.

## Commit & Pull Request Guidelines
Local `.git` history is not available in this workspace snapshot, so follow Conventional Commits:
- Examples: `feat: add request validation middleware`, `fix: handle missing PORT`.

## Security & Configuration Tips
- Copy `.env.example` to `.env` for local setup; never commit secrets.
- Review CORS settings in `src/config/cors.ts` before production deployment.
- Keep `NODE_ENV` and `PORT` explicit in deployment environments.
