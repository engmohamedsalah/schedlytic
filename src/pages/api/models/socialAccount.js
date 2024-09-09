const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var mySchema = new mongoose.Schema({
    type  :{ type: String},
    userId: { type: Schema.Types.ObjectId, ref: "users" },
    data : {type : Object},
}); 
module.exports = mongoose.models['social_accounts'] || mongoose.model('social_accounts',mySchema)