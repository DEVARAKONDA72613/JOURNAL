document.addEventListener("DOMContentLoaded", () => {
  /* ================= MONTH BACKGROUNDS ================= */

  const monthBackgrounds = {
    0: "jan.jpg",
    1: "feb.jpg",
    2: "march.jpg",
    3: "aprl.jpg",
    4: "mat.jpg",
    5: "june.jpg",
    6: "july.jpg",
    7: "aug.jpg",
    8: "sept.jpg", // make sure spelling + case match your repo
    9: "oct.jpg",
    10: "nov.jpg",
    11: "dec.jpg",
  };

  /* ================= DOM ELEMENTS ================= */

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
  const monthBtn = document.getElementById("monthBtn");

  /* ================= DATES ================= */

  let currentDate = new Date("2026-01-01");
  let selectedDate = null; // cover mode initially

  // initial render
  updateWholeUI();

  /* ================= COVER BUTTONS ================= */

  function hideCover() {
    if (coverScreen) coverScreen.style.display = "none";
    if (!selectedDate) {
      selectedDate = new Date("2026-01-01");
      updateWholeUI();
    }
  }

  if (enterBtn) enterBtn.addEventListener("click", hideCover);
  if (monthBtn) monthBtn.addEventListener("click", hideCover);

  /* ================= MAIN UI UPDATE ================= */

  function updateWholeUI() {
    updateCalendar();

    if (!selectedDate) {
      if (backgroundDiv)
        backgroundDiv.style.backgroundImage = "url('cover.jpg')";
      if (currentDateDisplay)
        currentDateDisplay.textContent = "Welcome to your 2026 Journal";
      if (journalTitle) journalTitle.textContent = "Journal";
      if (journalEntry) journalEntry.value = "";
      if (tasksTitle) tasksTitle.textContent = "Tasks";
      if (taskList) taskList.innerHTML = "";
      return;
    }

    updateHeaderDate();
    updateBackground();
    loadJournal();
    loadTasks();
  }

  /* ================= HEADER DATE ================= */

  function updateHeaderDate() {
    if (!currentDateDisplay || !selectedDate) return;
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

  /* ================= BACKGROUND ================= */

  function updateBackground() {
    if (!backgroundDiv || !selectedDate) return;
    const month = selectedDate.getMonth();
    const img = monthBackgrounds[month];
    backgroundDiv.style.backgroundImage = `url('${img}')`;
  }

  /* ================= CALENDAR ================= */

  function updateCalendar() {
    if (!calendarGrid || !monthYearDisplay) return;

    calendarGrid.innerHTML = "";

    const year = 2026;
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString("default", { month: "long" });

    monthYearDisplay.textContent = `${monthName} 2026`;

    const firstDay = new Date(year, month, 1).getDay();
    const numDays = new Date(year, month + 1, 0).getDate();

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

    for (let day = 1; day <= numDays; day++) {
      const cell = document.createElement("div");
      cell.textContent = day;

      const thisDate = new Date(2026, month, day);
      if (
        selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === month
      ) {
        cell.classList.add("active");
      }

      cell.addEventListener("click", () => {
        selectedDate = thisDate;
        updateWholeUI();
      });

      calendarGrid.appendChild(cell);
    }
  }

  if (prevMonthBtn) {
    prevMonthBtn.addEventListener("click", () => {
      const m = currentDate.getMonth();
      if (m > 0) currentDate.setMonth(m - 1);
      updateWholeUI();
    });
  }

  if (nextMonthBtn) {
    nextMonthBtn.addEventListener("click", () => {
      const m = currentDate.getMonth();
      if (m < 11) currentDate.setMonth(m + 1);
      updateWholeUI();
    });
  }

  /* ================= JOURNAL ================= */

  function getDateKey() {
    return selectedDate ? selectedDate.toISOString().split("T")[0] : "";
  }

  function loadJournal() {
    if (!journalEntry || !journalTitle || !selectedDate) return;
    const key = "journal_" + getDateKey();
    journalEntry.value = localStorage.getItem(key) || "";
    journalTitle.textContent = `Journal for ${selectedDate.toDateString()}`;
  }

  if (saveJournalBtn) {
    saveJournalBtn.addEventListener("click", () => {
      if (!selectedDate || !journalEntry) return;
      const key = "journal_" + getDateKey();
      localStorage.setItem(key, journalEntry.value);
      alert("Journal saved!");
    });
  }

  if (clearJournalBtn) {
    clearJournalBtn.addEventListener("click", () => {
      if (!journalEntry) return;
      journalEntry.value = "";
    });
  }

  /* ================= TASKS ================= */

  function loadTasks() {
    if (!taskList || !tasksTitle || !selectedDate) return;

    const key = "tasks_" + getDateKey();
    const saved = JSON.parse(localStorage.getItem(key) || "[]");

    taskList.innerHTML = "";
    saved.forEach((task) => renderTask(task));

    tasksTitle.textContent = `Tasks for ${selectedDate.toDateString()}`;
  }

  function saveTasks() {
    if (!taskList || !selectedDate) return;
    const key = "tasks_" + getDateKey();
    const tasks = [];

    taskList.querySelectorAll("li").forEach((li) => {
      tasks.push({
        text: li.querySelector(".t-text").textContent,
        done: li.classList.contains("task-done"),
      });
    });

    localStorage.setItem(key, JSON.stringify(tasks));
  }

  function renderTask(task) {
    if (!taskList) return;

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

    del.addEventListener("click", (e) => {
      e.stopPropagation();
      li.remove();
      saveTasks();
    });

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(del);
    taskList.appendChild(li);
  }

  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", () => {
      if (!taskInput || taskInput.value.trim() === "" || !selectedDate) return;
      const newTask = { text: taskInput.value, done: false };
      renderTask(newTask);
      saveTasks();
      taskInput.value = "";
    });
  }
});
