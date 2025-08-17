# backend/portfolio/profile_views.py
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.apps import apps  # 👈

@require_GET
def profile_summary(request):
    # intenta resolver Project dinámicamente
    try:
        Project = apps.get_model('portfolio', 'Project')  # app_label, ModelName
    except LookupError:
        Project = None

    projects = []
    if Project is not None:
        qs = Project.objects.order_by('-created_at')[:10]
        projects = [{'title': p.title, 'description': p.description or ''} for p in qs]


    knowledge_tests = [
        {'id': 'js_basics', 'score': 72},
        {'id': 'react_fundamentals', 'score': 80},
    ]
    psycho_tests = [
        {'id': 'enneagram_focus', 'score': 62},
        {'id': 'bigfive_extroversion', 'score': 58},
    ]

    return JsonResponse({
        'knowledgeTests': knowledge_tests,
        'psychoTests': psycho_tests,
        'projects': projects,
    })