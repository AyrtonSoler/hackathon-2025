# Despliegue en AWS (resumen)

## Backend
- API/Workers: ECS Fargate o Elastic Beanstalk.
- Base de datos: Aurora PostgreSQL (multi-AZ) + read replicas.
- Cache: ElastiCache Redis.
- Archivos: S3 + CloudFront (CDN).
- Entrada: API Gateway + WAF.
- Secretos: AWS Secrets Manager/KMS.

## Frontend
- Opción 1 (recomendada): S3 (hosting estático) + CloudFront.
- Opción 2: Amplify Hosting (builds automáticos, rutas amigables).
- Opción 3: EC2/Beanstalk con Node si requieren SSR.
