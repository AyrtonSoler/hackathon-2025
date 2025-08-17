from django.contrib.auth import authenticate, get_user_model
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from .models import Institution, Enrollment, DeviceSession

User = get_user_model()

class EnrollmentOut(serializers.ModelSerializer):
    institution = serializers.SlugRelatedField(slug_field="slug", read_only=True)
    class Meta:
        model = Enrollment
        fields = ("institution","role","is_active")

class UserOut(serializers.ModelSerializer):
    enrollments = EnrollmentOut(many=True, read_only=True)
    class Meta:
        model = User
        fields = ("id","username","email","first_name","last_name","enrollments")

class RegisterIn(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    institution = serializers.SlugField()
    role = serializers.ChoiceField(choices=[("student","student"),("teacher","teacher"),("admin","admin")], default="student")

    def create(self, data):
        email = data["email"].lower()
        password = data["password"]
        inst_slug = data["institution"]
        role = data.get("role","student")

        institution, _ = Institution.objects.get_or_create(slug=inst_slug, defaults={"name": inst_slug})

        # Usamos auth.User; mapeamos username=email
        user, created = User.objects.get_or_create(email=email, defaults={"username": email})
        if created:
            user.first_name = data.get("first_name","")
            user.last_name = data.get("last_name","")
            user.set_password(password)
            user.save()
        else:
            if not user.check_password(password):
                raise serializers.ValidationError({"email": ["Usuario ya existe; contraseña incorrecta."]})

        Enrollment.objects.get_or_create(user=user, institution=institution, defaults={"role": role})

        refresh = RefreshToken.for_user(user)
        refresh["ins"] = institution.id
        refresh["role"] = role
        access = refresh.access_token
        access["ins"] = institution.id
        access["role"] = role

        ds = DeviceSession.objects.create(
            user=user,
            institution=institution,
            user_agent=self.context["request"].META.get("HTTP_USER_AGENT","")[:300],
            ip_address=self.context["request"].META.get("REMOTE_ADDR"),
            refresh_jti=refresh["jti"],
            refresh_expires_at=timezone.now() + settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
        )

        return {
            "user": UserOut(user).data,
            "access": str(access),
            "refresh": str(refresh),
            "session_id": str(ds.refresh_jti),
        }

class LoginIn(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    institution = serializers.SlugField()

    def validate(self, attrs):
        email = attrs["email"].lower()
        inst_slug = attrs["institution"]
        password = attrs["password"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"detail": "Credenciales inválidas."})

        # auth.User autentica por username
        user = authenticate(username=user.username, password=password)
        if not user or not user.is_active:
            raise serializers.ValidationError({"detail": "Credenciales inválidas."})

        try:
            inst = Institution.objects.get(slug=inst_slug, is_active=True)
        except Institution.DoesNotExist:
            raise serializers.ValidationError({"institution": "Institución no encontrada o inactiva."})

        try:
            enr = Enrollment.objects.get(user=user, institution=inst, is_active=True)
        except Enrollment.DoesNotExist:
            raise serializers.ValidationError({"detail": "Sin membresía activa en esta institución."})

        refresh = RefreshToken.for_user(user)
        refresh["ins"] = inst.id
        refresh["role"] = enr.role
        access = refresh.access_token
        access["ins"] = inst.id
        access["role"] = enr.role

        DeviceSession.objects.create(
            user=user,
            institution=inst,
            user_agent=self.context["request"].META.get("HTTP_USER_AGENT","")[:300],
            ip_address=self.context["request"].META.get("REMOTE_ADDR"),
            refresh_jti=refresh["jti"],
            refresh_expires_at=timezone.now() + settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
        )

        return {
            "user": UserOut(user).data,
            "access": str(access),
            "refresh": str(refresh),
        }
