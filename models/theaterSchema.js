//global variables
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://176.32.90.191/dreampass');
var Schema = mongoose.Schema;

//create schema
var TheaterSchema = new Schema({
  name:String,
  code:String,
  email:String,
  address:String,
  person:[{name:String,email:String,tel:String}],
  location:{latitude:String,longitude:String},
  access:String,
  bhour:String,
  dayoff:String,
  url:String,
  bank:{name:String,account:String},
  file:{_id:String,path:String,size:Number}
});

//create model
mongoose.model('Theater',TheaterSchema);

//export module
module.exports = db.model('Theater');