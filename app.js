// Unregister old service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()));
}

document.addEventListener("DOMContentLoaded", () => {

  // -----------------------
  // Goal pace calculation
  // -----------------------
  const last2kmSec = 8*60 + 36; // last 2km run 8:36
  const goal2kmSec = 8*60 + 0;  // goal 8:00
  const goalSpeedKph = (2 / (goal2kmSec/3600)).toFixed(1); // km/h

  // -----------------------
  // Plan with reps, duration, rest, speed in kph
  // -----------------------
  const plan = {
    Monday: {
      title: "Intervals",
      explain: `Short, fast repetitions at full effort to develop speed and running economy. 400m reps at ${goalSpeedKph}kph.`,
      warmup: ["10 min easy jog", "Dynamic mobility (hips, calves, ankles)"],
      main: [
        { text: `400 m full effort`, reps: 6, duration: 400/goalSpeedKph*3600, rest: 20, speed: goalSpeedKph }
      ],
      mobility: ["Hip flexor stretch – 60 sec", "Calf stretch – 60 sec"]
    },
    Tuesday: {
      title: "Tempo Run",
      explain: `Sustained tempo run for ${Math.round(goal2kmSec*2.5/60)} min to improve lactate threshold. Strides at ${ (goalSpeedKph-2).toFixed(1) }kph.`,
      warmup: ["10 min easy jog"],
      main: [
        { text: "Tempo run", duration: Math.round(goal2kmSec*2.5), speed: (goalSpeedKph-2).toFixed(1) },
        { text: "Relaxed strides", reps: 3, duration: 60, rest:30, speed: (goalSpeedKph-1).toFixed(1) }
      ],
      mobility: ["Hamstring stretch – 60 sec"]
    },
    Wednesday: {
      title: "Recovery",
      explain: "Low intensity aerobic work to promote recovery and maintain form.",
      warmup: ["5 min brisk walk"],
      main: [
        { text: "Easy run or cross-training", duration: 20*60, speed: (goalSpeedKph-4).toFixed(1) }
      ],
      mobility: ["Full body mobility flow – 10 min"]
    },
    Thursday: {
      title: "VO₂ Max / Hill Sprint",
      explain: "Choose VO₂ Max or Hill Sprint using the dropdown.",
      warmup: ["10 min easy jog", "Running drills"],
      mainVO2: [
        { text: `500 m @ ${ (goalSpeedKph*1.05).toFixed(1) }kph`, reps: 5, duration: 500/(goalSpeedKph*1.05)*3600, rest:120 }
      ],
      mainHill: [
        { text: "60 m hill sprint 1:6 gradient", reps: 6, duration: 10, rest:90 }
      ],
      mobility: ["Quad stretch – 60 sec"]
    },
    Friday: {
      title: "Endurance + Strides",
      explain: "Easy aerobic running with short speed exposures. Strides 1 min at slightly faster than tempo.",
      warmup: ["5–10 min easy jog"],
      main: [
        { text: "Easy run", duration: 1800, speed: (goalSpeedKph-3).toFixed(1) },
        { text: "Strides 1 min", reps: 4, duration: 60, rest:30, speed: (goalSpeedKph-1).toFixed(1) }
      ],
      mobility: ["Foam rolling – 10 min"]
    },
    Saturday: {
      title: "Race Simulation",
      explain: `Broken race effort to practice pacing. Runs at goal pace ${goalSpeedKph}kph.`,
      warmup: ["10 min easy jog"],
      main: [
        { text: `1 km slightly slower than goal pace`, duration: 300, speed: (goalSpeedKph-0.5).toFixed(1) },
        { text: "Recovery", duration: 120 },
        { text: "500 m at goal pace", duration: 500/goalSpeedKph*3600, speed: goalSpeedKph },
        { text: "Fast finish 400m", reps:2, duration: 400/goalSpeedKph*3600, rest:60, speed: goalSpeedKph }
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
  const sessionTime = document.getElementById("sessionTime");
  const startSession = document.getElementById("startSession");
  const pauseSession = document.getElementById("pauseSession");
  const resetSession = document.getElementById("resetSession");
  const calendarDiv = document.getElementById("calendar");
  const preFatigue = document.getElementById("preFatigue");
  const postFatigue = document.getElementById("postFatigue");

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
      span.parentElement.classList.remove("active","completed");
    });
    updateCalendar();
  });

  function formatHMS(sec) {
    const h = Math.floor(sec / 3600).toString().padStart(2,"0");
    const m = Math.floor((sec%3600)/60).toString().padStart(2,"0");
    const s = (sec%60).toString().padStart(2,"0");
    return `${h}:${m}:${s}`;
  }
  function formatTime(sec){
    const m = Math.floor(sec/60).toString().padStart(2,"0");
    const s = Math.floor(sec%60).toString().padStart(2,"0");
    return `${m}:${s}`;
  }

  // -----------------------
  // Populate day selector
  // -----------------------
  Object.keys(plan).forEach(day => {
    const opt = document.createElement("option");
    opt.value = day;
    opt.textContent = day;
    daySelect.appendChild(opt);
  });

  // -----------------------
  // Render day
  // -----------------------
  function renderDay(day){
    const data = plan[day];
    dayTitle.textContent = day;

    // Thursday dropdown
    let mainData = data.main || [];
    if(day === "Thursday"){
      dayExplain.innerHTML = `<div class="cardTitle">${data.title}</div><div class="muted">${data.explain}</div>
      <select id="thursdaySelect">
        <option value="VO2">VO₂ Max</option>
        <option value="Hill">Hill Sprint</option>
      </select>`;
      const thSelect = document.getElementById("thursdaySelect");
      mainData = data.mainVO2;
      thSelect.addEventListener("change",(e)=>{
        mainData = e.target.value==="VO2"? data.mainVO2:data.mainHill;
        populateReps(mainData);
      });
    } else {
      dayExplain.innerHTML = `<div class="cardTitle">${data.title}</div><div class="muted">${data.explain}</div>`;
      mainData = data.main;
    }

    // Warm-up
    warmupList.innerHTML="";
    data.warmup.forEach(item=>{
      const li=document.createElement("li");
      li.textContent=item;
      warmupList.appendChild(li);
    });

    // Mobility
    mobilityList.innerHTML="";
    data.mobility.forEach(item=>{
      const div=document.createElement("div");
      div.textContent=item;
      mobilityList.appendChild(div);
    });

    // Populate reps
    populateReps(mainData);
  }

  function populateReps(mainData){
    mainBlock.innerHTML="";
    mainData.forEach((set)=>{
      const reps = set.reps || 1;
      for(let i=1;i<=reps;i++){
        const div = document.createElement("div");
        div.className="repRow";
        div.innerHTML=`
          <span class="repText">${set.text} (Rep ${i}/${reps}) ${set.speed? "@ "+set.speed+"kph":""}</span>
          <span class="timerSpan" data-duration="${Math.round(set.duration)}">${formatTime(Math.round(set.duration))}</span>
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
    updateCalendar();
  }

  // -----------------------
  // Interval logic
  // -----------------------
  let currentRepIndex=0;
  let intervalTimer;
  function startIntervalTimers(){
    clearInterval(intervalTimer);
    const repRows=Array.from(mainBlock.querySelectorAll(".repRow"));
    currentRepIndex=0;
    runNextRep(repRows);
  }

  function runNextRep(repRows){
    if(currentRepIndex>=repRows.length) return;
    const row=repRows[currentRepIndex];
    const timerSpan=row.querySelector(".timerSpan");
    const cb=row.querySelector("input[type=checkbox]");
    let sec=parseInt(timerSpan.getAttribute("data-duration"));
    row.classList.add("active");
    beep.play();

    intervalTimer=setInterval(()=>{
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
        updateCalendar();
      }
    },1000);
  }

  // -----------------------
  // Calendar
  // -----------------------
  function updateCalendar(){
    calendarDiv.innerHTML="";
    const today=new Date();
    Object.keys(plan).forEach((day,i)=>{
      const div=document.createElement("div");
      div.className="calendarDay";
      div.textContent=day.slice(0,3);
      const allChecked=Array.from(document.querySelectorAll(".repRow input[type=checkbox]")).every(cb=>cb.checked);
      if(allChecked && daySelect.value===day) div.classList.add("completed");
      if(daySelect.value===day) div.classList.add("active");
      calendarDiv.appendChild(div);
    });
  }

  // -----------------------
  // Init
  // -----------------------
  renderDay("Monday");
  daySelect.addEventListener("change",(e)=>renderDay(e.target.value));

});
