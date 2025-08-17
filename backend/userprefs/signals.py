from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import UserProfile, Preferences, default_accessibility, default_notifications

User = get_user_model()

@receiver(post_save, sender=User)
def ensure_profile_and_prefs(sender, instance, created, **kwargs):
    if not instance:
        return
    UserProfile.objects.get_or_create(user=instance)
    Preferences.objects.get_or_create(
        user=instance,
        defaults={
            "language": "es",
            "accessibility": default_accessibility(),
            "notifications": default_notifications(),
        },
    )