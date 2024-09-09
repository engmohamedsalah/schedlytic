import planModel from "./models/planModel";
import userModel from "./models/userModel";

const postModel = require("./models/postModel");
const mediaModel = require("./models/mediaModel")
const axios = require("axios")

const {
  handleError,
  dbQuery,
  customValidator,
} = require("./lib/commonLib");
const {socialPost} =require("../api/schedule")
const mongoose  = require('mongoose');

export default async function handler(req, res) {
  try {
    if (req.method == "POST") {
      if (req.body.action == "useImage") {
        addMediaToLibrary(req, res);
      }
      else {
        addNewPost(req, res);
      }
    } else if (req.method == "PUT") {
      updatePost(req, res);
    } else if (req.method == "GET") {
      if(req.query.action == "Month")
      {
        postByMonth(req, res);
      }
      else{
        getPostList(req, res);
      }
    } else if (req.method == "DELETE") {
      deletePost(req, res);
    }
  } catch (error) {
    handleError(error, "AuthAPI");
  }
}

let addNewPost = (req, res) => {
  customValidator(
    {
      data: req.body,
      keys: {
        socialMediaAccounts: {
          require: true,
        },
      },
    },
    req,
    res,
    async ({ authData } = validateResp) => {
      let { posts,socialMediaAccounts,stype} =req.body;
      let postdata=[]
      for(let i=0;i<posts.length;i++)
      {
        let { title, text, url, scheduleDate, timeZone ,postDate,type,platefrom,thumb} =posts[i];
        const d = new Date();
        let sd =  postDate ? new Date(postDate) : new Date();

        if(stype!="post")
        {
          if(new Date()>sd){
            res.status(401).json({
             status: 0,
             message: "Please choose future date and time as per selected timezone.",
           });
           return
          }
        }
     
       let socialA=[...socialMediaAccounts]
       if(url=="")
       {
        socialA=socialA.filter((d1)=>(d1.type=="facebook" || d1.type=="linkedin"))
       }
       let socialAC=[]
      for(let j=0;j<platefrom.length;j++){
        let name=platefrom[j]
        let da=socialA.filter((d3)=>{
          if(d3.type==name.toLowerCase())
          {
            return d3
          }
        })
         if(da?.length>0)
         {
          socialAC.push(da[0])
         }
      }
      if(socialAC.length==0)
      {
        continue;
      }
       let insData = {
        title : title,
        status: "pending",
        userId: authData.id,
        text: text,
        url: url,
        scheduleDate: scheduleDate,
        socialMediaAccounts: socialAC,
        timeZone: timeZone ? timeZone : {},
        postDate: sd,
        posttype : type,
        thumb : thumb,
      };

      if(stype == "post")
      {
        insData.type="postnow"
      }
      postdata.push(insData)
    }
      if(postdata.length==0)
      {
        res.status(401).json({
          status: false,
          message: "Select Accounts are not capable to post on social media accounts.",
        });
        return 
      }

      let postcount= await dbQuery.select({
        collection: userModel,
        where: {_id : authData.id},
        keys : "social_post_count,planId",
        limit : 1,
      })
      let planPost= await dbQuery.select({
        collection: planModel,
        where: {id : postcount.planId},
        keys : "post_per_month",
        limit : 1,
      })
      if(!planPost){
        res.status(401).json({
          status: false,
          message: "Please Update your plan.",
        });
        return 
      }
      const currentDate = new Date();
      let postpermonth= await dbQuery.aggregate({
        collection: postModel,
        aggregateCnd:[
          {
            $match: {
              userId:new mongoose.Types.ObjectId(authData.id),
              "scheduleDate": {
                $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
                $lt: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
              },

            }
          },
          {
            $unwind: "$socialMediaAccounts"
          },
          {
            $group: {
              _id: "$_id",
              totalSocialMediaAccounts: { $sum: 1 }
            }
          },
          {
            $group: {
              _id: null,
              totalPosts: { $sum: 1 },
              totalSocialMediaAccounts: { $sum: "$totalSocialMediaAccounts" }
            }
          }
        ],
        
      })
      let prmonthcount=postpermonth?.[0]?.totalSocialMediaAccounts ? postpermonth[0]?.totalSocialMediaAccounts : 0
      prmonthcount=prmonthcount+ postdata.length
      if(prmonthcount > planPost.post_per_month)
      {
        res.status(401).json({
          status: false,
          message: "Post count Reach limit .",
        });
        return 
      }
       let d2=await dbQuery.insert({
        collection: postModel,
        data: postdata,
      });
      res.status(200).json({
        status: true,
        message: "Post Submited successfully.",
      });
      if(stype == "post")
      {
        try{
          for(let i=0;i<d2.length;i++){
            await socialPost(d2[i])
          }
        }
        catch(e)
        {
        }
      }
});
};



