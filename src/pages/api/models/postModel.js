const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const postSchema = new mongoose.Schema({
    title: { type: String },
    caption: { type: String },
    text: { type: String },
    url: { type: String },
    scheduleDate: { type: Date },
    status: { type: String, default: 'initialize' },
    userId: { type: Schema.Types.ObjectId, ref: 'users' },
    integrations: { type: Object },
    socialMediaAccounts: { type: Array },
    timeZone: { type: Object },
    postDate: { type: Date },
    type: { type: String },
    thumb: { type: String },
    message: { type: String },
    posttype: { type: String },
});

module.exports = mongoose.models.Post || mongoose.model('Post', postSchema);
