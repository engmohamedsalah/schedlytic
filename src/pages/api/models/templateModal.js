const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var mySchema = new mongoose.Schema({
    title  :{ type: String},
    userId: { type: Schema.Types.ObjectId, ref: "users" },
    type : {type : String},
    tags : { type: String},
    data : {type : Object},
    layout : {type  : String},
    dimenstions : {type  : Object},
    filter : {type  : Object },
    url: { type: String},
    status : {type : Number ,default : 0},
    publish : {type : Number ,default : 0},
    bgColor :  {type  : String},
}); 
module.exports = mongoose.models['templates'] || mongoose.model('templates',mySchema)