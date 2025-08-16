# Despliegue en Heroku

## Backend
1. Crear app web (API) y app worker (jobs), añadir Heroku Postgres y Heroku Redis.
2. Configurar variables del `.env.example`.
3. Conectar S3/R2 para archivos y Sentry para errores.
4. Habilitar autoscaling y pgBouncer.

## Frontend
- Si usan Next.js SSG/SPA: pueden desplegar como estático en un bucket S3 con CloudFront (recomendado) o como Node server en Heroku si requieren SSR.
