
const postModel = require("./models/postModel");
const userModel = require("./models/userModel");

const {handleError ,updateReqResp , dbQuery , customValidator} = require("./lib/commonLib");

export default async function handler(req, res) {
    try{
     if(req.method == 'GET'){
            if(req.query.action=="chartData")
            {
              chartData(req, res);
            }else{
              if(req.query.action=="scduleChartData")
              {
                scduleChartData(req, res);
              }else{
                getPostCount(req, res);
              }
            }
           
        }
    }catch (error){
        handleError(error , 'AuthAPI');
    }
}



let getPostCount = (req, res) => {
    customValidator(
    {data: req.query},
    req,
    res,
    async ({authData} = validateResp) => {
        let where = {}; 
        if(authData.role == 'User'){
            where.userId =  authData.id;
        }
        let pending =   await dbQuery.count({
            collection : postModel,
            where :{...where ,status : "pending"},
        });

        let published= await dbQuery.count({
            collection : postModel,
            where :{...where ,status : "Sucess"},
        });

      

        let data = {
            pending: pending,
            published: published,
    
        }

        if(authData.role == 'User'){
            let facebook= await dbQuery.count({
                collection : postModel,
                where :{...where,"socialMediaAccounts": {
                    $elemMatch: {
                      "type": "facebook"
                    }
                }
            }
        })
        data.facebook=facebook
        let linkedin= await dbQuery.count({
            collection : postModel,
            where :{...where,"socialMediaAccounts": {
                $elemMatch: {
                  "type": "linkedin"
                }
            }
        }
    })
    data.linkedin=linkedin
    let instagram= await dbQuery.count({
        collection : postModel,
        where :{...where,"socialMediaAccounts": {
            $elemMatch: {
              "type": "instagram"
            }
        }
    }
})
    data.instagram=instagram
    let pinterest= await dbQuery.count({
        collection : postModel,
        where :{...where,"socialMediaAccounts": {
            $elemMatch: {
            "type": "pinterest"
            }
        }
    }
    })
    data.pinterest=pinterest
        }else
        {
           
            let users= await dbQuery.count({
                collection : userModel,
                where :{role : 'User'}
            })
            let post= await dbQuery.select({
                collection : postModel,
                where :{status : "pending"},
                limit : 10,
            })
            data.users=users
            data.post=post

            let chatdata=await dbQuery.aggregate({
                collection : postModel,
                aggregateCnd : [
                    {
                      $project: {
                        scheduleDate: 1,
                        socialMediaAccounts: 1
                      }
                    },
                    {
                      $unwind: "$socialMediaAccounts"
                    },
                    {
                      $group: {
                        _id: {
                          date: { $dateToString: { format: "%Y-%m-%d", date: "$scheduleDate" } },
                          platform: "$socialMediaAccounts.type"
                        },
                        count: { $sum: 1 }
                      }
                    },
                    {
                      $group: {
                        _id: "$_id.date",
                        data: {
                          $push: {
                            k: "$_id.platform",
                            v: "$count"
                          }
                        }
                      }
                    },
                    {
                      $replaceRoot: {
                        newRoot: {
                          $mergeObjects: [
                            { date: "$_id" },
                            { $arrayToObject: "$data" }
                          ]
                        }
                      }
                    },
                    {
                      $sort: { date: 1 }
                    }
                  ]
            })
            data.chatdata=chatdata  
        }
      
            res.status(200).json({ 
                status : true,
                message : '',
                data : data,
            })
       
    })
}


let chartData=(req, res)=>{
  customValidator(
    {data: req.query,
      keys: {
        startDate: {
          require: true,
        },
        endDate: {
          require: true,
        },
      },
    },
    req,
    res,
    async ({authData} = validateResp) => {
      try {
        if(authData.role!="User")
        {
          let chatdata=await dbQuery.aggregate({
            collection : postModel,
            aggregateCnd : [
              {
                $match: {
                  scheduleDate: {
                    $gte: new Date(req.query.startDate),
                    $lte: new Date(req.query.endDate)  
                  }
                }
              },
                {
                  $project: {
                    scheduleDate: 1,
                    socialMediaAccounts: 1
                  }
                },
                {
                  $unwind: "$socialMediaAccounts"
                },
                {
                  $group: {
                    _id: {
                      date: { $dateToString: { format: "%Y-%m-%d", date: "$scheduleDate" } },
                      platform: "$socialMediaAccounts.type"
                    },
                    count: { $sum: 1 }
                  }
                },
                {
                  $group: {
                    _id: "$_id.date",
                    data: {
                      $push: {
                        k: "$_id.platform",
                        v: "$count"
                      }
                    }
                  }
                },
                {
                  $replaceRoot: {
                    newRoot: {
                      $mergeObjects: [
                        { date: "$_id" },
                        { $arrayToObject: "$data" }
                      ]
                    }
                  }
                },
                {
                  $sort: { date: 1 }
                }
              ]
        })
        res.status(200).json({ 
          status : true,
          message : '',
          data : chatdata,
      })
        }else{
          handleError('User not authorize.');
        }
   
}
catch(e){
  handleError(e , 'Something went wrong.');
}
    })
}



let scduleChartData=(req, res)=>{
  customValidator(
    {data: req.query,
      keys: {
        startDate: {
          require: true,
        },
        endDate: {
          require: true,
        },
        type : {
          require : true
        }
      },
    },
    req,
    res,
    async ({authData} = validateResp) => {
      try {
        if(authData.role!="User")
        {
          let chatdata=await dbQuery.aggregate({
            collection : postModel,
            aggregateCnd : [
              {
                $match: {
                  scheduleDate: {
                    $gte: new Date(req.query.startDate), 
                    $lte: new Date(req.query.endDate)  
                  },
                  status :req.query.type=="publish" ?  "Sucess":"pending",
                }
              },
              {
                $project: {
                  scheduleDate: 1,
                  socialMediaAccounts: 1,
                  status :1
                }
              },
              {
                $unwind: "$socialMediaAccounts"
              },
              {
                $group: {
                  _id: {
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$scheduleDate" } },
                    platform: "$status"
                  },
                  count: { $sum: 1 }
                }
              },
               {
                $group: {
                  _id: "$_id.date",
                  data: {
                    $push: {
                      k: "$_id.platform",
                      v: "$count"
                    }
                  }
                }
              },
              {
                $replaceRoot: {
                  newRoot: {
                    $mergeObjects: [
                      { date: "$_id" },
                      { $arrayToObject: "$data" }
                    ]
                  }
                }
              },
              {
                $sort: { date: 1 }
              }
            ]
        })
        res.status(200).json({ 
          status : true,
          message : '',
          data : chatdata,
      })
        }else{
          handleError('User not authorize.');
        }
   
}
catch(e){
  handleError(e , 'Something went wrong.');
}
    })
}
  
  
  
  
  
  


