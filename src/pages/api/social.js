import bcrypt from "bcryptjs";
import userModel from "./models/userModel";
import socialAccount from "./models/socialAccount";
import { Instagram } from "react-content-loader";
import pinterest from "../social/pinterest";
const postModel = require("./models/postModel");
const {handleError ,updateReqResp , dbQuery , customValidator} = require("./lib/commonLib");
const fs=require("fs")
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
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
        }
		else
        {
         
				if(req.method == "DELETE") {
					deleteSocial(req, res);
				  }else{
					if(req.method == "GET") {
						if(req.query.action=="getGoogleLink")
							{
								getGoogleLink(req, res);
							}else{
								addgoogletoken(req,res)
							}
					}
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
			console.log('req.body',req.body)
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
					console.log({checkUser},"1st")
                }else{
					let account = await dbQuery.select({
                        collection : socialAccount,
                        where : {
							userId : authData.id,
							"data.id": req.body.data,
							type : req.body.type,
				
						},
                        limit : 1
                    })
					console.log({account},"2nd")
					let updData={
						[req.body.type] : req.body.data
					}
					if(account)
					{
						dbQuery.update({
							collection : socialAccount,
							data : {
								data : req.body.data,
								updateDate : new Date()
							},
							where : {
								_id : account.id,
								type : req.body.type,
							},
							limit : 1
						}).then(ins => {
							return res.status(200).json({ status : true,message : 'Social account updated successfully.',data:req.body.data})
							
				
						});
					}
					else
					{
						console.log('req.body.data',req.body.data);
						console.log('req.body.type',req.body.type)
						dbQuery.insert({
							collection : socialAccount,
							data : {
								userId : authData.id,
								type : req.body.type,
								data : req.body.data,
								updateDate : new Date(),
							},
						}).then(ins => {
							res.status(200).json({ 
								status : true,
								message : 'Social account added successfully.',data:req.body.data
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
								data : data1,
								updateDate : new Date(),
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
								data : data1,
								updateDate : new Date(),
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
				console.log('account',account)
				if(account)
				{
					dbQuery.update({
						collection : socialAccount,
						data : {
							data : req.body.data,
							updateDate : new Date(),
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
							data : req.body.data,
							updateDate : new Date(),
						},
					}).then(ins => {
						res.status(200).json({ 
							status : true,
							message : 'Social Account added successfully.',ins
						})
						console.log('ins',ins)
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

let getGoogleLink =async(req,res)=>{
	customValidator(
		{
			data: req.body,
			keys: {},
		},
		req,
		res,
		async  ({authData} = validateResp) => {
			let userID = authData.id;
	const defaultScope = [
		'https://www.googleapis.com/auth/userinfo.email',
		'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/userinfo.profile'
	];
	let oAuth2Client = new OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET,     process.env.LIVE_URL+process.env.GOOGLE_REDIRECT_URIS);
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		prompt: 'consent',
		scope: defaultScope,
		state: userID
	});

	res.json({
		status: true,
		data: {
			url : authUrl 
		}
	});
})
}


let addgoogletoken=async(req,res)=>{
	try {
     

            let oAuth2Client = new OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET,     process.env.LIVE_URL+process.env.GOOGLE_REDIRECT_URIS);
            const { code, state } = req.query ; 
            var profileDetails ;
            if(code) {
                // after authentication user get access token and refresh token.
                oAuth2Client.getToken( code, async function(err, tokens){
                    if(err) throw err;
                    oAuth2Client.setCredentials({access_token: tokens.access_token}); 
                    var oauth2 = google.oauth2({
                        auth: oAuth2Client,
                        version: 'v2'
                    });
    
                    let proData = await oauth2.userinfo.get();
					console.log({proData})
                    let  profileDetails = proData?.data || {}
                    let accountId = profileDetails?.id || profileDetails?.email;
					profileDetails={
						...profileDetails,
						accessToken : tokens.access_token,
						refreshToken : tokens.refresh_token,
					}
					let account = await dbQuery.select({
						collection : socialAccount,
						where : {
							userId : state,
							"data.id": accountId,
							type : "youtube"
						},
						limit : 1
					})
					if(account)
					{
						dbQuery.update({
							collection : socialAccount,
							data : {
								data : profileDetails,
								updateDate : new Date(),
							},
							where : {
								_id : account.id,
								type : "youtube",
							},
							limit : 1
						}).then(ins => {
							res.writeHeader(200, {"Content-Type": "text/html"}).write(`<p>Your account is updated successfully. You can close this window and continue.</p>`);
						});
					}
					else
					{
						dbQuery.insert({
							collection : socialAccount,
							data : {
								userId :state,
								type : "youtube",
								data : profileDetails,
								updateDate : new Date(),
							},
						}).then(ins => {
							res.writeHeader(200, {"Content-Type": "text/html"}).write(`<p>Your account is connected successfully. You can close this window and continue.</p>`);
						});
					}
					
                    
                });
            }
     
    } catch(err) {
        res.json({ status: false, message: err.message });
    }
}