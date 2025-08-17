# core/settings.py
from pathlib import Path
import os
import secrets
import environ
from dotenv import load_dotenv; load_dotenv()
# ── Paths y .env ────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR, ".env"))  # lee backend/.env

# ── Seguridad / entorno ────────────────────────────────────────────────────────
SECRET_KEY = env("DJANGO_SECRET_KEY", default="dev-" + secrets.token_urlsafe(32))  # ⚠️ solo default en dev
DEBUG = env.bool("DEBUG", default=True)
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])

# ── Localización ───────────────────────────────────────────────────────────────
LANGUAGE_CODE = "es-mx"
TIME_ZONE = "America/Mexico_City"
USE_I18N = True
USE_TZ = True

# ── Apps ───────────────────────────────────────────────────────────────────────
INSTALLED_APPS = [
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django_rq",

    # Terceros
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "drf_spectacular",
    "storages",
    "accounts",
    "privacy",

    # Propias
    "ops_status",
    "userprefs",# ← tu app de health
    "filesvc",
    "test_api",
    "corsheaders",
    "portfolio",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "userprefs.middleware.PreferenceLocaleMiddleware",
]

ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"

# ── Base de datos (usa DATABASE_URL si existe; si no, SQLite) ──────────────────
if env("DATABASE_URL", default=None):
    DATABASES = {"default": env.db()}
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# ── Validación de contraseñas ──────────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ── Archivos estáticos ─────────────────────────────────────────────────────────
STATIC_URL = "static/"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ── DRF + OpenAPI (Swagger) ────────────────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

# --- DRF: auth JWT + throttling por scope 'auth' (sin pisar config existente)
from datetime import timedelta

REST_FRAMEWORK = globals().get("REST_FRAMEWORK", {})

# Auth por JWT
REST_FRAMEWORK.setdefault(
    "DEFAULT_AUTHENTICATION_CLASSES",
    ("rest_framework_simplejwt.authentication.JWTAuthentication",)
)

# Throttling global (incluye Scoped para usar 'auth')
REST_FRAMEWORK.setdefault(
    "DEFAULT_THROTTLE_CLASSES",
    (
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
        "rest_framework.throttling.ScopedRateThrottle",
    )
)

# Tasas por scope; rellenamos si faltan
REST_FRAMEWORK.setdefault("DEFAULT_THROTTLE_RATES", {})
REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"].setdefault("anon", "50/min")
REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"].setdefault("user", "100/min")
REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"].setdefault("auth", "5/min")
REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"].setdefault("privacy", "10/min")

# SimpleJWT (por si aún no lo tenías)
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": env("JWT_SECRET"),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

SPECTACULAR_SETTINGS = {
    "TITLE": "API",
    "VERSION": "v1",
}

# Límites de carga (≈10 MB)
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024   # límite total del body antes de cortar (levanta RequestDataTooBig)
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024   # archivos >10MB se manejan fuera de memoria/serán rechazados por parsers

# Logging simple a consola (INFO en dev, WARNING en prod)
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "console": {"format": "%(asctime)s %(levelname)s %(name)s: %(message)s"},
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "console"},
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO" if DEBUG else "WARNING",
    },

}
# Redirecciones de autenticación (evita /accounts/profile/)
LOGIN_URL = "/api-auth/login/"
LOGIN_REDIRECT_URL = "/me/profile"       # o "/schema/swagger-ui/" o "/admin/"
LOGOUT_REDIRECT_URL = "/api-auth/login/"

# ── Redis + RQ (colas) ────────────────────────────────────────────────────────
REDIS_URL = env("REDIS_URL", default="redis://127.0.0.1:6379/0")

import os
RQ_QUEUES = {
    "default": {
        "URL": os.environ.get("REDIS_URL", "redis://127.0.0.1:6379/0"),
        "DEFAULT_TIMEOUT": 360,
    }
}

# ── Media (exports locales) ───────────────────────────────────────────────────
MEDIA_ROOT = BASE_DIR / "media"
MEDIA_URL = "/media/"
DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]
CSRF_TRUSTED_ORIGINS = ["http://localhost:3000","http://localhost:5173"]