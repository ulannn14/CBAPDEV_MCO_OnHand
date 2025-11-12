
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
            return res.status(401).json({ success: false, message: "Not logged in" });
        }

        const { isProvider } = req.body;

        // Update session mode
        req.session.user.mode = isProvider ? "provider" : "customer";

        res.json({ success: true, mode: req.session.user.mode });

    }

}

/*
    exports the object `controller` (defined above)
    when another script exports from this file
*/
module.exports = controller;