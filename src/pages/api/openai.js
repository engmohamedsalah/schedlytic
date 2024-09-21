import OpenAI from 'openai';
const {handleError ,updateReqResp , dbQuery , customValidator} = require("./lib/commonLib");
var axios = require("axios");


export default async function handler(req, res) {
    try{
        if(req.method == 'POST'){
            if(req.body.action=="ImageGenrate"){
                imageGenrate(req,res)
            }else{
                aiTextGenration(req, res);
            }
        }
    }catch (error){
        handleError(error , 'AuthAPI');
    }
}


let aiTextGenration=async(req,res)=>{
    customValidator(
        {
            data: req.body,
            keys: {
              
            },
        },
        req,
        res,
        async ({authData} = validateResp) => { 
            let { content} = req.body;
            try{
            const openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY, 
              });
              const chatCompletion = await openai.chat.completions.create({
                messages: [{ role: 'user', content: content }],
                model: 'gpt-3.5-turbo',
              });
              res.status(200).json({ 
                data : chatCompletion.choices[0].message.content ,
                status : true,
                message : 'Image genrate sucessfully'
            })
        }
        catch(e){
            res.status(401).json({ 
                status : false,
                message : 'Something went wrong'
            })
        }
                  
          
         
            
        })
}


let imageGenrate =async(req,res)=>{

        customValidator(
            {
                data: req.body,
                keys: {
                  
                },
            },
            req,
            res,
            async ({authData} = validateResp) => { 
                try {
                let { content} = req.body;
            const response = await axios.post(
            'https://api.openai.com/v1/images/generations',
            {
                prompt: content,
                n: 1,                                
                size: '1024x1024', 
                model : "dall-e-3"                    
            },
            {
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            }
            );
        res.status(200).json({ 
            data : response.data ,
            status : true,
            message : 'Image genrate sucessfully'
        })
    } catch (error) {
        res.status(401).json({ 
            status : false,
            message : error.response?.data?.error?.message
        })
      }
    })
     
    
}