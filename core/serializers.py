from rest_framework import serializers
from .models import Category, WeeklyEvent, Task, Quiz, EventCheck


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class WeeklyEventSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source="category", read_only=True)

    class Meta:
        model = WeeklyEvent
        fields = "__all__"


class TaskSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source="category", read_only=True)

    class Meta:
        model = Task
        fields = "__all__"


class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = "__all__"


class EventCheckSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventCheck
        fields = "__all__"