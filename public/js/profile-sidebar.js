document.addEventListener("DOMContentLoaded", () => {

  const navLinks = document.querySelectorAll(".nav-links a");
  const currentPath = window.location.pathname;

  navLinks.forEach(link => {
    const linkPath = link.getAttribute("href");
    if (currentPath === linkPath) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  const profileBtn = document.getElementById("profileBtn");
  const dropdown = document.getElementById("profileSidebar"); // renamed from profileDropdown

  if (profileBtn && dropdown) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isVisible = dropdown.style.display === "block";
      dropdown.style.display = isVisible ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target) && !profileBtn.contains(e.target)) {
        dropdown.style.display = "none";
      }
    });

    // Prevent toggle click from closing dropdown
    const toggleRow = dropdown.querySelector(".toggle");
    if (toggleRow) toggleRow.addEventListener("click", (e) => e.stopPropagation());
  }

  const toggle = document.getElementById("providerToggle");
  if (toggle) {
    const currentPage = window.location.pathname;
    const baseName = currentPage.split("/").pop();

    // Determine if user is currently on provider page
    const isProviderPage = baseName.includes("-provider");
    toggle.checked = isProviderPage;

    toggle.addEventListener("change", (e) => {
      e.stopPropagation();
      let targetPage = "";

      if (toggle.checked) {
        if (baseName === "homepage") {
          targetPage = "/homepage-provider";
        } else if (baseName === "profile") {
          targetPage = "/profile-provider";
        } else if (baseName === "chatbox") {
          targetPage = "/chatbox-provider";
        }
      } else {
        if (baseName === "homepage-provider") {
          targetPage = "/homepage";
        } else if (baseName === "profile-provider") {
          targetPage = "/profile";
        } else if (baseName === "chatbox-provider") {
          targetPage = "/chatbox";
        }
      }

      if (targetPage) {
        window.location.href = targetPage;
      }
    });
  }
});
