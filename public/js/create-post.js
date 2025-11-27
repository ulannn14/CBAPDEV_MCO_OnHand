// public/js/create-post.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("createPostForm");
  const cancelBtn = document.getElementById("cancelPost");
  const postPopup = document.getElementById("postPopup");
  const imageInput = document.getElementById("postImages");
  const imagePreview = document.getElementById("imagePreview");

  // Show previews
  imageInput.addEventListener("change", () => {
    imagePreview.innerHTML = "";
    Array.from(imageInput.files).forEach(file => {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.style.width = "80px";
      img.style.height = "80px";
      img.style.objectFit = "cover";
      img.style.marginRight = "5px";
      imagePreview.appendChild(img);
    });
  });

  // Cancel button
  cancelBtn.addEventListener("click", () => {
    postPopup.style.display = "none";
    form.reset();
    imagePreview.innerHTML = "";
  });

  // Form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", document.getElementById("postTitle").value);
    formData.append("description", document.getElementById("postText").value);
    formData.append("location", document.getElementById("postLocation").value);
    formData.append("minPrice", document.getElementById("minPrice").value);
    formData.append("maxPrice", document.getElementById("maxPrice").value);

    // Different fields for customer/provider
    if (document.getElementById("postNeed")) {
      formData.append("postType", "LookingFor");
      formData.append("serviceType", document.getElementById("postNeed").value);
      formData.append("levelOfUrgency", document.getElementById("postUrgency").value);
    } else {
      formData.append("postType", "Offering");
      formData.append("serviceType", document.getElementById("postServiceType").value);
      formData.append("levelOfUrgency", document.getElementById("postUrgency").value);
      formData.append("workingHours", (document.getElementById("postWorkingHours") || {}).value || "");
    }

    // Append images
    Array.from(imageInput.files).forEach(file => {
      formData.append("images", file);
    });

    try {
      const res = await fetch("/create-post", {
        method: "POST",
        body: formData, 
        credentials: 'include'
      });

      const data = await res.json();
      if (data.success) {
        alert("Post created successfully!");
        window.location.reload(); // reload page to show post
      } else {
        alert("Failed to create post: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while creating the post.");
    }
  });
});