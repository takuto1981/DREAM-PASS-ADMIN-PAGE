//global variables
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://176.32.90.191/dreampass');
var Schema = mongoose.Schema;

//create schema
var ShiftSchema = new Schema({
  company:String,
  date:{start:Date,end:Date},
  price:Number,
  capacity:Number,
  agreement:[String],
});

//create model
mongoose.model('Shift',ShiftSchema);

//export module
module.exports = db.model('Shift');