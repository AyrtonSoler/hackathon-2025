from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

def default_accessibility():
    return {
        "high_contrast": False,
        "color_blind_mode": "none",   # none|protanopia|deuteranopia|tritanopia
        "font_scale": 1.0,            # 0.75–2.0
        "keyboard_navigation": True,
        "voice_reader": False,
    }

def default_notifications():
    return {
        "email": True,
        "push": False,
    }

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    display_name = models.CharField(max_length=120, blank=True)
    avatar_url = models.URLField(blank=True)
    country = models.CharField(max_length=2, blank=True)  # MX, US, etc.
    state = models.CharField(max_length=80, blank=True)
    bio = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"Profile({self.user_id})"

class Preferences(models.Model):
    LANGUAGE_CHOICES = [("es", "Español"), ("en", "English")]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="preferences")
    language = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, default="es")

    accessibility = models.JSONField(default=default_accessibility)
    notifications = models.JSONField(default=default_notifications)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"Preferences({self.user_id})"