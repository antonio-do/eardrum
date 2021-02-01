"""
Django settings for eardrum project.

Generated by 'django-admin startproject' using Django 2.0.

For more information on this file, see
https://docs.djangoproject.com/en/2.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.0/ref/settings/
"""

import os
import datetime

import localconfigs.settings as localconfigs


# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def get_config_of(name, default):
    """
    Search value of config 'name' in os.environ, localconfigs and default.
    The first value is found will be set to the config 'name'
    """
    return os.environ.get(name, getattr(localconfigs, name, default))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.0/howto/deployment/checklist/


# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = get_config_of('SECRET_KEY', '1grzia7rma(*+q5e2zyc-sq92amjf8e&l6cy1pjpv$ze2+7i%s')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = get_config_of('DEBUG', False)

ALLOWED_HOSTS = get_config_of('ALLOWED_HOSTS', [])


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_swagger',
    'webpack_loader',
    'config',
    'review',
    'account',
    'frontend',
    'markdownx',
    'auditlog',
    'okr_app',
    'compliance',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'auditlog.middleware.AuditlogMiddleware',
]

ROOT_URLCONF = 'eardrum.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'eardrum.wsgi.application'


# Database
# https://docs.djangoproject.com/en/2.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

DATABASES = get_config_of('DATABASES', DATABASES)

# Password validation
# https://docs.djangoproject.com/en/2.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Authentication Backends
AUTHENTICATION_BACKENDS = [
    # 'account.ldap_backend.LDAPBackend',
    'django.contrib.auth.backends.ModelBackend',
    'account.ldap_backend.LDAPBackend',
]


# REST_FRAMEWORK settings
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ),
}


# JWT_AUTH settings
JWT_AUTH = {
    'JWT_VERIFY_EXPIRATION': False,
    'JWT_EXPIRATION_DELTA': datetime.timedelta(days=366),
}


# Authentication
LOGIN_URL = 'rest_framework:login'
LOGOUT_URL = 'rest_framework:logout'


# Internationalization
# https://docs.djangoproject.com/en/2.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.0/howto/static-files/

STATIC_URL = '/static/'

STATIC_ROOT = '/usr/src/static'
MEDIA_ROOT = '/usr/src/uploads'

STATICFILES_DIRS_DEFAULT = (
    # We do this so that django's collectstatic copies or our bundles to the
    # STATIC_ROOT or syncs them to whatever storage we use.
    os.path.join(BASE_DIR, 'frontend', 'dist', 'static'),
)

STATICFILES_DIRS = get_config_of('STATICFILES_DIRS', STATICFILES_DIRS_DEFAULT)

WEBPACK_LOADER_DEFAULT = {
    'DEFAULT': {
        'BUNDLE_DIR_NAME': '',
        'STATS_FILE': os.path.join(BASE_DIR, 'frontend', 'webpack-stats.json'),
    }
}

WEBPACK_LOADER = get_config_of('WEBPACK_LOADER', WEBPACK_LOADER_DEFAULT)
LDAP_SERVER = getattr(localconfigs, 'LDAP_SERVER')
