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

concertCheckboxes.forEach((cb) => cb.addEventListener("change", updateConcertCount));
trackRadios.forEach((r) => r.addEventListener("change", () => {
  applyTrackConstraints();
  updateConcertCount();
}));

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

  // City is required; the 5-track is locked to Tel Aviv.
  if (form.city && !form.city.value) {
    showMessage("יש לבחור עיר מועדפת.", "error");
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
