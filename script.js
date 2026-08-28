const completedEl = document.getElementById('completed');
const progressBar = document.getElementById('progressBar');
const messageEl = document.getElementById('message');
const elapsedEl = document.getElementById('elapsed');

function toDateOnly(d){
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysBetween(a,b){
  const msPerDay = 24*60*60*1000;
  const ad = toDateOnly(a).getTime();
  const bd = toDateOnly(b).getTime();
  return Math.round((bd - ad) / msPerDay);
}

// Fixed start and target: July 27 and Oct 10 of this year
const year = new Date().getFullYear();
const start = new Date(year, 6, 27); // month is 0-based -> 6 = July
const target = new Date(year, 9, 10); // 9 = October

function updateProgress(){
  const today = new Date();
  const rawTotal = daysBetween(start, target);
  const totalDays = rawTotal >= 0 ? rawTotal + 1 : 0; // inclusive

  let completedDays;
  if (toDateOnly(today) < toDateOnly(start)){
    completedDays = 0;
  } else if (toDateOnly(today) >= toDateOnly(target)){
    completedDays = totalDays;
  } else {
    completedDays = daysBetween(start, today) + 1;
  }

  const pct = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 100;

  completedEl.textContent = completedDays;
  // set CSS variable to show filled portion; overlay covers the rest
  progressBar.style.setProperty('--pct', pct + '%');
  messageEl.textContent = `${pct}% of the way`;

  // compute elapsed since July 24, 2026 and format aversary message
  const parts = computeElapsed(new Date(2026,6,24), today);
  elapsedEl.textContent = formatAversary(parts) || '';
}

updateProgress();
// update periodically so it stays accurate across days
setInterval(updateProgress, 60 * 1000);

function computeElapsed(from, to){
  if (to < from) return [];

  let y = to.getFullYear() - from.getFullYear();
  let m = to.getMonth() - from.getMonth();
  let d = to.getDate() - from.getDate();

  if (d < 0){
    const prevMonthDays = new Date(to.getFullYear(), to.getMonth(), 0).getDate();
    d += prevMonthDays;
    m -= 1;
  }

  if (m < 0){
    m += 12;
    y -= 1;
  }

  let w = Math.floor(d / 7);
  d = d % 7;

  const parts = [];
  if (y) parts.push({v: y, unit: y === 1 ? 'year' : 'years'});
  if (m) parts.push({v: m, unit: m === 1 ? 'month' : 'months'});
  if (w) parts.push({v: w, unit: w === 1 ? 'week' : 'weeks'});
  if (d) parts.push({v: d, unit: d === 1 ? 'day' : 'days'});

  return parts;
}

function formatAversary(parts){
  if (!parts || parts.length === 0) return '';

  // Build display for all but last part
  const last = parts[parts.length - 1];
  const head = parts.slice(0, -1).map(p => `${p.v} ${p.unit}`);

  // transform last unit to remove trailing 's' if present and add 'aversary'
  let unitStem = last.unit;
  if (unitStem.endsWith('s')) unitStem = unitStem.slice(0, -1);
  const lastStr = `${last.v} ${unitStem}aversary!`;

  let body = '';
  if (head.length === 0) body = lastStr;
  else if (head.length === 1) body = head[0] + ' and ' + lastStr;
  else body = head.join(', ') + ' and ' + lastStr;

  return 'Happy ' + body;
}
