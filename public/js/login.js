$(document).ready(function () {
    $('#username').blur(function () {
        var userName = $('#username').val().trim();
        if (!userName) return;
        $.get('/getCheckUsername', { userName: userName }, function (result) {
            if (!result) {
                $('#username').css('background-color', '#ffd6d6');
                $('#login-error').text('Username does not exist.');
                $('.login-btn').prop('disabled', true);
            } else {
                $('#username').css('background-color', '');
                $('#login-error').text('');
                $('.login-btn').prop('disabled', false);
            }
        });
    });

    $('#loginForm').on('submit', function (e) {
        e.preventDefault();

        const $btn = $('.login-btn');
        const userName = $('#username').val().trim();
        const password = $('#password').val().trim();

        if (userName === '' && password === '') {
            $('#login-error').text((res && res.message) ? res.message : 'Please enter your username and password.');
            return;
        }
        if (userName === '') {
            $('#login-error').text((res && res.message) ? res.message : 'Please enter your username.');
            return;
        }
        if (password === '') {
            $('#login-error').text((res && res.message) ? res.message : 'Please enter your password.');
            return;
        }

        $('#login-error').text('');
        $btn.prop('disabled', true).text('Checking...');

        $.ajax({
            url: '/login',
            method: 'POST',
            data: { userName: userName, password: password },
            dataType: 'json'
        })
        .done(function (res) {
            if (res && res.success) {
                window.location.href = res.redirect || '/home';
            } else {
                $('#login-error').text((res && res.message) ? res.message : 'Wrong password.');
                 $('#password').css('background-color', '#ffd6d6');
                $btn.prop('disabled', false).text('Log In');
            }
        })
        .fail(function (jqXHR) {
            let msg = 'An error occurred. Please try again.';
            try {
                const json = jqXHR.responseJSON;
                if (json && json.message) msg = json.message;
            } catch (err) {}
            $('#login-error').text(msg);
            $btn.prop('disabled', false).text('Log In');
        });
    });
});