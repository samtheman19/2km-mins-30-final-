if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()));
}

document.addEventListener("DOMContentLoaded", () => {

  // -----------------------
  // Goal pace calculation
  // -----------------------
  const last2km = 8*60+36; // 8:36 last 2km
  const target2km = 8*60; // 8:00 goal
  const pacePer100m = target2km / 20; // 2 km = 20 × 100 m
  function formatMMSS(sec){ const m=Math.floor(sec/60).toString().padStart(2,"0"); const s=(sec%60).toString().padStart(2,"0"); return `${m}:${s}`; }

  // -----------------------
  // Plan data
  // -----------------------
  const basePlan = {
    Monday: {
      title: "Intervals",
      explain: "Short, fast repetitions at 2 km pace to develop speed and running economy.",
      warmup: ["10 min easy jog","Dynamic mobility (hips, calves, ankles)"],
      main: [{ text:"400 m", reps:6, duration:Math.round(400/100*pacePer100m), rest:20 }],
      mobility:["Hip flexor stretch – 60 sec","Calf stretch – 60 sec"]
    },
    Tuesday: {
      title:"Tempo Run",
      explain:"Sustained effort to improve lactate threshold and fatigue resistance.",
      warmup:["10 min easy jog"],
      main:[
        { text:"Continuous tempo run", duration:1500 },
        { text:"Relaxed strides", reps:3, duration:60, rest:30 }
      ],
      mobility:["Hamstring stretch – 60 sec"]
    },
    Wednesday:{
      title:"Recovery",
      explain:"Low intensity aerobic work to promote recovery and maintain form.",
      warmup:["5 min brisk walk"],
      main:[{ text:"Easy run or cross-training", duration:1200 }],
      mobility:["Full body mobility flow – 10 min"]
    },
    Thursday:{
      title:"VO₂ Max Intervals",
      explain:"Longer intervals slightly faster than race pace to increase aerobic capacity.",
      warmup:["10 min easy jog","Running drills"],
      main:[{ text:"500 m", reps:5, duration:Math.round(500/100*pacePer100m*0.97), rest:120 }],
      mobility:["Quad stretch – 60 sec"]
    },
    ThursdayHill:{
      title:"Hill Sprints",
      explain:"Short steep hill sprints for power and speed.",
      warmup:["10 min easy jog","Dynamic mobility"],
      main:[{ text:"Hill sprint 60 m", reps:6, duration:12, rest:90 }],
      mobility:["Quad stretch – 60 sec"]
    },
    Friday:{
      title:"Endurance + Strides",
      explain:"Easy aerobic running with short speed exposure to improve mechanics.",
      warmup:["5–10 min easy jog"],
      main:[
        { text:"Easy run", duration:1800 },
        { text:"Strides", reps:4, duration:60, rest:30 }
      ],
      mobility:["Foam rolling – 10 min"]
    },
    Saturday:{
      title:"Race Simulation",
      explain:"Broken race effort to practice pacing and finishing strong.",
      warmup:["10 min easy jog"],
      main:[
        { text:"1 km slightly slower than goal pace", duration:300 },
        { text:"Recovery", duration:120 },
        { text:"500 m at goal pace", duration:150 },
        { text:"Fast finish", reps:2, duration:120, rest:60 }
      ],
      mobility:["Hip flexor stretch – 60 sec"]
    }
  };

  // -----------------------
  // DOM elements
  // -----------------------
  const daySelect = document.getElementById("daySelect");
  const thursdayMode = document.getElementById("thursdayMode");
  const dayTitle = document.getElementById("dayTitle");
  const dayExplain = document.getElementById("dayExplain");
  const warmupList = document.getElementById("warmupList");
  const mainBlock = document.getElementById("mainBlock");
  const mobilityList = document.getElementById("mobilityList");
  const feedbackBlock = document.getElementById("feedbackBlock");
  const calendar = document.getElementById("calendar");
  const sessionTime = document.getElementById("sessionTime");
  const startSession = document.getElementById("startSession");
  const pauseSession = document.getElementById("pauseSession");
  const resetSession = document.getElementById("resetSession");

  const beep = new Audio("https://www.soundjay.com/buttons/beep-07.wav");

  // -----------------------
  // Session timer
  // -----------------------
  let sessionSeconds = 0;
  let sessionInterval;

  startSession.addEventListener("click", () => {
    clearInterval(sessionInterval);
    sessionInterval = setInterval(()=>{ sessionSeconds++; sessionTime.textContent=formatHMS(sessionSeconds); },1000);
    beep.play();
    startIntervalTimers();
  });
  pauseSession.addEventListener("click", ()=>clearInterval(sessionInterval));
  resetSession.addEventListener("click", ()=>{
    clearInterval(sessionInterval); sessionSeconds=0; sessionTime.textContent=formatHMS(sessionSeconds);
    document.querySelectorAll(".repRow input[type=checkbox]").forEach(cb=>cb.checked=false);
    document.querySelectorAll(".repRow").forEach(r=>r.classList.remove("active","completed"));
    document.querySelectorAll(".timerSpan").forEach(span=>{
      const dur=parseInt(span.getAttribute("data-duration"))||0;
      span.textContent=formatTime(dur);
    });
  });

  function formatHMS(sec){ const h=Math.floor(sec/3600).toString().padStart(2,"0"); const m=Math.floor((sec%3600)/60).toString().padStart(2,"0"); const s=(sec%60).toString().padStart(2,"0"); return `${h}:${m}:${s}`; }

  // -----------------------
  // Populate Day Selector
  // -----------------------
  Object.keys(basePlan).filter(k=>!k.includes("Hill")).forEach(day=>{
    const opt=document.createElement("option"); opt.value=day; opt.textContent=day; daySelect.appendChild(opt);
  });

  // -----------------------
  // Render day
  // -----------------------
  function renderDay(day){
    let data = (day==="Thursday" && thursdayMode.value==="hill") ? basePlan.ThursdayHill : basePlan[day];
    dayTitle.textContent = day;
    dayExplain.innerHTML = `<div class="cardTitle">${data.title}</div><div class="muted">${data.explain}</div>`;

    warmupList.innerHTML=""; data.warmup.forEach(item=>{ const li=document.createElement("li"); li.textContent=item; warmupList.appendChild(li); });

    mainBlock.innerHTML="";
    data.main.forEach(set=>{
      const reps = set.reps || 1;
      for(let i=1;i<=reps;i++){
        const dur = set.duration;
        const div=document.createElement("div"); div.className="repRow";
        div.innerHTML=`<span class="repText">${set.text} – ${formatMMSS(dur)} (Rep ${i}/${reps})</span>
          <span class="timerSpan" data-duration="${dur}">${formatTime(dur)}</span>
          <input type="checkbox"/>`;
        mainBlock.appendChild(div);
        if(set.rest){ const rdiv=document.createElement("div"); rdiv.textContent=`Rest ${formatTime(set.rest)}`; rdiv.style.marginLeft="20px"; mainBlock.appendChild(rdiv); }
      }
    });

    mobilityList.innerHTML=""; data.mobility.forEach(item=>{ const div=document.createElement("div"); div.textContent=item; mobilityList.appendChild(div); });

    feedbackBlock.innerHTML=`<div class="card"><div class="cardTitle">Feedback</div><div class="muted">Complete all reps at target pace → increase pace next week. Missed reps → maintain pace.</div></div>`;

    generateCalendar();
  }

  daySelect.addEventListener("change", e=>renderDay(e.target.value));
  thursdayMode.addEventListener("change", ()=>{ if(daySelect.value==="Thursday") renderDay("Thursday"); });

  // -----------------------
  // Interval timers
  // -----------------------
  let currentRepIndex=0;
  let intervalTimer;
  function startIntervalTimers(){
    clearInterval(intervalTimer);
    const repRows=Array.from(mainBlock.querySelectorAll(".repRow"));
    currentRepIndex=0; runNextRep(repRows);
  }
  function runNextRep(repRows){
    if(currentRepIndex>=repRows.length) return;
    const row=repRows[currentRepIndex];
    const timerSpan=row.querySelector(".timerSpan");
    const cb=row.querySelector("input[type=checkbox]");
    let sec=parseInt(timerSpan.getAttribute("data-duration"));
    row.classList.add("active"); beep.play();
    intervalTimer=setInterval(()=>{
      sec--; timerSpan.textContent=formatTime(sec);
      if(sec<=0){ clearInterval(intervalTimer); beep.play(); cb.checked=true; row.classList.remove("active"); row.classList.add("completed"); currentRepIndex++; runNextRep(repRows);}
    },1000);
  }

  // -----------------------
  // Calendar
  // -----------------------
  function generateCalendar(){
    calendar.innerHTML="";
    const today=new Date();
    const startDate=new Date(today.getFullYear(),today.getMonth(),today.getDate()-today.getDay()+1); // Monday
    for(let i=0;i<7;i++){
      const d=new Date(startDate); d.setDate(startDate.getDate()+i);
      const div=document.createElement("div"); div.className="calendarDay"; div.textContent=d.getDate();
      const dayNames=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      if(i<dayNames.length){ const reps=Array.from(document.querySelectorAll(".repRow input[type=checkbox]")); if(reps.every(cb=>cb.checked)) div.classList.add("completed"); }
      calendar.appendChild(div);
    }
  }

  // -----------------------
  // Init
  // -----------------------
  renderDay("Monday");

});
