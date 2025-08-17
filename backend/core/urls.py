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
    # Admin
    path("admin/", admin.site.urls),
    path("api-auth/", include("rest_framework.urls")),

    # Health checks
    path("health/live", health_live, name="health-live"),
    path("health/ready", health_ready, name="health-ready"),

    # OpenAPI schema y UIs
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path("schema/swagger-ui/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("schema/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    path("", include("userprefs.urls")),   # ← agrega esta línea
    path("api/", include("accounts.urls")),
]
