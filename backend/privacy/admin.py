from django.contrib import admin
from .models import ConsentRecord, AuditLog, DataExportJob, DataEraseJob

@admin.register(ConsentRecord)
class ConsentAdmin(admin.ModelAdmin):
    list_display = ("user", "institution", "kind", "policy_version", "granted", "created_at")
    search_fields = ("user__email", "institution__slug")
    list_filter = ("kind", "granted")

@admin.register(AuditLog)
class AuditAdmin(admin.ModelAdmin):
    list_display = ("actor", "institution", "action", "created_at")
    search_fields = ("actor__email", "institution__slug", "action")

@admin.register(DataExportJob)
class ExportAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "institution", "status", "created_at", "completed_at")

@admin.register(DataEraseJob)
class EraseAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "institution", "status", "created_at", "completed_at")
