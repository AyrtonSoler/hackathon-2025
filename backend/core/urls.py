# core/urls.py
from django.conf.urls.static import static
from django.urls import path, include
from django.conf import settings
from django.contrib import admin

from ops_status.views import health_live, health_ready
from drf_spectacular.views import (
    SpectacularSwaggerView,
    SpectacularRedocView,
    SpectacularAPIView,
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


    path("api/test/", include("test_api.urls")),
    # path("", include("userprefs.urls")),   # ← agrega esta línea
    path("api/", include("accounts.urls")),
    path("", include("privacy.urls")),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

