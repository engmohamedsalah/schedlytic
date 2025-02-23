import bcrypt from "bcryptjs";
import { resolve } from "styled-jsx/css";
import { where } from "underscore";
import productModel from "./models/productModel";
const planModel = require("./models/planModel");
const webhookModel = require("./models/webhookModel");
const Razorpay = require('razorpay');
const axios = require('axios');

const { v4: uuidv4 } = require('uuid');
const userModel = require("./models/userModel");
const userSubscriptionModel = require("./models/userSubscriptionModel");


const invoiceModel = require("./models/invoiceModel");
const paymentCredentialModel = require("./models/paymentCredentialModel");
const {
  handleError,
  dbQuery,
  customValidator,
} = require("./lib/commonLib");

const mongoose = require('mongoose');





export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      if (req.body.action === "freeplan") {
        createFreePlan(req, res);
      }
      else if (req.body.action === "useFreePlan") {
        addFreePlan(req, res);
      } else if (req.body.action === "createrazorpay") {
        createrazorpayPlan(req, res);

      } else {
        paymentCredentialAuth(req, res);
      }
    } else if (req.method === "PUT") {
      if (req.body.action === "updateFree") {
        updateFree(req, res)
      }
      else {
        updateStatus(req, res);
      }

    } else if (req.method === "GET") {
      if (req.query.action === "payment_accounts") {
        getPaymentAccounts(req, res);
      }

      else if (req.query.action === "checkactive") {
        checkActivePlan(req, res);
      } else {
        getPlanList(req, res);
      }
    }
    else if (req.method === "PATCH") {
      ActivePlan(req, res);
    }
    else if (req.method == "DELETE") {
      deletePlan(req, res);

    } else {
      isRazorpayActive(req, res);
    }
  } catch (error) {
    handleError(error, "AuthAPI");
  }
}

const getPlanList = async (req, res) => {
  let where = { active_status: true }, limit = 1000
  let t1 = { type: "free", active_status: true }
  if (req.query.target) {
    where.id = req.query.target
    limit = 1
    t1 = null
  } else {
    if (req.query.action == "getall") {
      delete where.active_status
      delete t1.active_status
    } else {
      let activeaccount = await dbQuery.select({
        collection: paymentCredentialModel,
        where: {
          status: "active"
        },
        limit: 1
      });
      if (activeaccount) {
        let plan = activeaccount.type
        where.type = plan
      }
    }

  }
  where = {
    $or: [
      where,
    ]
  }

  if (t1) {
    where["$or"].push(t1)
  }
  console.log({ where }, "9090")
  let d1 = await dbQuery.select({
    collection: planModel,
    where: where,
    limit: limit
  });


  if (d1 && d1.length > 0) {
    d1 = d1.map(plan => {
      if (plan.type === "free") {
        plan.canBeUpdated = false;
        plan.canBeCanceled = false;
      }
      return plan;
    });
  }
  console.log('d1', d1)
  return res.status(200).json({ data: d1, status: true, message: "", });
}


const updateStatus = async (req, res) => {
  customValidator(
    {
      data: req.body,
      keys: {
        status: {
          require: true
        },
        target: {
          require: true
        }
      },
    },
    req,
    res,
    async ({ authData } = validateResp) => {
      try {
        let { status, target } = req.body
        let d1 = await dbQuery.update({
          collection: planModel,
          where: { _id: target },
          data: { active_status: status },
          limit: 1
        });
        if (d1) {
          res.status(200).json({
            status: true,
            message: "Update status successfully",
          });
        }
      }
      catch (e) {
        res.status(401).json({
          status: true,
          message: "Something went wrong",
        });
      }
    })

}


const paymentCredentialAuth = async (req, res) => {
  customValidator(
    {
      data: req.body,
      keys: {
        client_id: {
          require: true,
        },
        secret_key: {
          require: true,
        },
        type: {
          require: true,
        },
      },
    },
    req,
    res,
    async ({ authData } = validateResp) => {
      try {
        let { type } = req.body;
        if (type == "paypal") {
          checkPaypal(req, res);
        } else if (type == "stripe") {
          checkStripe(req, res);
        } else if (type == "razorpay") {
          checkRazorpay(req, res);
        }
      } catch (error) {
        res.status(401).json({
          status: false,
          message: "Client credentials are wrong.",
        });
        console.error('Error checking credentials:', error.response);
      }
    }
  );
};


