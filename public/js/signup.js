
$(document).ready(function () {

    // ---------- SERVICE PROVIDER TOGGLE ----------
    function toggleProviderFields(show) {
        const providerFields = $('#serviceProviderFields');
        const $form = $('#signupForm');
        const $signupBtn = $('#signupBtn'); // ensure button has this id (see HTML snippet)
        const $username = $('#username');
        const $password = $('#password');
        const $confirm = $('#confirmPassword');
        const $phone = $('#phone');
        const $birthday = $('#birthday');

        const $usernameError = $('#usernameError');
        const $passwordError = $('#passwordError');
        const $confirmPasswordError = $('#confirmPasswordError');
        const $phoneError = $('#phoneError');
        const $birthdayError = $('#birthdayError');

        // Rules
        const usernameMin = 5, usernameMax = 20;
        const pwMin = 11, pwMax = 20;
        const phoneLen = 11;
        const minYear = 2007; // must be 18 years old to register

        // Password regex: at least one digit and one special char
        const pwRegex = /^(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[{\]};:'",.<>\/?\\|`~]).{11,20}$/;

        // Username allowed pattern: letters, numbers, underscore, dot, hyphen (adjust if needed)
        const usernameRegex = /^[A-Za-z0-9_.-]{5,20}$/;

        // Email regex: should contain @ and a valid typical email pattern
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        $('#email').on('input blur', function () {
            const v = $(this).val().trim();

            if (!v) {
                setFieldError($('#email'), $('#emailError'), '');
                return;
            }

            // must contain @ and a valid typical email pattern
            if (!emailRegex.test(v)) {
                setFieldError($('#email'), $('#emailError'), 'Please enter a valid email address.');
                return;
            }

            // success
            setFieldError($('#email'), $('#emailError'), '');
        });

        function setFieldError($el, $errEl, message) {
            if (message) {
                $el.get(0).setCustomValidity(message);
                $errEl.text(message);
                $el.css('background-color', '#f8d7da');
            } else {
                $el.get(0).setCustomValidity('');
                $errEl.text('');
                $el.css('background-color', '');
            }
                updateSubmitState();
        }

        // Username validation
        $username.on('input blur', function () {
            const v = $username.val().trim();
            if (!v) {
                setFieldError($username, $usernameError, '');
            return;
            }
            if (v.length < usernameMin || v.length > usernameMax) {
                setFieldError($username, $usernameError, `Username must be ${usernameMin}-${usernameMax} characters.`);
            return;
            }
            if (!usernameRegex.test(v)) {
                setFieldError($username, $usernameError, 'Username may contain letters, numbers, ., _, - only.');
            return;
            }
            // success
                setFieldError($username, $usernameError, '');
        });

        // Password validation (requirements only show in password field)
        $password.on('input', function () {
            const v = $password.val();
            if (!v) {
                setFieldError($password, $passwordError, '');
            return;
            }
            if (v.length < pwMin || v.length > pwMax) {
                setFieldError($password, $passwordError, `Password must be ${pwMin}-${pwMax} characters.`);
            return;
            }
            if (!pwRegex.test(v)) {
                setFieldError($password, $passwordError, 'Password must include at least one number and one special character.');
            return;
            }
                setFieldError($password, $passwordError, '');
                // Also revalidate confirmation
                validatePasswordMatch();
        });

        // Confirm password: only mismatch message here
        function validatePasswordMatch() {
            const pw = $password.val();
            const pw2 = $confirm.val();
            if (!pw2) { // empty confirm -> no message
                setFieldError($confirm, $confirmPasswordError, '');
            return true;
            }
            if (pw !== pw2) {
                setFieldError($confirm, $confirmPasswordError, 'Passwords do not match.');
            return false;
            } else {
                setFieldError($confirm, $confirmPasswordError, '');
            return true;
            }
        }
        $confirm.on('input', validatePasswordMatch);

        // Phone validation: exactly 11 digits
        $phone.on('input blur', function () {
            const v = $phone.val().replace(/\D/g, ''); // remove non-digit characters

            if (!v) {
                setFieldError($phone, $phoneError, '');
            return;
            }
            if (v.length !== phoneLen) {
                setFieldError($phone, $phoneError, `Phone number must contain exactly ${phoneLen} digits.`);
            return;
            }
                setFieldError($phone, $phoneError, '');
        });

        // Birthday validation
        $birthday.on('change blur input', function () {
            const v = $birthday.val();

            if (!v) {
                setFieldError($birthday, $birthdayError, '');
            return;
            }
            const parts = v.split('-');
            if (parts.length !== 3) {
                setFieldError($birthday, $birthdayError, 'Invalid date.');
            return;
            }

            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const day = parseInt(parts[2], 10);

            // Quick checks
            if (isNaN(year) || isNaN(month) || isNaN(day)) {
                setFieldError($birthday, $birthdayError, 'Invalid date.');
            return;
            }
            if (month < 1 || month > 12) {
                setFieldError($birthday, $birthdayError, 'Month must be 01-12.');
            return;
            }
            if (day < 1 || day > 31) {
                setFieldError($birthday, $birthdayError, 'Day must be 01-31.');
            return;
            }
            if (year > minYear) {
                setFieldError($birthday, $birthdayError, 'You must be at least 18 years old.');
            return;
            }


            const dateObj = new Date(`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`);
            if (isNaN(dateObj.getTime())) {
                setFieldError($birthday, $birthdayError, 'Invalid date.');
            return;
            }

            if (dateObj.getUTCFullYear() !== year || (dateObj.getUTCMonth()+1) !== month || dateObj.getUTCDate() !== day) {
                setFieldError($birthday, $birthdayError, 'Invalid date.');
            return;
            }

            setFieldError($birthday, $birthdayError, '');
        });

        if (show) {
            providerFields.show();
            providerFields.find('input, select, textarea').prop('disabled', false);
            $('#workingLocation, #nbiClearance').attr('required', true);
            providerFields.find('input.startTimeHidden, input.endTimeHidden, select').attr('required', true);
            validateWorkingDays();
            initTimePickers(providerFields);
        } else {
            providerFields.hide();
            providerFields.find('input, select, textarea').prop('disabled', true);
            $('#workingLocation, #nbiClearance').removeAttr('required');
            providerFields.find('input.startTimeHidden, input.endTimeHidden, select').removeAttr('required');
            const wd = providerFields.find('input[name="workingDays"]');
            if (wd.length) wd.get(0).setCustomValidity('');
            providerFields.find('input.startTimeHidden, input.endTimeHidden').each(function () {
                this.setCustomValidity('');
            });
            updateSubmitState();
        }
    }

    $('input[name="isServiceProvider"]').change(function () {
        toggleProviderFields($(this).val() === 'yes');
    });

    toggleProviderFields($('input[name="isServiceProvider"]:checked').val() === 'yes');

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
                updateSubmitState();
            }

            hourSelect.add(minuteSelect).add(ampmSelect).off('change.tp').on('change.tp', updateHidden);
            updateHidden();
        });

        $(root).find('input[name="workingDays"]').off('change.workingDays').on('change.workingDays', function () {
            validateWorkingDays();
            updateSubmitState();
        });
    }

    // ---------- WORKING DAYS VALIDATION (at least one) ----------
    function validateWorkingDays() {
        const wdCheckboxes = $('#serviceProviderFields').find('input[name="workingDays"]');
        if (!wdCheckboxes.length) return true;
        const anyChecked = wdCheckboxes.is(':checked');
        const first = wdCheckboxes.get(0);
        if (!anyChecked) {
            first.setCustomValidity('Please select at least one working day');
        } else {
            first.setCustomValidity('');
        }
        return anyChecked;
    }

    // ---------- SUBMIT BUTTON STATE ----------
    function updateSubmitState() {
        const formEl = $('form').get(0);
        if (formEl && typeof formEl.checkValidity === 'function') {
            const ok = formEl.checkValidity();
            $('#signupBtn').prop('disabled', !ok);
        } else {
            $('#signupBtn').prop('disabled', false);
        }
    }

    if ($('input[name="isServiceProvider"]:checked').val() === 'yes') {
        initTimePickers($('#serviceProviderFields'));
    }

});
