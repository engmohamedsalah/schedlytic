const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var mySchema = new mongoose.Schema({
    data : {type : Object},
    type : {type : String},
});
module.exports = mongoose.models['services'] || mongoose.model('services',mySchema)