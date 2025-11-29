/* Cache-Control: max-age=31536000, stale-while-revalidate=86400 */
const refreshIntervalMs=3e4;
const pageTitle="Amazon Deal Finder - Flash Discounts Updated Every 30 Seconds";
document.title=pageTitle;
const products=[{name:"Noise-Cancelling Headphones",category:"Tech",basePrice:199.99},{name:"4K Streaming Stick",category:"Tech",basePrice:49.99},{name:"Portable SSD 1TB",category:"Tech",basePrice:129.99},{name:"Smart Light Starter Kit",category:"Tech",basePrice:89.99},{name:"Air Fryer XL",category:"Kitchen",basePrice:139.99},{name:"Stainless Steel Knife Set",category:"Kitchen",basePrice:89.99},{name:"Pour-Over Coffee Maker",category:"Kitchen",basePrice:59.99},{name:"Cast Iron Skillet Duo",category:"Kitchen",basePrice:69.99},{name:"Wireless Gaming Mouse",category:"Gaming",basePrice:59.99},{name:"Mechanical Keyboard (RGB)",category:"Gaming",basePrice:109.99},{name:"Curved Gaming Monitor 32\"",category:"Gaming",basePrice:349.99},{name:"Pro Controller",category:"Gaming",basePrice:69.99}];
const perks=["Prime delivery","Free returns","Limited stock","Ships today","Top rated"];
let deals=[],activeCategory="All",searchTerm="",countdownId,nextRefreshAt=Date.now()+refreshIntervalMs;
const gridEl=document.getElementById("deal-grid"),searchInput=document.getElementById("search-input"),categoryButtons=document.querySelectorAll(".chip"),lastUpdatedEl=document.getElementById("last-updated"),refreshTimerEl=document.getElementById("refresh-timer"),metaDescription=document.querySelector('meta[name="description"]');
const formatPrice=v=>`$${v.toFixed(2)}`,randomDiscount=()=>15+Math.floor(Math.random()*41),pickPerk=()=>perks[Math.floor(Math.random()*perks.length)];
const generateDeals=()=>products.map(p=>{const discount=randomDiscount(),oldPrice=p.basePrice,newPrice=Math.round(Math.max(8,oldPrice*(1-discount/100))*100)/100;return {...p,discount,oldPrice,newPrice,perk:pickPerk()};});
const getFilteredDeals=()=>deals.filter(d=>(activeCategory==="All"||d.category===activeCategory)&&(!searchTerm||d.name.toLowerCase().includes(searchTerm)||d.category.toLowerCase().includes(searchTerm)));
const renderDeals=()=>{const filtered=getFilteredDeals();gridEl.innerHTML=filtered.length?"":'<div class="empty">No deals found. Try another search or category.</div>';filtered.forEach(deal=>{const card=document.createElement("article");card.className="deal-card";card.innerHTML=`<div class="deal-head"><p class="deal-title">${deal.name}</p><span class="category-tag">${deal.category}</span></div><div class="pricing"><span class="new-price">${formatPrice(deal.newPrice)}</span><span class="drop">-${deal.discount}%</span><span class="old-price">${formatPrice(deal.oldPrice)}</span></div><span class="ship">${deal.perk}</span>`;gridEl.appendChild(card);});};
const updateCountdown=()=>{const remaining=Math.max(0,Math.ceil((nextRefreshAt-Date.now())/1e3));refreshTimerEl.textContent=`${remaining}s`;};
const startCountdown=()=>{nextRefreshAt=Date.now()+refreshIntervalMs;updateCountdown();if(countdownId)clearInterval(countdownId);countdownId=setInterval(updateCountdown,1e3);};
const refreshDeals=()=>{deals=generateDeals();lastUpdatedEl.textContent=new Date().toLocaleTimeString();renderDeals();startCountdown();};
searchInput.addEventListener("input",e=>{searchTerm=e.target.value.trim().toLowerCase();renderDeals();});
categoryButtons.forEach(button=>button.addEventListener("click",()=>{activeCategory=button.dataset.category;categoryButtons.forEach(btn=>btn.classList.toggle("active",btn===button));renderDeals();}));
if(metaDescription&&metaDescription.content.length<80){metaDescription.setAttribute("content","Amazon Deal Finder auto-refreshes every 30 seconds with fresh tech, kitchen, and gaming discounts.");}
refreshDeals();setInterval(refreshDeals,refreshIntervalMs);
