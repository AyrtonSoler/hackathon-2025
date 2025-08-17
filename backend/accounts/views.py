from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication

from .serializers import RegisterIn, LoginIn, UserOut
from .models import DeviceSession, Institution, Enrollment

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"
    def post(self, request):
        s = RegisterIn(data=request.data, context={"request": request})
        s.is_valid(raise_exception=True)
        return Response(s.save(), status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"
    def post(self, request):
        s = LoginIn(data=request.data, context={"request": request})
        s.is_valid(raise_exception=True)
        return Response(s.validated_data, status=status.HTTP_200_OK)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"detail": "Falta refresh token."}, status=400)
        try:
            rt = RefreshToken(refresh_token)
            jti = rt["jti"]
            DeviceSession.objects.filter(user=request.user, refresh_jti=jti, is_active=True).update(is_active=False)
            rt.blacklist()
        except Exception:
            return Response({"detail": "Token inválido."}, status=400)
        return Response({"detail": "Sesión cerrada."})

class RefreshView(TokenRefreshView):
    # SimpleJWT se encarga de rotar y hacer blacklist del refresh viejo
    pass

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    def get(self, request):
        ins_id = getattr(getattr(request, "auth", None), "payload", {}).get("ins") if getattr(request, "auth", None) else None
        current_role = None
        if ins_id:
            try:
                inst = Institution.objects.get(id=ins_id)
                enr = Enrollment.objects.filter(user=request.user, institution=inst, is_active=True).first()
                current_role = getattr(enr, "role", None)
            except Institution.DoesNotExist:
                pass
        data = UserOut(request.user).data
        data["current_institution_id"] = ins_id
        data["current_role"] = current_role
        return Response(data)
