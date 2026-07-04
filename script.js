const GOOGLE_SHEETS_ENDPOINT = "https://script.google.com/macros/s/AKfycbzLe5jrCo-n3MBunAYV_MbXfR10A3erUzFqjo7EEPdRBzPno-tRdtt2HH3XwrIjeXQ/exec";

// Three subscription tracks: 5 (Tel Aviv only), 6-of-8, or 8-of-8. The chosen
// track sets exactly how many concerts must be selected.
const ALLOWED_TRACKS = [5, 6, 8];
const TA_ONLY_TRACK = 5;
const TEL_AVIV = "תל אביב";

const form = document.getElementById("registration-form");
// Counted concerts = the 8 "כלים וקולות" concerts. The bonus ("ממעמקים") carries
// data-optional, so it is excluded here (an add-on) but still submitted below.
const concertCheckboxes = Array.from(document.querySelectorAll(".concert-checkbox:not([data-optional])"));
const allConcertCheckboxes = Array.from(document.querySelectorAll(".concert-checkbox"));
const trackRadios = Array.from(document.querySelectorAll('input[name="subscriptionTrack"]'));
const citySelect = document.getElementById("city");
const stickyCountEl = document.getElementById("sticky-count");
const stickyLabelEl = document.getElementById("sticky-label");
const stickyCounter = document.getElementById("sticky-counter");
const messageBox = document.getElementById("form-message");
const summaryEl = document.getElementById("reg-summary");

// Currently selected track (5/6/8) or null if none chosen yet.
function getSelectedTrack() {
  const checked = trackRadios.find((r) => r.checked);
  return checked ? Number(checked.value) : null;
}

function updateConcertCount() {
  const selected = concertCheckboxes.filter((cb) => cb.checked).length;
  const required = getSelectedTrack();

  if (stickyCountEl) stickyCountEl.textContent = selected;
  if (stickyLabelEl) {
    stickyLabelEl.textContent = required
      ? `נבחרו · ${selected} מתוך ${required}`
      : "בחרו מסלול מנוי";
  }
  if (stickyCounter) stickyCounter.classList.toggle("valid", required !== null && selected === required);

  // Once a track is chosen, lock the remaining (unchecked) concerts as soon as its
  // quota is reached, so the subscriber can't exceed their track.
  concertCheckboxes.forEach((cb) => {
    const card = cb.closest(".ccard");
    const lock = required !== null && !cb.checked && selected >= required;
    cb.disabled = lock;
    card?.classList.toggle("opacity-50", lock);
  });

  // The selection changed, so any previous validation error is now stale — clear it.
  if (messageBox && messageBox.classList.contains("error")) hideMessage();

  updateSummary();
}

// Live recap of the subscriber's choices, shown as a ticket/program before submit.
const TYPE_LABELS = { single: "יחיד", couple: "זוגי" };
const TRACK_LABELS = { 5: "5 קונצרטים · תל אביב בלבד", 6: "6 קונצרטים", 8: "8 קונצרטים" };

function updateSummary() {
  if (!summaryEl) return;
  const track = getSelectedTrack();
  const typeVal = form.subscriptionType ? form.subscriptionType.value : "";
  const chosen = allConcertCheckboxes.filter((cb) => cb.checked);
  const counted = concertCheckboxes.filter((cb) => cb.checked).length;

  // Nothing chosen yet — invite the subscriber to build their subscription above.
  if (!track && !typeVal && chosen.length === 0) {
    summaryEl.className = "rsum empty";
    summaryEl.innerHTML =
      '<p class="rsum-empty">עדיין לא בחרתם — הרכיבו את המנוי שלכם למעלה, והוא יופיע כאן.</p>';
    return;
  }

  summaryEl.className = "rsum";
  const typeLabel = typeVal
    ? `מנוי ${TYPE_LABELS[typeVal]}`
    : '<span class="rsum-todo">בחרו סוג מנוי</span>';
  const trackLabel = track
    ? `מסלול ${TRACK_LABELS[track]}`
    : '<span class="rsum-todo">בחרו מסלול</span>';

  // Number every chosen concert sequentially (1..N), the bonus included, so it is
  // counted in the total. The quota count below still excludes the bonus.
  const items = chosen
    .map((cb, i) => {
      const parts = cb.value.split(/:\s(.+)/);
      const name = parts[1] || cb.value;
      const bonus = cb.hasAttribute("data-optional");
      const badge = String(i + 1).padStart(2, "0");
      return `<li class="${bonus ? "bonus" : ""}"><span class="n">${badge}</span><span class="cn">${name}</span>${
        bonus ? '<span class="btag">בונוס</span>' : ""
      }</li>`;
    })
    .join("");

  const bonusSel = chosen.some((cb) => cb.hasAttribute("data-optional"));
  const quota = track
    ? `נבחרו <b>${counted}</b> מתוך <b>${track}</b> קונצרטים במסלול`
    : `נבחרו <b>${counted}</b> קונצרטים`;
  const countLine = `${quota} · סה״כ <b>${chosen.length}</b> קונצרטים${
    bonusSel ? " <span class='rsum-plus'>כולל בונוס</span>" : ""
  }`;

  summaryEl.innerHTML =
    `<div class="rsum-head"><span class="rsum-type">${typeLabel}</span>` +
    `<span class="rsum-dot">·</span><span class="rsum-track">${trackLabel}</span></div>` +
    '<div class="rsum-perf" aria-hidden="true"></div>' +
    `<div class="rsum-count">${countLine}</div>` +
    (chosen.length
      ? `<ol class="rsum-list">${items}</ol>`
      : '<p class="rsum-empty">בחרו את הקונצרטים שתרצו למעלה.</p>');
}

