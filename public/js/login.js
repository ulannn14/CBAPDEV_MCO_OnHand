$(document).ready(function () {
    /*
        attach the event `keyup` to the html element where id = `idNum`
        this html element is an `<input>` element
        this event activates when the user releases a key on the keyboard
    */
    $('#username').blur(function () {

        // get the value entered the user in the `<input>` element
        var userName = $('#username').val();

        /*
            send an HTTP GET request using JQuery AJAX
            the first parameter is the path in our server
            which is defined in `../../routes/routes.js`
            the server will execute the function getCheckID()
            defined in `../../controllers/signupController.js`
            the second parameter passes the variable `idNum`
            as the value of the field `idNum`
            to the server
            the last parameter executes a callback function
            when the server sent a response
        */
        $.get('/getCheckUsername', {userName: userName}, function (result) {
            if(!result) {
                $('#username').css('background-color', 'red');   
                $('#login-error').text('Username does not exist.');
            }
        });
    });
});
