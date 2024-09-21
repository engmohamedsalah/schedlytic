import bcrypt from "bcryptjs";
import userModel from "./models/userModel";
import socialAccount from "./models/socialAccount";
import { Instagram } from "react-content-loader";
import pinterest from "../social/pinterest";
const postModel = require("./models/postModel");
const {handleError ,updateReqResp , dbQuery , customValidator} = require("./lib/commonLib");
const fs=require("fs")

var axios = require("axios");

export default async function handler(req, res) {
    try{
        if(req.method == 'POST'){
         if (req.body.type == "facebook" || req.body.type == "instagram") {
           addfacebooktoken(req, res);
         } else {
           if(req.body.type=="linkedin")
           {
           addlinkedintoken(req, res);
           }
           else
           {
            if(req.body.type=="twitter")
            {
            addtwittertoken(req, res);
            }
			else
			{
			if(req.body.type=="pinterest")
            {
            addtwittertoken(req, res);
            }
			}
           }
         }
        }else
        {
         
				if(req.method == "DELETE") {
					deleteSocial(req, res);
				  }
			
        }
        
        
    }catch (error){
        handleError(error , 'AuthAPI');
    }
}

let addfacebooktoken = (req, res) => {
    customValidator(
        {
            data: req.body,
            keys: {},
        },
        req,
        res,
        async ({authData} = validateResp) => { 
            dbQuery.select({
                collection : userModel,
                where : {
                    _id : authData.id
                }, 
                limit : 1, 
            }).then(async checkUser => {
                if(!checkUser){
                    res.status(401).json({ 
                        status : 0,
                        message : 'User not exist.'
                    })
                }else{
					let account = await dbQuery.select({
                        collection : socialAccount,
                        where : {
							userId : authData.id,
							"data.id": req.body.data.id,
							type : req.body.type
						},
                        limit : 1
                    })
					let updData={
						[req.body.type] : req.body.data
					}
					if(account)
					{
						dbQuery.update({
							collection : socialAccount,
							data : {
								data : req.body.data
							},
							where : {
								_id : account.id,
								type : req.body.type,
							},
							limit : 1
						}).then(ins => {
							res.status(200).json({ 
								status : true,
								message : 'Social account updated successfully.'
							})
						});
					}
					else
					{
						dbQuery.insert({
							collection : socialAccount,
							data : {
								userId : authData.id,
								type : req.body.type,
								data : req.body.data
							},
						}).then(ins => {
							res.status(200).json({ 
								status : true,
								message : 'Social account added successfully.'
							})
						});
					}
                  
                }
                
            });
        });
};


let addlinkedintoken =(req,res)=>{
      customValidator(
        {
            data: req.body,
            keys: {},
        },
        req,
        res,
        async  ({authData} = validateResp) => {

            let userID = authData.id;
            let code = req.body.code;
            let data ={
				client_id: process.env.LINKEDIN_CLIENT_ID,
				client_secret: process.env.LINKEDIN_SECRET_KEY,
				redirect_uri: `${req.body.redirect_uri}`,
				code: code,
				grant_type: "authorization_code",
			}
			const encodedData = Object.keys(data)
			.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
			.join('&');
            let options = {
                method: "POST",
                url: "https://www.linkedin.com/oauth/v2/accessToken",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                data:encodedData,
            };
          
            let response=await axios(options)
    
                let data1 = response.data
                var options1 = {
                    method: "GET",
                    url: "https://api.linkedin.com/v2/userinfo",
                    headers: {
                        Authorization: `Bearer ${data1.access_token}`,
                    },
                };
				let response1=await axios(options1)
                    let lr = response1.data
                    data1.id = lr.sub;
                    data1.name =lr.name;
					data1.email=lr.email
					data1.profile_image=lr.picture
					let account = await dbQuery.select({
						collection : socialAccount,
						where : {
							userId : authData.id,
							"data.id":data1.id,
							type : req.body.type
						},
						limit : 1
					})
					if(account)
					{
						dbQuery.update({
							collection : socialAccount,
							data : {
								data : data1
							},
							where : {
								_id : account.id,
								type : req.body.type,
							},
							limit : 1
						}).then(ins => {
							res.status(200).json({ 
								status : true,
								message : 'Social account updated successfully.'
							})
						});
					}
					else
					{
						dbQuery.insert({
							collection : socialAccount,
							data : {
								userId : authData.id,
								type : req.body.type,
								data : data1
							},
						}).then(ins => {
							res.status(200).json({ 
								status : true,
								message : 'Social account added successfully.'
							})
						});
					}
                    
            
           
        }
    );
}




let addtwittertoken =(req,res)=>{
    try{
        customValidator(
			{
				data: req.body,
				keys: {},
			},
			req,
			res,
			async  ({authData} = validateResp) => {
				let userID = authData.id;
				let account = await dbQuery.select({
					collection : socialAccount,
					where : {
						userId : authData.id,
						"data.id": req.body.data.id,
						type : req.body.type
					},
					limit : 1
				})
				if(account)
				{
					dbQuery.update({
						collection : socialAccount,
						data : {
							data : req.body.data
						},
						where : {
							_id : account.id,
							type : req.body.type,
						},
						limit : 1
					}).then(ins => {
						res.status(200).json({ 
							status : true,
							message : 'Social account updated successfully.'
						})
					});
				}
				else
				{
					dbQuery.insert({
						collection : socialAccount,
						data : {
							userId : authData.id,
							type : req.body.type,
							data : req.body.data
						},
					}).then(ins => {
						res.status(200).json({ 
							status : true,
							message : 'Social Account added successfully.'
						})
					});
				}
			}
		);
    }
    catch(e)
    {

    }
}


let deleteSocial =async(req,res)=>{
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
		async ({ authData } = validateResp) => {
		  let { target } = req.query;
		  dbQuery
			.select({
			  collection: socialAccount,
			  where: {
				_id: target,
			  },
			  limit: 1,
			})
			.then(async (checkUser) => {
			  if (!checkUser) {
				res.status(401).json({
				  status: 0,
				  message: "Social account  not found.",
				});
			  } else {
				dbQuery
				  .delete({
					collection: socialAccount,
					where: {
					  _id: target,
					},
					limit: 1,
				  })
				  .then((ins) => {
					res.status(200).json({
					  status: true,
					  message: "Social account updated successfully.",
					});
				  });
			  }
			});
		}
	  );
}