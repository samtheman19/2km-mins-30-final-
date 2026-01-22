if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()));
}

document.addEventListener("DOMContentLoaded", () => {

  const goal2kmTimeSec = 480; // 8:00 goal in seconds
  const last2kmTimeSec = 516; // 8:36 last run
  const distance2km = 2000; // meters

  const goalPaceKph = (distance2km / goal2kmTimeSec) * 3.6; // km/h
  const lastPaceKph = (distance2km / last2kmTimeSec) * 3.6;

  const beep = new Audio("https://www.soundjay.com/buttons/beep-07.wav");

  // -----------------------
  // 6-Day Plan
  // -----------------------
  const plan = {
    Monday: {
      title: "Intervals",
      explain: `Short repetitions at goal pace (${goalPaceKph.toFixed(1)} kph) to develop speed & economy.`,
      warmup: ["10 min easy jog", "Dynamic mobility (hips, calves, ankles)"],
      main: [
        { text: `400 m @ ${goalPaceKph.toFixed(1)} kph`, reps: 6, duration: 98, rest: 20 }
      ],
      mobility: ["Hip flexor stretch – 60 sec", "Calf stretch – 60 sec"]
    },
    Tuesday: {
      title: "Tempo Run",
      explain: `Sustained tempo run 20–25 min at ${ (goalPaceKph - 1).toFixed(1) } kph. Strides 100 m at ${ (goalPaceKph + 1).toFixed(1) } kph.`,
      warmup: ["10 min easy jog"],
      main: [
        { text: "Continuous tempo run", duration: 1500 },
        { text: "Relaxed strides", reps: 3, duration: 60, rest: 30 }
      ],
      mobility: ["Hamstring stretch – 60 sec"]
    },
    Wednesday: {
      title: "Recovery",
      explain: "Low intensity aerobic work to promote recovery & maintain form.",
      warmup: ["5 min brisk walk"],
      main: [
        { text: `Easy run 20 min (~${ (goalPaceKph - 2).toFixed(1) } kph)`, duration: 1200 }
      ],
      mobility: ["Full body mobility flow – 10 min"]
    },
    Thursday: {
      title: "Thursday Workout",
      explain: "Choose between VO₂ Max or Hill Sprint session.",
      warmup: ["10 min easy jog", "Running drills"],
      options: {
        "VO₂ Max": [
          { text: `500 m @ VO₂ Max (~${ (goalPaceKph*1.1).toFixed(1)} kph)`, reps: 5, duration: 60, rest: 120 }
        ],
        "Hill Sprint": [
          { text: "Hill sprint 60 m @ maximal effort 1:6 gradient", reps: 5, duration: 15, rest: 60 }
        ]
      },
      mobility: ["Quad stretch – 60 sec"]
    },
    Friday: {
      title: "Endurance + Strides",
      explain: `Easy aerobic run 30–40 min (~${ (goalPaceKph - 2).toFixed(1)} kph) with 4 × 100 m strides at ~${ (goalPaceKph + 1).toFixed(1)} kph.`,
      warmup: ["5–10 min easy jog"],
      main: [
        { text: "Easy run", duration: 1800 },
        { text: "Strides 100 m", reps: 4, duration: 60, rest: 30 }
      ],
      mobility: ["Foam rolling – 10 min"]
    },
    Saturday: {
      title: "Race Simulation",
      explain: `Broken race effort: 1 km slightly slower (~${ (goalPaceKph - 0.5).toFixed(1)} kph), then 500 m at goal pace (${goalPaceKph.toFixed(1)} kph) and 2 × 400 m fast finish.`,
      warmup: ["10 min easy jog"],
      main: [
        { text: "1 km slightly slower than goal", duration: 300 },
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
  const dayExplain = document.getElementById("dayExplain");
  const warmupList = document.getElementById("warmupList");
  const mainBlock = document.getElementById("mainBlock");
  const mobilityList = document.getElementById("mobilityList");
  const feedbackBlock = document.getElementById("feedbackBlock");
  const sessionTime = document.getElementById("sessionTime");
  const startSession = document.getElementById("startSession");
  const pauseSession = document.getElementById("pauseSession");
  const resetSession = document.getElementById("resetSession");

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
  // Formatters
  // -----------------------
  function formatHMS(sec){
    const h = Math.floor(sec/3600).toString().padStart(2,"0");
    const m = Math.floor((sec%3600)/60).toString().padStart(2,"0");
    const s = (sec%60).toString().padStart(2,"0");
    return `${h}:${m}:${s}`;
  }
  function formatTime(sec){
    const m = Math.floor(sec/60).toString().padStart(2,"0");
    const s = (sec%60).toString().padStart(2,"0");
    return `${m}:${s}`;
  }

  // -----------------------
  // Render Day
  // -----------------------
  function renderDay(day){
    const data = plan[day];
    dayTitle.textContent = day;
    dayExplain.innerHTML = `<div class="cardTitle">${data.title}</div><div class="muted">${data.explain}</div>`;

    // Warm-up
    warmupList.innerHTML="";
    data.warmup.forEach(item=>{
      const li=document.createElement("li");
      li.textContent=item;
      warmupList.appendChild(li);
    });

    // Main sets
    mainBlock.innerHTML="";

    if(day==="Thursday" && data.options){
      const optionSelect=document.createElement("select");
      Object.keys(data.options).forEach(opt=>{
        const o=document.createElement("option");
        o.value=opt;
        o.textContent=opt;
        optionSelect.appendChild(o);
      });
      optionSelect.addEventListener("change", e=>{
        renderThursdayMain(day,e.target.value);
      });
      mainBlock.appendChild(optionSelect);
      renderThursdayMain(day,optionSelect.value);
    } else {
      data.main.forEach(set=>renderRepRow(set));
    }

    // Mobility
    mobilityList.innerHTML="";
    data.mobility.forEach(item=>{
      const div=document.createElement("div");
      div.textContent=item;
      mobilityList.appendChild(div);
    });

    // Feedback
    feedbackBlock.innerHTML=`<div class="card"><div class="cardTitle">Feedback</div>
      <label>Fatigue before:<input type="range" min="1" max="10"/></label>
      <label>Fatigue after:<input type="range" min="1" max="10"/></label>
    </div>`;
  }

  function renderThursdayMain(day,option){
    mainBlock.querySelectorAll(".repRow,.restRow").forEach(r=>r.remove());
    const sets=plan[day].options[option];
    sets.forEach(set=>renderRepRow(set));
  }

  function renderRepRow(set){
    const reps=set.reps||1;
    for(let i=1;i<=reps;i++){
      const div=document.createElement("div");
      div.className="repRow";
      div.innerHTML=`<span class="repText">${set.text} (Rep ${i}/${reps})</span>
        <span class="timerSpan" data-duration="${set.duration}">${formatTime(set.duration)}</span>
        <input type="checkbox"/>`;
      mainBlock.appendChild(div);
      if(set.rest){
        const restDiv=document.createElement("div");
        restDiv.className="restRow";
        restDiv.innerHTML=`<span>Rest</span><span>${formatTime(set.rest)}</span>`;
        mainBlock.appendChild(restDiv);
      }
    }
  }

  // -----------------------
  // Session Timer
  // -----------------------
  let sessionSeconds=0;
  let sessionInterval;
  startSession.addEventListener("click", ()=>{
    clearInterval(sessionInterval);
    sessionInterval=setInterval(()=>{
      sessionSeconds++;
      sessionTime.textContent=formatHMS(sessionSeconds);
    },1000);
    beep.play();
    startIntervalTimers();
  });
  pauseSession.addEventListener("click", ()=>clearInterval(sessionInterval));
  resetSession.addEventListener("click", ()=>{
    clearInterval(sessionInterval);
    sessionSeconds=0;
    sessionTime.textContent=formatHMS(sessionSeconds);
    document.querySelectorAll(".repRow input[type=checkbox]").forEach(cb=>cb.checked=false);
    document.querySelectorAll(".timerSpan").forEach(span=>{
      const dur=parseInt(span.getAttribute("data-duration"))||0;
      span.textContent=formatTime(dur);
    });
  });

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
    beep.play();
    intervalTimer=setInterval(()=>{
      sec--;
      timerSpan.textContent=formatTime(sec);
      if(sec<=0){
        clearInterval(intervalTimer);
        beep.play();
        cb.checked=true;
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
