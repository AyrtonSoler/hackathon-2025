# Arquitectura (resumen)

- **Backend**: API REST (Django + DRF), Postgres (JSONB + pgvector), Redis (cache/colas), S3 (archivos).
- **IA**: LLM Gateway a ChatGPT-5 con cache/rate-limit/retries/redaction.
- **Workflows**: n8n (cron, recordatorios, webhooks).
- **Frontend**: sugerido Next.js (React + TS) con Tailwind y TanStack Query (ver `frontend/README.md`).
- **Despliegue**:
  - Backend: Heroku (rápido) o AWS (ECS Fargate + Aurora + ElastiCache + S3 + CloudFront + API Gateway + WAF).
  - Frontend: S3+CloudFront (SPA/SSG), Amplify Hosting o Vercel.
