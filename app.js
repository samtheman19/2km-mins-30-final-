if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()));
}

document.addEventListener("DOMContentLoaded", () => {

  // -----------------------
  // User Goal & pacing
  // -----------------------
  const last2km = 8 * 60 + 36; // 8:36 in seconds
  const target2km = 8 * 60; // 8:00 goal
  const goalPacePer100m = target2km / 20; // seconds per 100m

  // -----------------------
  // Audio beep
  // -----------------------
  const beep = new Audio("https://www.soundjay.com/buttons/beep-07.wav");

  // -----------------------
  // DOM Elements
  // -----------------------
  const daySelect = document.getElementById("daySelect");
  const dayTitle = document.getElementById("dayTitle");
  const warmupList = document.getElementById("warmupList");
  const mainBlock = document.getElementById("mainBlock");
  const mobilityList = document.getElementById("mobilityList");
  const feedbackBlock = document.getElementById("feedbackBlock");
  const sessionTime = document.getElementById("sessionTime");
  const startSession = document.getElementById("startSession");
  const pauseSession = document.getElementById("pauseSession");
  const resetSession = document.getElementById("resetSession");

  // -----------------------
  // Session Timer
  // -----------------------
  let sessionSeconds = 0;
  let sessionInterval;

  function formatHMS(sec) {
    const h = Math.floor(sec / 3600).toString().padStart(2, "0");
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  startSession.addEventListener("click", () => {
    clearInterval(sessionInterval);
    sessionInterval = setInterval(() => {
      sessionSeconds++;
      sessionTime.textContent = formatHMS(sessionSeconds);
    }, 1000);
    startIntervalTimers();
    beep.play();
  });

  pauseSession.addEventListener("click", () => clearInterval(sessionInterval));

  resetSession.addEventListener("click", () => {
    clearInterval(sessionInterval);
    sessionSeconds = 0;
    sessionTime.textContent = formatHMS(sessionSeconds);
    document.querySelectorAll(".repRow input[type=checkbox]").forEach(cb => cb.checked = false);
    document.querySelectorAll(".timerSpan").forEach(span => {
      const dur = parseInt(span.getAttribute("data-duration")) || 0;
      span.textContent = formatTime(dur);
      span.closest(".repRow").classList.remove("active", "completed");
    });
    localStorage.removeItem("planProgress");
  });

  // -----------------------
  // 6-Day Plan with optional Thursday dropdown
  // -----------------------
  const plan = {
    Monday: {
      title: "Intervals",
      explain: "Short, fast repetitions at 2 km pace to develop speed and running economy.",
      warmup: ["10 min easy jog", "Dynamic mobility (hips, calves, ankles)"],
      main: [{ text: "400 m @ goal pace", reps: 6, duration: Math.round(400 / 100 * goalPacePer100m), rest: 20 }],
      mobility: ["Hip flexor stretch – 60 sec", "Calf stretch – 60 sec"]
    },
    Tuesday: {
      title: "Tempo Run",
      explain: "Sustained effort to improve lactate threshold and fatigue resistance.",
      warmup: ["10 min easy jog"],
      main: [
        { text: "Continuous tempo run", duration: 1500 },
        { text: "Relaxed strides", reps: 3, duration: 60, rest: 30 }
      ],
      mobility: ["Hamstring stretch – 60 sec"]
    },
    Wednesday: {
      title: "Recovery",
      explain: "Low intensity aerobic work to promote recovery and maintain form.",
      warmup: ["5 min brisk walk"],
      main: [{ text: "Easy run or cross-training", duration: 1200 }],
      mobility: ["Full body mobility flow – 10 min"]
    },
    Thursday: { // Dropdown selectable
      title: "VO₂ Max / Hill Sprints",
      explain: "Choose VO₂ Max intervals or Hill sprints to increase aerobic capacity or leg power.",
      warmup: ["10 min easy jog", "Running drills"],
      options: {
        vo2: [{ text: "500 m slightly faster than goal pace", reps: 5, duration: Math.round(500 / 100 * goalPacePer100m), rest: 120 }],
        hill: [{ text: "Hill sprint 60 m (1:6 gradient)", reps: 6, duration: 20, rest: 90 }]
      },
      mobility: ["Quad stretch – 60 sec"]
    },
    Friday: {
      title: "Endurance + Strides",
      explain: "Easy aerobic running with short speed exposure to improve mechanics.",
      warmup: ["5–10 min easy jog"],
      main: [
        { text: "Easy run", duration: 1800 },
        { text: "Strides", reps: 4, duration: 60, rest: 30 }
      ],
      mobility: ["Foam rolling – 10 min"]
    },
    Saturday: {
      title: "Race Simulation",
      explain: "Broken race effort to practice pacing and finishing strong.",
      warmup: ["10 min easy jog"],
      main: [
        { text: "1 km slightly slower than goal pace", duration: 300 },
        { text: "Recovery", duration: 120 },
        { text: "500 m at goal pace", duration: 150 },
        { text: "Fast finish", reps: 2, duration: 120, rest: 60 }
      ],
      mobility: ["Hip flexor stretch – 60 sec"]
    }
  };

  // -----------------------
  // Populate day selector
  // -----------------------
  Object.keys(plan).forEach(day => {
    const opt = document.createElement("option");
    opt.value = day;
    opt.textContent = day;
    daySelect.appendChild(opt);
  });

  // -----------------------
  // Rendering & progress logic
  // -----------------------
  let currentRepIndex = 0;
  let intervalTimer;

  function renderDay(day) {
    const data = plan[day];
    dayTitle.textContent = day;

    // Clear previous content
    warmupList.innerHTML = "";
    mainBlock.innerHTML = "";
    mobilityList.innerHTML = "";
    feedbackBlock.innerHTML = "";

    // Warmup
    data.warmup.forEach(w => {
      const li = document.createElement("li");
      li.textContent = w;
      warmupList.appendChild(li);
    });

    // Main sets (handle Thursday options)
    let mainSets = data.main || [];
    if (day === "Thursday") {
      // Create dropdown
      const select = document.createElement("select");
      select.innerHTML = `
        <option value="vo2">VO₂ Max Intervals</option>
        <option value="hill">Hill Sprints</option>
      `;
      select.addEventListener("change", e => {
        data.main = data.options[e.target.value];
        renderDay("Thursday"); // Re-render with new option
      });
      mainBlock.appendChild(select);
      mainSets = data.options.vo2; // default
    }

    mainSets.forEach(set => {
      const reps = set.reps || 1;
      for (let i = 1; i <= reps; i++) {
        const div = document.createElement("div");
        div.className = "repRow";
        div.innerHTML = `
          <span class="repText">${set.text} (Rep ${i}/${reps})</span>
          <span class="timerSpan" data-duration="${set.duration}">${formatTime(set.duration)}</span>
          <input type="checkbox" />
        `;
        mainBlock.appendChild(div);

        if (set.rest) {
          const restDiv = document.createElement("div");
          restDiv.className = "restRow";
          restDiv.textContent = `Rest ${formatTime(set.rest)}`;
          mainBlock.appendChild(restDiv);
        }
      }
    });

    // Mobility
    data.mobility.forEach(m => {
      const div = document.createElement("div");
      div.textContent = m;
      mobilityList.appendChild(div);
    });

    // Feedback
    feedbackBlock.innerHTML = `<div class="card"><div class="cardTitle">Feedback</div><div class="muted">Complete all reps at target pace → increase pace next week. Missed reps → maintain pace.</div></div>`;

    // Load progress from localStorage
    const saved = JSON.parse(localStorage.getItem(day) || "{}");
    mainBlock.querySelectorAll(".repRow input[type=checkbox]").forEach((cb, idx) => {
      if (saved[idx]) {
        cb.checked = true;
        cb.closest(".repRow").classList.add("completed");
      }
    });
  }

  function startIntervalTimers() {
    clearInterval(intervalTimer);
    const repRows = Array.from(mainBlock.querySelectorAll(".repRow"));
    currentRepIndex = repRows.findIndex(row => !row.querySelector("input[type=checkbox]").checked);
    runNextRep(repRows);
  }

  function runNextRep(repRows) {
    if (currentRepIndex >= repRows.length) return;
    const row = repRows[currentRepIndex];
    const timerSpan = row.querySelector(".timerSpan");
    const cb = row.querySelector("input[type=checkbox]");
    let sec = parseInt(timerSpan.getAttribute("data-duration"));

    // Highlight active
    repRows.forEach(r => r.classList.remove("active"));
    row.classList.add("active");

    beep.play();

    intervalTimer = setInterval(() => {
      sec--;
      timerSpan.textContent = formatTime(sec);
      if (sec <= 0) {
        clearInterval(intervalTimer);
        cb.checked = true;
        row.classList.remove("active");
        row.classList.add("completed");
        beep.play();

        // Save progress
        const progress = Array.from(repRows).map(r => r.querySelector("input[type=checkbox]").checked);
        localStorage.setItem(daySelect.value, JSON.stringify(progress));

        currentRepIndex++;
        runNextRep(repRows);
      }
    }, 1000);
  }

  // -----------------------
  // Init
  // -----------------------
  renderDay("Monday");
  daySelect.addEventListener("change", e => renderDay(e.target.value));

});