const checkPaypal = async (req, res) => {
  try {
    let { client_id, secret_key, type, email } = req.body
    const token = await getToken(client_id, secret_key);
    const userInfoResponse = await axios.get(
      `${process.env.PAYPAL_URL}/v1/identity/openidconnect/userinfo?schema=openid`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      }
    );
    if (userInfoResponse.data) {
      let d1 = await dbQuery.select({
        collection: paymentCredentialModel,
        where: {
          type: type
        },
        limit: 1
      });
      let data
      if (d1 && Object.keys(d1).length > 0) {
        data = await dbQuery.update({
          collection: paymentCredentialModel,
          where: {
            _id: d1._id
          },
          data: {
            client_id: client_id,
            secret_key: secret_key,
            type: type,
            email: email
          }
        });
        if (data.modifiedCount > 0) {
          await dbQuery.delete({
            collection: productModel,
            where: {
              type: "paypal",
            },
            limit: 1
          });
        }
      } else {
        data = await dbQuery.insert({
          collection: paymentCredentialModel,
          data: {
            client_id: client_id,
            secret_key: secret_key,
            type: type,
            email: email
          },
          limit: 1
        });
      }


      if (data) {
        res.status(200).json({
          data: userInfoResponse.data,
          status: true,
          message: "Details edit Successfully.",
        });
      }

    }
  } catch (e) {
    res.status(401).json({
      status: false,
      message: "Clients details are invaild.",
    });
  }
}




const getToken = async (client_id, secret_key) => {
  try {
    const credentials = Buffer.from(`${client_id}:${secret_key}`).toString('base64');
    const response = await axios.post(
      `${process.env.PAYPAL_URL}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${credentials}`,
        },
      }
    );

    return response.data.access_token;
  }
  catch (e) {
    throw e
  }
};





const checkStripe = async (req, res) => {
  try {
    let { client_id, secret_key, type, email } = req.body
    const response = await axios.get('https://api.stripe.com/v1/balance', {
      headers: {
        Authorization: `Bearer ${secret_key}`,
      },
    });

    if (response.data) {
      let d1 = await dbQuery.select({
        collection: paymentCredentialModel,
        where: {
          type: type
        },
        limit: 1
      });
      let data
      if (d1 && Object.keys(d1).length > 0) {
        data = await dbQuery.update({
          collection: paymentCredentialModel,
          where: {
            _id: d1._id
          },
          data: {
            client_id: client_id,
            secret_key: secret_key,
            type: type,
            email: email
          }
        });

        if (data.modifiedCount > 0) {
          await dbQuery.delete({
            collection: productModel,
            where: {
              type: "stripe",
            },
            limit: 1
          });
        }
      } else {
        data = await dbQuery.insert({
          collection: paymentCredentialModel,
          data: {
            client_id: client_id,
            secret_key: secret_key,
            type: type,
            email: email
          },
          limit: 1
        });
      }
      if (data) {
        res.status(200).json({
          data: response.data,
          status: true,
          message: "Details edit Successfully.",
        });
      }
    }
  } catch (error) {
    console.error('Error checking Stripe credentials:', error);
    res.status(401).json({
      status: false,
      message: "Clients details are invaild.",
    });
  }



}

const ActivePlan = async (req, res) => {
  let { target } = req.body
  let d1 = await dbQuery.select({
    collection: paymentCredentialModel,
    where: {
      _id: new mongoose.Types.ObjectId(target)
    },
    limit: 1
  });

  if (d1) {
    let d2 = await dbQuery.update({
      collection: paymentCredentialModel,
      where: {
        status: "active"
      },
      data: {
        status: "inactive"
      }
    });
    console.log({ d2 })
    if (d2) {
      let active = await dbQuery.update({
        collection: paymentCredentialModel,
        where: {
          _id: new mongoose.Types.ObjectId(target)
        },
        data: {
          status: "active"
        },
        limit: 1
      });
      if (active) {
        res.status(200).json({
          data: {},
          status: true,
          message: "Your gateway is active now ",
        });
      }
    }

  } else {
    res.status(401).json({
      status: false,
      message: "plan not find",
    });
  }

}

const getPaymentAccounts = async (req, res) => {
  customValidator(
    {
      data: req.query,
      keys: {

      },
    },
    req,
    res,
    async ({ authData } = validateResp) => {

      let d1 = await dbQuery.select({
        collection: paymentCredentialModel,
        where: {},
        limit: 10
      });
      res.status(200).json({
        data: d1,
        status: true,
        message: "",
      });

    })
}


const checkActivePlan = async (req, res) => {

  let d1 = await dbQuery.select({
    collection: paymentCredentialModel,
    where: { status: "active" },
    limit: 1
  });
  if (d1) {
    res.status(200).json({
      data: d1,
      status: true,
      message: "",
    });
    console.log({ d1 })
  } else {
    res.status(400).json({
      data: d1,
      status: false,
      message: "Please active your plan",
    });
  }

}

function generateUniqueId() {
  const randomNumber = Math.random().toString(36).substr(2, 9);
  const timestamp = Date.now().toString(36);
  return randomNumber + timestamp;
}

