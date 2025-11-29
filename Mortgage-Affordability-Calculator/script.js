const income=document.getElementById("income");
const down=document.getElementById("down");
const debts=document.getElementById("debts");
const rate=document.getElementById("rate");
const term=document.getElementById("term");
const calcBtn=document.getElementById("calcBtn");
const errorMsg=document.getElementById("errorMsg");
const homePrice=document.getElementById("homePrice");
const monthly=document.getElementById("monthly");
const dtiEl=document.getElementById("dti");
const dtiBar=document.getElementById("dtiBar");
const statusEl=document.getElementById("status");

function validate(){
  if(parseFloat(rate.value)<0) return "Rate cannot be negative.";
  if(parseFloat(term.value)<=0) return "Term must be greater than 0.";
  return null;
}

function payment(principal, r, months){
  const mRate=r/12;
  const num=mRate*Math.pow(1+mRate, months);
  const den=Math.pow(1+mRate, months)-1;
  return den ? principal*num/den : principal/months;
}

function statusFromDti(dti){
  if(dti<0.36) return "Good";
  if(dti<0.43) return "Borderline";
  return "Risky";
}

function calculate(){
  const err=validate();
  if(err){ errorMsg.textContent=err; return; }
  errorMsg.textContent="";
  const annual=parseFloat(income.value)||0;
  const monthlyIncome=annual/12;
  const monthlyDebts=parseFloat(debts.value)||0;
  const dp=parseFloat(down.value)||0;
  const r=(parseFloat(rate.value)||0)/100;
  const months=(parseFloat(term.value)||0)*12;
  const allowablePmt=monthlyIncome*0.28; // front-end ratio
  const maxPmt=Math.max(0, allowablePmt - monthlyDebts*0.5);
  const maxPrincipal= maxPmt>0 ? (maxPmt * (Math.pow(1+r/12, months)-1)) / ( (r/12) * Math.pow(1+r/12, months) ) : 0;
  const price=maxPrincipal + dp;
  const actualPayment=payment(maxPrincipal, r, months);
  const dti=(monthlyDebts+actualPayment)/monthlyIncome;
  const status=statusFromDti(dti);
  homePrice.textContent=`£${Math.max(0,price).toFixed(0)}`;
  monthly.textContent=`£${Math.max(0,actualPayment).toFixed(0)}`;
  const dtiPct=(dti*100);
  dtiEl.textContent=`${dtiPct.toFixed(1)}%`;
  dtiBar.style.width=`${Math.min(100,dtiPct)}%`;
  statusEl.textContent=status;
}

calcBtn.addEventListener("click", calculate);
[income, down, debts, rate, term].forEach(inp=>inp.addEventListener("keydown", e=>{ if(e.key==="Enter") calculate(); }));
