document.addEventListener("DOMContentLoaded", () => {
  const profileBtn = document.getElementById("profileBtn");
  const dropdown = document.getElementById("profileSidebar");
  const toggle = document.getElementById("providerToggle");

  // Profile dropdown toggle
  if (profileBtn && dropdown) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target) && !profileBtn.contains(e.target)) {
        dropdown.style.display = "none";
      }
    });

    const toggleRow = dropdown.querySelector(".toggle");
    if (toggleRow) toggleRow.addEventListener("click", (e) => e.stopPropagation());
  }

// Service provider mode toggle
if (toggle) {

  const savedMode = localStorage.getItem("isProvider");

  if (savedMode === null) {
    toggle.checked = true;
    localStorage.setItem("isProvider", "true");
  } else {
    toggle.checked = savedMode === "true";
  }

  toggle.addEventListener("change", async () => {
    const newMode = toggle.checked;
    localStorage.setItem("isProvider", newMode);

    try {
      const response = await fetch("/mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isProvider: newMode }),
      });

      const data = await response.json();
      if (!data.success) throw new Error("Failed to update mode");

      window.location.reload();

    } catch (err) {
      console.error(err);
      toggle.checked = !newMode;
      localStorage.setItem("isProvider", !newMode);
    }
  });
}


});