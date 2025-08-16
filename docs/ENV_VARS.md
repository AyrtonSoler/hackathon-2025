# Variables de entorno (backend)

- `DJANGO_SECRET_KEY` — Clave secreta de Django.
- `DATABASE_URL` — Postgres. Ej: `postgres://user:pass@host:5432/db`.
- `REDIS_URL` — Redis para caché/colas.
- `S3_BUCKET` — Nombre del bucket para archivos (entregas/proyectos).
- `S3_ENDPOINT_URL` — Endpoint S3 (AWS o compatible).
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` — Credenciales para S3.
- `CHATGPT5_API_KEY` — API key para ChatGPT-5 (LLM Gateway).
- `N8N_WEBHOOK_SECRET` — Secret para validar webhooks de n8n/formularios.
- `ALLOWED_HOSTS` — Hosts permitidos (coma separada).
- `SENTRY_DSN` — Telemetría de errores (opcional).
- `ENV` — `dev` | `staging` | `prod`.

# Variables de entorno (frontend — sugeridas)
- `NEXT_PUBLIC_API_BASE_URL` — URL base del backend.
- `NEXT_PUBLIC_ENV` — `dev` | `staging` | `prod`.
