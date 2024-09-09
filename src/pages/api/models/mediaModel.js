const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var mySchema = new mongoose.Schema({
	userId: { type: Schema.Types.ObjectId, ref: "users" },
    title :{ type: String},
    tag :{ type: String},
    path :{ type: String},
    type :{ type: String},
    elementType :{ type: String },
    thumb :{ type: String}, 
    status :{ type: Number, default: 1}, 
    isAssets :{ type: Number}, 
    source : {type : String}, 
    sourceId : {type : String},
    meta : {type : Object},
    isCreated :{type: Date, default: Date.now},
    isUpdated :{type: Date, default: Date.now},
    categoryId : { type: Schema.Types.ObjectId, ref: "category",require : true },
    templateId : { type: Schema.Types.ObjectId, ref: "templates" },
});
module.exports = mongoose.models['media'] || mongoose.model('media',mySchema)