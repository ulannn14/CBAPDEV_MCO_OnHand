
$(document).ready(function () {

    // ---------- SERVICE PROVIDER TOGGLE ----------
    function toggleProviderFields(show) {
        const providerFields = $('#serviceProviderFields');
        if (show) {
            providerFields.show();
            $('#workingLocation, #nbiClearance').attr('required', true);
            initTimePickers(providerFields); // initialize time pickers inside provider fields
        } else {
            providerFields.hide();
            $('#workingLocation, #nbiClearance').removeAttr('required');
        }
    }

    $('input[name="isServiceProvider"]').change(function () {
        toggleProviderFields($(this).val() === 'yes');
    });

    toggleProviderFields($('input[name="isServiceProvider"]:checked').val() === 'yes');

    // ---------- PASSWORD MATCH LIVE ----------
    function validatePasswordMatch() {
        const pw = $('#password').val();
        const pw2 = $('#confirmPassword').val();
        if (pw2 && pw !== pw2) {
            $('#confirmPassword').css('background-color', '#f8d7da');
            $('#passwordError').text('Passwords do not match');
            $('#signupBtn').prop('disabled', true);
        } else {
            $('#confirmPassword').css('background-color', '');
            $('#passwordError').text('');
            $('#signupBtn').prop('disabled', false);
        }
    }
    $('#password, #confirmPassword').on('input', validatePasswordMatch);

    // ---------- AJAX LIVE VALIDATION ----------
    function liveValidate(inputSelector, errorSelector, route) {
      $(inputSelector).on('keyup', function () {
          const value = $(this).val().trim();
          if (!value) {
              $(errorSelector).text('');
              $(inputSelector).css('background-color', '');
              $('#signupBtn').prop('disabled', false);
              return;
          }
          $.get(route, { value }, function (res) {
              const fieldName = $(inputSelector).attr('name');
              const capitalized = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
              if (res.exists) {
                  $(inputSelector).css('background-color', '#f8d7da');
                  $(errorSelector).text(`${capitalized} already taken`);
                  $('#signupBtn').prop('disabled', true);
              } else {
                  $(inputSelector).css('background-color', '');
                  $(errorSelector).text('');
                  $('#signupBtn').prop('disabled', false);
              }
          });
      });
    }

    liveValidate('#username', '#usernameError', '/checkUsername');
    liveValidate('#email', '#emailError', '/checkEmail');

    // ---------- TIME PICKER INITIALIZATION ----------
    function initTimePickers(scope) {
        const root = scope || document;
        $(root).find('.time-picker').each(function () {
            const hourSelect = $(this).find('.tp-hour');
            const minuteSelect = $(this).find('.tp-minute');
            const ampmSelect = $(this).find('.tp-ampm');
            const hidden = $(this).find('input.startTimeHidden, input.endTimeHidden');

            if (hourSelect.children().length <= 1) {
                hourSelect.empty().append('<option value="" disabled selected>Hour</option>');
                for (let h = 1; h <= 12; h++) hourSelect.append(`<option value="${h}">${h}</option>`);
            }

            if (minuteSelect.children().length <= 1) {
                minuteSelect.empty().append('<option value="" disabled selected>Min</option>');
                for (let m = 0; m < 60; m++) {
                    const mm = m < 10 ? '0' + m : m;
                    minuteSelect.append(`<option value="${mm}">${mm}</option>`);
                }
            }

            if (ampmSelect.children().length === 0) {
                ampmSelect.empty().append('<option value="" disabled selected>AM/PM</option>');
                ampmSelect.append('<option>AM</option><option>PM</option>');
            }

            function updateHidden() {
                const h = hourSelect.val() || '';
                const m = minuteSelect.val() || '';
                const ap = ampmSelect.val() || '';
                hidden.val(h && m && ap ? `${h.padStart(2,'0')}:${m}:${ap}` : '');
            }

            hourSelect.add(minuteSelect).add(ampmSelect).change(updateHidden);
            updateHidden();
        });
    }

    // initialize time pickers on page load if provider
    if ($('input[name="isServiceProvider"]:checked').val() === 'yes') {
        initTimePickers();
    }

});
