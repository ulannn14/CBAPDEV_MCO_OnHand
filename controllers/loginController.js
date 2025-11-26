
// import module `database` from `../models/db.js`
const db = require('../models/db.js');

// import module `User` from `../models/UserModel.js`
const User = require('../models/UserModel.js');

/*
    defines an object which contains functions executed as callback
    when a client requests for `login` paths in the server
*/
const loginController = {

    /*
        executed when the client sends an HTTP POST request `/login`
        as defined in `../routes/routes.js`
    */
    postLogin: async function (req, res) {
        try {
            var userName = (req.body.userName || '').trim();
            var password = (req.body.password || '').trim();

            var userExists = await db.findOne(User, { userName: userName, password: password });

            if (userExists) {
                req.session.user = {
                    _id: userExists._id,
                    userName: userExists.userName,
                    profilePicture: userExists.profilePicture || '/images/default_profile.png',
                    type: userExists.type,
                    mode: userExists.type
                };

                // If AJAX / XHR -> respond with JSON
                if (req.xhr || req.headers.accept && req.headers.accept.indexOf('application/json') !== -1) {
                    return res.json({ success: true, redirect: '/home' });
                }

                // normal form submit -> redirect
                return res.redirect('/home');
            } else {
                // login failed
                if (req.xhr || req.headers.accept && req.headers.accept.indexOf('application/json') !== -1) {
                    return res.status(401).json({ success: false, message: 'Wrong username or password.' });
                }

                // for normal form, render the login page again with an error message
                // (better than sending a separate error page)
                return res.render('login', { loggedInUser: null, loginError: 'Wrong username or password.' });
            }
        } catch (err) {
            console.error('postLogin error', err);
            if (req.xhr || req.headers.accept && req.headers.accept.indexOf('application/json') !== -1) {
                return res.status(500).json({ success: false, message: 'Server error. Try again later.' });
            }
            return res.render('error', { loggedInUser: null });
        }
    },


    /*
        executed when the client sends an HTTP GET request `/getCheckID`
        as defined in `../routes/routes.js`
    */
    getCheckUsername: async function (req, res) {

        /*
            when passing values using HTTP GET method
            the values are stored in `req.query` object
            Example url: `http://localhost/getCheckID?idNum=11312345`
            To retrieve the value of parameter `idNum`: `req.query.idNum`
        */
        var userName = req.query.userName;

        /*
            calls the function findOne()
            defined in the `database` object in `../models/db.js`
            searches for a single document based on the model `User`
            sends an empty string to the user if there are no match
            otherwise, sends an object containing the `idNum`
        */
        var result = await db.findOne(User, {userName: userName}, 'userName');
        res.send(result);
    },

    getCheckPassword: async function (req, res) {

        /*
            when passing values using HTTP GET method
            the values are stored in `req.query` object
            Example url: `http://localhost/getCheckID?idNum=11312345`
            To retrieve the value of parameter `idNum`: `req.query.idNum`
        */
        var userName = req.query.userName;
        var password = req.query.password;

        /*
            calls the function findOne()
            defined in the `database` object in `../models/db.js`
            searches for a single document based on the model `User`
            sends an empty string to the user if there are no match
            otherwise, sends an object containing the `idNum`
        */
        var result = await db.findOne(User, {userName: userName, password: password}, 'userName');
        if(!result) {
            res.send(false);
        } else {
            res.send(result);
        }
    }
};

/*
    exports the object `signupController` (defined above)
    when another script exports from this file
*/
module.exports = loginController;