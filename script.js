// ========== Supabase setup ==========
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/esm/supabase.min.js";

const SUPABASE_URL = "https://klrjkwouixiybuyjglbj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_WUHY9m7PZETLbC9USMlJRg_9ur8Ijcb";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// ========== App logic ==========
document.addEventListener("DOMContentLoaded", () => {
  /* ===== Month backgrounds ===== */
  const monthBackgrounds = {
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

  /* ===== DOM ===== */
  const backgroundDiv = document.getElementById("background");
  const currentDateDisplay = document.getElementById("currentDate");
  const monthYearDisplay = document.getElementById("monthYear");
  const calendarGrid = document.getElementById("calendarGrid");

  const journalEntry = document.getElementById("journalEntry");
  const saveJournalBtn = document.getElementById("saveJournal");
  const clearJournalBtn = document.getElementById("clearJournal");
  const journalTitle = document.getElementById("journalTitle");

  const tasksTitle = document.getElementById("tasksTitle");
  const taskInput = document.getElementById("taskInput");
  const addTaskBtn = document.getElementById("addTask");
  const taskList = document.getElementById("taskList");

  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");

  const coverScreen = document.getElementById("coverScreen");
  const enterBtn = document.getElementById("enterBtn");

  const calendarCard = document.getElementById("calendarCard");
  const journalCard = document.getElementById("journalCard");
  const tasksCard = document.getElementById("tasksCard");

  /* ===== Date state ===== */
  let currentDate = new Date("2026-01-01"); // month shown in calendar
  let selectedDate = null;                  // actual selected day

  /* ===== Auth helpers ===== */
  async function getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("getUser error:", error);
      return null;
    }
    return data.user;
  }

  async function requireAuth() {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      // No session → trigger Google login
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.href,
        },
      });
      if (error) console.error("OAuth error:", error);
      return false;
    }

    return true;
  }

  /* ===== Initialization ===== */
  async function initApp() {
    const authed = await requireAuth();
    if (!authed) return;

    // Logged in → show calendar, wait for cover click
    updateCalendar();
  }

  // Cover "Enter" click
  enterBtn.addEventListener("click", async () => {
    coverScreen.classList.add("hide");
    if (!selectedDate) {
      selectedDate = new Date("2026-01-01");
    }
    await updateAll();
  });

  /* ===== Shared helpers ===== */
  function dateKey() {
    return selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD
  }

  async function updateAll() {
    updateCalendar();
    if (!selectedDate) return;
    updateHeader();
    updateBackground();
    await loadJournal();
    await loadTasks();
    popCards();
  }

  function popCards() {
    [calendarCard, journalCard, tasksCard].forEach((card) => {
      if (!card) return;
      card.classList.remove("card-animate");
      void card.offsetWidth;
      card.classList.add("card-animate");
    });
  }

  function updateHeader() {
    const opts = {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    };
    currentDateDisplay.textContent = selectedDate.toLocaleDateString(
      "en-US",
      opts
    );
  }

  function updateBackground() {
    const month = selectedDate.getMonth();
    const img = monthBackgrounds[month];
    backgroundDiv.style.backgroundImage = `url('${img}')`;
  }

  /* ===== Calendar ===== */
  function updateCalendar() {
    calendarGrid.innerHTML = "";

    const year = 2026;
    const m = currentDate.getMonth();
    const monthName = currentDate.toLocaleString("default", { month: "long" });

    monthYearDisplay.textContent = `${monthName} 2026`;

    const firstDay = new Date(year, m, 1).getDay();
    const totalDays = new Date(year, m + 1, 0).getDate();

    const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    weekdays.forEach((d) => {
      const cell = document.createElement("div");
      cell.textContent = d;
      cell.classList.add("inactive");
      calendarGrid.appendChild(cell);
    });

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement("div");
      empty.classList.add("inactive");
      calendarGrid.appendChild(empty);
    }

    for (let day = 1; day <= totalDays; day++) {
      const cell = document.createElement("div");
      cell.textContent = day;

      const thisDate = new Date(2026, m, day);

      if (
        selectedDate &&
        thisDate.getDate() === selectedDate.getDate() &&
        thisDate.getMonth() === selectedDate.getMonth()
      ) {
        cell.classList.add("active");
      }

      cell.addEventListener("click", async () => {
        selectedDate = thisDate;
        await updateAll();
      });

      calendarGrid.appendChild(cell);
    }
  }

  prevMonthBtn.addEventListener("click", async () => {
    const m = currentDate.getMonth();
    if (m > 0) {
      currentDate.setMonth(m - 1);
      await updateAll();
    }
  });

  nextMonthBtn.addEventListener("click", async () => {
    const m = currentDate.getMonth();
    if (m < 11) {
      currentDate.setMonth(m + 1);
      await updateAll();
    }
  });

  /* ===== Journal (Supabase) ===== */
  async function loadJournal() {
    const user = await getCurrentUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("journal_entries")
      .select("content")
      .eq("user_id", user.id)
      .eq("entry_date", dateKey())
      .maybeSingle();

    if (error) {
      console.error("loadJournal error:", error);
      journalEntry.value = "";
    } else {
      journalEntry.value = data?.content || "";
    }

    journalTitle.textContent = `Journal for ${selectedDate.toDateString()}`;
  }

  saveJournalBtn.addEventListener("click", async () => {
    const user = await getCurrentUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      entry_date: dateKey(),
      content: journalEntry.value,
    };

    const { error } = await supabase
      .from("journal_entries")
      .upsert(payload, { onConflict: "user_id,entry_date" });

    if (error) {
      console.error("saveJournal error:", error);
      alert("Could not save (check console).");
    } else {
      alert("Journal saved to cloud ✅");
    }
  });

  clearJournalBtn.addEventListener("click", () => {
    journalEntry.value = "";
  });

  /* ===== Tasks (Supabase) ===== */
  async function loadTasks() {
    const user = await getCurrentUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("tasks")
      .select("id, text, done")
      .eq("user_id", user.id)
      .eq("task_date", dateKey())
      .order("id", { ascending: true });

    if (error) {
      console.error("loadTasks error:", error);
      taskList.innerHTML = "";
      return;
    }

    taskList.innerHTML = "";
    (data || []).forEach(renderTask);

    tasksTitle.textContent = `Tasks for ${selectedDate.toDateString()}`;
  }

  async function saveTasks() {
    const user = await getCurrentUser();
    if (!user) return;

    const items = [];
    document.querySelectorAll("#taskList li").forEach((li) => {
      items.push({
        user_id: user.id,
        task_date: dateKey(),
        text: li.querySelector(".t-text").textContent,
        done: li.classList.contains("task-done"),
      });
    });

    const { error: delErr } = await supabase
      .from("tasks")
      .delete()
      .eq("user_id", user.id)
      .eq("task_date", dateKey());

    if (delErr) {
      console.error("delete tasks error:", delErr);
      return;
    }

    if (items.length > 0) {
      const { error: insErr } = await supabase
        .from("tasks")
        .insert(items);
      if (insErr) console.error("insert tasks error:", insErr);
    }
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
      li.classList.toggle("task-done");
      await saveTasks();
    });

    del.addEventListener("click", async (e) => {
      e.stopPropagation();
      li.remove();
      await saveTasks();
    });

    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(del);
    taskList.appendChild(li);
  }

  addTaskBtn.addEventListener("click", async () => {
    if (!selectedDate) return;
    if (taskInput.value.trim() === "") return;

    const t = { text: taskInput.value.trim(), done: false };
    renderTask(t);
    await saveTasks();
    taskInput.value = "";
  });

  // START APP
  initApp();
});
