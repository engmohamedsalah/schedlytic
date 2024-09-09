const {handleError ,updateReqResp , dbQuery , customValidator} = require("./lib/commonLib");
export default async function handler(req, res) {
    try{
        if(req.method == 'GET'){
            if(req.query.type=="pinterest")
            {
                pinterestBoardList(req,res)
            }
            else
            {
                pinterest(req,res)
            }
				
        }
       
    }catch (error){
        handleError(error , 'AuthAPI');
    }
}



const axios = require('axios');

let pinterestBoardList = (req, res) => {
    customValidator(
        {
            data: req.query,
            keys: {},
        },
        req,
        res,
        async ({ authData } = validateResp) => {
            let userID = authData.id;
            try {
                const response = await axios.get(`https://${process.env.PINTEREST_URL}/v5/boards`, {
                    headers: {
                        Authorization: `Bearer ${req.query.access_token}`,
                    },
                });

                res.status(200).json({
                    status: true,
                    data: response.data,
                    message: "",
                });
            } catch (error) {
                res.status(500).json({
                    status: false,
                    message: "Error fetching Pinterest boards",
                });
            }
        }
    );
};


let pinterest =async(req,res)=>{
	try {
		let data = {};
		let code = req.query.code;
		let auth = Buffer.from(
			process.env.PINTEREST_APP_ID +
				":" +
				process.env.PINTEREST_SECRET_KEY
		).toString("base64");
		

		let data1 ={
			redirect_uri: process.env.LIVE_URL+`/api/social-pintrest`,
			code: code,
			grant_type: "authorization_code",
		}
	
		const encodedData = Object.keys(data1)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data1[key])}`)
        .join('&');
		
		var options = {
			method: "POST",
			url: `https://${process.env.PINTEREST_URL}/v5/oauth/token`,
			headers: {
				Authorization: `Basic ${auth}`,
				"Content-Type": "application/x-www-form-urlencoded",
			},
			data: encodedData,
		};
		
		let response= await axios(options)
	
			data = response.data;
			var options1 = {
				method: "GET",
				url: `https://${process.env.PINTEREST_URL}/v5/user_account`,
				headers: {
					Authorization: `Bearer ${data.access_token}`,
					"Content-Type": "application/x-www-form-urlencoded",
				},
			};

			let response1=await axios(options1)
				let lr = response1.data;
				let parameters = data;
				parameters.name = lr.username;
				parameters.profile_image = lr.profile_image;
				parameters.id = lr.id;

				let ordered = {};
				Object.keys(parameters)
					.sort()
					.forEach(function (key) {
						ordered[key] = parameters[key];
					});

				let encodedParameters = "";
				for (let k in ordered) {
					const encodedValue = escape(ordered[k]);
					const encodedKey = encodeURIComponent(k);
					if (encodedParameters === "") {
						encodedParameters += `${encodedKey}=${encodedValue}`;
					} else {
						encodedParameters += `&${encodedKey}=${encodedValue}`;
					}
				}
				return res.redirect(
					process.env.LIVE_URL+`/social/pinterest?${encodedParameters}`
				);
			
		
	} catch (e) {

	}
}



;





