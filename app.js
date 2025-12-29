// 🔗 GOOGLE APPS SCRIPT WEB APP URL
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzFc9dgpjcD3CQOjeeiXkeBvETiF21d74jt6e-SuKJ5oDfssq2ANXTe8ndln42rBLiFGg/exec";

// DATA
let sheetData = [];
let highlights = [];
let currentIndex = -1;
let cellMap = {};

// GROUP DEFINITIONS
const groups = {
  Group55:["00","05","50","55"],
  Group11:["11","16","61","66"],
  Group33:["33","38","83","88"],
  Group44:["44","49","94","99"],
  Group22:["22","27","72","77"],
  Group12:["12","17","21","26","62","67","71","76"],
  Group13:["13","18","31","36","63","68","81","86"],
  Group14:["14","19","41","46","64","69","91","96"],
  Group15:["01","06","10","15","51","56","60","65"],
  Group23:["23","28","32","37","73","78","82","87"],
  Group24:["24","29","42","47","74","79","92","97"],
  Group25:["02","07","20","25","52","57","70","75"],
  Group34:["34","39","43","48","84","89","93","98"],
  Group35:["03","08","30","35","53","58","80","85"],
  Group45:["04","09","40","45","54","59","90","95"]
};

// FORMAT TO 2 DIGITS
function normalize(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "number") return String(v).padStart(2,"0");
  if (/^\d+$/.test(v)) return v.padStart(2,"0");
  return v;
}

// INIT
window.onload = function () {
  for (let g in groups) {
    searchGroup.innerHTML += `<option>${g}</option>`;
    resultGroup1.innerHTML += `<option>${g}</option>`;
    resultGroup2.innerHTML += `<option>${g}</option>`;
  }
  loadSheet();
};

// LOAD DATA
function loadSheet() {
  fetch(WEB_APP_URL)
    .then(r => r.text())
    .then(t => {
      sheetData = JSON.parse(t);
      renderTable();
    })
    .catch(() => alert("Failed to load Google Sheet"));
}

// RENDER TABLE ONCE
function renderTable() {
  let html = "<table>";
  cellMap = {};

  sheetData.forEach((row, r) => {
    html += "<tr>";
    row.forEach((cell, c) => {
      const id = `cell-${r}-${c}`;
      cellMap[id] = {r,c};
      html += `<td id="${id}">${normalize(cell)}</td>`;
    });
    html += "</tr>";
  });

  html += "</table>";
  table.innerHTML = html;
}

// CLEAR
function resetAll() {
  highlights = [];
  currentIndex = -1;
  Object.keys(cellMap).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = "";
  });
}

// SEARCH
function search() {
  resetAll();

  const sCol = parseInt(searchCol.value);
  const rCol1 = parseInt(resultCol1.value);
  const rCol2 = resultCol2.value ? parseInt(resultCol2.value) : null;

  const sVals = groups[searchGroup.value] || [];
  const rVals1 = groups[resultGroup1.value] || [];
  const rVals2 = rCol2 !== null ? groups[resultGroup2.value] || [] : [];

  sheetData.forEach((row, r) => {
    row.forEach((cell, c) => {
      const v = normalize(cell);
      const el = document.getElementById(`cell-${r}-${c}`);
      if (!el) return;

      if (c === sCol && sVals.includes(v)) {
        el.className = "search";
        highlights.push({r,c});
      }
      if (c === rCol1 && rVals1.includes(v)) el.className = "result";
      if (rCol2 !== null && c === rCol2 && rVals2.includes(v)) el.className = "result2";
    });
  });

  if (highlights.length === 0) alert("No search matches found");
}

// NAVIGATION
function next() {
  if (!highlights.length) return;
  currentIndex = (currentIndex + 1) % highlights.length;
  scrollToCell(highlights[currentIndex]);
}

function prev() {
  if (!highlights.length) return;
  currentIndex = (currentIndex - 1 + highlights.length) % highlights.length;
  scrollToCell(highlights[currentIndex]);
}

function scrollToCell(p) {
  const el = document.getElementById(`cell-${p.r}-${p.c}`);
  if (el) el.scrollIntoView({behavior:"smooth",block:"center",inline:"center"});
}

// EXPORT CSV
function exportCSV() {
  if (!highlights.length) {
    alert("No data to export");
    return;
  }

  const rows = new Set(highlights.map(h => h.r));
  let csv = "";

  rows.forEach(r => {
    csv += sheetData[r].map(v => normalize(v)).join(",") + "\n";
  });

  const blob = new Blob([csv], {type:"text/csv"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "group_search_results.csv";
  a.click();
}
