const birthday=document.getElementById("birthday");
const ageBtn=document.getElementById("ageBtn");
const ageError=document.getElementById("ageError");
const yearsEl=document.getElementById("years");
const monthsEl=document.getElementById("months");
const daysEl=document.getElementById("days");
const hoursEl=document.getElementById("hours");
const funFact=document.getElementById("funFact");

function animateNumber(el,target){
  const start=Number(el.textContent)||0;
  const duration=400;
  const startTime=performance.now();
  function tick(now){
    const progress=Math.min(1,(now-startTime)/duration);
    const value=Math.floor(start+(target-start)*progress);
    el.textContent=value;
    el.style.transform=`translateY(${(1-progress)*4}px)`;
    el.style.color="#f5f7ff";
    if(progress<1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function calculateAge(){
  if(!birthday.value){ ageError.textContent="Please select your birthday."; return; }
  const birthDate=new Date(birthday.value);
  if(isNaN(birthDate.getTime())){ ageError.textContent="Invalid date."; return; }
  const now=new Date();
  if(birthDate>now){ ageError.textContent="Birthday cannot be in the future."; return; }
  ageError.textContent="";

  const diffMs=now-birthDate;
  const days=Math.floor(diffMs/(1000*60*60*24));
  const hours=Math.floor(diffMs/(1000*60*60));

  let years=now.getFullYear()-birthDate.getFullYear();
  let months=now.getMonth()-birthDate.getMonth();
  if(months<0){ years--; months+=12; }
  const monthDiff=now.getMonth()-birthDate.getMonth();
  const dayDiff=now.getDate()-birthDate.getDate();
  if(dayDiff<0){
    months = (months-1+12)%12;
  }

  animateNumber(yearsEl, years);
  animateNumber(monthsEl, months);
  animateNumber(daysEl, days);
  animateNumber(hoursEl, hours);
  funFact.textContent=`You are ${days.toLocaleString()} days old.`;
}

ageBtn.addEventListener("click", calculateAge);
birthday.addEventListener("keydown", e=>{ if(e.key==="Enter") calculateAge(); });
