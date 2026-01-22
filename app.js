document.addEventListener("DOMContentLoaded",()=>{

const beep = new Audio("https://www.soundjay.com/buttons/beep-07.wav");

const goalTimeSec = 8*60;
const goalDistance = 2;
const goalKph = (goalDistance/(goalTimeSec/3600)).toFixed(1);

const daySelect = document.getElementById("daySelect");
const dayTitle = document.getElementById("dayTitle");
const dayExplain = document.getElementById("dayExplain");
const warmupList = document.getElementById("warmupList");
const mainBlock = document.getElementById("mainBlock");
const mobilityList = document.getElementById("mobilityList");
const sessionTimer = document.getElementById("sessionTimer");
const startBtn = document.getElementById("startSession");
const pauseBtn = document.getElementById("pauseSession");
const resetBtn = document.getElementById("resetSession");

let sessionSeconds = 0;
let sessionInterval;
let currentRepIndex = 0;
let repTimer;

// ------------------------
// Full training plan with rest and description
// ------------------------
const plan = {
  Monday: {
    title:"Intervals",
    explain:`6 × 400m @ ${goalKph} kph (full effort), with 20 sec rest between reps. Focus on maintaining target speed, good running form, and consistent pacing.`,
    warmup:["10 min easy jog","Dynamic mobility (hips, calves, ankles)"],
    main:[{text:`400m fast @ ${goalKph} kph`, reps:6, duration:Math.round((0.4/goalDistance)*goalTimeSec), rest:20}],
    mobility:["Hip flexor stretch – 60 sec","Calf stretch – 60 sec"]
  },
  Tuesday: {
    title:"Tempo Run",
    explain:`25 min tempo run @ ${(goalKph*0.85).toFixed(1)} kph with 3 × 100m relaxed strides at end (30 sec rest). Focus on sustaining effort without overexerting.`,
    warmup:["10 min easy jog"],
    main:[{text:"25 min tempo run", duration:25*60},{text:`3 × 100m strides @ ${(goalKph*0.85).toFixed(1)} kph`, reps:3, duration:60, rest:30}],
    mobility:["Hamstring stretch – 60 sec"]
  },
  Wednesday: {
    title:"Recovery",
    explain:"Easy aerobic run to promote recovery. Keep heart rate low and focus on relaxed, smooth running.",
    warmup:["5 min walk"],
    main:[{text:"20 min easy run @ 9-10 kph", duration:20*60}],
    mobility:["Full body mobility flow – 10 min"]
  },
  Thursday: {
    title:"VO₂ Max / Hill Sprint",
    explain:"Choose VO₂ Max intervals (5 × 500m slightly faster than goal, 2 min rest) or Hill Sprints (6 × 60m, 1 min rest). Focus on intensity and running form.",
    warmup:["10 min easy jog","Running drills"],
    mainVO2:[{text:`500m fast @ ${(goalKph*1.1).toFixed(1)} kph`, reps:5, duration:Math.round((0.5/goalDistance)*goalTimeSec*0.9), rest:120}],
    mainHill:[{text:`Hill sprint 60m`, reps:6, duration:15, rest:60}],
    mobility:["Quad stretch – 60 sec"]
  },
  Friday: {
    title:"Endurance + Strides",
    explain:"35 min easy run @ 10 kph, followed by 4 × 1 min strides @ 12-14 kph (30 sec rest). Focus on maintaining relaxed pace and consistent stride mechanics.",
    warmup:["10 min easy jog"],
    main:[{text:"35 min easy run @ 10 kph", duration:35*60},{text:"1 min strides @ 12-14 kph", reps:4, duration:60, rest:30}],
    mobility:["Foam rolling – 10 min"]
  },
  Saturday: {
    title:"Race Simulation",
    explain:`Broken 2km race simulation: 1km steady @ ${(goalKph*0.95).toFixed(1)} kph, 2 min recovery, 500m fast @ ${goalKph} kph, then 2 × 400m fast finish @ ${(goalKph*1.05).toFixed(1)} kph (1 min rest). Focus on pacing, sprint finish, and mental toughness.`,
    warmup:["10 min jog"],
    main:[{text:`1km steady @ ${(goalKph*0.95).toFixed(1)} kph`, duration:300},{text:"Recovery 2 min", duration:120},{text:`500m fast @ ${goalKph} kph`, duration:150},{text:`2 × 400m fast finish @ ${(goalKph*1.05).toFixed(1)} kph`, reps:2, duration:120, rest:60}],
    mobility:["Hip flexor stretch – 60 sec"]
  }
};

// ------------------------
// Utility functions
// ------------------------
function formatTime(sec){
  const m = Math.floor(sec/60).toString().padStart(2,"0");
  const s = (sec%60).toString().padStart(2,"0");
  return `${m}:${s}`;
}

// ------------------------
// Timer buttons
// ------------------------
startBtn.addEventListener("click", ()=>{
  clearInterval(sessionInterval);
  sessionInterval = setInterval(()=>{
    sessionSeconds++;
    sessionTimer.textContent = formatTime(sessionSeconds);
  },1000);
  beep.play();
  startReps();
});

pauseBtn.addEventListener("click", ()=>clearInterval(sessionInterval));

resetBtn.addEventListener("click", ()=>{
  clearInterval(sessionInterval);
  sessionSeconds=0;
  sessionTimer.textContent=formatTime(sessionSeconds);
  document.querySelectorAll(".repRow input[type=checkbox]").forEach(cb=>cb.checked=false);
  document.querySelectorAll(".repRow").forEach(r=>r.classList.remove("active","completed"));
  clearInterval(repTimer);
  currentRepIndex = 0;
});

// ------------------------
// Populate day dropdown
// ------------------------
Object.keys(plan).forEach(day=>{
  const opt = document.createElement("option");
  opt.value = day;
  opt.textContent = day;
  daySelect.appendChild(opt);
});

daySelect.addEventListener("change", e=> renderDay(e.target.value));

// ------------------------
function renderDay(day){
  const data = plan[day];
  dayTitle.textContent = `${day} — ${data.title}`;
  dayExplain.textContent = data.explain;

  // Warmup
  warmupList.innerHTML="";
  data.warmup.forEach(w=>{
    const li=document.createElement("li");
    li.textContent=w;
    warmupList.appendChild(li);
  });

  // Main
  mainBlock.innerHTML="";
  if(day==="Thursday"){
    const thDiv=document.createElement("div");
    thDiv.className="thursdayDropdown";
    const label = document.createElement("div");
    label.textContent="Select Thursday Workout:";
    label.style.color="#fff";
    label.style.fontWeight="bold";
    label.style.marginBottom="6px";
    thDiv.appendChild(label);

    const dropdown = document.createElement("select");
    dropdown.innerHTML=`<option value="VO2">VO₂ Max</option><option value="Hill">Hill Sprint</option>`;
    dropdown.addEventListener("change", e=> renderMainBlocks(day,e.target.value));
    thDiv.appendChild(dropdown);

    mainBlock.appendChild(thDiv);
    renderMainBlocks(day,"VO2");
  } else {
    renderMainBlocks(day);
  }

  // Mobility
  mobilityList.innerHTML="";
  data.mobility.forEach(m=>{
    const li=document.createElement("li");
    li.textContent = m;
    mobilityList.appendChild(li);
  });

  currentRepIndex = 0;
}

// ------------------------
function renderMainBlocks(day,type){
  mainBlock.querySelectorAll(".repRow").forEach(e=>e.remove());
  let sets = plan[day];
  let mainData = sets.main;
  if(day==="Thursday") mainData = (type==="VO2")? sets.mainVO2 : sets.mainHill;

  mainData.forEach(set=>{
    const reps = set.reps || 1;
    for(let i=1;i<=reps;i++){
      const div = document.createElement("div");
      div.className="repRow";
      const content = document.createElement("div");
      content.datasetDuration = set.duration;
      content.datasetRest = set.rest || 0;
      content.innerHTML = `<span>${set.text} (Rep ${i}/${reps})</span><input type="checkbox" style="float:right"/>`;
      div.appendChild(content);
      mainBlock.appendChild(div);

      if(set.rest){
        const restDiv = document.createElement("div");
        restDiv.className="repRow";
        restDiv.datasetRest = set.rest;
        restDiv.innerHTML = `<span>Rest ${formatTime(set.rest)}</span>`;
        mainBlock.appendChild(restDiv);
      }
    }
  });
}

// ------------------------
function startReps(){
  clearInterval(repTimer);
  const reps = Array.from(mainBlock.querySelectorAll(".repRow"));
  currentRepIndex = 0;
  nextRep(reps);
}

function nextRep(reps){
  if(currentRepIndex >= reps.length) return;
  const row = reps[currentRepIndex];
  const content = row.querySelector("div") || row;
  let duration = parseInt(content.datasetDuration || content.datasetRest || 10);
  let timeLeft = duration;
  const cb = row.querySelector("input[type=checkbox]");

  row.classList.add("active");
  beep.play();

  repTimer = setInterval(()=>{
    timeLeft--;
    if(timeLeft <=0){
      clearInterval(repTimer);
      if(cb) cb.checked = true;
      row.classList.remove("active");
      row.classList.add("completed");
      currentRepIndex++;
      nextRep(reps);
    }
  },1000);
}

// ------------------------
renderDay("Monday");
