if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()));
}

document.addEventListener("DOMContentLoaded", () => {

  // -----------------------
  // Goal pace calculation (based on 8:36 last 2km, target 8:00)
  // -----------------------
  const last2kmSec = 8*60 + 36;
  const target2kmSec = 8*60;
  const goalPaceSecPer100m = target2kmSec / 20; // 20 x 100m in 2km

  // -----------------------
  // 6-Day Plan with Thursday option
  // -----------------------
  const plan = {
    Monday: {
      title: "Intervals",
      explain: "6 × 400m at goal pace with short recoveries.",
      warmup: ["10 min easy jog", "Dynamic mobility (hips, calves, ankles)"],
      main: [{ text: "400 m @ goal pace", reps: 6, duration: Math.round(400/100*goalPaceSecPer100m), rest: 20 }],
      mobility: ["Hip flexor stretch – 60 sec", "Calf stretch – 60 sec"]
    },
    Tuesday: {
      title: "Tempo Run",
      explain: "Sustained effort to improve lactate threshold.",
      warmup: ["10 min easy jog"],
      main: [
        { text: "20 min tempo run", duration: 1200 },
        { text: "3 × 100 m relaxed strides", reps: 3, duration: 60, rest: 30 }
      ],
      mobility: ["Hamstring stretch – 60 sec"]
    },
    Wednesday: {
      title: "Recovery",
      explain: "Low intensity aerobic work to recover.",
      warmup: ["5 min brisk walk"],
      main: [{ text: "20 min easy run or cross-training", duration: 1200 }],
      mobility: ["Full body mobility flow – 10 min"]
    },
    Thursday: {
      title: "VO₂ Max Intervals",
      explain: "Select VO₂ Max or Hill Sprint below.",
      warmup: ["10 min easy jog", "Running drills"],
      mainVO2: [{ text: "500 m slightly faster than goal pace", reps: 5, duration: Math.round(500/100*goalPaceSecPer100m*0.95), rest: 120 }],
      mainHill: [{ text: "Hill sprint 60 m @ max effort", reps: 6, duration: 20, rest: 90 }],
      mobility: ["Quad stretch – 60 sec"]
    },
    Friday: {
      title: "Endurance + Strides",
      explain: "Easy aerobic run with short strides.",
      warmup: ["5–10 min easy jog"],
      main: [
        { text: "30 min easy run", duration: 1800 },
        { text: "4 × 100 m strides", reps: 4, duration: 60, rest: 30 }
      ],
      mobility: ["Foam rolling – 10 min"]
    },
    Saturday: {
      title: "Race Simulation",
      explain: "Practice broken race effort and pacing.",
      warmup: ["10 min easy jog"],
      main: [
        { text: "1 km slightly slower than goal pace", duration: 300 },
        { text: "2 min recovery", duration: 120 },
        { text: "500 m at goal pace", duration: 150 },
        { text: "2 × 400 m fast finish", reps: 2, duration: 120, rest: 60 }
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
  const topTick = document.getElementById("topTick");
  const calendarGrid = document.getElementById("calendarGrid");

  const beep = new Audio("https://www.soundjay.com/buttons/beep-07.wav");

  // -----------------------
  // Session Timer
  // -----------------------
  let sessionSeconds = 0;
  let sessionInterval;

  function startSessionTimer() {
    clearInterval(sessionInterval);
    sessionInterval = setInterval(() => {
      sessionSeconds++;
    }, 1000);
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

    // Explanation card
    dayExplain.innerHTML = `<div class="cardTitle">${data.title}</div><div class="muted">${data.explain}</div>`;

    // Warm-up
    warmupList.innerHTML = "";
    data.warmup.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      warmupList.appendChild(li);
    });

    // Main workout
    mainBlock.innerHTML = "";
    let mainSets = data.main || [];
    if(day === "Thursday"){
      // Add VO2/Hill selector
      const select = document.createElement("select");
      select.id = "thursdayMode";
      const opt1 = document.createElement("option"); opt1.value="VO2"; opt1.textContent="VO₂ Max"; select.appendChild(opt1);
      const opt2 = document.createElement("option"); opt2.value="Hill"; opt2.textContent="Hill Sprints"; select.appendChild(opt2);
      mainBlock.appendChild(select);
      mainSets = data.mainVO2;
      select.addEventListener("change", (e)=>{
        mainBlock.innerHTML=""; mainBlock.appendChild(select);
        if(e.target.value==="VO2") mainSets = data.mainVO2;
        else mainSets = data.mainHill;
        renderReps(mainSets);
      });
    }
    renderReps(mainSets);

    // Mobility
    mobilityList.innerHTML = "";
    data.mobility.forEach(item => {
      const div = document.createElement("div");
      div.textContent = item;
      mobilityList.appendChild(div);
    });

    // Feedback
    feedbackBlock.innerHTML = `<div class="card"><div class="cardTitle">Feedback</div><div class="muted">Complete all reps at target pace → increase pace next week. Missed reps → maintain pace.</div></div>`;

    topTick.checked = false;
  }

  function renderReps(sets){
    sets.forEach((set)=>{
      const reps = set.reps || 1;
      for(let i=1;i<=reps;i++){
        const div = document.createElement("div");
        div.className="repRow";
        div.innerHTML = `<span class="repText">${set.text} (Rep ${i}/${reps})</span>
                         <span class="timerSpan" data-duration="${set.duration}">${formatTime(set.duration)}</span>
                         <input type="checkbox">`;
        mainBlock.appendChild(div);
        if(set.rest){
          const restDiv = document.createElement("div");
          restDiv.className="restRow";
          restDiv.textContent=`Rest ${formatTime(set.rest)}`;
          mainBlock.appendChild(restDiv);
        }
      }
    });
  }

  function formatTime(sec){
    const m=Math.floor(sec/60).toString().padStart(2,"0");
    const s=(sec%60).toString().padStart(2,"0");
    return `${m}:${s}`;
  }

  // -----------------------
  // Calendar
  // -----------------------
  function renderCalendar(){
    const today = new Date();
    calendarGrid.innerHTML="";
    for(let i=0;i<18;i++){
      const dayBox = document.createElement("div");
      dayBox.style.height="40px";
      dayBox.style.border="1px solid var(--line)";
      dayBox.style.display="flex";
      dayBox.style.alignItems="center";
      dayBox.style.justifyContent="center";
      dayBox.style.backgroundColor=i===today.getDay()-1?"#6fd3ff":"var(--card2)";
      dayBox.textContent=i+1;
      calendarGrid.appendChild(dayBox);
    }
  }

  renderCalendar();
  renderDay("Monday");
  daySelect.addEventListener("change", e=>renderDay(e.target.value));

});
