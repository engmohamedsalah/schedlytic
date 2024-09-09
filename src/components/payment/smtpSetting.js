"useClient"
import { useState, useEffect } from "react";
import {  common } from '@/components/Common';
import { toast } from 'react-toastify';
export default function SmtpSetting(){

    const [state,setstate]=useState({
        name : "",
        email : "",
        hostname : "",
        port : "",
        username: "",
        password : ""
    })


    useEffect(()=>{
        getDetails()
    },[])

    const changeValue =(e)=>{
        setstate({
            ...state,
            [e.target.id] : e.target.value
        })
    }

    const saveSmtpDetails=(e)=>{
        let data ={
            ...state
        }

        let data1 = Object.keys(state);
    for (let i = 0; i < data1.length; i++) {
      if (typeof state[data1[i]] !="boolean"  && state[data1[i]].trim() == "" ) {
        toast.error(data1[i].split("_").join(" ") + " is required.")
        return;
      }
    }
        common.getAPI({
            method: 'POST',
            url: 'user',
            data: {
              ...data,
              action : "saveSmtp"
            },
        }, (resp) => {
            
        })
    }

    const getDetails=(e)=>{
        common.getAPI({
            method: 'GET',
            url: 'user',
            data: {
              action : "smtp"
            },
        }, (resp) => {
            if(resp.data)
            {
                setstate({...resp.data.data})
            }
            
        })
    }
    return (
        <>
            <div>

                <div className="">
                    <div className="">
                        <div className="ps_integ_conatiner">
                            <div className="">


                                <div className="row">
                                    <div className="col-xl-12 col-lg-12 col-md-12">
                                        <div className="ps_schedule_box" >
                                            <form>
                                                <div className="row">
                                                    <div className="col-lg-6">

                                                        <div className="rz_custom_form ap_require">
                                                            <label className="form-label">Form Name <span className="text-danger">*</span></label>
                                                            <input
                                                                value={state.name}
                                                                onChange={(e)=>changeValue(e)}
                                                                id="name"
                                                                type="text"
                                                                className="rz_customInput ap_input require"
                                                                placeholder="Enter name"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6">

                                                        <div className="rz_custom_form ap_require">
                                                            <label className="form-label">  Form Email <span className="text-danger">*</span></label>
                                                            <input
                                                                value={state.email}
                                                                onChange={(e)=>changeValue(e)}
                                                                id="email"
                                                                type="email"
                                                                className="rz_customInput ap_input require"
                                                                placeholder="Enter email"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6">

                                                        <div className="rz_custom_form ap_require">
                                                            <label className="form-label">Host Name <span className="text-danger">*</span></label>
                                                            <input
                                                              value={state.hostname}
                                                              onChange={(e)=>changeValue(e)}
                                                              id="hostname"
                                                                type="text"
                                                                className="rz_customInput ap_input require"
                                                                placeholder="Enter host name"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6">

                                                        <div className="rz_custom_form ap_require">
                                                            <label className="form-label">  HTTP Port <span className="text-danger">*</span></label>
                                                            <input
                                                                value={state.port}
                                                                id="port"
                                                                onChange={(e)=>changeValue(e)}
                                                                type="text"
                                                                className="rz_customInput ap_input require"
                                                                placeholder="Enter http port"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6">

                                                        <div className="rz_custom_form ap_require">
                                                            <label className="form-label">User Name <span className="text-danger">*</span></label>
                                                            <input
                                                             value={state.username}
                                                             id="username"
                                                             onChange={(e)=>changeValue(e)}
                                                                type="text"
                                                                className="rz_customInput ap_input require"
                                                                placeholder="Enter user name"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6">

                                                        <div className="rz_custom_form ap_require">
                                                            <label className="form-label"> Password <span className="text-danger">*</span></label>
                                                            <input
                                                            value={state.password}
                                                            id="password"
                                                            onChange={(e)=>changeValue(e)}
                                                                type="text"
                                                                className="rz_customInput ap_input require"
                                                                placeholder="Enter password"
                                                            />
                                                        </div>
                                                    </div>



                                                    <div className="col-lg-12">
                                                        <div className="justify-content-start mt-3">
                                                            <button
                                                                type="button"
                                                                onClick={(e)=>{
                                                                    saveSmtpDetails(e)
                                                                }}
                                                                className="rz_addAccBtn addServiceData"
                                                            >
                                                                Update
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </>
    );
};


