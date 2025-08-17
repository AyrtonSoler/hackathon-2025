from django.shortcuts import render

# Create your views here.
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

QUESTIONS = [
    {"id": 1, "text": "Prefiero planificar que improvisar.", "options":[{"id":"A","label":"Sí"},{"id":"B","label":"No"}]},
    {"id": 2, "text": "Sigo mi intuición más que los datos.", "options":[{"id":"A","label":"Sí"},{"id":"B","label":"No"}]},
    {"id": 3, "text": "Evito conflictos cuando es posible.", "options":[{"id":"A","label":"Sí"},{"id":"B","label":"No"}]},
    {"id": 4, "text": "Busco destacar y ser reconocido.", "options":[{"id":"A","label":"Sí"},{"id":"B","label":"No"}]},
    {"id": 5, "text": "La seguridad y estabilidad son clave.", "options":[{"id":"A","label":"Sí"},{"id":"B","label":"No"}]},
    {"id": 6, "text": "Me motiva ayudar y acompañar.", "options":[{"id":"A","label":"Sí"},{"id":"B","label":"No"}]},
]

IMPACT = {
    1: {"A": {"1":1}, "B": {}},
    2: {"A": {"4":1}, "B": {}},
    3: {"A": {"9":1}, "B": {}},
    4: {"A": {"3":1}, "B": {}},
    5: {"A": {"6":1}, "B": {}},
    6: {"A": {"2":1}, "B": {}},
}

def questions(_):
    return JsonResponse(QUESTIONS, safe=False)

@csrf_exempt
def submit(request):
    if request.method != "POST":
        return JsonResponse({"detail":"Method not allowed"}, status=405)
    try:
        payload = json.loads(request.body.decode("utf-8"))
        answers = payload.get("answers", [])  # [{questionId, optionId}]
    except Exception:
        return JsonResponse({"detail":"Invalid JSON"}, status=400)

    scores = {str(i):0 for i in range(1,10)}
    for a in answers:
        qid = a.get("questionId"); opt = a.get("optionId")
        for t,v in IMPACT.get(qid,{}).get(opt,{}).items():
            scores[t]+=v

    top = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)[:3]
    topTypes = [int(k) for k,_ in top if _>0]
    return JsonResponse({"scores": scores, "topTypes": topTypes})