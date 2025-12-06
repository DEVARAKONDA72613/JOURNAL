/* ============================================================
   BACKGROUND IMAGES FOR MONTHS
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

/* ============================================================
   DATE SYSTEM (COVER FIRST)
============================================================ */

let currentDate = new Date("2026-01-01");
let selectedDate = null; // Show cover image initially

updateWholeUI();

/* ============================================================
   UPDATE ALL UI
============================================================ */

function updateWholeUI() {
    // If no date selected → show cover page
    if (!selectedDate) {
        backgroundDiv.style.backgroundImage = "url('cover.jpg')";
        currentDateDisplay.textContent = "Welcome to your 2026 Journal";
        monthYearDisplay.textContent = "Select a Month";
        calendarGrid.innerHTML = "";
        journalTitle.textContent = "Journal";
        journalEntry.value = "";
        tasksTitle.textContent = "Tasks";
        taskList.innerHTML = "";
        return;
    }

    updateHeaderDate();
    updateBackground();
    updateCalendar();
    loadJournal();
    loadTasks();
}

/* ============================================================
   HEADER DATE
============================================================ */

function updateHeaderDate() {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    currentDateDisplay.textContent = selectedDate.toLocaleDateString("en-US", options);
}

/* ============================================================
   BACKGROUND HANDLER
============================================================ */

function updateBackground() {
    const month = selectedDate.getMonth();
    const bgImage = monthBackgrounds[month];
    backgroundDiv.style.backgroundImage = `url('${bgImage}')`;
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

    // WEEKDAY HEADERS
    const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    weekdays.forEach(day => {
        const cell = document.createElement("div");
        cell.textContent = day;
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
    for (let day = 1; day <= numDays; day++) {
        const cell = document.createElement("div");
        cell.textContent = day;

        const thisDate = new Date(year, month, day);

        if (
            selectedDate &&
            thisDate.getDate() === selectedDate.getDate() &&
            thisDate.getMonth() === selectedDate.getMonth()
        ) {
            cell.classList.add("active");
        }

        cell.addEventListener("click", () => {
            selectedDate = new Date(year, month, day);
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
   JOURNAL SAVE / LOAD
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
    const key = "journal_" + getDateKey();
    localStorage.setItem(key, journalEntry.value);
    alert("Journal saved!");
});

clearJournalBtn.addEventListener("click", () => {
    journalEntry.value = "";
});

/* ============================================================
   TASKS SAVE / LOAD
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
   RENDER A TASK (WITH CHECKBOX)
============================================================ */

function renderTask(task) {
    const li = document.createElement("li");
    if (task.done) li.classList.add("task-done");

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done || false;
    checkbox.classList.add("task-checkbox");

    // Task text
    const textSpan = document.createElement("span");
    textSpan.textContent = task.text;
    textSpan.classList.add("t-text");

    // Delete button
    const deleteBtn = document.createElement("span");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("delete-btn");

    /* --- Events --- */

    checkbox.addEventListener("change", () => {
        li.classList.toggle("task-done");
        saveTasks();
    });

    deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        li.remove();
        saveTasks();
    });

    /* --- Build LI --- */

    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(deleteBtn);

    taskList.appendChild(li);
}

/* ============================================================
   ADD NEW TASK
============================================================ */

addTaskBtn.addEventListener("click", () => {
    if (taskInput.value.trim() === "") return;

    const newTask = { text: taskInput.value, done: false };
    renderTask(newTask);
    saveTasks();

    taskInput.value = "";
});
