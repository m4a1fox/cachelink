var mongoose = require('mongoose');
var mongoSkin = require('mongoskin');
var mongoSkinConnetion = mongoSkin.db('*************************************************');
mongoose.connect('****************************************');

var conn = mongoose.connection;


function encryptPassword(pass) {
    var crypto = require('crypto')
        , key = '!<>!*&#'
        , plaintext = pass
        , cipher = crypto.createCipher('aes-256-cbc', key);

    cipher.update(plaintext, 'utf8', 'base64');
    return cipher.final('base64');
}


EmployeeProvider = function () {};

EmployeeProvider.prototype.findAllLinks = function (user, callback) {
    mongoSkinConnetion.collection('links').find().toArray(function (error, result) {
        if (error) {
            callback(error);
        } else {
            callback(null, result);
        }
    });
};

//find an user by AUTH code
EmployeeProvider.prototype.findByAUTHCode = function (code, callback) {
    conn.collection('user').findOne({code: code}, function (error, result) {
        if (error) {
            callback(error);
        } else {
            callback(null, result);
        }
    });
};


EmployeeProvider.prototype.updateUserActive = function (code, callback) {
    conn.collection('user').update({code: code}, {$set: {'active': 1}}, function (error, result) {
        if (error) {
            callback(error);
        } else {
            callback(null, result);
        }
    });
};

//find an employee by ID
EmployeeProvider.prototype.findByName = function (param, callback) {
    conn.collection('user').findOne({name: param.name, pass: encryptPassword(param.password), active: 1}, function (error, result) {
        if (error) {
            callback(error);
        } else {
            callback(null, result);
        }
    });
};

EmployeeProvider.prototype.findByEmail = function (email, callback) {

    conn.collection('user').findOne({name: email}, function (error, result) {
        if (error) {
            callback(error);
        } else {
            callback(null, result);
        }
    });
}


//save new user
EmployeeProvider.prototype.saveUser = function (users, callback) {

    if (typeof(users.length) == "undefined")
        users = [users];

    for (var i = 0; i < users.length; i++) {
        employee = users[i];
        employee.created_at = new Date();
        employee.pass = encryptPassword(users[i].pass);
        employee.active = 0;
    }

    console.log(users);

    conn.collection('user').insert(users, function (err, insert) {
        callback(null, insert);
    });


};

EmployeeProvider.prototype.addLinkToDb = function (links, callback) {

    if (typeof(links.length) == "undefined")
        links = [links];
    for (var i = 0; i < links.length; i++) {
        link = links[i];
        link.date = new Date();
    }

    conn.collection('links').insert(links, function (err, links) {
        callback(null, links);
    });
};

exports.EmployeeProvider = EmployeeProvider;
