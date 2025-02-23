const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var mySchema = new mongoose.Schema({
    name : { type: String},
    data : {type : Object},
});
module.exports = mongoose.models['webhook_list'] || mongoose.model('webhook_list',mySchema)