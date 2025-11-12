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
    // Initialize toggle from localStorage
    const savedMode = localStorage.getItem("isProvider") === "true";
    toggle.checked = savedMode;

    toggle.addEventListener("change", async () => {
      const newMode = toggle.checked;
      localStorage.setItem("isProvider", newMode);

      try {
        // Update session mode on server
        const response = await fetch("/mode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isProvider: newMode }),
        });

        const data = await response.json();
        if (!data.success) throw new Error("Failed to update mode");

        // Reload the **current page** to reflect new mode
        window.location.reload();

      } catch (err) {
        console.error(err);
        // Revert toggle if update fails
        toggle.checked = !newMode;
        localStorage.setItem("isProvider", !newMode);
      }
    });
  }
});
