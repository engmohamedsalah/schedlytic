import bcrypt from "bcryptjs";
import templateModal from "./models/templateModal";
import postModel from "./models/postModel";
const userModel = require("./models/userModel");
const serviceModel = require("./models/serviceModel");
const {handleError ,updateReqResp , dbQuery , customValidator} = require("./lib/commonLib");
const { sendMail} = require("./lib/commonLib");
const mongoose  = require('mongoose');
const paymentCredentialModel = require("./models/paymentCredentialModel");
const axios = require('axios');
const nodemailer = require("nodemailer")
export default async function handler(req, res) {
    try{
        if(req.method == 'POST'){
            if(req.body.action=="sendEmail")
            {
                sendEmailToAll(req,res)
            }
          else if(req.body.action=="saveSmtp"){
                saveSmtpDetails(req,res)
          }else
            {
                addNewUser(req, res);
            }
        }else if(req.method == 'PUT'){
            updateUsersList(req, res);
        }else if(req.method == 'GET'){
            if(req.query.action=="user_analytics")
            {
                userAnalytics(req, res);
            }else{
                if(req.query.action =='smtp')
                {
                    getSmtp(req, res);
                }else{
                    getUsersList(req, res);
                }
                
            }
        }else if(req.method == 'DELETE'){
            deleteUser(req, res);
        }
    }catch (error){
        handleError(error , 'AuthAPI');
    }
}



let addNewUser = (req, res) => {
    try{
    customValidator(
    {
        data: req.body,
        keys: {
            name: {
                require: true,
            },
            email: {
                require: true,
                validate: "email",
            },
            password: {
                require: true,
            },
            plan: {
                require: true,
            },
           
        },
    },
    req,
    res,
    async ({authData} = validateResp) => { 
        let {name , email , password,role,lastname,plan} = req.body;
        dbQuery.select({
            collection : userModel,
            where : {
                email
            }, 
            limit : 1, 
            keys : '_id'
        }).then(async checkUser => {
            if(checkUser){
                res.status(401).json({ 
                    status : 0,
                    message : 'Email is already exist with us, please try with another email.'
                })
                return
            }else{
                let insData = {
                    name, 
                    email : email.toLowerCase(), 
                    password : await bcrypt.hash(password, 5),
                    status : 1,
                    source : 'Manually',
                    lastname : lastname,
                    planId : plan , 

                };
                if(role)
                {
                    insData.role=role
                }

                if(authData.role == 'User'){
                    insData.parentId = authData.id;
                }

                dbQuery.insert({
                    collection : userModel,
                    data : insData
                }).then(async(ins) => {
                    
                    let html=`<div style="max-width: 600px ;
                    padding:25px;background-color: #f6f6ff;
                    border-radius: 30px; 
                    margin: 0 auto;
                    border-radius: 10px; 
                    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); 
                    font-size: 15px;
                    line-height: 25px;
                    color: #29325f;
                    font-weight: 400;">
                        <div style="text-align: center;">
                            <h3 style="margin-top: 5px; color: #29325f;">${process.env.SITE_TITLE}</h3>
                        </div>
                        <p> Hi <span style="color: ff776b;"><b> ${name} ${lastname},</b></span>  <br />
                    
                    
                            Welcome to ${process.env.SITE_TITLE}. Your account is created by ${process.env.SITE_TITLE}, <br/> You can login to your account using following details:<br/><br/>
                    
                             <b>Login URL: </b> ${process.env.LIVE_URL} <br/>
                    
                             <b>Email : </b>${email.toLowerCase()} <br/>
                            
                             <b>Password :</b>  ${password}<br />
                    
                        </p>
                        <div style="background:#ffffff ; padding: 15px 20px; border-radius: 20px;font-size: 14px;
                        line-height: 25px;
                        color: #8386a5;
                        font-weight: 400;"><span> Thank you for being a loyal customer : <b>The ${process.env.SITE_TITLE} Team</b></span></div>
                    </div>`
                    let mailData={
                        from : process.env.MANDRILL_EMAIL,
                        to :  email.toLowerCase(),
                        subject : "Welcome",
                        htmlbody : html
                     };

                     let data =await dbQuery.select({
                        collection : serviceModel,
                        where : {type : "smtp"},
                        limit : 1,
                    })
                    if(data){
                        let d1= {
                            to :  email.toLowerCase(),
                            subject : "Welcome",
                            ...data.data, 
                            htmlbody : html
                        }
                        await sendMail(d1)
                    }else{
                        try{
                        await sendMail(mailData,"service")
                        }
                        catch(e)
                        {
                            res.status(401).json({ 
                                status : false,
                                message : 'Your Mandrill API key is incorrect. We are unable to send an email to the registered user.'
                            })  
                        }
                    }
                   

                    res.status(200).json({ 
                        status : true,
                        message : 'User added successfully.'
                    })
                });
            }
            
        });
    });
}
catch(e){
}
};

