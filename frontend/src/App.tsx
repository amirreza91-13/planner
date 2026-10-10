import { useEffect, useMemo, useState } from "react";
import "./App.css";

type Task = { id: string; title: string; category: string; done: boolean; priority?: "low" | "medium" | "high"; dueDate?: string };
type Note = { id: string; title: string; body: string; updatedAt: string };
type Habit = { id: string; title: string; completedDates: string[] };
type Lang = "fa" | "en";
type TimerState = { remainingMs: number; runningSince: number | null };
type PageKey = "overview" | "tasks" | "calendar" | "focus" | "habits" | "notes" | "reports" | "settings";

const KEY = "planner.tasks.v1";
const TIMER_KEY = "planner.focusTimer.v1";
const NOTES_KEY = "planner.notes.v1";
const HABITS_KEY = "planner.habits.v1";

function readStored<T,>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Could not load ${key}`, error);
  }
  return fallback;
}

function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
const FOCUS_DURATION = 25 * 60 * 1000;

const initial: Task[] = [
  { id: "a1", title: "مرور درس‌های امروز", category: "یادگیری", done: false },
  { id: "a2", title: "۱۵ دقیقه تمرین زبان انگلیسی", category: "زبان", done: false },
  { id: "a3", title: "مرور برنامه و ثبت یادداشت", category: "شخصی", done: true },
];

const words = {
  fa: {
    brand: "روال", tag: "فضایی برای رشد آرام", overview: "نمای کلی", tasks: "وظایف من",
    calendar: "تقویم", focus: "تمرکز", habits: "عادت‌ها", notes: "یادداشت‌ها",
    reports: "گزارش‌ها", settings: "تنظیمات", greeting: "قدم‌های کوچک، تغییرهای ماندگار.",
    intro: "امروز را با وضوح شروع کن؛ لازم نیست همه‌چیز را یک‌جا انجام بدهی.",
    today: "برنامه‌ی امروز", addPlaceholder: "یک کار تازه بنویس...", add: "افزودن کار",
    all: "همه", open: "در انتظار", completed: "انجام‌شده", progress: "پیشرفت امروز",
    focusTitle: "زمانی برای تمرکز", focusText: "یک کار را انتخاب کن و فقط از همان‌جا شروع کن.",
    start: "شروع تمرکز", pause: "مکث", resume: "ادامه", reset: "بازنشانی",
    weekly: "این هفته", weeklyText: "پیوستگی مهم‌تر از کامل‌بودن است.",
    empty: "هنوز کاری ثبت نشده. اولین قدم را اضافه کن.", language: "English",
    focusNote: "جلسه‌ی تمرکز ۲۵ دقیقه است؛ می‌توانی هر زمان مکث کنی.",
    reminder: "آینده با کارهای کوچکی ساخته می‌شود که امروز انجام می‌دهی.",
    footer: "ساخته‌شده برای مسیر شخصی تو", workspace: "فضای کار",
    pageIntro: "این بخش آماده‌ی توسعه است؛ قابلیت‌های آن در مراحل بعدی تکمیل می‌شوند.",
    comingSoon: "در حال آماده‌سازی", edit: "ویرایش", save: "ذخیره", cancel: "لغو", priority: "اولویت", low: "کم", medium: "معمولی", high: "زیاد", category: "دسته‌بندی", dueDate: "تاریخ انجام", noDate: "بدون تاریخ", personalCategory: "شخصی", studyCategory: "یادگیری", workCategory: "کار", healthCategory: "سلامت", tasksIntro: "کارهایت را ثبت کن و پیشرفتشان را دنبال کن.",
    calendarIntro: "نمای روزانه و هفتگی برنامه در این بخش ساخته خواهد شد.",
    habitsIntro: "عادت‌های موردنظرت را در این بخش پیگیری خواهی کرد.",
    notesIntro: "یادداشت‌های مهمت در این بخش نگهداری خواهند شد.",
    reportsIntro: "گزارش‌های فعالیت پس از ثبت داده‌های واقعی نمایش داده می‌شوند.",
    settingsIntro: "تنظیمات زبان، پوسته و مدیریت داده‌ها در این بخش قرار می‌گیرند.",
    theme: "پوسته", dark: "تیره", light: "روشن", languageSetting: "زبان رابط",
    timerDone: "زمان تمرکز تمام شد.", timerRunning: "جلسه در حال اجراست",
    timerPaused: "جلسه متوقف شده است", timerReady: "آماده‌ی شروع",
  },
  en: {
    brand: "Ravāl", tag: "A space for steady growth", overview: "Overview", tasks: "My tasks",
    calendar: "Calendar", focus: "Focus", habits: "Habits", notes: "Notes",
    reports: "Reports", settings: "Settings", greeting: "Small steps. Lasting change.",
    intro: "Start today with clarity. You don't have to do everything at once.",
    today: "Today's plan", addPlaceholder: "Add a new task...", add: "Add task",
    all: "All", open: "Open", completed: "Completed", progress: "Today's progress",
    focusTitle: "Time to focus", focusText: "Choose one task and start right there.",
    start: "Start focus", pause: "Pause", resume: "Resume", reset: "Reset",
    weekly: "This week", weeklyText: "Consistency matters more than perfection.",
    empty: "Nothing here yet. Add your first step.", language: "فارسی",
    focusNote: "Each focus session is 25 minutes. You can pause at any time.",
    reminder: "Your future is shaped by the small things you do today.",
    footer: "Made for your personal journey", workspace: "WORKSPACE",
    pageIntro: "This section is ready for development; its features will be added in later steps.",
    comingSoon: "Coming soon", edit: "Edit", save: "Save", cancel: "Cancel", priority: "Priority", low: "Low", medium: "Medium", high: "High", category: "Category", dueDate: "Due date", noDate: "No date", personalCategory: "Personal", studyCategory: "Learning", workCategory: "Work", healthCategory: "Health", tasksIntro: "Capture your tasks and track their progress.",
    calendarIntro: "A daily and weekly schedule view will be built here.",
    habitsIntro: "Track the habits you care about in this section.",
    notesIntro: "Your important notes will live here.",
    reportsIntro: "Reports will appear once real activity data is available.",
    settingsIntro: "Language, theme, and data management settings belong here.",
    theme: "Theme", dark: "Dark", light: "Light", languageSetting: "Interface language",
    timerDone: "Focus time is complete.", timerRunning: "Session is running",
    timerPaused: "Session is paused", timerReady: "Ready to begin",
  },
};

const nav: { key: PageKey; icon: string }[] = [
  { key: "overview", icon: "⌂" }, { key: "tasks", icon: "☷" },
  { key: "calendar", icon: "▦" }, { key: "focus", icon: "◷" },
  { key: "habits", icon: "✳" }, { key: "notes", icon: "▤" },
  { key: "reports", icon: "↗" }, { key: "settings", icon: "⚙" },
];

function dateLabel(lang: Lang) {
  return new Intl.DateTimeFormat(lang === "fa" ? "fa-IR-u-ca-persian" : "en-US", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(new Date());
}

function readTimer(): TimerState {
  try {
    const raw = localStorage.getItem(TIMER_KEY);
    if (raw) {
      const value = JSON.parse(raw) as Partial<TimerState>;
      if (typeof value.remainingMs === "number" && (value.runningSince === null || typeof value.runningSince === "number")) {
        return { remainingMs: Math.max(0, Math.min(FOCUS_DURATION, value.remainingMs)), runningSince: value.runningSince ?? null };
      }
    }
  } catch (error) {
    console.error("Could not load focus timer", error);
  }
  return { remainingMs: FOCUS_DURATION, runningSince: null };
}

export default function App() {
  const [lang, setLang] = useState<Lang>("fa");
  const [dark, setDark] = useState(false);
  const [active, setActive] = useState<PageKey>("overview");
  const [draft, setDraft] = useState("");
  const [draftCategory, setDraftCategory] = useState("personal");
  const [draftPriority, setDraftPriority] = useState<"low" | "medium" | "high">("medium");
  const [draftDueDate, setDraftDueDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "completed">("all");
  const [now, setNow] = useState(Date.now());
  const [timer, setTimer] = useState<TimerState>(readTimer);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => localDateKey());
  const [notes, setNotes] = useState<Note[]>(() => readStored<Note[]>(NOTES_KEY, []));
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [habits, setHabits] = useState<Habit[]>(() => readStored<Habit[]>(HABITS_KEY, []));
  const [habitDraft, setHabitDraft] = useState("");

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as Task[];
      }
    } catch (error) {
      console.error("Could not load tasks", error);
    }
    return initial;
  });

  const fa = lang === "fa";
  const t = words[lang];
  const done = tasks.filter((task) => task.done).length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const visible = useMemo(
    () => tasks.filter((task) => filter === "all" || (filter === "open" ? !task.done : task.done)),
    [tasks, filter],
  );

  const remainingMs = Math.max(
    0,
    timer.remainingMs - (timer.runningSince === null ? 0 : now - timer.runningSince),
  );
  const timerRunning = timer.runningSince !== null && remainingMs > 0;
  const timerFinished = remainingMs <= 0;
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const clock = `${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = fa ? "rtl" : "ltr";
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    try {
      localStorage.setItem(KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error("Could not save tasks", error);
    }
  }, [tasks, lang, fa, dark]);

  useEffect(() => {
    try { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); }
    catch (error) { console.error("Could not save notes", error); }
  }, [notes]);

  useEffect(() => {
    try { localStorage.setItem(HABITS_KEY, JSON.stringify(habits)); }
    catch (error) { console.error("Could not save habits", error); }
  }, [habits]);

  useEffect(() => {
    try {
      localStorage.setItem(TIMER_KEY, JSON.stringify(timer));
    } catch (error) {
      console.error("Could not save focus timer", error);
    }
  }, [timer]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    if (timer.runningSince !== null && remainingMs <= 0) {
      setTimer({ remainingMs: 0, runningSince: null });
    }
  }, [timer.runningSince, remainingMs]);

  function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const title = draft.trim();
    if (!title) return;
    setTasks((old) => [{ id: crypto.randomUUID(), title, category: draftCategory, priority: draftPriority, dueDate: draftDueDate || undefined, done: false }, ...old]);
    setDraft("");
    setDraftCategory("personal");
    setDraftPriority("medium");
    setDraftDueDate("");
  }

  function startTimer() {
    setNow(Date.now());
    setTimer((current) => {
      const left = current.runningSince === null
        ? current.remainingMs
        : Math.max(0, current.remainingMs - (Date.now() - current.runningSince));
      return { remainingMs: left > 0 ? left : FOCUS_DURATION, runningSince: Date.now() };
    });
  }

  function pauseTimer() {
    const currentTime = Date.now();
    setTimer((current) => ({
      remainingMs: Math.max(0, current.remainingMs - (current.runningSince === null ? 0 : currentTime - current.runningSince)),
      runningSince: null,
    }));
  }

  function resetTimer() {
    setTimer({ remainingMs: FOCUS_DURATION, runningSince: null });
    setNow(Date.now());
  }

  const label = (key: PageKey) => t[key];

  function TimerCard({ large = false }: { large?: boolean }) {
    return (
      <section className={`focus-card ${large ? "focus-card-large" : ""}`}>
        <div className="focus-top"><span className="focus-symbol">◷</span><span className="focus-label">{fa ? "فضای تمرکز" : "FOCUS SPACE"}</span></div>
        <h2>{t.focusTitle}</h2>
        <p>{t.focusText}</p>
        <div className="focus-clock" aria-live="off">{clock.split(":")[0]}<span>:</span>{clock.split(":")[1]}</div>
        <div className="focus-clock-caption">{fa ? "دقیقه برای یک کار" : "MINUTES FOR ONE THING"}</div>
        <div className="timer-status" role="status">
          {timerFinished ? t.timerDone : timerRunning ? t.timerRunning : timer.remainingMs === FOCUS_DURATION ? t.timerReady : t.timerPaused}
        </div>
        <div className="timer-controls">
          {!timerRunning && !timerFinished && <button className="focus-button" onClick={startTimer}>{timer.remainingMs === FOCUS_DURATION ? t.start : t.resume}<span>↗</span></button>}
          {timerRunning && <button className="focus-button" onClick={pauseTimer}>{t.pause}<span>Ⅱ</span></button>}
          {(timerFinished || timer.remainingMs !== FOCUS_DURATION) && <button className="timer-reset" onClick={resetTimer}>{t.reset}</button>}
        </div>
        <small className="focus-disclaimer">{t.focusNote}</small>
      </section>
    );
  }


  function saveNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = noteTitle.trim();
    const body = noteBody.trim();
    if (!title && !body) return;
    const finalTitle = title || (fa ? "یادداشت بدون عنوان" : "Untitled note");
    const updatedAt = new Date().toISOString();
    if (editingNoteId) {
      setNotes((old) => old.map((note) => note.id === editingNoteId ? { ...note, title: finalTitle, body, updatedAt } : note));
    } else {
      setNotes((old) => [{ id: crypto.randomUUID(), title: finalTitle, body, updatedAt }, ...old]);
    }
    setNoteTitle(""); setNoteBody(""); setEditingNoteId(null);
  }

  function NotesPage() {
    const dateFormatter = new Intl.DateTimeFormat(fa ? "fa-IR" : "en-US", { dateStyle: "medium" });
    return <div className="planner-page">
      <div className="page-heading"><span className="section-kicker">{fa ? "ثبت فکرها و ایده‌ها" : "THOUGHTS & IDEAS"}</span><h1>{t.notes}</h1><p>{fa ? "ایده‌ها، نکته‌ها و چیزهایی را که می‌خواهی به خاطر بسپاری، اینجا نگه دار." : "Keep your ideas, reminders, and important thoughts in one place."}</p></div>
      <section className="page-panel planner-editor-panel"><h2>{editingNoteId ? (fa ? "ویرایش یادداشت" : "Edit note") : (fa ? "یادداشت تازه" : "New note")}</h2>
        <form className="planner-form" onSubmit={saveNote}><label>{fa ? "عنوان" : "Title"}<input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} maxLength={120} placeholder={fa ? "عنوان یادداشت..." : "Note title..."} /></label><label>{fa ? "متن یادداشت" : "Note"}<textarea value={noteBody} onChange={(e) => setNoteBody(e.target.value)} rows={4} maxLength={5000} placeholder={fa ? "هر چیزی که نمی‌خواهی فراموش کنی..." : "Write anything you want to remember..."} /></label><div className="planner-form-actions"><button type="submit" disabled={!noteTitle.trim() && !noteBody.trim()}>{editingNoteId ? t.save : (fa ? "ذخیره‌ی یادداشت" : "Save note")}</button>{editingNoteId && <button type="button" className="secondary-action" onClick={() => { setEditingNoteId(null); setNoteTitle(""); setNoteBody(""); }}>{t.cancel}</button>}</div></form>
      </section>
      <div className="notes-grid">{notes.length === 0 ? <div className="page-panel planner-empty"><span>▤</span><h2>{fa ? "هنوز یادداشتی نداری" : "No notes yet"}</h2><p>{fa ? "اولین یادداشتت را از فرم بالا ثبت کن." : "Create your first note using the form above."}</p></div> : notes.map((note) => <article className="page-panel note-card" key={note.id}><div className="note-card-top"><span className="section-kicker">{dateFormatter.format(new Date(note.updatedAt))}</span><div className="note-actions"><button type="button" onClick={() => { setEditingNoteId(note.id); setNoteTitle(note.title); setNoteBody(note.body); }}>{t.edit}</button><button type="button" className="danger-action" onClick={() => { setNotes((old) => old.filter((item) => item.id !== note.id)); if (editingNoteId === note.id) { setEditingNoteId(null); setNoteTitle(""); setNoteBody(""); } }}>{fa ? "حذف" : "Delete"}</button></div></div><h2>{note.title}</h2><p>{note.body || (fa ? "این یادداشت متن اضافه‌ای ندارد." : "No additional text.")}</p></article>)}</div>
    </div>;
  }

  function HabitsPage() {
    const today = localDateKey();
    const addHabit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const title = habitDraft.trim(); if (!title) return; setHabits((old) => [{ id: crypto.randomUUID(), title, completedDates: [] }, ...old]); setHabitDraft(""); };
    const days = Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (6 - index)); return { key: localDateKey(date), label: new Intl.DateTimeFormat(fa ? "fa-IR" : "en-US", { weekday: "short" }).format(date) }; });
    return <div className="planner-page"><div className="page-heading"><span className="section-kicker">{fa ? "قدم‌های کوچک روزانه" : "SMALL DAILY STEPS"}</span><h1>{t.habits}</h1><p>{fa ? "عادت‌ها را ثبت کن و هر روزی که انجامشان دادی علامت بزن." : "Create habits and check them off on the days you complete them."}</p></div>
      <section className="page-panel"><form className="habit-add-form" onSubmit={addHabit}><input value={habitDraft} onChange={(e) => setHabitDraft(e.target.value)} maxLength={100} placeholder={fa ? "مثلاً ۱۰ دقیقه مطالعه..." : "e.g. Read for 10 minutes..."} aria-label={fa ? "نام عادت" : "Habit name"} /><button type="submit" disabled={!habitDraft.trim()}><span>＋</span>{fa ? "افزودن عادت" : "Add habit"}</button></form></section>
      {habits.length === 0 ? <div className="page-panel planner-empty"><span>✳</span><h2>{fa ? "هنوز عادتی ثبت نشده" : "No habits yet"}</h2><p>{fa ? "یک عادت کوچک انتخاب کن تا پیگیری‌اش را شروع کنی." : "Add one small habit to start tracking it."}</p></div> : <div className="habit-list">{habits.map((habit) => { const completedToday = habit.completedDates.includes(today); const streak = (() => { let count = 0; const cursor = new Date(); while (habit.completedDates.includes(localDateKey(cursor))) { count++; cursor.setDate(cursor.getDate() - 1); } return count; })(); return <article className="page-panel habit-card" key={habit.id}><div className="habit-card-heading"><div><h2>{habit.title}</h2><p>{fa ? `${streak} روز پیوستگی فعلی` : `${streak}-day current streak`}</p></div><button type="button" className={completedToday ? "habit-complete is-complete" : "habit-complete"} onClick={() => setHabits((old) => old.map((item) => item.id !== habit.id ? item : { ...item, completedDates: completedToday ? item.completedDates.filter((date) => date !== today) : [...item.completedDates, today] }))}>{completedToday ? `✓ ${fa ? "امروز انجام شد" : "Done today"}` : (fa ? "علامت انجام امروز" : "Mark today done")}</button></div><div className="habit-week-row">{days.map((day) => <div className="habit-week-day" key={day.key}><span>{day.label}</span><i className={habit.completedDates.includes(day.key) ? "habit-day-mark checked" : "habit-day-mark"}>{habit.completedDates.includes(day.key) ? "✓" : ""}</i></div>)}</div><div className="habit-card-footer"><span>{fa ? `${habit.completedDates.length} بار ثبت‌شده` : `Completed ${habit.completedDates.length} times`}</span><button type="button" className="danger-action" onClick={() => setHabits((old) => old.filter((item) => item.id !== habit.id))}>{fa ? "حذف عادت" : "Delete habit"}</button></div></article>; })}</div>}
    </div>;
  }

  function ReportsPage() {
    const completed = tasks.filter((task) => task.done).length;
    const open = tasks.length - completed;
    const dated = tasks.filter((task) => Boolean(task.dueDate)).length;
    const highPriorityOpen = tasks.filter((task) => !task.done && task.priority === "high").length;
    const completion = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
    const categories = [{ key: "study", label: t.studyCategory }, { key: "personal", label: t.personalCategory }, { key: "work", label: t.workCategory }, { key: "health", label: t.healthCategory }].map((category) => ({ ...category, total: tasks.filter((task) => task.category === category.key).length, done: tasks.filter((task) => task.category === category.key && task.done).length }));
    return <div className="planner-page"><div className="page-heading"><span className="section-kicker">{fa ? "نگاهی به پیشرفت واقعی" : "YOUR PROGRESS"}</span><h1>{t.reports}</h1><p>{fa ? "این گزارش بر اساس وظایفی است که در پلنر ثبت کرده‌ای." : "These insights are calculated from the tasks currently saved in your planner."}</p></div>
      <div className="report-stats-grid"><article className="page-panel report-stat"><span>{fa ? "کل وظایف" : "Total tasks"}</span><strong>{tasks.length}</strong><small>{fa ? "تمام کارهای ثبت‌شده" : "All saved tasks"}</small></article><article className="page-panel report-stat"><span>{fa ? "انجام‌شده" : "Completed"}</span><strong>{completed}</strong><small>{fa ? "کارهای به پایان رسیده" : "Finished tasks"}</small></article><article className="page-panel report-stat"><span>{fa ? "در انتظار" : "Open"}</span><strong>{open}</strong><small>{fa ? "کارهای باقی‌مانده" : "Tasks remaining"}</small></article><article className="page-panel report-stat"><span>{fa ? "با اولویت بالا" : "High priority"}</span><strong>{highPriorityOpen}</strong><small>{fa ? "کارهای مهمِ باقی‌مانده" : "Important open tasks"}</small></article></div>
      <section className="page-panel report-progress-panel"><div className="report-progress-heading"><div><h2>{fa ? "میزان تکمیل وظایف" : "Task completion"}</h2><p>{fa ? "نسبت کارهای انجام‌شده به کل وظایف" : "Completed tasks as a share of all tasks"}</p></div><strong>{completion}%</strong></div><div className="report-progress-track"><span style={{ width: `${completion}%` }} /></div><div className="report-progress-foot"><span>{fa ? `${completed} انجام‌شده` : `${completed} completed`}</span><span>{fa ? `${dated} دارای تاریخ انجام` : `${dated} with due dates`}</span></div></section>
      <section className="page-panel report-category-panel"><h2>{fa ? "وظایف بر اساس دسته‌بندی" : "Tasks by category"}</h2>{categories.map((category) => <div className="report-category-row" key={category.key}><div><span>{category.label}</span><small>{category.done}/{category.total} {fa ? "انجام‌شده" : "completed"}</small></div><div className="report-category-track"><span style={{ width: `${category.total ? (category.done / category.total) * 100 : 0}%` }} /></div><strong>{category.total}</strong></div>)}</section>
      {tasks.length === 0 && <p className="report-note">{fa ? "با ثبت چند وظیفه، گزارش‌های معنادارتری اینجا نمایش داده می‌شود." : "Add a few tasks to make these reports more informative."}</p>}
    </div>;
  }

  function CalendarPage() {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-firs
    const cells: Array<{ date: Date; inMonth: boolean; key: string }> = [];
    const gridStart = new Date(year, month, 1 - firstWeekday);
    for (let i = 0; i < 42; i++) {
      const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      cells.push({ date, inMonth: date.getMonth() === month, key });
    }
    const dateFormat = new Intl.DateTimeFormat(fa ? "fa-IR-u-ca-gregory" : "en-US", { day: "numeric", calendar: "gregory" });
    const monthFormat = new Intl.DateTimeFormat(fa ? "fa-IR-u-ca-gregory" : "en-US", { month: "long", year: "numeric", calendar: "gregory" });
    const weekdays = fa ? ["دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه", "یکشنبه"] : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const dayTasks = tasks.filter((task) => task.dueDate === selectedCalendarDate);
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return (
      <div className="calendar-page">
        <div className="page-heading">
          <span className="section-kicker">{fa ? "برنامه‌ریزی ماهانه" : "MONTHLY PLANNING"}</span>
          <h1>{t.calendar}</h1>
          <p>{fa ? "تاریخ انجام کارها را در یک نگاه ببین و هر روز را با برنامه جلو ببر." : "See your task deadlines at a glance and plan one day at a time."}</p>
        </div>
        <section className="page-panel calendar-panel">
          <div className="calendar-toolbar">
            <div><h2>{monthFormat.format(calendarMonth)}</h2><p>{fa ? "کارهای زمان‌بندی‌شده از فهرست وظایف نمایش داده می‌شوند." : "Scheduled tasks are synced from your task list."}</p></div>
            <div className="calendar-controls">
              <button type="button" onClick={() => { const d = new Date(); setCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1)); setSelectedCalendarDate(todayKey); }}>{fa ? "امروز" : "Today"}</button>
              <button type="button" aria-label={fa ? "ماه قبل" : "Previous month"} onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}>‹</button>
              <button type="button" aria-label={fa ? "ماه بعد" : "Next month"} onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}>›</button>
            </div>
          </div>
          <div className="calendar-grid calendar-weekdays">{weekdays.map((day) => <div key={day}>{day}</div>)}</div>
          <div className="calendar-grid calendar-days">
            {cells.map(({ date, inMonth, key }) => {
              const dayTasksForCell = tasks.filter((task) => task.dueDate === key);
              return <button type="button" key={key} className={`calendar-day ${!inMonth ? "outside-month" : ""} ${key === todayKey ? "calendar-today" : ""} ${key === selectedCalendarDate ? "calendar-selected" : ""}`} onClick={() => setSelectedCalendarDate(key)}>
                <span className="calendar-day-number">{dateFormat.format(date)}</span>
                {dayTasksForCell.length > 0 && <span className="calendar-task-count">{dayTasksForCell.length} {fa ? "کار" : dayTasksForCell.length === 1 ? "task" : "tasks"}</span>}
                <span className="calendar-task-dots">{dayTasksForCell.slice(0, 3).map((task) => <i key={task.id} className={`calendar-dot priority-${task.priority || "medium"} ${task.done ? "calendar-dot-done" : ""}`} />)}</span>
              </button>;
            })}
          </div>
        </section>
        <section className="page-panel calendar-selected-panel">
          <div className="calendar-selected-heading"><div><span className="section-kicker">{fa ? "برنامه‌ی این روز" : "DAY PLAN"}</span><h2>{new Intl.DateTimeFormat(fa ? "fa-IR-u-ca-gregory" : "en-US", { dateStyle: "full", calendar: "gregory" }).format(new Date(`${selectedCalendarDate}T12:00:00`))}</h2></div><span className="task-count">{String(dayTasks.length).padStart(2, "0")}</span></div>
          {dayTasks.length === 0 ? <p className="calendar-empty">{fa ? "برای این روز کاری با تاریخ انجام ثبت نشده است. از بخش «وظایف من» تاریخ انجام یک کار را مشخص کن." : "No tasks are due on this date. Set a due date for a task in My Tasks."}</p> : <div className="calendar-task-list">{dayTasks.map((task) => <div className={`calendar-task-item ${task.done ? "is-done" : ""}`} key={task.id}><span className={`calendar-dot priority-${task.priority || "medium"} ${task.done ? "calendar-dot-done" : ""}`} /><div><strong>{task.title}</strong><small>{({ personal: t.personalCategory, study: t.studyCategory, work: t.workCategory, health: t.healthCategory } as Record<string, string>)[task.category] || task.category} · {t.priority}: {t[task.priority || "medium"]}</small></div><span className="calendar-task-status">{task.done ? (fa ? "انجام‌شده" : "Done") : (fa ? "در انتظار" : "Open")}</span></div>)}</div>}
        </section>
      </div>
    );
  }

  function TaskPanel() {
    return (
      <section className="panel task-panel">
        <div className="panel-heading"><div><span className="section-kicker">{fa ? "قدم بعدی تو" : "YOUR NEXT STEPS"}</span><h2>{t.today}</h2></div><span className="task-count">{String(tasks.length).padStart(2, "0")}</span></div>
        <form className="task-form task-form-expanded" onSubmit={add}>
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t.addPlaceholder} aria-label={t.addPlaceholder} maxLength={180} />
          <button type="submit" disabled={!draft.trim()}><span>＋</span>{t.add}</button>
          <div className="task-extra-fields">
            <label>{t.category}<select value={draftCategory} onChange={(e) => setDraftCategory(e.target.value)}><option value="personal">{t.personalCategory}</option><option value="study">{t.studyCategory}</option><option value="work">{t.workCategory}</option><option value="health">{t.healthCategory}</option></select></label>
            <label>{t.priority}<select value={draftPriority} onChange={(e) => setDraftPriority(e.target.value as "low" | "medium" | "high")}><option value="low">{t.low}</option><option value="medium">{t.medium}</option><option value="high">{t.high}</option></select></label>
            <label>{t.dueDate}<input type="date" value={draftDueDate} onChange={(e) => setDraftDueDate(e.target.value)} /></label>
          </div>
        </form>
        <div className="task-filters">{(["all", "open", "completed"] as const).map((key) => <button type="button" key={key} className={filter === key ? "selected" : ""} onClick={() => setFilter(key)}>{t[key]}</button>)}</div>
        <div className="task-list">
          {visible.length === 0 ? <div className="empty-state"><span>✳</span><p>{t.empty}</p></div> : visible.map((task) => (
            <article className={`task-row ${task.done ? "is-done" : ""}`} key={task.id}>
              <button className={`task-check ${task.done ? "checked" : ""}`} onClick={() => setTasks((old) => old.map((item) => item.id === task.id ? { ...item, done: !item.done } : item))} aria-label={fa ? "تغییر وضعیت کار" : "Toggle task"}>{task.done ? "✓" : ""}</button>
              <div className="task-detail">
                {editingId === task.id ? <form className="inline-edit-form" onSubmit={(event) => { event.preventDefault(); const title = editingTitle.trim(); if (title) setTasks((old) => old.map((item) => item.id === task.id ? { ...item, title } : item)); setEditingId(null); }}><input autoFocus value={editingTitle} onChange={(event) => setEditingTitle(event.target.value)} maxLength={180} aria-label={t.edit} /><button type="submit" disabled={!editingTitle.trim()}>{t.save}</button><button type="button" onClick={() => setEditingId(null)}>{t.cancel}</button></form> : <><strong>{task.title}</strong><span>{({ personal: t.personalCategory, study: t.studyCategory, work: t.workCategory, health: t.healthCategory } as Record<string, string>)[task.category] || task.category} · {t.priority}: <span className={`priority-tag priority-${task.priority || "medium"}`}>{t[task.priority || "medium"]}</span>{task.dueDate ? ` · ${t.dueDate}: ${task.dueDate}` : ""}</span></>}
              </div>
              {editingId !== task.id && <button className="task-edit" onClick={() => { setEditingId(task.id); setEditingTitle(task.title); }} aria-label={t.edit}>{t.edit}</button>}
              <button className="task-delete" onClick={() => setTasks((old) => old.filter((item) => item.id !== task.id))} aria-label={fa ? "حذف کار" : "Delete task"}>×</button>
            </article>
          ))}
        </div>
        <div className="panel-bottom-note"><span>✦</span>{fa ? "هر قدمی ارزش دارد؛ با خودت مهربان باش." : "Every step counts. Give yourself some grace."}</div>
      </section>
    );
  }

  return (
    <div className={`app-shell ${dark ? "dark" : ""}`} dir={fa ? "rtl" : "ltr"}>
      <aside className="sidebar">
        <button className="brand" onClick={() => setActive("overview")}><span className="brand-mark"><i /></span><span className="brand-copy"><strong>{t.brand}</strong><small>{t.tag}</small></span></button>
        <div className="nav-caption">{t.workspace}</div>
        <nav className="side-nav">{nav.map((item) => <button key={item.key} className={`nav-item ${active === item.key ? "active" : ""}`} onClick={() => setActive(item.key)}><span className="nav-icon">{item.icon}</span><span>{label(item.key)}</span>{active === item.key && <i className="nav-dot" />}</button>)}</nav>
        <div className="sidebar-bottom"><div className="quote-mark">“</div><p>{t.reminder}</p><span>{fa ? "یادآوری روزانه" : "DAILY REMINDER"}</span></div>
        <div className="profile-row"><div className="profile-avatar">ر</div><div className="profile-text"><strong>{fa ? "مسیر من" : "My journey"}</strong><small>{fa ? "در حال رشد" : "Growing steadily"}</small></div><span className="profile-more">···</span></div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs"><button className="breadcrumb-home" onClick={() => setActive("overview")}>{t.overview}</button><span className="crumb-slash">/</span><strong>{label(active)}</strong></div>
          <div className="top-actions"><span className="today-date">{dateLabel(lang)}</span><button className="icon-button" onClick={() => setDark((value) => !value)} aria-label={fa ? "تغییر پوسته" : "Toggle theme"}>{dark ? "☀" : "☾"}</button><button className="language-button" onClick={() => setLang((value) => value === "fa" ? "en" : "fa")}>{t.language}</button></div>
        </header>

        {active === "overview" && <>
          <section className="welcome-section"><div className="welcome-copy"><div className="eyebrow"><span className="eyebrow-dot" />{fa ? "یک شروع تازه" : "A FRESH START"}</div><h1>{t.greeting}</h1><p>{t.intro}</p><div className="welcome-meta"><span className="meta-sun">✳</span>{dateLabel(lang)}</div></div><div className="hero-art" aria-hidden="true"><div className="art-sun" /><div className="art-hill hill-back" /><div className="art-hill hill-front" /><div className="art-stem stem-one" /><div className="art-stem stem-two" /><div className="art-leaf leaf-one" /><div className="art-leaf leaf-two" /><div className="art-leaf leaf-three" /><div className="art-leaf leaf-four" /><div className="art-ground" /></div></section>
          <section className="stats-grid">
            <article className="stat-card stat-progress"><div className="stat-top"><span>{t.progress}</span><span className="stat-symbol">↗</span></div><div className="stat-number">{progress}<small>%</small></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><div className="stat-foot">{done} {fa ? "از" : "of"} {tasks.length} {fa ? "کار انجام شده" : "tasks completed"}</div></article>
            <article className="stat-card"><div className="stat-top"><span>{t.open}</span><span className="stat-icon icon-sage">☷</span></div><div className="stat-number">{tasks.length - done}</div><div className="stat-foot">{fa ? "کار برای ادامه‌دادن" : "ready for your next step"}</div></article>
            <article className="stat-card"><div className="stat-top"><span>{t.completed}</span><span className="stat-icon icon-peach">✓</span></div><div className="stat-number">{done}</div><div className="stat-foot">{fa ? "قدم‌هایی که برداشتی" : "steps already taken"}</div></article>
          </section>
          <div className="content-grid"><TaskPanel /><div className="right-column"><TimerCard /><section className="weekly-card"><div className="weekly-heading"><div><span className="section-kicker">{fa ? "نگاهی به مسیر" : "YOUR JOURNEY"}</span><h2>{t.weekly}</h2></div><span className="weekly-spark">✳</span></div><p>{t.weeklyText}</p><div className="week-bars">{[35, 62, 48, 82, 55, 72, progress || 18].map((height, index) => <div className={`week-bar ${index === 6 ? "today-bar" : ""}`} key={index}><span style={{ height: `${height}%` }} /></div>)}</div><div className="week-labels">{(fa ? ["ش", "ی", "د", "س", "چ", "پ", "ج"] : ["S", "M", "T", "W", "T", "F", "S"]).map((day, index) => <span key={index}>{day}</span>)}</div><div className="weekly-footer"><span className="weekly-status-dot" />{fa ? "ادامه بده، آرام و پیوسته" : "Keep going, steadily"}</div></section></div></div>
        </>}

        {active === "tasks" && <div className="single-page"><div className="page-heading"><span className="section-kicker">{fa ? "برنامه‌ریزی روزانه" : "DAILY PLANNING"}</span><h1>{t.tasks}</h1><p>{t.tasksIntro}</p></div><TaskPanel /></div>}
        {active === "focus" && <div className="single-page"><div className="page-heading"><span className="section-kicker">{fa ? "زمان باکیفیت" : "DEEP WORK"}</span><h1>{t.focus}</h1><p>{t.focusText}</p></div><TimerCard large /></div>}
        {active === "calendar" && <div className="single-page"><CalendarPage /></div>}
        {active === "habits" && <div className="single-page"><HabitsPage /></div>}
        {active === "notes" && <div className="single-page"><NotesPage /></div>}
        {active === "reports" && <div className="single-page"><ReportsPage /></div>}
        {active === "settings" && <div className="single-page"><div className="page-heading"><span className="section-kicker">{fa ? "شخصی‌سازی" : "PREFERENCES"}</span><h1>{t.settings}</h1><p>{t.settingsIntro}</p></div><section className="page-panel settings-panel"><div className="setting-row"><div><strong>{t.theme}</strong><p>{fa ? "ظاهر برنامه را انتخاب کن." : "Choose the app appearance."}</p></div><div className="setting-actions"><button className={!dark ? "setting-selected" : ""} onClick={() => setDark(false)}>{t.light}</button><button className={dark ? "setting-selected" : ""} onClick={() => setDark(true)}>{t.dark}</button></div></div><div className="setting-row"><div><strong>{t.languageSetting}</strong><p>{fa ? "زبان نمایش برنامه را تغییر بده." : "Change the interface language."}</p></div><div className="setting-actions"><button className={fa ? "setting-selected" : ""} onClick={() => setLang("fa")}>فارسی</button><button className={!fa ? "setting-selected" : ""} onClick={() => setLang("en")}>English</button></div></div></section></div>}

        <footer className="app-footer"><span>{t.footer}</span><span>Made with intention <b>✳</b></span></footer>
      </main>
      <nav className="mobile-nav">{nav.slice(0, 5).map((item) => <button key={item.key} className={active === item.key ? "active" : ""} onClick={() => setActive(item.key)}><span>{item.icon}</span><small>{label(item.key)}</small></button>)}</nav>
    </div>
  );
}
