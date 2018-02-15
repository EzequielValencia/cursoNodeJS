'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SeguidorSchema = Schema({
    seguidor:{type:Schema.ObjectId,ref:'Usuario'},
    seguido:{type:Schema.ObjectId,ref:'Usuario'}
});

module.exports = mongoose.model('Seguidor',SeguidorSchema);