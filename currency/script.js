const amountInput=document.getElementById("amount");
const resultBox=document.getElementById("resultBox");
const rateLine=document.getElementById("rateLine");
const timestampLine=document.getElementById("timestampLine");
const errorLine=document.getElementById("errorLine");
const swapBtn=document.getElementById("swapBtn");
const convertBtn=document.getElementById("convertBtn");
const historyNote=document.getElementById("historyNote");
const historyChart=document.getElementById("historyChart");
const pairLine=document.getElementById("pairLine");
const liveBadge=document.getElementById("liveBadge");
const currencyMetaList=[
  {code:"USD",name:"US Dollar",type:"fiat"},
  {code:"GBP",name:"British Pound",type:"fiat"},
  {code:"EUR",name:"Euro",type:"fiat"},
  {code:"JPY",name:"Japanese Yen",type:"fiat"},
  {code:"CAD",name:"Canadian Dollar",type:"fiat"},
  {code:"AUD",name:"Australian Dollar",type:"fiat"},
  {code:"NZD",name:"New Zealand Dollar",type:"fiat"},
  {code:"CHF",name:"Swiss Franc",type:"fiat"},
  {code:"CNY",name:"Chinese Yuan",type:"fiat"},
  {code:"INR",name:"Indian Rupee",type:"fiat"},
  {code:"AED",name:"Emirati Dirham",type:"fiat"},
  {code:"SEK",name:"Swedish Krona",type:"fiat"},
  {code:"NOK",name:"Norwegian Krone",type:"fiat"},
  {code:"ZAR",name:"South African Rand",type:"fiat"},
  {code:"HKD",name:"Hong Kong Dollar",type:"fiat"},
  {code:"SGD",name:"Singapore Dollar",type:"fiat"},
  {code:"KRW",name:"South Korean Won",type:"fiat"},
  {code:"MXN",name:"Mexican Peso",type:"fiat"},
  {code:"BRL",name:"Brazilian Real",type:"fiat"},
  {code:"TRY",name:"Turkish Lira",type:"fiat"},
  {code:"CNH",name:"Chinese Yuan Offshore",type:"fiat"},
  {code:"PLN",name:"Polish Zloty",type:"fiat"},
  {code:"CZK",name:"Czech Koruna",type:"fiat"},
  {code:"DKK",name:"Danish Krone",type:"fiat"},
  {code:"ILS",name:"Israeli Shekel",type:"fiat"},
  {code:"THB",name:"Thai Baht",type:"fiat"},
  {code:"MYR",name:"Malaysian Ringgit",type:"fiat"},
  {code:"IDR",name:"Indonesian Rupiah",type:"fiat"},
  {code:"PHP",name:"Philippine Peso",type:"fiat"},
  {code:"CLP",name:"Chilean Peso",type:"fiat"},
  {code:"NGN",name:"Nigerian Naira",type:"fiat"},
  {code:"BTC",name:"Bitcoin",type:"crypto"},
  {code:"ETH",name:"Ethereum",type:"crypto"},
  {code:"USDT",name:"Tether",type:"crypto"},
  {code:"BNB",name:"BNB",type:"crypto"},
  {code:"SOL",name:"Solana",type:"crypto"},
  {code:"XRP",name:"XRP",type:"crypto"},
  {code:"ADA",name:"Cardano",type:"crypto"},
  {code:"DOGE",name:"Dogecoin",type:"crypto"},
  {code:"DOT",name:"Polkadot",type:"crypto"},
  {code:"TRX",name:"TRON",type:"crypto"},
  {code:"MATIC",name:"Polygon",type:"crypto"},
  {code:"LTC",name:"Litecoin",type:"crypto"},
  {code:"ATOM",name:"Cosmos",type:"crypto"},
  {code:"ETC",name:"Ethereum Classic",type:"crypto"},
  {code:"AVAX",name:"Avalanche",type:"crypto"}
];
const currencyMeta=currencyMetaList.reduce((map,item)=>{map[item.code]=item;return map;}, {});
const currencyList=currencyMetaList.map(c=>c.code);
const dropdowns={
  from:{toggle:document.getElementById("fromDropdown"),panel:document.getElementById("fromPanel"),search:document.getElementById("fromSearch"),list:document.getElementById("fromList"),value:"USD"},
  to:{toggle:document.getElementById("toDropdown"),panel:document.getElementById("toPanel"),search:document.getElementById("toSearch"),list:document.getElementById("toList"),value:"GBP"}
};
let lastConversion=null;
let historyData=[];
let chartCtx=historyChart.getContext("2d");

function buildOption(code){
  const meta=currencyMeta[code]||{name:code};
  const div=document.createElement("div");
  div.className="dropdown-option";
  div.dataset.code=code;
  div.innerHTML=`<span class="code">${code}</span><span class="name">${meta.name||code}</span>`;
  return div;
}

function renderList(type,filter=""){
  const {list}=dropdowns[type];
  list.innerHTML="";
  const frag=document.createDocumentFragment();
  currencyList.filter(c=>{
    const meta=currencyMeta[c];
    const text=(c+" "+(meta?.name||" ")).toLowerCase();
    return text.includes(filter.toLowerCase());
  }).forEach(code=>frag.appendChild(buildOption(code)));
  list.appendChild(frag);
}

