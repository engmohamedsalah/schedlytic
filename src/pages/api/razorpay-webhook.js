
import invoiceModel from "./models/invoiceModel";
const Razorpay = require('razorpay');
const userModel = require("./models/userModel");
import paymentCredentialModel from "./models/paymentCredentialModel";
const {
  handleError,
  dbQuery,
} = require("./lib/commonLib");
const axios = require("axios")
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
  try {
    let { event, payload } = req.body
    if (event == "subscription.charged" || event == "subscription.authenticated" || event == "subscription.resumed") {

      let { id, plan_id } = payload.subscription.entity
      console.log({ id })
      let d1 = await dbQuery.select({
        collection: userModel,
        where: { $or: [{ subscription: id }, { "nextPlan.subscriptions": id }] },
        limit: 1,
      });

      let account = await dbQuery.select({
        collection: paymentCredentialModel,
        where: {
          type: "razorpay"
        },
        limit: 1
      });
      let instance = new Razorpay({
        key_id: account.client_id,
        key_secret: account.secret_key
      });

      if (d1) {
        try {
          let where = {
            status: 1,
            subscriptionsStatus: event
          }
          if (d1?.nextPlan?.subscriptions == id) {
            if (d1.subscription && d1.paymenttype == "razorpay") {
              const subscriptions = await instance.subscriptions.cancel(d1.subscription);
              console.log('subscriptions', subscriptions, 'CANCEL', d1.subscription)
              console.log('d1', d1)
            }

            where.nextPlan = {},
              where.subscription = id
            where.planId = plan_id
          }
          if (event == "subscription.charged") {
            let { amount, invoice_id, currency, order_id } = payload?.payment?.entity
            await dbQuery.insert({
              collection: invoiceModel,
              data: {
                userId: d1?._id,
                id: invoice_id,
                amount: (amount / 100),
                currency: currency,
                paymentId: payload.payment.entity.id,
                status: "active",
                orderId: order_id,
                type: "razorpay",
                email: d1.email,
                subscription: id,
                price: amount / 100,
                plan_id: plan_id
              },
            });
          }
          let s1 = await dbQuery.update({
            collection: userModel,
            where: { _id: d1?._id },
            data: {
              ...where,
              paymenttype: "razorpay"
            },
          });
          console.log({ s1 }, { where })
          return res.status(200).json({
            status: true,
            message: "payment is charged",
          })
        } catch (error) {
          console.log({ error })
        }
      } else {
        return res.status(400).json({
          status: false,
          message: "User is not found",
        })
      }
    } else {
      if (event == "subscription.completed" || event == "subscription.cancelled" || event == "subscription.paused") {
        let { id } = payload.subscription.entity
        console.log({ id }, "event", event)
        let d1 = await dbQuery.select({
          collection: userModel,
          where: { subscription: id },
          limit: 1,
        });

        if (d1) {
          try {
            await dbQuery.update({
              collection: userModel,
              where: { subscription: id },
              data: {
                status: 0,
                subscriptionsStatus: event
              },
            });
            res.status(200).json({
              status: true,
              message: "Subcription status changed",
            })
          } catch (error) {
            console.log({ error })
          }
        } else {
          res.status(400).json({
            status: false,
            message: "User is not found",
          })
        }
      } else {
        return res.status(200).json({
          status: false,
          message: "Webhook not match",
        })
      }

    }


  }
  catch (e) {
    console.log({ e })
    return res.status(200).json({
      status: true,
      message: "",
    })
  }
};










