if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()));
}

document.addEventListener("DOMContentLoaded", () => {

  // -----------------------
  // CONFIG
  // -----------------------
  const goalPaceSecPerKm = 240; // 8:00 per 2 km → 4:00/km
  const beep = new Audio("https://www.soundjay.com/buttons/beep-07.wav");

  // -----------------------
  // 6-Day Training Plan
  // -----------------------
  const plan = {
    Monday: {
      title: "Intervals",
      explain: "Short, fast repetitions at 2 km pace to develop speed and running economy.",
      warmup: ["10 min easy jog", "Dynamic mobility (hips, calves, ankles)"],
      main: [{ text: "400 m @ goal pace", reps: 6, duration: Math.round(400/1000*goalPaceSecPerKm), rest: 20 }],
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
      mainVO2: [{ text: "500 m slightly faster than goal pace", reps: 5, duration: Math.round(500/1000*(goalPaceSecPerKm*0.95)), rest: 120 }],
      mainHill: [{ text: "60 m hill sprint (1:6 gradient)", reps: 6, duration: 20, rest: 90 }],
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
  const warmupList = document.getElementById("warmupList");
  const mainBlock = document.getElementById("mainBlock");
  const mobilityList = document.getElementById("mobilityList");
  const feedbackBlock = document.getElementById("feedbackBlock");

  const sessionTime = document.getElementById("sessionTime");
  const startSession = document.getElementById("startSession");
  const pauseSession = document.getElementById("pauseSession");
  const resetSession = document.getElementById("resetSession");

  const topTick = document.createElement("input");
  topTick.type = "checkbox";
  topTick.style.width = "22px";
  topTick.style.height = "22px";
  topTick.style.marginRight = "8px";
  topTick.style.cursor = "pointer";
  const tickLabel = document.createElement("span");
  tickLabel.textContent = "Day Started";
  const tickContainer = document.createElement("div");
  tickContainer.className = "row";
  tickContainer.appendChild(topTick);
  tickContainer.appendChild(tickLabel);
  document.getElementById("dayCard").insertBefore(tickContainer, warmupList.parentElement);

  // -----------------------
  // Calendar
  // -----------------------
  const calendarBlock = document.createElement("div");
  calendarBlock.className = "card";
  calendarBlock.innerHTML = `<div class="cardTitle">3-Week Calendar</div>`;
  const calendarGrid = document.createElement("div");
  calendarGrid.style.display = "grid";
  calendarGrid.style.gridTemplateColumns = "repeat(7,1fr)";
  calendarGrid.style.gap = "4px";
  calendarBlock.appendChild(calendarGrid);
  document.querySelector(".app").appendChild(calendarBlock);

  // Build initial calendar
  const startDate = new Date(); // today
  startDate.setDate(startDate.getDate() - startDate.getDay()); // move to Sunday of current week
  const days = [];
  for (let w = 0; w < 3; w++) {
    for (let d = 1; d <= 6; d++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + d + w*7);
      days.push({ date: day, completed: false, name: Object.keys(plan)[d-1] });
      const div = document.createElement("div");
      div.textContent = `${day.toLocaleDateString('en-GB',{weekday:'short'})}`;
      div.style.padding = "4px";
      div.style.borderRadius = "6px";
      div.style.textAlign = "center";
      div.style.background = "rgba(255,255,255,0.05)";
      div.setAttribute("data-index", days.length-1);
      calendarGrid.appendChild(div);
    }
  }

  // -----------------------
  // Timers
  // -----------------------
  let sessionSeconds = 0;
  let sessionInterval;
  let currentRepIndex = 0;
  let intervalTimer;

  function formatHMS(sec) {
    const h = Math.floor(sec / 3600).toString().padStart(2,"0");
    const m = Math.floor((sec % 3600)/60).toString().padStart(2,"0");
    const s = (sec % 60).toString().padStart(2,"0");
    return `${h}:${m}:${s}`;
  }
  function formatTime(sec){
    const m = Math.floor(sec/60).toString().padStart(2,"0");
    const s = (sec%60).toString().padStart(2,"0");
    return `${m}:${s}`;
  }

  startSession.addEventListener("click", () => {
    if(!topTick.checked) topTick.checked=true; // mark started
    topTick.style.background = "#6fd3ff"; // blue when active
    clearInterval(sessionInterval);
    sessionInterval = setInterval(()=>{
      sessionSeconds++;
      sessionTime.textContent = formatHMS(sessionSeconds);
    },1000);
    beep.play();
    startIntervalTimers();
  });
  pauseSession.addEventListener("click", ()=>clearInterval(sessionInterval));
  resetSession.addEventListener("click", ()=>{
    clearInterval(sessionInterval);
    clearInterval(intervalTimer);
    sessionSeconds=0;
    sessionTime.textContent=formatHMS(sessionSeconds);
    document.querySelectorAll(".repRow input[type=checkbox]").forEach(cb=>cb.checked=false);
    document.querySelectorAll(".repRow").forEach(r=>{r.classList.remove("completed","active");});
    document.querySelectorAll(".timerSpan").forEach(span=>{
      span.textContent=formatTime(parseInt(span.getAttribute("data-duration")));
    });
    topTick.checked=false;
    topTick.style.background=""; 
  });

  // -----------------------
  // Populate Day Selector
  // -----------------------
  Object.keys(plan).forEach(day=>{
    const opt=document.createElement("option");
    opt.value=day;
    opt.textContent=day;
    daySelect.appendChild(opt);
  });

  // -----------------------
  // Render Day
  // -----------------------
  function renderDay(day){
    const data = plan[day];
    dayTitle.textContent = day;

    // explanation
    const explainCard = document.createElement("div");
    explainCard.className="card";
    explainCard.innerHTML=`<div class="cardTitle">${data.title}</div><div class="muted">${data.explain}</div>`;
    const existingExplain = dayCard.querySelector(".card.explainCard");
    if(existingExplain) existingExplain.remove();
    explainCard.classList.add("explainCard");
    dayCard.insertBefore(explainCard,warmupList.parentElement);

    // Warm-up
    warmupList.innerHTML="";
    data.warmup.forEach(item=>{
      const li=document.createElement("li");
      li.textContent=item;
      warmupList.appendChild(li);
    });

    // Thursday dropdown
    let mainSets = data.main || [];
    if(day==="Thursday"){
      const select = document.createElement("select");
      const opt1 = document.createElement("option");
      opt1.value="VO2"; opt1.textContent="VO₂ Max Intervals";
      const opt2 = document.createElement("option");
      opt2.value="Hill"; opt2.textContent="Hill Sprints";
      select.appendChild(opt1); select.appendChild(opt2);
      explainCard.appendChild(select);
      mainSets = data.mainVO2;
      select.addEventListener("change", e=>{
        mainSets = e.target.value==="VO2"?data.mainVO2:data.mainHill;
        renderMain(mainSets);
      });
    }

    renderMain(mainSets);

    // Mobility
    mobilityList.innerHTML="";
    data.mobility.forEach(item=>{
      const div=document.createElement("div");
      div.textContent=item;
      mobilityList.appendChild(div);
    });

    // Feedback
    feedbackBlock.innerHTML=`<div class="card"><div class="cardTitle">Feedback</div><div class="muted">Complete all reps at target pace → increase pace next week. Missed reps → maintain pace.</div></div>`;
  }

  function renderMain(mainSets){
    mainBlock.innerHTML="";
    mainSets.forEach(set=>{
      const reps=set.reps||1;
      for(let i=1;i<=reps;i++){
        const div=document.createElement("div");
        div.className="repRow";
        div.innerHTML=`
          <span class="repText">${set.text} (Rep ${i}/${reps})</span>
          <span class="timerSpan" data-duration="${set.duration}">${formatTime(set.duration)}</span>
          <input type="checkbox" />
        `;
        mainBlock.appendChild(div);
        if(set.rest){
          const restDiv=document.createElement("div");
          restDiv.className="restRow";
          restDiv.textContent=`Rest ${formatTime(set.rest)}`;
          mainBlock.appendChild(restDiv);
        }
      }
    });
  }

  function startIntervalTimers(){
    clearInterval(intervalTimer);
    const repRows = Array.from(mainBlock.querySelectorAll(".repRow"));
    currentRepIndex=0;
    runNextRep(repRows);
  }

  function runNextRep(repRows){
    if(currentRepIndex>=repRows.length) return;
    repRows.forEach(r=>r.classList.remove("active"));
    const row = repRows[currentRepIndex];
    row.classList.add("active");
    const timerSpan = row.querySelector(".timerSpan");
    const cb = row.querySelector("input[type=checkbox]");
    let sec=parseInt(timerSpan.getAttribute("data-duration"));
    beep.play();

    intervalTimer = setInterval(()=>{
      sec--;
      timerSpan.textContent=formatTime(sec);
      if(sec<=0){
        clearInterval(intervalTimer);
        beep.play();
        cb.checked=true;
        row.classList.remove("active");
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
  daySelect.addEventListener("change", e=>renderDay(e.target.value));
});
