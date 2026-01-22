if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()));
}

document.addEventListener("DOMContentLoaded", () => {

  // -----------------------
  // 6-Day Training Plan (Time per rep calculated by distance/goal pace)
  // -----------------------
  const plan = {
    Monday: {
      title: "Intervals",
      explain: "Short, fast repetitions at 2 km pace to develop speed and running economy.",
      warmup: ["10 min easy jog", "Dynamic mobility (hips, calves, ankles)"],
      main: [
        { text: "400 m @ goal pace", reps: 6, duration: 98, rest: 20 } // duration in seconds
      ],
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
    Thursday: {
      title: "VO₂ Max Intervals",
      explain: "Longer intervals slightly faster than race pace to increase aerobic capacity.",
      warmup: ["10 min easy jog", "Running drills"],
      main: [{ text: "500 m slightly faster than goal pace", reps: 5, duration: 60, rest: 120 }],
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
  // DOM Elements
  // -----------------------
  const daySelect = document.getElementById("daySelect");
  const dayTitle = document.getElementById("dayTitle");
  const dayExplain = document.getElementById("dayExplain");
  const warmupList = document.getElementById("warmupList");
  const mainBlock = document.getElementById("mainBlock");
  const mobilityList = document.getElementById("mobilityList");
  const feedbackBlock = document.getElementById("feedbackBlock");
  const sessionTime = document.getElementById("sessionTime");
  const startSession = document.getElementById("startSession");
  const pauseSession = document.getElementById("pauseSession");
  const resetSession = document.getElementById("resetSession");

  const beep = new Audio("https://www.soundjay.com/buttons/beep-07.wav");

  // -----------------------
  // Session Timer
  // -----------------------
  let sessionSeconds = 0;
  let sessionInterval;
  startSession.addEventListener("click", () => {
    clearInterval(sessionInterval);
    sessionInterval = setInterval(() => {
      sessionSeconds++;
      sessionTime.textContent = formatHMS(sessionSeconds);
    }, 1000);
    beep.play();
    startIntervalTimers();
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
    });
  });

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

  // -----------------------
  // Populate Day Selector
  // -----------------------
  Object.keys(plan).forEach(day => {
    const opt = document.createElement("option");
    opt.value = day;
    opt.textContent = day;
    daySelect.appendChild(opt);
  });

  // -----------------------
  // Render Day
  // -----------------------
  function renderDay(day) {
    const data = plan[day];
    dayTitle.textContent = day;
    dayExplain.innerHTML = `<div class="cardTitle">${data.title}</div><div class="muted">${data.explain}</div>`;

    // Warm-up
    warmupList.innerHTML = "";
    data.warmup.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      warmupList.appendChild(li);
    });

    // Main sets
    mainBlock.innerHTML = "";
    data.main.forEach((set) => {
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
    mobilityList.innerHTML = "";
    data.mobility.forEach(item => {
      const div = document.createElement("div");
      div.textContent = item;
      mobilityList.appendChild(div);
    });

    // Feedback
    feedbackBlock.innerHTML = `<div class="card"><div class="cardTitle">Feedback</div><div class="muted">Complete all reps at target pace → increase pace next week. Missed reps → maintain pace.</div></div>`;
  }

  // -----------------------
  // Interval logic for timers
  // -----------------------
  let currentRepIndex = 0;
  let intervalTimer;
  function startIntervalTimers() {
    clearInterval(intervalTimer);
    const repRows = Array.from(mainBlock.querySelectorAll(".repRow"));
    currentRepIndex = 0;
    runNextRep(repRows);
  }

  function runNextRep(repRows) {
    if (currentRepIndex >= repRows.length) return;
    const row = repRows[currentRepIndex];
    const timerSpan = row.querySelector(".timerSpan");
    const cb = row.querySelector("input[type=checkbox]");
    let sec = parseInt(timerSpan.getAttribute("data-duration"));
    beep.play();

    intervalTimer = setInterval(() => {
      sec--;
      timerSpan.textContent = formatTime(sec);
      if (sec <= 0) {
        clearInterval(intervalTimer);
        beep.play();
        cb.checked = true;
        row.classList.add("completed");
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
