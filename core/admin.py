from django.contrib import admin
from .models import Category, WeeklyEvent, Task, Quiz

admin.site.register([Category, WeeklyEvent, Task, Quiz])