from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings

class Artifact(models.Model):
    """
    Opcional para adjuntar evidencias/archivos externos.
    Por ahora solo una URL y un título.
    """
    title = models.CharField(max_length=200)
    url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Project(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL
    )
    institution = models.CharField(max_length=200, blank=True, default="")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    artifacts = models.ManyToManyField(Artifact, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.owner_id})"

class Assignment(models.Model):
    institution = models.CharField(max_length=200, blank=True, default="")
    owner = models.ForeignKey(  # quien crea la tarea (profesor/admin)
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Submission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name="submissions")
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL
    )
    text = models.TextField(blank=True, default="")
    artifacts = models.ManyToManyField(Artifact, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        who = self.student_id or "anon"
        return f"Sub #{self.pk} → Asg {self.assignment_id} by {who}"