const postModel = require("../api/models/postModel")
const socialAccountModel = require("../api/models/socialAccount")
const {
  dbQuery
} = require("./lib/commonLib");
const stream = require('stream');
const https = require("https")
const axios = require("axios");
const process = require('../../../next.config');
const fs = require('fs').promises;
const FormData = require('form-data');
const  path = require("path");
const mongoose  = require('mongoose');



let schedukeCron = async () => {
  let from = new Date(Date.now() - 1000 * 60 * 10);
  let to = new Date();
  let postData = await dbQuery.select({
    collection: postModel,
    where: {
      postDate: {
        $gte: from,
        $lte: to,
      },
      status: "pending",
      type: { $exists: false }
    },
    limit: 1000,
  });
 let arr=[]
 for (let i = 0; i < postData.length; i++) {
   arr.push(postData[i]._id)
}
if(arr.length>0)
{
  await dbQuery.update({
    collection: postModel,
    where: {
      _id: { $in: arr},
      status: "pending",
    },
   data : {status: "processing"}
  })

  for (let i = 0; i < postData.length; i++) {
    await socialPost(postData[i])
  }
}

}

let socialPost = async (data) => {
  try {
    let socialAccounts = data.socialMediaAccounts
    let localurl = null

    if (data.url) {
      localurl = await downloadFile(data.url)
    }
    let errorList={}
    for (let i = 0; i < socialAccounts.length; i++) {

      let datatoken = await dbQuery.select({
        collection: socialAccountModel,
        where: {_id : new mongoose.Types.ObjectId(socialAccounts[i]._id)},
        limit: 1,
      });
      if(!datatoken){
        errorList[type]="Account is not found"
        continue 
      }

      if (socialAccounts[i].type == "facebook") {
          try{
        let findpages=socialAccounts[i].data.facebookPages
        let totalpages=datatoken.data.facebookPages
        let pglist=[]
        findpages.forEach((elements,index)=>{
            let c1=totalpages.find((s1)=>s1.id==elements.id)
            if(c1){
              pglist.push(c1)
              }
        })
        if(pglist.length==0)
          {
            errorList["facebook"]="Pages not found."
            continue
          }
        if (data.url) {
          if (data.posttype == "video") {
            await pageFaceBookUploadVideo(pglist, data, localurl)
          }
          else {
            await pageFaceBookUpload(pglist, data, localurl)
          }
        } else {
          await uploadFacebookTextOnly(pglist, data.text)
        }
      }catch(e){
        errorList["facebook"]=(typeof e === 'object' ? JSON.stringify(e) : e)
      }
      } else {
        if (socialAccounts[i].type == "instagram") {       
          try{                                                                    
          await InstagramUploadPost(datatoken, data, data.posttype)
          }
          catch(e){
            errorList["instagram"]=(typeof e === 'object' ? JSON.stringify(e) : e)
          }
        } else {
          if (socialAccounts[i].type == "linkedin") {
            try{
            if (data.url) {
              if (data.posttype == "video") {
                await linkedInPostVideo(datatoken.data.id, datatoken.data.access_token, data.text, localurl)
              } else {
                await linkedInPost(datatoken.data.id, datatoken.data.access_token, data.text, localurl)
              }
            } else {
              await uploadLinkdinTextOnly(datatoken, data)
            }
          }catch(e){
            errorList["linkedIn"]=(typeof e === 'object' ? JSON.stringify(e) : e)
          }
          }
          else if (data.url && socialAccounts[i].type == "pinterest") {
              try{
                  let id = socialAccounts[i].data?.boardList?.id
                  let list= datatoken.data.boardList

                  let fboard=""
                  if(list)
                    {
                     let board= list.find((d1)=>d1.id==id)
                     if(board){
                      fboard=board
                     }else{
                      errorList["pinterest"]="Board is not found"
                      continue 
                     }
                    }else{
                      errorList["pinterest"]="Board is not found"
                      continue 
                    }
                
              if (data.posttype == "video") {
                await pinterestVideoPost(datatoken, data ,localurl,fboard)
              }else{
                await pinterestPost(datatoken, data,fboard)
              }
            }
            catch(e){
              errorList["pinterest"]=(typeof e === 'object' ? JSON.stringify(e) : e)
            }
              
            } else if(socialAccounts[i].type == "youtube"){
              try{
                await YoutubeVideoUpload(datatoken.data,data,localurl)
              }catch(e){
                console.log({e},"errror")
                errorList["youtube"]=(typeof e === 'object' ? JSON.stringify(e) : e)
              }
              }
          
        }
      }
    }
  
    if(Object.keys(errorList).length>0)
    {
      await dbQuery.update({
        collection: postModel,
        data: { status: "Failed", message:JSON.stringify(errorList)},
        where: {
          _id: data._id,
        },
        limit: 1,
      })
    }else{
      let d1 = await dbQuery.update({
        collection: postModel,
        data: { status: "Sucess" },
        where: {
          _id: data._id,
        },
        limit: 1,
      })
    }
    if(data.url)
    {
       fs.unlink(localurl, (err) => {
        if (err) {
        } else {
        }
      });
    }
 
   
  } catch (e) {
    console.log("errrrrrorr",e)
    await dbQuery.update({
      collection: postModel,
      data: { status: "Failed", message: typeof e == 'object' ? JSON.stringify(e) : e },
      where: {
        _id: data._id,
      },
      limit: 1,
    })
  }
}


