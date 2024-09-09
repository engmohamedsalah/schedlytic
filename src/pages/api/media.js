import userModel from "./models/userModel";
const { handleError, dbQuery , customValidator } = require("./lib/commonLib"); 
const mediaModel = require("./models/mediaModel");
const { multerMiddleWare, removeFileFromS3 , uploadFormFileToS3 ,copyObject} = require('./lib/AWS-Actions');
export const config = {
    api: {
      bodyParser: false,
      responseLimit: false,
      externalResolver: true, 
    },
}


export default async function handler(req, res) {
    try{
        if (req.method == "POST") {
          if (req.query.action && req.query.action == "UPLOAD") {
            uploadThumb(req, res);
          } else {
            if (req.query.action == "uploadProfile") {
              uploadProfile(req, res);
            } else {
              addMediaToLibrary(req, res);
            }
          }
        } else if (req.method == "GET") {
          if (req.query.action == "useImage") {
            ImageasMyMedia(req, res);
          } else {
            searchMedia(req, res);
          }
        } else if (req.method == "DELETE") {
          removeMedia(req, res);
        } 
    }catch (error){
        handleError(error , 'MediaAPI');
    }
}

let searchMedia = (req, res) => {
    customValidator(
    { 
        data: req.query,
        keys: {
            mediaType: {
                require: true,
            },
        },
    },
    req,
    res,
    async ({authData} = validateResp) => {
        let {keys , mediaType , keyword, limit, page , sort = null , isAssets = null,categoryId ,type,elementType} = req.query, 
        where = {
            type : mediaType,
            userId : authData.id
        };  
        if(isAssets) {
            where.categoryId = { $exists: true } 
            delete where.userId;
        }

        if(keyword && keyword.trim() != ''){
            where["$or"] =  [
                    {'title' : { $regex : new RegExp(keyword, "i")},},
                    {'tag' : { $regex : new RegExp(keyword, "i")}},
                ]
        }
        if(type=="post"){
            where.path= {
                $not: /svg/
              }
        }
        if(categoryId)
        {
            where.categoryId=categoryId

        }
   
        if(elementType)
        {
            delete where.userId;
            where.elementType=elementType
            if(authData.role=="User")
            {
                where.status=1
            }
        }else{
            where.elementType = { $exists: false } 
        }
        dbQuery.select({
            collection : mediaModel,
            where, 
            limit,
            keys,
            page, 
            sort
        }).then(async mediaData => { 

            let count =  limit == 1 ? 1 : await dbQuery.count({
                collection : mediaModel,
                where,
            });
            
            res.status(200).json({ 
                status : true,
                message : '',
                data : mediaData,
                totalRecords : count,
                fetchedRecords : limit == 1 ? 1 : mediaData.length
            })
        });
        
    })
}

