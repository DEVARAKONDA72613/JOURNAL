document.addEventListener("DOMContentLoaded", () => {
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

  let currentDate = new Date("2026-01-01");
  let selectedDate = null;

  function hideCover() {
    coverScreen.style.display = "none";
    selectedDate = new Date("2026-01-01");
    updateAll();
  }

  enterBtn.addEventListener("click", hideCover);

  function updateAll() {
    updateCalendar();
    if (!selectedDate) return;
    updateHeader();
    updateBackground();
    loadJournal();
    loadTasks();
  }

  function updateHeader() {
    const opts = { weekday: "long", month: "long", day: "numeric", year: "numeric" };
    currentDateDisplay.textContent = selectedDate.toLocaleDateString("en-US", opts);
  }

  function updateBackground() {
    const month = selectedDate.getMonth();
    backgroundDiv.style.backgroundImage = `url('${monthBackgrounds[month]}')`;
  }

  function updateCalendar() {
    calendarGrid.innerHTML = "";
    const m = currentDate.getMonth();
    const year = 2026;

    monthYearDisplay.textContent = currentDate.toLocaleString("default", { month: "long" }) + " 2026";

    const firstDay = new Date(year, m, 1).getDay();
    const totalDays = new Date(year, m + 1, 0).getDate();

    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    days.forEach(d => {
      const el = document.createElement("div");
      el.textContent = d;
      el.classList.add("inactive");
      calendarGrid.appendChild(el);
    });

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement("div");
      empty.classList.add("inactive");
      calendarGrid.appendChild(empty);
    }

    for (let d = 1; d <= totalDays; d++) {
      const el = document.createElement("div");
      el.textContent = d;

      const thisDate = new Date(2026, m, d);

      if (selectedDate &&
          selectedDate.getDate() === d &&
          selectedDate.getMonth() === m) {
        el.classList.add("active");
      }

      el.addEventListener("click", () => {
        selectedDate = thisDate;
        updateAll();
      });

      calendarGrid.appendChild(el);
    }
  }

  prevMonthBtn.addEventListener("click", () => {
    if (currentDate.getMonth() > 0) {
      currentDate.setMonth(currentDate.getMonth() - 1);
      updateAll();
    }
  });

  nextMonthBtn.addEventListener("click", () => {
    if (currentDate.getMonth() < 11) {
      currentDate.setMonth(currentDate.getMonth() + 1);
      updateAll();
    }
  });

  function dateKey() {
    return selectedDate.toISOString().split("T")[0];
  }

  function loadJournal() {
    const key = "journal_" + dateKey();
    journalEntry.value = localStorage.getItem(key) || "";
    journalTitle.textContent = `Journal for ${selectedDate.toDateString()}`;
  }

  saveJournalBtn.addEventListener("click", () => {
    localStorage.setItem("journal_" + dateKey(), journalEntry.value);
    alert("Saved!");
  });

  clearJournalBtn.addEventListener("click", () => {
    journalEntry.value = "";
  });

  function loadTasks() {
    const key = "tasks_" + dateKey();
    const tasks = JSON.parse(localStorage.getItem(key) || "[]");
    taskList.innerHTML = "";
    tasks.forEach(renderTask);
    tasksTitle.textContent = `Tasks for ${selectedDate.toDateString()}`;
  }

  function saveTasks() {
    const items = [];
    document.querySelectorAll("#taskList li").forEach(li => {
      items.push({
        text: li.querySelector(".t-text").textContent,
        done: li.classList.contains("task-done"),
      });
    });
    localStorage.setItem("tasks_" + dateKey(), JSON.stringify(items));
  }

  function renderTask(task) {
    const li = document.createElement("li");

    if (task.done) li.classList.add("task-done");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.classList.add("task-checkbox");

    const text = document.createElement("span");
    text.textContent = task.text;
    text.classList.add("t-text");

    const del = document.createElement("span");
    del.textContent = "Delete";
    del.classList.add("delete-btn");

    checkbox.addEventListener("change", () => {
      li.classList.toggle("task-done");
      saveTasks();
    });

    del.addEventListener("click", () => {
      li.remove();
      saveTasks();
    });

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(del);
    taskList.appendChild(li);
  }

  addTaskBtn.addEventListener("click", () => {
    if (taskInput.value.trim() === "") return;
    const newT = { text: taskInput.value, done: false };
    renderTask(newT);
    saveTasks();
    taskInput.value = "";
  });
});
