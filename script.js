// ======================
// SUPABASE INIT
// ======================
const supabase = supabase.createClient(
  "https://klrjkwouiixybuyjglbj.supabase.co",
  "sb_publishable_WUHY9m7PZETLbC9USMlJRg_9ur8Ijcb"
);

// ======================
// ELEMENT LOOKUP
// ======================
const coverScreen = document.getElementById("coverScreen");
const enterBtn = document.getElementById("enterBtn");

const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

const calendarGrid = document.getElementById("calendarGrid");
const monthYearDisplay = document.getElementById("monthYear");

const journalEntry = document.getElementById("journalEntry");
const saveJournalBtn = document.getElementById("saveJournal");
const clearJournalBtn = document.getElementById("clearJournal");

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTask");
const taskList = document.getElementById("taskList");

const currentDateDisplay = document.getElementById("currentDate");
const backgroundDiv = document.getElementById("background");

// ======================
// CHECK ALL ELEMENTS EXIST
// ======================
function checkIDs() {
  const required = {
    enterBtn,
    prevMonthBtn,
    nextMonthBtn,
    saveJournalBtn,
    clearJournalBtn,
    addTaskBtn,
    journalEntry,
    calendarGrid,
    monthYearDisplay,
    taskInput,
    taskList,
    currentDateDisplay
  };

  for (const [name, elem] of Object.entries(required)) {
    if (!elem) console.error("❌ Missing element ID:", name);
  }
}
checkIDs();

// ======================
// LOGIN FLOW
// ======================
async function ensureLogin() {
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    console.log("🔐 Logging in with Google...");
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href }
    });
  }
}

document.addEventListener("DOMContentLoaded", ensureLogin);

// ======================
// COVER BUTTON
// ======================
if (enterBtn) {
  enterBtn.addEventListener("click", () => {
    coverScreen.style.display = "none";
  });
}

// ======================
// STATE
// ======================
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
 11: "dec.jpg"
};

// ======================
// HELPER FUNCTIONS
// ======================
function dateKey(d) {
  return d.toISOString().split("T")[0];
}

function updateHeader() {
  if (selectedDate) {
    currentDateDisplay.textContent = selectedDate.toDateString();
  }
}

function updateBackground() {
  if (selectedDate) {
    backgroundDiv.style.backgroundImage =
      `url('${monthImages[selectedDate.getMonth()]}')`;
  }
}

// ======================
// CALENDAR RENDER
// ======================
function renderCalendar() {
  const month = currentMonth.getMonth();
  const year = currentMonth.getFullYear();

  monthYearDisplay.textContent = 
    currentMonth.toLocaleString("en-US", { month: "long", year: "numeric" });

  calendarGrid.innerHTML = "";

  ["SUN","MON","TUE","WED","THU","FRI","SAT"].forEach(d => {
    const cell = document.createElement("div");
    cell.textContent = d;
    cell.classList.add("inactive");
    calendarGrid.appendChild(cell);
  });

  const firstDay = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.classList.add("inactive");
    calendarGrid.appendChild(empty);
  }

  for (let d = 1; d <= days; d++) {
    const cell = document.createElement("div");
    cell.textContent = d;

    const dateObj = new Date(year, month, d);

    if (selectedDate && dateObj.toDateString() === selectedDate.toDateString()) {
      cell.classList.add("active");
    }

    cell.addEventListener("click", () => {
      selectedDate = dateObj;
      updateHeader();
      updateBackground();
      loadJournal();
      loadTasks();
      renderCalendar();
    });

    calendarGrid.appendChild(cell);
  }
}

// ======================
// MONTH BUTTONS
// ======================
if (prevMonthBtn) {
  prevMonthBtn.addEventListener("click", () => {
    if (currentMonth.getMonth() > 0) {
      currentMonth.setMonth(currentMonth.getMonth() - 1);
      renderCalendar();
    }
  });
}

if (nextMonthBtn) {
  nextMonthBtn.addEventListener("click", () => {
    if (currentMonth.getMonth() < 11) {
      currentMonth.setMonth(currentMonth.getMonth() + 1);
      renderCalendar();
    }
  });
}

// ======================
// JOURNAL LOAD/SAVE
// ======================
async function loadJournal() {
  if (!selectedDate) return;

  const { data } = await supabase
    .from("journal_entries")
    .select("content")
    .eq("entry_date", dateKey(selectedDate))
    .maybeSingle();

  journalEntry.value = data?.content || "";
}

if (saveJournalBtn) {
  saveJournalBtn.addEventListener("click", async () => {
    if (!selectedDate) return;

    await supabase.from("journal_entries").upsert({
      entry_date: dateKey(selectedDate),
      content: journalEntry.value
    });

    alert("Saved!");
  });
}

if (clearJournalBtn) {
  clearJournalBtn.addEventListener("click", () => {
    journalEntry.value = "";
  });
}

// ======================
// TASK HANDLING
// ======================
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
}

if (addTaskBtn) {
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
}

// ======================
renderCalendar();
