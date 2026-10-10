from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=50)
    slug = models.SlugField(unique=True)
    color = models.CharField(max_length=7, default="#6366f1")

    def __str__(self):
        return self.name


class WeeklyEvent(models.Model):
    WEEKDAYS = [
        (0, "شنبه"), (1, "یکشنبه"), (2, "دوشنبه"), (3, "سه‌شنبه"),
        (4, "چهارشنبه"), (5, "پنجشنبه"), (6, "جمعه"),
    ]
    title = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="weekly_events")
    weekday = models.PositiveSmallIntegerField(choices=WEEKDAYS)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    duration_min = models.PositiveSmallIntegerField(null=True, blank=True)
    note = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ["weekday", "start_time"]

    def __str__(self):
        return f"{self.title} ({self.get_weekday_display()})"


class Task(models.Model):
    STATUS = [("todo", "انجام‌نشده"), ("doing", "در حال انجام"), ("done", "انجام‌شده")]
    title = models.CharField(max_length=150)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="tasks")
    date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    duration_min = models.PositiveSmallIntegerField(null=True, blank=True)
    priority = models.PositiveSmallIntegerField(default=2)
    status = models.CharField(max_length=10, choices=STATUS, default="todo")
    note = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ["date", "start_time", "priority"]

    def __str__(self):
        return self.title


class Quiz(models.Model):
    number = models.PositiveSmallIntegerField(unique=True)
    subject = models.CharField(max_length=50)
    date = models.DateField()
    questions = models.PositiveSmallIntegerField()
    minutes = models.PositiveSmallIntegerField()
    done = models.BooleanField(default=False)
    score = models.PositiveSmallIntegerField(null=True, blank=True)

    class Meta:
        ordering = ["date"]

    def __str__(self):
        return f"آزمونک {self.number}"


class EventCheck(models.Model):
    """وجود این رکورد = بلوک تکرارشونده در این تاریخ انجام شده"""
    event = models.ForeignKey(WeeklyEvent, on_delete=models.CASCADE, related_name="checks")
    date = models.DateField()

    class Meta:
        unique_together = ("event", "date")