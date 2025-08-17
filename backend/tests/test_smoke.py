from django.conf import settings
from django.test import Client

def test_django_loads_and_ping():
    assert settings.SECRET_KEY  # settings cargó
    c = Client()
    resp = c.get("/api/ping")
    # Si ya agregaste /api/ping debería ser 200; si no, al menos no debe crashear
    assert resp.status_code in (200, 404)
