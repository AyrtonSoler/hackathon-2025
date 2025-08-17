from django.test import override_settings
from rest_framework.test import APIClient
from accounts.models import Institution, Enrollment, DeviceSession
from privacy.models import ConsentRecord, AuditLog, DataExportJob, DataEraseJob
import privacy.views as pv  # para parchear run_export_job/run_erase_job

BASE = "/api"

@override_settings(
    REST_FRAMEWORK={
        "DEFAULT_AUTHENTICATION_CLASSES": ("rest_framework_simplejwt.authentication.JWTAuthentication",),
        "DEFAULT_THROTTLE_CLASSES": ("rest_framework.throttling.ScopedRateThrottle",),
        "DEFAULT_THROTTLE_RATES": {"privacy": "100/min", "auth": "100/min"},
    }
)
def test_privacy_flow_consent_export_erase(db, monkeypatch):
    c = APIClient()

    # --- 0) Registrar y loguear (Bloque 2) ---
    reg = c.post(f"{BASE}/auth/register", {
        "email": "alumno@example.com",
        "password": "S3gura123!",
        "first_name": "Alex",
        "last_name": "García",
        "institution": "prepa-demo",
        "role": "student",
    }, format="json")
    assert reg.status_code in (200, 201), reg.content

    log = c.post(f"{BASE}/auth/login", {
        "email": "alumno@example.com",
        "password": "S3gura123!",
        "institution": "prepa-demo",
    }, format="json")
    assert log.status_code == 200, log.content
    access = log.data["access"]
    c.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

    inst = Institution.objects.get(slug="prepa-demo")

    # --- 1) Crear consentimiento ---
    cons = c.post(f"{BASE}/privacy/consents", {
        "kind": "privacy",
        "policy_version": "v1.0",
        "granted": True,
        "country": "MX",
    }, format="json")
    assert cons.status_code == 201, cons.content
    assert ConsentRecord.objects.filter(user__email="alumno@example.com", institution=inst, kind="privacy").exists()
    assert AuditLog.objects.filter(action="privacy.consent.create", institution=inst).exists()

    # Listar consentimientos
    lst = c.get(f"{BASE}/privacy/consents")
    assert lst.status_code == 200, lst.content
    assert len(lst.data["items"]) >= 1

    # --- 2) Export (parchea la cola para que sea síncrona) ---
    monkeypatch.setattr(pv.run_export_job, "delay", lambda job_id: pv.run_export_job.func(job_id))

    exp = c.post(f"{BASE}/privacy/export")
    assert exp.status_code == 201, exp.content
    job_id = exp.data["id"]
    assert DataExportJob.objects.filter(id=job_id, institution=inst).exists()
    # La tarea ya se ejecutó; debe estar DONE y con archivo
    detail = c.get(f"{BASE}/privacy/jobs/{job_id}")
    assert detail.status_code == 200, detail.content
    assert detail.data["status"] == "DONE"
    assert detail.data["result_url"]  # url del .json

    assert AuditLog.objects.filter(action="privacy.export.request", institution=inst).exists()

    # --- 3) Erase (parchea delay y confirma) ---
    # Asegura que exista al menos una DeviceSession por borrar
    assert DeviceSession.objects.filter(user__email="alumno@example.com", institution=inst).exists()

    monkeypatch.setattr(pv.run_erase_job, "delay", lambda job_id: pv.run_erase_job.func(job_id))

    erq = c.post(f"{BASE}/privacy/erase", {"confirm": "ERASE"}, format="json")
    assert erq.status_code == 201, erq.content
    jid = erq.data["status"]  # también puedes leer erq.data["id"]
    assert AuditLog.objects.filter(action="privacy.erase.request", institution=inst).exists()

    # La tarea ya corrió; sesiones borradas y enrollment desactivado
    assert not DeviceSession.objects.filter(user__email="alumno@example.com", institution=inst).exists()
    enr = Enrollment.objects.get(user__email="alumno@example.com", institution=inst)
    assert enr.is_active is False
