// import module `database` from `../models/db.js`
const db = require('../models/db.js');

// import module `User` from `../models/UserModel.js`
const User = require('../models/UserModel.js');

// import module `bcrypt`
const bcrypt = require('bcrypt');

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
            const userName = (req.body.userName || "").trim();
            const password = (req.body.password || "").trim();

            const user = await db.findOne(User, { userName: userName });

            // If user does not exist, return error
            if (!user) {
                if (req.xhr) {
                    return res.status(401).json({ success: false, message: "Username not found." });
                }
                return res.render("login", { loggedInUser: null, loginError: "Username not found." });
            }

            // hashing comparison
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                if (req.xhr) {
                    return res.status(401).json({ success: false, message: "Wrong password." });
                }
                return res.render("login", { loggedInUser: null, loginError: "Wrong password." });
            }

            // if successful, set session user
            const dbUser = (typeof user.toObject === "function") ? user.toObject() : user;

            req.session.user = {
                _id: dbUser._id,
                userName: dbUser.userName,
                profilePicture: dbUser.profilePicture || "/images/default_profile.png",
                type: dbUser.type,
                mode: dbUser.type === "provider" ? "provider" : dbUser.type
            };

            return req.session.save(err => {
                if (err) {
                    console.error("Session save error:", err);
                    return res.status(500).render("error", { loggedInUser: null });
                }

                if (req.xhr) {
                    return res.json({ success: true, redirect: "/home" });
                }
                return res.redirect("/home");
            });

        } catch (err) {
            console.error("postLogin error", err);
            if (req.xhr) {
                return res.status(500).json({ success: false, message: "Server error." });
            }
            return res.render("error", { loggedInUser: null });
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
    exports the object `loginController` (defined above)
    when another script exports from this file
*/
module.exports = loginController;
