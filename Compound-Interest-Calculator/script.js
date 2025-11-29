const principal=document.getElementById("principal");
const deposit=document.getElementById("deposit");
const rate=document.getElementById("rate");
const years=document.getElementById("years");
const calcBtn=document.getElementById("calcBtn");
const errorMsg=document.getElementById("errorMsg");
const finalAmount=document.getElementById("finalAmount");
const totalContrib=document.getElementById("totalContrib");
const interestEarned=document.getElementById("interestEarned");
const canvas=document.getElementById("chart");
const ctx=canvas.getContext("2d");

function validate(){
  if(parseFloat(rate.value)<0) return "Rate cannot be negative.";
  if(parseFloat(years.value)<=0) return "Enter years greater than 0.";
  return null;
}

function draw(points){
  const w=canvas.width; const h=canvas.height; ctx.clearRect(0,0,w,h);
  if(!points.length) return;
  const vals=points.map(p=>p.val); const min=Math.min(...vals); const max=Math.max(...vals); const pad=(max-min)*0.1||1;
  ctx.beginPath();
  points.forEach((p,i)=>{
    const x=i/(points.length-1)*w;
    const y=h-((p.val-(min-pad))/((max+pad)-(min-pad)))*h;
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.strokeStyle="rgba(6,182,212,0.8)"; ctx.lineWidth=2; ctx.shadowColor="rgba(6,182,212,0.4)"; ctx.shadowBlur=8; ctx.stroke(); ctx.shadowBlur=0;
}

function calculate(){
  const err=validate();
  if(err){ errorMsg.textContent=err; return; }
  errorMsg.textContent="";
  const p=parseFloat(principal.value)||0;
  const m=parseFloat(deposit.value)||0;
  const r=(parseFloat(rate.value)||0)/100/12;
  const n=(parseFloat(years.value)||0)*12;
  let future=p*Math.pow(1+r,n);
  for(let i=1;i<=n;i++) future+=m*Math.pow(1+r,n-i);
  const contributed=p+m*n;
  const interest=future-contributed;
  finalAmount.textContent=`£${future.toFixed(0)}`;
  totalContrib.textContent=`£${contributed.toFixed(0)}`;
  interestEarned.textContent=`£${interest.toFixed(0)}`;
  const yearly=[];
  for(let y=0;y<=n/12;y++){
    const months=y*12;
    let val=p*Math.pow(1+r,months);
    for(let i=1;i<=months;i++) val+=m*Math.pow(1+r,months-i);
    yearly.push({year:y,val});
  }
  draw(yearly);
}

calcBtn.addEventListener("click", calculate);
[principal, deposit, rate, years].forEach(inp=>inp.addEventListener("keydown", e=>{ if(e.key==="Enter") calculate(); }));
