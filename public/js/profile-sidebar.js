document.addEventListener("DOMContentLoaded", () => {
  const profileBtn = document.getElementById("profileBtn");
  const dropdown = document.getElementById("profileSidebar");
  const toggle = document.getElementById("providerToggle");

  // === Dropdown open/close ===
  if (profileBtn && dropdown) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.style.display =
        dropdown.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target) && !profileBtn.contains(e.target)) {
        dropdown.style.display = "none";
      }
    });

    const toggleRow = dropdown.querySelector(".toggle");
    if (toggleRow) toggleRow.addEventListener("click", (e) => e.stopPropagation());
  }

  // === Provider Mode Toggle ===
  if (toggle) {
    // 1️⃣ Load saved mode from localStorage
    const savedMode = localStorage.getItem("isProvider") === "true";
    toggle.checked = savedMode;
    applyMode(savedMode); // apply immediately on load

    // 2️⃣ When user changes the toggle
    toggle.addEventListener("change", () => {
      const newMode = toggle.checked;
      localStorage.setItem("isProvider", newMode); // save to browser
      applyMode(newMode); // update homepage instantly
    });
  }

  // === Mode Applier Function ===
  function applyMode(isProvider) {
    const categories = document.querySelector(".categories");
    const heading = document.querySelector(".services-near-you h2");
    const postText = document.querySelector(".no-posts");

    if (isProvider) {
      if (categories) categories.style.display = "none";
      if (heading) heading.textContent = "Customers Near You";
      if (postText) postText.textContent = "No available customer requests near you yet.";
    } else {
      if (categories) categories.style.display = "block";
      if (heading) heading.textContent = "Services Near You";
      if (postText) postText.textContent = "No available services near you yet.";
    }
  }
});
