import userModel from "./models/userModel";
const categoryModel = require("./models/categoryModel");
const userSubscriptionModel = require("./models/invoiceModel");
const invoiceModel = require("./models/invoiceModel");
const paymentCredentialModel = require("./models/paymentCredentialModel");
const { multerMiddleWare, removeFileFromS3 } = require('./lib/AWS-Actions');
const {
  handleError,
  updateReqResp,
  dbQuery,
  customValidator,
} = require("./lib/commonLib");

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
  const event = req.body;
  switch (event.type) {
    case 'customer.subscription.updated':
      const paymentIntent = event.data.object;
      paymentUpdate(paymentIntent,res);
      break;
    case 'customer.subscription.deleted':
      const paymentMethod = event.data.object;
      cancelpayment(paymentMethod,res);
      break;
    case "invoice.payment_succeeded" :
        const paymentMethod1 = event.data;
        setTimeout(() => {
          createInvoice(paymentMethod1,res)
        }, 5000);
        break; 
    
    default:
      res.status(200).json({ 
        status : true,
        message : "condition not match",
    })
  }
  }catch(e){
    res.status(200).json({ 
      status : true,
      message : "something went wrong",
  })
  }
};

const paymentUpdate =async(data,res)=>{
  let d2={...data}
  let status = d2.pause_collection?.behavior=="keep_as_draft" ? true : false
  let d1 = await dbQuery.select({
    collection: userSubscriptionModel,
    where: {
      subscription: d2.id,
    },
    limit: 1,
  });

  if (d1) {
    let d2 = await dbQuery.update({
      collection: userModel,
      where: {
        subscription: status,
      },
      data: {
        plan_status: false,
      },
    });
  }
  res.status(200).json({ 
    status : true,
    message : "payment updated",
})

}


const cancelpayment =async(data,res)=>{
  let d2={...data}
  let status =false
  let d1 = await dbQuery.select({
    collection: userSubscriptionModel,
    where: {
      subscription: d2.id,
    },
    limit: 1,
  });

  if (d1) {
    let d2 = await dbQuery.update({
      collection: userModel,
      where: {
        subscription: status,
      },
      data: {
        plan_status: false,
      },
    });
  }
  res.status(200).json({ 
    status : true,
    message : "payment updated",
})
}

const createInvoice=async(data,res)=>{
  let d2={...data}
  let data1 =d2.object
  let account=await dbQuery.select({
    collection: paymentCredentialModel,
    where: {
      type : "stripe"
    },
    limit : 1
  });
  if(account)
  {
    let user=await dbQuery.select({
      collection: userModel,
      where: {
        email : data1.customer_email
      },
      limit : 1
    });
    if(user)
    {
      let post ={
        userId : user._id,
        id:data1.id,
        customerId: data1.customer,
        type : "stripe",
        email : data1.customer_email,
        subscription :data1.subscription,
       }
       const stripe = require('stripe')(account.secret_key);
       const invoice = await stripe.invoices.retrieve(post.id);
       const subscriptionItem = invoice.lines.data[0].subscription_item;
       const subscription = await stripe.subscriptionItems.retrieve(subscriptionItem);
       const plan = subscription.plan;
       post.plan_id=plan.id
       post.product_id=plan.product
       post.price=(+data1.amount_paid)/100
       await dbQuery.insert({
        collection: invoiceModel,
        data: post,
      });
      res.status(200).json({ 
        status : true,
        message : "invoice added",
    })
    }else{
      res.status(200).json({ 
        status : true,
        message : "user not found ",
    })
    }

  }else{
    res.status(401).json({ 
      status : true,
      message : "not found account details",
  })
  }
}