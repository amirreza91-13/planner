from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, WeeklyEventViewSet, TaskViewSet, QuizViewSet, EventCheckViewSet,
)

router = DefaultRouter()
router.register("categories", CategoryViewSet)
router.register("weekly-events", WeeklyEventViewSet)
router.register("tasks", TaskViewSet, basename="task")
router.register("quizzes", QuizViewSet)
router.register("checks", EventCheckViewSet, basename="check")

urlpatterns = router.urls