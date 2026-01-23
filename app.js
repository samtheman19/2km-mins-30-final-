document.addEventListener("DOMContentLoaded", () => {
  const beep = new Audio("https://www.soundjay.com/buttons/beep-07.wav");

  // Goal speed calculations
  const goalTimeSec = 8 * 60; // 8 min for 2km
  const goalDistance = 2; // km
  const goalKph = (goalDistance / (goalTimeSec / 3600)).toFixed(1);

  // -----------------------
  // Training Plan
  // -----------------------
  const plan = {
    Monday: {
      title: "Intervals",
      explain: `Short, fast repetitions at target speed of ${goalKph} kph to develop speed and running economy. 6 x 400m with 20s rest between reps.`,
      warmup: ["10 min easy jog", "Dynamic mobility (hips, calves, ankles)"],
      main: [
        { text: `400m @ ${goalKph} kph`, reps: 6, duration: Math.round((0.4/goalDistance)*goalTimeSec), rest:20 }
      ],
      mobility: ["Hip flexor stretch – 60 sec", "Calf stretch – 60 sec"]
    },
    Tuesday: {
      title: "Tempo Run",
      explain: `Sustained tempo run at ~85% of goal speed (${(goalKph*0.85).toFixed(1)} kph) for 25 min. Finish with 3 x 100m strides.`,
      warmup: ["10 min easy jog"],
      main: [
        { text:"Tempo run 25 min @ "+(goalKph*0.85).toFixed(1)+" kph", duration:25*60 },
        { text:"Strides 3 x 100m @ "+(goalKph*0.85).toFixed(1)+" kph", reps:3, duration:60, rest:30 }
      ],
      mobility: ["Hamstring stretch – 60 sec"]
    },
    Wednesday: {
      title: "Recovery",
      explain: "Easy low-intensity aerobic run to promote recovery and maintain form.",
      warmup: ["5 min brisk walk"],
      main: [
        { text:"Easy run 20 min @ 9-10 kph", duration:20*60 }
      ],
      mobility: ["Full body mobility flow – 10 min"]
    },
    Thursday: {
      title: "VO₂ Max / Hill Sprint",
      explain: "Choose VO₂ Max intervals or Hill Sprints. VO₂: 5 x 500m slightly faster than goal (~"+(goalKph*1.1).toFixed(1)+" kph) with 2 min rest. Hill: 6 x 60m sprints with 1 min rest.",
      warmup: ["10 min easy jog", "Running drills"],
      mainVO2: [
        { text:`500m fast @ ${(goalKph*1.1).toFixed(1)} kph`, reps:5, duration:Math.round((0.5/goalDistance)*goalTimeSec*0.9), rest:120 }
      ],
      mainHill: [
        { text:`Hill sprint 60m`, reps:6, duration:15, rest:60 }
      ],
      mobility:["Quad stretch – 60 sec"]
    },
    Friday: {
      title: "Endurance + Strides",
      explain: "Easy aerobic run ~35 min + 4 x 1 min strides at 12-14 kph, focus on form and endurance.",
      warmup:["5–10 min easy jog"],
      main:[
        { text:"Easy run 35 min @ 10 kph", duration:35*60 },
        { text:"Strides 4 x 1 min @ 12-14 kph", reps:4, duration:60, rest:30 }
      ],
      mobility:["Foam rolling – 10 min"]
    },
    Saturday: {
      title: "Race Simulation",
      explain: "Practice broken 2 km race at target pace "+goalKph+" kph: 1 km steady, recovery 2 min, 500m @ goal, 2 x 400m fast finish with 1 min rest.",
      warmup:["10 min easy jog"],
      main:[
        { text:`1 km steady @ ${(goalKph*0.95).toFixed(1)} kph`, duration:300 },
        { text:"Recovery 2 min", duration:120 },
        { text:`500 m @ ${goalKph} kph`, duration:150 },
        { text:`2 x 400 m fast finish @ ${(goalKph*1.05).toFixed(1)} kph`, reps:2, duration:120, rest:60 }
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
  const startBtn = document.getElementById("startSession");
  const pauseBtn = document.getElementById("pauseSession");
  const resetBtn = document.getElementById("resetSession");
  const preFatigue = document.getElementById("preFatigue");
  const postFatigue = document.getElementById("postFatigue");

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
  // Timer
  // -----------------------
  let sessionSeconds=0, sessionInterval, currentRepIndex=0, intervalTimer;
  function formatTime(sec){ const m=Math.floor(sec/60).toString().padStart(2,"0"); const s=(sec%60).toString().padStart(2,"0"); return m+":"+s; }

  startBtn.addEventListener("click", ()=>{
    clearInterval(sessionInterval);
    sessionInterval = setInterval(()=>{
      sessionSeconds++;
      sessionTime.textContent = formatTime(sessionSeconds);
    },1000);
    beep.play();
    startIntervals();
  });

  pauseBtn.addEventListener("click", ()=> clearInterval(sessionInterval));
  resetBtn.addEventListener("click", ()=>{
    clearInterval(sessionInterval);
    sessionSeconds=0;
    sessionTime.textContent="00:00";
    document.querySelectorAll(".repRow input[type=checkbox]").forEach(cb=>cb.checked=false);
    document.querySelectorAll(".repRow").forEach(r=>r.classList.remove("active","completed"));
  });

  // -----------------------
  // Render Day
  // -----------------------
  function renderDay(day){
    const d=plan[day];
    dayTitle.textContent=day;
    dayExplain.textContent=d.explain;

    // Warmup
    warmupList.innerHTML="";
    d.warmup.forEach(item=>{
      const li=document.createElement("li");
      li.textContent=item;
      warmupList.appendChild(li);
    });

    // Main
    mainBlock.innerHTML="";
    let mainData=d.main;
    if(day==="Thursday"){
      const container=document.createElement("div");
      container.style.marginBottom="10px";
      const label=document.createElement("div");
      label.textContent="Select Thursday Workout:";
      label.style.marginBottom="6px";
      container.appendChild(label);

      const select=document.createElement("select");
      select.innerHTML=`<option value="VO2">VO₂ Max</option><option value="Hill">Hill Sprint</option>`;
      select.addEventListener("change", e=>{
        renderMainBlocks(day,e.target.value);
      });
      container.appendChild(select);
      mainBlock.appendChild(container);
      renderMainBlocks(day,"VO2");
    } else {
      renderMainBlocks(day);
    }

    // Mobility
    mobilityList.innerHTML="";
    d.mobility.forEach(item=>{
      const div=document.createElement("div");
      div.textContent=item;
      mobilityList.appendChild(div);
    });
  }

  function renderMainBlocks(day,type){
    mainBlock.querySelectorAll(".repRow,.restRow").forEach(e=>e.remove());
    let sets=plan[day];
    let mainData=sets.main;
    if(day==="Thursday") mainData=(type==="VO2")? sets.mainVO2 : sets.mainHill;

    mainData.forEach(set=>{
      const reps=set.reps || 1;
      for(let i=1;i<=reps;i++){
        const div=document.createElement("div");
        div.className="repRow";
        div.textContent = `${set.text} (Rep ${i}/${reps})`;
        mainBlock.appendChild(div);

        if(set.rest){
          const restDiv=document.createElement("div");
          restDiv.className="repRow";
          restDiv.textContent = `Rest ${set.rest} sec`;
          mainBlock.appendChild(restDiv);
        }
      }
    });
  }

  // -----------------------
  // Interval Logic
  // -----------------------
  function startIntervals(){
    clearInterval(intervalTimer);
    const reps=Array.from(mainBlock.querySelectorAll(".repRow"));
    currentRepIndex=0;
    runNext(reps);
  }

  function runNext(reps){
    if(currentRepIndex>=reps.length) return;
    const row=reps[currentRepIndex];
    let sec=60; // default 1 min
    const match = row.textContent.match(/(\d+) sec/);
    if(match) sec=parseInt(match[1]);

    row.classList.add("active");
    beep.play();

    intervalTimer=setInterval(()=>{
      sec--;
      row.textContent = row.textContent.split(" (")[0] + ` (${formatTime(sec)})`;
      if(sec<=0){
        clearInterval(intervalTimer);
        beep.play();
        row.classList.remove("active");
        row.classList.add("completed");
        currentRepIndex++;
        runNext(reps);
      }
    },1000);
  }

  // -----------------------
  // Auto-select current day
  // -----------------------
  const weekdayNames=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const today=new Date();
  const todayName=weekdayNames[today.getDay()];
  daySelect.value=todayName;
  renderDay(todayName);

  daySelect.addEventListener("change", e=>{
    renderDay(e.target.value);
  });

});
