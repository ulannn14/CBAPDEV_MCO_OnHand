document.addEventListener("DOMContentLoaded", () => {
  const floatingBtn = document.querySelector(".floating-report");
  const postPopup = document.getElementById("postPopup");
  const cancelBtn = document.getElementById("cancelPost");

  if (!floatingBtn || !postPopup) return;

  floatingBtn.addEventListener("click", () => {
    postPopup.style.display = "flex";
  });

  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      postPopup.style.display = "none";
    });
  }

  postPopup.addEventListener("click", (e) => {
    if (e.target === postPopup) {
      postPopup.style.display = "none";
    }
  });
});
