//global variables
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://176.32.90.191/dreampass');
var Schema = mongoose.Schema;

//create schema
var DistributorSchema = new Schema({
  name:String,
  code:String,
  email:String,
  person:{name:String,email:String,tel:String},
  bank:{name:String,account:String}
});

//create model
mongoose.model('Distributor',DistributorSchema);

//export module
module.exports = db.model('Distributor');