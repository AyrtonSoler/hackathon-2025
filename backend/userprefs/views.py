# userprefs/views.py
from rest_framework import generics, permissions, status
from drf_spectacular.utils import extend_schema

from .models import (
    UserProfile,
    Preferences,
    default_accessibility,
    default_notifications,
)
from .serializers import UserProfileSerializer, PreferencesSerializer

# Cambia a False SOLO si necesitas probar sin auth (no recomendado).
REQUIRE_AUTH = True
Perm = [permissions.IsAuthenticated] if REQUIRE_AUTH else [permissions.AllowAny]


@extend_schema(tags=["me"])
class MeProfileView(generics.RetrieveUpdateAPIView):
    """
    GET /me/profile    -> devuelve el perfil del usuario
    PUT /me/profile    -> actualiza campos parciales del perfil
    """
    permission_classes = Perm
    serializer_class = UserProfileSerializer

    def get_object(self):
        # Crea el perfil si no existe
        obj, _ = UserProfile.objects.get_or_create(user=self.request.user)
        return obj


@extend_schema(tags=["me"])
class MePreferencesView(generics.RetrieveUpdateAPIView):
    """
    GET /me/preferences  -> devuelve preferencias
    PUT /me/preferences  -> actualiza preferencias (parcial)
    """
    permission_classes = Perm
    serializer_class = PreferencesSerializer

    def get_object(self):
        # Crea preferencias con defaults de accesibilidad/notifications si no existen
        obj, _ = Preferences.objects.get_or_create(
            user=self.request.user,
            defaults={
                "language": "es-mx",
                "accessibility": default_accessibility(),
                "notifications": default_notifications(),
            },
        )
        return obj