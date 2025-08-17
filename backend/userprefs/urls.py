from django.urls import path
from .views import MeProfileView, MePreferencesView

urlpatterns = [
    path("me/profile", MeProfileView.as_view(), name="me-profile"),
    path("me/preferences", MePreferencesView.as_view(), name="me-preferences"),
]