let addMediaToLibrary = (req, res) => {
    customValidator(
    { 
        data: req.query,
        keys: {
            mediaType: {
                require: true,
            },
        },
    },
    req,
    res,
    async ({authData} = validateResp) => {
        let {mediaType,type ,tags ,elementType} = req.query;
        try {
            let dFoler = {
                
                image : ['images', process.env.ALLOW_IMAGE],
                video : ['videos', process.env.ALLOW_VIDEO],
                audio : ['audios', process.env.ALLOW_AUDIO],
            };
            let folder = `${authData.role == 'Admin' ? 'assets':`users-data/${authData.id}`}/${dFoler[mediaType][0]}`;

            let upload = multerMiddleWare({
                fileType: dFoler[mediaType][1]
            }); 
            upload(req, res, async (err) => {
                if (err) {
                    handleError(err , 'awsUpload');
                } else { 
                     
                    if (req.files.length) { 
                        uploadFormFileToS3({
                            files : req.files,
                            folder,
                        }).then(async uploadedFiles => {
                            let files = [];
                            var filePath = '',  fileName = '', thumb = null; 
                            await uploadedFiles.map((data, index) => {
                                files.push(data.key)
                                if(data.fieldname == 'file'){
                                    filePath = data.key || data.Key;
                                    fileName = data.originalname;
                                }
                                if(data.fieldname == 'thumb'){
                                    thumb = data.key;
                                }
                            });
                            if(filePath != ''){
                                let insData = {
                                    title : fileName,
                                    path : filePath,
                                    tag : req.body.tags,
                                    type : mediaType,
                                    meta : req.body.meta,
                                    elementType : elementType,
                                };
                                if(thumb){
                                    insData.thumb = thumb;
                                }
                                    insData.userId = authData.id;
                                if(type){
                                    insData.type=type 
                                }
                                if(req.body.categoryId){
                                    insData.categoryId=req.body.categoryId
                                }
                                dbQuery.insert({
                                    collection : mediaModel,
                                    data : insData 
                                }).then(async insData => { 
                                    
                                    res.status(200).json({
                                        status: true,
                                        data : filePath,
                                        thumb : thumb,
                                        meta : req.body.meta,
                                        message: 'Media uploaded successfully.',
                                    })
                                });
                            }else{
                                handleError('Something went wrong please try again after sometime.');
                            }
                        }).catch(error => {
                            handleError(error.message);
                        }); 
                    } else {
                        handleError('Please choose file to upload.');
                    }
                }
            });
            
            
        } catch(err) {
            handleError(err , 'UploadFile');
        } 
    })
}

let removeMedia = (req, res) => {
    customValidator(
    { 
        data: req.query,
        keys: {
            target: {
                require: true,
            },
        },
    },
    req,
    res,
    async ({authData} = validateResp) => {

        let {target,type} = req.query,
        where = {
            _id : target,
            userId : authData.id
        }; 

        if(authData.role!="User")
        {
            delete where.userId
        }

        dbQuery.select({
            collection : mediaModel,
            where, 
            limit :  1, 
            keys : '_id,path,thumb',
        }).then(async checkMedia => {
            if(checkMedia){


                let remData = [];
                let {path , thumb } = checkMedia;

                if(path && path != ''){
                    remData.push(path);
                }
                if(thumb && thumb != ''){
                    remData.push(thumb);
                }

                removeFileFromS3({
                    isMultiple : true,
                    filePath: remData,
                }, async () => {
                    dbQuery.delete({
                        collection : mediaModel,
                        where, 
                        limit :  1,
                    }).then(async del => {
                        res.status(200).json({ 
                            status : true,
                            message : 'Media removed successfully.',
                        })
                    });
                });                
            }else{
                handleError("Media not found.");
            } 
        });
    })
}


let uploadProfile =(req,res)=>{
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
            let folder = `users-data/${authData.id}/images/`;
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
                            uploadFormFileToS3({
                                files : req.files,
                                folder,
                            }).then(async uploadedFiles => {
                                let files = []; 
                                await uploadedFiles.map((data, index) => {
                                    files.push(data.key)
                                })
                                dbQuery.update({
                                    collection : userModel,
                                    where, 
                                    limit :  1,
                                    data :{
                                        profile:files[0],
                                    }
                                }).then(async del => {
                                    res.status(200).json({
                                        status : true,
                                        message : 'Profile updated successfully.',
                                        data : {
                                            profile:files[0],
                                        }
                                    })
                                });

                            },(error)=>{
                               
                            })
                            }})
                            }else{
                                handleError("User not found.");
                            } 
                
            });
        });
       
}


let ImageasMyMedia =(req,res)=>{
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
                _id : req.query.target
            };
            let folder = `users-data/${authData.id}/images/`;
            dbQuery.select({
                collection : mediaModel,
                where,
                keys : '_id,path',
                limit : 1
            }).then(async checkReels => {
                let d1= await copyObject(authData.id,checkReels.path)
                if(d1){
                    res.status(200).json({
                        status : true,
                        message : '',
                        data : {
                            url:d1,
                        }
                    })
                }
            });
        });
}