const { handleError, dbQuery , customValidator} = require("./lib/commonLib"); 
const templateModal = require("./models/templateModal");
const mediaModel =require("./models/mediaModel");
const { multerMiddleWare, removeFileFromS3 , uploadFormFileToS3} = require('./lib/AWS-Actions');
export const config = {
    api: {
      bodyParser: false,
      responseLimit: false, 
      externalResolver: true, 
    },
}

export default async function handler(req, res) {
    try{
      if(req.method == 'PUT'){
        updateTemplate(req, res);
        }
    }catch (error){
        handleError(error , 'MediaAPI');
    }
}

let updateTemplate = (req, res) => {
    customValidator(
    { 
        data: req.query,
        keys: {
        },
    },
    req,
    res,
    async ({authData} = validateResp) => {

        let {target} = req.query;
        try {
            let where={
                _id : target
            }
            if(authData.role=="User")
            {
                where.userId=authData.id
            }
            let data =  await dbQuery.select({
                collection : templateModal,
                where : where, 
                limit :1,
            })

            if(data)
            {
                let folder = `users-data/${authData.id}/templates`;
                let upload = multerMiddleWare({
                    fileType:  process.env.ALLOW_IMAGE
                }); 
                upload(req, res, async (err) => {
                    if (err) {
                        handleError(err , 'awsUpload');
                    } else { 
                         
                        if (req.files.length) { 
                            if(data.url){
                                await removeFileFromS3({
                                    isMultiple : true,
                                    filePath: [data.url],
                                }, async () => {})
                            }
                            uploadFormFileToS3({
                                files : req.files,
                                folder,
                            }).then(async uploadedFiles => {
                                let files = [];
                                var filePath = '',  fileName = '', thumb = null; 
                                await uploadedFiles.map((data, index) => {
                                    files.push(data.key)
                                    
                                    if(data.fieldname == 'file'){
                                        filePath = data.key;
                                        fileName = data.originalname;
                                    }
                                    
                                    if(data.fieldname == 'thumb'){
                                        thumb = data.key;
                                    }
                                });
                                if(filePath != ''){
                                    let insData = {
                                        title : req.body.title,
                                        url : filePath,
                                        data : JSON.parse(req.body.data),
                                        layout : req.body.layout,
                                    };
                                    if(req.body.meta){
                                        insData.meta=req.body.meta
                                    }
                                    if(req.query.publish && authData.role!="User")
                                    {
                                        insData.publish=1
                                    }
                                   let d1= await dbQuery.update({
                                        collection : templateModal,
                                        where : where, 
                                        data : insData,
                                        limit :1,
                                    })

                                    if(req.query.publish && authData.role=="User")
                                    {
                                            let insData = {
                                                title : data.name,
                                                path : filePath,
                                                tags : "",
                                                type : "image",
                                                meta : JSON.parse(req.body.data)
                                            }      
                                                insData.userId = authData.id;
                                            
                                            await dbQuery.insert({
                                                collection : mediaModel,
                                                data : insData 
                                            })
                                        }
                                        res.status(200).json({ 
                                            status : true,
                                            message : 'Updated sucessfully',
                                        })
                                        
                                    }else{
                                        handleError('Something went wrong. please try again after sometime.');
                                    }
                            }).catch(error => {
                                handleError(error);
                            }); 
                        } else {
                            handleError('Please choose file to upload.');
                        }
                    }
                });
            }else{
                handleError('Template no found '); 
            }
          
            
            
        } catch(err) {
            handleError(err , 'UploadFile');
        } 

        
        
    })
}



