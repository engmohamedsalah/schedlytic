const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var mySchema = new mongoose.Schema({
	userId: { type: Schema.Types.ObjectId, ref: "users" },
    id : { type: String},
    plan_name :  { type: String},
    product_id : { type: String},
    orderId : { type: String},
    plan_id : {type : String},
    plan_name : {type : String},
    createDate : {type : Date , default : Date.now()},
    type : {type : String},
    customerId : {type : String},
    email : {type : String},
    subscription:{type : String},
    price : {type : String}
});
module.exports = mongoose.models['user_invoice'] || mongoose.model('user_invoice',mySchema)