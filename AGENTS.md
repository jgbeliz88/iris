<!-- bmad:context -->
<!-- Verified 2026-11-09 against fb59033. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## iris

API Fastify 5 (TypeScript, Node 22, CommonJS vía `tsc`) de Mediaset; hoy solo `status` y un stub de `assets/startCopy` que llamará a Enigma y Media Copilot. Despliegue en Kubernetes vía Jenkins (`ci/Jenkinsfile`, librería `ci-library`); imágenes en AWS ECR. Artefactos BMad en `_bmad-output/`. Tickets en Jira, proyecto MLTMED.

## Policy

- Trabaja en este fork (`origin` = `jgbeliz88/iris`); nunca hagas push ni abras PR contra `grupomediaset/*` — el equipo lo sube a Mediaset.
- PR a `dev` desde `feat|fix|refactor/MLTMED-<n>-<desc>`. No crees `release/*`, `hotfix/*` ni tags: los gestiona el equipo.
- Commits Conventional con scope (`feat(iris): …`); la clave Jira va en la rama, no en el asunto.
- Nunca ejecutes nada que toque PRE/PRO, ECR o infra real: `terraform` (y `make` en `ci/terraform/*`), `kubectl`, `vault`, `aws`, `docker push`. Propón el comando al humano. (Un hook de `.claude/settings.json` lo bloquea en Claude Code.)
- `ci/**` y `Dockerfile` son de Sistemas (`.github/CODEOWNERS`); no los cambies salvo que la tarea lo pida, y dilo en la PR.
- Nunca subas `.env` ni secretos. Los secretos viven en Vault (`apps_multi/data/iris/staging/<env>`, montados por `ci/k8s/<env>/resources/00-vault.yaml`); `ci/k8s/*/resources/config/secrets.conf` se queda sin valores.
- Todo código nuevo lleva tests unitarios (`*.spec.ts` junto al fuente); aún no hay runner: si eres el primero, propón cuál antes de añadirlo.
- No publiques nada de este proyecto en Slack ni en canales de otros equipos (ni anuncios de PR, merge o despliegue); informa solo en la terminal.

## Where things are

- Dominio nuevo: `src/modules/<d>/<d>.{routes,controller,service}.ts` + registro con prefijo en `src/app.ts`.
- Variable de entorno nueva: `required()` en `src/config/env.ts` + nombre sin valor en `.env.example` + `ci/k8s/<env>/resources/config/configuration.conf`; si es secreta, además Vault y `00-vault.yaml` (`secretObjects` y `objects`) — pídeselo a Sistemas.

## Running and verifying

- `npm ci` y `docker compose up` necesitan VPN (Nexus `awsinternal` y la imagen base en ECR); sin VPN fallan, no es un fallo del código.
- Verifica con `npm run typecheck`; no hay tests ni lint configurados.
- La app sale con `exit(1)` al importar `src/config/env.ts` si falta `ENIGMA_BASE_URL`, `MEDIA_COPILOT_BASE_URL` o `MEDIA_COPILOT_API_TOKEN`; para arrancar en local copia `.env.example` a `.env` con valores.
- Cambios en `.env` o dependencias exigen `docker compose up --build`; el hot reload solo vigila `src/`.

## Conventions that differ from defaults

- Logging solo con `TraceLogger`/`logNow` de `src/shared/logger/trace-logger.ts` (envuelve `@mediaset/logger`); nunca `console.*` ni `request.log`/pino de Fastify. En services, `log.step('<dominio>.<fn>', msg, data)`.
- Services sin dependencias de Fastify: reciben datos y un `TraceLogger`, y lanzan `AppError(statusCode, code, message)` en errores previstos; un 5xx que no sea `AppError` llega al cliente como `INTERNAL_SERVER_ERROR` genérico.
- Respuestas de error siempre `{ code, statusCode, message }` (`src/plugins/error-handler.plugin.ts`).
- Nunca registres ni devuelvas `MEDIA_COPILOT_API_TOKEN`: `step()` serializa todo lo que le pasas.

<!-- /bmad:context -->
