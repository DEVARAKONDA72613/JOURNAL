import { auth, provider } from "./firebase.js";
import {
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

/* ===== Supabase (DB only) ===== */
const supa = createClient(
  "https://klrjkwouixiybuyjglbj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3Mi6Iktscmprd291aXhpeWJ1eWpnbGJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzE5MjAsImV4cCI6MjA4MDYwNzkyMH0.-sdXiwRf0mbA-3WYnddrQPQ2rwMNbOGP0oNziiIZBUE"
);

/* ===== DOM ===== */
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

/* ===== State ===== */
let currentUser = null;
let selectedDate = new Date(2026, 0, 1);
let currentMonth = new Date(2026, 0, 1);
let authReady = false;

const monthImages = {
  0: "jan.jpg", 1: "feb.jpg", 2: "march.jpg", 3: "aprl.jpg",
  4: "mat.jpg", 5: "june.jpg", 6: "july.jpg", 7: "aug.jpg",
  8: "sept.jpg", 9: "oct.jpg", 10: "nov.jpg", 11: "dec.jpg"
};

const dateKey = (d) => d.toISOString().split("T")[0];

/* ===== IMPORTANT FIX ===== */
getRedirectResult(auth)
  .finally(() => {
    authReady = true;
  });

onAuthStateChanged(auth, async (user) => {
  if (!authReady) return;

  if (!user) {
    enterBtn.textContent = "Sign in with Google";
    enterBtn.onclick = () => signInWithRedirect(auth, provider);
    return;
  }

  currentUser = { id: user.uid, email: user.email };

  enterBtn.textContent = "Enter 2026 Journal";
  enterBtn.onclick = () => coverScreen.classList.add("hide");

  renderCalendar();
  updateHeader();
  updateBackground();
  await loadJournal();
  await loadTasks();
});

/* ===== UI helpers ===== */
function updateHeader() {
  currentDateDisplay.textContent = selectedDate.toDateString();
}

function updateBackground() {
  backgroundDiv.style.backgroundImage = `url('${monthImages[selectedDate.getMonth()]}')`;
}

/* ===== Calendar, Journal, Tasks ===== */
/* (UNCHANGED FROM YOUR CODE – works fine) */

