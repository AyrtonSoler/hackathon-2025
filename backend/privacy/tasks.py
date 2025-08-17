import io, json, datetime
from django.utils import timezone
from django.core.files.base import ContentFile
from django_rq import job
from django.db import transaction
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
        # agrega más fuentes cuando existan (assessments, projects, etc.)
        "exported_at": timezone.now().isoformat(),
    }

@job("default")
def run_export_job(job_id: str):
    job = DataExportJob.objects.select_related("user","institution").get(pk=job_id)
    job.status = JobStatus.RUNNING; job.save(update_fields=["status","updated_at"])
    try:
        data = _collect_user_data(job.user, job.institution)
        payload = json.dumps(data, ensure_ascii=False, indent=2)
        filename = f"export_{job.user_id}_{job.institution_id}_{timezone.now().strftime('%Y%m%d%H%M%S')}.json"
        job.file.save(filename, ContentFile(payload.encode("utf-8")))
        job.status = JobStatus.DONE
        job.completed_at = timezone.now()
        job.save(update_fields=["file","status","completed_at","updated_at"])
    except Exception as e:
        job.status = JobStatus.FAILED
        job.error = str(e)
        job.save(update_fields=["status","error","updated_at"])

@job("default")
def run_erase_job(job_id: str):
    job = DataEraseJob.objects.select_related("user","institution").get(pk=job_id)
    job.status = JobStatus.RUNNING; job.save(update_fields=["status","updated_at"])
    try:
        with transaction.atomic():
            # borra sesiones del usuario en esa institución
            DeviceSession.objects.filter(user=job.user, institution=job.institution).delete()
            # desactiva enrollment en esa institución (no lo borra para retención mínima)
            from accounts.models import Enrollment
            Enrollment.objects.filter(user=job.user, institution=job.institution).update(is_active=False)
        job.status = JobStatus.DONE
        job.completed_at = timezone.now()
        job.save(update_fields=["status","completed_at","updated_at"])
    except Exception as e:
        job.status = JobStatus.FAILED
        job.error = str(e)
        job.save(update_fields=["status","error","updated_at"])
