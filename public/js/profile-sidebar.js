document.addEventListener("DOMContentLoaded", () => {
  const profileBtn = document.getElementById("profileBtn");
  const dropdown = document.getElementById("profileSidebar");
  const toggle = document.getElementById("providerToggle");

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

  if (toggle) {
    const savedMode = localStorage.getItem("isProvider") === "true";
    toggle.checked = savedMode;

    applyMode(savedMode);

    toggle.addEventListener("change", () => {
      const newMode = toggle.checked;
      localStorage.setItem("isProvider", newMode);
      applyMode(newMode);
    });
  }

  // no refresh
  function applyMode(isProvider) {
    const categories = document.querySelector(".categories");
    const heading = document.querySelector(".services-near-you h2");
    const noPosts = document.querySelector(".no-posts");
    const workingHours = document.getElementById("workingHours");

    // Home Page
    if (categories) {
      categories.style.display = isProvider ? "none" : "block";
    }
    if (heading) {
      heading.textContent = isProvider
        ? "Customers Near You"
        : "Services Near You";
    }
    if (noPosts) {
      noPosts.textContent = isProvider
        ? "No available customer requests near you yet."
        : "No available services near you yet.";
    }

    // Profile Page
    if (workingHours) {
      workingHours.style.display = isProvider ? "block" : "none";
    }
  }
});
