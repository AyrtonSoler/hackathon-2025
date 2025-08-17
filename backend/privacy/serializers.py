from rest_framework import serializers
from django.contrib.auth.models import User
from accounts.models import Institution
from .models import ConsentRecord, DataExportJob, DataEraseJob

class ConsentIn(serializers.Serializer):
    kind = serializers.ChoiceField(choices=["terms", "privacy", "marketing"])
    policy_version = serializers.CharField(max_length=50)
    granted = serializers.BooleanField()
    country = serializers.CharField(max_length=2, required=False, allow_blank=True)

class ConsentOut(serializers.ModelSerializer):
    class Meta:
        model = ConsentRecord
        fields = ("id", "kind", "policy_version", "granted", "country", "created_at")

class JobOut(serializers.Serializer):
    id = serializers.UUIDField()
    type = serializers.CharField()
    status = serializers.CharField()
    error = serializers.CharField(allow_blank=True)
    result_url = serializers.CharField(allow_blank=True)
    created_at = serializers.DateTimeField()
    completed_at = serializers.DateTimeField(allow_null=True)
