// 🔗 GOOGLE APPS SCRIPT WEB APP URL
const WEB_APP_URL =
"https://script.google.com/macros/s/AKfycbzFc9dgpjcD3CQOjeeiXkeBvETiF21d74jt6e-SuKJ5oDfssq2ANXTe8ndln42rBLiFGg/exec";

// STORAGE
let sheetData = [];
let highlights = [];
let currentIndex = -1;

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

// FORMAT VALUE TO 2 DIGITS
function normalize(val) {
  if (val === null || val === undefined) return "";
  if (typeof val === "number") return String(val).padStart(2,"0");
  if (/^\d+$/.test(val)) return val.padStart(2,"0");
  return val;
}

// LOAD GROUP DROPDOWNS + DATA
window.onload = function () {
  for (let g in groups) {
    searchGroup.innerHTML += `<option value="${g}">${g}</option>`;
    resultGroup1.innerHTML += `<option value="${g}">${g}</option>`;
    resultGroup2.innerHTML += `<option value="${g}">${g}</option>`;
  }
  loadSheet();
};

// LOAD GOOGLE SHEET
function loadSheet() {
  fetch(WEB_APP_URL)
    .then(res => res.text())
    .then(txt => {
      sheetData = JSON.parse(txt);
      renderTable();
    })
    .catch(() => alert("Failed to load Google Sheet"));
}

// RENDER TABLE (NO HIGHLIGHT)
function renderTable() {
  let html = "<table>";
  sheetData.forEach(row => {
    html += "<tr>";
    row.forEach(cell => {
      html += `<td>${normalize(cell)}</td>`;
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
  renderTable();
}

// SEARCH + HIGHLIGHT
function search() {
  resetAll();

  const sCol = parseInt(searchCol.value);
  const rCol1 = parseInt(resultCol1.value);
  const rCol2 = resultCol2.value ? parseInt(resultCol2.value) : null;

  const sVals = groups[searchGroup.value] || [];
  const rVals1 = groups[resultGroup1.value] || [];
  const rVals2 = resultCol2.value ? groups[resultGroup2.value] : [];

  let html = "<table>";

  sheetData.forEach((row, r) => {
    html += "<tr>";
    row.forEach((cell, c) => {
      const v = normalize(cell);
      let cls = "";

      if (c === sCol && sVals.includes(v)) {
        cls = "search";
        highlights.push({r,c});
      }

      if (c === rCol1 && rVals1.includes(v)) {
        cls = "result";
      }

      if (rCol2 !== null && c === rCol2 && rVals2.includes(v)) {
        cls = "result2";
      }

      html += `<td id="cell-${r}-${c}" class="${cls}">${v}</td>`;
    });
    html += "</tr>";
  });

  html += "</table>";
  table.innerHTML = html;

  if (highlights.length === 0) {
    alert("No search matches found");
  }
}

// NEXT / PREVIOUS
function next() {
  if (highlights.length === 0) return;
  currentIndex = (currentIndex + 1) % highlights.length;
  scrollToCell(highlights[currentIndex]);
}

function prev() {
  if (highlights.length === 0) return;
  currentIndex = (currentIndex - 1 + highlights.length) % highlights.length;
  scrollToCell(highlights[currentIndex]);
}

// SCROLL TO CELL
function scrollToCell(pos) {
  const el = document.getElementById(`cell-${pos.r}-${pos.c}`);
  if (el) {
    el.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center"
    });
  }
}
