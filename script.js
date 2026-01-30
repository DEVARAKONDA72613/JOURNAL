import { auth, provider } from "./firebase.js";
import {
  signInWithPopup,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supa = createClient(
  "https://klrjkwouixiybuyjglbj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtscmprd291aXhpeWJ1eWpnbGJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzE5MjAsImV4cCI6MjA4MDYwNzkyMH0.-sdXiwRf0mbA-3WYnddrQPQ2rwMNbOGP0oNziiIZBUE"
);

// DOM
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

// State
let currentUser = null;
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

const dateKey = (d) => d.toISOString().split("T")[0];

function updateHeader() {
  if (selectedDate) currentDateDisplay.textContent = selectedDate.toDateString();
}

function updateBackground() {
  if (!selectedDate) return;
  const img = monthImages[selectedDate.getMonth()];
  backgroundDiv.style.backgroundImage = `url('${img}')`;
}

// 🔐 AUTH
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    enterBtn.textContent = "Sign in with Google";
    enterBtn.onclick = async () => await signInWithPopup(auth, provider);
    return;
  }

  currentUser = { id: user.uid, email: user.email };
  enterBtn.textContent = "Enter 2026 Journal";
  enterBtn.onclick = () => coverScreen.classList.add("hide");

  selectedDate = new Date(2026, 0, 1);
  currentMonth = new Date(2026, 0, 1);

  renderCalendar();
  updateHeader();
  updateBackground();
  await loadJournal();
  await loadTasks();
});

// Calendar
function renderCalendar() {
  const year = 2026;
  const month = currentMonth.getMonth();
  monthYearDisplay.textContent = `${currentMonth.toLocaleString("en-US", {
    month: "long",
  })} 2026`;

  calendarGrid.innerHTML = "";

  ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].forEach((d) => {
    const el = document.createElement("div");
    el.textContent = d;
    el.classList.add("inactive");
    calendarGrid.appendChild(el);
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    calendarGrid.appendChild(document.createElement("div"));
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement("div");
    cell.textContent = d;
    const date = new Date(year, month, d);

    if (selectedDate?.toDateString() === date.toDateString()) {
      cell.classList.add("active");
    }

    cell.onclick = async () => {
      selectedDate = date;
      updateHeader();
      updateBackground();
      await loadJournal();
      await loadTasks();
      renderCalendar();
    };

    calendarGrid.appendChild(cell);
  }
}

prevMonthBtn.onclick = () => {
  if (currentMonth.getMonth() > 0) {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    renderCalendar();
  }
};

nextMonthBtn.onclick = () => {
  if (currentMonth.getMonth() < 11) {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    renderCalendar();
  }
};

// Journal
async function loadJournal() {
  const { data } = await supa
    .from("journal_entries")
    .select("content")
    .eq("user_id", currentUser.id)
    .eq("entry_date", dateKey(selectedDate))
    .maybeSingle();

  journalEntry.value = data?.content || "";
  journalTitle.textContent = `Journal for ${selectedDate.toDateString()}`;
}

saveJournalBtn.onclick = async () => {
  await supa.from("journal_entries").upsert({
    user_id: currentUser.id,
    entry_date: dateKey(selectedDate),
    content: journalEntry.value,
  });
  alert("Journal saved ✅");
};

clearJournalBtn.onclick = () => (journalEntry.value = "");

// Tasks
async function loadTasks() {
  const { data } = await supa
    .from("tasks")
    .select("*")
    .eq("user_id", currentUser.id)
    .eq("task_date", dateKey(selectedDate));

  taskList.innerHTML = "";
  data?.forEach(renderTask);
  tasksTitle.textContent = `Tasks for ${selectedDate.toDateString()}`;
}

function renderTask(task) {
  const li = document.createElement("li");
  if (task.done) li.classList.add("task-done");

  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.checked = task.done;
  cb.onchange = async () => {
    await supa.from("tasks").update({ done: cb.checked }).eq("id", task.id);
    li.classList.toggle("task-done", cb.checked);
  };

  const span = document.createElement("span");
  span.textContent = task.text;

  const del = document.createElement("span");
  del.textContent = "Delete";
  del.onclick = async () => {
    await supa.from("tasks").delete().eq("id", task.id);
    li.remove();
  };

  li.append(cb, span, del);
  taskList.appendChild(li);
}

addTaskBtn.onclick = async () => {
  if (!taskInput.value.trim()) return;
  const { data } = await supa
    .from("tasks")
    .insert({
      user_id: currentUser.id,
      task_date: dateKey(selectedDate),
      text: taskInput.value,
      done: false,
    })
    .select()
    .single();

  taskInput.value = "";
  renderTask(data);
};
