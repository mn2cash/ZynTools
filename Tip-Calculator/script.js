const billAmount=document.getElementById("billAmount");
const people=document.getElementById("people");
const tipRange=document.getElementById("tipRange");
const tipLabel=document.getElementById("tipLabel");
const roundUp=document.getElementById("roundUp");
const tipPerPerson=document.getElementById("tipPerPerson");
const totalPerPerson=document.getElementById("totalPerPerson");
const summaryText=document.getElementById("summaryText");
const tipError=document.getElementById("tipError");
const calcBtn=document.getElementById("calcBtn");
const chips=document.querySelectorAll(".chip");
const formatter=new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"});

function setTip(val){
  tipRange.value=val;
  tipLabel.textContent=`${val}%`;
}

function validate(){
  const bill=parseFloat(billAmount.value);
  const ppl=parseInt(people.value,10);
  if(!bill||bill<=0) return "Enter a valid bill amount.";
  if(!ppl||ppl<=0) return "People must be at least 1.";
  return null;
}

function calculate(){
  const error=validate();
  if(error){ tipError.textContent=error; return; }
  tipError.textContent="";
  const bill=parseFloat(billAmount.value);
  const tipPercent=parseFloat(tipRange.value);
  const ppl=parseInt(people.value,10);
  const tipTotal=bill*(tipPercent/100);
  let total=bill+tipTotal;
  if(roundUp.checked){ total=Math.ceil(total); }
  const tipEach=tipTotal/ppl;
  const totalEach=total/ppl;
  tipPerPerson.textContent=formatter.format(tipEach);
  totalPerPerson.textContent=formatter.format(totalEach);
  summaryText.textContent=`Tip ${tipPercent}% on ${formatter.format(bill)} split across ${ppl} ${ppl===1?"person":"people"}.`;
}

chips.forEach(ch=>ch.addEventListener("click",()=>{ setTip(ch.dataset.tip); calculate(); }));
tipRange.addEventListener("input",()=>{ setTip(tipRange.value); calculate(); });
calcBtn.addEventListener("click", calculate);
[billAmount, people].forEach(inp=>{
  inp.addEventListener("keydown", e=>{ if(e.key==="Enter") calculate(); });
});
roundUp.addEventListener("change", calculate);
setTip(tipRange.value);
