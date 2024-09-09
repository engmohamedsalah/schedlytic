import bcrypt from "bcryptjs";
import userModel from "./models/userModel";
const templateModal = require("./models/templateModal");
const mediaModel =require("./models/mediaModel")
const {handleError ,updateReqResp , dbQuery , customValidator} = require("./lib/commonLib");
const {uploadLocalFileToS3} = require('./lib/AWS-Actions');
const fs =require("fs")
export default async function handler(req, res) {
    try{
        if(req.method == 'POST'){
            addNewTemplate(req, res);
        }else if(req.method == 'PUT'){
            if(req.body.action=="imageGenrate")
            {
                updateTemplates(req, res);
            }else
            {
                updateTemplate(req, res);
            }
          
        }else if(req.method == 'GET'){
            if(req.query.action=="noauth")
            {
                getTemplate(req, res);
            }else{
                getTemplateList(req, res);
            }
        }else if(req.method == 'DELETE'){
            deleteTemplate(req, res);
        }
    }catch (error){
        handleError(error , 'AuthAPI');
    }
}



let addNewTemplate = (req, res) => {
    customValidator(
    {
        data: req.body,
        keys: {
            title: {
                require: true,
            },
            layout : {
                require : true
            }
        },
    },
    req,
    res,
    async ({authData} = validateResp) => { 
        let {title , data , url,layout , meta,templateId} = req.body;
        
                let insData = {
                    title : title,
                    data :data,
                    tag : url ,
                    layout : layout,
                    userId : authData.id,
                 
                };
                
                if(templateId)
                {
                  let dat =await  dbQuery.select({
                        collection : templateModal,
                        where : {
                            _id : templateId
                        }, 
                        limit : 1, 
                        keys : 'data,bgColor,filter'
                    })
                    
                    insData.data=dat.data
                    if(dat.bgColor)
                    {
                        insData.bgColor=dat.bgColor
                    }
                    if(dat.filter)
                    {
                        insData.filter=dat.filter
                    }
                }
                if(authData.role!="User"){
                    insData.type="templates"
                }
                if(layout=="Custom"){
                    insData.dimenstions=meta;
                }
               let tempdata=await dbQuery.select({
                    collection : templateModal,
                    where :    {title : insData.title, userId : authData.id},
                })
                if(tempdata.length>0)
                {
                    if(authData.role=="User")
                    {
                        res.status(200).json({ 
                            status : true,
                            message : 'Image already exists.',
                            data : {
                                id : ins._id
                            }
                        })
                    }else{
                        res.status(200).json({ 
                            status : true,
                            message : 'Template already exists.',
                            data : {
                                id : ins._id
                            }
                        })
                    }
                }else{
                dbQuery.insert({
                    collection : templateModal,
                    data : insData
                }).then(async(ins) => {

                    if(authData.role=="User")
                    {
                        res.status(200).json({ 
                            status : true,
                            message : 'Image added successfully.',
                            data : {
                                id : ins._id
                            }
                        })
                    }else{
                        res.status(200).json({ 
                            status : true,
                            message : 'Template added successfully.',
                            data : {
                                id : ins._id
                            }
                        })
                    }
                   
                });
            }
    });
};


let updateTemplate = (req, res) => {
    customValidator(
    {
        data: req.body,
        keys: {
            
        },
    },
    req,
    res,
    async ({authData} = validateResp) => { 
        let {target,data} = req.body;
    
        dbQuery.select({
            collection : templateModal,
            where : {
                _id : target
            }, 
            limit : 1, 
        }).then(async checkUser => {
            if(!checkUser){
                res.status(401).json({ 
                    status : 0,
                    message : 'Template not found.'
                })
            }else{
                dbQuery.update({
                    collection : templateModal,
                    data : data,
                    where : {
                        _id : target
                    },
                    limit : 1
                }).then(ins => {
                    if(authData.role=="User")
                    {
                        res.status(200).json({ 
                            status : true,
                            message : 'Image updated sucessfully.',
                        })
                    }else{
                        res.status(200).json({ 
                            status : true,
                            message : 'Template updated sucessfully.',
                        })
                    }
                 
                });
            }
            
        });
    });
};


