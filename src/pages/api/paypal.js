import { Account } from "aws-sdk";
import bcrypt from "bcryptjs";
const planModel = require("./models/planModel");
const userModel = require("./models/userModel");
const invoiceModel = require("./models/invoiceModel");
const productModel = require("./models/productModel");
const paymentCredentialModel = require("./models/paymentCredentialModel");
const { sendMail} = require("./lib/commonLib");
const {
  handleError,
  dbQuery,
  customValidator,
} = require("./lib/commonLib");
const axios = require('axios');
const serviceModel = require("./models/serviceModel");

export default async function handler(req, res) {
  try {
    if (req.method == "POST") {
         if(req.body.action=="createOrder"){
          createOrder(req,res)
         }else if(req.body.action=="Subscribe"){
          createBillingSubscription(req,res)
         }else {
          createPlan(req,res)
         }
    } else if (req.method == "PUT") {
    } else if (req.method == "GET") {
     
    } else if (req.method == "DELETE") {
          deletePlan(req,res)
    }
  } catch (error) {
    handleError(error, "AuthAPI");
  }
}

let createPlan = (req, res) => {
  customValidator(
    {
      data: req.body,
      keys: {
        
      },
    },
    req,
    res,
    async ({ authData } = validateResp) => {
      try{
      let data =req.body
      data.userId=authData.id
      let d1=await dbQuery.select({
        collection: planModel,
        where: {
          name : data.name
        },
      });
      
      if(d1.length>0)
      {
        res.status(401).json({
          status: false,
          message: "Plan already exists",
        });
        return 
      }
      
      let acccount=await dbQuery.select({
        collection: paymentCredentialModel,
        where: {
          status : "active",
          type : 'paypal'
        },
        limit : 1
      });
      if(acccount)
      {
        const token = await createToken(acccount.client_id,acccount.secret_key);
        let product=await dbQuery.select({
          collection: productModel,
          where: {type : "paypal"},
          limit : 1
        });
        let productId
        if(product &&  Object.keys(product).length>0){
          productId=product.id
        }else{
          productId = await createProduct(token,data);
        }
        let plandata = await createBillingPlan(productId,token,data);
        let hook= await createWebhook(token)
         plandata ={
          ...plandata,
          ...data,
          type : "paypal"
        }
        let d2=await dbQuery.insert({
          collection: planModel,
          data: plandata,
        });
        if(d2){
          res.status(200).json({
            status: true,
            message: "Plan Created Sucessfully. ",
          });
        }
      } else {
        res.status(401).json({
          status: true,
          message: "Active Payment Account. ",
        });
      }
      
    }catch(e){
      res.status(401).json({
        status: false,
        message: "Something went wrong. ",
      });
    }
});
};


