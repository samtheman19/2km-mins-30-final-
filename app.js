if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()));
}

document.addEventListener("DOMContentLoaded", () => {

  // Pace calculation based on target 8:00 2km
  const goal2kmSec = 8*60;
  const pace100 = goal2kmSec / 20;

  const plan = {
    Monday: {
      title: "Intervals",
      explain: "6 × 400 m @ goal pace (≈1:36) with short rest.",
      warmup: ["10 min easy jog", "Dynamic mobility"],
      main: [{ text: "400 m @ goal pace", reps: 6, duration: Math.round(400/100*pace100), rest: 20 }],
      mobility: ["Hip flexor stretch – 60 sec"]
    },
    Tuesday: {
      title: "Tempo Run",
      explain: "Sustained tempo to build threshold.",
      warmup: ["10 min easy jog"],
      main: [
        { text: "20 min tempo run", duration: 1200 },
        { text: "3 × 100 m strides", reps: 3, duration: 60, rest: 30 }
      ],
      mobility: ["Hamstring stretch – 60 sec"]
    },
    Wednesday: {
      title: "Recovery",
      explain: "Easy aerobic recovery run or cross-training.",
      warmup: ["5 min brisk walk"],
      main: [{ text: "Easy run or cross-training", duration: 1200 }],
      mobility: ["Full body mobility flow – 10 min"]
    },
    Thursday: {
      title: "VO₂ Max / Hill Sprint",
      explain: "Select VO₂ Max or Hill Sprint for high intensity.",
      warmup: ["10 min easy jog", "Running drills"],
      mainVO2: [{ text: "500 m faster than goal pace", reps: 5, duration: Math.round(500/100*pace100*0.95), rest: 120 }],
      mainHill: [{ text: "60 m hill sprint", reps: 6, duration: 20, rest: 90 }],
      mobility: ["Quad stretch – 60 sec"]
    },
    Friday: {
      title: "Endurance + Strides",
      explain: "Easy aerobic run with strides.",
      warmup: ["5–10 min easy jog"],
      main: [
        { text: "30 min easy run", duration: 1800 },
        { text: "4 × 100 m strides", reps: 4, duration: 60, rest: 30 }
      ],
      mobility: ["Foam rolling – 10 min"]
    },
    Saturday: {
      title: "Race Simulation",
      explain: "Practice pacing with broken race efforts.",
      warmup: ["10 min easy jog"],
      main: [
        { text: "1 km slower than goal pace", duration: 300 },
        { text: "2 min recovery", duration: 120 },
        { text: "500 m @ goal pace", duration: 150 },
        { text: "2 × 400 m fast finish", reps: 2, duration: Math.round(400/100*pace100), rest: 60 }
      ],
      mobility: ["Hip flexor stretch – 60 sec"]
    }
  };

  const daySelect = document.getElementById("daySelect");
  const dayTitle = document.getElementById("dayTitle");
  const dayExplain = document.getElementById("dayExplain");
  const warmupList = document.getElementById("warmupList");
  const mainBlock = document.getElementById("mainBlock");
  const mobilityList = document.getElementById("mobilityList");
  const feedbackBlock = document.getElementById("feedbackBlock");
  const topTick = document.getElementById("topTick");
  const calendarGrid = document.getElementById("calendarGrid");
  const sessionTimer = document.getElementById("sessionTimer");
  const startSession = document.getElementById("startSession");
  const pauseSession = document.getElementById("pauseSession");
  const resetSession = document.getElementById("resetSession");

  const beep = new Audio("https://www.soundjay.com/buttons/beep-07.wav");

  let sessionSeconds = 0;
  let sessionInterval;
  let currentRepIndex = 0;
  let intervalTimer;

  function formatTime(sec){
    const m = Math.floor(sec/60).toString().padStart(2,"0");
    const s = (sec%60).toString().padStart(2,"0");
    return `${m}:${s}`;
  }

  function formatHMS(sec){
    const h = Math.floor(sec/3600).toString().padStart(2,"0");
    const m = Math.floor((sec%3600)/60).toString().padStart(2,"0");
    const s = (sec%60).toString().padStart(2,"0");
    return `${h}:${m}:${s}`;
  }

  startSession.addEventListener("click", ()=>{
    clearInterval(sessionInterval);
    sessionInterval = setInterval(()=>{
      sessionSeconds++;
      sessionTimer.textContent = formatHMS(sessionSeconds);
    },1000);
    startIntervalTimers();
    topTick.checked = true;
  });

  pauseSession.addEventListener("click", ()=>clearInterval(sessionInterval));
  resetSession.addEventListener("click", ()=>{
    clearInterval(sessionInterval);
    sessionSeconds = 0;
    sessionTimer.textContent = formatHMS(sessionSeconds);
    document.querySelectorAll(".repRow input[type=checkbox]").forEach(cb=>cb.checked = false);
    document.querySelectorAll(".repRow").forEach(r=>r.classList.remove("active","completed"));
    topTick.checked = false;
  });

  Object.keys(plan).forEach(day=>{
    const opt = document.createElement("option");
    opt.value = day;
    opt.textContent = day;
    daySelect.appendChild(opt);
  });

  function renderDay(day){
    const data = plan[day];
    dayTitle.textContent = day;
    dayExplain.textContent = data.explain;

    warmupList.innerHTML = "";
    data.warmup.forEach(w=>{
      const li = document.createElement("li");
      li.textContent = w;
      warmupList.appendChild(li);
    });

    mainBlock.innerHTML = "";
    let mainSets = data.main || [];
    if(day==="Thursday"){
      const sel = document.createElement("select");
      sel.innerHTML = `<option value="VO2">VO₂ Max</option><option value="Hill">Hill Sprints</option>`;
      mainBlock.appendChild(sel);
      mainSets = data.mainVO2;
      sel.addEventListener("change", (e)=>{
        mainSets = e.target.value==="Hill"?data.mainHill:data.mainVO2;
        renderMain(mainSets);
      });
    }
    renderMain(mainSets);

    mobilityList.innerHTML = "";
    data.mobility.forEach(m=>{
      const div = document.createElement("div");
      div.textContent = m;
      mobilityList.appendChild(div);
    });
  }

  function renderMain(sets){
    mainBlock.querySelectorAll(".repRow, .restRow").forEach(el=>el.remove());
    sets.forEach(set=>{
      const reps = set.reps||1;
      for(let i=1; i<=reps; i++){
        const div = document.createElement("div");
        div.className = "repRow";
        div.innerHTML = `<span class="repText">${set.text} (Rep ${i}/${reps})</span>
                         <span class="timerSpan" data-duration="${set.duration}">${formatTime(set.duration)}</span>
                         <input type="checkbox">`;
        mainBlock.appendChild(div);
        if(set.rest){
          const rv = document.createElement("div");
          rv.className = "restRow";
          rv.textContent = `Rest ${formatTime(set.rest)}`;
          mainBlock.appendChild(rv);
        }
      }
    });
  }

  function startIntervalTimers(){
    clearInterval(intervalTimer);
    const repRows = Array.from(mainBlock.querySelectorAll(".repRow"));
    currentRepIndex = 0;
    runNext(repRows);
  }

  function runNext(repRows){
    if(currentRepIndex >= repRows.length) return;
    const row = repRows[currentRepIndex];
    const span = row.querySelector(".timerSpan");
    const cb = row.querySelector("input[type=checkbox]");
    let sec = parseInt(span.getAttribute("data-duration"));
    row.classList.add("active");
    beep.play();
    intervalTimer = setInterval(()=>{
      sec--;
      span.textContent = formatTime(sec);
      if(sec<=0){
        clearInterval(intervalTimer);
        beep.play();
        cb.checked = true;
        row.classList.remove("active");
        row.classList.add("completed");
        currentRepIndex++;
        runNext(repRows);
      }
    },1000);
  }

  daySelect.addEventListener("change", e=>renderDay(e.target.value));

  renderDay("Monday");
});
