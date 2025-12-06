// ---------------------------
// Supabase Client
// ---------------------------
const supa = supabase.createClient(
  "https://klrjkwouixiybuyjglbj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtscmprd291aXhpeWJ1eWpnbGJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzE5MjAsImV4cCI6MjA4MDYwNzkyMH0.-sdXiwRf0mbA-3WYnddrQPQ2rwMNbOGP0oNziiIZBUE"
);

// Your GitHub Pages URL:
const REDIRECT = "https://devarakonda72613.github.io/JOURNAL/";

// HTML refs
const loginScreen = document.getElementById("login-screen");
const loginBtn = document.getElementById("login-btn");
const app = document.getElementById("app");

const monthTitle = document.getElementById("month-title");
const calendarGrid = document.getElementById("calendar-grid");

const journalTitle = document.getElementById("journal-title");
const journalText = document.getElementById("journal-text");

const tasksTitle = document.getElementById("tasks-title");
const taskInput = document.getElementById("new-task-input");
const taskList = document.getElementById("task-list");

// Calendar state
let currentDate = new Date(2026, 0, 1); // Start in 2026
let selectedDate = new Date(2026, 0, 1);
let user = null;

// ---------------------------
// LOGIN HANDLER
// ---------------------------
loginBtn.addEventListener("click", async () => {
  await supa.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: REDIRECT
    }
  });
});

// ---------------------------
// ON PAGE LOAD — CHECK SESSION
// ---------------------------
async function initApp() {
  const { data } = await supa.auth.getSession();

  if (!data.session) {
    console.log("Not logged in");
    app.style.display = "none";
    loginScreen.style.display = "flex";
    return;
  }

  user = data.session.user;

  // Show app
  loginScreen.style.display = "none";
  app.style.display = "block";

  loadCalendar();
  updateScreen();
  loadJournal();
  loadTasks();
}

window.onload = initApp;

// ---------------------------
// CALENDAR BUILDING
// ---------------------------
function loadCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthTitle.textContent = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric"
  });

  calendarGrid.innerHTML = "";

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "empty-day";
    calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const div = document.createElement("div");
    div.className = "day";
    div.textContent = day;

    div.addEventListener("click", () => {
      selectedDate = new Date(year, month, day);
      updateScreen();
      loadJournal();
      loadTasks();
    });

    if (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    ) {
      div.classList.add("active");
    }

    calendarGrid.appendChild(div);
  }
}

document.getElementById("prev-month").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  loadCalendar();
};

document.getElementById("next-month").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  loadCalendar();
};

// ---------------------------
// UPDATE TITLES
// ---------------------------
function updateScreen() {
  const dateStr = selectedDate.toDateString();
  journalTitle.textContent = `Journal for ${dateStr}`;
  tasksTitle.textContent = `Tasks for ${dateStr}`;
}

// ---------------------------
// JOURNAL: LOAD / SAVE / CLEAR
// ---------------------------
async function loadJournal() {
  const dateISO = selectedDate.toISOString().split("T")[0];

  const { data } = await supa
    .from("journal_entries")
    .select("*")
    .eq("user_id", user.id)
    .eq("entry_date", dateISO)
    .single();

  journalText.value = data?.content || "";
}

document.getElementById("save-journal").onclick = async () => {
  const dateISO = selectedDate.toISOString().split("T")[0];

  await supa.from("journal_entries")
    .upsert({
      user_id: user.id,
      entry_date: dateISO,
      content: journalText.value
    });

  alert("Saved!");
};

document.getElementById("clear-journal").onclick = () => {
  journalText.value = "";
};

// ---------------------------
// TASKS
// ---------------------------
async function loadTasks() {
  const dateISO = selectedDate.toISOString().split("T")[0];

  const { data } = await supa
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .eq("task_date", dateISO);

  taskList.innerHTML = "";

  data?.forEach(t => {
    const li = document.createElement("li");
    li.innerHTML = `
      <input type="checkbox" ${t.done ? "checked" : ""} />
      <span>${t.text}</span>
    `;
    li.querySelector("input").onchange = async () => {
      await supa.from("tasks")
        .update({ done: !t.done })
        .eq("id", t.id);
    };
    taskList.appendChild(li);
  });
}

document.getElementById("add-task").onclick = async () => {
  const text = taskInput.value.trim();
  if (!text) return;

  const dateISO = selectedDate.toISOString().split("T")[0];

  await supa.from("tasks").insert({
    user_id: user.id,
    task_date: dateISO,
    text: text
  });

  taskInput.value = "";
  loadTasks();
};
