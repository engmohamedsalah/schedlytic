const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var mySchema = new mongoose.Schema({
    title  :{ type: String},
    text : { type: String},
    url :{ type: String},
    scheduleDate  :{ type: Date},
    status : {type : String ,default : "initialize"},
    userId: { type: Schema.Types.ObjectId, ref: "users" },
    intregrations : {type : Object},
    socialMediaAccounts :  {type : Schema.Types.Array},
    timeZone :{ type: Object },
    postDate : { type: Date},
    type  :{ type: String},
    thumb  :{ type: String},
    message : {type : String},
    posttype: {type : String},
}); 
module.exports = mongoose.models['posts'] || mongoose.model('posts',mySchema)