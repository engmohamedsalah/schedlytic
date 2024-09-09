const { handleError, dbQuery , customValidator , convertToSlug , objectToQuery} = require("./lib/commonLib");
const mediaModel = require("./models/mediaModel");
const axios = require("axios");
let localTempFilePath = '/';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4mb' ,
        }
    }
}
export default async function handler(req, res) {
    try{
      if (req.method == "PUT") {
            updateMedia(req, res);
          }
    }catch (error){
        handleError(error , 'MediaAPI');
    }
}






let updateMedia =(req, res)=>{
    try {
    customValidator(
        { 
            data: req.body,
            keys: {
            },
        },
        req,
        res,
        async ({authData} = validateResp) => {
            if(authData.role=="User"){
                handleError("User is not authorize.");
                return;
            }

            let {data,target} = req.body
            let d1 =[]

           let d2=await dbQuery.select({
                collection : mediaModel,
                where : {_id :target}, 
                keys : '_id',
                limit : 1
            })
            if(d2){
                dbQuery.update({
                    collection : mediaModel,
                    where :  {"_id" :target},
                    data : {$set :data},
                }).then(async checkMedia => {
                    res.status(200).json({ 
                        status : true,
                        message : 'Asset updated successfully.',
                    })
                })
            }else{
                handleError("Asset not found.");
            }
          
       })
    }
    catch(e){
        res.status(200).json({ 
            status : true,
            message : e,
        })
    }
}