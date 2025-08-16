# Frontend (esqueleto)

Este directorio está listo para que el equipo de UI lo inicialice. Recomendación de stack compatible con el backend:
- **Next.js (React + TypeScript)**, **Tailwind CSS**, **shadcn/ui (Radix)**.
- **TanStack Query + Axios** para consumo de la API (DRF).
- **React Hook Form + Zod** para formularios.
- **Recharts** para gráficas (radar y barras).
- **i18n**: `react-i18next`, fechas con `date-fns`.
- **Uploads**: `Uppy` con URLs firmadas del backend (S3 presign).

## Variables sugeridas
- `NEXT_PUBLIC_API_BASE_URL` — URL base del backend.
- `NEXT_PUBLIC_ENV` — `dev` | `staging` | `prod`.

## Convenciones
- No llamar directamente a ChatGPT-5 desde el front: siempre vía el backend (LLM Gateway).
- Respetar roles/permits: rutas protegidas por rol (student/teacher/admin).
- Accesibilidad: WCAG 2.2 AA (usar componentes accesibles y validación por teclado).
