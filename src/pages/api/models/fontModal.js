const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var mySchema = new mongoose.Schema({
    family :{ type: String},
    category :{ type: String},
    files :{ type: Object}
})
module.exports = mongoose.models['fonts'] || mongoose.model('fonts',mySchema)

