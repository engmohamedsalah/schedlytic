const planModel = require("./models/planModel");
const paymentCredentialModel = require("./models/paymentCredentialModel");
const {
  handleError,
  dbQuery,
  customValidator,
} = require("./lib/commonLib");
const axios = require('axios');
const mongoose  = require('mongoose');

export default async function handler(req, res) {
  try {
    if (req.method == "POST") {
      paymentCredentialAuth(req,res)
    } else if (req.method == "PUT") {
      updateStatus(req,res);
    } else if (req.method == "GET") {
      if(req.query.action=="payment_accounts"){ 
        getPaymentAccounts(req,res);
      } else if(req.query.action=="checkactive"){
        checkActivePlan(req,res)
      }else{
        getPlanList(req,res);
      }
       
    } else if (req.method == "PATCH") {
      ActivePlan(req,res)
    }
  } catch (error) {
    handleError(error, "AuthAPI");
  }
}


const getPlanList=async(req,res)=>{
  let where={active_status : true},limit=1000
  
  if( req.query.target){
    where.id=req.query.target
    limit=1
  }
  if(req.query.action =="getall"){
    delete where.active_status
  }else{
    let activeaccount=await dbQuery.select({
        collection: paymentCredentialModel,
        where: {status : "active"},
        limit :1
      });
      if(activeaccount){
        let plan =activeaccount.type
        where.type=plan
      }
  }
    let d1=await dbQuery.select({
        collection: planModel,
        where: where,
        limit : limit
      });
     res.status(200).json({
          data : d1,
          status: true,
          message: "",
        }); 
}


const updateStatus=async(req,res)=>{
  customValidator(
    {
        data: req.body,
        keys: {
          status : {
            require : true
          },
          target : {
            require : true
          }
        },
    },
    req,
    res,
    async ({authData} = validateResp) => { 
      try{
      let {status ,target}=req.body
      let d1=await dbQuery.update({
        collection: planModel,
        where: {_id : target},
        data :{ active_status : status},
        limit : 1
      });
      if(d1){
        res.status(200).json({
          status: true,
          message: "Update status successfully",
        });
      }
    }
    catch(e){
      res.status(401).json({
        status: true,
        message: "Something went wrong",
      });
    }
    })

}


const paymentCredentialAuth =async(req,res)=>{
  customValidator(
    {
        data: req.body,
        keys: {
          client_id : {
            require : true
          },
          secret_key : {
            require : true
          },
          type : {
            require : true
          }
        },
    },
    req,
    res,
    async ({authData} = validateResp) => { 
  try{
    let {type}=req.body
   if(type=="paypal"){
     checkPaypal(req,res)
   } else if(type=="stripe"){
     checkStripe(req,res)
   }
 
} catch (error) {
  res.status(401).json({
    status: false,
    message: "Client Crendials are wrong",
  });
  console.error('Error checking credentials:', error.response);
}
    })
}

const checkPaypal=async(req,res)=>{
  try{
  let {client_id,secret_key,type,email}=req.body
  const token = await getToken(client_id,secret_key);
  const userInfoResponse = await axios.get(
    'https://api-m.sandbox.paypal.com/v1/identity/openidconnect/userinfo?schema=openid',
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    }
  );
    if(userInfoResponse.data){
      let d1=await dbQuery.select({
        collection: paymentCredentialModel,
        where: {
          type : type
        },
        limit : 1
      });
      let data
      if(d1 && Object.keys(d1).length>0){
       data=await dbQuery.update({
          collection: paymentCredentialModel,
          where: {
            _id : d1._id
          },
          data  : {
            client_id :client_id,
            secret_key : secret_key,
            type : type,
            email : email
          }
        });
      }else{
        data=await dbQuery.insert({
        collection: paymentCredentialModel,
        data: {
          client_id :client_id,
          secret_key : secret_key,
          type : type,
          email : email
        },
        limit : 1
      });
      }
      if(data){
        res.status(200).json({
          data : userInfoResponse.data,
          status: true,
          message: "Details edit Successfully.",
        });
      }
    
    }
  }catch(e){
    res.status(401).json({
      status: false,
      message: "Clients details are invaild.",
    });
  }
}


const getToken = async (client_id,secret_key) => {
  try{
  const credentials = Buffer.from(`${client_id}:${secret_key}`).toString('base64');
  const response = await axios.post(
    `${process.env.PAYPAL_URL}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
    }
  );

  return response.data.access_token;
  }
  catch(e){
    throw e
  }
};

const checkStripe =async(req,res)=>{
  try {
  let {client_id,secret_key,type,email}=req.body
    const response = await axios.get('https://api.stripe.com/v1/balance', {
      headers: {
        Authorization: `Bearer ${secret_key}`,
      },
    });

    if(response.data){
      let d1=await dbQuery.select({
        collection: paymentCredentialModel,
        where: {
          type : type
        },
        limit : 1
      });
      let data
      if(d1 && Object.keys(d1).length>0){
       data=await dbQuery.update({
          collection: paymentCredentialModel,
          where: {
            _id : d1._id
          },
          data  : {
            client_id :client_id,
            secret_key : secret_key,
            type : type,
            email : email
          }
        });
      }else{
        data=await dbQuery.insert({
        collection: paymentCredentialModel,
        data: {
          client_id :client_id,
          secret_key : secret_key,
          type : type,
          email : email
        },
        limit : 1
      });
      }
      if(data){
        res.status(200).json({
          data : response.data,
          status: true,
          message: "Details edit Successfully.",
        });
      }
    }
  } catch (error) {
    console.error('Error checking Stripe credentials:', error);
    res.status(401).json({
      status: false,
      message: "Clients details are invaild.",
    });
  }



}

const ActivePlan=async(req,res)=>{
  let {target}=req.body
  let d1=await dbQuery.select({
    collection: paymentCredentialModel,
    where: {
      _id : new mongoose.Types.ObjectId(target)
    },
    limit : 1
  });

  if(d1){
    let d2=await dbQuery.update({
      collection: paymentCredentialModel,
      where: {
       status : "active" 
      },
      data : {
        status : "inactive"
      },
      limit : 1
    });
    if(d2){
     let active= await dbQuery.update({
        collection: paymentCredentialModel,
        where: {
          _id : new mongoose.Types.ObjectId(target)
        },
        data : {
          status : "active"
        },
        limit : 1
      });
      if(active){
        res.status(200).json({
          data : {},
          status: true,
          message: "Your gateway is active now ",
        });
      }
    }

  }else{
    res.status(401).json({
      status: false,
      message: "plan not find",
    });
  }

}

const getPaymentAccounts =async(req,res)=>{
  customValidator(
    {
        data: req.query,
        keys: {
      
        },
    },
    req,
    res,
    async ({authData} = validateResp) => {
  
        let d1=await dbQuery.select({
            collection:paymentCredentialModel ,
            where: {},
            limit : 10
          });
         res.status(200).json({
              data : d1,
              status: true,
              message: "",
            }); 

    })
}


const checkActivePlan=async(req,res)=>{

        let d1=await dbQuery.select({
            collection:paymentCredentialModel ,
            where: {status : "active"},
            limit : 1
          });
         res.status(200).json({
              data : d1,
              status: true,
              message: "",
            }); 
    
}



