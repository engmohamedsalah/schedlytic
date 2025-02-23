import customization from "./models/customization";
import userModel from "./models/userModel";
const { handleError, dbQuery , customValidator } = require("./lib/commonLib"); 
const mediaModel = require("./models/mediaModel");
const Customization = require("./models/customization");
const formidable = require("formidable");
const path = require('path');
const fs = require('fs');


export const config = {
    api: {
      bodyParser: false,
      responseLimit: false,
      externalResolver: true, 
    },
}

const { multerMiddleWare, removeFileFromS3 , uploadFormFileToS3 ,copyObject} = require('./lib/AWS-Actions');

export default async function handler(req, res) {
  try {
    if (req.method == "POST") {
        if (req.query.action && req.query.action == "UPLOAD") {
            uploadImage(req, res);
        }
    }
    }catch (error){
        handleError(error , 'MediaAPI');
    }
}

let uploadImage =(req,res)=>{
    customValidator(
        { 
            data: req.query,
            keys: {
            },
        },
        req,
        res,
        async ({authData} = validateResp) => {
           let where = {
                _id : authData.id
            }; 
            let folder = `web-setting-media/${authData.id}/images/`;
            dbQuery.select({
                collection : userModel,
                where,
                limit :  1, 
                keys : '_id',
            }).then(async checkReels => {
                if(checkReels){
                    let upload = multerMiddleWare({
                        fileType: process.env.ALLOW_IMAGE,
                    }); 
                    upload(req, res, async (err) => {
                        if (err) {
                            handleError(err , 'awsUpload');
                        } else { 
                            uploadFormFileToS3({ files : req.files, folder}).then(async uploadedFiles => {
                                let files = []; 
                                await uploadedFiles.map((data, index) => {
                                    files.push(data.key)
                                })
                                console.log({files})
                                return  res.status(200).json({status: true,message:'',data: {url : files[0]}}); 

                            },(error)=>{
                                console.log('error',error)
                                return  res.status(400).json({status: false,message: "Something went wrong"}); 
                            })
                            }})
                            }else{
                                handleError("User not found.");
                            } 
            });
        });
}
       






  




