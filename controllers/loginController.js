// Import required modules
const db = require('../models/db.js')
const User = require('../models/UserModel.js');
const bcrypt = require('bcrypt');

// -- LOGIN CONTROLLER --
const loginController = {

    // ---------- POST LOGIN ----------
    postLogin: async function (req, res) {
        try {

            // Get username and password from body
            const userName = (req.body.userName || "").trim();
            const password = (req.body.password || "").trim();

            // Fetch user from the database
            const user = await db.findOne(User, { userName: userName });

            // If user does not exist, return error
            if (!user) {
                if (req.xhr) {
                    return res.status(401).json({ success: false, message: "Username not found." });
                }
                return res.render("login", { loggedInUser: null, loginError: "Username not found." });
            }

            // Match password to hashed password in database
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                if (req.xhr) {
                    return res.status(401).json({ success: false, message: "Wrong password." });
                }
                return res.render("login", { loggedInUser: null, loginError: "Wrong password." });
            }

            // If successful, set user as session user
            const dbUser = (typeof user.toObject === "function") ? user.toObject() : user;
            req.session.user = {
                _id: dbUser._id,
                userName: dbUser.userName,
                profilePicture: dbUser.profilePicture || "/images/default_profile.png",
                type: dbUser.type,
                mode: dbUser.type === "provider" ? "provider" : dbUser.type
            };

            // Save session user
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

            // Error handling
            console.error("postLogin error", err);
            if (req.xhr) {
                return res.status(500).json({ success: false, message: "Server error." });
            }
            return res.render("error", { loggedInUser: null });

        }

    },

    // ---------- GET CHECK USERNAME ----------
    getCheckUsername: async function (req, res) {

        // Get username from query
        var userName = req.query.userName;

        // Fetch username from database
        var result = await db.findOne(User, {userName: userName}, 'userName');
        res.send(result);
    },

    // ---------- GET CHECK PASSWORD ----------
    getCheckPassword: async function (req, res) {

        // Get username and password from query
        var userName = req.query.userName;
        var password = req.query.password;

        // Fetch username and password from database
        var result = await db.findOne(User, {userName: userName, password: password}, 'userName');
        if(!result) {
            res.send(false);
        } else {
            res.send(result);
        }

    }

};

// Export object 'loginController'
module.exports = loginController;
