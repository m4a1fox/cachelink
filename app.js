/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes')
    , user = require('./routes/user')
    , http = require('http')
    , path = require('path')
    , EmployeeProvider = require('./user').EmployeeProvider
    , nodemailer = require('nodemailer')
    , url = require('url')
    , bcrypt = require('bcrypt')
    , fs = require('fs');

var app = express();

var SendGrid = require('sendgrid').SendGrid;

var sengGridUserApi = process.env.SENDGRID_USERNAME || "*******";
var sengGridKeyApi = process.env.SENDGRID_PASSWORD || "*********";

var sendgrid = new SendGrid(sengGridUserApi,sengGridKeyApi);

var Validator = require('validator').Validator;
var v = new Validator();
v.error = function (msg) {
//    console.log('Fail');
}


// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

var employeeProvider = new EmployeeProvider();

function AUTHMail(to, subject, text) {
    var payload   = {
        to      : to,
        from    : '*****************',
        subject : subject,
        text    : text
    }

    sendgrid.send(payload);
}

app.get('/user/create', function (req, res) {
    res.render('new_user', {
        title: 'New User'
    });
    res.end();
});

app.post('/', function (req, res) {
    employeeProvider.findByName({
        name: req.param('name'),
        password: req.param('password')
    }, function (error, docs) {
        if (!docs) {
            res.render('index', {error: 'empty'});
            res.end();
        } else {
            res.cookie('rememberme', 'yes', { maxAge: 900000, httpOnly: false});
            res.cookie('_id', docs._id, { maxAge: 900000, httpOnly: false});
            res.redirect('/');
            res.end();
        }
    })
});

app.post('/add-link', function (req, res) {
    employeeProvider.addLinkToDb({
        title: req.param('link'),
        description: '',
        user: req.cookies._id
    }, function (error, docs) {

        res.redirect('/');
        res.end();
    })
});


app.get('/log-out', function (req, res) {
    res.clearCookie('rememberme');
    res.clearCookie('_id');
    res.redirect('/');
    res.end();
});

app.get('/auth/:id', function (req, res) {
    var code = req.params.id;
    employeeProvider.findByAUTHCode(code, function (error, docs) {
        if (!docs) {
            res.redirect('/');
            res.end();
        } else {
            res.cookie('_id', docs._id);
            res.cookie('rememberme', 'yes');
            res.cookie('enter', 1, { maxAge: 1000});
            employeeProvider.updateUserActive(code, function (error, docs) {
                res.redirect('/');
                res.end();
            });
        }
    })

});

app.get('/', function (req, res) {
    var userIsset = req.cookies.rememberme;
    var userActivation = req.cookies.enter;
//    console.log(userActivation);
    if (userIsset == 'yes') {
        employeeProvider.findAllLinks({
            user: req.cookies._id
        }, function (error, emps) {

            for (var i = 0; i < emps.length; i++) {
                emps[i].date = emps[i].date.toDateString();
                if (typeof emps[i].title == 'string') {
                    if (typeof url.parse(emps[i].title).protocol == 'object') {
                        emps[i].link = 'http://' + emps[i].title;
                    } else {
                        emps[i].link = emps[i].title;
                    }
                }
            }
            res.render('index', {userIsset: userIsset, links: emps, userActivation: userActivation});
            res.end();
        });
    } else {
        res.render('index', {userIsset: userIsset});
        res.end();
    }
});

app.get('/technology', function (req, res) {
    res.render('technology');
    res.end();
});

app.get('/registration', function (req, res) {

    if (req.cookies._id) {
        res.redirect('/');
        res.end();
    }
    res.render('registration', {page: 'register'});
    res.end();
});

app.post('/registration', function (req, res) {

    var name = req.param('name').trim(),
        pass = req.param('password').trim(),
        code = bcrypt.genSaltSync(10).replace('/', '!').replace('.', '@'),
        protocol = req.protocol,
        host = req.host;

    var AUTHLink = protocol + '://' + host + ':8080/auth/' + code;

    var emailText = 'Click on the link to confirm authorization. \n\r' + AUTHLink + '\n';

    if (pass.length != 0 && name.length != 0) {
        if (v.check(name).isEmail()) {
            employeeProvider.findByEmail(req.param('name'), function (error, docs) {
                if (!realValue(docs)) {
                    AUTHMail(name, 'Confirmation of Authorization', emailText);

                    fs.appendFile('tmp/mail.txt', emailText, function (err) {
                        if (err) throw err;
//                        console.log('It\'s saved!');
                    });

                    employeeProvider.saveUser({
                        name: name,
                        pass: pass,
                        code: code
                    }, function (error, docs) {
                        res.render('registration', {page: 'register', registration: 'success'});
                        res.end();
                    });
                } else {
                    res.render('registration', {page: 'register', error: 'exist'});
                    res.end();
                }
            });
        } else {
            res.render('registration', {page: 'register', error: 'wrong_email'});
            res.end();
        }


    } else {
        res.render('registration', {page: 'register', error: 'empty'});
        res.end();
    }
});


function realValue(obj) {
    return obj && obj !== "null" && obj !== "undefined";
}

http.createServer(app).listen(app.get('port'), function () {
//    console.log('Express server listening on port ' + app.get('port'));
});