function setSelection(type,code){
  dropdowns[type].value=code;
  const meta=currencyMeta[code]||{name:code};
  dropdowns[type].toggle.innerHTML=`<span class="selection"><span class="code">${code}</span><span class="name">${meta.name||code}</span></span><span class="chevron">▾</span>`;
}

function closeAll(){Object.values(dropdowns).forEach(d=>d.panel.classList.remove("open"));}

function initDropdown(type){
  const d=dropdowns[type];
  renderList(type);
  setSelection(type,d.value);
  d.toggle.addEventListener("click",()=>{
    closeAll();
    d.panel.classList.toggle("open");
    d.search.focus();
  });
  d.search.addEventListener("input",()=>renderList(type,d.search.value));
  d.list.addEventListener("click",e=>{
    const item=e.target.closest(".dropdown-option");
    if(!item) return;
    setSelection(type,item.dataset.code);
    d.panel.classList.remove("open");
    handleConvert();
  });
}

document.addEventListener("click",e=>{
  if(!e.target.closest(".dropdown")) closeAll();
});

function showLoading(state){
  convertBtn.disabled=state;
  convertBtn.textContent=state?"Loading...":"Convert";
  resultBox.classList.toggle("loading",state);
}

async function fetchRate(amount,from,to){
  const url=`https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`;
  const res=await fetch(url);
  if(!res.ok) throw new Error("Rate fetch failed");
  return res.json();
}

async function fetchHistory(from,to){
  const end=new Date();
  const start=new Date();
  start.setDate(end.getDate()-9);
  const fmt=d=>d.toISOString().split("T")[0];
  const url=`https://api.frankfurter.app/${fmt(start)}..${fmt(end)}?from=${from}&to=${to}`;
  const res=await fetch(url);
  if(!res.ok) throw new Error("History fetch failed");
  const data=await res.json();
  const entries=Object.entries(data.rates||{}).sort((a,b)=>new Date(a[0])-new Date(b[0]));
  return entries.map(([date,vals])=>({date,rate:vals[to]}));
}

function drawChart(points){
  if(!points?.length){ historyNote.textContent="History unavailable for this pair."; chartCtx.clearRect(0,0,historyChart.width,historyChart.height); return; }
  historyNote.textContent="";
  const w=historyChart.width;
  const h=historyChart.height;
  chartCtx.clearRect(0,0,w,h);
  const vals=points.map(p=>p.rate);
  const min=Math.min(...vals);
  const max=Math.max(...vals);
  const pad= (max-min)*0.1 || 1;
  const xStep=w/(points.length-1);
  chartCtx.beginPath();
  points.forEach((p,i)=>{
    const x=i*xStep;
    const y=h-((p.rate-(min-pad))/((max+pad)-(min-pad)))*h;
    if(i===0) chartCtx.moveTo(x,y); else chartCtx.lineTo(x,y);
  });
  chartCtx.strokeStyle="rgba(6,182,212,0.8)";
  chartCtx.lineWidth=2;
  chartCtx.shadowColor="rgba(6,182,212,0.4)";
  chartCtx.shadowBlur=8;
  chartCtx.stroke();
  chartCtx.shadowBlur=0;
}

function renderResult(data,to){
  const converted=data.rates[to];
  const rate=converted/Number(data.amount);
  const from=dropdowns.from.value;
  const metaFrom=currencyMeta[from]||{};
  const metaTo=currencyMeta[to]||{};
  pairLine.textContent=`${from} → ${to}`;
  document.getElementById("convertedDisplay").textContent=`${converted.toFixed(2)} ${to}`;
  rateLine.textContent=`1 ${from} = ${rate.toFixed(4)} ${to}`;
  timestampLine.textContent=`Updated ${new Date().toLocaleTimeString()}`;
  errorLine.textContent="";
  liveBadge.classList.remove("error");
  liveBadge.textContent=`Live rate • Updated ${new Date().toLocaleTimeString()}`;
  resultBox.classList.add("visible");
  lastConversion={amount:data.amount,from,to,rate,converted};
}

function renderError(msg){
  errorLine.textContent=msg;
  liveBadge.classList.add("error");
  liveBadge.textContent="Rate unavailable • Try again";
}

async function handleConvert(){
  const amount=parseFloat(amountInput.value);
  const from=dropdowns.from.value;
  const to=dropdowns.to.value;
  if(!amount||amount<=0) return renderError("Enter a valid amount.");
  if(from===to) return renderError("Select two different currencies.");
  showLoading(true);
  try{
    const data=await fetchRate(amount,from,to);
    renderResult(data,to);
    try{
      const hist=await fetchHistory(from,to);
      drawChart(hist);
    }catch{ historyNote.textContent="History unavailable for this pair."; }
  }catch(err){
    renderError("Could not fetch rate. Check connection.");
  }finally{
    showLoading(false);
  }
}

function autoRefresh(){ if(!lastConversion) return; handleConvert(); }
function swapCurrencies(){
  const fromVal=dropdowns.from.value;
  setSelection("from",dropdowns.to.value);
  setSelection("to",fromVal);
  handleConvert();
}

function init(){
  Object.keys(dropdowns).forEach(initDropdown);
  swapBtn.addEventListener("click",()=>{ swapBtn.style.transform="rotate(180deg)"; setTimeout(()=>swapBtn.style.transform="",200); swapCurrencies(); });
  convertBtn.addEventListener("click",handleConvert);
  setInterval(autoRefresh,30000);
}

document.addEventListener("DOMContentLoaded",()=>{init();});

