import svg from '@/components/svg';
import React, { useState, useEffect } from 'react';
import Head from 'next/head'
import { useRouter } from 'next/router';
import Link from 'next/link';
import moment from 'moment';
import MyModal from '@/components/common/MyModal';
import Select from 'react-select';
import {  common, setMyState } from '@/components/Common';
import { checkPassword } from '@/components/utils/utility';
import { toast } from 'react-toastify';
export default function UserDetails() {
    const [userDetails, setDetails] = useState({})
    const [post, setpost] = useState([])
    const [loading, setloading] = useState(false)
   
    const [postData, setpostData] = useState([])
    const [totlesclpost,settotalsclpost]=useState(0)
    const [totlependingpost,settotalpendingpost]=useState(0)
    const router = useRouter();
    const [plan,setPlan]=useState([])

        let [state, setQuery] = useState({
            name: '',
            email: '',
            password: '',
            status: 1,
            subscriptions: [],
            role: 'User',
            lastname: "",
            statusOption: [
                { label: 'Active', value: 1 },
                { label: 'In-Active', value: 0 }
            ],
            UserOption: [
                { label: 'User', value: "User" },
                { label: 'Template Creator', value: 'Template Creator' }
            ],
            modalShown: false,
            isEdit : "",
            plan : "",
            activepaymenttype : ""
        });
    useEffect(() => {
        if (router.query.id) {
            getPlanList();
            userData(router.query.id)
            checkactiveAccount()
        }

    }, [router.query.id])


    const checkactiveAccount = async () => {
        try {
          common.getAPI(
            {
              method: "GET",
              url: "subscription-plan",
              data: {
                action:"checkactive"
              },
              isLoader: true,
            },
            (resp) => { 
              if(resp.data)
              {
                setQuery({...state,
                    activepaymenttype : resp.data.type
                })
              }
           
            }
          );
         
        } catch (error) {
          console.error("Billing flow error:", error);
        }
      };

    const getPlanList=()=>{
        common.getAPI({
            method: 'GET',
            url: 'subscription-plan',
            data: {},
            isLoader: true
        }, (resp) => {
            if(resp.data){
                let d1=resp.data
                let data =[]
                for(let i=0; i<d1.length;i++){
                    data.push({
                        label : d1[i].name,
                        value : d1[i].id,
                    })
                }
                setPlan(data)
            }
        })
    }


    const userData = (data) => {
        setloading(true)
        common.getAPI(
            {
                method: "GET",
                url: "user",
                data: {
                    action: "user_analytics",
                    target: data
                },
            },
            (resp) => {
                if (resp.data) {
                    setDetails(resp.data.userDetails)

                    let social = [],pd=0,sl=0;
                    let socialMedia = resp.data.socialMedia
                    for (let i = 0; i < socialMedia.length; i++) {
                        let sdata = socialMedia.filter((d1) => d1.plateform == socialMedia[i].plateform)
                        let check = social.filter((d1) => d1.plateform == socialMedia[i].plateform)
                        if (check.length != 0) {
                            continue;
                        }
                        let s = {}
                        for (let j = 0; j < sdata.length; j++) {
                            if (!s[sdata[j].plateform]) {
                                s["plateform"] = sdata[j].plateform
                            }
                            if(sdata[j].status=="pending")
                            {
                                pd=pd+sdata[j].count
                            }else{
                                sl=sl+sdata[j].count
                            }
                            s[sdata[j].status] = sdata[j].count
                        }
                        social.push(s)
                    }
                    settotalpendingpost(resp.data?.postrate?.pending || 0)
                    settotalsclpost(resp.data?.postrate?.published || 0)
                    setpost(social)
                    setpostData(resp.data.posts)
                    setloading(false)
                }

            },
        );
    }

    const checklogo = (value) => {
        let d1 = {
            pinterest: { svg: svg.app.pinterst, color: "#bd081c" },
            instagram: { svg: svg.app.instagram, color: "#e4405f" },
            linkedin: { svg: svg.app.linkedin, color: "#0a66c2" },
            facebook: { svg: svg.app.facebook, color: "#1877f2" }
        }
        return d1[value]
    }

    let toggleModal = (updState = {}) => {
        setMyState(setQuery, {
            name: "",
            email: "",
            status: "",
            role: "",
            lastname:"",
            isEdit : "",
           modalShown: false,
           plan : ""
        });
    }

    let manageUsers = (e) => {
       
        e.preventDefault();
        let userDat = {
            name: state.name,
            email: state.email,
            password: state.password,
            lastname: state.lastname,
            status: state.status,
            role: state.role,
            plan : state.plan,
        };
        if (state.name.trim() == "") {
            toast.error("First name is required.")
            return;
        }
        if (state.lastname.trim() == "") {
            toast.error("Last name is required.")
            return;
        }
        if (state.email.trim() == "") {
            toast.error("Email is required.")
            return
        }
        if (state.plan.trim() == "") {
            toast.error("Plan is required.")
            return
        }

        if (state?.password.trimStart().length > 0) {
            if (!state.password.match(checkPassword)) {
                toast.error("Password must be minimum 8 character long and contain at least one number, one capital letter and one special character.")
                return
            }
        }
        userDat.target = state.isEdit;
        

        common.getAPI({
            method: 'PUT' ,
            url: 'user',
            data: userDat,
            isLoader: false
        }, (resp) => {
            setMyState(setQuery, {
                name: "",
                email: "",
                status: "",
                role: "",
                lastname:"",
                isEdit : "",
                modalShown: false,
            });
            userData(router.query.id)

        });
    }
    return (
        <>
            <Head>
                <title>{process.env.SITE_TITLE}- User Details</title>
            </Head>
            {!loading ? <div className='rz_dashboardWrapper' >
                <div className="ps_conatiner">
                    <div className=' welcomeWrapper'>
                        <div className="dash_header ">
                            <h2>User Details</h2>
                            <div className="ps_back"><Link href="/admin/users">{svg.app.backIcon}<span> Back</span></Link> </div>
                        </div>
                        {userDetails &&
                            <div className='rz_tabContent'>
                                <div className='rz_tabPanel' tabid="1">

                                    <form className=''>
                                        <div className='ps_userDetails_img_box'>
                                            <div className='upcomg_post_details_edit_icon' onClick={()=>{
                                                  setMyState(setQuery, {
                                                    name: userDetails?.name,
                                                    email: userDetails?.email,
                                                    status: userDetails?.status,
                                                    role: userDetails?.role,
                                                    lastname:userDetails?.lastname,
                                                    isEdit : userDetails._id,
                                                    modalShown: true,
                                                    plan : userDetails.planId
                                                });
                                            }}>{svg.app.edit_pen}</div>
                                            <div className='ps_admin_user_details_box'>
                                                <div className='rz_userDetails_form_pro m-auto'>
                                                    <span > <img src={(userDetails?.profile && userDetails?.profile !="null")  ? process.env.S3_PATH+userDetails.profile : "../assets/images/default_pro.png"} /></span>
                                                </div>
                                                <div className=''>

                                                    <h5> {userDetails?.name} {userDetails?.lastname}</h5>
                                                    <h6>  {userDetails?.email}</h6>
                                                    {userDetails?.contactNumber && <h6><span>Contact No.</span> {userDetails.contactNumber}</h6>}

                                                    <div className='ps_admin_user_details_type'>
                                                        <div><span>User Type :</span> {userDetails?.role} </div>
                                                        <div className='d-flex align-items-center gap-2'>
                                                            <span>Account Status :</span> <div className='ps_admin_user_details_active'><span>{userDetails?.status == 1 ? "Active" : "Deactive"}</span>
                                                            </div>
                                                        </div>


                                                    </div>

                                                </div>
                                            </div>
                                            <div className='ps_user_details_total_box'>
                                                <div><span>Total Published Posts : </span> {totlesclpost}</div>
                                                <div><span>Total Scheduled Posts : </span> {totlependingpost}</div>
                                            </div>
                                        </div>
                                    </form>


                                </div>
                            </div>
                        }
                        {
                            post && post.length > 0 && postData && postData.length > 0 &&

                            <div className='rz_socail_platform_bg  pt-md-4 pt-5 '>
                                <div className='pt-md-5 pt-3'>
                                    <div className='row'>
                                        <div className='col-md-6'>


                                            {post && post.length > 0 && <div className='ps_schedule_box '>
                                                <div className='ps_user_details_box_table'>
                                                    <div className="table-responsive">
                                                        <table className="table">
                                                            <thead>
                                                                <tr>
                                                                    <th scope="col">Social Media Account</th>
                                                                    <th scope="col">Pending</th>
                                                                    <th scope="col">Successful</th>
                                                                    <th scope="col">Total</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {
                                                                    post && post.length > 0 && post.map((data ,i) => {
                                                                        let d1 = checklogo(data.plateform)
                                                                        return (<tr key ={i}>
                                                                            <th scope="row">
                                                                                <div className="d-flex align-items-center">
                                                                                    <div className="dash_icon_box" style={{ "background": d1.color }}>
                                                                                        {d1.svg}
                                                                                    </div>
                                                                                    <span>{data.plateform}</span>
                                                                                </div>
                                                                            </th>
                                                                            <td>{data?.pending || 0}</td>
                                                                            <td>{data.Sucess}</td>
                                                                            <td>{(data?.pending || 0) +(data?.Sucess || 0)}</td>
                                                                        </tr>)
                                                                    }
                                                                    )
                                                                }
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                </div>
                                            </div>}


                                        </div>
                                        <div className='col-md-6 mt-md-0 mt-4'>
                                            {postData && postData.length > 0 &&
                                                <div className='ps_schedule_box'>
                                                    <div className="" >
                                                        <div className="dash_header  mb-0">
                                                            <h3 className="mb-0">Recent Posts</h3>
                                                        </div>
                                                        <div className=" ">
                                                            {postData.map((postData, i) => {
                                                                return <div className="upcomg_post_box " key={i}>
                                                                    <div className="upcomg_post_details">

                                                                        <div className="dash_icon_box" >
                                                                            {postData?.url ? <div className='ps_dash_comming_box '> <img src={postData?.posttype=="video" ? postData.thumb :postData?.url} /></div> :
                                                                                <div className="ps_dash_comming_box"><p>{postData?.text}</p> </div>}
                                                                        </div>
                                                                        <div className="upcomg_post_text">
                                                                            <p>{postData?.title}</p>

                                                                        </div>
                                                                    </div>
                                                                    <div className="ps_upcoming_date_box">
                                                                        <div className="d-flex gap-2 me-2">
                                                                            <span className="upcomg_post_date">{moment(postData.scheduleDate).format("YYYY-MMM-DD")}</span>
                                                                            <span className="upcomg_post_date">{moment(postData.scheduleDate).format("hh:mm A")}</span>
                                                                        </div>


                                                                    </div>
                                                                </div>
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        </div>

                                    </div>
                                </div>

                            </div>
                        }
                    </div>


                </div>
            </div> :
                <div className="spinner-border" style={{ color: "#e74c3c" }} role="status">
                    <span className="sr-only"></span>
                </div>

            }

<MyModal
                shown={state.modalShown}
                close={() => {
                    
                    toggleModal();
                }}
            >
                <form onSubmit={e => {
                    manageUsers(e)
                }}>
                    <div className="modal-body">
                        <div className='modal_body_scroll'>
                            <div className="modal-header">
                                <h3>{state.isEdit ? 'Update User' : 'Add New User'}</h3>
                            </div>
                            <div className='row'>

                                <div className='col-md-6'>
                                    <div className='rz_custom_form mt-0'>
                                        <label className="form-label"> First Name <span className="text-danger">*</span></label>
                                        <input type='text' className='rz_customInput' placeholder='Enter first name' value={state.name} onChange={e => {
                                            setMyState(setQuery, {
                                                name: e.target.value,
                                            });
                                        }} />
                                    </div>
                                </div>

                                <div className='col-md-6 pt-md-0 pt-3'>
                                    <div className='rz_custom_form mt-0'>
                                        <label className="form-label"> Last Name <span className="text-danger">*</span></label>
                                        <input type='text' className='rz_customInput' placeholder='Enter last name' value={state.lastname} onChange={e => {
                                            setMyState(setQuery, {
                                                lastname: e.target.value,
                                            });
                                        }} />
                                    </div>
                                </div>


                                <div className='rz_custom_form'>
                                    <label className="form-label"> Enter Email <span className="text-danger">*</span></label>
                                    <input type='email' readOnly={state.isEdit ? true : false} className='rz_customInput' placeholder='Enter email' value={state.email} onChange={e => {
                                        setMyState(setQuery, {
                                            email: e.target.value,
                                        });
                                    }} />
                                </div>

                                <div className='rz_custom_form'>
                                    <div className='d-flex'><label className="form-label"> Enter Password </label> <div className='ps_admin_password_tooltip'>{svg.app.i_icon}  <span className='rz_tooltipSpan'>Password should be at least 1 number and 1 special character.</span></div></div>
                                    <input type='password' className='rz_customInput' placeholder='Enter password' value={state.password} onChange={e => {
                                        setMyState(setQuery, {
                                            password: e.target.value,
                                        });
                                    }} />
                                </div>

                                <div className='col-md-6'>
                                    <div className='rz_custom_form'>
                                        <div className='rz_custom_form rz_customSelect'>
                                            <label className="form-label">Select User Status <span className="text-danger">*</span></label>
                                            <Select
                                                placeholder={'Choose Status'}
                                                options={state.statusOption}
                                                value={state.statusOption.filter(option => option.value == state.status)}
                                                onChange={e => {
                                                    setMyState(setQuery, {
                                                        status: e.value,
                                                    });
                                                }}
                                                theme={(theme) => ({
                                                    ...theme,
                                                    colors: {
                                                    ...theme.colors,
                                                      primary: 'var(--primaryColor)',
                                                    },
                                                  })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className='col-md-6'>
                                    <div className='rz_custom_form'>
                                        <div className='rz_custom_form rz_customSelect'>
                                            <label className="form-label">Select User Type <span className="text-danger">*</span></label>
                                            <Select
                                                placeholder={'User Type'}
                                                options={state.UserOption}
                                                value={state.UserOption.filter(option => option.value == state.role)}
                                                onChange={(e) => {
                                                    setMyState(setQuery, {
                                                        role: e.value,
                                                    });
                                                }}
                                                theme={(theme) => ({
                                                    ...theme,
                                                    colors: {
                                                    ...theme.colors,
                                                      primary: 'var(--primaryColor)',
                                                    },
                                                  })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-6'>
                                    <div className='rz_custom_form'>
                                        <div className='rz_custom_form rz_customSelect'>
                                            <label className="form-label">Select Plan <span className="text-danger">*</span></label>
                                            
                                            <Select autoComplete="off"
                                                placeholder={'User Type'}
                                                options={plan}
                                                isDisabled={state.activepaymenttype != userDetails.paymenttype }
                                               value={plan.filter(option => option.value == state.plan)}
                                                onChange={(e) => {
                                                    setMyState(setQuery, {
                                                        plan: e.value,
                                                    });
                                                }}
                                                theme={(theme) => ({
                                                    ...theme,
                                                    colors: {
                                                    ...theme.colors,
                                                      primary: 'var(--primaryColor)',
                                                    },
                                                  })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='d-flex justify-content-center mt-4'><button className='rz_btn'>{state.processAction ? 'processing...' : 'Update'}</button></div>
                        </div>
                    </div>
                </form>
            </MyModal>




            

        </>
    )
}

