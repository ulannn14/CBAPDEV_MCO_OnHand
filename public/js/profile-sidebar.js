
document.addEventListener("DOMContentLoaded", () => {
    const profileBtn = document.getElementById("profileBtn");
    const dropdown = document.getElementById("profileSidebar");

    if (profileBtn && dropdown) {
        profileBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (dropdown.style.display === "block") {
                dropdown.style.display = "none";
            } else {
                dropdown.style.display = "block";
            }
        });

        document.addEventListener("click", (e) => {
            if (!dropdown.contains(e.target) && !profileBtn.contains(e.target)) {
                dropdown.style.display = "none";
            }
        });

        // Prevent toggle inside sidebar from closing dropdown
        const toggleRow = dropdown.querySelector(".toggle");
        if (toggleRow) toggleRow.addEventListener("click", (e) => e.stopPropagation());
    }
});
