//global variables
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://176.32.90.191/dreampass');
var Schema = mongoose.Schema;

//create schema
var OptionSchema = new Schema({
  name:String,
  comment:String,
  info:{_id:String,path:String,size:Number}
});

//create model
mongoose.model('Option',OptionSchema);

//export module
module.exports = db.model('Option');