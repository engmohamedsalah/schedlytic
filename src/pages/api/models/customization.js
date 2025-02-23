
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customizationSchema = new mongoose.Schema({
  siteTitle: {
    type: String,
    default: 'PixaSocial'
  },

  logo: { 
    type: String,
    default: '/assets/images/Logo.png' 
    },

  primaryColor: {
    type: String, 
    default: ''
   },

  secondaryColor: {
    type: String, 
    default: '' 
  },

  bodyColor: {
    type: String,
     default: '' 
    },

  primaryLightColor:{ 
    type: String,
     default: '' 
    },

  paragraphColor: { 
    type: String,
     default: ''
     },

  headingColor: {
    type: String,
     default: '' 
    },

    favIcon:{
      type:String,
      default:''
    },
   
});
module.exports = mongoose.models['Customization'] || mongoose.model('Customization',customizationSchema)

