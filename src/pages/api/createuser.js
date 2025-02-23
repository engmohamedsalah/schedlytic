

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
} = require("./lib/commonLib");

const mongoose = require("mongoose");

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      if (req.body.action === "usercreate") {
        createuser(req, res);
      }
    } else {
      if (req.method === "PUT") {
        updateuser(req, res);
      }
    }
  } catch (error) {
    // handleError(error, "AuthAPI");
  }
}


const createuser = async (req, res) => {
  try {
    let { name, lastname, email, password, planId, role, paymenttype } = req.body;
    console.log('req.body', req.body);

    const checkUser = await dbQuery.select({
      collection: userModel,
      where: { email: email.toLowerCase() },
      limit: 1,
      keys: "_id,subscription",
    });


    let account = await dbQuery.select({
      collection: paymentCredentialModel,
      where: {
        type: "razorpay"
      },
      limit: 1
    });

    if (!account || !account.client_id || !account.secret_key) {
      res.status(400).json({ status: false, message: "Both key_id and key_secret are required" });
      return;
    }

    let plan = await dbQuery.select({
      collection: planModel,
      where: { id: planId },
      limit: 1,
    });

    let instance = new Razorpay({
      key_id: account.client_id,
      key_secret: account.secret_key
    });
    let subsd = {
      "plan_id": planId,
      // "total_count":100,
      "quantity": 1,
      "customer_notify": 1,
      "addons": [],
    }
    if (plan.trial_period > 0) {
      let date = new Date();
      date.setDate(date.getDate() + plan.trial_period);
      subsd.start_at = Math.floor(date.getTime() / 1000)
      let date1 = new Date();
      date1.setFullYear(date1.getFullYear() + 29);
      subsd.end_at = Math.floor(date1.getTime() / 1000)
    } else {
      subsd.total_count = plan.time_period == "MONTH" ? 348 : 29
    }

    const subscriptions = await instance.subscriptions.create(subsd);
    if (subscriptions) {
      if (checkUser) {
        await dbQuery.update({
          collection: userModel,
          data: {
            nextPlan: {
              subscriptions: subscriptions.id,
              planId: planId,
              name,
              lastname,
              email,
              password
            }
          },
          limit: 1,
        })
      } else {
        const data = {
          name,
          email: email.toLowerCase(),
          password: await bcrypt.hash(password, 5),
          planId: "",
          lastname,
          status: 0,
          role: role || 'User',
          paymenttype: 'razorpay',
          source: 'plan',
          subscriptionsStatus: "created",
          subscription: "",
          nextPlan: {
            subscriptions: subscriptions.id,
            planId: planId,
          }
        };
        await dbQuery.insert({
          collection: userModel,
          data: data,
        })
        console.log('data', data)
      }
      console.log('subscriptions', subscriptions)
      return res.status(200).json({ status: true, message: "", data: subscriptions });

    } else {
      return res.status(500).json({ status: false, message: "Subcription Not Created" });
    }


  }
  catch (err) {
    console.log('Error:', err);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};



const updateuser = async (req, res) => {
  try {
    customValidator({}, req, res, async ({ authData } = validateResp) => {
      let { planId } = req.body;
      console.log('planId', planId)
      const checkUser = await dbQuery.select({
        collection: userModel,
        where: { _id: authData.id },
        limit: 1,
        keys: "_id,subscription",
      });

      let account = await dbQuery.select({
        collection: paymentCredentialModel,
        where: {
          type: "razorpay"
        },
        limit: 1
      });

      if (!account || !account.client_id || !account.secret_key) {
        res.status(400).json({ status: false, message: "Both key_id and key_secret are required" });
        return;
      }

      let plan = await dbQuery.select({
        collection: planModel,
        where: { id: planId },
        limit: 1,
      });

      let instance = new Razorpay({
        key_id: account.client_id,
        key_secret: account.secret_key
      });
      let subsd = {
        "plan_id": planId,
        "quantity": 1,
        "customer_notify": 1,
        "addons": [],
      }
      if (plan > 0) {
        let date = new Date();
        date.setDate(date.getDate() + plan.trial_period);
        subsd.start_at = Math.floor(date.getTime() / 1000)
        let date1 = new Date();
        date1.setFullYear(date1.getFullYear() + 29);
        subsd.end_at = Math.floor(date1.getTime() / 1000)
      } else {
        subsd.total_count = plan == "MONTH" ? 348 : 29
      }

      const subscriptions = await instance.subscriptions.create(subsd);
      if (subscriptions) {
        if (checkUser) {
          await dbQuery.update({
            collection: userModel,
            data: {
              nextPlan: {
                subscriptions: subscriptions.id,
                planId: planId,
              }
            },
            where: { _id: checkUser._id },
            limit: 1,
          })
        }
        console.log('subscriptions', subscriptions)
        return res.status(200).json({ status: true, message: "", data: subscriptions });

      } else {
        return res.status(500).json({ status: false, message: "Subcription Not Created" });
      }
    })
  }
  catch (err) {
    console.log('Error:', err);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};
























































