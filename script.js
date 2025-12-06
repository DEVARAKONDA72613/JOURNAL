/* ============================
   MONTH BACKGROUND IMAGES
============================ */

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

/* ============================
   DOM ELEMENTS
============================ */

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

/* ============================
   INITIAL DATE SETUP (2026 ONLY)
============================ */

let currentDate = new Date("2026-12-01");
let selectedDate = new Date("2026-12-01");

updateWholeUI();

/* ============================
   FUNCTION: UPDATE EVERYTHING
============================ */

function updateWholeUI() {
    updateHeaderDate();
    updateBackground();
    updateCalendar();
    loadJournal();
    loadTasks();
}

/* ============================
   HEADER DATE
============================ */

function updateHeaderDate() {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    currentDateDisplay.textContent = selectedDate.toLocaleDateString("en-US", options);
}

/* ============================
   BACKGROUND UPDATER
============================ */

function updateBackground() {
    const month = selectedDate.getMonth();
    const bgImage = monthBackgrounds[month];
    backgroundDiv.style.backgroundImage = `url('${bgImage}')`;
}

/* ============================
   BUILD CALENDAR GRID
============================ */

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

    // Empty cells before the 1st day
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.classList.add("inactive");
        calendarGrid.appendChild(emptyCell);
    }

    // Actual days
    for (let day = 1; day <= numDays; day++) {
        const cell = document.createElement("div");
        cell.textContent = day;

        const thisDate = new Date(year, month, day);

        // Highlight selected day
        if (
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

/* ============================
   MONTH SWITCHING
============================ */

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

/* ============================
   JOURNAL SAVE + LOAD
============================ */

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

/* ============================
   TASKS SAVE + LOAD
============================ */

function loadTasks() {
    const key = "tasks_" + getDateKey();
    const saved = JSON.parse(localStorage.getItem(key) || "[]");

    taskList.innerHTML = "";
    saved.forEach((t, index) => renderTask(t, index));
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

function renderTask(task, index) {
    const li = document.createElement("li");
    if (task.done) li.classList.add("task-done");

    const textSpan = document.createElement("span");
    textSpan.textContent = task.text;
    textSpan.classList.add("t-text");

    const deleteBtn = document.createElement("span");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("delete-btn");

    li.appendChild(textSpan);
    li.appendChild(deleteBtn);

    // Toggle done
    li.addEventListener("click", () => {
        li.classList.toggle("task-done");
        saveTasks();
    });

    // Delete
    deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        li.remove();
        saveTasks();
    });

    taskList.appendChild(li);
}

addTaskBtn.addEventListener("click", () => {
    if (taskInput.value.trim() === "") return;

    const task = { text: taskInput.value, done: false };
    renderTask(task);
    saveTasks();

    taskInput.value = "";
});
