from django.urls import path
from .views import (
    ConsentListCreateView,
    RequestExportView,
    RequestEraseView,
    JobDetailView,
)

urlpatterns = [
    path("api/privacy/consents",       ConsentListCreateView.as_view(), name="privacy-consents"),
    path("api/privacy/export",         RequestExportView.as_view(),     name="privacy-export"),
    path("api/privacy/erase",          RequestEraseView.as_view(),      name="privacy-erase"),
    path("api/privacy/jobs/<uuid:pk>", JobDetailView.as_view(),         name="privacy-job-detail"),
]
