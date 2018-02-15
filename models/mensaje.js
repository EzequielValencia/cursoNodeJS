'use strict'

var mongoose = require('mongosse');
var Schema = mongoose.Schema;


var MensajeSchema = Schema({
	emisor:{type:Schema.ObjectId,ref:'Usuario'},
	text:String,
	fecha_creacion:String,
	reseptor:{type:Schema.ObjectId,ref:'Usuario'}
});

module.exports = mongoose.model('Mensaje',MensajeSchema);