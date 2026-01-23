document.addEventListener("DOMContentLoaded", () => {

const beep = new Audio("https://www.soundjay.com/buttons/beep-07.wav");

const goalTimeSec = 8 * 60;
const goalKph = (2 / (goalTimeSec / 3600)).toFixed(1);

const plan = {
Monday:{
title:"Intervals",
explain:"6 × 400 m at goal pace. 20 s rest between reps.",
warmup:[
{text:"10 min easy jog",speed:10},
{text:"Dynamic mobility"}
],
main:[
{text:"400 m fast",reps:6,duration:96,rest:20,speed:goalKph}
]
},
Tuesday:{
title:"Tempo",
explain:"25 min continuous tempo at 85% goal pace.",
warmup:[{text:"10 min easy jog",speed:10}],
main:[{text:"25 min tempo run",duration:1500,speed:(goalKph*0.85).toFixed(1)}]
},
Wednesday:{
title:"Recovery",
explain:"Easy aerobic recovery run.",
warmup:[{text:"5 min walk",speed:5}],
main:[{text:"20 min easy run",duration:1200,speed:9.5}]
},
Thursday:{
title:"VO₂ Max",
explain:"5 × 500 m faster than goal pace. 2 min rest.",
warmup:[{text:"10 min jog",speed:10}],
main:[
{text:"500 m fast",reps:5,duration:135,rest:120,speed:(goalKph*1.1).toFixed(1)}
]
},
Friday:{
title:"Endurance",
explain:"35 min steady aerobic endurance run.",
warmup:[{text:"10 min jog",speed:10}],
main:[{text:"35 min run",duration:2100,speed:10}]
},
Saturday:{
title:"Race Simulation",
explain:"Broken 2 km at race pace with fast finish.",
warmup:[{text:"10 min jog",speed:10}],
main:[
{text:"1 km steady",duration:300,speed:(goalKph*0.95).toFixed(1)},
{text:"Recovery",duration:120},
{text:"500 m race pace",duration:150,speed:goalKph},
{text:"400 m fast finish",reps:2,duration:120,rest:60,speed:(goalKph*1.05).toFixed(1)}
]
}
};

// ---------- COMPLETION TRACKING ----------
function todayKey(){
const d=new Date();
return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

function markCompleted(){
localStorage.setItem(todayKey(),"completed");
updateCompletionUI();
}

function updateCompletionUI(){
const el=document.getElementById("completionStatus");
el.textContent=localStorage.getItem(todayKey())==="completed"
?"Completed ✅":"";
}

// ---------- DOM ----------
const daySelect=document.getElementById("daySelect");
const warmupList=document.getElementById("warmupList");
const mainBlock=document.getElementById("mainBlock");
const dayTitle=document.getElementById("dayTitle");
const dayExplain=document.getElementById("dayExplain");
const sessionTimer=document.getElementById("sessionTimer");

const startBtn=document.getElementById("start");
const pauseBtn=document.getElementById("pause");
const resetBtn=document.getElementById("reset");

let sessionSec=0;
let sessionInterval;
let repTimers=[];
let activeIndex=0;

// ---------- HELPERS ----------
function format(sec){
const m=Math.floor(sec/60).toString().padStart(2,"0");
const s=(sec%60).toString().padStart(2,"0");
return `${m}:${s}`;
}

// ---------- INIT DAYS ----------
Object.keys(plan).forEach(d=>{
const o=document.createElement("option");
o.value=d;
o.textContent=d;
daySelect.appendChild(o);
});

const todayName=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()];
daySelect.value=plan[todayName]?todayName:"Monday";

// ---------- RENDER ----------
function renderDay(day){
activeIndex=0;
repTimers=[];
warmupList.innerHTML="";
mainBlock.innerHTML="";

const d=plan[day];
dayTitle.textContent=day;
dayExplain.textContent=d.explain;

d.warmup.forEach(w=>{
const div=document.createElement("div");
div.className="session-item";
div.innerHTML=`<span>• ${w.text}${w.speed?` @ ${w.speed} kph`:""}</span><span></span><input type="checkbox">`;
warmupList.appendChild(div);
});

d.main.forEach(item=>{
const reps=item.reps||1;
for(let i=1;i<=reps;i++){
const div=document.createElement("div");
div.className="session-item";
div.innerHTML=`
<span>• ${item.text}${reps>1?` (Rep ${i}/${reps})`:""}${item.speed?` @ ${item.speed} kph`:""}${item.rest?` | Rest ${item.rest}s`:""}</span>
<span class="countdown">${item.duration?format(item.duration):""}</span>
<input type="checkbox">
`;
mainBlock.appendChild(div);
repTimers.push({el:div,sec:item.duration});
}
});

updateCompletionUI();
}

// ---------- TIMERS ----------
function runNext(){
if(activeIndex>=repTimers.length){
markCompleted();
return;
}
const obj=repTimers[activeIndex];
const cd=obj.el.querySelector(".countdown");
const cb=obj.el.querySelector("input");
beep.play();

const int=setInterval(()=>{
obj.sec--;
cd.textContent=format(obj.sec);
if(obj.sec<=0){
clearInterval(int);
cb.checked=true;
beep.play();
activeIndex++;
runNext();
}
},1000);
}

startBtn.onclick=()=>{
clearInterval(sessionInterval);
sessionInterval=setInterval(()=>{
sessionSec++;
sessionTimer.textContent=format(sessionSec);
},1000);
runNext();
};

pauseBtn.onclick=()=>clearInterval(sessionInterval);

resetBtn.onclick=()=>{
clearInterval(sessionInterval);
sessionSec=0;
sessionTimer.textContent="00:00";
renderDay(daySelect.value);
};

daySelect.onchange=e=>renderDay(e.target.value);

// ---------- START ----------
renderDay(daySelect.value);
});
