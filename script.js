document.addEventListener("DOMContentLoaded", () => {
  // ---------- Month background mapping ----------
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

  // ---------- DOM refs ----------
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

  // ---------- Date state ----------
  let currentDate = new Date("2026-01-01"); // month shown in calendar
  let selectedDate = null; // nothing selected until cover is dismissed

  // ---------- Cover logic ----------
  function hideCover() {
    coverScreen.classList.add("hide");
    if (!selectedDate) {
      selectedDate = new Date("2026-01-01");
      updateAll();
    }
  }

  enterBtn.addEventListener("click", hideCover);

  // ---------- Main updater ----------
  function updateAll() {
    updateCalendar();
    if (!selectedDate) return;
    updateHeader();
    updateBackground();
    loadJournal();
    loadTasks();
    popCards();
  }

  function popCards() {
    // re-trigger animation class
    [calendarCard, journalCard, tasksCard].forEach(card => {
      if (!card) return;
      card.classList.remove("card-animate");
      // force reflow
      void card.offsetWidth;
      card.classList.add("card-animate");
    });
  }

  // ---------- Header ----------
  function updateHeader() {
    const options = {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    };
    currentDateDisplay.textContent = selectedDate.toLocaleDateString(
      "en-US",
      options
    );
  }

  // ---------- Background ----------
  function updateBackground() {
    const month = selectedDate.getMonth();
    const img = monthBackgrounds[month];
    backgroundDiv.style.backgroundImage = `url('${img}')`;
  }

  // ---------- Calendar ----------
  function updateCalendar() {
    calendarGrid.innerHTML = "";

    const year = 2026;
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString("default", { month: "long" });

    monthYearDisplay.textContent = `${monthName} 2026`;

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    weekdays.forEach((d) => {
      const cell = document.createElement("div");
      cell.textContent = d;
      cell.classList.add("inactive");
      calendarGrid.appendChild(cell);
    });

    // empty slots before first day
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement("div");
      empty.classList.add("inactive");
      calendarGrid.appendChild(empty);
    }

    // real days
    for (let day = 1; day <= totalDays; day++) {
      const cell = document.createElement("div");
      cell.textContent = day;

      const thisDate = new Date(2026, month, day);

      if (
        selectedDate &&
        thisDate.getDate() === selectedDate.getDate() &&
        thisDate.getMonth() === selectedDate.getMonth()
      ) {
        cell.classList.add("active");
      }

      cell.addEventListener("click", () => {
        selectedDate = thisDate;
        updateAll();
      });

      calendarGrid.appendChild(cell);
    }
  }

  prevMonthBtn.addEventListener("click", () => {
    const m = currentDate.getMonth();
    if (m > 0) {
      currentDate.setMonth(m - 1);
      updateAll();
    }
  });

  nextMonthBtn.addEventListener("click", () => {
    const m = currentDate.getMonth();
    if (m < 11) {
      currentDate.setMonth(m + 1);
      updateAll();
    }
  });

  // ---------- Journal ----------
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
    alert("Journal saved!");
  });

  clearJournalBtn.addEventListener("click", () => {
    journalEntry.value = "";
  });

  // ---------- Tasks ----------
  function loadTasks() {
    const key = "tasks_" + dateKey();
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    taskList.innerHTML = "";
    saved.forEach(renderTask);
    tasksTitle.textContent = `Tasks for ${selectedDate.toDateString()}`;
  }

  function saveTasks() {
    const key = "tasks_" + dateKey();
    const tasks = [];
    document.querySelectorAll("#taskList li").forEach((li) => {
      tasks.push({
        text: li.querySelector(".t-text").textContent,
        done: li.classList.contains("task-done"),
      });
    });
    localStorage.setItem(key, JSON.stringify(tasks));
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

    checkbox.addEventListener("change", () => {
      li.classList.toggle("task-done");
      saveTasks();
    });

    del.addEventListener("click", (e) => {
      e.stopPropagation();
      li.remove();
      saveTasks();
    });

    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(del);
    taskList.appendChild(li);
  }

  addTaskBtn.addEventListener("click", () => {
    if (!selectedDate) return;
    if (taskInput.value.trim() === "") return;

    const task = { text: taskInput.value.trim(), done: false };
    renderTask(task);
    saveTasks();
    taskInput.value = "";
  });

  // initial render (calendar only – cover still visible)
  updateCalendar();
});
