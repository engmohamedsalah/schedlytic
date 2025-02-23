import paymentCredentialModel from "./models/paymentCredentialModel";
import planModel from "./models/planModel";
const Razorpay = require('razorpay');

const userModel = require("./models/userModel");
const invoiceModel = require("./models/invoiceModel");
const bcrypt = require("bcryptjs")
const {
    handleError,
    dbQuery,
    customValidator

}=  require("./lib/commonLib");

const mongoose = require("mongoose");

  export default async function handler(req,res){
    try {
        if (req.method === "PATCH") {
            if (req.body.action === "upadatess") {
                updateds(req, res);
            }
          }
        
    } catch (error) {
        // handleError(error, "AuthAPI");
    }
  }    




const updateds= async(req,res)=>{
    const {planId,subscription}=req.body;
    console.log('req.body',req.body)
    try{
        let account = await dbQuery.select({
            collection: paymentCredentialModel,
            where: {
              type: "razorpay"
            },
            limit: 1
          });
          
      console.log({account},"1st call");
      if (!account || !account.client_id || !account.secret_key) {
      return  res.status(400).json({status:false,message: "Both key_id and key_secret are required"});
        
      }
     
      const planss = await dbQuery.select({
        collection:planModel,
        where:{id:planId},
        limit:1
      })
      console.log({planss},"2nd call");
  
      let instance = new Razorpay({
        key_id: account.client_id,
        key_secret: account.secret_key
      });
  
      const Details = await instance.subscriptions.fetch(subscription);
      console.log('Details',Details);
      if(Details.status !== "active" || Details.status !=="authenticated"){
        return res.status(400).json({status:false,message:"Can't update subscription when subscription is not in Authenticated or Active state"})
      }
      const subsd= {
        'plan_id':planId,
        'quantity':1,
      }
      console.log({subsd},"3rd")
      const subscriptions = await instance.subscriptions.update(subscription,subsd);
      if(subscriptions){
        await dbQuery.insert({
          collection:userModel,
          data:{
            subscriptions:subscription,
            subscriptionsStatus : "active",
            planId:planId
          }
        })
        console.log({subscriptions},"4th call");
        return res.status(200).json({status:true,message:"Okkk",subscriptions})
      }
  
    }catch(error){
        console.log(error);
      return res.status(500).json({status:false,message:"Internal server error"})
  
    }
  
  
  }