document.addEventListener("DOMContentLoaded", () => {
  const goalTimeSec = 8*60;
  const goalDistance = 2;
  const goalKph = (goalDistance/(goalTimeSec/3600)).toFixed(1);

  const plan = {
    Monday:{title:"Intervals",explain:`6 × 400m at ${goalKph} kph. Rest 20s between reps.`,warmup:["10 min easy jog","Dynamic mobility"],main:[{text:"400m fast",reps:6,duration:Math.round((0.4/goalDistance)*goalTimeSec),rest:20}]},
    Tuesday:{title:"Tempo",explain:`25 min steady run at ${(goalKph*0.85).toFixed(1)} kph.`,warmup:["10 min easy jog"],main:[{text:"25 min tempo run",duration:25*60}]},
    Wednesday:{title:"Recovery",explain:"Easy aerobic run to recover.",warmup:["5 min walk"],main:[{text:"20 min easy run",duration:20*60}]},
    Thursday:{title:"VO₂ Max / Hill",explain:"Choose VO₂ Max intervals or Hill sprints.",warmup:["10 min jog"],mainVO2:[{text:"500m fast",reps:5,duration:Math.round((0.5/goalDistance)*goalTimeSec*0.9),rest:120}],mainHill:[{text:"Hill sprint 60m",reps:6,duration:15,rest:60}]},
    Friday:{title:"Endurance",explain:"35 min easy run.",warmup:["10 min easy jog"],main:[{text:"35 min run",duration:35*60}]},
    Saturday:{title:"Race Simulation",explain:`Broken 2km at ${goalKph} kph.`,warmup:["10 min jog"],main:[{text:"1km steady",duration:300},{text:"500m fast",duration:150},{text:"500m fast",duration:150}]}
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
  let currentRepIndex = 0;
  let intervalTimer;

  // populate day select
  Object.keys(plan).forEach(day => {
    const opt = document.createElement("option");
    opt.value = day;
    opt.textContent = day;
    daySelect.appendChild(opt);
  });

  // default selection = today
  const weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const today = new Date();
  const todayName = weekdays[today.getDay()];
  daySelect.value = todayName;

  function formatTime(sec){
    const m = Math.floor(sec/60).toString().padStart(2,"0");
    const s = (sec%60).toString().padStart(2,"0");
    return `${m}:${s}`;
  }

  function renderDay(day){
    const d = plan[day];
    dayTitle.textContent = day;
    dayExplain.textContent = d.explain;

    warmupList.innerHTML="";
    d.warmup.forEach(w=>{
      const li=document.createElement("li");
      li.textContent=w;
      warmupList.appendChild(li);
    });

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
    mainBlock.querySelectorAll(".rep").forEach(e=>e.remove());

    let data = plan[day].main;
    if(day==="Thursday") data = (type==="VO2") ? plan[day].mainVO2 : plan[day].mainHill;

    data.forEach(item=>{
      const reps = item.reps || 1;
      for(let i=1;i<=reps;i++){
        const div = document.createElement("div");
        div.className="rep";
        let text = item.text;
        if(item.reps) text += ` (Rep ${i}/${item.reps})`;
        if(item.rest) text += ` | Rest ${item.rest}s`;
        div.textContent = text;
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
  });

  pauseBtn.addEventListener("click", ()=>clearInterval(sessionInterval));
  resetBtn.addEventListener("click", ()=>{
    clearInterval(sessionInterval);
    sessionSeconds=0;
    sessionTime.textContent = formatTime(sessionSeconds);
  });

  renderDay(todayName);
  daySelect.addEventListener("change", e=>renderDay(e.target.value));
});
