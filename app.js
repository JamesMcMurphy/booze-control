const KEY='booze-control-v1';
const $=s=>document.querySelector(s); const $$=s=>[...document.querySelectorAll(s)];
let state=load(); let month=9; let selectedDay=null;

function blank(){return {entries:[],staged:{day:'',drinks:[]},warningDay:'',favoriteQuickPage:0}}
function normalizeState(raw){
  const base={...blank(),...(raw||{})};
  base.entries=(base.entries||[]).map(e=>({...e,amount:Number(e.amount)>0?Number(e.amount):1}));
  base.staged=base.staged||{day:'',drinks:[]};
  base.staged.day=base.staged.day||'';
  base.staged.drinks=(base.staged.drinks||[]).map(d=>typeof d==='string'?{name:d,amount:1}:{name:d.name,amount:Number(d.amount)>0?Number(d.amount):1});
  base.warningDay=base.warningDay||'';
  base.favoriteQuickPage=(base.favoriteQuickPage===1?1:0);
  return base;
}
function load(){try{return normalizeState(JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{return blank()}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function pad(n){return String(n).padStart(2,'0')}
function fmt(n){return Number.isInteger(n)?String(n):n.toFixed(1).replace(/\.0$/,'')}
function trackingDay(d=new Date()){const x=new Date(d.getTime()-4*3600000);return `${x.getFullYear()}-${pad(x.getMonth()+1)}-${pad(x.getDate())}`}
function committedUnits(day){return state.entries.filter(e=>e.day===day).reduce((s,e)=>s+(Number(e.amount)||1),0)}
function stagedUnits(){return (state.staged?.drinks||[]).reduce((s,d)=>s+(Number(d.amount)||1),0)}
function warningActive(){const day=trackingDay();return committedUnits(day)+stagedUnits()>=8}
function autoSubmit(){if(!state.staged?.drinks?.length)return;const cur=trackingDay();if(state.staged.day&&state.staged.day<cur) commitStaged(state.staged.day)}
function stage(name,amount=1){autoSubmit();name=name.trim();amount=Number(amount)||1;if(!name||amount<=0)return;const day=trackingDay();if(state.staged.drinks.length&&state.staged.day!==day)commitStaged(state.staged.day);if(!state.staged.drinks.length)state.staged.day=day;state.staged.drinks.push({name,amount});save();render();toast(amount)}
function commitStaged(day=state.staged.day||trackingDay()){if(!state.staged.drinks.length)return;state.staged.drinks.forEach((d,i)=>state.entries.push({id:crypto.randomUUID?.()||`${Date.now()}-${i}`,name:d.name,amount:Number(d.amount)||1,day}));state.staged={day:'',drinks:[]};save();render()}
function removeStaged(name){for(let i=state.staged.drinks.length-1;i>=0;i--){if(state.staged.drinks[i].name.toLowerCase()===name.toLowerCase()){state.staged.drinks.splice(i,1);break}}if(!state.staged.drinks.length)state.staged.day='';save();render()}
function removeCommitted(day,name){for(let i=state.entries.length-1;i>=0;i--){if(state.entries[i].day===day&&state.entries[i].name.toLowerCase()===name.toLowerCase()){state.entries.splice(i,1);break}}save();render();if(selectedDay)openDetail(selectedDay)}
function grouped(list){
  const m=new Map();
  list.forEach(x=>{const name=typeof x==='string'?x:x.name;const amount=typeof x==='string'?1:(Number(x.amount)||1);m.set(name,(m.get(name)||0)+amount)});
  return [...m].sort((a,b)=>a[0].localeCompare(b[0]));
}
function countDay(day){return committedUnits(day)}
let currentQuickPage=(state.favoriteQuickPage===1?1:0);
function updateQuickPageUI(){
  const tab0=$('#quickTab0'),tab1=$('#quickTab1'),favorite=$('#favoriteQuickPage');
  if(!tab0||!tab1||!favorite)return;
  tab0.classList.toggle('active',currentQuickPage===0);
  tab1.classList.toggle('active',currentQuickPage===1);
  const isFavorite=(state.favoriteQuickPage===currentQuickPage);
  favorite.classList.toggle('active',isFavorite);
  favorite.textContent=isFavorite?'★':'☆';
}
function showQuickPage(page,smooth=true){
  const carousel=$('#quickCarousel');
  currentQuickPage=Math.max(0,Math.min(1,Number(page)||0));
  updateQuickPageUI();
  if(!carousel)return;
  const left=carousel.clientWidth*currentQuickPage;
  if(smooth && typeof carousel.scrollTo==='function') carousel.scrollTo({left,behavior:'smooth'});
  else carousel.scrollLeft=left;
}
function syncQuickPageFromScroll(){
  const carousel=$('#quickCarousel');
  if(!carousel)return;
  const width=Math.max(1,carousel.clientWidth);
  const page=Math.max(0,Math.min(1,Math.round(carousel.scrollLeft/width)));
  if(page!==currentQuickPage){currentQuickPage=page;updateQuickPageUI();}
}
function favoriteCurrentQuickPage(){
  state.favoriteQuickPage=currentQuickPage;
  save();
  updateQuickPageUI();
  const t=$('#toast');
  if(t){t.textContent=`${currentQuickPage===0?'Classics':'Staples'} will open first ★`;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),950);}
}
function renderWarning(){const banner=$('#bacWarning');if(!banner)return;banner.classList.toggle('show',warningActive())}
function renderHome(){
  const sc=stagedUnits(),submitted=countDay(trackingDay());
  $('#stagedCount').textContent=`Staged · ${fmt(sc)} ${sc===1?'drink':'drinks'}`;
  $('#submittedCount').textContent=`Submitted today · ${fmt(submitted)} ${submitted===1?'drink':'drinks'}`;
  $('#submitBtn').disabled=!state.staged.drinks.length;
  const el=$('#stagedList');el.innerHTML='';const gs=grouped(state.staged.drinks);
  if(!gs.length)el.innerHTML='<div class="empty">Nothing staged yet</div>';
  gs.forEach(([name,count])=>{const b=document.createElement('button');b.className='pill';b.textContent=`${name} ×${fmt(count)}   ·   tap to remove last`;b.onclick=()=>removeStaged(name);el.appendChild(b)});
  renderWarning();
}
function renderCalendar(){
  const title=new Date(2026,month-1,1).toLocaleString(undefined,{month:'long',year:'numeric'});$('#monthTitle').textContent=title;
  const grid=$('#calendarGrid');grid.innerHTML='';const first=new Date(2026,month-1,1),offset=first.getDay(),days=new Date(2026,month,0).getDate();
  for(let i=0;i<offset;i++){const s=document.createElement('span');grid.appendChild(s)}
  for(let day=1;day<=days;day++){
    const key=`2026-${pad(month)}-${pad(day)}`,count=countDay(key);const b=document.createElement('button');b.className='day'+(count?' active-day':'');
    b.innerHTML=`<span>${day}</span>${count?`<span class="glass">🍸</span>`:''}${count>=2?'<i class="dot"></i>':''}`;b.onclick=()=>openDetail(key);grid.appendChild(b)
  }
}
function openDetail(day){
  selectedDay=day;const d=new Date(day+'T12:00:00');$('#detailDate').textContent=d.toLocaleString(undefined,{month:'long',day:'numeric'});
  const list=$('#detailList');list.innerHTML='';const items=state.entries.filter(e=>e.day===day),gs=grouped(items);
  if(!gs.length)list.innerHTML='<div class="empty">No drinks logged</div>';
  gs.forEach(([name,count])=>{const b=document.createElement('button');b.className='pill';b.textContent=`${name} ×${fmt(count)}   ·   tap to remove last`;b.onclick=()=>removeCommitted(day,name);list.appendChild(b)});
  const total=items.reduce((s,e)=>s+(Number(e.amount)||1),0);$('#detailTotal').textContent=`${fmt(total)} ${total===1?'drink':'drinks'}`;
  $('#detailOverlay').classList.add('show');$('#detailOverlay').setAttribute('aria-hidden','false')
}
function closeDetail(){selectedDay=null;$('#detailOverlay').classList.remove('show');$('#detailOverlay').setAttribute('aria-hidden','true')}
function render(){autoSubmit();renderHome();renderCalendar()}
function switchScreen(name){$$('.screen').forEach(x=>x.classList.remove('active'));$('#'+name).classList.add('active');$('#homeTab').classList.toggle('active',name==='home');$('#calendarTab').classList.toggle('active',name==='calendar');if(name==='calendar')renderCalendar()}
function toast(amount=1){const t=$('#toast');t.textContent=`Added ${fmt(amount)} ✓`;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),800)}

