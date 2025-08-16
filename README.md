# orientacion-ia

Monorepo para la plataforma de orientación vocacional con IA (ChatGPT-5), backend en Django/DRF y workflows n8n. Incluye un **esqueleto de frontend** vacío para que el equipo de UI comience sin fricción.

## Directorios
- `backend/` — Servicio API (Django + DRF). *(a completar)*
- `frontend/` — Espacio para la app web. *(vacío, solo esenciales)*
- `workflows/` — Flujos de n8n (cron, recordatorios, webhooks).
- `docs/` — Documentación funcional/técnica.
- `infra/` — Guías de despliegue (Heroku/AWS) para back y front.
- `.github/` — CI placeholder y plantillas de issues/PR.

## Primeros pasos
1. Crea el repo en GitHub y sube este esqueleto.
2. Configura variables de entorno del backend (`docs/ENV_VARS.md` y `backend/.env.example`).
3. Define el stack del frontend (sugerencias en `frontend/README.md`).
4. Elige despliegue: Heroku/AWS para backend; S3+CloudFront/Amplify/Vercel para frontend.

> Fecha de creación del esqueleto: 2025-08-16
