document.addEventListener("DOMContentLoaded", () => {

  const beep = new Audio("https://www.soundjay.com/buttons/beep-07.wav");

  const goalTimeSec = 8*60;
  const goalDistance = 2;
  const goalKph = (goalDistance/(goalTimeSec/3600)).toFixed(1);

  const plan = {
    Monday:{
      title:"Intervals",
      explain:"6 × 400m intervals at full effort. Rest 20s between reps. Warm-up 10 min easy jog + dynamic mobility.",
      warmup:[{text:"10 min easy jog",speed:10},{text:"Dynamic mobility"}],
      main:[{text:"400m fast",reps:6,duration:Math.round((0.4/goalDistance)*goalTimeSec),rest:20}]
    },
    Tuesday:{
      title:"Tempo",
      explain:"25 min tempo run at 85% of goal speed (~"+(goalKph*0.85).toFixed(1)+" kph). Warm-up 10 min easy jog.",
      warmup:[{text:"10 min easy jog",speed:10}],
      main:[{text:"25 min tempo run",duration:25*60}]
    },
    Wednesday:{
      title:"Recovery",
      explain:"Easy aerobic recovery run (~9-10 kph). Warm-up 5 min walk.",
      warmup:[{text:"5 min walk",speed:5}],
      main:[{text:"20 min easy run",duration:20*60,speed:9.5}]
    },
    Thursday:{
      title:"VO₂ Max / Hill",
      explain:"Choose VO₂ Max intervals or Hill Sprints. Warm-up 10 min jog + running drills.",
      warmup:[{text:"10 min jog",speed:10},{text:"Running drills"}],
      mainVO2:[{text:"500m fast",reps:5,duration:Math.round((0.5/goalDistance)*goalTimeSec*0.9),rest:120}],
      mainHill:[{text:"Hill sprint 60m",reps:6,duration:15,rest:60}]
    },
    Friday:{
      title:"Endurance",
      explain:"35 min easy run followed by optional strides (12-14 kph). Warm-up 10 min easy jog.",
      warmup:[{text:"10 min easy jog",speed:10}],
      main:[{text:"35 min run",duration:35*60,speed:10}]
    },
    Saturday:{
      title:"Race Simulation",
      explain:"Broken 2 km race: 1 km @ 95% goal, 500 m @ goal, 500 m fast finish. Warm-up 10 min jog.",
      warmup:[{text:"10 min jog",speed:10}],
      main:[
        {text:"1 km steady",duration:300,speed:(goalKph*0.95).toFixed(1)},
        {text:"Recovery 2 min",duration:120},
        {text:"500 m fast",duration:150,speed:goalKph},
        {text:"2 × 400 m fast finish",reps:2,duration:120,speed:(goalKph*1.05).toFixed(1),rest:60}
      ]
    }
  };

  const daySelect = document.getElementById("daySelect");
  const dayTitle = document.getElementById("dayTitle");
  const dayExplain = document.getElementById("dayExplain");
  const warmupList = document.getElementById("warmupList");
  const mainBlock = document.getElementById("mainBlock");
  const sessionTime = document.getElementById("sessionTime");
  const startBtn = document.getElementById("startSession");
  const pauseBtn = document.getElementById("pauseSession");
  const resetBtn = document.getElementById("resetSession");

  let sessionSeconds = 0;
  let sessionInterval;

  // populate day selector
  Object.keys(plan).forEach(day=>{
    const opt=document.createElement("option");
    opt.value=day;
    opt.textContent=day;
    daySelect.appendChild(opt);
  });

  // default to current day
  const weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const today = new Date();
  const todayName = weekdays[today.getDay()];
  daySelect.value = todayName;

  function formatTime(sec){
    const m=Math.floor(sec/60).toString().padStart(2,"0");
    const s=(sec%60).toString().padStart(2,"0");
    return `${m}:${s}`;
  }

  function renderDay(day){
    const d = plan[day];
    dayTitle.textContent = day;
    dayExplain.innerHTML = `<ul><li>${d.explain}</li></ul>`;

    // Warm-up
    warmupList.innerHTML="";
    d.warmup.forEach(w=>{
      const div = document.createElement("div");
      div.className="session-item";
      div.innerHTML = `<span>• ${w.text}${w.speed?` @ ${w.speed} kph`:""}</span><input type="checkbox">`;
      warmupList.appendChild(div);
    });

    // Main session
    mainBlock.innerHTML="";
    if(day==="Thursday"){
      const dropdown = document.createElement("select");
      dropdown.innerHTML=`<option value="VO2">VO₂ Max</option><option value="Hill">Hill Sprint</option>`;
      dropdown.addEventListener("change", e=>renderMain(day,e.target.value));
      mainBlock.appendChild(dropdown);
      renderMain(day,"VO2");
    } else {
      renderMain(day);
    }
  }

  function renderMain(day,type){
    mainBlock.querySelectorAll(".session-item").forEach(e=>e.remove());

    let data = plan[day].main;
    if(day==="Thursday") data = (type==="VO2")?plan[day].mainVO2:plan[day].mainHill;

    data.forEach(item=>{
      const reps = item.reps || 1;
      for(let i=1;i<=reps;i++){
        const div = document.createElement("div");
        div.className="session-item";
        let text = item.text;
        if(item.reps) text += ` (Rep ${i}/${item.reps})`;
        if(item.speed) text += ` @ ${item.speed} kph`;
        if(item.rest) text += ` | Rest ${item.rest}s`;
        div.innerHTML = `<span>• ${text}</span><input type="checkbox">`;
        mainBlock.appendChild(div);
      }
    });
  }

  startBtn.addEventListener("click", ()=>{
    clearInterval(sessionInterval);
    sessionInterval = setInterval(()=>{
      sessionSeconds++;
      sessionTime.textContent = formatTime(sessionSeconds);
    },1000);
    beep.play();
  });

  pauseBtn.addEventListener("click", ()=>clearInterval(sessionInterval));
  resetBtn.addEventListener("click", ()=>{
    clearInterval(sessionInterval);
    sessionSeconds=0;
    sessionTime.textContent = formatTime(sessionSeconds);
    document.querySelectorAll("input[type=checkbox]").forEach(cb=>cb.checked=false);
  });

  renderDay(todayName);
  daySelect.addEventListener("change", e=>renderDay(e.target.value));

});
