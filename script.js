// =======================
//  SUPABASE CLIENT SETUP
// =======================

const SUPABASE_URL = "https://klrjkwouiixybuyjglbj.supabase.co";
const SUPABASE_KEY = "sb_publishable_WUHY9m7PZETLbC9USMlJRg_9ur8Ijcb";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM ELEMENTS
const cover = document.getElementById("cover");
const app = document.getElementById("app");

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const topDate = document.getElementById("topDate");
const monthLabel = document.getElementById("monthLabel");

const calendarGrid = document.getElementById("calendarGrid");
const journalText = document.getElementById("journalText");

const saveJournal = document.getElementById("saveJournal");
const clearJournal = document.getElementById("clearJournal");

const addTaskBtn = document.getElementById("addTaskBtn");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

// =======================
//  LOGIN WITH GOOGLE
// =======================

loginBtn.addEventListener("click", async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "https://devarakonda72613.github.io/JOURNAL/"
    }
  });
});

// =======================
//  CHECK SESSION ON LOAD
// =======================
document.addEventListener("DOMContentLoaded", async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    startApp(session.user);
  } 
});

// =======================
//  START APP AFTER LOGIN
// =======================

async function startApp(user) {

  cover.style.display = "none";
  app.classList.remove("hidden");

  currentDate = new Date(2026, 0, 1);

  renderTopDate();
  renderCalendar();
  loadJournal();
  loadTasks();
}

// =======================
// CALENDAR & DATE SYSTEM
// =======================

let currentDate = new Date(2026, 0, 1);

function renderTopDate() {
  topDate.textContent = currentDate.toDateString();
}

document.getElementById("prevMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

function renderCalendar() {
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  monthLabel.textContent = currentDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric"
  });

  calendarGrid.innerHTML = "";

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    calendarGrid.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.classList.add("day");
    cell.textContent = day;

    cell.addEventListener("click", () => {
      currentDate.setDate(day);
      renderTopDate();
      loadJournal();
      loadTasks();
    });

    calendarGrid.appendChild(cell);
  }
}

// =======================
// JOURNAL FUNCTIONS
// =======================

async function loadJournal() {
  const dateStr = currentDate.toISOString().split("T")[0];

  const { data } = await supabase
    .from("journal_entries")
    .select("content")
    .eq("entry_date", dateStr)
    .single();

  journalText.value = data?.content || "";
}

saveJournal.addEventListener("click", async () => {
  const dateStr = currentDate.toISOString().split("T")[0];

  await supabase.from("journal_entries").upsert({
    entry_date: dateStr,
    content: journalText.value
  });

  alert("Journal saved!");
});

clearJournal.addEventListener("click", () => {
  journalText.value = "";
});

// =======================
// TASK FUNCTIONS
// =======================

async function loadTasks() {
  const dateStr = currentDate.toISOString().split("T")[0];

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("task_date", dateStr);

  taskList.innerHTML = "";

  tasks?.forEach(task => {
    const li = document.createElement("li");
    li.textContent = task.text;
    taskList.appendChild(li);
  });
}

addTaskBtn.addEventListener("click", async () => {
  const text = taskInput.value.trim();
  if (!text) return;

  const dateStr = currentDate.toISOString().split("T")[0];

  await supabase.from("tasks").insert({
    text,
    task_date: dateStr
  });

  taskInput.value = "";
  loadTasks();
});

// =======================
// LOGOUT
// =======================
logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  location.reload();
});

