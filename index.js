
// import module `express`
const express = require('express');

// import module `hbs`
const hbs = require('hbs');

// import module 'express-session'
const session = require('express-session');

// import module `routes` from `./routes/routes.js`
const routes = require('./routes/routes.js');

// import module `database` from `./model/db.js`
const db = require('./models/db.js');

const app = express();
const port = 9090;

// set `hbs` as view engine
app.set('view engine', 'hbs');

// Register a custom 'eq' helper for Handlebars
hbs.registerHelper('eq', function (a, b) {
    return a === b;
});

// Register a custom 'times' helper for Handlebars
hbs.registerHelper('times', function(n, block) {
    let accum = '';
    for (let i = 1; i <= n; i++) {
        accum += block.fn(i);
    }
    return accum;
});

// sets `/views/partials` as folder containing partial hbs files
hbs.registerPartials(__dirname + '/views/partials');

app.use(session({
    secret: 'onhand-secretkey',      // replace with a strong secret
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

app.use(function (req, res, next) {
    res.locals.sessionUser = req.session.user || null;
    next();
});

app.use(express.json());

// parses incoming requests with urlencoded payloads
app.use(express.urlencoded({extended: true}));

// set the folder `public` as folder containing static assets
// such as css, js, and image files
app.use(express.static('public'));

// define the paths contained in `./routes/routes.js`
app.use('/', routes);

// if the route is not defined in the server, render `../views/error.hbs`
// always define this as the last middleware
app.use(function (req, res) {
    res.render('error');
});

// connects to the database
db.connect();

// binds the server to a specific port
app.listen(port, function () {
    console.log('app listening at port ' + port);
});