const pinterestVideoPost = (data, contain,localurl,board) => {
  return new Promise(async (resolve, reject) => {
    try {
      let refresh_token = data.data.refresh_token
      let scope = data.data.scope.replaceAll(" ", ",");
      let data1 = {
        grant_type: "refresh_token",
        refresh_token: refresh_token,
        scope: scope,
      };
      let getToken = await pinterestRefreshToken(data1);
      let access_token = getToken.access_token;
      let revideo = await registerVideoPinterest(access_token);
      if(revideo){
				let uploadvideo = await uploadVideoPinterest(
					access_token,
					revideo,
					localurl
				);
        if(uploadvideo){
           checkVideoPinUploaded({media_id: revideo.media_id}, access_token).then(async(success)=>{
            if(success)
            {
              let final = await createPin({
                media_id: revideo.media_id,
                board_id: board.id,
                thumb: contain.thumb,
              },
              access_token,
              contain
            );
            if(final){
              resolve()
            }
            }else{
              reject()
            }
           },(e)=>{
            reject(e)
           })
        }
        }
    }
    catch (erro) {
      reject(erro)
    }
  });

};

let uploadVideoPinterest = async (access_token, data, url) => {
	return new Promise(async (resolve, reject) => {
		let upload_parameters = { ...data.upload_parameters };
		let formData = new FormData();
		Object.keys(upload_parameters).forEach(function (key) {
			formData.append(key, upload_parameters[key]);
		});
		let file = require("fs").createReadStream(url);
		formData.append("file", file,{
      filename: 'image3.png',
      contentType: 'image/png',
    });
		let config = {
			method: "POST",
			url: data.upload_url,
			headers: {},
		  data : formData,
		};
    const response = await axios(config);
    if(response)
    {
      resolve(response)
    }
	});
};




const linkedInPostVideo = async (accountID, access_token, text, localurl) => {
  return new Promise(async (resolve, reject) => {
    try {
      const stats = await fs.stat(localurl);
      if (stats) {
        let uploadArr = await linkdinIntialfileUpload(access_token,accountID,stats.size ,"video")
        console.log("upload array",uploadArr)
        let uprs = uploadArr.value.uploadInstructions
        let res = []
        console.log('uprs.length',uprs.length)
        if(uprs.length>1)
        {
         for (let i = 0; i < uprs.length; i++) {
          let e1 = await uploadbytetobytelinkedin(uprs[i].uploadUrl, localurl, access_token ,uprs[i]);
          res.push(e1)
        }
        }else{
          let e1 = await uploadbytetobytelinkedin(uprs[0].uploadUrl, localurl, access_token);
          res.push(e1)
        }
        console.log({res})
        if (res.length>0) {
          const media = uploadArr.value.video;
          let publishResponse= await linkdinFinalfileUpload(media,res,access_token)
          console.log({publishResponse})
          if (publishResponse) {
            let publish= await linkdinPublish(access_token,accountID,text,media,"video")
            console.log({publish},"jai ho babab")
            if (publish) {
              resolve(publish.data);  
            }
          }
        }
      }
    } catch (error) {
      reject(error);
    }
  })
};

