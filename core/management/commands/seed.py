from datetime import date, time
from django.core.management.base import BaseCommand
from core.models import Category, WeeklyEvent, Quiz

CATEGORIES = [
    ("school", "مدرسه", "#3b82f6"),
    ("tezgam", "تِزگام", "#ef4444"),
    ("ili", "زبان (ILI)", "#10b981"),
    ("aivlearn", "آیولرن", "#8b5cf6"),
    ("workout", "ورزش", "#f59e0b"),
    ("dev", "n8n / پایتون", "#06b6d4"),
    ("rest", "استراحت", "#94a3b8"),
]

# ۰=شنبه ... ۶=جمعه
WEEKLY = [
    # مدرسه: فرض شده شنبه تا چهارشنبه (اگه فرق داره بعداً از admin اصلاح کن)
    *[("مدرسه", "school", d, time(8, 0), time(14, 0), "") for d in range(5)],
    # ساعت تِزگام هنوز مشخص نیست -> خالی
    ("ILI", "ili", 1, time(18, 30), time(20, 0), ""),
    ("ILI", "ili", 3, time(18, 30), time(20, 0), ""),
    ("آیولرن (لایو)", "aivlearn", 2, time(16, 0), time(19, 0), "۶ جلسه"),
]

QUIZZES = [
    (3, "هوش و خلاقیت", date(2026, 10, 6), 10, 15),
    (4, "هوش و خلاقیت", date(2026, 10, 13), 10, 15),
    (5, "هوش تصویری", date(2026, 10, 20), 20, 30),
    (6, "هوش تصویری", date(2026, 10, 27), 20, 30),
    (7, "هوش ریاضی", date(2026, 11, 3), 20, 30),
    (8, "هوش ریاضی", date(2026, 11, 10), 20, 30),
]


class Command(BaseCommand):
    help = "پر کردن دیتای اولیه"

    def handle(self, *args, **options):
        cats = {}
        for slug, name, color in CATEGORIES:
            cats[slug], _ = Category.objects.get_or_create(
                slug=slug, defaults={"name": name, "color": color}
            )
        for title, slug, wd, st, et, note in WEEKLY:
            WeeklyEvent.objects.get_or_create(
                title=title, category=cats[slug], weekday=wd,
                defaults={"start_time": st, "end_time": et, "note": note},
            )
        for n, subj, d, q, m in QUIZZES:
            Quiz.objects.get_or_create(
                number=n, defaults={"subject": subj, "date": d, "questions": q, "minutes": m}
            )
        WeeklyEvent.objects.filter(title="تِزگام (ساعت تعیین‌نشده)").delete()
        for d in range(5):
            WeeklyEvent.objects.update_or_create(
                title="تِزگام (زمان آزاد)", category=cats["tezgam"], weekday=d,
                defaults={
                    "duration_min": 150, "start_time": None, "end_time": None,
                    "note": "ساعتش رو خودم تعیین می‌کنم",
                },
            )
        self.stdout.write(self.style.SUCCESS("seed انجام شد"))