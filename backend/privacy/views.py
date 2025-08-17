from django.shortcuts import get_object_or_404
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.throttling import ScopedRateThrottle

from accounts.models import Institution, Enrollment
from .models import ConsentRecord, AuditLog, DataExportJob, DataEraseJob
from .serializers import ConsentIn, ConsentOut, JobOut
from .tasks import run_export_job, run_erase_job


# ---------- helpers ----------


def current_institution(request) -> Institution:
    """
    Toma la institución del claim 'ins' del JWT si viene.
    Si no, cae al último Enrollment activo del usuario.
    """
    payload = getattr(getattr(request, "auth", None), "payload", {}) or {}
    ins_id = payload.get("ins")
    if ins_id:
        return get_object_or_404(Institution, id=ins_id, is_active=True)

    enr = (
        Enrollment.objects
        .filter(user=request.user, is_active=True, institution__is_active=True)
        .order_by("-created_at")
        .first()
    )
    if not enr:
        raise Http404("Institución no encontrada para el usuario")
    return enr.institution


def write_audit(request, action: str, inst: Institution,
                target_model: str = "", target_id: str = "", meta=None):
    AuditLog.objects.create(
        actor=request.user if request.user.is_authenticated else None,
        institution=inst,
        action=action,
        target_model=target_model,
        target_id=str(target_id or ""),
        ip_address=request.META.get("REMOTE_ADDR"),
        user_agent=request.META.get("HTTP_USER_AGENT", "")[:300],
        metadata=meta or {},
    )


# Helpers para pruebas: ejecutan la función real SIN cola (django-rq)
def run_export_job_sync(job_id: str):
    from .tasks import export_job_core
    export_job_core(job_id)

def run_erase_job_sync(job_id: str):
    from .tasks import erase_job_core
    erase_job_core(job_id)


# ---------- vistas ----------
class BaseAuthView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "privacy"


class ConsentListCreateView(BaseAuthView):
    def get(self, request):
        inst = current_institution(request)
        qs = (ConsentRecord.objects
              .filter(user=request.user, institution=inst)
              .order_by("-created_at")[:200])
        data = [ConsentOut(c).data for c in qs]
        return Response({"items": data})

    def post(self, request):
        inst = current_institution(request)
        s = ConsentIn(data=request.data)
        s.is_valid(raise_exception=True)
        c = ConsentRecord.objects.create(
            user=request.user,
            institution=inst,
            kind=s.validated_data["kind"],
            policy_version=s.validated_data["policy_version"],
            granted=s.validated_data["granted"],
            country=s.validated_data.get("country", ""),
            ip_address=request.META.get("REMOTE_ADDR"),
            user_agent=request.META.get("HTTP_USER_AGENT", "")[:300],
        )
        write_audit(request, "privacy.consent.create",
                    inst, target_model="ConsentRecord", target_id=c.id)
        return Response(ConsentOut(c).data, status=status.HTTP_201_CREATED)


class RequestExportView(BaseAuthView):
    def post(self, request):
        inst = current_institution(request)
        job = DataExportJob.objects.create(user=request.user, institution=inst)
        write_audit(request, "privacy.export.request",
                    inst, target_model="DataExportJob", target_id=job.id)
        # En producción va por cola; en tests lo parcheamos a *_sync
        run_export_job.delay(str(job.id))
        return Response({"id": job.id, "status": job.status}, status=201)


class RequestEraseView(BaseAuthView):
    def post(self, request):
        inst = current_institution(request)
        if (request.data.get("confirm") or "").upper() != "ERASE":
            return Response({"detail": "Confirma enviando {'confirm':'ERASE'}"},
                            status=400)
        job = DataEraseJob.objects.create(user=request.user, institution=inst)
        write_audit(request, "privacy.erase.request",
                    inst, target_model="DataEraseJob", target_id=job.id)
        run_erase_job.delay(str(job.id))
        return Response({"id": job.id, "status": job.status}, status=201)


class JobDetailView(BaseAuthView):
    def get(self, request, pk):
        inst = current_institution(request)
        job = (DataExportJob.objects.filter(id=pk, user=request.user, institution=inst).first()
               or DataEraseJob.objects.filter(id=pk, user=request.user, institution=inst).first())
        if not job:
            return Response({"detail": "No encontrado"}, status=404)

        result_url = ""
        if isinstance(job, DataExportJob) and job.file:
            result_url = job.file.url

        payload = JobOut({
            "id": job.id,
            "type": job.__class__.__name__,
            "status": job.status,
            "error": job.error or "",
            "result_url": result_url,
            "created_at": job.created_at,
            "completed_at": job.completed_at,
        }).data
        return Response(payload)
