$(document).ready(function () {
  let reportedUserId = null;

  const $popup = $("#reportPopup");
  const $reasonInput = $("#reportReason");

  // OPEN POPUP
  $(".report-btn").on("click", function () {
    reportedUserId = $(this).data("user-id");
    $popup.show();
    $reasonInput.val("");
  });

  // CLOSE POPUP
  $("#cancelReport").on("click", function () {
    $popup.hide();
  });

  // SUBMIT REPORT
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
        $("#reportSuccessPopup").show(); // <- custom popup
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Failed to submit report.");
      console.error(err);
    }
  });

  // SUCCESS OK BUTTON
  $("#successOk").on("click", function () {
    $("#reportSuccessPopup").hide();
  });
});
