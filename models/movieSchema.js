//global variables
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://176.32.90.191/dreampass');
var Schema = mongoose.Schema;

//create schema
var MovieSchema = new Schema({
  company:String,
  title:String,
  infomation:String,
  price:Number,
  agreement:String,
  title_image:{_id:String,path:String,size:Number},
  trailer:{_id:String,path:String,size:Number}
});

//create model
mongoose.model('Movie',MovieSchema);

//export module
module.exports = db.model('Movie');