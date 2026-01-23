document.addEventListener("DOMContentLoaded", () => {

const beep = new Audio("https://www.soundjay.com/buttons/beep-07.wav");

const goalTimeSec = 8 * 60;
const goalKph = (2 / (goalTimeSec / 3600)).toFixed(1);

const plan = {
Monday:{
title:"Intervals",
explain:`6 × 400 m @ ${goalKph} kph. 20 sec rest between reps.`,
warmup:[
"10 min easy jog @ 10 kph",
"Dynamic mobility (hips, calves)"
],
main:[
{ text:`400 m fast @ ${goalKph} kph (Rest 20s)`, reps:6 }
]
},
Tuesday:{
title:"Tempo",
explain:`25 min tempo @ ${(goalKph*0.85).toFixed(1)} kph.`,
warmup:["10 min easy jog @ 10 kph"],
main:["25 min continuous tempo run"]
},
Wednesday:{
title:"Recovery",
explain:"Low-intensity aerobic recovery run.",
warmup:["5 min brisk walk"],
main:["20 min easy run @ 9–10 kph"]
},
Thursday:{
title:"VO₂ Max",
explain:`5 × 500 m @ ${(goalKph*1.1).toFixed(1)} kph. 2 min rest.`,
warmup:["10 min jog @ 10 kph"],
main:[
{ text:`500 m fast @ ${(goalKph*1.1).toFixed(1)} kph (Rest 2 min)`, reps:5 }
]
},
Friday:{
title:"Endurance",
explain:"Steady aerobic endurance run.",
warmup:["10 min jog @ 10 kph"],
main:["35 min steady run @ 10 kph"]
},
Saturday:{
title:"Race Simulation",
explain:`Broken 2 km at race pace (${goalKph} kph).`,
warmup:["10 min jog @ 10 kph"],
main:[
"1 km @ 95% race pace",
"2 min recovery",
"500 m @ race pace",
"2 × 400 m fast finish"
]
}
};

const daySelect = document.getElementById("daySelect");
const warmupList = document.getElementById("warmupList");
const mainBlock = document.getElementById("mainBlock");
const dayTitle = document.getElementById("dayTitle");
const dayExplain = document.getElementById("dayExplain");
const sessionTimer = document.getElementById("sessionTimer");

let sessionSeconds = 0;
let sessionInterval;

// -------- Completion Tracking --------
function todayKey(){
const d = new Date();
return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

function updateCompletion(){
document.getElementById("completionStatus").textContent =
localStorage.getItem(todayKey()) ? "Completed ✅" : "";
}

// -------- Populate Days --------
Object.keys(plan).forEach(d=>{
const opt=document.createElement("option");
opt.value=d;
opt.textContent=d;
daySelect.appendChild(opt);
});

const todayName =
["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
[new Date().getDay()];
daySelect.value = plan[todayName] ? todayName : "Monday";

// -------- Render --------
function renderDay(day){
warmupList.innerHTML="";
mainBlock.innerHTML="";
const d = plan[day];

dayTitle.textContent = day;
dayExplain.textContent = d.explain;

d.warmup.forEach(t=>{
const div=document.createElement("div");
div.className="session-item";
div.innerHTML=`<span>${t}</span><input type="checkbox">`;
warmupList.appendChild(div);
});

d.main.forEach(item=>{
if(typeof item === "string"){
const div=document.createElement("div");
div.className="session-item";
div.innerHTML=`<span>${item}</span><input type="checkbox">`;
mainBlock.appendChild(div);
} else {
for(let i=1;i<=item.reps;i++){
const div=document.createElement("div");
div.className="session-item";
div.innerHTML=`<span>${item.text} (Rep ${i}/${item.reps})</span><input type="checkbox">`;
mainBlock.appendChild(div);
}
}
});

updateCompletion();
}

// -------- Timer Controls --------
document.getElementById("start").onclick=()=>{
clearInterval(sessionInterval);
sessionInterval=setInterval(()=>{
sessionSeconds++;
const m=Math.floor(sessionSeconds/60).toString().padStart(2,"0");
const s=(sessionSeconds%60).toString().padStart(2,"0");
sessionTimer.textContent=`${m}:${s}`;
},1000);
beep.play();
};

document.getElementById("pause").onclick=()=>{
clearInterval(sessionInterval);
};

document.getElementById("reset").onclick=()=>{
clearInterval(sessionInterval);
sessionSeconds=0;
sessionTimer.textContent="00:00";
};

daySelect.onchange=e=>renderDay(e.target.value);

// -------- Init --------
renderDay(daySelect.value);
});
