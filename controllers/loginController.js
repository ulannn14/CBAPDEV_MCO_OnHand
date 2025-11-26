
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

        /*
            when submitting forms using HTTP POST method
            the values in the input fields are stored in `req.body` object
            each <input> element is identified using its `name` attribute
            Example: the value entered in <input type="text" name="fName">
            can be retrieved using `req.body.fName`
        */
        var userName = req.body.userName.trim();
        var password = req.body.password.trim();

        /*
            calls the function insertOne()
            defined in the `database` object in `../models/db.js`
            this function adds a document to collection `users`
        */
        var userExists = await db.findOne(User, {userName: userName, password: password});

        /*
            upon adding a user to the database,
            redirects the client to `/success` using HTTP GET,
            defined in `../routes/routes.js`
            passing values using URL
            which calls getSuccess() method
            defined in `./successController.js`
        */

        if (userExists) {
            req.session.user = {
                _id: userExists._id,
                userName: userExists.userName,
                profilePicture: userExists.profilePicture || '/images/default_profile.png',
                type: userExists.type,
                mode: userExists.type
            };
            res.redirect('/home');
        }
        else {
            res.render('error', { loggedInUser: null });
        }
    },

    /*
        executed when the client sends an HTTP GET request `/getCheckID`
        as defined in `../routes/routes.js`
    */
    getCheckID: async function (req, res) {

        /*
            when passing values using HTTP GET method
            the values are stored in `req.query` object
            Example url: `http://localhost/getCheckID?idNum=11312345`
            To retrieve the value of parameter `idNum`: `req.query.idNum`
        */
        var idNum = req.query.idNum;

        /*
            calls the function findOne()
            defined in the `database` object in `../models/db.js`
            searches for a single document based on the model `User`
            sends an empty string to the user if there are no match
            otherwise, sends an object containing the `idNum`
        */
        var result = await db.findOne(User, {idNum: idNum}, 'idNum');
        res.send(result);
    }

}

/*
    exports the object `signupController` (defined above)
    when another script exports from this file
*/
module.exports = loginController;