const pageFaceBookUploadVideo = async (data, contain, localUrl) => {
  try {
    return new Promise(async (resolve, reject) => {
      let pages = data;
      for (let i = 0; i < pages.length; i++) {
        const pageToken = pages[i].access_token; // Use pages[i] instead of pages[0]
        const photoPath = localUrl;
        let perm = {
          access_token: pageToken,
          file_url: contain.url,
          description: contain.text,
        };
   
        const config = {
          method: "post",
          url: `https://graph.facebook.com/v17.0/${pages[i].id}/videos`,
          params: perm,
          data: {},
        };
        axios(config)
          .then((response) => {
            if (response) {
              resolve();
            }
          })
          .catch((error) => {
            reject();
          });
      }
    });
  } catch (e) {
    reject();
  }
};
let pageFaceBookUpload = async (data, contain, localUrl) => {
  try {
    return new Promise(async (resolve, reject) => {
      try {
        let pages = data;

        for (let i = 0; i < pages.length; i++) {
          const access_token = pages[i].access_token; // Use pages[i] instead of pages[0]
          const caption = contain.text;
          const photoPath = localUrl;

          const formData = new FormData();

          const fileBuffer = await fs.readFile(photoPath);
          formData.append('source', fileBuffer, {
            filename: 'image3.png',
            contentType: 'image/png',
          });
          const config = {
            method: 'post',
            url: 'https://graph.facebook.com/me/photos',
            params: {
              access_token: access_token,
              caption: caption,
            },

            data: formData,
          };

          axios(config)
            .then(response => {
              if (response) {
                resolve();
              }
            })
            .catch(error => {
            });
        }

      } catch (e) {
        reject(e);
      }
    });
  } catch (e) {
    reject(e);
  }
};
let uploadFacebookTextOnly = async (data, text) => {
  try {
    return new Promise(async (resolve, reject) => {
      let pages = data;
      for (let i = 0; i < pages.length; i++) {
        const access_token = pages[i].access_token;
        const caption = text;
        const postURL = `https://graph.facebook.com/me/feed?message=${encodeURIComponent(caption)}&access_token=${access_token}`;
        const postResponse = await axios.post(postURL);
        resolve()
      }
     
    })
  } catch (e) {
    reject(e)
  }
};
let downloadFile = (url) => {
  return new Promise((resolve, reject) => {
    let mainDir = __dirname.replace(".next\server\pages\api", "");
    let uploadPath = "uploads";
    let ext = url.split(".").slice(-1)[0]
    let fileName = Date.now().toString() + "." + ext;
    let fullUploadPath = mainDir + uploadPath + fileName;
    const file = require("fs").createWriteStream(fullUploadPath);
    https.get(url, function (response) {
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        let url = `${mainDir}${uploadPath}${fileName}`;
        resolve(url);
      });
    });
  });
};
const InstagramUploadPost = async (data, contain, type) => {
 return new Promise(async(resolve ,reject)=>{
    const token = data.data.access_token;
    const instagramID = data.data.instagrampage.instagramID;
    try {
      let parm = {}
      console.log("contain.urlcontain.url",contain.url)
      if (type == "video") {
        parm = {
          access_token: token,
          video_url: contain.url,
          media_type: "REELS",
          caption: contain.text,
        }
      } else {
        parm = {
          access_token: token,
          image_url: contain.url,
          media_type: 'IMAGE',
          caption: contain.text,
        }
      }
      console.log("jai jo")
      const response = await axios.post(`https://graph.facebook.com/v13.0/${instagramID}/media`, null, {
        params: parm
      });
      console.log("jai jo111",response)
      const result = response.data;
      let status =await checkStatus(result.id, token)
        console.log({status})
        if(status.status_code=="ERROR")
        {
          reject(status)
        }else{
          if (status) {
            try{
            let r = await instaVideoPublished(instagramID, result.id, token);
            resolve(r);
            }
            catch(e){
              reject(e)
            }
          }
        }
     
  
    } catch (error) {
      console.log("errrror",error)
    reject(error)
    }
  })

};
const uploadLinkdinTextOnly = async (data, contain) => {
  return new Promise(async(resolve, reject) => {
  try {
    const access_token = data.data.access_token;
    const accountID = data.data.id;
    const publishOptions = {
      method: 'POST',
      url: 'https://api.linkedin.com/rest/posts',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Linkedin-Version': process.env.LINKEDIN_API_VERSION,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      },
      data: {
        author: `urn:li:person:${accountID}`,
        commentary: contain.text,
        visibility: 'PUBLIC',
        distribution: {
          feedDistribution: 'MAIN_FEED',
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        lifecycleState: 'PUBLISHED',
        isReshareDisabledByAuthor: false,
      },
    };
    let d1=await axios(publishOptions);
    resolve(d1);
  } catch (error) {
    reject(error.message);
  }
})
};


let pinterestPost = (data, contain,board) => {
  return new Promise(async (resolve, reject) => {
    try {
      let refresh_token = data.data.refresh_token
      let scope = data.data.scope.replaceAll(" ", ",");
      let data1 = {
        grant_type: "refresh_token",
        refresh_token: refresh_token,
        scope: scope,
      };
      let getToken = await pinterestRefreshToken(data1);
      let access_token = getToken.access_token;
      try {
        const response = await axios.post(
          `https://${process.env.PINTEREST_URL}/pins/`,
          {
            "board_id": board.id,
            "link": "https://www.pinterest.com/",
            "title": contain.text,
            "description": contain.text,
            "dominant_color": "#6E7874",
            "alt_text": contain.text,
            "media_source": {
              "source_type": "image_url",
              "url": contain.url,
            },
            "note": contain.text

          },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );

        resolve()
      } catch (error) {
        reject(error)
      }
    }
    catch (erro) {
      reject(erro)
    }
  });

};

const linkedInPost = async (accountID, access_token, text, localurl) => {
  return new Promise(async (resolve, reject) => {
  try {
    const stats = await fs.stat(localurl);
    if (stats) {
      
      const uploadArr =await linkdinIntialfileUpload(access_token,accountID,null,"image")
      if (uploadArr.value.uploadUrl) {
        await uploadbytetobytelinkedin(uploadArr.value.uploadUrl, localurl, access_token);
        const media = uploadArr.value.image;

       let publishResponse = await linkdinPublish(access_token,accountID,text,media,"image")
         resolve(publishResponse);
      }
    }
  } catch (error) {
    return reject(error.message);
  }
})
};

const uploadbytetobytelinkedin = (uploadurl, url, access_token,data=false) => {
  return new Promise((resolve, reject) => {
    try{
      let reader
    if(data==false)
    {
       reader = require("fs").createReadStream(url);
    }else{
       reader = require("fs").createReadStream(url ,{ start:data.firstByte,end: data.lastByte});
    }


    const config = {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/octet-stream',
      },
    };

    const formData = new FormData();
    formData.append('file', reader);

    axios.post(uploadurl, formData, config)
      .then((response) => {
        if (response.headers) {
          resolve(response.headers.etag);
        }
      })
      .catch((error) => {
        reject(error);
      });
    }
    catch(e){
      reject(e);
    }
  });
};



