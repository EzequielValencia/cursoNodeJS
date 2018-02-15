'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = Schema({
	nombre:String,
	apelldios:String,
	nick:String,
	email:String,
	password:String,
	avatar:String
});

module.exports = mongoose.model('Usuario',UserSchema);