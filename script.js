/* ============================================================
   MONTH BACKGROUND IMAGES
============================================================ */

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
    11: "dec.jpg"
};

/* ============================================================
   DOM ELEMENTS
============================================================ */

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

/* ============================================================
   DATE SYSTEM
============================================================ */

// Start with cover screen active
let currentDate = new Date("2026-01-01");
let selectedDate = null;

// Initialize UI
updateWholeUI();

/* ============================================================
   COVER SCREEN BUTTONS
============================================================ */

enterBtn.addEventListener("click", () => {
    coverScreen.style.display = "none";
});

monthBtn.addEventListener("click", () => {
    coverScreen.style.display = "none";
});

/* ============================================================
   MAIN UI UPDATER
============================================================ */

function updateWholeUI() {
    // Calendar always visible
    updateCalendar();

    // Cover mode → nothing selected
    if (!selectedDate) {
        backgroundDiv.style.backgroundImage = "url('cover.jpg')";
        currentDateDisplay.textContent = "Welcome to your 2026 Journal";
        journalTitle.textContent = "Journal";
        journalEntry.value = "";
        tasksTitle.textContent = "Tasks";
        taskList.innerHTML = "";
        return;
    }

    updateHeaderDate();
    updateBackground();
    loadJournal();
    loadTasks();
}

/* ============================================================
   HEADER DATE
============================================================ */

function updateHeaderDate() {
    const options = { weekday: "long", month: "long", day: "numeric", year: "numeric" };
    currentDateDisplay.textContent = selectedDate.toLocaleDateString("en-US", options);
}

/* ============================================================
   BACKGROUND SWITCHING
============================================================ */

function updateBackground() {
    const month = selectedDate.getMonth();
    backgroundDiv.style.backgroundImage = `url('${monthBackgrounds[month]}')`;
}

/* ============================================================
   CALENDAR BUILDER
============================================================ */

function updateCalendar() {
    calendarGrid.innerHTML = "";

    const year = 2026;
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString("default", { month: "long" });

    monthYearDisplay.textContent = `${monthName} 2026`;

    const firstDay = new Date(year, month, 1).getDay();
    const numDays = new Date(year, month + 1, 0).getDate();

    // Weekdays
    const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    weekdays.forEach(d => {
        const cell = document.createElement("div");
        cell.textContent = d;
        cell.classList.add("inactive");
        calendarGrid.appendChild(cell);
    });

    // Empty slots before first day
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.classList.add("inactive");
        calendarGrid.appendChild(empty);
    }

    // Actual days
    for (let d = 1; d <= numDays; d++) {
        const cell = document.createElement("div");
        cell.textContent = d;

        const thisDate = new Date(2026, month, d);

        if (
            selectedDate &&
            selectedDate.getDate() === d &&
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

/* ============================================================
   MONTH SWITCHING
============================================================ */

prevMonthBtn.addEventListener("click", () => {
    const m = currentDate.getMonth();
    if (m > 0) currentDate.setMonth(m - 1);
    updateWholeUI();
});

nextMonthBtn.addEventListener("click", () => {
    const m = currentDate.getMonth();
    if (m < 11) currentDate.setMonth(m + 1);
    updateWholeUI();
});

/* ============================================================
   JOURNAL STORAGE
============================================================ */

function getDateKey() {
    return selectedDate.toISOString().split("T")[0];
}

function loadJournal() {
    const key = "journal_" + getDateKey();
    journalEntry.value = localStorage.getItem(key) || "";
    journalTitle.textContent = `Journal for ${selectedDate.toDateString()}`;
}

saveJournalBtn.addEventListener("click", () => {
    localStorage.setItem("journal_" + getDateKey(), journalEntry.value);
    alert("Journal saved!");
});

clearJournalBtn.addEventListener("click", () => {
    journalEntry.value = "";
});

/* ============================================================
   TASKS STORAGE
============================================================ */

function loadTasks() {
    const key = "tasks_" + getDateKey();
    const saved = JSON.parse(localStorage.getItem(key) || "[]");

    taskList.innerHTML = "";
    saved.forEach(task => renderTask(task));

    tasksTitle.textContent = `Tasks for ${selectedDate.toDateString()}`;
}

function saveTasks() {
    const key = "tasks_" + getDateKey();
    const tasks = [];

    document.querySelectorAll("#taskList li").forEach(li => {
        tasks.push({
            text: li.querySelector(".t-text").textContent,
            done: li.classList.contains("task-done")
        });
    });

    localStorage.setItem(key, JSON.stringify(tasks));
}

/* ============================================================
   TASK RENDERING WITH CHECKBOX
============================================================ */

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

/* ADD TASK */

addTaskBtn.addEventListener("click", () => {
    if (taskInput.value.trim() === "") return;

    const newTask = { text: taskInput.value, done: false };
    renderTask(newTask);
    saveTasks();
    taskInput.value = "";
});