const pinterestRefreshToken = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const auth = Buffer.from(`${process.env.PINTEREST_APP_ID}:${process.env.PINTEREST_SECRET_KEY}`).toString('base64');

      const headers = {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded', // Set content type to application/x-www-form-urlencoded
      };

      // Convert the form data to a URL-encoded string
      const encodedData = Object.keys(data)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
        .join('&');

      const requestData = {
        method: 'POST',
        url: `https://${process.env.PINTEREST_URL}/oauth/token`,
        headers: headers,
        data: encodedData,
      };

      const response = await axios(requestData);
      const json = response.data;
      resolve(json);
    } catch (error) {

      reject(error.message);
    }
  });
};

const checkStatus = (id, token) => {
  return new Promise((resolve, reject) => {
    const check = () => {
      axios({
        method: 'GET',
        url: `https://graph.facebook.com/v13.0/${id}/`,
        params: {
          access_token: token,
          fields: 'status,status_code',
        },
      })
      .then(response => {
        const result = response.data;
        if (result.status_code === 'FINISHED' || result.status_code === 'ERROR') {
          resolve(result);
        } else {
          setTimeout(check,6000);
        }
      })
      .catch(error => {
        reject(error?.response?.data?.error || error);
      });
    };

    check();
  });
};


const instaVideoPublished = (instagramID, media_id, token) => {
  return new Promise(async (resolve, reject) => {
    try {
      const options = {
        method: 'POST',
        url: `https://graph.facebook.com/v13.0/${instagramID}/media_publish/`,
        params: {
          access_token: token,
          creation_id: media_id,
        },
      };
      const response = await axios(options);
      resolve(response.data);
    } catch (error) {
      reject(error?.response?.data?.error?.message);
    }
  });
}

const linkdinIntialfileUpload=(access_token,accountID,size,type)=>{
  try {
  return new Promise(async(resolve,reject)=>{
    let data ={
      owner: `urn:li:person:${accountID}`,
    }
    if(size)
    {
      data={
        ...data,
        fileSizeBytes: size,
        uploadCaptions: false,
        uploadThumbnail: false,
      }
    }
    const regUploadVideo = {
      method: 'POST',
      url: `https://api.linkedin.com/rest/${type}s?action=initializeUpload`,
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Linkedin-Version': process.env.LINKEDIN_API_VERSION,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      },
      data: {
        initializeUploadRequest: data,
      },
    };
    const response = await axios(regUploadVideo);
    const uploadArr = response.data;
    if(uploadArr)
    {
      resolve(uploadArr)
    }else{
      reject()
    }
  })
}
catch(e){
  reject(e)
}
}

