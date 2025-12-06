// =========================
// Supabase client
// =========================
const supa = supabase.createClient(
  "https://klrjkwouixiybuyjglbj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtscmprd291aXhpeWJ1eWpnbGJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzE5MjAsImV4cCI6MjA4MDYwNzkyMH0.-sdXiwRf0mbA-3WYnddrQPQ2rwMNbOGP0oNziiIZBUE"
);

// where users should come back after Google login
const REDIRECT_URL = "https://devarakonda72613.github.io/JOURNAL/";

// =========================
// DOM elements
// =========================
const coverScreen = document.getElementById("coverScreen");
const enterBtn = document.getElementById("enterBtn");

const backgroundDiv = document.getElementById("background");
const currentDateDisplay = document.getElementById("currentDate");
const monthYearDisplay = document.getElementById("monthYear");
const calendarGrid = document.getElementById("calendarGrid");

const journalEntry = document.getElementById("journalEntry");
const journalTitle = document.getElementById("journalTitle");
const saveJournalBtn = document.getElementById("saveJournal");
const clearJournalBtn = document.getElementById("clearJournal");

const tasksTitle = document.getElementById("tasksTitle");
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTask");
const taskList = document.getElementById("taskList");

const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

// =========================
// State
// =========================
let currentUser = null;
let selectedDate = null;
let currentMonth = new Date(2026, 0, 1); // January 2026

const monthImages = {
  0: "jan.jpg",
  1: "feb.jpg",
  2: "march.jpg",
  3: "aprl.jpg",
  4: "mat.jpg",
  5: "june.jpg",
  6: "july.jpg",
  7: "aug.jpg",
  8: "sept.jpg",
  9: "oct.jpg",
  10: "nov.jpg",
  11: "dec.jpg",
};

// =========================
// Helpers
// =========================
function dateKey(date) {
  return date.toISOString().split("T")[0];
}

function updateHeader() {
  if (!selectedDate) return;
  currentDateDisplay.textContent = selectedDate.toDateString();
}

function updateBackground() {
  if (!selectedDate) return;
  const img = monthImages[selectedDate.getMonth()];
  if (img) {
    backgroundDiv.style.backgroundImage = `url('${img}')`;
  }
}

// =========================
// Auth + initialization
// =========================
async function initApp() {
  const { data } = await supa.auth.getSession();

  if (!data.session) {
    // Not logged in yet → show cover with "Sign in"
    enterBtn.textContent = "Sign in with Google";
    enterBtn.onclick = async () => {
      await supa.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: REDIRECT_URL },
      });
    };
    return;
  }

  // Logged in
  currentUser = data.session.user;

  // Button now just enters the app (hide cover)
  enterBtn.textContent = "Enter 2026 Journal";
  enterBtn.onclick = () => {
    coverScreen.classList.add("hide");
  };

  // Default date = Jan 1, 2026
  selectedDate = new Date(2026, 0, 1);
  currentMonth = new Date(2026, 0, 1);

  renderCalendar();
  updateHeader();
  updateBackground();
  await loadJournal();
  await loadTasks();
}

// run once DOM + Supabase are ready
window.addEventListener("load", initApp);

// =========================
// Calendar
// =========================
function renderCalendar() {
  const year = 2026;
  const month = currentMonth.getMonth();

  const monthName = currentMonth.toLocaleString("en-US", { month: "long" });
  monthYearDisplay.textContent = `${monthName} 2026`;

  calendarGrid.innerHTML = "";

  const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  weekdays.forEach((d) => {
    const el = document.createElement("div");
    el.textContent = d;
    el.classList.add("inactive");
    calendarGrid.appendChild(el);
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.classList.add("inactive");
    calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.textContent = day;

    const thisDate = new Date(year, month, day);
    if (
      selectedDate &&
      thisDate.toDateString() === selectedDate.toDateString()
    ) {
      cell.classList.add("active");
    }

    cell.addEventListener("click", async () => {
      selectedDate = thisDate;
      updateHeader();
      updateBackground();
      await loadJournal();
      await loadTasks();
      renderCalendar();
    });

    calendarGrid.appendChild(cell);
  }
}

prevMonthBtn.addEventListener("click", () => {
  if (currentMonth.getMonth() > 0) {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    renderCalendar();
  }
});

nextMonthBtn.addEventListener("click", () => {
  if (currentMonth.getMonth() < 11) {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    renderCalendar();
  }
});

// =========================
// Journal (Supabase)
// =========================
async function loadJournal() {
  if (!currentUser || !selectedDate) return;

  const { data, error } = await supa
    .from("journal_entries")
    .select("content")
    .eq("user_id", currentUser.id)
    .eq("entry_date", dateKey(selectedDate))
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("loadJournal error:", error);
    return;
  }

  journalEntry.value = data?.content || "";
  journalTitle.textContent = `Journal for ${selectedDate.toDateString()}`;
}

saveJournalBtn.addEventListener("click", async () => {
  if (!currentUser || !selectedDate) return;

  const payload = {
    user_id: currentUser.id,
    entry_date: dateKey(selectedDate),
    content: journalEntry.value,
  };

  const { error } = await supa
    .from("journal_entries")
    .upsert(payload, { onConflict: "user_id,entry_date" });

  if (error) {
    console.error("saveJournal error:", error);
    alert("Could not save journal.");
  } else {
    alert("Journal saved ✅");
  }
});

clearJournalBtn.addEventListener("click", () => {
  journalEntry.value = "";
});

// =========================
// Tasks (Supabase)
// =========================
async function loadTasks() {
  if (!currentUser || !selectedDate) return;

  const { data, error } = await supa
    .from("tasks")
    .select("id, text, done")
    .eq("user_id", currentUser.id)
    .eq("task_date", dateKey(selectedDate))
    .order("id", { ascending: true });

  if (error) {
    console.error("loadTasks error:", error);
    return;
  }

  taskList.innerHTML = "";

  (data || []).forEach((task) => {
    renderTask(task);
  });

  tasksTitle.textContent = `Tasks for ${selectedDate.toDateString()}`;
}

function renderTask(task) {
  const li = document.createElement("li");
  if (task.done) li.classList.add("task-done");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.done;
  checkbox.classList.add("task-checkbox");

  const textSpan = document.createElement("span");
  textSpan.textContent = task.text;
  textSpan.classList.add("t-text");

  const del = document.createElement("span");
  del.textContent = "Delete";
  del.classList.add("delete-btn");

  checkbox.addEventListener("change", async () => {
    const { error } = await supa
      .from("tasks")
      .update({ done: checkbox.checked })
      .eq("id", task.id);
    if (error) console.error("update task error:", error);
    li.classList.toggle("task-done", checkbox.checked);
  });

  del.addEventListener("click", async (e) => {
    e.stopPropagation();
    const { error } = await supa.from("tasks").delete().eq("id", task.id);
    if (error) {
      console.error("delete task error:", error);
      return;
    }
    li.remove();
  });

  li.appendChild(checkbox);
  li.appendChild(textSpan);
  li.appendChild(del);
  taskList.appendChild(li);
}

addTaskBtn.addEventListener("click", async () => {
  if (!currentUser || !selectedDate) return;
  const text = taskInput.value.trim();
  if (!text) return;

  const payload = {
    user_id: currentUser.id,
    task_date: dateKey(selectedDate),
    text,
    done: false,
  };

  const { data, error } = await supa
    .from("tasks")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("addTask error:", error);
    return;
  }

  taskInput.value = "";
  renderTask(data);
});
