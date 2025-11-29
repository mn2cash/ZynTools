const lmp=document.getElementById("lmp");
const calcBtn=document.getElementById("calcBtn");
const errorMsg=document.getElementById("errorMsg");
const dueDateEl=document.getElementById("dueDate");
const weekEl=document.getElementById("week");
const trimesterEl=document.getElementById("trimester");
const timelineFill=document.getElementById("timelineFill");
const MS_DAY=1000*60*60*24;

function getTrimester(week){
  if(week<=13) return "First";
  if(week<=26) return "Second";
  return "Third";
}

function calculate(){
  if(!lmp.value){ errorMsg.textContent="Please select your LMP date."; return; }
  const lmpDate=new Date(lmp.value);
  if(isNaN(lmpDate)) { errorMsg.textContent="Invalid date."; return; }
  const dueDate=new Date(lmpDate.getTime()+280*MS_DAY);
  const today=new Date();
  const diffDays=Math.max(0, Math.floor((today-lmpDate)/MS_DAY));
  const week=Math.min(40, Math.floor(diffDays/7));
  const trimester=getTrimester(week);
  errorMsg.textContent="";
  dueDateEl.textContent=dueDate.toLocaleDateString();
  weekEl.textContent=`${week} w`; 
  trimesterEl.textContent=trimester;
  const pct=Math.min(100, (diffDays/(280))*100);
  timelineFill.style.width=`${pct.toFixed(1)}%`;
}

calcBtn.addEventListener("click", calculate);
lmp.addEventListener("keydown", e=>{ if(e.key==="Enter") calculate(); });
