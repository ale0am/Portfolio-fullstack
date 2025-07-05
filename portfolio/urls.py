from django.urls import path, include
from rest_framework import routers
from .views import ProjectViewSet, ExperienceViewSet

router = routers.DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'experience', ExperienceViewSet)

urlpatterns = router.urls
