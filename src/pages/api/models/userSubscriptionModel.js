const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var mySchema = new mongoose.Schema({
	userId: { type: Schema.Types.ObjectId, ref: "users" },
    id : { type: String},
    links : {type : Array},
    product_id : { type: String},
    status : { type: String},
    plan_id : {type : String}
});
module.exports = mongoose.models['user_subscription'] || mongoose.model('user_subscription',mySchema)