const createToken = async () => {
  
    try {
      const response = await axios.post(
        `${process.env.PAYPAL_URL}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(process.env.PAYPAL_CLIENT_ID+":"+process.env.PAYPAL_SECRET_KEY).toString('base64')}`,
          },
        }
      );
      const accessToken = response.data.access_token;
      return accessToken;
    } catch (error) {
      // Handle errors here
      throw error;
    }
  };

let updateUsersList = (req, res) => {
    customValidator(
    {
        data: req.body,
        keys: {
            target: {
                require: true,
            },
            name: {
                require: true,
            },
            email: {
                require: true,
                validate: "email",
            },
            plan : {
                require : true 
            }
      
        },
    },
    req,
    res,
    async ({authData} = validateResp) => { 
        let {name,lastname, email, contactNumber, password, status, target, role,plan } = req.body;
        dbQuery.select({
            collection : userModel,
            where : {
                _id : target
            }, 
            limit : 1, 
            keys : '_id,planId,invoice_id,paymenttype,customerId,subscription'
        }).then(async checkUser => {
            if(!checkUser){
                res.status(401).json({ 
                    status : 0,
                    message : 'User not exist.'
                })
            }else{
                let updData = {
                    name,  
                    status,
                    contactNumber,
                    lastname, 
                    role,
                    planId : plan
                };

                if(password){
                    updData.password = await bcrypt.hash(password, 5);
                }
                if(checkUser.planId!=plan && checkUser.invoice_id &&  checkUser.paymenttype=="paypal"){
                    const token = await createToken();
                    if(token){
                        const response = await axios.post(
                            `${process.env.PAYPAL_URL}/v1/billing/subscriptions/${checkUser.invoice_id}/revise`,
                            {
                                "plan_id": plan
                            },
                            {
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization:"Bearer " + token,
                              },
                            }
                          );
       
                          if(response.data){
                            dbQuery.update({
                                collection : userModel,
                                data : updData,
                                where : {
                                    _id : target
                                },
                                limit : 1
                            }).then(ins => {
                             
                                    res.status(200).json({ 
                                        status : true,
                                        message : 'User updated successfully.',
                                        data : ins
                                    })
                                
                               
                            });
                          }
                    }else{
                        res.status(401).json({ 
                            status : false,
                            message : 'Token validation fail.',
                          
                        })
                    }
                   
                }else if(checkUser.planId!=plan && checkUser.invoice_id &&  checkUser.paymenttype=="stripe"){
                    let account=await dbQuery.select({
                        collection: paymentCredentialModel,
                        where: {
                          type : "stripe"
                        },
                        limit : 1
                      });
                const stripe = require('stripe')(account.secret_key);
               const currentSubscription = await stripe.subscriptions.retrieve(checkUser.subscription);
                let subscriptionId=   currentSubscription.items.data.find((d1)=>d1.plan.id==checkUser.planId)
                const updatedSubscription = await stripe.subscriptions.update(checkUser.subscription, {
                    items: [{
                      id: subscriptionId.id,
                      price: plan,
                    }],
                  });
                updData.invoice_id=updatedSubscription.latest_invoice
                let invoicedata={
                    id : updatedSubscription.latest_invoice,
                    plan_id: plan,
                    type : transpilePackages,
                }
                let inv=await dbQuery.insert({
                    collection: invoiceModel,
                    data: invoicedata,
                  });
                  if(inv){
                    if(updatedSubscription){
                        dbQuery.update({
                            collection : userModel,
                            data : updData,
                            where : {
                                _id : target
                            },
                            limit : 1
                        }).then((ins) => {
                            
                            if(req.body.action=="status")
                            {
                                res.status(200).json({ 
                                    status : true,
                                    message : 'User status updated successfully',
                                    data : ins
                                })
                            }else{
                                res.status(200).json({ 
                                    status : true,
                                    message : 'User updated successfully.',
                                    data : ins
                                })
                            }
                           
                        });
                      }
                  }
                 
                }
                else{
                    dbQuery.update({
                        collection : userModel,
                        data : updData,
                        where : {
                            _id : target
                        },
                        limit : 1
                    }).then(ins => {
                        if(req.body.action=="status")
                        {
                            res.status(200).json({ 
                                status : true,
                                message : 'User status updated successfully',
                                data : ins
                            })
                        }else{
                            res.status(200).json({ 
                                status : true,
                                message : 'User updated successfully.',
                                data : ins
                            })
                        }
                       
                    });
                }

              
            }
            
        });
    });
};


