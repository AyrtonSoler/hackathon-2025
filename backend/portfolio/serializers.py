from rest_framework import serializers
from .models import Project, Assignment, Submission, Artifact

class ArtifactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artifact
        fields = ["id", "title", "url", "created_at"]

class ProjectSerializer(serializers.ModelSerializer):
    artifacts = ArtifactSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = ["id", "owner", "institution", "title", "description", "artifacts", "created_at"]
        read_only_fields = ["id", "owner", "created_at"]

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ["id", "institution", "owner", "title", "description", "due_date", "created_at"]
        read_only_fields = ["id", "owner", "created_at"]

class SubmissionSerializer(serializers.ModelSerializer):
    artifacts = ArtifactSerializer(many=True, read_only=True)

    class Meta:
        model = Submission
        fields = ["id", "assignment", "student", "text", "artifacts", "created_at"]
        read_only_fields = ["id", "student", "created_at"]