const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzFc9dgpjcD3CQOjeeiXkeBvETiF21d74jt6e-SuKJ5oDfssq2ANXTe8ndln42rBLiFGg/exec";

let sheetData=[], highlights=[], currentIndex=-1, cellMap={};

const groups = {
 Group55:["00","05","50","55"],Group11:["11","16","61","66"],
 Group33:["33","38","83","88"],Group44:["44","49","94","99"],
 Group22:["22","27","72","77"],Group12:["12","17","21","26","62","67","71","76"],
 Group13:["13","18","31","36","63","68","81","86"],Group14:["14","19","41","46","64","69","91","96"],
 Group15:["01","06","10","15","51","56","60","65"],Group23:["23","28","32","37","73","78","82","87"],
 Group24:["24","29","42","47","74","79","92","97"],Group25:["02","07","20","25","52","57","70","75"],
 Group34:["34","39","43","48","84","89","93","98"],Group35:["03","08","30","35","53","58","80","85"],
 Group45:["04","09","40","45","54","59","90","95"]
};

function normalize(v) {
  if (v === null || v === undefined) return "";

  // ✅ CASE 1: Real Date object
  if (v instanceof Date) {
    return formatDate(v);
  }

  // ✅ CASE 2: ISO date string (1973-05-01T18:30:00.000Z)
  if (typeof v === "string" && v.includes("T") && !isNaN(Date.parse(v))) {
    return formatDate(new Date(v));
  }

  // ✅ CASE 3: Numbers → 2 digits
  if (typeof v === "number") {
    return String(v).padStart(2, "0");
  }

  // ✅ CASE 4: Numeric strings → 2 digits
  if (/^\d+$/.test(v)) {
    return v.padStart(2, "0");
  }

  return v;
}

function formatDate(d) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

}

window.onload=()=>{
 for(let g in groups){
  searchGroup.innerHTML+=`<option>${g}</option>`;
  resultGroup1.innerHTML+=`<option>${g}</option>`;
  resultGroup2.innerHTML+=`<option>${g}</option>`;
 }
 toggleMode(); 
 loadSheet();
};

function toggleMode(){
 groupBox.classList.toggle("hidden",searchMode.value==="value");
 valueBox.classList.toggle("hidden",searchMode.value==="group");
 resetAll();
}

function loadSheet(){
 fetch(WEB_APP_URL).then(r=>r.text()).then(t=>{
  sheetData=JSON.parse(t); renderTable();
 });
}

function renderTable(){
 let h="<table>"; cellMap={};
 sheetData.forEach((row,r)=>{
  h+="<tr>";
  row.forEach((c,i)=>{
   const id=`cell-${r}-${i}`;
   cellMap[id]={r,i};
   h+=`<td id="${id}">${normalize(c)}</td>`;
  });
  h+="</tr>";
 });
 h+="</table>"; table.innerHTML=h;
}

function resetAll(){
 highlights=[]; currentIndex=-1;
 Object.keys(cellMap).forEach(id=>{
  const el=document.getElementById(id); if(el) el.className="";
 });
}

function isValid(v){ return /^\d{1,2}$/.test(v); }

function search(){
 resetAll();
 if(searchMode.value==="group"){ runGroup(); } else { runValue(); }
}

function runGroup(){
 const sCol=+searchCol.value;
 const r1=+resultCol1.value, r2=resultCol2.value?+resultCol2.value:null;
 const sVals=groups[searchGroup.value], rv1=groups[resultGroup1.value], rv2=r2?groups[resultGroup2.value]:[];

 sheetData.forEach((row,r)=>{
  row.forEach((c,i)=>{
   const v=normalize(c); const el=document.getElementById(`cell-${r}-${i}`);
   if(!el) return;
   if(i===sCol && sVals.includes(v)){ el.className="search"; highlights.push({r,i}); }
   if(i===r1 && rv1.includes(v)) el.className="result";
   if(r2!==null && i===r2 && rv2.includes(v)) el.className="result2";
  });
 });
}

function runValue(){
 const sCol=+searchCol.value;
 const sv=normalize(searchValue.value);
 const r1=+valResultCol1.value, rv1=normalize(resultValue1.value);
 const r2=valResultCol2.value?+valResultCol2.value:null;
 const rv2=normalize(resultValue2.value);

 sheetData.forEach((row,r)=>{
  row.forEach((c,i)=>{
   const v=normalize(c); const el=document.getElementById(`cell-${r}-${i}`);
   if(!el || !isValid(v)) return;
   if(i===sCol && v===sv){ el.className="search"; highlights.push({r,i}); }
   if(i===r1 && v===rv1) el.className="result";
   if(r2!==null && i===r2 && v===rv2) el.className="result2";
  });
 });
}

function next(){ if(!highlights.length) return;
 currentIndex=(currentIndex+1)%highlights.length; scroll(highlights[currentIndex]); }
function prev(){ if(!highlights.length) return;
 currentIndex=(currentIndex-1+highlights.length)%highlights.length; scroll(highlights[currentIndex]); }

function scroll(p){
 document.getElementById(`cell-${p.r}-${p.i}`)?.scrollIntoView({behavior:"smooth",block:"center"});
}

function exportCSV(){
 if(!highlights.length) return alert("No data");
 const rows=[...new Set(highlights.map(h=>h.r))];
 let csv="";
 rows.forEach(r=>csv+=sheetData[r].map(v=>normalize(v)).join(",")+"\n");
 const a=document.createElement("a");
 a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
 a.download="search_results.csv"; a.click();
}


