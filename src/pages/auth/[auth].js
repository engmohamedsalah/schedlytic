"use Client"
import React, { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { authAction } from '@/components/Common'
import svg from '../../components/svg'
import { appStore } from "@/zu_store/appStore";
import { toast } from 'react-toastify'

let Auth = ({ checkData }) => {

    let myStore = appStore(state => state);
    const router = useRouter();
    let [email, setEmail] = useState('');
    let [authType, setauthType] = useState('Login');
    let [password, setPassword] = useState('');
    let [confirmPassword, setConfirmPassword] = useState('');
    let [resetId, setResetId] = useState(0);
    let [isProcess, setIsProcess] = useState(false);

    var myState = {};

    let manageState = () => {
        myState = {
            email: email,
            password: password,
            confirmPassword: confirmPassword,
            resetId: resetId,
        }
        if (authType == 'reset-password') {
            setResetId(router.query.q);
        }
    }

    useEffect(() => {
        manageState();
    }, [email, password, confirmPassword, myState]);

    let onFormSubmit = async (submitType, myState) => {
       
        setIsProcess(true);
        authAction(submitType, myState, (authData) => {
            if(authData)
            {
                if(authData.profilePic !="null"){
                    authData['profile'] = process.env.S3_PATH + authData.profilePic
                }
                myStore.updateStoreData('userData', authData);
                
            }
            setIsProcess(false);
        })
    }
    let fogetPassword = async (type, data) => {
        if(isProcess)
        {
            return
        }
        setIsProcess(true);
        authAction(type, data, (authData) => {
          
            
            if(authData)
            {
                setEmail("")
                setauthType("Login")
            }
            setIsProcess(false);
            
        })
    }

    const handleSubmit = useCallback(async (e, type, stateDetails) => {
        e.stopPropagation();
        e.preventDefault();
        if(stateDetails.email.trim()=="")
        {
            toast.error("Email is required.")
            return
        }
        if(stateDetails.password.trim()=="")
        {
            toast.error("Password is required.")
            return
        }
        let em=/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

        if(!em.test(stateDetails.email.trim()))
        {
            toast.error("Email should be valid.")
            return
        }
        onFormSubmit(type, {
            ...stateDetails,
        });
    }, []);


    let pageTitleObj = {
        'login': 'Login',
        'forgot-password': 'Forgot Password',
        'reset-password': 'Reset Password',
    }

    return (
        <>
            <Head>
                <title>{process.env.SITE_TITLE}- {authType}</title>
            </Head>
            
            <div id="siteLoader"></div>
            <div className='rz_loginWrapper'>
                <div className='rz_loginWrapper_after'><img alt="" src="assets/images/auth/after.png" /></div>
                <div className='rz_auth_box' style={{backgroundImage:"url(/assets/images/auth_shape.png)"}}>
                    <div className='auth_img_box order-md-1 order-2'>
                        <img alt="" src="assets/images/auth/auth.png" />
                    </div>
                    <div className='rz_loginForm order-md-2 order-1'>
                        <form onSubmit={(e) => handleSubmit(e, authType, myState)} className='rz_form'>
                            {authType == 'Login' ?
                                <>
                                    <div className='rz_leftForm'>
                                        <span > <img src={process.env.APP_LOGO} alt="" /></span>
                                        <div className='rz_logo_auth'>
                                            <h3>Introducing <span>{process.env.SITE_TITLE}</span> </h3>
                                        </div>
                                        <p>Welcome back, please login to your account.</p>

                                        <div className='input_auth_box'>
                                            <div className='rz_custom_form auth_bor_b'>
                                                <label>Email Address</label>
                                                <input className='rz_customInput_auth' type='email' value={email} placeholder='Enter your email address' onChange={(e) => setEmail(e.target.value)} />
                                                <span className='rz_inputIcon'>{svg.app.emailIcon}</span>
                                            </div>
                                            <div className='rz_custom_form'>
                                                <label>Password</label>
                                                <input className='rz_customInput_auth' type='password' value={password} placeholder='Enter your password' onChange={(e) => setPassword(e.target.value)} />
                                                <span className='rz_inputIcon'>{svg.app.passwordIcon}</span>
                                            </div>
                                        </div>
                                        <div className='rz_checkboxHolder'>
                                            <div className='rz_remamberMe checkbox'>
                                                <input type="checkbox" id='remamberMe' />
                                                <label htmlFor='remamberMe'>
                                                    Remember Me
                                                </label>
                                            </div>
                                            <p onClick={() => {
                                                setauthType("Forgot password")
                                            }} className="rz_link">
                                                Forgot password?
                                            </p>
                                        </div>
                                        <div className='rz_btnHolder'>
                                            <button disabled={isProcess ? true : false} className='rz_customBtn rz_btn' style={{ "width": "100%" }} type='submit'>
                                                {isProcess ? 'Processing...' : 'Login To Your Account'}
                                            </button>
                                        </div>
                                    </div>
                                   
                                </>
                                :
                                authType == 'Forgot password' &&
                                    <>
                                        <div className='rz_leftForm'>
                                            <span >{svg.app.logo}</span>
                                            <h4>Forgot Password</h4>
                                            <span>Welcome back, please enter your details to continue.</span>
                                            <div className='input_auth_box'>
                                                
                                                <div className='rz_custom_form '>
                                                    <label>Email Address</label>
                                                    <input className='rz_customInput_auth' type='email' value={email} placeholder='Enter your email address' onChange={(e) => setEmail(e.target.value)} />
                                                    <span className='rz_inputIcon'>{svg.app.emailIcon}</span>
                                                </div>
                                            </div>
                                            <div className='rz_btnHolder'>
                                                <button  className='rz_customBtn rz_btn' style={{ "width": "100%" }} type='button' onClick={() => fogetPassword("forgot-password", { email })} >
                                                    {isProcess ? 'Processing...' : 'Submit'}
                                                </button>
                                            </div>
                                            <div className='rz_checkboxHolder text-center '>
                                                <span onClick={() => {
                                                    setauthType("Login")
                                                }} className="ps_back_login mx-auto">
                                                    Back to Login
                                                </span    >
                                            </div>
                                        </div>
                                       
                                    </>
                            }
                            <div className='rz_form_after'><img alt="" src="assets/images/auth/form_after1.png" /></div>
                            <div className='rz_form_after1'><img alt="" src="assets/images/auth/form_after2.png" /></div>
                            <div className='rz_form_after2'><img alt="" src="assets/images/auth/form_after3.png" /></div>
                        </form>

                    </div>
                </div>
            </div>
        </>
    )
}


let T = (props) => {
    return (
        <Auth checkData={props} />
    );
};

export async function getServerSideProps(context) {
    var data = {
        isVerifiedLink: true,
        userData: {}
    };

    if (['email-verification', 'reset-password'].includes(context.query.auth)) {

        if (Object.keys(context.query).length && context.query.q) {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + `auth/check-link?type=${context.query.auth}&q=${context.query.q}`)
            const respData = await res.json()

            data = {
                isVerifiedLink: respData.ok,
                userData: respData.data ? respData.data : {},
            }
        } else {
            data = {
                isVerifiedLink: false,
                userData: {}
            }
        }
    }

    return {
        props: data, 
    }
}


export default T


