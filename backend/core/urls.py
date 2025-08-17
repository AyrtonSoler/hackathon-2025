# core/urls.py
from django.contrib import admin
from django.urls import path, include

from ops_status.views import health_live, health_ready
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    # Admin y login básico DRF (para pruebas)
    path("admin/", admin.site.urls),
    path("api-auth/", include("rest_framework.urls")),

    # Health checks
    path("health/live", health_live, name="health-live"),
    path("health/ready", health_ready, name="health-ready"),

    # OpenAPI / Swagger
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path("schema/swagger-ui/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("schema/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),

    # Módulos
    path("", include("userprefs.urls")),      # /me/*
    path("api/", include("accounts.urls")),   # /api/*
    path("files/", include("filesvc.urls")),  # /files/upload (único registro)
]