const createBillingPlan = async (productId, token,data) => {
  try {
    let feq=[]
    if(data.trial_period!=0)
    {
      feq.push(  {
        frequency: {
          interval_unit: "Day",
          interval_count: data.trial_period,
        },
        tenure_type: 'TRIAL',
        sequence: 1,
        total_cycles: 1,
        
      })
    }
    if( data.time_period){
      feq.push(  {
        frequency: {
          interval_unit: data.time_period,
          interval_count: 1,
        },
        tenure_type: 'REGULAR',
        sequence: feq.length + 1,
        total_cycles: 12,
        pricing_scheme: {
          fixed_price: {
            value: data.price,
            currency_code: 'USD',
          },
        },
      })
    }
    const response = await axios.post(
      `${process.env.PAYPAL_URL}/v1/billing/plans`,
      {
        product_id: productId,
        name: data.name,
        description: data.description,
        status: 'ACTIVE',
        billing_cycles:feq,
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee: {
            currency_code: 'USD',
            value: '0',
          },
          setup_fee_failure_action: 'CONTINUE',
          payment_failure_threshold: 3,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
  
    const planData = response.data;
    return planData;
  } catch (error) {
    throw error;
  }
};


const createProduct = async (token,data) => {
  try {
    const response = await axios.post(
      `${process.env.PAYPAL_URL}/v1/catalogs/products`,
      {
        name: data.name,
        description: data.description,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    let d2=await dbQuery.insert({
      collection: productModel,
      data:{
        id : response.data.id,
        name :  data.name,
        description :data.description,
        type : "paypal"
    }
    });

  return response.data.id;

    
  } catch (error) {
    throw error;
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

let createOrder= async (req,res) => {
  customValidator(
    {
      data: req.body,
      keys: {
        
      },
    },
    req,
    res,
    async ({ authData } = validateResp) => {
    try{
    let {amount} =req.body  
    const response = await axios.post(
      `${process.env.PAYPAL_URL}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: amount,
            },
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(process.env.PAYPAL_CLIENT_ID+":"+process.env.PAYPAL_SECRET_KEY).toString('base64')}`,
        },
      }
    );

    res.status(200).json({ 
      orderId: response.data.id ,
      status: true,
      message: "",
    });
  } catch (error) {
    // Handle errors here
    throw error;
  }
})
};




const createBillingSubscription = async (req, res) => {
  try {
    let { price, planId, name, email, password, lastname ,id,orderId} = req.body;
    let invdata = {
        id : id,
        orderId:orderId,
        plan_id: planId,
    };
    let data = await dbQuery.select({
      collection: userModel,
      where: { email: email },
    });

    if (data.length > 0) {
      let d1 = await dbQuery.update({
        collection: userModel,
        where: { _id: data[0]._id },
        data: {
          planId: planId,
          plan_status: true,
          subscription : id,
          paymenttype : "paypal"
        },
        limit: 1,
      });
      let plandata = await dbQuery.select({
        collection: planModel,
        where: { id: planId },
        limit : 1,
      });
      if(plandata.trial_period!=0)
      {
        invdata.userId = data[0]._id;
        invdata.subscription =id;
        invdata.price=0
        invdata.type = "paypal"
        await dbQuery.insert({
          collection: invoiceModel,
          data: invdata,
        });
      }
    } else {
      let pas = await bcrypt.hash(password, 5);
      let insData = {
        name,
        email: email.toLowerCase(),
        password: pas,
        status: 1,
        source: "Manually",
        planId: planId,
        lastname : lastname,
        subscription : id,
        paymenttype : "paypal"
      };

      let data11 = await dbQuery.insert({
        collection: userModel,
        data: insData,
      });
      let plandata = await dbQuery.select({
        collection: planModel,
        where: { id: planId },
        limit : 1,
      });

      if(plandata.trial_period!=0)
      {
        invdata.userId = data11._id;
        invdata.subscription =id;
        invdata.price=0
        invdata.type = "paypal"
        await dbQuery.insert({
          collection: invoiceModel,
          data: invdata,
        });
      }

      let html=`<div style="max-width: 600px ;
      padding:25px;background-color: #f6f6ff;
      border-radius: 30px; 
      margin: 0 auto;
      border-radius: 10px; 
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); 
      font-size: 15px;
      line-height: 25px;
      color: #29325f;
      font-weight: 400;">
          <div style="text-align: center;">
              <h3 style="margin-top: 5px; color: #29325f;">${process.env.SITE_TITLE}</h3>
          </div>
          <p> Hi <span style="color: ff776b;"><b> ${name} ${lastname},</b></span>  <br />
      
      
              Welcome to ${process.env.SITE_TITLE}. Your account is created by ${process.env.SITE_TITLE}, <br/> You can login to your account using following details:<br/><br/>
      
               <b>Login URL: </b> ${process.env.LIVE_URL} <br/>
      
               <b>Email : </b>${email.toLowerCase()} <br/>
              
               <b>Password :</b>  ${password}<br />
      
          </p>
          <div style="background:#ffffff ; padding: 15px 20px; border-radius: 20px;font-size: 14px;
          line-height: 25px;
          color: #8386a5;
          font-weight: 400;"><span> Thank you for being a loyal customer : <b>The ${process.env.SITE_TITLE} Team</b></span></div>
      </div>`
      let mailData={
        from : process.env.MANDRILL_EMAIL,
        to :  email.toLowerCase(),
        subject : "Welcome",
        htmlbody : html
     };

     let data1 =await dbQuery.select({
        collection : serviceModel,
        where : {type : "smtp"},
        limit : 1,
    })
    if(data1){
        let d1= {
            to :  email.toLowerCase(),
            subject : "Welcome",
            ...data1.data, 
            htmlbody : html
        }
        await sendMail(d1)
    }else{
        await sendMail(mailData,"service")
    }
    }

    res.status(200).json({
      status: true,
      message: "Plan Created Sucessfuly",
    });
  } catch (error) {
    res.status(200).json({
      status: true,
      message: "",
    });
  }
};


const createWebhook = async (accessToken) => {

  try {

    
    const response = await axios.post(
      `${process.env.PAYPAL_URL}/v1/notifications/webhooks`,
      {
        url: `${process.env.LIVE_URL}/api/paypal-webhook`,
        event_types: [
          {
            name: 'BILLING.PLAN.DEACTIVATED',
          },
          {
            name: 'BILLING.SUBSCRIPTION.EXPIRED',
          },
          {
            name: 'BILLING.SUBSCRIPTION.CANCELLED',
          },
          {
            name: 'BILLING.SUBSCRIPTION.SUSPENDED',
          },
          {
            name: 'PAYMENT.SALE.COMPLETED',
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

   
  } catch (error) {

  }
};