// The 5-ticket track is Tel Aviv only: force the city to Tel Aviv and disable the
// other venues while it's selected; restore full choice for the 6/8 tracks.
function applyTrackConstraints() {
  if (!citySelect) return;
  const taOnly = getSelectedTrack() === TA_ONLY_TRACK;
  Array.from(citySelect.options).forEach((opt) => {
    if (opt.value === "" ) return; // leave the "בחרו עיר" placeholder as-is
    opt.disabled = taOnly && opt.value !== TEL_AVIV;
  });
  if (taOnly) citySelect.value = TEL_AVIV;
}

function showMessage(text, type = "info") {
  messageBox.className = "visible " + type;
  messageBox.textContent = text;
}

function hideMessage() {
  messageBox.className = "";
  messageBox.textContent = "";
}

// All concert checkboxes (incl. the optional bonus) refresh the recap; updateConcertCount
// only counts the non-optional ones, so the quota logic is unaffected.
allConcertCheckboxes.forEach((cb) => cb.addEventListener("change", updateConcertCount));
trackRadios.forEach((r) => r.addEventListener("change", () => {
  applyTrackConstraints();
  updateConcertCount();
}));
Array.from(document.querySelectorAll('input[name="subscriptionType"]')).forEach((r) =>
  r.addEventListener("change", updateSummary));

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const track = getSelectedTrack();
  if (track === null) {
    showMessage("יש לבחור מסלול מנוי (5 / 6 / 8 קונצרטים).", "error");
    return;
  }

  const selectedCount = concertCheckboxes.filter((cb) => cb.checked).length;
  if (selectedCount !== track) {
    showMessage(`במסלול שבחרתם יש לבחור בדיוק ${track} קונצרטים. בחרתם ${selectedCount}.`, "error");
    return;
  }

  // Subscription type (single/couple) is required.
  if (form.subscriptionType && !form.subscriptionType.value) {
    showMessage("יש לבחור סוג מנוי — יחיד או זוגי.", "error");
    return;
  }

  // Personal details are required (the form is novalidate, so we enforce them here).
  if (!form.fullName.value.trim()) {
    showMessage("יש למלא שם מלא.", "error");
    form.fullName.focus();
    return;
  }
  if (!/\d{6,}/.test(form.phone.value.replace(/[\s-]/g, ""))) {
    showMessage("יש למלא מספר טלפון תקין.", "error");
    form.phone.focus();
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value.trim())) {
    showMessage("יש למלא כתובת אימייל תקינה.", "error");
    form.email.focus();
    return;
  }

  // City is required; the 5-track is locked to Tel Aviv.
  if (form.city && !form.city.value) {
    showMessage("יש לבחור עיר מועדפת.", "error");
    form.city.focus();
    return;
  }
  if (track === TA_ONLY_TRACK && form.city && form.city.value !== TEL_AVIV) {
    showMessage("מסלול 5 הכרטיסים הוא בתל אביב בלבד.", "error");
    return;
  }

  // Collect every checked concert (includes the bonus if selected).
  const selectedConcerts = allConcertCheckboxes
    .filter((cb) => cb.checked)
    .map((cb) => cb.value);

  const formData = {
    secretKey: "CaMeRaTa@JeRuSaLeM#2026",
    fullName: form.fullName.value.trim(),
    phone: form.phone.value.trim(),
    email: form.email.value.trim(),
    subscriptionType: form.subscriptionType.value,
    subscriptionTrack: String(track),
    city: form.city ? form.city.value : "",
    selectedConcerts,
    submittedAt: new Date().toISOString(),
  };

  if (GOOGLE_SHEETS_ENDPOINT.includes("YOUR_SCRIPT_ID")) {
    showMessage("עדכן את מזהה ה-Google Apps Script ב-script.js לפני שליחה.", "error");
    return;
  }

  try {
    showMessage("שולח את ההרשמה שלך...", "info");
    const response = await fetch(GOOGLE_SHEETS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "הייתה שגיאה בשליחת הטופס.");
    }

    const result = await response.json();

    if (result.status === "duplicate") {
      showMessage(result.message, "error");
      return;
    }

    showMessage("ההרשמה נשלחה בהצלחה! תודה רבה.", "success");
    form.reset();
    applyTrackConstraints();
    updateConcertCount();
  } catch (error) {
    showMessage(`שגיאה בשליחה: ${error.message}`, "error");
    console.error(error);
  }
});

applyTrackConstraints();
updateConcertCount();
