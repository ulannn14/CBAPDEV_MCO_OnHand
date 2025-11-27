document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".rating-stars").forEach(starContainer => {

    const stars = starContainer.querySelectorAll("i");
    const parent = starContainer.closest(".booking-right");
    const rateText = parent.querySelector(".rate-text");
    const confirmBtn = parent.querySelector(".confirm-btn");
    const cancelBtn = parent.querySelector(".cancel-btn");
    const ratingInput = parent.querySelector(".rating-value");
    const reviewBox = parent.querySelector(".review-box");

    stars.forEach(star => {
      star.addEventListener("click", () => {
        const rating = parseInt(star.dataset.value);

        stars.forEach((s, idx) => {
          if(idx < rating){
            s.classList.add("fa-solid");
            s.classList.remove("fa-regular");
            s.style.color = "#fbbf24";
          } else {
            s.classList.add("fa-regular");
            s.classList.remove("fa-solid");
            s.style.color = "#d1d5db"; 
          }
        });

        ratingInput.value = rating;
        rateText.style.display = "none";
        confirmBtn.style.display = "inline-block";
        cancelBtn.style.display = "inline-block";
        reviewBox.style.display = "block";
      });
    });

    cancelBtn.addEventListener("click", () => {
      stars.forEach(s => {
        s.classList.add("fa-regular");
        s.classList.remove("fa-solid");
        s.style.color = "#d1d5db";
      });

      ratingInput.value = "";
      reviewBox.value = "";
      reviewBox.style.display = "none";
      confirmBtn.style.display = "none";
      cancelBtn.style.display = "none";
      rateText.style.display = "block";
    });

  });
});