let getTemplateList = (req, res) => {
    try{
    customValidator(
    {data: req.query},
    req,
    res,
    async ({authData} = validateResp) => {

        let {keys , page , limit , keyword, sort,target,type} = req.query,
        where = {}; 

        if(authData.role == 'User'){
            where.userId =  authData.id;
        }else{
            where.type  =  "templates";
        }
        if(type){
            where.type  =  type;
            where.status  =  1;
            delete  where.userId
        }
        if(keyword && keyword.trim() != ''){
            where["$or"] = [
                    {'title' : { $regex : new RegExp(keyword, "i")},},
                ]
        }
        if(target){
            where._id=target
            limit=1
            page=1
        }

        dbQuery.select({
            collection : templateModal,
            where, 
            limit,
            keys,
            page, 
            sort
        }).then(async posts => {
            let count =  limit == 1 ? 1 : await dbQuery.count({
                collection : templateModal,
                where,
            });
            res.status(200).json({ 
                status : true,
                message : '',
                data : posts,
                totalRecords : count,
                fetchedRecords : limit == 1 ? 1 : posts.length
            })
        });
    })
}
catch(e){
    handleError('Something went Wrong ');  
}
}


let deleteTemplate=(req,res)=>{
    customValidator(
        {
            data: req.query,
            keys: {
                target: {
                    require: true,
                }
            },
        },
        req,
        res,
        async ({authData} = validateResp) => { 
            let { target ,keys} = req.query;
            dbQuery.select({
                collection : templateModal,
                where : {
                    _id : target
                }, 
                limit : 1, 
            }).then(async checkUser => {
                if(!checkUser){
                    res.status(401).json({ 
                        status : 0,
                        message : 'Template not exist.'
                    })
                }else{
                    
                        dbQuery.delete({
                            collection : templateModal,
                            where : {
                                _id : target
                            },
                            limit : 1
                        }).then(ins => {

                            if(authData.role=="User")
                            {
                                res.status(200).json({ 
                                    status : true,
                                    message : 'Image deleted sucessfully.',
                                })
                            }else{
                                res.status(200).json({ 
                                    status : true,
                                    message : 'Template deleted sucessfully.',
                                })
                            }
                          
                        });
                }
                
            });
        });
}

let updateTemplates = (req, res) => {
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

        let {target,filter} = req.body;
        
            let where={
                _id : target
            }
            let data =  await dbQuery.select({
                collection : templateModal,
                where : where, 
                limit :1,
            })
            if(data)
            {
                let insData = {
                    title : req.body.title,
                    data : req.body.data,
                    layout : req.body.layout,
                    filter : filter
                };
                if(req.body.data){
                    
                }
                if(req.body.dimenstions){
                    insData.dimenstions=req.body.dimenstions
                }
                if(req.body.publish && authData.role!="User")
                {
                    insData.publish=1
                }
                if(req.body.bgColor)
                {
                    insData.bgColor=req.body.bgColor
                }
               let d1= await dbQuery.update({
                    collection : templateModal,
                    where : where, 
                    data : insData,
                    limit :1,
                })
                if(req.body.publish && authData.role=="User")
                {

                }else{

                    if(authData.role=="User")
                    {
                        res.status(200).json({ 
                            status : true,
                            message : 'Image updated sucessfully.',
                        })
                    }else{
                        res.status(200).json({ 
                            status : true,
                            message : 'Template updated sucessfully.',
                        })
                    }
                   
                }
               
                genrateImage(req.body.dimenstions,target,authData,req.body.publish ?  req.body.publish : null ,res)
            }else{
                handleError('Template not found '); 
            }
       
    })
} catch(err) {
} 
}

let detectOs=()=>{
    let os =process.platform
    if(os == "win32"){
        return 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    } else {
            return '/usr/bin/chromium-browser'
    }

}

