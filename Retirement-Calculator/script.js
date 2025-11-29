const currentAge=document.getElementById("currentAge");
const retireAge=document.getElementById("retireAge");
const savings=document.getElementById("savings");
const contribution=document.getElementById("contribution");
const returnRate=document.getElementById("returnRate");
const calcBtn=document.getElementById("calcBtn");
const errorMsg=document.getElementById("errorMsg");
const balanceEl=document.getElementById("balance");
const contribsEl=document.getElementById("contribs");
const growthEl=document.getElementById("growth");
const canvas=document.getElementById("trend");
const ctx=canvas.getContext("2d");

function validate(){
  const ca=parseFloat(currentAge.value);
  const ra=parseFloat(retireAge.value);
  if(!ca||!ra||ra<=ca) return "Retirement age must be greater than current age.";
  if(parseFloat(savings.value)<0||parseFloat(contribution.value)<0) return "Values cannot be negative.";
  if(parseFloat(returnRate.value)<0) return "Return cannot be negative.";
  return null;
}

function drawLine(points){
  const w=canvas.width;
  const h=canvas.height;
  ctx.clearRect(0,0,w,h);
  if(!points.length) return;
  const vals=points.map(p=>p.val);
  const min=Math.min(...vals);
  const max=Math.max(...vals);
  const pad=(max-min)*0.1||1;
  ctx.beginPath();
  points.forEach((p,i)=>{
    const x=i/(points.length-1)*w;
    const y=h-((p.val-(min-pad))/((max+pad)-(min-pad)))*h;
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.strokeStyle="rgba(6,182,212,0.8)";
  ctx.lineWidth=2;
  ctx.shadowColor="rgba(6,182,212,0.4)";
  ctx.shadowBlur=8;
  ctx.stroke();
  ctx.shadowBlur=0;
}

function calculate(){
  const err=validate();
  if(err){ errorMsg.textContent=err; return; }
  errorMsg.textContent="";
  const years=retireAge.value-currentAge.value;
  const months=years*12;
  const principal=parseFloat(savings.value)||0;
  const monthly=parseFloat(contribution.value)||0;
  const r=parseFloat(returnRate.value)/100/12;
  let future=principal*Math.pow(1+r, months);
  for(let i=1;i<=months;i++) future+=monthly*Math.pow(1+r, months-i);
  const totalContrib=principal+(monthly*months);
  const growth=future-totalContrib;
  balanceEl.textContent=`£${future.toFixed(0)}`;
  contribsEl.textContent=`£${totalContrib.toFixed(0)}`;
  growthEl.textContent=`£${growth.toFixed(0)}`;
  const yearly=[];
  for(let y=0;y<=years;y++){
    const m=y*12;
    let val=principal*Math.pow(1+r, m);
    for(let i=1;i<=m;i++) val+=monthly*Math.pow(1+r, m-i);
    yearly.push({year:y,val});
  }
  drawLine(yearly);
}

calcBtn.addEventListener("click", calculate);
[currentAge, retireAge, savings, contribution, returnRate].forEach(inp=>inp.addEventListener("keydown", e=>{ if(e.key==="Enter") calculate(); }));
