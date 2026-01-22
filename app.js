document.addEventListener("DOMContentLoaded", () => {

const plan = {
  Monday: {
    explain: "6 × 400m at full effort (~14.8 kph)",
    reps: ["400m @ 14.8 kph","400m @ 14.8 kph","400m @ 14.8 kph","400m @ 14.8 kph","400m @ 14.8 kph","400m @ 14.8 kph"]
  },
  Tuesday: {
    explain: "Tempo run at ~12.5 kph for 25 minutes",
    reps: ["25 min @ 12.5 kph","3 × 100m strides @ 13 kph"]
  },
  Wednesday: {
    explain: "Easy recovery run",
    reps: ["20 min @ 9–10 kph"]
  },
  Thursday: {
    explain: "VO₂ max session",
    reps: ["5 × 500m @ 16.2 kph"]
  },
  Friday: {
    explain: "Endurance + strides",
    reps: ["35 min @ 10 kph","4 × 1 min @ 13–14 kph"]
  },
  Saturday: {
    explain: "Race simulation",
    reps: ["1km @ 14.1 kph","500m @ 14.8 kph","2 × 400m fast"]
  }
};

const title = document.getElementById("dayTitle");
const explain = document.getElementById("dayExplain");
const main = document.getElementById("main");
const buttons = document.querySelectorAll(".days button");

function render(day){
  title.textContent = day;
  explain.textContent = plan[day].explain;
  main.innerHTML = "";

  plan[day].reps.forEach(r=>{
    const div=document.createElement("div");
    div.className="rep";
    div.textContent=r;
    main.appendChild(div);
  });

  buttons.forEach(b=>b.classList.remove("active"));
  document.querySelector(`[data-day="${day}"]`).classList.add("active");
}

// button clicks
buttons.forEach(btn=>{
  btn.addEventListener("click",()=>{
    render(btn.dataset.day);
  });
});

// AUTO LOAD MONDAY (THIS WAS MISSING BEFORE)
render("Monday");

});
