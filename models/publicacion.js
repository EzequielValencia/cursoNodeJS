'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PublicacionSchema = Schema({
	user:{type:Schema.ObjectId,ref:'Usuario'},
	texto:String,
	archivo:String,
	fecha_creacion:String,

});


module.exports = mongoose.model('Publicacion',PublicacionSchema);