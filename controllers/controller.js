// -- CONTROLLER --
const controller = {

    // ---------- GET INDEX ----------
    getIndex: function (req, res) {

        // render `../views/index.hbs`
        res.render('index');

    },

    // ---------- GET LOGOUT ----------
    getLogout: function (req, res) {

        // destroy session user
        req.session.destroy(err => {
            if (err) {
                console.error("Error destroying session:", err);
            }
            res.redirect('/');      // redirect to index after logout
        });
        
    },

    // ---------- POST MODE ----------
    postMode: function (req, res) {
        
        // checks if session user exists
        if (!req.session.user) {
            return res.json({ success: false, error: "Not logged in" });
        }

        // ensures that customers cannot change their mode
        if (req.session.user.type !== "provider") {
            return res.json({ success: false, error: "Not a provider" });
        }

        // gets mode from the body
        const { isProvider } = req.body;

        // toggles the user's mode
        req.session.user.mode = isProvider ? "provider" : "customer";

        return res.json({ success: true });

    }
    
}

// Export object 'controller'
module.exports = controller;