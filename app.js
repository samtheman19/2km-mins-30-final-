document.addEventListener("DOMContentLoaded", () => {

  const goalTimeSec = 8 * 60;
  const goalKph = (2 / (goalTimeSec / 3600)).toFixed(1);

  const plan = {
    Monday: {
      title: "Intervals",
      explain: `6 × 400m @ ${goalKph} kph. 90s walk/jog recovery between reps.`,
      warmup: [
        "10 min easy jog @ 9.0–9.5 kph",
        "Dynamic mobility drills"
      ],
      main: [
        "400m fast @ goal pace",
        "Rest 90s",
        "400m fast",
        "Rest 90s",
        "400m fast",
        "Rest 90s",
        "400m fast",
        "Rest 90s",
        "400m fast",
        "Rest 90s",
        "400m fast"
      ]
    },
    Tuesday: {
      title: "Tempo",
      explain: "Sustained threshold effort. Controlled but uncomfortable.",
      warmup: [
        "10 min easy jog @ 9.0 kph"
      ],
      main: [
        "25 min tempo @ 85% goal pace (~11.5 kph)"
      ]
    },
    Wednesday: {
      title: "Recovery",
      explain: "Very easy aerobic flush.",
      warmup: [
        "5 min brisk walk"
      ],
      main: [
        "20 min easy run @ 8.5–9.0 kph"
      ]
    },
    Thursday: {
      title: "VO₂ Max",
      explain: "High-intensity aerobic power session.",
      warmup: [
        "10 min jog @ 9.0 kph"
      ],
      main: [
        "500m fast @ 110% goal pace",
        "Rest 2 min",
        "500m fast",
        "Rest 2 min",
        "500m fast",
        "Rest 2 min",
        "500m fast",
        "Rest 2 min",
        "500m fast"
      ]
    },
    Friday: {
      title: "Endurance",
      explain: "Steady aerobic conditioning.",
      warmup: [
        "10 min jog"
      ],
      main: [
        "35 min steady run @ 9.5–10.0 kph"
      ]
    },
    Saturday: {
      title: "Race Simulation",
      explain: "Broken 2km to rehearse pacing and fatigue.",
      warmup: [
        "10 min jog"
      ],
      main: [
        "1 km @ goal pace",
        "2 min rest",
        "500m slightly faster than goal pace",
        "90s rest",
        "500m max controlled effort"
      ]
    }
  };

  const daySelect = document.getElementById("daySelect");
  const dayTitle = document.getElementById("dayTitle");
  const dayExplain = document.getElementById("dayExplain");
  const warmupList = document.getElementById("warmupList");
  const mainBlock = document.getElementById("mainBlock");

  Object.keys(plan).forEach(day => {
    const opt = document.createElement("option");
    opt.value = day;
    opt.textContent = day;
    daySelect.appendChild(opt);
  });

  function row(text) {
    const div = document.createElement("div");
    div.className = "row";
    div.innerHTML = `<span>${text}</span><input type="checkbox">`;
    return div;
  }

  function renderDay(day) {
    const d = plan[day];
    dayTitle.textContent = day + " — " + d.title;
    dayExplain.textContent = d.explain;

    warmupList.innerHTML = "";
    d.warmup.forEach(w => warmupList.appendChild(row(w)));

    mainBlock.innerHTML = "";
    d.main.forEach(m => mainBlock.appendChild(row(m)));
  }

  daySelect.addEventListener("change", e => renderDay(e.target.value));

  renderDay("Monday");
});

/* TIMER */
let seconds = 0;
let interval = null;

function updateTimer() {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  document.getElementById("timer").textContent = `${min}:${sec}`;
}

function startTimer() {
  if (!interval) {
    interval = setInterval(() => {
      seconds++;
      updateTimer();
    }, 1000);
  }
}

function pauseTimer() {
  clearInterval(interval);
  interval = null;
}

function resetTimer() {
  pauseTimer();
  seconds = 0;
  updateTimer();
}
