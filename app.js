document.addEventListener("DOMContentLoaded", () => {

const plan = {
  Monday: {
    explain: "400m intervals at full effort (~14.8 kph)",
    warmup: ["10 min jog"],
    main: [{ text: "400m @ 14.8 kph", duration: 90, reps: 6 }],
    mobility: ["Calves, hips"]
  }
};

const daySelect = document.getElementById("daySelect");
const dayTitle = document.getElementById("dayTitle");
const dayExplain = document.getElementById("dayExplain");
const warmupList = document.getElementById("warmupList");
const mainBlock = document.getElementById("mainBlock");
const mobilityList = document.getElementById("mobilityList");
const calendar = document.getElementById("calendar");

Object.keys(plan).forEach(d=>{
  const o=document.createElement("option");
  o.value=d;o.textContent=d;
  daySelect.appendChild(o);
});

function render(day){
  const d=plan[day];
  dayTitle.textContent=day;
  dayExplain.textContent=d.explain;

  warmupList.innerHTML="";
  d.warmup.forEach(w=>{
    const li=document.createElement("li");
    li.textContent=w;
    warmupList.appendChild(li);
  });

  mainBlock.innerHTML="";
  d.main.forEach(s=>{
    for(let i=1;i<=s.reps;i++){
      const div=document.createElement("div");
      div.className="repRow";
      div.innerHTML=`${s.text} (Rep ${i}/${s.reps})`;
      mainBlock.appendChild(div);
    }
  });

  mobilityList.innerHTML=d.mobility.join("<br>");
}

render("Monday");
daySelect.addEventListener("change",e=>render(e.target.value));

const today=new Date().getDate();
for(let i=1;i<=31;i++){
  const d=document.createElement("div");
  d.className="calendarDay";
  d.textContent=i;
  if(i===today)d.classList.add("active");
  calendar.appendChild(d);
}

});
