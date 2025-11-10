
/*
    defines an object which contains functions executed as callback
    when a client requests for `home` paths in the server
*/
const homeController = {
    
    /*
        executed when the client sends an HTTP GET request `/home`
        as defined in `../routes/routes.js`
    */
    getHome: function (req, res) {

        // render `../views/homepage.hbs`
        res.render('homepage', {
            currentPage: 'home',
            user: req.session.user
        });

    }
}

/*
    exports the object `homeController` (defined above)
    when another script exports from this file
*/
module.exports = homeController;