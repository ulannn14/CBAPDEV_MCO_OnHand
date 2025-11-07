<<<<<<< HEAD

// import module `express`
const express = require('express');

// import module `hbs`
const hbs = require('hbs');

// import module `routes` from `./routes/routes.js`
const routes = require('./routes/routes.js');

// import module `database` from `./model/db.js`
=======
// import module express
const express = require('express');

// import module hbs
const hbs = require('hbs');

// import module routes from ./routes/routes.js
const routes = require('./routes/routes.js');

// import module database from ./model/db.js
>>>>>>> b85b0d0a538335b17fa3c9ef92037f556bce56f7
const db = require('./models/db.js');

const app = express();
const port = 9090;

<<<<<<< HEAD
// set `hbs` as view engine
app.set('view engine', 'hbs');

// Register a custom 'eq' helper for Handlebars
hbs.registerHelper('eq', function (a, b) {
    return a === b;
});

// sets `/views/partials` as folder containing partial hbs files
=======
// set hbs as view engine
app.set('view engine', 'hbs');

// sets /views/partials as folder containing partial hbs files
>>>>>>> b85b0d0a538335b17fa3c9ef92037f556bce56f7
hbs.registerPartials(__dirname + '/views/partials');

// parses incoming requests with urlencoded payloads
app.use(express.urlencoded({extended: true}));

<<<<<<< HEAD
// set the folder `public` as folder containing static assets
// such as css, js, and image files
app.use(express.static('public'));

// define the paths contained in `./routes/routes.js`
app.use('/', routes);

// if the route is not defined in the server, render `../views/error.hbs`
=======
// set the folder public as folder containing static assets
// such as css, js, and image files
app.use(express.static('public'));

// define the paths contained in ./routes/routes.js
app.use('/', routes);

// if the route is not defined in the server, render ../views/error.hbs
>>>>>>> b85b0d0a538335b17fa3c9ef92037f556bce56f7
// always define this as the last middleware
app.use(function (req, res) {
    res.render('error');
});

// connects to the database
<<<<<<< HEAD
//db.connect();
=======
db.connect();
>>>>>>> b85b0d0a538335b17fa3c9ef92037f556bce56f7

// binds the server to a specific port
app.listen(port, function () {
    console.log('app listening at port ' + port);
<<<<<<< HEAD
});
=======
});
>>>>>>> b85b0d0a538335b17fa3c9ef92037f556bce56f7
