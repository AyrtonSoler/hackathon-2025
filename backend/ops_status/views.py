from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse
from django.db import connection
import os

def health_live(request):
    return JsonResponse({"status": "ok", "service": "api"})

def health_ready(request):
    checks, ok = {}, True

    # DB
    try:
        with connection.cursor() as cur:
            cur.execute("SELECT 1;")
        checks["db"] = "ok"
    except Exception as e:
        ok = False
        checks["db"] = f"error: {e}"

    # Redis (si REDIS_URL existe)
    try:
        redis_url = os.getenv("REDIS_URL")
        if redis_url:
            import redis
            redis.from_url(redis_url).ping()
            checks["redis"] = "ok"
    except Exception as e:
        ok = False
        checks["redis"] = f"error: {e}"

    # S3 (si S3_BUCKET existe)
    try:
        bucket = os.getenv("S3_BUCKET")
        if bucket:
            import boto3
            s3 = boto3.client("s3", endpoint_url=os.getenv("S3_ENDPOINT_URL"))
            s3.head_bucket(Bucket=bucket)
            checks["s3"] = "ok"
    except Exception as e:
        ok = False
        checks["s3"] = f"error: {e}"

    return JsonResponse(
        {"status": "ok" if ok else "degraded", "checks": checks},
        status=200 if ok else 503,
    )