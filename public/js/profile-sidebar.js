document.addEventListener("DOMContentLoaded", () => {
  const profileBtn = document.getElementById("profileBtn");
  const dropdown = document.getElementById("profileSidebar");
  const toggle = document.getElementById("providerToggle");

  // -------------------------
  // Profile dropdown toggle
  // -------------------------
  if (profileBtn && dropdown) {
    // Toggle dropdown on click
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target) && !profileBtn.contains(e.target)) {
        dropdown.style.display = "none";
      }
    });

    // Prevent toggle row click from closing dropdown
    const toggleRow = dropdown.querySelector(".toggle");
    if (toggleRow) toggleRow.addEventListener("click", (e) => e.stopPropagation());
  }

  // -------------------------
  // Service provider mode toggle
  // -------------------------
  if (toggle) {
    // Always initialize toggle based on session user
    const sessionMode = toggle.dataset.userMode; // "provider" or "customer"
    toggle.checked = sessionMode === "provider";

    // Sync localStorage (optional)
    localStorage.setItem("isProvider", toggle.checked);

    // Handle toggle changes
    toggle.addEventListener("change", async () => {
      const newMode = toggle.checked;

      // Prevent customers from toggling
      if (toggle.dataset.userType !== "provider") {
        toggle.checked = false;
        return;
      }

      localStorage.setItem("isProvider", newMode);

      try {
        const response = await fetch("/mode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isProvider: newMode }),
        });

        const data = await response.json();
        if (!data.success) throw new Error(data.error || "Failed to update mode");

        // Reload page to reflect new mode
        window.location.reload();
      } catch (err) {
        console.error("Mode update failed:", err);

        // Revert toggle if update fails
        toggle.checked = !newMode;
        localStorage.setItem("isProvider", !newMode);
      }
    });
  }
});
