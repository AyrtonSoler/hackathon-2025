from rest_framework import serializers

class FileUploadSerializer(serializers.Serializer):
    # use_url=False evita que drf-spectacular lo modele como "string($uri)"
    file = serializers.FileField(required=True, allow_empty_file=False, use_url=False)

class FileItemSerializer(serializers.Serializer):
    id = serializers.CharField()
    filename = serializers.CharField()
    length = serializers.IntegerField(required=False)
    contentType = serializers.CharField(allow_null=True, required=False)
    uploadDate = serializers.DateTimeField(required=False)