$$('.quick-card[data-drink]').forEach(b=>b.onclick=()=>stage(b.dataset.drink,Number(b.dataset.amount||1)));
$('#quickTab0').onclick=()=>showQuickPage(0,true);
$('#quickTab1').onclick=()=>showQuickPage(1,true);
$('#favoriteQuickPage').onclick=()=>favoriteCurrentQuickPage();
$('#bacardiFull').onclick=()=>stage('Bacardi Shot',1);
$('#bacardiHalf').onclick=()=>stage('Bacardi Shot',0.5);
$('#rumpleFull').onclick=()=>stage('Rumple',1);
$('#rumpleHalf').onclick=()=>stage('Rumple',0.5);
$('#otherAdd').onclick=()=>{stage($('#otherInput').value,1);$('#otherInput').value=''};
$('#otherInput').addEventListener('keydown',e=>{if(e.key==='Enter'){$('#otherAdd').click();e.target.blur()}});
$('#submitBtn').onclick=()=>commitStaged();
$('#homeTab').onclick=()=>switchScreen('home');$('#calendarTab').onclick=()=>switchScreen('calendar');
$('#prevMonth').onclick=()=>{if(month>9){month--;renderCalendar()}};$('#nextMonth').onclick=()=>{if(month<12){month++;renderCalendar()}};
$('#closeDetail').onclick=closeDetail;$('#detailOverlay').addEventListener('click',e=>{if(e.target.id==='detailOverlay')closeDetail()});
setInterval(()=>{autoSubmit();renderHome()},30000);document.addEventListener('visibilitychange',()=>{if(!document.hidden){autoSubmit();render()}});
const quickCarousel=$('#quickCarousel');
if(quickCarousel){
  let scrollTimer=null;
  let touchStartX=0;
  let touchStartY=0;
  quickCarousel.addEventListener('scroll',()=>{
    syncQuickPageFromScroll();
    clearTimeout(scrollTimer);
    scrollTimer=setTimeout(syncQuickPageFromScroll,70);
  },{passive:true});
  quickCarousel.addEventListener('touchstart',e=>{
    const t=e.touches&&e.touches[0]; if(!t)return;
    touchStartX=t.clientX; touchStartY=t.clientY;
  },{passive:true});
  quickCarousel.addEventListener('touchend',e=>{
    const t=e.changedTouches&&e.changedTouches[0]; if(!t)return;
    const dx=t.clientX-touchStartX,dy=t.clientY-touchStartY;
    if(Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)*1.15){
      showQuickPage(dx<0?Math.min(1,currentQuickPage+1):Math.max(0,currentQuickPage-1),true);
    }else{
      syncQuickPageFromScroll();
    }
  },{passive:true});
  if('onscrollend' in quickCarousel) quickCarousel.addEventListener('scrollend',syncQuickPageFromScroll,{passive:true});
  window.addEventListener('resize',()=>showQuickPage(currentQuickPage,false));
}
render();
requestAnimationFrame(()=>showQuickPage(state.favoriteQuickPage===1?1:0,false));
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
