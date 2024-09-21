
const { handleError } = require("./commonLib"); 
const multer = require('multer');
const fs = require('fs');
const path = require("path");
var aws = require('aws-sdk')
require("aws-sdk/lib/maintenance_mode_message").suppress = true;

let AWSConfig = {
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    accessKeyId: process.env.ACCESS_KEY_ID,
    region: process.env.REGION,
};


var ASWs3 = new aws.S3({...AWSConfig});

let awsFunctionObj = {
    multerMiddleWare :  (params) => {
        return multer({
            fileFilter: function (req, file, callback) { 
                var ext = path.extname(file.originalname);
                if('fileType' in params) {
                    let fileExtAry = params.fileType.split(', ');
                    

                    if(file.originalname.split('-thumb').length){
                        fileExtAry.push('.png');
                    }
                     ext = ext.toLowerCase(); 
                    if(!fileExtAry.includes(ext)){
                        return callback(new Error(`Only ${params.fileType} ${fileExtAry.length > 1?'are':'is'} allowed.`))
                    }
                }
                callback(null, true)
            },
        }).any();
    },

    uploadFormFileToS3 : ({files , folder}) => {
        return new Promise(async (resolve, reject) => {
            try {
                if(files && files.length){
                    let newFilesData = [];
             
                    for(let file of files){
                        let ext = path.extname(file.originalname),
                        fileKey = `${folder}/`+(Date.now().toString())+ext;

                        await awsFunctionObj.uploadLocalFileToS3({
                            Key: fileKey, 
                            Body: file.buffer,
                            ContentType: file.mimetype,
                        }).then(async (uplData) => {
                            delete file.buffer;
                            newFilesData.push({
                                ...file,
                                ...uplData
                            });
                        }).catch(error => {
                            reject(error);
                        })
                    }

                    resolve(newFilesData);
                }else{
                    reject('Please choose any file to upload.');
                }
            } catch(err){
                reject(err);
            }            
        });
        
    },
    uploadLocalFileToS3 : (params) => { 
    
        return new Promise(async (resolve, reject) => {
            const obj = {
                Bucket: process.env.BUCKET_NAME, 
                Key: params.Key,
                Body: typeof params.Body == 'string' ? fs.readFileSync(params.Body) : params.Body,
                ACL: 'public-read',
                ContentType: params.ContentType
            };
            ASWs3.upload(obj, function(s3Err, data) { 
                if (data) {
                    resolve(data);
                } else {
                    reject(s3Err);
                }
            });
        });        
    },
    removeFileFromS3 : async (params , cb) => {
        if(params.isMultiple){
            let obs = [];
            params.filePath.map((d, i) => {
                if(d != ''){
                    obs.push({
                        Key : d
                    });
                }
            });
                         
            if(obs.length){
                ASWs3.deleteObjects({
                    Bucket: process.env.BUCKET_NAME,
                    Delete: {
                        Quiet: false,
                        Objects: obs
                    }
                },function (err,data){
                    cb(err,data)
                })
            }else{
                cb(null,{});
            }
            
        } else {
            let fileLocation = params.filePath;
            ASWs3.deleteObject({
                Bucket: process.env.BUCKET_NAME,
                Key: fileLocation
            },function (err,data){
                cb(err,data)
            })
        }
        
    },
    sendMail : async (options) => {
        
        let params = {
            Destination: {
                CcAddresses: [
                    options.to,
                 
                ],
                ToAddresses: [
                 
                ],
            },
            ReplyToAddresses: [
              
            ],
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: options.html
                    },
                    Text: {
                        Charset: "UTF-8",
                        Data: ``
                    }
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data:  options.subject
                }
            },
            Source: `${process.env.SITE_NAME} <${process.env.SUPPORT_EMAIL}>`,
        };
        
        let resp =await AWS_SES.sendEmail(params).promise();  
        return resp;
    },
    checkFolderExistOrNot : (folderName , cb) => {
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Prefix: folderName,
            MaxKeys : 1
        };

        s3.listObjectsV2(params, (err, data) => {
            cb(err , data.Contents.length > 0);
        });
    },
    removeS3Folder : (folderName ,callback) => {
        var params = {
            Bucket: process.env.BUCKET_NAME,
            Prefix: folderName, 
        };
        awsFunctionObj.checkFolderExistOrNot(folderName , (error , isExist) => {
            if(error){
                callback(error);
            }else{ 

                if(isExist){ 

                    s3.listObjects(params, function(err, data) {
                        if (err) return callback(err);
                    
                        if (data.Contents.length == 0) callback();
                    
                        params = {Bucket: process.env.BUCKET_NAME};
                        params.Delete = {Objects:[]};
                        
                        data.Contents.forEach(function(content) {
                            params.Delete.Objects.push({Key: content.Key});
                        }); 
                        s3.deleteObjects(params, function(err, data) {
                            if (err) return callback(err);
            
                            if (data.IsTruncated) {
                                emptyBucket(process.env.BUCKET_NAME, callback);
                            } else {
                                callback();
                            }
                        });
                    });
                }else{
                    callback();
                }
            }
        });
        
    },
 
    copyObject : (userId = '' ,copypath) => {
        return new Promise((resolve, reject)=> {
            let ext= copypath.split(".")[1]
            let name =Date.now().toString() + "."+ext
            let url =`users-data/${userId}/images/${name}`
            ASWs3.copyObject({ 
                CopySource: process.env.BUCKET_NAME+ '/'   + copypath,
                Bucket: process.env.BUCKET_NAME,
                Key:url,
                ACL: "public-read"
                }, function(copyErr, copyData){
                 if (copyErr) {
                 } else {
                   resolve(url)
                 } 
              });
        });
    },
    s3Client : ASWs3,
};

module.exports = {
    ...awsFunctionObj
};