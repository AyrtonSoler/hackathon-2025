# core/urls.py
from django.contrib import admin
from django.urls import path

# Vistas de health (cámbialo si tu app se llama distinto)
from ops_status.views import health_live, health_ready

# OpenAPI / Swagger (drf-spectacular)
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),

    # Health checks
    path("health/live", health_live, name="health-live"),
    path("health/ready", health_ready, name="health-ready"),

    # OpenAPI schema y UIs
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "schema/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
]