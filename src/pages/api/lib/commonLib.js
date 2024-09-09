const jwt = require("jsonwebtoken");
let cReq, cResp;
require('../models/config');
const nodemailer = require("nodemailer");
const  mandrillTransport = require('nodemailer-mandrill-transport');
let commonFun = {
    convertToSlug : (string) => {
        return string.toLowerCase().replace(/[^\w ]+/g, "").replace(/ +/g, "-");
    },
    updateReqResp : (req , res , next) => {
        cReq = req;
        cResp = res;
    },
    handleError : (error , errorFrom = '') => {
        let errorMessage = error;
        if(errorFrom == ''){
        }else{
            
            if('message' in error){
                errorMessage = error.message;
            }else if(typeof error != 'string'){
                if(typeof error != 'array'){
                    error = error[0];
                }

                if(typeof error == 'object'){
                    if(error.hasOwnProperty('message')){
                        errorMessage = error.message;
                    }else if(error.hasOwnProperty('msg')){
                        errorMessage = error.msg;
                    }else if(error.hasOwnProperty('error')){
                        errorMessage = error.error;
                    }
                }
            }

         
       
        }
        
        if(typeof cResp != 'undefined'){
            cResp.status(401).json({
                status : false,
                message : errorMessage,
            });
        }
        
    },
    customValidator : async (params, req, res, cb) => {
        commonFun.updateReqResp(req, res);
        try {
            let validateResp = {
                status: true, 
                message: "",
                authData: {},
            };
    
            var token = req.headers.authorization || "";
            if (  !params.hasOwnProperty("isToken") || (params.hasOwnProperty("isToken") && params.isToken) ) {
                if (token == "") {
                    validateResp.status = false;
                    validateResp.message = "Unauthorized access.";
                    validateResp.authData = params;
                } else {
                    token = token.split(" ");
                    if (token[0] == "Bearer") {
                        token = token[1];
                    } else {
                        token = token[0];
                    }
    
                    let jwtData = await jwt.verify(token, process.env.TOKEN_SECRET);
                    jwtData.token = token;
                    validateResp.authData = jwtData;
    
                    if (!validateResp.authData.hasOwnProperty("id")) {
                        validateResp.status = false;
                        validateResp.message = "Unauthorized access (invalid token).";
                    }
                }
            }
    
            if (validateResp.status) {
                if ( params.hasOwnProperty("data") && params.hasOwnProperty("keys") ) {
                    let checkKey = params.keys,
                        apiData = params.data; 
                    var BreakException = {};
                    try {
                        Object.keys(checkKey).forEach((key) => {
                            
                            let vDetails = checkKey[key];
                            if ( !vDetails.type && vDetails.require && (!apiData.hasOwnProperty(key) || (apiData.hasOwnProperty(key) && typeof apiData[key] == "string" && apiData[key].trim() == "")) ) {
                                validateResp.status = false;
                                validateResp.message =  ("message" in vDetails ? vDetails.message : key+ " is required.") ;
                                throw BreakException;
                            }
    
                            if ('validate' in vDetails ) {
                                const regexp = {
                                    url: /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/,
                                    email: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                                    mobile: /((?:\+|00)[17](?: |\-)?|(?:\+|00)[1-9]\d{0,2}(?: |\-)?|(?:\+|00)1\-\d{3}(?: |\-)?)?(0\d|\([0-9]{3}\)|[1-9]{0,3})(?:((?: |\-)[0-9]{2}){4}|((?:[0-9]{2}){4})|((?: |\-)[0-9]{3}(?: |\-)[0-9]{4})|([0-9]{7}))/,
                                };
    
                                if ( regexp.hasOwnProperty(vDetails.validate) &&  !regexp[vDetails.validate].test(apiData[key]) ) {
                                    validateResp.status = false;
                                    validateResp.message = key.charAt(0).toUpperCase() + key.slice(1) + " should be valid.";
                                    throw BreakException;
                                }
                            }
                            
                            if('compare' in vDetails){
                                let {compareKey = null, condition = null} = vDetails.compare;
                                if(!compareKey){
                                    validateResp.status = false;
                                    validateResp.message =   "CompareKey is required in compare statement for '"+key+"'.";
                                    throw BreakException;
                                }else if(!condition){
                                    validateResp.status = false;
                                    validateResp.message = "Condition is required in compare statement for '"+key+"'.";
                                    throw BreakException;
                                }
                                let a = apiData[key], b = apiData[compareKey];
                                var operatorsObj = {
                                    ">" :  [ a>b, 'greter than' ],
                                    "<" :  [ a<b, 'less than' ],
                                    "<=":  [ a<=b, 'less than equal to' ],
                                    ">=":  [ a>=b, 'greter than equal to' ],
                                    "==":  [ a==b, 'equal to' ],
                                    "===":  [ a===b, 'equal to' ],
                                    "!=":  [ a!=b, 'not equal to' ],
                                    "!==":  [ a!==b, 'not equal to' ],
                                };
 
                                if(condition in operatorsObj){
                                    if(!operatorsObj[condition][0]){
                                        validateResp.status = false;
                                        validateResp.message = key+" should be "+operatorsObj[condition][1]+" "+compareKey+".";
                                        throw BreakException;
                                    }
                                }else{
                                    validateResp.status = false;
                                    validateResp.message = `Given compare operator is invalid for ${key}.`;
                                    throw BreakException;
                                } 

                            }

                            if('length' in vDetails){
                                let {min = null, max = null} = vDetails.length;
                                if(min || max){
                                    if(min && apiData[key].length < min){
                                        validateResp.status = false;
                                        validateResp.message = `${key} length should be minimum ${min} characters.`;
                                        throw BreakException;
                                    }
                                    if(max && apiData[key].length > max){
                                        validateResp.status = false;
                                        validateResp.message = `${key} length should be maximum ${max} characters.`;
                                        throw BreakException;
                                    }
                                }else{
                                    validateResp.status = false;
                                    validateResp.message = "Please set character length parameters for '"+key+"'.";
                                    throw BreakException;
                                }
                            }
                        });
                    } catch (e) {
                        if (e !== BreakException) throw e;
                    }
                }
            }
    
            if (validateResp.status == true) {
                cb(validateResp);
            } else {
                commonFun.handleError(validateResp.message);
            }
        } catch (err) {
            commonFun.handleError(err, "customValidator");
        }
    },    
    dbQuery : {
        manageKeys : (keys = null) => {
            let result = {};
            if(keys && typeof keys == 'string' && keys.split(',').length){
                keys.split(',').map(d => {
                    result[d] = 1;
                });
            }
            return result;
        },
        insert : (p) => {
            return new Promise(function(resolveAction, rejectAction) {
                let {collection , data} = p;
                if(typeof data == 'object'){
                    var createObj = collection.create(data)
                }else{
                    var createObj = collection.insertMany(data)
                }
    
                createObj.then(result => {
                    resolveAction(result);
                }).catch(error => {
                    commonFun.handleError(error , 'insertQuery');
                })    
            });
            
        },
        update : (p) => {
            return new Promise(function(resolveAction, rejectAction) {
                let {collection , data , where , limit} = p;
                if(limit){
                    var createObj = collection.updateOne(where ,data,{ upsert: true });
                }else{
                    var createObj = collection.updateMany(where ,data,{ upsert: true });
                }
    
                createObj.then(result => {
                    if(result){
                        resolveAction(result);
                    }else{
                        commonFun.handleError('Something went wrong in update.' , 'updateQuery');
                    }
                }).catch(error => {
                    commonFun.handleError(error , 'updateQuery');
                })    
            });
            
        },
        select : (p) => {
            return new Promise(function(resolveAction, rejectAction) {
                let {collection , where , limit , keys , skip , sort, page , populateAry} = p;
                keys = keys ? commonFun.dbQuery.manageKeys(keys):{},
                limit = limit || 10, 
                page = page || 1;
    
                if(limit && limit == 1){
                    var createObj = collection.findOne(where , keys)
                }else{
                    var createObj = collection.find(where, keys)
                }
    
                if(populateAry){
                    if('multiple' in populateAry){
                        populateAry.multiple.map((populateData) =>  {
                            createObj = commonFun.dbQuery.manageMyPopulate(populateData , createObj);
                        });
                    }else{
                        createObj = commonFun.dbQuery.manageMyPopulate(populateAry , createObj);
                    }
                    
                }
                
                if(limit && limit != 'all'){
                    createObj.limit(limit);
                }
                if(skip)
                {
                createObj.skip(skip);
                }

                if(page && limit != 'all'){
                    createObj.skip((page-1)*limit);
                }
    
                if(sort){
                    let chkSort = sort.split(',');
                    if(chkSort.length > 1){
                        let k = chkSort[0], d = chkSort[1];
                        createObj.sort({[k] : d});
                    }
                }else{
                    createObj.sort({_id : -1});
                }
                
                createObj.then(result => {
                    resolveAction(result);
                }).catch(error => {
                    commonFun.handleError(error , 'selectQuery');
                })    
            });
        },
        manageMyPopulate : (populateAry , createObj) => {
            if(populateAry.length){
                if(populateAry.length == 1){
                    createObj.populate(populateAry[0]);
                }else{
                    createObj.populate(populateAry[0] , populateAry[1]);
                }
            }else{
                createObj.populate(populateAry);
            }
            
            return createObj;
        },
        delete : (p) => {
            return new Promise(function(resolveAction, rejectAction) {
                let {collection , where ,limit} = p;
                if(limit == 1){
                    var createObj = collection.deleteOne(where);
                }else{
                    var createObj = collection.deleteMany(where);
                }
    
                createObj.then(result => {
                    resolveAction(result);
                }).catch(error => {
                    commonFun.handleError(error , 'deleteQuery');
                })    
            });
            
        },
        count : (p) => {
            return new Promise(function(resolveAction, rejectAction) {
                let {collection , where} = p;
                var createObj = collection.countDocuments(where);
                createObj.then(result => {
                    resolveAction(result);
                }).catch(error => {
                    commonFun.handleError(error , 'countQuery');
                })    
            });
            
        },
        aggregate : (p) => {
            return new Promise(function(resolveAction, rejectAction) {
                let {collection , aggregateCnd} = p;
                var createObj = collection.aggregate(aggregateCnd);
    
                createObj.then(result => {
                    resolveAction(result);
                }).catch(error => {
                    commonFun.handleError(error , 'aggregateQuery');
                })    
            });
        },
        findOneAndUpdate : (p) => {
            return new Promise(function(resolveAction, rejectAction) {
                let {collection , where , data} = p;
                collection.findOneAndUpdate(where, data).then((result) => {
                    resolveAction(result);
                }).catch(error => {
                    commonFun.handleError(error , 'findOneAndUpdateQuery');
                }) ;
            });
            
        },
    },
    objectToQuery : (d) => {
        var str = [];
        for (var p in d) {
            str.push( encodeURIComponent(p) + "=" + encodeURIComponent(d[p] || "") );
        }
        return str.join("&");
    },
    


    randomText:(length)=> {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
          counter += 1;
        }
        return result;
    },

   sendMail:async (params ,data=true) => {
        try{
        let { hostname, port, username, password, email, to, subject, htmlbody,from } =  params;
        let transporter
            if(data==true)
            {
                transporter = nodemailer.createTransport({
                    host: hostname,
                    port: port,
                    secure: port == 465 ? true : false, 
                    auth: {
                        user: username, 
                        pass: password, 
                    },
                });
                let info = await transporter.sendMail({
                    from:  email ,
                    to: to, 
                    subject: subject, 
                    html: htmlbody, 
                });
                return info;
            }
            else
            {

                  transporter = nodemailer.createTransport(mandrillTransport({
                    auth: {
                      apiKey : process.env.MANDRILL_KEY
                    }
                }));
                let mailData={
                    from : from,
                    to : to,
                    subject : subject,
                    html : htmlbody
                 };

                 let info = await transporter.sendMail(mailData);
                 return info;
            }

        }
        catch(e){
            throw e
            return ;
        }
    },


}

module.exports = commonFun;
 