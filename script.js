const GOOGLE_SHEETS_ENDPOINT = "https://script.google.com/macros/s/AKfycbzLe5jrCo-n3MBunAYV_MbXfR10A3erUzFqjo7EEPdRBzPno-tRdtt2HH3XwrIjeXQ/exec";
// Two subscription tracks: 6 of 8 (standard) or 8 of 8 (full). A valid
// registration selects exactly one of these counts.
const ALLOWED_SELECTIONS = [6, 8];
const MIN_SELECTION = Math.min(...ALLOWED_SELECTIONS);
const MAX_SELECTION = Math.max(...ALLOWED_SELECTIONS);
const form = document.getElementById("registration-form");
// The 8 selectable concerts. The bonus concert ("ממעמקים") has no checkbox,
// so it is naturally excluded. data-optional is still honoured if ever used.
const concertCheckboxes = Array.from(document.querySelectorAll(".concert-checkbox:not([data-optional])"));
const allConcertCheckboxes = Array.from(document.querySelectorAll(".concert-checkbox"));
const concertCountEl = document.getElementById("concert-selection-count");
const messageBox = document.getElementById("form-message");

function updateConcertCount() {
  const selected = concertCheckboxes.filter((cb) => cb.checked).length;
  concertCountEl.textContent = selected;
  // Allow up to the largest track (8); lock the rest only once that cap is hit.
  concertCheckboxes.forEach((cb) => {
    const card = cb.closest(".ccard");
    const lock = !cb.checked && selected >= MAX_SELECTION;
    cb.disabled = lock;
    card?.classList.toggle("opacity-50", lock);
  });
}

function showMessage(text, type = "info") {
  messageBox.className = "visible " + type;
  messageBox.textContent = text;
}

concertCheckboxes.forEach((cb) => cb.addEventListener("change", updateConcertCount));

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const selectedCount = concertCheckboxes.filter((cb) => cb.checked).length;

  if (!ALLOWED_SELECTIONS.includes(selectedCount)) {
    const msg = selectedCount < MIN_SELECTION
      ? `יש לבחור לפחות ${MIN_SELECTION} קונצרטים כדי להמשיך. בחרת ${selectedCount}.`
      : `ניתן לבחור ${ALLOWED_SELECTIONS.join(" או ")} קונצרטים בלבד. בחרת ${selectedCount}.`;
    showMessage(msg, "error");
    return;
  }

  // Collect every checked concert.
  const selectedConcerts = allConcertCheckboxes
    .filter((cb) => cb.checked)
    .map((cb) => cb.value);

  const formData = {
    secretKey: "CaMeRaTa@JeRuSaLeM#2026",
    fullName: form.fullName.value.trim(),
    phone: form.phone.value.trim(),
    email: form.email.value.trim(),
    subscriptionType: form.subscriptionType.value,
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
    updateConcertCount();
  } catch (error) {
    showMessage(`שגיאה בשליחה: ${error.message}`, "error");
    console.error(error);
  }
});

updateConcertCount();
