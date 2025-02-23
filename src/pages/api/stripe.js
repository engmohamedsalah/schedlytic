
import { Account } from "aws-sdk";
import bcrypt from "bcryptjs";
import userSubscriptionModel from "./models/userSubscriptionModel";
const planModel = require("./models/planModel");
const userModel = require("./models/userModel");
const invoiceModel = require("./models/invoiceModel");
const productModel = require("./models/productModel");
const paymentCredentialModel = require("./models/paymentCredentialModel");
const serviceModel = require("./models/serviceModel");
const { sendMail } = require("./lib/commonLib");
const {
  handleError,
  dbQuery,
  customValidator,
} = require("./lib/commonLib");
const axios = require('axios');

export default async function handler(req, res) {
  try {
    if (req.method == "POST") {
      if (req.body.action == "createPlan") {
        createPlan(req, res)
      } else {
        purchasePlan(req, res)
      }
    } if (req.method == "PUT") {

      updateUser(req, res)

    }
    else if (req.method == "GET") {
      getdata(req, res)
    } else if (req.method == "DELETE") {

    }
  } catch (error) {
    handleError(error, "AuthAPI");
  }
}

const createPlan = async (req, res) => {
  try {
    const {
      name,
      time_period,
      price,
      description,
      trial_period,
      ai_text_generate,
      ai_image_generate,
      post_per_month,
      editor_access,
      post_type,
      socialIntregation } = req.body

    let data = {
      name: name,
      description: description,
      time_period: time_period,
      price: price,
      trial_period: trial_period,
      ai_text_generate: ai_text_generate,
      ai_image_generate: ai_image_generate,
      post_per_month: post_per_month,
      editor_access: editor_access,
      socialIntregation: socialIntregation,
      post_type: post_type,
      type: "stripe"
    }
    let account = await dbQuery.select({
      collection: paymentCredentialModel,
      where: {
        type: "stripe"
      },
      limit: 1
    });
    const stripe = require('stripe')(account.secret_key);
    let insData = {
      name: data.name,
      description: data.description
    }
    let product = await dbQuery.select({
      collection: productModel,
      where: { type: "stripe" },
      limit: 1
    });
    let productId
    if (product && Object.keys(product).length > 0) {
      productId = product.id
    } else {
      productId = await createProduct(stripe, data);
    }
    data.product_id = productId;

    let plan = await createPlanbyProduct(stripe, data)
    data.id = plan.id
    data.object = plan
    let webhook = await getwebhook(stripe)
    let url = process.env.LIVE_URL + "/api/stripe-webhook"
    let list = webhook.data.filter((d1) => d1.url == url)

    if (list.length == 0) {
      const webhookEndpoint = await stripe.webhookEndpoints.create({
        enabled_events: ["*"],
        url: process.env.LIVE_URL + "/api/stripe-webhook",
      });
    }
    let d2 = await dbQuery.insert({
      collection: planModel,
      data: data,
    });
    if (d2) {
      console.log('d2', d2)
      return res.status(200).json({
        status: true,
        message: "Plan created sucessfully. ", data
      });

    }
  } catch (e) {
    res.status(200).json({
      status: false,
      message: "Something went wrong. ",
    });
  }
}

const createProduct = async (stripe, data) => {
  try {
    const product = await stripe.products.create({
      name: data.name,
      description: data.description
    });
    return product.id
  }
  catch (e) {
    throw e
  }
}

const createPlanbyProduct = async (stripe, data) => {
  try {
    const plan = await stripe.plans.create({
      amount: parseInt(data.price * 100),
      currency: 'usd',
      interval: data.time_period.toLowerCase(),
      product: data.product_id,
      trial_period_days: parseInt(data.trial_period),
    });

    return plan
  } catch (e) {
    throw e
  }
}

const getwebhook = async (stripe) => {
  try {
    const webhookEndpoints = await stripe.webhookEndpoints.list({
      limit: 1,
    });
    return webhookEndpoints
  } catch (e) {
    throw e
  }
}


const purchasePlan = async (req, res) => {
  try {
    let account = await dbQuery.select({
      collection: paymentCredentialModel,
      where: {
        type: "stripe"
      },
      limit: 1
    });
    const stripe = require('stripe')(account.secret_key);

    const { priceId, name, email, password, lastname, trial_period } = req.body;
    console.log("body", req.body, priceId)
    const customer = await stripe.customers.create({
      name: name,
      email: email,
    });
    console.log({ customer })
    let ds = {
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        "name": name, "email": email, "password": password, "lastname": lastname, planId: priceId,
      },
      mode: 'subscription',
      subscription_data: {
        trial_settings: {
          end_behavior: {
            missing_payment_method: 'cancel',
          },
        },
      },

      success_url: `${process.env.LIVE_URL}/api/stripe?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.LIVE_URL}/login`,

    }
    if (trial_period > 0) {
      ds.subscription_data.trial_period_days = trial_period
    }
    const session = await stripe.checkout.sessions.create(ds);

    console.log({ session })
    return res.status(200).json({ data: session.id, status: true, message: '', session });
  } catch (error) {
    console.log('error', error)
    return res.status(500).json({ data: {}, status: false, message: error?.raw?.message ? error?.raw?.message : 'Internal Server Error' });
  }

}

