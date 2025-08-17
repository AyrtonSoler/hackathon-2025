from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import UserProfile, Preferences

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "display_name", "country", "state", "updated_at")
    search_fields = ("user__username", "display_name", "country", "state")
    list_select_related = ("user",)
    ordering = ("-updated_at",)

@admin.register(Preferences)
class PreferencesAdmin(admin.ModelAdmin):
    list_display = ("user", "language", "updated_at")
    search_fields = ("user__username",)
    list_select_related = ("user",)
    readonly_fields = ("created_at", "updated_at")