let getUsersList = (req, res) => {
    customValidator(
    { },
    req,
    res,
    async ({authData} = validateResp) => {

        let {keys , page , limit , keyword, sort } = req.query,
        where = {}; 

        if(authData.role == 'User'){
            where.parentId =  authData.id;
        }else{
            where.role= {$ne: "Admin"}
        }

        if(keyword && keyword.trim() != ''){
            where['$or'] = [
                    {'name' : { $regex : new RegExp(keyword, "i")},},
                    {'email' : { $regex : new RegExp(keyword, "i")}},
                ]
        }

        dbQuery.select({
            collection : userModel,
            where, 
            limit,
            keys,
            page, 
            sort
        }).then(async users => {
            let count =  limit == 1 ? 1 : await dbQuery.count({
                collection : userModel,
                where,
            });
            res.status(200).json({ 
                status : true,
                message : '',
                data : users,
                totalRecords : count,
                fetchedRecords : limit == 1 ? 1 : users.length
            })
        });
    })
}



let deleteUser = (req, res) => {
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
        let { target } = req.query;
        dbQuery.select({
            collection : userModel,
            where : {
                _id : target
            }, 
            limit : 1, 
            keys : '_id'
        }).then(async checkUser => {
            if(!checkUser){
                res.status(401).json({ 
                    status : 0,
                    message : 'User not found.'
                })
            }else{

                dbQuery.delete({
                    collection : userModel,
                    where : {
                        _id : target
                    },
                    limit : 1
                }).then(ins => {
                    res.status(200).json({ 
                        status : true,
                        message : 'User deleted successfully.'
                    })
                });
            }
            
        });
    });
};


let sendEmailToAll= (req,res)=>{
    customValidator(
        { },
        req,
        res,
        async ({authData} = validateResp) => {
    
            let {contain,list} = req.body,
            where = {}; 
            if(list)
            {
                where["$in"]=list
            }
    
            dbQuery.select({
                collection : userModel,
                where, 
                keys : "name,email"
            }).then(async users => {

                for(let i=0;i<users.length;i++)
                {
            let mailData={
                        from : "noreply@plannero.io",
                        to : users[i].email,
                        subject : "Reset Password",
                        htmlbody : `<h1>Dear ${users[i].email},
                        ${contain}
                        .</h1>`
                     };
                    let d1=await sendMail(mailData,"service")
                }

                res.status(200).json({ 
                    status : true,
                    message : '',
                    data : users,
                })
            });
        })
}