const getdata = async (req, res) => {
  try {
    const id = req.query.session_id;
    console.log('req.query.session_id', req.query.session_id);

    let account = await dbQuery.select({
      collection: paymentCredentialModel,
      where: { type: "stripe" },
      limit: 1
    });
    console.log({ account }, "1st call");

    const stripe = require('stripe')(account.secret_key);
    const session = await stripe.checkout.sessions.retrieve(id);
    console.log({ session }, "2nd call");

    let userdata = session.metadata;
    userdata.paymenttype = "stripe";
    userdata.invoice_id = session.invoice;
    console.log({ userdata }, "3rd call");

    let wh = {};
    if (userdata.email) {
      wh = { email: userdata.email.toLowerCase() };
    } else {
      wh = { _id: userdata.userId };
    }
    console.log({ wh }, "4th call");

    let data = await dbQuery.select({
      collection: userModel,
      where: wh,
    });
    console.log(wh);
    console.log({ data }, "5th call");

    let invoicedata = {}
    invoicedata.id = session.invoice
    invoicedata.type = "stripe"
    invoicedata.plan_id = userdata.planId
    invoicedata.customerId = userdata.customer
    console.log("userdata", data);
    console.log({ invoicedata }, "6th call");



    if (data.length > 0) {
      if (session.customer && userdata.planId && userdata.paymenttype === 'stripe') {
        const existingIdSubscription = data[0].subscription;
        if (existingIdSubscription) {
          await stripe.subscriptions.cancel(existingIdSubscription);
          console.log(`Previous subscription with ID ${existingIdSubscription} canceled.`, "Okkkkkkkkk");
        }


        let d1 = await dbQuery.update({
          collection: userModel,
          where: { _id: data[0]._id },
          data: {
            customerId: userdata.customer,
            subscription: session.subscription,
            planId: userdata.planId,
            plan_status: true,
            invoice_id: session.invoice,
            paymenttype: "stripe",
            customerId: session.customer,
          },
          limit: 1,
        });
        console.log(d1, existingIdSubscription)

      }
    } else {
      let pas = await bcrypt.hash(userdata.password, 5);
      let insData = {
        name: userdata.name,
        email: userdata.email.toLowerCase(),
        password: pas,
        status: 1,
        source: "Manually",
        planId: userdata.planId,
        lastname: userdata.lastname,
        invoice_id: session.invoice,
        paymenttype: "stripe",
        customerId: session.customer,
        subscription: session.subscription,
      };
      let udata = await dbQuery.insert({
        collection: userModel,
        data: insData,
      });
      console.log({ udata }, "9th call");
      invoicedata.userId = udata._id;

      let html = `<div style="max-width: 600px; padding: 25px; background-color: #f6f6ff; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); font-size: 15px; line-height: 25px; color: #29325f;">
        <div style="text-align: center;">
            <h3 style="margin-top: 5px; color: #29325f;">${process.env.SITE_TITLE}</h3>
        </div>
        <p>Hi <span style="color: ff776b;"><b>${userdata.name} ${userdata.lastname}</b></span>,<br />
          Welcome to ${process.env.SITE_TITLE}. Your account is created, and you can login with the details below:<br/><br/>
          <b>Login URL:</b> ${process.env.LIVE_URL} <br/>
          <b>Email:</b> ${userdata.email.toLowerCase()} <br/>
          <b>Password:</b> ${userdata.password}<br />
        </p>
        <div style="background: #ffffff; padding: 15px 20px; border-radius: 20px; font-size: 14px; color: #8386a5;">
          <span>Thank you for joining: <b>The ${process.env.SITE_TITLE} Team</b></span>
        </div>
      </div>`;

      let mailData = {
        from: process.env.MANDRILL_EMAIL,
        to: userdata.email.toLowerCase(),
        subject: "Welcome",
        htmlbody: html
      };

      let data1 = await dbQuery.select({
        collection: serviceModel,
        where: { type: "smtp" },
        limit: 1,
      });
      if (data1) {
        let d1 = {
          to: userdata.email.toLowerCase(),
          subject: "Welcome",
          ...data1.data,
          htmlbody: html
        };
        await sendMail(d1);
      } else {
        await sendMail(mailData, "service");
      }
    }
    return res.redirect('/thankyou');
  } catch (e) {
    console.error("Error:", e);
    return res.redirect('/thankyou');
  }
}




const updateUser = async (req, res) => {
  try {
    customValidator({}, req, res, async ({ authData } = validateResp) => {
      const { planId } = req.body;
      console.log("priceId", planId);
      console.log("req.body", req.body);

      const account = await dbQuery.select({
        collection: paymentCredentialModel,
        where: { type: "stripe" },
        limit: 1,
      });
      if (!account && !account.secret_key) {
        res.status(400).json({ status: false, message: "Stripe credilans not found" });
      }
      console.log("account", account);
      const stripe = require("stripe")(account.secret_key);
      console.log("secret_key", account.secret_key, " authData.id");

      const exitingUser = await dbQuery.select({
        collection: userModel,
        where: { _id: authData.id },
        limit: 1,
      });
      console.log({ exitingUser }, "1st call");

      let stripeCustomerId = exitingUser?.customerId;
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          name: exitingUser.name,
          email: exitingUser.email,
        });
        stripeCustomerId = customer.id;
      }

      let plandata = await dbQuery.select({
        collection: planModel,
        where: { id: planId },
        limit: 1,
      });
      console.log({ plandata })

      let ds = {
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: planId,
            quantity: 1,
          },
        ],
        metadata: {
          planId: planId, userId: authData.id
        },
        mode: 'subscription',
        subscription_data: {
          trial_settings: {
            end_behavior: {
              missing_payment_method: 'cancel',
            },
          },

        },

        success_url: `${process.env.LIVE_URL}/api/stripe?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.LIVE_URL}/login`,
      }

      if (plandata.trial_period) {
        ds.subscription_data.trial_period_days = plandata.trial_period
      }
      const session = await stripe.checkout.sessions.create(ds);

      return res.status(200).json({ data: session.id, status: true, message: '', session });
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ status: false, message: "Internal server error", error });
  }
};