let updatePost = (req, res) => {
  customValidator(
    {
      data: req.body,
      keys: {},
    },
    req,
    res,
    async ({ authData } = validateResp) => {
      let { target, data } = req.body;
      let d2={...data}
      d2.posttype=d2.type
      delete d2.type
      dbQuery
        .select({
          collection: postModel,
          where: {
            _id: target,
          },
          limit: 1,
          keys: "_id",
        })
        .then(async (checkUser) => {
          if (!checkUser) {
            res.status(401).json({
              status: 0,
              message: "Post not found.",
            });
          } else {
            dbQuery
              .update({
                collection: postModel,
                data: d2,
                where: {
                  _id: target,
                },
                limit: 1,
              })
              .then((ins) => {
                res.status(200).json({
                  status: true,
                  message: "Post update successfully.",
                });
              });
          }
        });
    }
  );
};

let getPostList = (req, res) => {
  customValidator(
    { data: req.query },
    req,
    res,

    async ({ authData } = validateResp) => {
      let { keys, page, limit, keyword, sort,target } = req.query,
        where = {};

      if (authData.role == "User") {
        where.userId = authData.id;
      }
      if(target)
      {
        where._id = target;
      }

      if (keyword && keyword.trim() != "") {
        where["$or"] = [{ title: { $regex: new RegExp(keyword, "i") } }];
      }

      dbQuery
        .select({
          collection: postModel,
          where : where,
        })
        .then(async (posts) => {
          let count =
            limit == 1
              ?1
              : await dbQuery.count({
                  collection: postModel,
                });

          res.status(200).json({
            status: true,
            message: "",
            data: posts,
            totalRecords: count,
            fetchedRecords: limit == 1 ? 1 : posts.length,
          });
        });
    }
  );
};


let deletePost = (req, res) => {
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
      let { target, keys } = req.query;
      dbQuery
        .select({
          collection: postModel,
          where: {
            _id: target,
          },
          limit: 1,
        })
        .then(async (checkUser) => {
          if (!checkUser) {
            res.status(401).json({
              status: 0,
              message: "Post not found.",
            });
          } else {
            dbQuery
              .delete({
                collection: postModel,
                where: {
                  _id: target,
                },
                limit: 1,
              })
              .then((ins) => {
                res.status(200).json({
                  status: true,
                  message: "Post deleted successfully.",
                });
              });
          }
        });
    }
  );
};

let addMediaToLibrary = (req, res) => {
  customValidator(
    { data: req.body },
    req,
    res,
    async ({ authData } = validateResp) => {
      let { url } = req.body;
      const path = require("path");
      const fs = require("fs");
      const https = require("https");
      const sizeOf = require("image-size");
      const { uploadLocalFileToS3 } = require("./lib/AWS-Actions");
      let localTempFilePath = "/";
      try {
        let newFileName = Math.floor(Math.random() * 1000) + "" + Date.now() + ".png";
        const newLocation = localTempFilePath + newFileName;
        return new Promise(async (resolve, reject) => {

          const response = await axios.get(url, { responseType: "stream" });

      
          const objectKey = "uploaded-image.png";


          const imageStream = fs.createWriteStream(objectKey);

          response.data.pipe(imageStream);

          await new Promise((resolve, reject) => {
            imageStream.on("finish", () => {
              resolve()
            });
            imageStream.on("error", reject);
          });
          const dimensions = sizeOf(objectKey);
          let mediaMeta = {
            width: dimensions.width,
            height: dimensions.height,
          };
          let fileKey = `assets/images/${newFileName}`;

          uploadLocalFileToS3({
            Key: fileKey,
            Body: objectKey,
            ContentType: "image/png",
          }).then(async (uplData) => {
            let insMediaData = {
              title: objectKey,
              userId: authData.id,
              path: fileKey,
              tags: "ai",
              type: "images",
              meta: mediaMeta,
            };
            dbQuery
              .insert({
                collection: mediaModel,
                data: insMediaData,
              })
              .then(async (addNewMedia) => {
                fs.unlinkSync(objectKey);
                let ul = process.env.S3_PATH + fileKey
                res.status(200).json({
                  status: true,
                  message: "",
                  data: ul,
                });
              });
          },(e)=>{
            fs.unlinkSync(objectKey);
            res.status(401).json({ 
                status : false,
                message : e.message,
            })
        });

        });
      } catch (err) {
        handleError(error, "UploadFile");
      }
    })
};

let postByMonth=(req,res)=>{
  customValidator(
    { data: req.query },
    req,
    res,
    async ({ authData } = validateResp) => {
      let {start,end}=req.query
      let data=await postModel.aggregate([
        {
          $match: {
            scheduleDate: {
              $gte: new Date(start),
              $lt: new Date(end)
            },
            userId : new mongoose.Types.ObjectId(authData.id),
          }
        },
        {
          $group: {
            _id: { $month: '$scheduleDate' }, 
           data: { $push: '$$ROOT' },
            count: { $sum: 1 } 
          }
        },
        {
          $project: {
            _id: 0, 
            month: '$_id', 
            count: 1 ,
            data : 1,
          }
        },
        {
          $sort: { month: 1 }
        }
      ])
        res.status(200).json({
          status: true,
          message: "",
          data: data,
        });
    }
  );
}


