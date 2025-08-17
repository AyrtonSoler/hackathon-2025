from django.contrib import admin
from .models import Institution, Group, Enrollment, DeviceSession

@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    list_display = ("id","name","slug","is_active","created_at")
    search_fields = ("name","slug")

@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ("id","name","institution")
    list_filter = ("institution",)

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("id","user","institution","role","is_active","created_at")
    list_filter = ("institution","role","is_active")
    search_fields = ("user__username","user__email")

@admin.register(DeviceSession)
class DeviceSessionAdmin(admin.ModelAdmin):
    list_display = ("id","user","institution","refresh_jti","is_active","last_seen","refresh_expires_at")
    list_filter = ("institution","is_active")
