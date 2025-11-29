const gender=document.getElementById("gender");
const age=document.getElementById("age");
const height=document.getElementById("height");
const weight=document.getElementById("weight");
const activity=document.getElementById("activity");
const calcBtn=document.getElementById("calcBtn");
const errorMsg=document.getElementById("errorMsg");
const bmrEl=document.getElementById("bmr");
const tdeeEl=document.getElementById("tdee");
const lossBar=document.getElementById("lossBar");
const maintBar=document.getElementById("maintBar");
const gainBar=document.getElementById("gainBar");
const lossVal=document.getElementById("lossVal");
const maintVal=document.getElementById("maintVal");
const gainVal=document.getElementById("gainVal");

function validate(){
  const a=parseFloat(age.value);
  const h=parseFloat(height.value);
  const w=parseFloat(weight.value);
  if(!a||a<=0) return "Enter a valid age.";
  if(!h||h<=0) return "Enter a valid height.";
  if(!w||w<=0) return "Enter a valid weight.";
  return null;
}

function calcBmr(){
  const g=gender.value;
  const a=parseFloat(age.value);
  const h=parseFloat(height.value);
  const w=parseFloat(weight.value);
  return g === "male"
    ? (10*w)+(6.25*h)-(5*a)+5
    : (10*w)+(6.25*h)-(5*a)-161;
}

function renderBars(loss, maint, gain){
  const max=Math.max(gain, maint, loss, 1);
  lossBar.style.width=`${(loss/max)*100}%`;
  maintBar.style.width=`${(maint/max)*100}%`;
  gainBar.style.width=`${(gain/max)*100}%`;
  lossVal.textContent=`${Math.round(loss)} kcal`;
  maintVal.textContent=`${Math.round(maint)} kcal`;
  gainVal.textContent=`${Math.round(gain)} kcal`;
}

function calculate(){
  const err=validate();
  if(err){ errorMsg.textContent=err; return; }
  errorMsg.textContent="";
  const bmr=calcBmr();
  const multiplier=parseFloat(activity.value);
  const tdee=bmr*multiplier;
  const loss=tdee-500;
  const gain=tdee+300;
  bmrEl.textContent=`${Math.round(bmr)} kcal`;
  tdeeEl.textContent=`${Math.round(tdee)} kcal`;
  renderBars(loss, tdee, gain);
}

calcBtn.addEventListener("click", calculate);
[age, height, weight].forEach(inp=>inp.addEventListener("keydown", e=>{ if(e.key==="Enter") calculate(); }));
