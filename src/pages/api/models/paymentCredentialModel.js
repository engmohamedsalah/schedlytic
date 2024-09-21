const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var mySchema = new mongoose.Schema({
	userId: { type: Schema.Types.ObjectId, ref: "users" },
    type : {type : String},
    client_id : {type : String},
    secret_key : {type : String},
    status : {type : String , default : "inactive"},
    email : {type : String},
});
module.exports = mongoose.models['payment_credentials'] || mongoose.model('payment_credentials',mySchema)