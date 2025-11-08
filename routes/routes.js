
// import module `express`
const express = require('express');

// import module `controller` from `../controllers/controller.js`
const controller = require('../controllers/controller.js');

// import module `loginController` from `../controllers/loginController.js`
const loginController = require('../controllers/loginController.js');

// import module `homeController` from `../controllers/homeController.js`
const homeController = require('../controllers/homeController.js');

// import module `signupController` from `../controllers/signupController.js`
const signupController = require('../controllers/signupController.js');

// import module `profileController` from `../controllers/profileController.js`
const profileController = require('../controllers/profileController.js');

const app = express();

/*
    execute function getIndex()
    defined in object `controller` in `../controllers/controller.js`
    when a client sends an HTTP GET request for `/`
*/
app.get('/', controller.getIndex);

/*
    execute function getSuccess()
    defined in object `successController` in `../controllers/homeController.js`
    when a client sends an HTTP GET request for `/home`
*/
app.post('/login', loginController.postLogin);

/*
    execute function getSuccess()
    defined in object `successController` in `../controllers/homeController.js`
    when a client sends an HTTP GET request for `/home`
*/
app.get('/home', homeController.getHome);

/*
    execute function getProfile()
    defined in object `profileController` in `../controllers/profileController.js`
    when a client sends an HTTP GET request for `/profile/:idNum`
    where `idNum` is a parameter
*/
app.get('/profile/:idNum', profileController.getProfile);

/*
    exports the object `app` (defined above)
    when another script exports from this file
*/
module.exports = app;