let userAnalytics=(req,res)=>{
    customValidator(
        { },
        req,
        res,
        async ({authData} = validateResp) => {
    
            let {keys , page , limit , keyword, sort,target } = req.query,
            where = {}; 
            where._id = target;

            let data ={}


            let userdata =await dbQuery.select({
                collection : userModel,
                where, 
                limit :1,
                keys,
                page, 
                sort
            })
            let posts = await dbQuery.select({
                collection : postModel,
                where : {userId :target}, 
                limit :5,
                sort
            })

            let postbysocialmedia=await dbQuery.aggregate({
                collection : postModel,
                aggregateCnd : [
                    {
                    $match: {
                      "userId": new mongoose.Types.ObjectId(target)
                    }
                  },
                  {
                    $unwind: "$socialMediaAccounts"
                  },
                  {
                    $group: {
                      _id: {plateform:"$socialMediaAccounts.type",
                          status : "$status",
                      },
                      count: { $sum: 1 }
                    }
                  },
                  {
                    $project: {
                      _id: 0,
                      socialMedia: "$_id",
                      count: 1
                    }
                  }
                ]
            })
            let pending =   await dbQuery.count({
                collection : postModel,
                where :{userId :target ,status : "pending"},
            });
    
            let published= await dbQuery.count({
                collection : postModel,
                where :{userId :target ,status : "Sucess"},
            });
    
          
    
            let data1= {
                pending: pending,
                published: published,
        
            }
            let socialDetail=[]
            postbysocialmedia.map((d1)=>{
                socialDetail.push(
                {count : d1.count,
                ...d1.socialMedia
                })
            })
            data.userDetails=userdata
            data.posts=posts
            data.socialMedia=socialDetail
            data.postrate=data1
                res.status(200).json({ 
                    status : true,
                    message : '',
                    data : data,
                })
        })
}

const saveSmtpDetails =(req,res)=>{
    customValidator(
        {
            data: req.body,
            keys: {
                name: {
                    require: true,
                },
                email: {
                    require: true,
                    validate: "email",
                },
                hostname : {
                    require: true,
                },
                port : {
                    require: true,
                },
                username : {
                    require: true,
                },
                password : {
                    require: true,
                },
    
            }
        },
        req,
        res,
        async ({authData} = validateResp) => {
        try{
            let {name,email,hostname,port,username,password}=req.body;
         
            let transporter = nodemailer.createTransport({
              host:hostname,
              port: port,
              secure: false, // true for 465, false for other ports
              auth: {
                user: username, // generated ethereal user
                pass: password, // generated ethereal password
              },
            });
    
            // send mail with defined transport object
            let info = await transporter.sendMail({
              from : email ,
              to : email , // list of receivers
              subject: "Test Email", // Subject line
              html: "<b>your details is saved </b>", // html body
            });
            let body={
                name:req.body.name,
                email:req.body.email,
                hostname:req.body.hostname,
                port:req.body.port,
                username:req.body.username,
                password:req.body.password,
            }

            if(info.messageId)
            {
                let data = await dbQuery.select({
                    collection : serviceModel,
                    data : {
                        type : "smtp",
                    }
                })
                if(data.length>0){
                    dbQuery.update({
                        collection : serviceModel,
                        data : body,
                        where : {
                            type : "smtp",
                        },
                        limit : 1
                    }).then(async(ins) => {
                        res.status(200).json({ 
                            status : true,
                            message : 'Smtp details updated succesfully.',
                            data : {},
                        })
                    })
                }else{
                    dbQuery.insert({
                        collection : serviceModel,
                        data : {
                            data :body,
                            type : "smtp",
                        }
                    }).then(async(ins) => {
                        res.status(200).json({ 
                            status : true,
                            message : 'Smtp details added succesfully.',
                            data : {},
                        })
                    })
                }
                
            }
            else {
                res.status(401).json({ 
                    status : false,
                    message : 'Invalid data.',
                })

            }
            
        }catch(error){
            res.status(401).json({ 
                status : false,
                message : '',
                data : error,
            })
        }
               
    });
}


const getSmtp=(req,res)=>{
    customValidator(
        {
            data: req.query,
            keys: {
              
    
            }
        },
        req,
        res,
        async ({authData} = validateResp) => {
        try{
            let data = await dbQuery.select({
                collection : serviceModel,
                data : {
                    type : "smtp",
                },
                limit : 1,
            })
            res.status(200).json({
                data : data ,
                status : true,
                message : '',
            })
        }catch(error){
            res.status(401).json({ 
                status : false,
                message : '',
                data : error,
            })
        }
               
    });
}