// Example usage:
let createFreePlan = async (req, res) => {
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
      socialIntregation
    } = req.body;
    console.log('req.body', req.body)
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
      post_type: post_type,
      socialIntregation: socialIntregation,
      type: "free"
    };

    data.id = 'free' + generateUniqueId();
    let d1 = await dbQuery.select({
      collection: planModel,
      where: {
        name: data.name
      },
    });

    console.log({ d1 }, "I");
    if (d1.length > 0) {
      return res.status(401).json({ status: false, message: "Plan already exists", });
    }
    try {
      let d2 = await dbQuery.insert({
        collection: planModel,
        data: req.body,
        data: data,
      });
      console.log({ d2 }, "Me")
      if (d2) {
        res.status(200).json({ status: true, message: "Plan Created Sucessfully. ", data });
      }
    } catch (e) {
      console.log(e)
    }
  } catch (e) {
    console.log("error", e)
    res.status(401).json({ status: false, message: "Something went wrong. ", });
  }
}



let addFreePlan = async (req, res) => {

  let { id } = req.body
  let data = req.body.user
  console.log('req.body', req.body)
  console.log('Recived id ', id)


  console.log(data)
  let d1 = await dbQuery.select({
    collection: planModel,
    where: { id: id },
    limit: 1
  });

  if (d1 && d1.type == "free") {
    let user1 = await dbQuery.select({
      collection: userModel,
      where: {
        email: data.email.toLowerCase(),
      },
      limit: 1
    });
    if (!user1) {
      let pas = await bcrypt.hash(data.password, 5);
      let insData = {
        name: data.name,
        email: data.email.toLowerCase(),
        password: pas,
        status: 1,
        source: "free",
        planId: id,
        lastname: data.lastname,
        paymenttype: "free"
      };


      await dbQuery.insert({
        collection: userModel,
        data: insData,
      });

      res.status(200).json({
        status: true,
        message: "Plan  Purchase Successfully",
      })
    } else {
      res.status(200).json({
        status: false,
        message: "User already exits",
      })
    }
  } else {
    res.status(200).json({
      data: d1,
      status: true,
      message: "Plan not found ",
    });
  }

}




