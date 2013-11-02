/**
* This source file is subject to the MIT license that is bundled
* with this source code in the file LICENSE.
*/

/**
* @author Maxim Bogdanov <sin666m4a1fox@gmail.com>
*/
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

LinksProvider = function (host, port) {
    this.db = new Db('node-link-cache', new Server(host, port, {safe: false}, {auto_reconnect: true}, {}), {w: 1});
    this.db.open(function () {
    });
};


LinksProvider.prototype.getCollection = function (callback) {
    this.db.collection('links', function (error, links_collection) {
        if (error) callback(error);
        else callback(null, links_collection);
    });
};

//find an employee by ID
LinksProvider.prototype.findByName = function(param, callback) {

    this.getCollection(function(error, links_collection) {


        if( error ){

            callback(error)
        } else {

            links_collection.findOne({}, function(error, result) {

                if( error ){
                    callback(error);
                }
                else {
                    callback(null, result);
                }
            });
        }
    });
};



////find all employees
//LinksProvider.prototype.findAll = function (callback) {
//    this.getCollection(function (error, links_collection) {
//        if (error) {
//            callback(error);
//        } else {
//            links_collection.find().toArray(function (error, results) {
//                if (error){
//                    callback(error);
//                } else {
//                    callback(null, results);
//                }
//            });
//        }
//    });
//};

////find an employee by ID
//LinksProvider.prototype.findByName = function (param, callback) {
//
//    this.getCollection(function (error, user_collection) {
//        if (error) {
//            callback(error)
//        } else {
//            user_collection.findOne({name: param.name, pass: param.password}, function (error, result) {
//                if (error) {
//                    callback(error);
//                } else {
//                    callback(null, result);
//                }
//            });
//        }
//    });
//};
//
//
////save new employee
//LinksProvider.prototype.save = function (employees, callback) {
//    this.getCollection(function (error, user_collection) {
//        if (error) callback(error)
//        else {
//            if (typeof(employees.length) == "undefined")
//                employees = [employees];
//
//            for (var i = 0; i < employees.length; i++) {
//                employee = employees[i];
//                employee.created_at = new Date();
//            }
//
//            user_collection.insert(employees, function () {
//                callback(null, employees);
//            });
//        }
//    });
//};
//
//// update an employee
//LinksProvider.prototype.update = function (employeeId, employees, callback) {
//    this.getCollection(function (error, user_collection) {
//        if (error) callback(error);
//        else {
//            user_collection.update(
//                {_id: user_collection.db.bson_serializer.ObjectID.createFromHexString(employeeId)},
//                employees,
//                function (error, employees) {
//                    if (error) callback(error);
//                    else callback(null, employees)
//                });
//        }
//    });
//};
//
////delete employee
//LinksProvider.prototype.delete = function (employeeId, callback) {
//    this.getCollection(function (error, user_collection) {
//        if (error) callback(error);
//        else {
//            user_collection.remove(
//                {_id: user_collection.db.bson_serializer.ObjectID.createFromHexString(employeeId)},
//                function (error, employee) {
//                    if (error) callback(error);
//                    else callback(null, employee)
//                });
//        }
//    });
//};

exports.LinksProvider = LinksProvider;
