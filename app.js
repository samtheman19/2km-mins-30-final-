document.addEventListener("DOMContentLoaded", () => {

  const beep = new Audio("https://www.soundjay.com/buttons/beep-07.wav");

  // -----------------------
  // Goal speed calculations
  // -----------------------
  const goalTimeSec = 8*60; // 2km in 8 minutes
  const goalDistance = 2; // km
  const goalKph = (goalDistance / (goalTimeSec/3600)).toFixed(1);

  // -----------------------
  // Training Plan
  // -----------------------
  const plan = {
    Monday: {
      title: "Intervals",
      explain: `6 × 400m @ ${goalKph} kph (full effort)`,
      warmup: ["10 min easy jog", "Dynamic mobility (hips, calves, ankles)"],
      main: [
        {text:`400m fast @ ${goalKph} kph`, reps:6, duration:Math.round((0.4/goalDistance)*goalTimeSec), rest:20}
      ],
      mobility: ["Hip flexor stretch – 60 sec", "Calf stretch – 60 sec"]
    },
    Tuesday: {
      title: "Tempo Run",
      explain: `Sustained effort ~85% goal speed (${(goalKph*0.85).toFixed(1)} kph). 25 min`,
      warmup:["10 min easy jog"],
      main:[
        {text:"Tempo run", duration:25*60},
        {text:`3 × 100m relaxed strides @ ${(goalKph*0.85).toFixed(1)} kph`, reps:3, duration:60, rest:30}
      ],
      mobility:["Hamstring stretch – 60 sec"]
    },
    Wednesday: {
      title:"Recovery",
      explain:"Easy aerobic run",
      warmup:["5 min walk"],
      main:[{text:"20 min easy run @ 9-10 kph", duration:20*60}],
      mobility:["Full body mobility flow – 10 min"]
    },
    Thursday: {
      title:"VO₂ Max / Hill Sprint",
      explain:"Choose VO₂ Max or Hill Sprint",
      warmup:["10 min easy jog","Running drills"],
      mainVO2:[{text:`500m slightly faster than goal (~${(goalKph*1.1).toFixed(1)} kph)`, reps:5, duration:Math.round((0.5/goalDistance)*goalTimeSec*0.9), rest:120}],
      mainHill:[{text:"Hill sprint 60 m", reps:6, duration:15, rest:60}],
      mobility:["Quad stretch – 60 sec"]
    },
    Friday: {
      title:"Endurance + Strides",
      explain:"Easy 35 min run + 4 × 1 min strides @ 12-14 kph",
      warmup:["5–10 min easy jog"],
      main:[
        {text:"Easy 35 min run @ 10 kph", duration:35*60},
        {text:"Strides 1 min @ 12-14 kph", reps:4, duration:60, rest:30}
      ],
      mobility:["Foam rolling – 10 min"]
    },
    Saturday:{
      title:"Race Simulation",
      explain:`Broken 2 km race @ ${goalKph} kph`,
      warmup:["10 min easy jog"],
      main:[
        {text:`1 km @ ${(goalKph*0.95).toFixed(1)} kph`, duration:300},
        {text:"Recovery 2 min", duration:120},
        {text:`500 m @ ${goalKph} kph`, duration:150},
        {text:`2 × 400 m fast finish @ ${(goalKph*1.05).toFixed(1)} kph`, reps:2, duration:120, rest:60}
      ],
      mobility:["Hip flexor stretch – 60 sec"]
    }
  };

  // -----------------------
  // DOM Elements
  // -----------------------
  const daySelect=document.getElementById("daySelect");
  const dayTitle=document.getElementById("dayTitle");
  const dayExplain=document.getElementById("dayExplain");
  const warmupList=document.getElementById("warmupList");
  const mainBlock=document.getElementById("mainBlock");
  const mobilityList=document.getElementById("mobilityList");
  const sessionTime=document.getElementById("sessionTime");
  const startSession=document.getElementById("startSession");
  const pauseSession=document.getElementById("pauseSession");
  const resetSession=document.getElementById("resetSession");
  const preFatigue=document.getElementById("preFatigue");
  const postFatigue=document.getElementById("postFatigue");
  const calendarDiv=document.getElementById("calendar");

  // -----------------------
  // Populate day selector
  // -----------------------
  Object.keys(plan).forEach(day=>{
    const opt=document.createElement("option");
    opt.value=day;
    opt.textContent=day;
    daySelect.appendChild(opt);
  });

  // -----------------------
  // Timer helpers
  // -----------------------
  let sessionSeconds=0, sessionInterval;
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
    document.querySelectorAll(".repRow").forEach(r=>r.classList.remove("active","completed"));
    document.querySelectorAll(".progressBar").forEach(bar=>bar.style.width="0%");
  });

  // -----------------------
  // Render day
  // -----------------------
  function renderDay(day){
    const data=plan[day];
    dayTitle.textContent=day;
    dayExplain.textContent=data.explain;

    // warmup
    warmupList.innerHTML="";
    data.warmup.forEach(item=>{
      const li=document.createElement("li");
      li.textContent=item;
      warmupList.appendChild(li);
    });

    // main
    mainBlock.innerHTML="";
    if(day==="Thursday"){
      const container=document.createElement("div");
      container.style.marginBottom="12px";
      const label=document.createElement("div");
      label.textContent="Select Thursday Workout:";
      label.style.fontWeight="bold";
      label.style.marginBottom="6px";
      container.appendChild(label);
      const dropdown=document.createElement("select");
      dropdown.innerHTML=`<option value="VO2">VO₂ Max</option><option value="Hill">Hill Sprint</option>`;
      dropdown.addEventListener("change", e=>renderMainBlocks(day,e.target.value));
      container.appendChild(dropdown);
      mainBlock.appendChild(container);
      renderMainBlocks(day,"VO2");
    } else renderMainBlocks(day);

    // mobility
    mobilityList.innerHTML="";
    data.mobility.forEach(item=>{
      const div=document.createElement("div");
      div.textContent=item;
      mobilityList.appendChild(div);
    });

    renderCalendar();
  }

  function renderMainBlocks(day,type){
    mainBlock.querySelectorAll(".repRow,.restRow").forEach(e=>e.remove());
    let sets=plan[day];
    let mainData=sets.main;
    if(day==="Thursday") mainData=(type==="VO2")? sets.mainVO2 : sets.mainHill;

    mainData.forEach(set=>{
      const reps=set.reps||1;
      for(let i=1;i<=reps;i++){
        const div=document.createElement("div");
        div.className="repRow";
        div.style.position="relative";
        div.style.overflow="hidden";

        const progressBar=document.createElement("div");
        progressBar.className="progressBar";
        div.appendChild(progressBar);

        const content=document.createElement("div");
        content.style.position="relative";
        content.style.padding="8px 12px";
        content.innerHTML=`<div class="timerSpan" data-duration="${set.duration}">${formatTime(set.duration)}</div><span>${set.text} (Rep ${i}/${reps})</span><input type="checkbox"/>`;
        div.appendChild(content);
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

  // -----------------------
  // Interval timers
  // -----------------------
  let currentRepIndex=0, intervalTimer;
  function startIntervalTimers(){
    clearInterval(intervalTimer);
    const repRows=Array.from(mainBlock.querySelectorAll(".repRow"));
    currentRepIndex=0;
    runNextRep(repRows);
  }
  function runNextRep(repRows){
    if(currentRepIndex>=repRows.length){
      updateDayCompletion(new Date().getDate());
      return;
    }
    const row=repRows[currentRepIndex];
    const timerSpan=row.querySelector(".timerSpan");
    const cb=row.querySelector("input[type=checkbox]");
    let sec=parseInt(timerSpan.getAttribute("data-duration"));
    const progressBar=row.querySelector(".progressBar");
    row.classList.add("active");
    beep.play();

    intervalTimer=setInterval(()=>{
      sec--;
      timerSpan.textContent=formatTime(sec);
      progressBar.style.width=`${((parseInt(timerSpan.getAttribute("data-duration"))-sec)/parseInt(timerSpan.getAttribute("data-duration")))*100}%`;

      if(sec<=0){
        clearInterval(intervalTimer);
        beep.play();
        cb.checked=true;
        row.classList.remove("active");
        row.classList.add("completed");
        progressBar.style.width="100%";
        currentRepIndex++;
        runNextRep(repRows);
      }
    },1000);
  }

  // -----------------------
  // Calendar
  // -----------------------
  function renderCalendar(){
    calendarDiv.innerHTML="";
    const today=new Date();
    const year=today.getFullYear();
    const month=today.getMonth();
    const daysInMonth=new Date(year,month+1,0).getDate();
    const monthKey=`${year}-${month+1}`;
    let completionData=JSON.parse(localStorage.getItem(monthKey))||{};

    for(let i=1;i<=daysInMonth;i++){
      const div=document.createElement("div");
      div.className="calendarDay";
      div.textContent=i;
      if(completionData[i] && completionData[i].completed){
        div.classList.add("completed");
        div.title=`Workout done. Pre: ${completionData[i].pre}, Post: ${completionData[i].post}`;
      }
      if(i===today.getDate()) div.classList.add("active");
      calendarDiv.appendChild(div);
    }
  }

  function updateDayCompletion(dayNumber){
    const today=new Date();
    const year=today.getFullYear();
    const month=today.getMonth();
    const monthKey=`${year}-${month+1}`;
    let completionData=JSON.parse(localStorage.getItem(monthKey))||{};
    const pre=preFatigue.value||"";
    const post=postFatigue.value||"";
    completionData[dayNumber]={completed:true,pre,post};
    localStorage.setItem(monthKey,JSON.stringify(completionData));
    renderCalendar();
  }

  // -----------------------
  // Init
  // -----------------------
  renderDay("Monday");
  daySelect.addEventListener("change", e=>renderDay(e.target.value));

});
