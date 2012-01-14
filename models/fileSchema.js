//global variables
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://176.32.90.191/dreampass');
var Schema = mongoose.Schema;

//create schema
var FileSchema = new Schema({
  icon:{
    size:Number,
    path:String,
    name:String,
    type:String,
    lastModifiedDate:Date,
  }
});

//create model
mongoose.model('File',FileSchema);

//export module
module.exports = db.model('File');