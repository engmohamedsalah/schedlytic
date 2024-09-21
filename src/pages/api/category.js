const categoryModel = require("./models/categoryModel");
const mediaModel = require("./models/mediaModel");
const { multerMiddleWare, removeFileFromS3 } = require('./lib/AWS-Actions');
const {
  handleError,
  updateReqResp,
  dbQuery,
  customValidator,
} = require("./lib/commonLib");

export default async function handler(req, res) {
  try {
    if (req.method == "POST") {
        addNewCategory(req, res);
    } else if (req.method == "PUT") {
      updateCategory(req, res);
    } else if (req.method == "GET") {
        if(req.query.action=="getMedia")
        {
            getMediabyCategory(req, res)
        }
        else
        {
           getCategoryList(req, res);
        }
    } else if (req.method == "DELETE") {
      deleteCategory(req, res);
    }
  } catch (error) {
    handleError(error, "AuthAPI");
  }
}

let addNewCategory = (req, res) => {
  customValidator(
    {
      data: req.body,
      keys: {
        name: {
          require: true,
        },
      },
    },
    req,
    res,
    async ({ authData } = validateResp) => {
      let {name, status} =req.body;
      let insData = {
            name : name,
            status : status
        };
        let data =await dbQuery
        .select({
          collection: categoryModel,
          where: {
            name: name,
          },
          limit: 1,
          keys: "_id",
        })
        if(data){
          res.status(401).json({
            status: 0,
            message: "Category already exists.",
          });
        }else{
          dbQuery.insert({
            collection: categoryModel,
            data: insData,
          })
          .then(async (ins) => {
            res.status(200).json({
              status: true,
              message: "Category added successfully.",
            });
          });
        }
      
    }
  );
};

let updateCategory = (req, res) => {
  customValidator(
    {
      data: req.body,
      keys: {},
    },
    req,
    res,
    async ({ authData } = validateResp) => {
      try{
     
      let {target,data } = req.body;
      dbQuery
        .select({
          collection: categoryModel,
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
              message: "Category not exist.",
            });
          } else {
            let d1;
            if(req.body?.action=="status")
            {  
              d1={status : req.body.status ? 1 : 0}
            }else{
              d1={...data}
            }
            dbQuery
              .update({
                collection: categoryModel,
                data: d1,
                where: {
                  _id: target,
                },
                limit: 1,
              })
              .then((ins) => {
                if(req.body?.action=="status")
                {
                  res.status(200).json({
                    status: true,
                    message: "Category status update successfully.",
                  });
                }
                else
                {
                  res.status(200).json({
                    status: true,
                    message: "Category update successfully.",
                  });
                }
              
              });
          }
        });

      }
      catch(e)
      {
      }
    }
  );
};

let getCategoryList = (req, res) => {
  customValidator(
    { data: req.query },
    req,
    res,
    async ({ authData } = validateResp) => {
      let { keys, page, limit, keyword, sort } = req.query,
        where = {};
        if(keyword)
        {
          if(keyword && keyword.trim() != ''){
            where["$or"] =  [
                    {'name' : { $regex : new RegExp(keyword, "i")},},
                ]  
        }
      }

      dbQuery
        .select({
          collection: categoryModel,
          where,
          limit,
          keys,
          page,
          sort,
        })
        .then(async (posts) => {
          let count =
            limit == 1
              ? 1
              : await dbQuery.count({
                  collection: categoryModel,
                  where,
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

let deleteCategory = (req, res) => {
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
          collection: categoryModel,
          where: {
            _id: target,
          },
          limit: 1,
        })
        .then(async (checkUser) => {
          if (!checkUser) {
            res.status(401).json({
              status: 0,
              message: "Category not found.",
            });
          } else {
            dbQuery
              .delete({
                collection: categoryModel,
                where: {
                  _id: target,
                },
                limit: 1,
              })
              .then(async(ins) => {
                res.status(200).json({
                  status: true,
                  message: "Category deleted successfully.",
                });
                let mediadata=await dbQuery.select({
                  collection : mediaModel,
                  where: {
                    categoryId: target,
                  },
                })

                let list =[]
                for(let i=0 ; i<mediadata.length;i++)
                {
                  if(mediadata[i].path)
                  {
                    list.push(mediadata[i].path)
                  }
                }
                if(list.length>0)
                {
                  removeFileFromS3({
                    isMultiple : true,
                    filePath: list,
                }, async () => {
                 let del= await  dbQuery
                  .delete({
                    collection: mediaModel,
                    where: {
                      categoryId: target,
                    },
                  })
                })
                }
              });
          }
        });
    }
  );
};

let getMediabyCategory=(req,res) =>{
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
      let { target,limit, keys, page, sort } = req.query;
      dbQuery
        .select({
          collection: categoryModel,
          where: {
            _id: target,
          },
          limit: 1,
        })
        .then(async (checkUser) => {
          if (!checkUser) {
            res.status(401).json({
              status: 0,
              message: "Category not found.",
            });
          } else {
            dbQuery
              .select({
                collection: mediaModel,
                where: {
                    categoryId: checkUser._id,
                    status :1
                },
                limit,
                page,
              })

              .then(async(ins) => {
                let count =  limit == 1 ? 1 : await dbQuery.count({
                  collection : mediaModel,
                  where :{
                    categoryId: checkUser._id,
                    status :1
                  },
              });
                res.status(200).json({
                  status: true,
                  data : ins,
                  totalRecords : count,
                  message: "",
                });
              });
          }
        });
    }
  );
}






