document.addEventListener("DOMContentLoaded", () => {

  const goalTimeSec = 8 * 60;
  const goalDistance = 2;
  const goalKph = (goalDistance / (goalTimeSec / 3600)).toFixed(1);

  const plan = {
    Monday: {
      title: "Intervals",
      explain: `6 × 400m @ ${goalKph} kph (full effort)`,
      warmup: ["10 min easy jog", "Dynamic mobility"],
      main: ["400m fast", "400m fast", "400m fast", "400m fast", "400m fast", "400m fast"]
    },
    Tuesday: {
      title: "Tempo",
      explain: `25 min @ ${(goalKph * 0.85).toFixed(1)} kph`,
      warmup: ["10 min easy jog"],
      main: ["25 min tempo run"]
    },
    Wednesday: {
      title: "Recovery",
      explain: "Easy aerobic run",
      warmup: ["5 min walk"],
      main: ["20 min easy run"]
    },
    Thursday: {
      title: "VO₂ Max",
      explain: `5 × 500m @ ${(goalKph * 1.1).toFixed(1)} kph`,
      warmup: ["10 min jog"],
      main: ["500m fast", "500m fast", "500m fast", "500m fast", "500m fast"]
    },
    Friday: {
      title: "Endurance",
      explain: "Steady aerobic run",
      warmup: ["10 min jog"],
      main: ["35 min easy run"]
    },
    Saturday: {
      title: "Race Simulation",
      explain: `Broken 2km @ ${goalKph} kph`,
      warmup: ["10 min jog"],
      main: ["1km steady", "500m fast", "500m fast"]
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

  function renderDay(day) {
    const d = plan[day];
    dayTitle.textContent = day;
    dayExplain.textContent = d.explain;

    warmupList.innerHTML = "";
    d.warmup.forEach(w => {
      const li = document.createElement("li");
      li.textContent = w;
      warmupList.appendChild(li);
    });

    mainBlock.innerHTML = "";
    d.main.forEach(m => {
      const div = document.createElement("div");
      div.className = "rep";
      div.textContent = m;
      mainBlock.appendChild(div);
    });
  }

  daySelect.addEventListener("change", e => renderDay(e.target.value));

  renderDay("Monday");
});
