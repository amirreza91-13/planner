from rest_framework import viewsets
from .models import Category, WeeklyEvent, Task, Quiz, EventCheck
from .serializers import (
    CategorySerializer, WeeklyEventSerializer, TaskSerializer,
    QuizSerializer, EventCheckSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class WeeklyEventViewSet(viewsets.ModelViewSet):
    queryset = WeeklyEvent.objects.select_related("category")
    serializer_class = WeeklyEventSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer

    def get_queryset(self):
        qs = Task.objects.select_related("category")
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        return qs


class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer


class EventCheckViewSet(viewsets.ModelViewSet):
    serializer_class = EventCheckSerializer

    def get_queryset(self):
        qs = EventCheck.objects.all()
        d = self.request.query_params.get("date")
        return qs.filter(date=d) if d else qs