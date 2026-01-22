if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()));
}

document.addEventListener("DOMContentLoaded", () => {

  // -----------------------
  // Goal pace calculation
  // -----------------------
  const distanceKm = 2;
  const last2kSec = 8*60 + 36; // 8:36 last run
  const target2kSec = 8*60;    // 8:00 goal
  const targetPaceKph = distanceKm / (target2kSec / 3600); // ≈ 15.0 kph

  // -----------------------
  // Plan with reps & duration (seconds)
  // -----------------------
  const plan = {
    Monday: {
      title: "Intervals",
      explain: `Short, fast repetitions at ${targetPaceKph.toFixed(1)} kph to develop speed and running economy.`,
      warmup: ["10 min easy jog", "Dynamic mobility (hips, calves, ankles)"],
      main: [
        { text: `400 m @ ${targetPaceKph.toFixed(1)} kph`, reps: 6, duration: Math.round(400 / (targetPaceKph/3.6)), rest: 20 }
      ],
      mobility: ["Hip flexor stretch – 60 sec", "Calf stretch – 60 sec"]
    },

    Tuesday: {
      title: "Tempo Run",
      explain: `Sustained effort for 20–25 min at ${Math.round(targetPaceKph*0.85)} kph to improve lactate threshold. Strides at ~${Math.round(targetPaceKph*1.0)} kph.`,
      warmup: ["10 min easy jog"],
      main: [
        { text: `Tempo run 20–25 min`, duration: 1500 },
        { text: `Relaxed strides 3×100 m`, reps: 3, duration: 60, rest: 30 }
      ],
      mobility: ["Hamstring stretch – 60 sec"]
    },

    Wednesday: {
      title: "Recovery",
      explain: "Low intensity aerobic work to promote recovery and maintain form.",
      warmup: ["5 min brisk walk"],
      main: [
        { text: "Easy run / cross-training", duration: 1200 }
      ],
      mobility: ["Full body mobility flow – 10 min"]
    },

    Thursday: {
      title: "VO₂ Max Intervals",
      explain: `Choose your session: VO₂ max or Hill Sprints`,
      warmup: ["10 min easy jog", "Running drills"],
      mainVO2: [
        { text: `500 m @ ${Math.round(targetPaceKph*1.05)} kph`, reps: 5, duration: Math.round(500 / ((targetPaceKph*1.05)/3.6)), rest: 120 }
      ],
      mainHill: [
        { text: "60 m hill sprint – full effort", reps: 6, duration: 6, rest: 90 }
      ],
      mobility: ["Quad stretch – 60 sec"]
    },

    Friday: {
      title: "Endurance + Strides",
      explain: `Easy run 30–40 min at ${Math.round(targetPaceKph*0.75)} kph with 4 × 100 m strides at ~${Math.round(targetPaceKph*1.0)} kph.`,
      warmup: ["5–10 min easy jog"],
      main: [
        { text: "Easy run 30–40 min", duration: 1800 },
        { text: "Strides 4×100 m", reps: 4, duration: 60, rest: 30 }
      ],
      mobility: ["Foam rolling – 10 min"]
    },

    Saturday: {
      title: "Race Simulation",
      explain: `Practice broken race pace: target ${targetPaceKph.toFixed(1)} kph for each segment.`,
      warmup: ["10 min easy jog"],
      main: [
        { text: "1 km slightly slower than goal pace", duration: 300 },
        { text: "Recovery", duration: 120 },
        { text: `500 m @ ${targetPaceKph.toFixed(1)} kph`, duration: 150 },
        { text: "Fast finish 2×400 m", reps: 2, duration: 120, rest: 60 }
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
  const preFatigue = document.getElementById("preFatigue");
  const postFatigue = document.getElementById("postFatigue");
  const calendarBlock = document.getElementById("calendarBlock");

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

    // Only Thursday has drop-down
    let mainSet = data.main;
    if(day === "Thursday") {
      const selectVO2 = document.createElement("select");
      const opt1 = document.createElement("option");
      opt1.value="VO2";
      opt1.textContent="VO₂ Max Intervals";
      const opt2 = document.createElement("option");
      opt2.value="Hill";
      opt2.textContent="Hill Sprints";
      selectVO2.appendChild(opt1);
      selectVO2.appendChild(opt2);
      mainBlock.innerHTML = "";
      mainBlock.appendChild(selectVO2);
      selectVO2.addEventListener("change", e => {
        renderMainSet(data, e.target.value);
      });
      renderMainSet(data, "VO2");
    } else {
      renderMainSet(data);
    }

    // Explanation card
    dayExplain.innerHTML = `<div class="cardTitle">${data.title}</div><div class="muted">${data.explain}</div>`;

    // Warm-up
    warmupList.innerHTML = "";
    data.warmup.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      warmupList.appendChild(li);
    });

    // Mobility
    mobilityList.innerHTML = "";
    data.mobility.forEach(item => {
      const div = document.createElement("div");
      div.textContent = item;
      mobilityList.appendChild(div);
    });

    // Feedback
    feedbackBlock.innerHTML = `<div class="card"><div class="cardTitle">Session Feedback</div>
      <div>Pre-session fatigue: <span id="preFatigueText">-</span></div>
      <div>Post-session fatigue: <span id="postFatigueText">-</span></div>
    </div>`;

    updateCalendar();
  }

  // -----------------------
  // Render main set
  // -----------------------
  function renderMainSet(data, type="") {
    mainBlock.innerHTML = "";
    const main = (type==="Hill") ? data.mainHill : (type==="VO2") ? data.mainVO2 : data.main;

    main.forEach(set => {
      const reps = set.reps || 1;
      for (let i=1; i<=reps; i++) {
        const div = document.createElement("div");
        div.className="repRow";
        div.innerHTML = `
          <span class="repText">${set.text} (Rep ${i}/${reps})</span>
          <span class="timerSpan" data-duration="${set.duration}">${formatTime(set.duration)}</span>
          <input type="checkbox" />
        `;
        mainBlock.appendChild(div);
        if(set.rest) {
          const restDiv = document.createElement("div");
          restDiv.className="restRow";
          restDiv.textContent = `Rest ${formatTime(set.rest)}`;
          mainBlock.appendChild(restDiv);
        }
      }
    });
  }

  // -----------------------
  // Interval logic
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
      row.classList.add("activeRep");
      if(sec <= 0) {
        clearInterval(intervalTimer);
        beep.play();
        cb.checked = true;
        row.classList.remove("activeRep");
        row.classList.add("completed");
        currentRepIndex++;
        runNextRep(repRows);
      }
    }, 1000);
  }

  // -----------------------
  // Calendar visual
  // -----------------------
  function updateCalendar() {
    calendarBlock.innerHTML = "";
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth()+1, 0);
    const table = document.createElement("table");
    const trHead = document.createElement("tr");
    ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(d=>{
      const th = document.createElement("th");
      th.textContent=d;
      trHead.appendChild(th);
    });
    table.appendChild(trHead);
    let tr = document.createElement("tr");
    for(let i=0;i<start.getDay();i++) tr.appendChild(document.createElement("td"));
    for(let d=1; d<=end.getDate(); d++) {
      if(tr.children.length>=7) {
        table.appendChild(tr);
        tr=document.createElement("tr");
      }
      const td=document.createElement("td");
      td.textContent=d;
      if(d===today.getDate()) td.style.background="#6fd3ff";
      tr.appendChild(td);
    }
    table.appendChild(tr);
    calendarBlock.appendChild(table);
  }

  // -----------------------
  // Init
  // -----------------------
  renderDay("Monday");
  daySelect.addEventListener("change", e => renderDay(e.target.value));

});
