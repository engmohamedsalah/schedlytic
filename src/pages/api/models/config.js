const  process  = require('../../../../next.config');
const mongo = require('mongoose'); 

try { 
  mongo.connect(process.env.DB_URL , {
    useUnifiedTopology : true,
    useNewUrlParser: true
});
} catch (error) {
  throw new Error("Connection failed!");
}