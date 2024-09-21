import { Account } from "aws-sdk";

const userModel = require("./models/userModel");
const userSubscriptionModel = require("./models/invoiceModel");
const paymentCredentialModel = require("./models/paymentCredentialModel");
const { multerMiddleWare, removeFileFromS3 } = require('./lib/AWS-Actions');
const {
  handleError,
  updateReqResp,
  dbQuery,
  customValidator,
} = require("./lib/commonLib");
const axios =require("axios")
export default async function handler(req, res) {
  try {
    
    if (req.method == "POST") {
        checkhook(req, res);
    } 
  } catch (error) {
    handleError(error, "AuthAPI");
  }
}

let checkhook = async (req, res) => {
  try{
  let data =req.body
    if (
      data.event_type == "BILLING.SUBSCRIPTION.SUSPENDED" || data.event_type == "BILLING.SUBSCRIPTION.CANCELLED" || data.event_type=="BILLING.SUBSCRIPTION.EXPIRED"
    ) {
      let d1 = await dbQuery.select({
        collection: userSubscriptionModel,
        where: {
          id: data.resource.id,
        },
        limit: 1,
      });
      
      if (d1) {
        let d2 = await dbQuery.update({
          collection: userModel,
          where: {
            _id: d1.userId,
          },
          data: {
            plan_status: false,
          },
        });
      }
     
      res.status(200).json({
        status: true,
        message: "Plan Stoped",
      });
    } else {
    if (data.event_type=="PAYMENT.SALE.COMPLETED"){
        const billingAgreementId = data.resource.billing_agreement_id;
        let acccount=await dbQuery.select({
          collection: paymentCredentialModel,
          where: {
            type : 'paypal'
          },
          limit : 1
        });
        if(acccount)
        {
        const accessToken = await createToken(acccount.client_id,acccount.secret_key);
         await axios.get(`${process.env.PAYPAL_URL}/v1/billing/subscriptions/${billingAgreementId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+ accessToken, // Replace with your actual API token
          },
        }).then(async(response) => {
          let user1=await dbQuery.select({
            collection: userModel,
            where: {
              subscription :data.resource.billing_agreement_id
            },
            limit : 1
          });
          if(user1)
          {
            let post= {
              id: data.id,
              plan_id: response.data.plan_id,
              type: 'paypal',
              subscription: response.data.id,
              userId : user1._id,
              price : data.resource.amount.total,
            }
            await dbQuery.insert({
              collection: userSubscriptionModel,
              data: post,
            });
            res.status(200).json({ 
              status : true,
              message : "invoice added",
          })
          }else{
            res.status(200).json({ 
              status : true,
              message : "User not found",
          })
          }
             
          }).catch(error => {
            console.error('Error:', error);
          });
      }
    }else{
      res.status(200).json({ 
        status : true,
        message : "",
    })
    }
  }

}
catch(e){
  res.status(200).json({ 
    status : true,
    message : "",
})
}
};




const createToken = async (PAYPAL_CLIENT_ID,PAYPAL_SECRET_KEY) => {
  
  try {
    const response = await axios.post(
      `${process.env.PAYPAL_URL}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(PAYPAL_CLIENT_ID+":"+PAYPAL_SECRET_KEY).toString('base64')}`,
        },
      }
    );

    const accessToken = response.data.access_token;
    return accessToken;
  } catch (error) {
    // Handle errors here
    throw error;
  }
};

const getPaymentDetails=async(paymentId)=> {
  try {
    let acccount=await dbQuery.select({
      collection: paymentCredentialModel,
      where: {
        status : "active",
        type : 'paypal'
      },
      limit : 1
    });
    const accessToken = await createToken('AVYZLEQ82bKTrVzWnx22DqiUwK4R8AKvI9VzeqW-VWE2UtJ-3B_4O7z-zk1irjnOCmlnbR0CI9NJQ7CX','EPhXaS97rDx813m04nR__N1gXn7XESgx0U6MM1mH4auvY_b1pYyu16XhuSo7XzheUVotUWpTUPawN49M');

    const response = await axios.get(
      `${process.env.PAYPAL_URL}/payments/payment/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const paymentDetails = response.data;

    // Extract relevant information
    const invoiceId = paymentDetails.invoice_id;
    const subscriptionId = paymentDetails.subscription_id;
    const planId = paymentDetails.plan_id;
    const planName = paymentDetails.plan_name;
    return {
      invoice_id: invoiceId,
      subscription_id: subscriptionId,
      plan_id: planId,
      plan_name: planName,
      // Add more details as needed
    };
  } catch (error) {
    console.error('Error retrieving payment details from PayPal:', error);
    throw error;
  }
}
