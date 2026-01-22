// Unregister any old service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()));
}

document.addEventListener("DOMContentLoaded", () => {

  const plan = {
    Monday: { title:"Intervals", explain:"Short, fast reps at 2 km pace.", warmup:["10 min jog"], main:["6x400m @ goal pace"], mobility:["Hip flexor 60s"] },
    Tuesday: { title:"Tempo Run", explain:"Sustained effort to improve lactate threshold.", warmup:["10 min jog"], main:["20-25 min tempo"], mobility:["Hamstring 60s"] },
    Wednesday: { title:"Recovery", explain:"Easy aerobic work to recover.", warmup:["5 min walk"], main:["20 min easy run"], mobility:["Full body 10 min"] },
    Thursday: { title:"VO2 Max", explain:"Intervals faster than race pace.", warmup:["10 min jog"], main:["5x500m faster than goal"], mobility:["Quad 60s"] },
    Friday: { title:"Endurance + Strides", explain:"Easy run with short strides.", warmup:["5-10 min jog"], main:["30-40 min easy run","4x100m strides"], mobility:["Foam roll 10 min"] },
    Saturday: { title:"Race Simulation", explain:"Broken race effort for pacing.", warmup:["10 min jog"], main:["1km slower pace","2min recovery","500m goal pace","2x400m fast finish"], mobility:["Hip flexor 60s"] }
  };

  const daySelect = document.getElementById("daySelect");
  const dayTitle = document.getElementById("dayTitle");
  const warmupList = document.getElementById("warmupList");
  const mainBlock = document.getElementById("mainBlock");
  const mobilityList = document.getElementById("mobilityList");
  const dayCard = document.getElementById("dayCard");

  const beep = new Audio("https://www.soundjay.com/buttons/beep-07.wav");

  // Populate day selector
  Object.keys(plan).forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    daySelect.appendChild(opt);
  });

  function renderDay(day){
    const data = plan[day];
    dayTitle.textContent = day;

    // Remove old explanation
    dayCard.querySelectorAll(".explainCard").forEach(e=>e.remove());

    // Explanation card
    const explainCard = document.createElement("div");
    explainCard.className="card explainCard";
    explainCard.innerHTML = `<div class="cardTitle">${data.title}</div><div class="muted">${data.explain}</div>`;
    dayCard.insertBefore(explainCard, warmupList.parentElement);

    // Warm-up
    warmupList.innerHTML="";
    data.warmup.forEach(i=>{ const li=document.createElement("li"); li.textContent=i; warmupList.appendChild(li); });

    // Main
    mainBlock.innerHTML="";
    data.main.forEach((step,i)=>{
      const div = document.createElement("div");
      div.className="mainSet";

      const cb=document.createElement("input");
      cb.type="checkbox";
      cb.id=`${day}-step-${i}`;
      cb.style.marginRight="8px";

      const p=document.createElement("p");
      p.textContent=step;

      const timer=document.createElement("span");
      timer.textContent="00:00";
      timer.style.marginLeft="10px";
      timer.style.color="#6fd3ff";

      let countdown;
      cb.addEventListener("change", ()=>{
        if(cb.checked){
          beep.play();
          let sec=30; // default 30s per set, adjust per workout if needed
          timer.textContent=`${Math.floor(sec/60).toString().padStart(2,'0')}:${(sec%60).toString().padStart(2,'0')}`;
          clearInterval(countdown);
          countdown=setInterval(()=>{
            sec--;
            timer.textContent=`${Math.floor(sec/60).toString().padStart(2,'0')}:${(sec%60).toString().padStart(2,'0')}`;
            if(sec<=0){ clearInterval(countdown); beep.play(); }
          },1000);
        } else { clearInterval(countdown); timer.textContent="00:00"; }
      });

      div.appendChild(cb);
      div.appendChild(p);
      div.appendChild(timer);
      mainBlock.appendChild(div);
    });

    // Mobility
    mobilityList.innerHTML="";
    data.mobility.forEach(i=>{ const div=document.createElement("div"); div.textContent=i; mobilityList.appendChild(div); });
  }

  renderDay("Monday");
  daySelect.addEventListener("change", e=>renderDay(e.target.value));

});
