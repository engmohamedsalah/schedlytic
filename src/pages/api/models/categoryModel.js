const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var mySchema = new mongoose.Schema({
    name:{ type: String},
    type : { type: String ,default : "icons"},
    status : { type: Number ,default : 0},
    
}); 
module.exports = mongoose.models['category'] || mongoose.model('category',mySchema)