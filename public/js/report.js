$(document).ready(function () {
  let reportedUserId = null;

  const $popup = $("#reportPopup");
  const $reasonInput = $("#reportReason");

  // ---------- Open Popup ----------
  $(".report-btn").on("click", function () {
    reportedUserId = $(this).data("user-id");
    $popup.show();
    $reasonInput.val("");
  });

  // ---------- Close Popup ----------
  $("#cancelReport").on("click", function () {
    $popup.hide();
  });

  // ---------- Submit Report ----------
  $("#submitReport").on("click", async function () {
    const reason = $reasonInput.val().trim();
    if (!reason) return alert("Please enter a reason.");

    try {
      const res = await fetch("/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportedUser: reportedUserId,
          reason
        })
      });

      const data = await res.json();

      if (data.success) {
        $popup.hide();
        $("#reportSuccessPopup").show(); 
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Failed to submit report.");
      console.error(err);
    }
  });

  // ---------- Success OK Button ----------
  $("#successOk").on("click", function () {
    $("#reportSuccessPopup").hide();
  });
});
