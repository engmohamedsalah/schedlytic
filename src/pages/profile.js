import React, { useEffect, useState } from 'react'
import svg from '@/components/svg';
import Head from 'next/head';
import { common, setMyState } from '../components/Common';
import { toast } from 'react-toastify';
import { appStore } from '@/zu_store/appStore';
import { checkPassword } from '@/components/utils/utility';

export default function Profile() {
    const [isResetPassword, setIsResetPassword] = useState(false)

    useEffect(() => {
        getUser()
    }, [])


    let [state, setstate] = useState({
        password: "",
        confirmpassword: '',
        email: '',
        name: "",
        lastname: "",
        contactNumber: "",
        profile: "",
        plan: ''
    })

    let myStore = appStore(state => state);
    let userData = myStore.userData;

    function change(e) {
        setstate({
            ...state,
            [e.target.id]: e.target.value.trim()
        })
    }

    function getUser() {
        common.getAPI({
            method: 'GET',
            url: 'auth',
            data: {
                action: "getUser"
            },
        }, (resp) => {
            try{
            let data = resp.data
            userData["name"]=data.name
            if(data?.profile!="null")
            {
                userData['profile'] = process.env.S3_PATH + data.profile
            }
            myStore.updateStoreData("userData", userData)
            setstate({
                ...state,
                name: data.name,
                lastname: data.lastname,
                email: data.email,
                contactNumber: data.contactNumber,
                plan: resp?.plan?.name ? resp.plan.name : "",
            })
        }catch(e){
        }
        });
    }

    const updateProfileDetails = async () => {
        let data = {
            name: state.name,
            contactNumber: state.contactNumber,
            lastname: state.lastname,
            action: "updateDetails",
        }
        if (state?.password?.length > 0) {
            data['password'] = state.password
        }
        await common.getAPI({
            method: 'PUT',
            url: 'auth',
            data: data
        }, (resp) => {
            getUser();
            setIsResetPassword(false)
        });
    }


    let updateDetails = async (e) => {
        e.preventDefault()

        if (!state?.name || state?.name?.trim() == "") {
            toast.error("First name is required.")
            return;
        }
        if (!state?.lastname || state?.lastname?.trim() == "") {
            toast.error("Last name is required.")
            return;
        }

        if (state?.password.length > 0) {
            let isStrongPassword = CheckPassword(state?.password)
            if (!isStrongPassword) {
                toast.error("Password must be 8 characters long and contain at least one number, one capital letter and special character.")
                return
            }
        }

        if (state?.password != state?.confirmpassword) {
            toast.error("Password not match.")
            return;
        }
        updateProfileDetails();
    }

    const CheckPassword = (inputtxt) => {
        if (inputtxt.match(checkPassword)) {
            return true;
        }
        else {
            return false;
        }
    }

    const uploadProfile = async (e) => {
        if (e.target?.files[0]?.type == "image/jpeg" || e.target?.files[0]?.type == "image/png") {
            let selectedFile = e.target.files[0];

            let data = new FormData();
            data.append("file", selectedFile, selectedFile.name);
            await common.getAPI({
                method: 'POST',
                url: 'media?action=uploadProfile',
                data: data,
                isFormData: true,
            }, (resp) => {
                userData['profile'] = process.env.S3_PATH + resp.data.profile
                myStore.updateStoreData("userData", userData)
            });
        } else {
            toast.error('Please upload png/jpeg file type ');
        }
    }

    const togglePassword = () => {
        setIsResetPassword(false)
        setMyState(setstate, { password: "", confirmpassword: "" })
    }

    return (
        <>
            <Head>
                <title>{process.env.SITE_TITLE}- Profile</title>
            </Head>
            <div className='rz_dashboardWrapper' >
                <div className="ps_min_conatiner">
                    <div className=' welcomeWrapper'>
                        <div className="dash_header ">
                            <h2>Profile Settings</h2>
                        </div>
                        <div className='rz_tabContent'>
                            <div className='rz_tabPanel' tabid="1">
                                <div className=''>
                                    <form className='ps_pro'>
                                        <div className='ps_profile_img_box'>
                                            <div className='rz_custom_form_pro_box'>
                                                <div className='rz_custom_form_pro'>
                                                    <span > <img src={userData?.profile ? userData?.profile : "../assets/images/default_pro.png"} /></span>
                                                </div>
                                                <div className=''>
                                                    <div id="fileHelpId" className="form-text pb-3"><p>At least 125x125 px recommended</p> <p>jpeg or png image is allowed</p> </div>
                                                    <label htmlFor="rz_uploadAudio" className='rz_uploadBtn ps-0'>
                                                        <span className='ps_editor_back_button ms-md-0'>Upload Image</span>
                                                        <input id='rz_uploadAudio' type='file' className='rz_customFile ' accept={"images"} onChange={(e) => uploadProfile(e)} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='rz_socail_platform_bg  pt-md-4 pt-5 '>
                                            <div className='ps_profile_box_bg pb-0'>
                                                <div className='row'>

                                                    <div className='col-md-6'>
                                                        <div className="rz_custom_form">
                                                            <label className="form-label"> First Name <span className="text-danger">*</span></label>
                                                            <input value={state?.name} id="name" onChange={(e) => {
                                                                change(e)
                                                            }} name="full_name" type="text" className={`rz_customInput`}
                                                                placeholder="Enter your first name" />
                                                        </div>
                                                    </div>
                                                    <div className='col-md-6'>
                                                        <div className="rz_custom_form">
                                                            <label className='rz_label'>Last Name <span className="text-danger">*</span></label>
                                                            <input id="lastname" value={state?.lastname || ""} onChange={(e) => {
                                                                change(e)
                                                            }} name="last_name" type="text" className={`rz_customInput`}
                                                                placeholder="Enter your last name" />
                                                        </div>
                                                    </div>
                                                    <div className='col-md-6'>
                                                        <div className="rz_custom_form">
                                                            <label className='rz_label'>Contact Number </label>
                                                            <input id="contactNumber" value={state?.contactNumber || ""} onChange={(e) => {
                                                                e.target.value = e.target.value.replace(/\D/g, '')
                                                                change(e)
                                                            }} name="contact" type="text" className={`rz_customInput`}
                                                                placeholder="Enter your contact number" />
                                                        </div>
                                                    </div>
                                                    <div className='col-md-6'>
                                                        <div className="rz_custom_form">
                                                            <label className='rz_label'>Email Address <span className="text-danger">*</span></label>
                                                            <input id="email" value={state?.email} onChange={(e) => {
                                                                change(e)
                                                            }} disabled name="email" className={`rz_customInput`}
                                                                placeholder="Enter your email address" />
                                                        </div>
                                                    </div>
                                                    {/* {state.plan &&
                                                        <div className='col-md-6'>
                                                            <div className="rz_custom_form">
                                                                <label className='rz_label'>Plan Name </label>
                                                                <h6>{state.plan}</h6>
                                                            </div>
                                                        </div>
                                                    } */}
                                                    {isResetPassword ? <div className='ps_profile_password_box row'>
                                                        <div className="ps_profile_icon_close_btn" onClick={() => togglePassword()}> {svg.app.closeIcon}</div>
                                                        <div className='col-md-6 pb-md-0 pb-3'>
                                                            <div className="rz_custom_form mt-0">
                                                                <label className='rz_label'>New Password</label>
                                                                <input id="password" value={state?.password || ""} name="password" onChange={(e) => {
                                                                    change(e)
                                                                }} type="password" className={`rz_customInput`}
                                                                    placeholder="Enter your new password" />
                                                            </div>
                                                        </div>
                                                        <div className='col-md-6'>
                                                            <div className="rz_custom_form mt-0">
                                                                <label className='rz_label'>Confirm Password</label>
                                                                <input id="confirmpassword" value={state?.confirmpassword || ""} onChange={(e) => {
                                                                    change(e)
                                                                }} name="conf_password" type="password" className={`rz_customInput`}
                                                                    placeholder="Enter your confirm password" />
                                                            </div>
                                                        </div>



                                                    </div> : ""}
                                                    <div className='d-flex justify-content-start'>
                                                        <div className='mt-4 mx-1'><button disabled={process.env.TYPE == "demo" ? true : false} onClick={(e) => { updateDetails(e) }} className="rz_btn"><span>Update</span></button></div>
                                                        {!isResetPassword ? <div className='mt-4'><button onClick={() => setIsResetPassword(true)} className="rz_addAccBtn_blk"><span>Reset Password</span></button></div> : ""}
                                                    </div>
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
        </>
    )
}
