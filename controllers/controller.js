// import module `database` from `../models/db.js`
const db = require('../models/db.js');

// import module `User` from `../models/UserModel.js`
const User = require('../models/UserModel.js');

/*
    defines an object which contains functions executed as callback
    when a client requests for `index` paths in the server
*/
const controller = {

    /*
        executed when the client sends an HTTP GET request `/`
        as defined in `../routes/routes.js`
    */
    getIndex: function (req, res) {

        // render `../views/index.hbs`
        res.render('index');
    },

    /*
        executed when the client sends an HTTP GET request `/`
        as defined in `../routes/routes.js`
    */
    getLogout: function (req, res) {
        req.session.destroy(err => {
            if (err) {
                console.error("Error destroying session:", err);
            }
            res.redirect('/'); // redirect to index after logout
        });
        
    },

    postMode: function (req, res) {
        
        if (!req.session.user) {
            return res.json({ success: false, error: "Not logged in" });
        }

        // Customers CANNOT change mode
        if (req.session.user.type !== "provider") {
            return res.json({ success: false, error: "Not a provider" });
        }

        const { isProvider } = req.body;

        req.session.user.mode = isProvider ? "provider" : "customer";

        return res.json({ success: true });

    }
    
}

/*
    exports the object `controller` (defined above)
    when another script exports from this file
*/
module.exports = controller;