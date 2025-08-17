from django.utils import translation

class PreferenceLocaleMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        lang = None
        user = getattr(request, "user", None)
        if user and user.is_authenticated and hasattr(user, "preferences"):
            lang = user.preferences.language
        if lang:
            translation.activate(lang)
            request.LANGUAGE_CODE = lang
        response = self.get_response(request)
        translation.deactivate()
        return response