// ============================================================
// User interface
// ============================================================
const NAMES = {
  EARLYMORNING: "Early Morning", MORNINGRUSH: "Morning Rush", LATEMORNING: "Late Morning",
  NOON: "Noon", AFTERNOONRUSH: "Afternoon Rush",
  VERYNEAR: "Very Near", NEAR: "Near", MIDDLE: "Middle", FAR: "Far", VERYFAR: "Very Far",
  VERYSHORT: "Very Short", SHORT: "Short", FAIRLYSHORT: "Fairly Short", MODERATE: "Moderate",
  FAIRLYLONG: "Fairly Long", LONG: "Long", VERYLONG: "Very Long"
};
const nice = (t) => NAMES[t] || t;

// Formats hours (e.g. 11.45) as a 12-hour clock time (e.g. 11:27 AM)
function clockTime(hours) {
  const total = Math.round(hours * 60) % (24 * 60);
  const h = Math.floor(total / 60), m = total % 60;
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

function minutesText(minutes) {
  const m = Math.round(minutes);
  return `${m} ${m === 1 ? "minute" : "minutes"}`;
}

function membershipTable(title, terms, value) {
  let rows = "";
  for (const t of terms) {
    const mu = t.membership(value);
    rows += `<tr class="${mu === 0 ? "zero" : ""}"><td>${nice(t.GetLinguistic())}</td><td class="num">${mu.toFixed(2)}</td></tr>`;
  }
  return `<div class="table-wrap"><table><tr><th>${title}</th><th class="num">Membership</th></tr>${rows}</table></div>`;
}

const fis = new FuzzySet();
const schedule = new BusSchedule(fis);

const destinationEl = document.getElementById("destination");
const locationEl = document.getElementById("location");
const timeEl = document.getElementById("time");
const output = document.getElementById("output");

function startTerminal() {
  return destinationEl.value === "Sogod" ? "Ormoc" : "Sogod";
}

destinationEl.addEventListener("change", () => {
  document.getElementById("locationLabel").textContent =
    `Current location (km from ${startTerminal()} terminal)`;
  output.innerHTML = "";
});

// Pre-fill the current time
const now = new Date();
timeEl.value = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const locErr = document.getElementById("locationError");
  const timeErr = document.getElementById("timeError");
  locErr.textContent = "";
  timeErr.textContent = "";

  // ---- Inputs ----
  const dist = parseFloat(locationEl.value);
  let ok = true;
  if (locationEl.value.trim() === "" || isNaN(dist) || dist < 0 || dist > BusSchedule.MAX_DISTANCE) {
    locErr.textContent = "Please enter a number from 0 to 125.";
    ok = false;
  }
  if (!/^\d{2}:\d{2}$/.test(timeEl.value)) {
    timeErr.textContent = "Please enter the current time.";
    ok = false;
  }
  if (!ok) { output.innerHTML = ""; return; }

  const [hh, mm] = timeEl.value.split(":").map(Number);
  const currentTime = hh + mm / 60;
  const start = startTerminal();

  // ---- Find the next bus that reaches the user's location ----
  const bus = schedule.findNextBus(dist, currentTime);

  if (!bus) {
    output.innerHTML = `<div class="none"><strong>No more buses will pass your location today.</strong><br>
      The first bus leaves ${start} at 4:30 AM.</div>`;
    return;
  }

  // ---- Result ----
  let html = `
    <div class="result">
      <h2>Next bus to your location</h2>
      <div class="row"><span>Leaves ${start} terminal</span><span>${clockTime(bus.departure)}</span></div>
      <div class="row"><span>Travel time to your location</span><span class="big">${minutesText(bus.travelMin)} (${nice(bus.label)})</span></div>
      <div class="row"><span>Arrives at your location</span><span>${clockTime(bus.arrival)}</span></div>
      <div class="row"><span>Your waiting time</span><span class="big">${minutesText(bus.waitMin)}</span></div>
    </div>`;

  // ---- Fuzzy inference details for this bus ----
  fis.defuzzify(bus.departure, dist);   // re-run so the fired rules belong to this bus

  html += `<div class="details">
    <h2>Fuzzy inference details</h2>
    <p>Bus leaving ${start} at ${clockTime(bus.departure)}, location ${dist} km from ${start} terminal.</p>

    <h3>Fuzzification</h3>
    <p>Time of Day = ${clockTime(bus.departure)} (${bus.departure.toFixed(2)} h)</p>
    ${membershipTable("Time of Day", fis.departureTime, bus.departure)}
    <p style="margin-top:12px">Distance = ${dist} km</p>
    ${membershipTable("Distance", fis.distance, dist)}

    <h3>Rules fired</h3>
    <div class="table-wrap"><table>
      <tr><th>Rule</th><th class="num">Strength</th></tr>
      ${fis.getFiredRules().map(r =>
        `<tr><td>IF Time of Day is <b>${nice(r.timeTerm)}</b> AND Distance is <b>${nice(r.distanceTerm)}</b> THEN Travel Time is <b>${nice(r.outputTerm)}</b></td><td class="num">${r.strength.toFixed(2)}</td></tr>`
      ).join("")}
    </table></div>

    <h3>Defuzzification (center of sums)</h3>
    <p>Travel time = <b>${fis.getTravelTime().toFixed(2)} minutes</b></p>
    ${membershipTable("Travel Time", fis.travelTime, fis.getTravelTime())}
  </div>`;

  output.innerHTML = html;
});
