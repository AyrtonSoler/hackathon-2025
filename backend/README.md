# Backend

- Framework: Django + Django REST Framework.
- Dominio: usuarios, instituciones, tareas/entregas, evaluaciones, perfil de rasgos, skills/carreras, afinidad y rutas, recomendaciones.
- LLM Gateway: módulo que centraliza llamadas a ChatGPT-5 (cache, rate-limit, retries, redaction, circuit breaker).
- Almacenamiento de archivos: S3 presign (subida/descarga directa).

## Pasos sugeridos
1. Inicializar proyecto y app principal.
2. Modelar entidades mínimas.
3. Autenticación y multi-tenant.
4. Webhooks de tests (Typeform/Tally).
5. Extracción de skills (embeddings → pgvector).
6. Afinidad y rutas.
7. Recomendaciones.