let genrateImage=async(meta,target,userData ,publish=null ,res)=>{
    try{
    const puppeteer = require('puppeteer'); 
    let url=process.env.LIVE_URL
    let openUrl =  url+`/create_image/${target}`;
    let puppOpt = {
        args: ["--no-sandbox"],
        viewPort: {
            width:parseInt(meta.width),
            height:parseInt(meta.height),
        }
    };
        let expath=detectOs()
        puppOpt.executablePath = expath;
        puppOpt.headless = true;
        puppOpt.env= {
            DISPLAY: ':0',
          }
        const browser = await puppeteer.launch(puppOpt);  
        let page = await browser.newPage(); 
        let frame=false
        page.on("console", async (msg) => {
            for (let i = 0; i < msg.args().length; ++i) {
                let rawLog = await msg.args()[i].jsonValue(),
                logType = rawLog?.type || '';

                if(rawLog=="EditorReady")
                {
                    setTimeout(async() => {
                        if(frame==false)
                        {
                       let fileName = `${target}_${Date.now()}_thumb.png`;
                       let dir=__dirname.split("\\").join("/").replace("/.next/server","/src");
                       let path = `${dir}/thumb/${fileName}`;
                       await page.screenshot({  
                            path: path,
                            fullPage: false,
                            omitBackground : true,
                            clip: {
                                x:0,
                                y: 0,
                                width :parseInt(meta.width),
                                height : parseInt(meta.height),
                            },
                        });
                        frame=true
                        let fileKey = `users-data/${userData.id}/${fileName}`
                        try{
                        uploadLocalFileToS3({
                            Key: fileKey, 
                            Body: path,
                            ContentType: "image/png",
                        }).then(async (uplData) => {
                        let d1= await dbQuery.update({
                                collection : templateModal,
                                where : {
                                    _id : target
                                }, 
                                data : {
                                    url : uplData.key
                                },
                                limit :1,
                                })
                               
                        fs.unlinkSync(path);
                        if(userData.role=="User")
                        {
                            let d1= await dbQuery.select({
                                collection : mediaModel,
                                where : {
                                    templateId : target,
                                    userId : userData.id
                                }, 
                               
                                limit :1,
                                })

                            if(d1)
                            {
                             let d2= await dbQuery.update({
                                    collection : mediaModel,
                                    where : {
                                        templateId : target,
                                        userId : userData.id
                                    }, 
                                    data :{
                                        path : uplData.key,
                                        meta : meta,
                                    },
                                   
                                    limit :1,
                                    })

                            }else{
                                let insData = {
                                    title : fileName,
                                    path : uplData.key,
                                    tags : "",
                                    type : "image",
                                    meta : meta,
                                    userId : userData.id,
                                    templateId : target,
                                }
                                await dbQuery.insert({
                                    collection : mediaModel,
                                    data : insData 
                                })
                            }

                            if(publish && userData.role=="User")
                            {
                                res.status(200).json({ 
                                    status : true,
                                    message : 'Image updated sucessfully.',
                                    url : uplData.key
                                })
                            }
                        }
                        },(e)=>{
                            fs.unlinkSync(path);
                            res.status(401).json({ 
                                status : false,
                                message : e.message,
                            })
                        })
                         }
                         catch(e){

                            res.status(401).json({ 
                                status : false,
                                message : e,
                            })
                         }
                        }
                      
                    }, 3000);
                }
            }
        })

        await page.setViewport({  width :parseInt(meta.width), height:parseInt(meta.height)});
        await page.goto(openUrl);

        let t = setInterval(() => {
            if(frame){
                page.close();
                browser.close();
                clearInterval(t);
            }
            
        }, 200);
    }catch(e){
        res.status(401).json({ 
            status : false,
            message : e,
        })
    }
    }


  
  
  
let getTemplate =(req,res)=>{
            let {target} = req.query,
            where = {}; 
             let  limit=1;
            
           
            if(target){
                where._id=target
            }
    
            dbQuery.select({
                collection : templateModal,
                where, 
                limit,
           
            }).then(async posts => {
               
                res.status(200).json({ 
                    status : true,
                    message : '',
                    data : posts,
                })
            });
  }
  
  



