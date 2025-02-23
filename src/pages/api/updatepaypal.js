const {
    handleError,
    dbQuery,
    customValidator,
} = require("./lib/commonLib");
const axios = require('axios');
const paymentCredentialModel = require("./models/paymentCredentialModel");
const planModel = require("./models/planModel");

export default async function handler(req, res) {
    try {
        if (req.method == "POST") {
            if (req.body.action == "updateprice") {
                updateed(req, res)
            }
        }
    } catch (error) {
        handleError(error, "AuthAPI");
    }
}



const updateed = async (req, res) => {
    const planId = req.query.id;
    console.log('req.body',req.body)
    // const { pricing_schemes } = req.body;

    try {
        const c1 = await dbQuery.select({
            collection: paymentCredentialModel,
            where: { type: 'paypal' },
            limit: 1
        })
        console.log({ c1 }, "1st");
        if (c1.length > 0) {
            const palns = await dbQuery.select({
                collection: planModel,
                where: {id: planId},
                limit: 1
            })
            console.log({ palns }, "2nd");
            console.log('planId',planId)
        } else {
            try {
                const response = await axios.post(
                    `${process.env.PAYPAL_URL}/v1/billing/plans/${planId}/update-pricing-schemes`,
                    {
                        pricing_schemes: [{
                            billing_cycle_sequence: 1,
                            pricing_scheme: {
                                fixed_price: {
                                    value: 50,
                                    currency_code: "USD"
                                }
                            }
                        }, {
                            billing_cycle_sequence: 2,
                            pricing_scheme: {
                                fixed_price: {
                                    value: 50,
                                    currency_code: "USD"
                                },
                                pricing_model: "VOLUME",
                                tiers: [{
                                    starting_quantity: 1,
                                    ending_quantity: 1000,
                                    amount: {
                                        value: 100,
                                        currency_code: "USD"
                                    }
                                }, {
                                    starting_quantity: 1001,
                                    amount: {
                                        value: 150,
                                        currency_code: "USD"
                                    }
                                }]
                            }
                        }]
                    },



                    //     {
                    //              billing_cycle_sequence: 1,
                    //             pricing_schemes:{
                    //         fixed_price: {
                    //             value: data.price,
                    //             currency_code: 'USD',
                    //           },
                    //       },
                    //     },
                    //     {
                    //         billing_cycle_sequence:2,
                    //         pricing_schemes:{
                    //             fixed_price:{
                    //                 value:data.price,
                    //                 currency_code:'USD'
                    //             }
                    //         },
                    //         principal_model:VOLUME,
                    //         tiers:[{
                    //             starting_quantity: 1,
                    //             ending_quantity: 1000,
                    //              amount: {
                    //              value: 150,
                    //             currency_code: "USD"
                    //   },
                    //   starting_quantity:1001,
                    //   amount:{
                    //     value:250,
                    //     currency_code:"USD"
                    //   }
                    //         }]



                    //     },


                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Basic ${Buffer.from(process.env.PAYPAL_CLIENT_ID+":"+process.env.PAYPAL_SECRET_KEY).toString('base64')}`,
                          },
                    },
                )
                console.log({ response }, "3rd");
                return res.status(200).json({ status: true, message: "OKKKKK", response })
            } catch (error) {
                console.log(error);
                return res.status(500).json({ status: false, message: "Internal server error" })
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: "Internal server error" })
    }
}