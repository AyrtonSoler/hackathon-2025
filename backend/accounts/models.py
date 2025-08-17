from django.conf import settings
from django.db import models
from django.utils import timezone
import uuid

class Institution(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.slug

class Group(models.Model):
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name="groups")
    name = models.CharField(max_length=120)
    class Meta: unique_together = ("institution", "name")
    def __str__(self): return f"{self.institution.slug}:{self.name}"

class Enrollment(models.Model):
    ROLE_CHOICES = (("student","Student"),("teacher","Teacher"),("admin","Admin"))
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="enrollments")
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name="enrollments")
    group = models.ForeignKey(Group, on_delete=models.SET_NULL, null=True, blank=True, related_name="enrollments")
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="student")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta: unique_together = ("user","institution")
    def __str__(self): return f"{self.user_id}@{self.institution.slug}({self.role})"

class DeviceSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="device_sessions")
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name="device_sessions")
    user_agent = models.CharField(max_length=300, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    refresh_jti = models.UUIDField(db_index=True, default=uuid.uuid4)
    refresh_expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True)
    def __str__(self): return f"sess:{self.user_id}:{self.refresh_jti}"