const linkdinFinalfileUpload=(media,res,access_token)=>{
  try {
  return new Promise(async(resolve,reject)=>{
    const publishOptions = {
      method: 'POST',
      url: 'https://api.linkedin.com/rest/videos?action=finalizeUpload',
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Linkedin-Version": "202306",
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json",
      },
      data: {
        finalizeUploadRequest: {
          video: media,
          uploadToken: "",
          uploadedPartIds: res,
        },
      },
    };
    const publishResponse = await axios(publishOptions);
    if(publishResponse)
    {
      resolve(publishResponse)
    }else{
      reject()
    }
  })
}
catch(e){
  reject(e)
}
}

const linkdinPublish=(access_token,accountID,text,media,type)=>{
  try {
  return new Promise(async(resolve,reject)=>{
    const publishOptions = {
      method: 'POST',
      url: 'https://api.linkedin.com/v2/ugcPosts',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Linkedin-Version': process.env.LINKEDIN_API_VERSION,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      },
      data: {
        author: `urn:li:person:${accountID}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: text,
            },
            shareMediaCategory: type.toUpperCase(),
            media: [
              {
                status: 'READY',
                media: media.replace(`urn:li:${type}`, 'urn:li:digitalmediaAsset'),
                title: {
                  text: '',
                },
              },
            ],
            shareCommentary: {
              attributes: [],
              text: text,
            },
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      },
    };
    const publish = await axios(publishOptions);
    if(publish)
    {
      resolve(publish?.data)
    }else{
      reject()
    }
  })
}
catch(e){
  reject(e)
}
}


let registerVideoPinterest = async (access_token) => {
  try{
	return new Promise((resolve, reject) => {
		var data = JSON.stringify({ media_type: "video" });

		var config = {
			method: "post",
			url: `https://${process.env.PINTEREST_URL}/media`,
			headers: {
				Authorization: `Bearer ${access_token}`,
				"Content-Type": "application/json",
			},
			data: data,
		};

		axios(config)
			.then(function (response) {
				resolve(response.data);
			})
			.catch(function (error) {
				reject(error);
			});
	});
}catch(e){
  reject(e);
}
};

let checkVideoPinUploaded = async(args, access_token) => {
  try{
		let config = {
			method: "get",
			url: `https://${process.env.PINTEREST_URL}/media/${args.media_id}`,
			headers: {
				Authorization: `Bearer ${access_token}`,
				"Content-Type": "application/json",
			},
			data: {},
		};
		let response=await axios(config)
        if(response?.data?.status === 'succeeded')
        {
          return response.data
        }else{
          return checkVideoPinUploaded(args, access_token)
        }
    }
    catch(e){
      return e 
    }
};


let createPin = (args, access_token,data) => {
	return new Promise(async (resolve, reject) => {
		let data1 = JSON.stringify({
     "title": data.text,
     "description": data.text,
			media_source: {
				source_type: "video_id",
				cover_image_url: args.thumb,
				media_id: args.media_id,
			},
			board_id: args.board_id,
		})

		let config = {
			method: "post",
			url: `https://${process.env.PINTEREST_URL}/pins`,
			headers: {
				Authorization: `Bearer ${access_token}`,
				"Content-Type": "application/json",
			},
			data: data1,
		};
		axios(config)
			.then(function (response) {
				resolve(response.data);
			})
			.catch(function (error) {
				reject(error);
			});
	});
};


let YoutubeVideoUpload=(data,caption,localPath)=>{
  return new Promise((resolve,reject)=>{
    const { google } = require('googleapis');
  const OAuth2 = google.auth.OAuth2;
const service = google.youtube('v3');
console.log("1")
const oAuth2Client = new OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET,     process.env.LIVE_URL+process.env.GOOGLE_REDIRECT_URIS);
console.log("2")
oAuth2Client.setCredentials({
  refresh_token: data.refreshToken
});
console.log("3")
oAuth2Client.refreshAccessToken((error, tokens) => {
  oAuth2Client.setCredentials(data.accessToken);
});

let auth = oAuth2Client;
service.videos.insert({
  auth: auth,
part: 'snippet,status',
requestBody: {
  snippet: {
    title: caption.title,
  description:caption.text,
defaultLanguage: 'en',
defaultAudioLanguage: 'en'
},
status: {
  privacyStatus: "public"
},
},
media: {
  body: require("fs").createReadStream(localPath),
},
}, function(err, response) {
  if (err) {
    console.log({err})
    console.log("ooooopppppppppp",err.response?.data?.error.errors);
    reject(err.response?.data?.errors || err);
  }else{
    resolve(response?.data || {});
  }
})
})
}






module.exports = { schedukeCron, socialPost }