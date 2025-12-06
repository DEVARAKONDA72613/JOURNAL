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

/* ============================================================
   DATE SYSTEM
============================================================ */

let currentDate = new Date("2026-01-01");
let selectedDate = null; // COVER MODE initially

updateWholeUI();

/* ============================================================
   UPDATE WHOLE UI
============================================================ */

function updateWholeUI() {
    updateCalendar(); // ALWAYS SHOW CALENDAR

    if (!selectedDate) {
        // Cover page mode
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
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    currentDateDisplay.textContent = selectedDate.toLocaleDateString("en-US", options);
}

/* ============================================================
   BACKGROUND SWITCH
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

    // WEEKDAYS
    ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].forEach(day => {
        const cell = document.createElement("div");
        cell.textContent = day;
        cell.classList.add("inactive");
        calendarGrid.appendChild(cell);
    });

    // EMPTY CELLS
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.classList.add("inactive");
        calendarGrid.appendChild(empty);
    }

    // DAYS
    for (let d = 1; d <= numDays; d++) {
        const cell = document.createElement("div");
        cell.textContent = d;

        const thisDate = new Date(year, month, d);

        // highlight selected day
        if (
            selectedDate &&
            thisDate.getDate() === selectedDate.getDate() &&
            thisDate.getMonth() === selectedDate.getMonth()
        ) {
            cell.classList.add("active");
        }

        // CLICK → SELECT DATE
        cell.addEventListener("click", () => {
            selectedDate = thisDate;
            updateWholeUI();
        });

        calendarGrid.appendChild(cell);
    }
}

/* ============================================================
   MONTH SWITCH BUTTONS
============================================================ */

prevMonthBtn.addEventListener("click", () => {
    if (currentDate.getMonth() > 0) currentDate.setMonth(currentDate.getMonth() - 1);
    updateWholeUI();
});

nextMonthBtn.addEventListener("click", () => {
    if (currentDate.getMonth() < 11) currentDate.setMonth(currentDate.getMonth() + 1);
    updateWholeUI();
});

/* ============================================================
   JOURNAL SAVE/LOAD
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
   TASKS
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

/* ADD TASK BUTTON */

addTaskBtn.addEventListener("click", () => {
    if (taskInput.value.trim() === "") return;

    renderTask({ text: taskInput.value, done: false });
    saveTasks();
    taskInput.value = "";
});
