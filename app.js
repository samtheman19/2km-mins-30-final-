if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()));
}

document.addEventListener("DOMContentLoaded", () => {

  // -----------------------
  // 6-Day Training Plan
  // -----------------------
  const goal2kmTimeSec = 8*60; // 8 minutes
  const last2kmTimeSec = 8*60 + 36; // 8:36
  const distance2km = 2000; // meters

  // Calculate pace in m/s & km/h
  const goalPaceMS = distance2km / goal2kmTimeSec; 
  const goalPaceKPH = (goalPaceMS * 3.6).toFixed(1);

  const plan = {
    Monday: {
      title: "Intervals",
      explain: `Short, fast repetitions at ${goalPaceKPH} km/h to develop speed and running economy.`,
      warmup: ["10 min easy jog", "Dynamic mobility (hips, calves, ankles)"],
      main: [
        { text: "400 m @ goal pace", reps: 6, duration: Math.round(400 / goalPaceMS), rest: 20 }
      ],
      mobility: ["Hip flexor stretch – 60 sec", "Calf stretch – 60 sec"]
    },

    Tuesday: {
      title: "Tempo Run",
      explain: `Sustained effort for ~22 min at ~90% goal pace (~${(goalPaceKPH*0.9).toFixed(1)} km/h).`,
      warmup: ["10 min easy jog"],
      main: [
        { text: "Continuous tempo run", duration: 22*60 },
        { text: "Relaxed strides", reps: 3, duration: 60, rest: 30, speed: (goalPaceKPH*0.6).toFixed(1) }
      ],
      mobility: ["Hamstring stretch – 60 sec"]
    },

    Wednesday: {
      title: "Recovery",
      explain: "Low intensity aerobic work to promote recovery and maintain form.",
      warmup: ["5 min brisk walk"],
      main: [
        { text: "Easy run / cross-training", reps: 1, duration: 20*60 }
      ],
      mobility: ["Full body mobility flow – 10 min"]
    },

    Thursday: {
      title: "VO₂ Max Intervals / Hill Sprint",
      explain: "Choose VO₂ Max or Hill Sprints.",
      warmup: ["10 min easy jog", "Running drills"],
      mainOptions: {
        vo2: [
          { text: "500 m slightly faster than goal pace", reps: 5, duration: Math.round(500 / (goalPaceMS*1.1)), rest: 120 }
        ],
        hill: [
          { text: "60 m hill sprint (1:6 gradient)", reps: 6, duration: 12, rest: 90 }
        ]
      },
      mobility: ["Quad stretch – 60 sec"]
    },

    Friday: {
      title: "Endurance + Strides",
      explain: `Easy aerobic run (~35 min) + strides: 1 min each at 90–95% goal pace (~${(goalPaceKPH*0.9).toFixed(1)}–${(goalPaceKPH*0.95).toFixed(1)} km/h)`,
      warmup: ["5–10 min easy jog"],
      main: [
        { text: "Easy run", duration: 35*60 },
        { text: "Strides", reps: 4, duration: 60, rest: 30, speed: (goalPaceKPH*0.93).toFixed(1) }
      ],
      mobility: ["Foam rolling – 10 min"]
    },

    Saturday: {
      title: "Race Simulation",
      explain: `Simulate 2 km at goal pace (${goalPaceKPH} km/h), broken into segments.`,
      warmup: ["10 min easy jog"],
      main: [
        { text: "1 km slightly slower than goal pace", duration: Math.round(1000 / (goalPaceMS*0.95)), rest: 120 },
        { text: "500 m at goal pace", duration: Math.round(500 / goalPaceMS), rest: 60 },
        { text: "2 × 250 m fast finish", reps: 2, duration: Math.round(250 / goalPaceMS), rest: 30 }
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
  const calendarBlock = document.getElementById("calendarBlock");
  const sessionTime = document.getElementById("sessionTime");
  const startSession = document.getElementById("startSession");
  const pauseSession = document.getElementById("pauseSession");
  const resetSession = document.getElementById("resetSession");

  const beep = new Audio("https://www.soundjay.com/buttons/beep-07.wav");

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

    // Explanation
    if (dayExplain) dayExplain.innerHTML = `<div class="cardTitle">${data.title}</div><div class="muted">${data.explain}</div>`;

    // Warm-up
    warmupList.innerHTML = "";
    data.warmup.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      warmupList.appendChild(li);
    });

    // Main
    mainBlock.innerHTML = "";

    // Thursday dropdown
    let mainSets = data.main || [];
    if (day === "Thursday") {
      const select = document.createElement("select");
      select.id = "thursdaySelect";
      Object.keys(data.mainOptions).forEach(opt => {
        const option = document.createElement("option");
        option.value = opt;
        option.textContent = opt === "vo2" ? "VO₂ Max Intervals" : "Hill Sprints";
        select.appendChild(option);
      });
      mainBlock.appendChild(select);

      select.addEventListener("change", e => renderThursdaySet(e.target.value));
      renderThursdaySet(select.value);
    } else {
      mainSets.forEach(set => renderSetRow(set));
    }

    // Mobility
    mobilityList.innerHTML = "";
    data.mobility.forEach(item => {
      const div = document.createElement("div");
      div.textContent = item;
      mobilityList.appendChild(div);
    });

    // Feedback
    if (feedbackBlock) feedbackBlock.innerHTML = `<div class="card"><div class="cardTitle">Feedback</div><div class="muted">Rate fatigue before and after session. Notes below.</div></div>`;
  }

  function renderThursdaySet(option) {
    mainBlock.querySelectorAll(".repRow,.restRow").forEach(e => e.remove());
    const sets = plan.Thursday.mainOptions[option];
    sets.forEach(set => renderSetRow(set));
  }

  function renderSetRow(set) {
    const reps = set.reps || 1;
    for (let i = 1; i <= reps; i++) {
      const div = document.createElement("div");
      div.className = "repRow";
      div.innerHTML = `
        <span class="repText">${set.text}${set.speed ? " – "+set.speed+" km/h" : ""} (Rep ${i}/${reps})</span>
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
  }

  // -----------------------
  // Session Timer
  // -----------------------
  let sessionSeconds = 0;
  let sessionInterval;
  startSession.addEventListener("click", () => {
    clearInterval(sessionInterval);
    sessionInterval = setInterval(() => {
      sessionSeconds++;
      if(sessionTime) sessionTime.textContent = formatHMS(sessionSeconds);
    }, 1000);
    beep.play();
    startIntervalTimers();
  });

  pauseSession.addEventListener("click", () => clearInterval(sessionInterval));

  resetSession.addEventListener("click", () => {
    clearInterval(sessionInterval);
    sessionSeconds = 0;
    if(sessionTime) sessionTime.textContent = formatHMS(sessionSeconds);
    document.querySelectorAll(".repRow input[type=checkbox]").forEach(cb => cb.checked = false);
    document.querySelectorAll(".timerSpan").forEach(span => {
      const dur = parseInt(span.getAttribute("data-duration")) || 0;
      span.textContent = formatTime(dur);
    });
  });

  function formatHMS(sec) {
    const h = Math.floor(sec/3600).toString().padStart(2,"0");
    const m = Math.floor((sec%3600)/60).toString().padStart(2,"0");
    const s = (sec%60).toString().padStart(2,"0");
    return `${h}:${m}:${s}`;
  }

  function formatTime(sec) {
    const m = Math.floor(sec/60).toString().padStart(2,"0");
    const s = (sec%60).toString().padStart(2,"0");
    return `${m}:${s}`;
  }

  // -----------------------
  // Interval logic per rep
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
    if(currentRepIndex >= repRows.length) return;
    const row = repRows[currentRepIndex];
    const timerSpan = row.querySelector(".timerSpan");
    const cb = row.querySelector("input[type=checkbox]");
    let sec = parseInt(timerSpan.getAttribute("data-duration"));
    beep.play();

    intervalTimer = setInterval(() => {
      sec--;
      timerSpan.textContent = formatTime(sec);
      if(sec <= 0) {
        clearInterval(intervalTimer);
        beep.play();
        cb.checked = true;
        row.classList.add("completed");
        currentRepIndex++;
        runNextRep(repRows);
      }
    },1000);
  }

  // -----------------------
  // Init
  // -----------------------
  renderDay("Monday");
  daySelect.addEventListener("change", e => renderDay(e.target.value));

});
