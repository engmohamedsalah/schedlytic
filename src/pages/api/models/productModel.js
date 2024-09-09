const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var mySchema = new mongoose.Schema({
    id : { type: String},
    name :  { type: String},
    description : {type : String},
    type : {type : String}
});
module.exports = mongoose.models['product'] || mongoose.model('product',mySchema)