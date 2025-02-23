import fontModal from "./models/fontModal";
const {handleError ,updateReqResp , dbQuery , customValidator} = require("./lib/commonLib");

export default async function handler(req, res) {
    try{ 
        if(req.method == 'POST'){
    
        }else if(req.method == 'GET'){
            getFontList(req, res);
        }
    }catch (error){
        handleError(error , 'AuthAPI');
    }
}
 

let getFontList = (req, res) => {
    customValidator(
    { },
    req,
    res,
    async ({authData} = validateResp) => {

        let {keys , page , limit , keyword, sort} = req.query,
        where = {}; 
    

        if(keyword && keyword.trim() != ''){
            where = {
                $or : [
                    {'family' : { $regex : new RegExp(keyword, "i")},},
                ]
            }
        }
    
        dbQuery.select({
            collection : fontModal,
            where,
            limit, 
            keys,
            page, 
            sort :"family",
        }).then(async cateData => {
            let count =  await dbQuery.count({
                collection : fontModal,
                where,
            }); 
                res.status(200).json({ 
                    status : true,
                    message : '',
                    data : cateData,
                    totalRecords : count,
                    fetchedRecords :  cateData.length
                })
         

            
        });
    })
}


