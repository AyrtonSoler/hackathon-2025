from __future__ import annotations
import uuid
from django.db import models
from django.contrib.auth.models import User
from accounts.models import Institution, Enrollment, DeviceSession  # ya lo tienes

class ConsentKind(models.TextChoices):
    TERMS = "terms", "Terms"
    PRIVACY = "privacy", "Privacy Policy"
    MARKETING = "marketing", "Marketing"

class ConsentRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="consents")
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name="consents")
    kind = models.CharField(max_length=20, choices=ConsentKind.choices)
    policy_version = models.CharField(max_length=50)
    granted = models.BooleanField(default=False)
    country = models.CharField(max_length=2, blank=True)
    user_agent = models.CharField(max_length=300, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["user", "institution", "kind", "created_at"]),
        ]

class AuditLog(models.Model):
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    institution = models.ForeignKey(Institution, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=100)  # p.ej. privacy.consent.create
    target_model = models.CharField(max_length=100, blank=True)
    target_id = models.CharField(max_length=64, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=300, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class JobStatus(models.TextChoices):
    PENDING = "PENDING", "PENDING"
    RUNNING = "RUNNING", "RUNNING"
    DONE = "DONE", "DONE"
    FAILED = "FAILED", "FAILED"

class BaseJob(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=JobStatus.choices, default=JobStatus.PENDING)
    error = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True

class DataExportJob(BaseJob):
    file = models.FileField(upload_to="exports/", null=True, blank=True)

class DataEraseJob(BaseJob):
    pass
