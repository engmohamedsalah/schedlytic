
import invoiceModel from "./models/invoiceModel";

const postModel = require("./models/postModel");
const mediaModel = require("./models/mediaModel")
const axios = require("axios")

const {
  handleError,
  dbQuery,
  customValidator,
} = require("./lib/commonLib");
const {socialPost} =require("../api/schedule")
const mongoose  = require('mongoose');

export default async function handler(req, res) {
  try {
     if(req.method == "GET") {
        getinvoiceList(req, res)
    } 
  } catch (error) {
    handleError(error, "AuthAPI");
  }
}




let getinvoiceList = (req, res) => {
    try{
  customValidator(
    { data: req.query },
    req,
    res,

    async ({ authData } = validateResp) => {
      let { keys, page, limit, keyword, sort } = req.query,
        where = {};
        let data=await invoiceModel.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $lookup: {
                    from: 'subscriptionplans',
                    localField: 'plan_id',
                    foreignField: 'id',
                    as: 'plan'
                }
            },
            {
                $unwind: '$plan'
            },
            {
              $sort: {
                '_id': -1 
              }
          },
            {
                $skip: parseInt((page-1)*limit)
            },
            {
                $limit: parseInt(limit)
            },
            {
              $sort: {
                '_id': -1 
              }
          }
        ])
        let count = await dbQuery.count({
                  collection: invoiceModel,
        });
          res.status(200).json({
            status: true,
            message: "",
            data: data,
            totalRecords: count,
            fetchedRecords: limit == 1 ? 1 : data.length,
          });
    }
  );
}catch(e){
    res.status(401).json({
        status: false,
        message: "SOmething went wrong ",
        data: {},
      });
}
};


