const loanAmount=document.getElementById("loanAmount");
const interestRate=document.getElementById("interestRate");
const loanTerm=document.getElementById("loanTerm");
const calculateBtn=document.getElementById("calculateBtn");
const errorMsg=document.getElementById("errorMsg");
const monthlyPayment=document.getElementById("monthlyPayment");
const totalInterest=document.getElementById("totalInterest");
const totalRepayment=document.getElementById("totalRepayment");
const principalBar=document.getElementById("principalBar");
const interestBar=document.getElementById("interestBar");
const formatter=new Intl.NumberFormat("en-GB", { style:"currency", currency:"GBP" });

function formatInput(input){
  const value=parseFloat(input.value);
  if(Number.isFinite(value)) {
    input.value=value.toFixed(input===loanTerm?0:2);
  }
}

function validate(){
  const amount=parseFloat(loanAmount.value);
  const rate=parseFloat(interestRate.value);
  const term=parseFloat(loanTerm.value);
  if(!amount||amount<=0) return "Enter a valid loan amount.";
  if(!rate||rate<=0) return "Provide a positive interest rate.";
  if(!term||term<=0) return "Specify a loan term.";
  return null;
}

function renderTotals(monthly, totalInt, totalPay){
  monthlyPayment.textContent=formatter.format(monthly);
  totalInterest.textContent=formatter.format(totalInt);
  totalRepayment.textContent=formatter.format(totalPay);
  const principalRatio=totalPay? Math.min(1, (totalPay-totalInt)/totalPay) : 0;
  const interestRatio=1-principalRatio;
  principalBar.style.width=`${(principalRatio*100).toFixed(1)}%`;
  interestBar.style.width=`${(interestRatio*100).toFixed(1)}%`;
}

function calculate(){
  const error=validate();
  if(error){
    errorMsg.textContent=error;
    return;
  }
  errorMsg.textContent="";
  const principal=parseFloat(loanAmount.value);
  const monthlyRate=parseFloat(interestRate.value)/100/12;
  const months=parseFloat(loanTerm.value)*12;
  const numerator=monthlyRate*Math.pow(1+monthlyRate, months);
  const denominator=Math.pow(1+monthlyRate, months)-1;
  const monthly=denominator? principal*numerator/denominator : principal/months;
  const total=monthly*months;
  const totalInt=total - principal;
  renderTotals(monthly, totalInt, total);
}

calculateBtn.addEventListener("click", calculate);
[loanAmount, interestRate, loanTerm].forEach(input=>{
  input.addEventListener("blur", ()=>formatInput(input));
  input.addEventListener("keydown", e=>{ if(e.key==="Enter") calculate(); });
});
