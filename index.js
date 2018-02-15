'use strict';

var mongoose = require('mongoose');
var app = require('./app');
var http;
var port=3800;
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/redsocial',(err,db)=>{
    if(err){
        console.log(err);
    }else{
        console.log("Connection complete ");
        app.listen(port, () => {
          console.log('Example app listening on port http://localhost:3800');
        });
    }
});