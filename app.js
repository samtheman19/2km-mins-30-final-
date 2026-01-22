// -----------------------
// Service Worker Cleanup
// -----------------------
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()));
}

document.addEventListener("DOMContentLoaded", () => {

  // -----------------------
  // User Goal Settings
  // -----------------------
  const last2kmTimeSec = 8*60 + 36; // 8:36
  const goal2kmTimeSec = 8*60 + 0;  // 8:00

  function calcKph(distanceM, timeSec) {
    // speed = distance / time (m/s) * 3.6 = km/h
    return ((distanceM / timeSec) * 3.6).toFixed(1);
  }

  // -----------------------
  // 6-Day Training Plan
  // -----------------------
  const plan = {
    Monday: {
      title:"Intervals",
      explain:"Short, fast repetitions at 2 km goal pace to develop speed and running economy.",
      warmup:["10 min easy jog","Dynamic mobility (hips, calves, ankles)"],
      main:[
        {text:"400 m", reps:6, distance:400, duration: Math.round(400/(2000/goal2kmTimeSec)) , rest:20} // duration in sec, speed auto
      ],
      mobility:["Hip flexor stretch – 60 sec","Calf stretch – 60 sec"]
    },
    Tuesday:{
      title:"Tempo Run",
      explain:"Sustained controlled effort to improve lactate threshold. Session ~25 min. Target speed slightly below goal pace.",
      warmup:["10 min easy jog"],
      main:[
        {text:"Continuous tempo run", duration:1500, distance:5000}, // example 5 km tempo
        {text:"3 × 100 m relaxed strides", reps:3, duration:60, rest:30, distance:100}
      ],
      mobility:["Hamstring stretch – 60 sec"]
    },
    Wednesday:{
      title:"Recovery",
      explain:"Low intensity aerobic work to promote recovery and maintain form.",
      warmup:["5 min brisk walk"],
      main:[
        {text:"Easy run or cross-training", duration:1200, distance:2000}
      ],
      mobility:["Full body mobility flow – 10 min"]
    },
    Thursday:{
      title:"VO₂ Max Intervals",
      explain:"Choose between VO₂ Max intervals or Hill Sprints.",
      warmup:["10 min easy jog","Running drills"],
      main:[
        {text:"500 m VO₂ Max", reps:5, distance:500, duration:Math.round(500/(2000/goal2kmTimeSec)*0.95), rest:120}, 
        {text:"Optional: Hill Sprint 60 m", reps:5, distance:60, duration:15, rest:90}
      ],
      mobility:["Quad stretch – 60 sec"]
    },
    Friday:{
      title:"Endurance + Strides",
      explain:"Easy aerobic running with short speed exposure. Strides 1 min at ~14 kph.",
      warmup:["5–10 min easy jog"],
      main:[
        {text:"Easy run", duration:1800, distance:4000},
        {text:"4 × 1 min strides", reps:4, duration:60, rest:30, distance:233} 
      ],
      mobility:["Foam rolling – 10 min"]
    },
    Saturday:{
      title:"Race Simulation",
      explain:"Broken race effort to practice pacing. Speeds per segment calculated from goal 2 km.",
      warmup:["10 min easy jog"],
      main:[
        {text:"1 km slightly slower than goal pace", duration:300, distance:1000},
        {text:"Recovery", duration:120, distance:0},
        {text:"500 m at goal pace", duration:150, distance:500},
        {text:"2 × 400 m fast finish", reps:2, duration:120, rest:60, distance:400}
      ],
      mobility:["Hip flexor stretch – 60 sec"]
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
  const preFatigue = document.getElementById("preFatigue");
  const postFatigue = document.getElementById("postFatigue");
  const calendar = document.getElementById("calendar");

  const beep = new Audio("https://www.soundjay.com/buttons/beep-07.wav");

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
  // Session Timer
  // -----------------------
  let sessionSeconds=0;
  let sessionInterval;
  startSession.addEventListener("click",()=>{
    clearInterval(sessionInterval);
    sessionInterval=setInterval(()=>{
      sessionSeconds++;
      sessionTime.textContent=formatHMS(sessionSeconds);
    },1000);
    startIntervalTimers();
  });
  pauseSession.addEventListener("click",()=>clearInterval(sessionInterval));
  resetSession.addEventListener("click",()=>{
    clearInterval(sessionInterval);
    sessionSeconds=0;
    sessionTime.textContent=formatHMS(sessionSeconds);
    document.querySelectorAll(".repRow input[type=checkbox]").forEach(cb=>cb.checked=false);
    document.querySelectorAll(".timerSpan").forEach(span=>{
      const dur=parseInt(span.getAttribute("data-duration"))||0;
      span.textContent=formatTime(dur);
    });
  });

  function formatHMS(sec){
    const h=Math.floor(sec/3600).toString().padStart(2,"0");
    const m=Math.floor((sec%3600)/60).toString().padStart(2,"0");
    const s=(sec%60).toString().padStart(2,"0");
    return `${h}:${m}:${s}`;
  }
  function formatTime(sec){
    const m=Math.floor(sec/60).toString().padStart(2,"0");
    const s=(sec%60).toString().padStart(2,"0");
    return `${m}:${s}`;
  }

  // -----------------------
  // Render Day
  // -----------------------
  function renderDay(day){
    const data=plan[day];
    dayTitle.textContent=day;
    dayExplain.textContent=data.explain;

    // Warm-up
    warmupList.innerHTML="";
    data.warmup.forEach(item=>{
      const li=document.createElement("li");
      li.textContent=item;
      warmupList.appendChild(li);
    });

    // Main
    mainBlock.innerHTML="";
    data.main.forEach(set=>{
      const reps=set.reps||1;
      for(let i=1;i<=reps;i++){
        const speed=set.distance && set.duration?calcKph(set.distance,set.duration):0;
        const div=document.createElement("div");
        div.className="repRow";
        div.innerHTML=`
          <span>${set.text} (Rep ${i}/${reps}) ${speed?`- ${speed} kph`:''}</span>
          <span class="timerSpan" data-duration="${set.duration || 0}">${formatTime(set.duration || 0)}</span>
          <input type="checkbox" />
        `;
        mainBlock.appendChild(div);
        if(set.rest){
          const restDiv=document.createElement("div");
          restDiv.className="repRow";
          restDiv.innerHTML=`Rest ${formatTime(set.rest)}`;
          mainBlock.appendChild(restDiv);
        }
      }
    });

    // Mobility
    mobilityList.innerHTML="";
    data.mobility.forEach(item=>{
      const div=document.createElement("div");
      div.textContent=item;
      mobilityList.appendChild(div);
    });

    updateCalendar();
  }

  // -----------------------
  // Interval Timer Logic
  // -----------------------
  let currentRepIndex=0;
  let intervalTimer;
  function startIntervalTimers(){
    clearInterval(intervalTimer);
    const repRows=Array.from(mainBlock.querySelectorAll(".repRow input[type=checkbox]")).map(cb=>cb.parentElement);
    currentRepIndex=0;
    runNextRep(repRows);
  }

  function runNextRep(repRows){
    if(currentRepIndex>=repRows.length) return;
    repRows.forEach((r,i)=>r.classList.remove("active"));
    const row=repRows[currentRepIndex];
    row.classList.add("active");
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
    const now=new Date();
    const year=now.getFullYear();
    const month=now.getMonth();
    calendar.innerHTML="";
    const firstDay=new Date(year,month,1).getDay(); // 0=Sun
    const lastDate=new Date(year,month+1,0).getDate();
    // Weekday headers
    const weekdays=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    weekdays.forEach(d=>{
      const wd=document.createElement("div");
      wd.textContent=d;
      wd.style.display="inline-block";
      wd.style.width="30px";
      wd.style.textAlign="center";
      calendar.appendChild(wd);
    });
    // Days
    for(let i=1;i<=lastDate;i++){
      const dayDiv=document.createElement("div");
      dayDiv.className="calendarDay";
      dayDiv.textContent=i;
      if(i==now.getDate()) dayDiv.classList.add("active");
      calendar.appendChild(dayDiv);
    }
  }

  // -----------------------
  // Init
  // -----------------------
  renderDay("Monday");
  daySelect.addEventListener("change",e=>renderDay(e.target.value));

});
