document.addEventListener("DOMContentLoaded", () => {

  const goalTimeSec = 8 * 60;
  const goalDistance = 2;
  const goalKph = (goalDistance / (goalTimeSec / 3600)).toFixed(1);

  const plan = {
    Monday: {
      title: "Intervals",
      explain: `6 × 400m @ ${goalKph} kph (full effort)`,
      warmup: ["10 min easy jog", "Dynamic mobility"],
      main: [
        { text: `400m @ ${goalKph} kph`, reps: 6, time: "1:36" }
      ]
    },
    Tuesday: {
      title: "Tempo Run",
      explain: `25 min @ ${(goalKph * 0.85).toFixed(1)} kph`,
      warmup: ["10 min easy jog"],
      main: [
        { text: `Tempo run`, reps: 1, time: "25:00" }
      ]
    },
    Wednesday: {
      title: "Recovery",
      explain: "Easy aerobic run",
      warmup: ["5 min walk"],
      main: [
        { text: "Easy run @ 9–10 kph", reps: 1, time: "20:00" }
      ]
    },
    Thursday: {
      title: "VO₂ Max",
      explain: `5 × 500m @ ${(goalKph * 1.1).toFixed(1)} kph`,
      warmup: ["10 min jog"],
      main: [
        { text: `500m fast`, reps: 5, time: "1:55" }
      ]
    },
    Friday: {
      title: "Endurance + Strides",
      explain: "35 min easy + strides",
      warmup: ["10 min jog"],
      main: [
        { text: "Easy run", reps: 1, time: "35:00" }
      ]
    },
    Saturday: {
      title: "Race Simulation",
      explain: `Broken 2km @ ${goalKph} kph`,
      warmup: ["10 min jog"],
      main: [
        { text: "1km steady", reps: 1, time: "4:00" },
        { text: "500m fast", reps: 1, time: "2:00" }
      ]
    }
  };

  const daySelect = document.getElementById("daySelect");
  const dayTitle = document.getElementById("dayTitle");
  const dayExplain = document.getElementById("dayExplain");
  const warmupList = document.getElementById("warmupList");
  const mainBlock = document.getElementById("mainBlock");
  const sessionTime = document.getElementById("sessionTime");

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
      div.textContent = `${m.reps} × ${m.text} (${m.time})`;
      mainBlock.appendChild(div);
    });
  }

  daySelect.addEventListener("change", e => renderDay(e.target.value));

  renderDay("Monday");
});
