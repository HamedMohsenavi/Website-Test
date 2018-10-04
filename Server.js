// Node Native
const http = require('http');

// Node Modules
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const validator = require('express-validator');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');
const methodOverride = require('method-override');

// Initialize Module Path and Environment Variables
require('app-module-path').addPath(__dirname);
require('dotenv').config();

// Helpers
global.Bind = require('./App/Helpers/Bind');

const App = express();

// Establish Mongoose Connection
mongoose.Promise = global.Promise;
mongoose.set('debug', process.env.DEBUG);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.connect(`mongodb://${process.env.DATABASE_USE_CREDENTIALS ? `${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@` : ''}${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`,
{
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 2500,
    useNewUrlParser: true
},
error =>
{
    if (error)
        return console.log(`DBError ${error}`);
});

// Static Files
App.use(express.static('./Public'));

// Template Engine
App.set('view engine', 'ejs');
App.set('views', './Resource/Views');

// Express Ejs Layout Configuration
App.use(expressLayouts);
App.set('layout', 'Home/Layout');
App.set('layout extractScripts', true);
App.set('layout extractStyles', true);

// Body Parser Configuration
App.use(bodyParser.json());
App.use(bodyParser.urlencoded({ extended: true }));

// Method Override Configuration
App.use(methodOverride('_Method'));

// Make URL Insensitive
App.set('caseSensitive', false);

// Express Validator Configuration
App.use(validator());

// Express Session Configuration
App.use(session(
{
    secret: process.env.SESSION_SECRET_KEY,
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

// Cookie Parser Configuration
App.use(cookieParser(process.env.COOKIE_SECRET_KE));

// Flash Connect Configuration
App.use(flash());

// Passport Configuration
App.use(passport.initialize());
App.use(passport.session());

// Set Routes
App.use(require('./App/Routes/Api'));
App.use(require('./App/Routes/Web'));

// Create HTTP Server
http.createServer(App).listen(process.env.WEBSITE_PORT, () =>
{
    console.log(`Server Running on Port: ${process.env.WEBSITE_PORT}`);
});