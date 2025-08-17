from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import Project, Assignment, Submission
from .serializers import ProjectSerializer, AssignmentSerializer, SubmissionSerializer

# --- Projects ---
@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def projects_list_create(request):
    if request.method == "GET":
        qs = Project.objects.all().order_by("-created_at")
        ser = ProjectSerializer(qs, many=True)
        return Response(ser.data)
    # POST
    data = request.data.copy()
    # En MVP, si hay usuario autenticado, lo usamos como owner; si no, lo dejamos null
    owner = request.user if (hasattr(request, "user") and request.user.is_authenticated) else None
    ser = ProjectSerializer(data=data)
    if ser.is_valid():
        obj = ser.save(owner=owner)
        return Response(ProjectSerializer(obj).data, status=status.HTTP_201_CREATED)
    return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
@permission_classes([AllowAny])
def project_detail(request, pk: int):
    obj = get_object_or_404(Project, pk=pk)
    return Response(ProjectSerializer(obj).data)

# --- Assignments ---
@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def assignments_list_create(request):
    if request.method == "GET":
        qs = Assignment.objects.all().order_by("-created_at")
        ser = AssignmentSerializer(qs, many=True)
        return Response(ser.data)
    # POST
    data = request.data.copy()
    owner = request.user if (hasattr(request, "user") and request.user.is_authenticated) else None
    ser = AssignmentSerializer(data=data)
    if ser.is_valid():
        obj = ser.save(owner=owner)
        return Response(AssignmentSerializer(obj).data, status=status.HTTP_201_CREATED)
    return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

# --- Submissions (nested under assignment) ---
@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def assignment_submissions(request, assignment_id: int):
    asg = get_object_or_404(Assignment, pk=assignment_id)
    if request.method == "GET":
        qs = Submission.objects.filter(assignment=asg).order_by("created_at")
        ser = SubmissionSerializer(qs, many=True)
        return Response(ser.data)
    # POST
    data = request.data.copy()
    student = request.user if (hasattr(request, "user") and request.user.is_authenticated) else None
    data["assignment"] = asg.id
    ser = SubmissionSerializer(data=data)
    if ser.is_valid():
        obj = ser.save(student=student)
        return Response(SubmissionSerializer(obj).data, status=status.HTTP_201_CREATED)
    return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)