const checkRazorpay = async (req, res) => {
  try {
    let { client_id, secret_key, type, email } = req.body;

    if (!client_id || !secret_key || !email) {
      return res
        .status(400)
        .json({
          status: false,
          message: "Client ID, Secret Key, and Email are required",
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid email format" });
    }
    var instance = new Razorpay({ key_id: client_id, key_secret: secret_key });
    try {
      const accountDetails = await instance.payments.all();
      if (accountDetails) {
        let d1 = await dbQuery.select({
          collection: paymentCredentialModel,
          where: { type: type },
          limit: 1,
        });
        console.log('d1', d1)
        let data;
        if (d1 && Object.keys(d1).length > 0) {
          data = await dbQuery.update({
            collection: paymentCredentialModel,
            where: { _id: d1._id },
            data: {
              client_id: client_id,
              secret_key: secret_key,
              type: type,
              email: email,
            },
          });
          console.log('data', data)
          if (data.modifiedCount > 0) {
            await dbQuery.delete({
              collection: webhookModel,
              where: {
              },
            });
          }
        } else {
          data = await dbQuery.insert({
            collection: paymentCredentialModel,
            data: {
              client_id: client_id,
              secret_key: secret_key,
              type: type,
              email: email,
            },
          });
        }
        if (data) {
          console.log('accountDetails', accountDetails)
          return res.status(200).json({
            status: true,
            message: "Razorpay activated successfully",
            data: accountDetails,
          });

        }
      } else {
        res.status(401).json({ status: false, message: "Invalid client credentials" });
      }
    } catch (error) {
      res.status(401).json({ status: false, message: "Invalid client credentials" });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: "Internal server error." });
  }
};


const isRazorpayActive = async (req, res) => {
  let d1 = await dbQuery.select({
    collection: paymentCredentialModel,
    where: {
      type: "razorpay",
      status: "active",
      limit: 1
    }
  })


  if (d1) {
    res.status(200).json({ data: d1, status: true, message: "Yesss" });
  } else {
    res.status(200).json({
      data: d1, status: false, message: "Please active  your account details",
    });
  }
  return d1.length > 0;


}


const createwebhook = async (url, apiKey, apiSecret) => {
  return new Promise(async (resolve, reject) => {
    const encodedCredentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

    const response = await fetch("https://api.razorpay.com/v1/webhooks", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodedCredentials}`
      },
      body: JSON.stringify({
        url: url,
        events: {
          'payment.captured': true,
          "subscription.authenticated": true,
          "subscription.activated": true,
          "subscription.completed": true,
          "subscription.cancelled": true,
          "subscription.paused": true,
          "subscription.charged": true,
          "subscription.resumed": true
        },
        entity: 'webhook',
        owner_type: 'merchant'
      })
    });
    console.log({ response })
    const data = await response.json();
    let insertResult = await dbQuery.insert({
      collection: webhookModel,
      data: {
        name: "razorpay",
        data: data
      }
    });
    console.log({ insertResult }, "okk")

    console.log({ data })
    if (data) {
      resolve(data)
    } else {
      reject()
    }

  })
}


const createrazorpayPlan = async (req, res) => {
  customValidator(
    {
      data: req.body,
      keys: {
      },
    },
    req,
    res,
    async (validateResp) => {
      try {
        const data = req.body;

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

        var instance = new Razorpay({
          key_id: account.client_id,
          key_secret: account.secret_key
        });

        const authData = validateResp.authData;
        data.userId = authData.id;

        const existingPlans = await dbQuery.select({
          collection: planModel,
          where: { name: data.name },
        }) || [];

        if (existingPlans.length > 0) {
          res.status(400).json({ status: false, message: "Plan  already exists" });
          return;
        }

        let period = data.time_period === "MONTH" ? "monthly" : "yearly";
        let interval = data.interval || 1;


        let web = await dbQuery.select({
          collection: webhookModel,
          where: {
            name: "razorpay",
          },
          limit: 1,
        });
        if (!web) {
          try {
            let webhook = await createwebhook(process.env.LIVE_URL + `/api/razorpay-webhook`, account.client_id, account.secret_key)
          } catch (e) {
            console.log("webhook is not working ")
          }
        }
        let planData = await instance.plans.create({
          period: period,
          interval: 1,

          item: {
            name: data.name,
            description: data.description,
            amount: data.price * 100,
            currency: 'INR',
          },
        });
        console.log({ planData })

        planData = { ...planData, ...data, type: "razorpay" };

        console.log("Inserting plan data:", planData);

        let insertResult = await dbQuery.insert({
          collection: planModel,
          data: planData
        });

        console.log("Insert result:", insertResult);
        console.log('planData', planData)

        if (insertResult) {
          res.status(200).json({ status: true, message: "Plan created successfully", planData });
        } else {
          res.status(500).json({ status: false, message: "Failed to save plan data to the database." });
        }
      } catch (e) {
        console.error("Error creating plan:", e);
        res.status(500).json({ status: false, message: "Something went wrong." });
      }
    }
  );
};






let updateFree = (req, res) => {
  customValidator(
    {
      data: req.body,
      keys: {
      },
    },
    req,
    res,
    async ({ authData } = validateResp) => {
      try {
        let data = req.body;
        const planId = req.query.id;
        data.userId = authData.id;
        data.id = req.query.id;
        try {
          let d2 = await dbQuery.update({
            collection: planModel,
            data: {
              socialIntregation: data.socialIntregation,
              post_per_month: data.post_per_month,
              ai_text_generate: data.ai_text_generate,
              ai_image_generate: data.ai_image_generate,
              description: data.description,
              post_type: data.post_type,
              editor_access: data.editor_access

            },
            where: { id: planId },
          });
          if (d2) {
            return res.status(200).json({ status: true, message: "Plan update successfully.", data });
          }
        }
        catch (e) {
          console.log({ e })
        }
      } catch (e) {
        console.log(e);
        return res.status(500).json({ status: false, message: "Something went wrong.", e });
      }
    }
  )
}



let updateRazorpay = (req, res) => {
  customValidator(
    {
      data: req.body,
      keys: {},
    },
    req,
    res,
    async ({ authData } = validateResp) => {
      try {
        let data = req.body;
        //  const id = req.query.id;
        const planId = req.query.id;
        data.userId = authData.id;
        data.id = req.query.id;

        console.log({ data }, "jaiho")
        try {
          let d2 = await dbQuery.update({
            collection: planModel,
            data: data,
            where: { id: planId },
            // where:{_id:id}
          });
          console.log({ d2 }, "ekdin")
          if (d2) {
            return res.status(200).json({ status: true, message: "Plan update successfully.", data });
          }
        }
        catch (e) {
          console.log({ e })
        }
      } catch (e) {
        console.log(e);
        return res.status(500).json({ status: false, message: "Something went wrong.", e });
      }
    }
  )
}


const deletePlan = async (req, res) => {
  const planId = req.query.id;
  console.log('req.query.id;:', req.query.id);

  try {
    const deletePlan = await dbQuery.delete({
      collection: planModel,
      where: { id: planId },
    })
    console.log(deletePlan);
    res.status(200).json({ status: true, message: 'Deleted plan ', deletePlan })
  } catch (err) {
    res.status(500).json({ status: false, message: 'Internal error  ', deletePlan })
  }
}

