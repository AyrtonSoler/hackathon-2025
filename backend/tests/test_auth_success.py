from rest_framework.test import APIClient
from accounts.models import Institution, Enrollment, DeviceSession

BASE = "/api"

def test_register_login_me_refresh_logout_flow(db, settings):
    c = APIClient()

    # 1) register crea usuario, institución y enrollment
    reg = c.post(f"{BASE}/auth/register", {
        "email": "alumno@example.com",
        "password": "S3gura123!",
        "first_name": "Alex",
        "last_name": "García",
        "institution": "prepa-demo",
        "role": "student",
    }, format="json")
    assert reg.status_code in (200, 201), reg.content
    data_reg = reg.json()
    assert "access" in data_reg and "refresh" in data_reg
    assert data_reg["user"]["email"] == "alumno@example.com"
    assert Institution.objects.filter(slug="prepa-demo").exists()
    assert Enrollment.objects.filter(user__email="alumno@example.com",
                                     institution__slug="prepa-demo",
                                     role="student").exists()

    # 2) login
    log = c.post(f"{BASE}/auth/login", {
        "email": "alumno@example.com",
        "password": "S3gura123!",
        "institution": "prepa-demo",
    }, format="json")
    assert log.status_code == 200, log.content
    data_log = log.json()
    access = data_log["access"]
    refresh = data_log["refresh"]

    # Debería haberse creado una DeviceSession
    assert DeviceSession.objects.filter(user__email="alumno@example.com",
                                        institution__slug="prepa-demo",
                                        is_active=True).exists()

    # 3) /me con Bearer
    c.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    me = c.get(f"{BASE}/me")
    assert me.status_code == 200, me.content
    body = me.json()
    assert body["current_institution_id"] is not None
    assert body["current_role"] == "student"

    # 4) refresh (nuevo access; puede venir refresh nuevo por ROTATE_REFRESH_TOKENS=True)
    new = c.post(f"{BASE}/auth/refresh", {"refresh": refresh}, format="json")
    assert new.status_code == 200, new.content
    new_data = new.json()
    assert "access" in new_data
    refresh = new_data.get("refresh", refresh)  # ← usa el refresh vigente

    # 5) logout con el refresh vigente
    out = c.post(f"{BASE}/auth/logout", {"refresh": refresh}, format="json")
    assert out.status_code == 200, out.content
