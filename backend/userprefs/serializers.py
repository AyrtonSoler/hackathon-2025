from rest_framework import serializers
from .models import UserProfile, Preferences

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["display_name", "avatar_url", "country", "state", "bio"]

class PreferencesSerializer(serializers.ModelSerializer):
    language = serializers.ChoiceField(choices=[("es","Español"),("en","English")])

    class Meta:
        model = Preferences
        fields = ["language", "accessibility", "notifications"]

    def validate_accessibility(self, value):
        defaults = {
            "high_contrast": False,
            "color_blind_mode": "none",
            "font_scale": 1.0,
            "keyboard_navigation": True,
            "voice_reader": False,
        }
        merged = {**defaults, **(value or {})}
        if merged["color_blind_mode"] not in {"none","protanopia","deuteranopia","tritanopia"}:
            raise serializers.ValidationError("color_blind_mode inválido.")
        try:
            fs = float(merged["font_scale"])
        except Exception:
            raise serializers.ValidationError("font_scale debe ser numérico.")
        if fs < 0.75 or fs > 2.0:
            raise serializers.ValidationError("font_scale fuera de rango [0.75, 2.0].")
        return merged

    def validate_notifications(self, value):
        defaults = {"email": True, "push": False}
        merged = {**defaults, **(value or {})}
        return merged