import json
from django.core.serializers.json import DjangoJSONEncoder
from django.utils import timezone
from django.core.files.base import ContentFile
from django.db import transaction
from django_rq import job
from django.contrib.auth.models import User

from accounts.models import Institution, Enrollment, DeviceSession
from .models import DataExportJob, DataEraseJob, JobStatus, ConsentRecord


def _collect_user_data(user: User, inst: Institution) -> dict:
    return {
        "user": {"id": user.id, "email": user.email, "first_name": user.first_name, "last_name": user.last_name},
        "institution": {"id": inst.id, "slug": inst.slug, "name": inst.name},
        "enrollments": list(Enrollment.objects.filter(user=user, institution=inst).values("id","role","is_active","created_at")),
        "device_sessions": list(DeviceSession.objects.filter(user=user, institution=inst).values("id","is_active","created_at","ip_address","user_agent")),
        "consents": list(ConsentRecord.objects.filter(user=user, institution=inst).values("id","kind","policy_version","granted","country","created_at")),
        "exported_at": timezone.now().isoformat(),
    }


# ---------- LÓGICA PURA (sin RQ) ----------
def export_job_core(job_id: str):
    job = DataExportJob.objects.select_related("user","institution").get(pk=job_id)
    job.status = JobStatus.RUNNING
    job.save(update_fields=["status","updated_at"])
    try:
        data = _collect_user_data(job.user, job.institution)
        payload = json.dumps(data, ensure_ascii=False, indent=2, cls=DjangoJSONEncoder)
        filename = f"export_{job.user_id}_{job.institution_id}_{timezone.now().strftime('%Y%m%d%H%M%S')}.json"
        job.file.save(filename, ContentFile(payload.encode("utf-8")))
        job.status = JobStatus.DONE
        job.completed_at = timezone.now()
        job.save(update_fields=["file","status","completed_at","updated_at"])
    except Exception as e:
        job.status = JobStatus.FAILED
        job.error = str(e)
        job.save(update_fields=["status","error","updated_at"])


def erase_job_core(job_id: str):
    job = DataEraseJob.objects.select_related("user","institution").get(pk=job_id)
    job.status = JobStatus.RUNNING
    job.save(update_fields=["status","updated_at"])
    try:
        with transaction.atomic():
            DeviceSession.objects.filter(user=job.user, institution=job.institution).delete()
            Enrollment.objects.filter(user=job.user, institution=job.institution).update(is_active=False)
        job.status = JobStatus.DONE
        job.completed_at = timezone.now()
        job.save(update_fields=["status","completed_at","updated_at"])
    except Exception as e:
        job.status = JobStatus.FAILED
        job.error = str(e)
        job.save(update_fields=["status","error","updated_at"])


# ---------- ENVOLTORIOS RQ (para producción) ----------
@job("default")
def run_export_job(job_id: str):
    export_job_core(job_id)


@job("default")
def run_erase_job(job_id: str):
    erase_job_core(job_id)
