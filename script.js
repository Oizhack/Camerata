const GOOGLE_SHEETS_ENDPOINT = "https://script.google.com/macros/s/AKfycbzLe5jrCo-n3MBunAYV_MbXfR10A3erUzFqjo7EEPdRBzPno-tRdtt2HH3XwrIjeXQ/exec";
const MAX_CONCERT_SELECTIONS = 6;
const form = document.getElementById("registration-form");
// All 9 concerts are selectable and count toward the "choose 6" rule.
// (data-optional is supported but currently unused — kept so a concert can be
// excluded from the count in the future without touching this logic.)
const concertCheckboxes = Array.from(document.querySelectorAll(".concert-checkbox:not([data-optional])"));
const allConcertCheckboxes = Array.from(document.querySelectorAll(".concert-checkbox"));
const concertCountEl = document.getElementById("concert-selection-count");
const messageBox = document.getElementById("form-message");

function updateConcertCount() {
  const selected = concertCheckboxes.filter((cb) => cb.checked).length;
  concertCountEl.textContent = selected;
  concertCheckboxes.forEach((cb) => {
    const card = cb.closest(".ccard");
    if (!cb.checked && selected >= MAX_CONCERT_SELECTIONS) {
      cb.disabled = true;
      card?.classList.add("opacity-50");
    } else {
      cb.disabled = false;
      card?.classList.remove("opacity-50");
    }
  });
}

function showMessage(text, type = "info") {
  messageBox.className = "visible " + type;
  messageBox.textContent = text;
}

concertCheckboxes.forEach((cb) => cb.addEventListener("change", updateConcertCount));

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const requiredSelected = concertCheckboxes.filter((cb) => cb.checked).length;

  if (requiredSelected < MAX_CONCERT_SELECTIONS) {
    showMessage(`יש לבחור בדיוק ${MAX_CONCERT_SELECTIONS} קונצרטים כדי להמשיך. בחרת ${requiredSelected}.`, "error");
    return;
  }

  // Collect every checked concert, including the optional special concert.
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
