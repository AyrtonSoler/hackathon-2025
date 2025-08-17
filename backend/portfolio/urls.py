from django.urls import path
from . import views

urlpatterns = [
    path("projects/", views.projects_list_create),
    path("projects/<int:pk>/", views.project_detail),

    #path("assignments/", views.assignments_list_create),
    #path("assignments/<int:assignment_id>/submissions/", views.assignment_submissions),
]