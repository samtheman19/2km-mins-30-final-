document.addEventListener("DOMContentLoaded", () => {

  const goalTimeSec = 8 * 60;
  const goalKph = (2 / (goalTimeSec / 3600)).toFixed(1);

  const plan = {
    Monday: {
      title: "Intervals",
      explain: `6 × 400m @ ${goalKph} kph with 90s jog/walk recoveries.`,
      warmup: [
        "10 min easy jog @ 9.0–9.5 kph",
        "Dynamic mobility drills"
      ],
      main: [
        "400m fast",
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
      explain: "Sustained threshold effort.",
      warmup: ["10 min jog @ 9.0 kph"],
      main: ["25 min tempo @ ~11.5 kph"]
    },
    Wednesday: {
      title: "Recovery",
      explain: "Very easy aerobic flush.",
      warmup: ["5 min brisk walk"],
      main: ["20 min easy run @ 8.5–9.0 kph"]
    },
    Thursday: {
      title: "VO₂ Max",
      explain: "High-intensity aerobic power session.",
      warmup: ["10 min jog @ 9.0 kph"],
      main: [
        "500m fast",
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
      warmup: ["10 min jog"],
      main: ["35 min steady @ 9.5–10.0 kph"]
    },
    Saturday: {
      title: "Race Simulation",
      explain: "Broken 2km to rehearse pacing.",
      warmup: ["10 min jog"],
      main: [
        "1 km @ goal pace",
        "2 min rest",
        "500m fast",
        "90s rest",
        "500m hard finish"
      ]
    }
  };

  const daySelect = document.getElementById("daySelect");
  const dayTitle = document.getElementById("dayTitle");
  const dayExplain = document.getElementById("dayExplain");
  const warmupList = document.getElementById("warmupList");
  const mainBlock = document.getElementById("mainBlock");

  // Populate the day selector
  Object.keys(plan).forEach(day => {
    const opt = document.createElement("option");
    opt.value = day;
    opt.textContent = day;
    daySelect.appendChild(opt);
  });

  // Create a workout row with text + checkbox
  function row(text) {
    const div = document.createElement("div");
    div.className = "row";
    div.innerHTML = `<span>${text}</span><input type="checkbox">`;
    return div;
  }

  // Render a day
  function renderDay(day) {
    const d = plan[day];
    dayTitle.textContent = `${day} — ${d.title}`;
    dayExplain.textContent = d.explain;

    warmupList.innerHTML = "";
    d.warmup.forEach(w => warmupList.appendChild(row(w)));

    mainBlock.innerHTML = "";
    d.main.forEach(m => mainBlock.appendChild(row(m)));
  }

  // Auto-select today’s day (Monday-Saturday)
  const today = new Date();
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  let currentDay = dayNames[today.getDay()];
  if (!plan[currentDay]) currentDay = "Monday";

  daySelect.value = currentDay;
  renderDay(currentDay);

  daySelect.addEventListener("change", e => renderDay(e.target.value));
});

/* TIMER LOGIC */
let seconds = 0;
let interval = null;

function updateTimer() {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  document.getElementById("timer").textContent = `${m}:${s}`;
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
