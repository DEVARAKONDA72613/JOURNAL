// ==================== SUPABASE CLIENT ====================
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/esm/supabase.min.js";

const supabase = createClient(
  "https://klrjkwouiixybuyjglbj.supabase.co",
  "sb_publishable_WUHY9m7PZETLbC9USMlJRg_9ur8Ijcb"
);

// ==================== DOM ELEMENTS ====================
const coverScreen = document.getElementById("coverScreen");
const enterBtn = document.getElementById("enterBtn");

const currentDateDisplay = document.getElementById("currentDate");
const monthYearDisplay = document.getElementById("monthYear");
const calendarGrid = document.getElementById("calendarGrid");

const journalEntry = document.getElementById("journalEntry");
const saveJournalBtn = document.getElementById("saveJournal");
const clearJournalBtn = document.getElementById("clearJournal");
const journalTitle = document.getElementById("journalTitle");

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTask");
const taskList = document.getElementById("taskList");
const tasksTitle = document.getElementById("tasksTitle");

const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

const backgroundDiv = document.getElementById("background");

// ==================== STATE ====================
let selectedDate = null;
let currentMonth = new Date(2026, 0, 1);

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

// ==================== AUTH ====================
async function ensureLogin() {
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href }
    });
  }
}

document.addEventListener("DOMContentLoaded", ensureLogin);

// ==================== COVER BUTTON ====================
enterBtn.addEventListener("click", () => {
  coverScreen.classList.add("hide");
});

// ==================== DATE HELPERS ====================
function dateKey(date) {
  return date.toISOString().split("T")[0];
}

function updateHeader() {
  if (!selectedDate) return;
  currentDateDisplay.textContent = selectedDate.toDateString();
}

function updateBackground() {
  if (!selectedDate) return;
  backgroundDiv.style.backgroundImage =
    `url('${monthImages[selectedDate.getMonth()]}')`;
}

// ==================== CALENDAR ====================
function renderCalendar() {
  const month = currentMonth.getMonth();
  const year = currentMonth.getFullYear();

  monthYearDisplay.textContent =
    currentMonth.toLocaleString("en-US", { month: "long", year: "numeric" });

  calendarGrid.innerHTML = "";

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < 7; i++) {
    const day = document.createElement("div");
    day.textContent = ["SUN","MON","TUE","WED","THU","FRI","SAT"][i];
    day.classList.add("inactive");
    calendarGrid.appendChild(day);
  }

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.classList.add("inactive");
    calendarGrid.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement("div");
    cell.textContent = d;

    const thisDate = new Date(year, month, d);

    if (
      selectedDate &&
      thisDate.toDateString() === selectedDate.toDateString()
    ) {
      cell.classList.add("active");
    }

    cell.addEventListener("click", () => {
      selectedDate = thisDate;
      updateHeader();
      updateBackground();
      loadJournal();
      loadTasks();
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

// ==================== JOURNAL ====================
async function loadJournal() {
  if (!selectedDate) return;

  const { data } = await supabase
    .from("journal_entries")
    .select("content")
    .eq("entry_date", dateKey(selectedDate))
    .maybeSingle();

  journalEntry.value = data?.content || "";
  journalTitle.textContent = 
    `Journal for ${selectedDate.toDateString()}`;
}

saveJournalBtn.addEventListener("click", async () => {
  if (!selectedDate) return;

  await supabase.from("journal_entries").upsert({
    entry_date: dateKey(selectedDate),
    content: journalEntry.value
  });

  alert("Saved!");
});

clearJournalBtn.addEventListener("click", () => {
  journalEntry.value = "";
});

// ==================== TASKS ====================
async function loadTasks() {
  if (!selectedDate) return;

  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("task_date", dateKey(selectedDate));

  taskList.innerHTML = "";

  (data || []).forEach(task => {
    const li = document.createElement("li");
    li.textContent = task.text;
    taskList.appendChild(li);
  });

  tasksTitle.textContent =
    `Tasks for ${selectedDate.toDateString()}`;
}

addTaskBtn.addEventListener("click", async () => {
  if (!selectedDate) return;
  if (!taskInput.value.trim()) return;

  await supabase.from("tasks").insert({
    text: taskInput.value.trim(),
    task_date: dateKey(selectedDate)
  });

  taskInput.value = "";
  loadTasks();
});

// ==================== INITIALIZE ====================
renderCalendar();
