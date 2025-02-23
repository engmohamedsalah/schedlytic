const {
    handleError,
    dbQuery,
    customValidator,
  } = require("./lib/commonLib");
  const mongoose = require('mongoose');
  const postModel = require("./models/postModel");
  
  export default function handler(req, res) {
    if (req.method === "POST") {
      saveasdraft(req, res);
    } else 
    {
      res.status(405).json({ message: 'Method not allowed' });
    }
  }
  
  
  const saveasdraft= async (req, res) => {
    customValidator(
      { data: req.body },
      req,
      res,
      async (validateResp) => {
        const { authData } = validateResp;
        const { title,text, url ,type,thumb,cid} = req.body;
        console.log(req.body, "req.body",cid);

        try {
          if(cid)
          {
            const  newDraft ={title:title,text,url:url,createdAt: new Date(),posttype: type,userId : authData.id,type: "draft" ,thumb}
            await dbQuery.update({
              collection:postModel,
              data:newDraft,
              where : {
                _id : new mongoose.Types.ObjectId(cid)
              },
              limit : 1
              
            }).then(async (ins) => {
              res.status(200).json({status: true,message:'Post saved as draft',ins});
            });
          }else{
            const  newDraft ={title:title,text,url:url,createdAt: new Date(),posttype: type,userId : authData.id,type: "draft" ,thumb}
            await dbQuery.insert({
              collection:postModel,
              data:newDraft
            }).then(async (ins) => {
              res.status(200).json({status: true,message:'Post saved as draft',ins});
            });
          }

          
        } catch (error) {
          res.status(500).json({ status: false, message: error.message });
        }
      }
    );
  };
  