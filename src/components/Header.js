import React, { useState } from 'react'
import { useRouter } from 'next/router';
import svg from './svg';
import MyModal from './common/MyModal';
import Select from 'react-select';
import { toast } from "react-toastify";
import {setMyState, logout } from '@/components/Common';
import ConfirmationPopup from "./common/ConfirmationPopup";
import { appStore } from "@/zu_store/appStore";


let Header = () => {
    let storeData = appStore(state => state);
    let userData = storeData.userData;
    let postData = storeData.postData;
    const [isShow,setIsShow]=useState(false)
    const router = useRouter();

    let isActive = (route) => {
        let pathname = router.pathname;
        if (route == pathname) {
            return "active";
        } else "";
    };

    let [state, setQuery] = useState({
        createReelPopup: false,
        step: 1,
        reelType: null,
        title: '',
        reelCate: null,
        reelSubCate: null,
        reelTones: null,
        productTitle: '',
        keyFeature: '',

        createTemplatePopup: false,
        tempTitle: '',
        category: null,
        subCategory: null,
        tags: '',

        toggleBtn: false,
        categoriesList: [],
        chatGptTone: [
            'Encouraging',
            'Persuasive',
            'Thoughtful',
            'Personal',
            'Witty',
            'Funny',
            'Empathetic',
            'Compassionate',
        ].map(d => {
            return { label: d, value: d }
        })
    })


    const changePage = (e, data) => {
        if (router.pathname === "/create_post") {
            if (router.query.id) {
                router.query = {}
            }
        }
        if (router.pathname === "/calendar") {
            storeData.updateStoreData("calendarDate", "")
        }
        e.preventDefault()
        router.push(data);
        storeData.updateStoreData("postData", {})
    }

    return (
        <>
            <div className='rz_mainHeader'>
                <div className='ps_conatiner-fluid'>
                    <div className='row align-items-center'>
                        <div className='col-md-2 col-2'>
                            <div className='rz_logo'>                             
                                    <span>   <img src={process.env.APP_LOGO} alt="" /></span>
                            </div>
                        </div>
                        <div className='col-md-8 px-0 col-8'>
                            <div expand="lg" className="rz_navMenu">
                                <div className='rz_nav_box'>
                                    <div className={`rz_menuOverlay ${state.toggleBtn == true ? 'rz_show' : 'rz_hide'}`}
                                        onClick={() => setMyState(setQuery, { toggleBtn: !state.toggleBtn })}
                                    ></div>
                                    <div id="navbarScroll" className={state.toggleBtn == true ? 'navbarScroll openMenu' : 'navbarScroll'} >
                                        <a className='navBarToggle' onClick={(e) => setMyState(setQuery, { toggleBtn: !state.toggleBtn })} >
                                            <span></span>
                                        </a>
                                        <ul
                                            className="navbar-scroll"
                                            style={{ maxHeight: '100px' }}
                                        >
                                            {
                                                userData.role == 'Admin' ?
                                                    <>
                                                        <li>
                                                            <a onClick={(e) => {
                                                                changePage(e, "/admin/dashboard")
                                                            }}
                                                                className={isActive("/admin/dashboard") ? "nav-link active" : "nav-link "}
                                                            >
                                                                <span>{svg.app.dashBoard}</span>Dashboard
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a onClick={(e) => {
                                                                changePage(e, "/admin/users")
                                                            }} className={isActive("/admin/users") ? "nav-link active" : "nav-link"}>
                                                                <span>{svg.app.userIcon}</span>Users</a>
                                                        </li>
                                                        <li>
                                                            <a onClick={(e) => {
                                                                changePage(e, "/admin/templates")
                                                            }} className={isActive("/admin/templates") ? "nav-link active" : "nav-link "}>
                                                                <span>{svg.app.myReels}</span>Templates
                                                            </a>
                                                        </li>
                                                        {/* <li>
                                                            <a onClick={(e) => {
                                                                changePage(e, "/admin/assets")
                                                            }} className={isActive("/admin/assets") ? "nav-link active" : "nav-link "}>
                                                                <span>{svg.app.categories}</span>Assets
                                                            </a>
                                                        </li> */}
                                                        <li>
                                                            <a onClick={(e) => {
                                                                changePage(e, "/admin/assets_tabs")
                                                            }} className={isActive("/admin/assets_tabs") ? "nav-link active" : "nav-link "}>
                                                                <span>{svg.app.categories}</span>Assets
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a onClick={(e) => {
                                                                changePage(e, "/admin/setting")
                                                            }} className={isActive("/admin/setting") ? "nav-link active" : "nav-link "}>
                                                                <span>{svg.app.Plan_icon}</span>Plans
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a onClick={(e) => {
                                                                changePage(e, "/admin/paymentSetting")
                                                            }} className={isActive("/admin/paymentSetting") ? "nav-link active" : "nav-link "}>
                                                                <span>{svg.app.settings}</span>Integrations
                                                            </a>
                                                        </li>
                                                      
                                                    </>

                                                    : "" }
                                                  { userData.role == 'User' ?  <>
                                                        <li>
                                                            <a onClick={(e) => {
                                                                changePage(e, "/dashboard")
                                                            }}
                                                                className={isActive("/dashboard") ? "nav-link active" : "nav-link "}
                                                            >
                                                                <span>{svg.app.dashBoard}</span>Dashboard
                                                            </a>
                                                        </li>
                                                          
                                                        <li>
                                                            <a onClick={(e) => {
                                                               
                                                                setIsShow(true)
                                                                changePage(e, "/create_post")
                                                            }} className={!router.query.id && isActive("/create_post") ? "nav-link active" : "nav-link "}>
                                                                <span>{svg.app.create_post}</span>Create Post
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a onClick={(e) => {
                                                                changePage(e, "/calendar")
                                                            }} className={isActive("/calendar") ? "nav-link active" : "nav-link "}>
                                                                <span>{svg.app.myReels}</span>Calendar
                                                            </a>
                                                        </li>
                                                       {userData?.plan?.editor_access && 
                                                         <li>
                                                            <a onClick={(e) => {
                                                                changePage(e, "/image_editor/image_edit")
                                                            }} className={isActive("/image_editor/image_edit") ? "nav-link active" : "nav-link "}>
                                                                <span>{svg.app.image_creator}</span>Image Creator
                                                            </a>
                                                        </li>
                                                        }
                                                        <li>
                                                            <a onClick={(e) => {
                                                                changePage(e, "/Integrations")
                                                            }} className={isActive("/Integrations") ? "nav-link active" : "nav-link "}>
                                                                <span>{svg.app.integration}</span>Integrations
                                                            </a>
                                                        </li>
                                                        
                                                    </> : ""
                                            }

{
                                                userData.role == 'Template Creator' ?
                                                    <>
                                                        <li>
                                                            <a onClick={(e) => {
                                                                changePage(e, "/admin/templates")
                                                            }} className={isActive("/admin/templates") ? "nav-link active" : "nav-link "}>
                                                                <span>{svg.app.myReels}</span>Templates
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a onClick={(e) => {
                                                                changePage(e, "/admin/assets")
                                                            }} className={isActive("/admin/assets") ? "nav-link active" : "nav-link "}>
                                                                <span>{svg.app.categories}</span>Assets
                                                            </a>
                                                        </li>
                                                    </>
                                                    : "" }


                                        </ul>
                                    </div>
                                </div>

                            </div>
                            {process.env.TYPE=="demo" &&
                            <p className='rz_note_for_demo'><b>Note: </b>Feel free to test all the features before purchasing, keep in mind that some features are disabled in Demo mode.</p>
                            }
                            </div>
                        <div className='col-md-2 col-2'>
                            <div className='rz_rightHeader'>


                                <div className='rz_profileDropdown'>
                                    <div className='rz_userDropdown'>
                                        { userData.profile ? <span className='rz_userImg'> <img src={userData?.profile}  alt="Loading"/>    </span>
                                        :<span className='rz_userImg'> <img src='../assets/images/default_pro.png'  alt="Loading"/></span>}
                                        <p>{userData?.name}</p>
                                        <div style={{ marginLeft: "5px" }}>
                                            {svg.app.profile_dropdown}
                                            <div className='rz_dropdownHolder'>
                                                <ul>
                                                    <li><a className='rz_listMenu' onClick={(e) => {
                                                        changePage(e, "/profile")
                                                    }}>My Account</a></li>

                                                   
                                                    <li>
                                                        <a className='rz_listMenu' disabled onClick={() => {
                                                            logout(() => {
                                                                storeData.updateStoreData('userData', {});
                                                                storeData.updateStoreData('categoriesData', {});
                                                                storeData.updateStoreData('editorData', []);
                                                                storeData.updateStoreData('postData', {});
                                                                storeData.updateStoreData('multiPostData', []);
                                                                router.push('/login');
                                                            })
                                                        }}>
                                                            Logout
                                                        </a>

                                                    </li>
                                                </ul>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <MyModal
                shown={state.createTemplatePopup}
                close={() => {
                    setMyState(setQuery, {
                        createTemplatePopup: false
                    })
                }}
            >
                <div className="modal-body">

                    <div className="modal-header">
                        <h3>Create New Template</h3>
                    </div>
                    <div className='rz_creatReels'>
                        <div className='rz_custom_form'>
                            <input type='text' className='rz_customInput' placeholder='Enter Title' value={state.tempTitle} onChange={e => {
                                setMyState(setQuery, {
                                    tempTitle: e.target.value
                                })
                            }} />
                        </div>
                    </div>
                    <div className='rz_creatReels'>
                        <div className='rz_custom_form rz_customSelect'>
                            <Select
                                placeholder={'Choose Category'}
                                options={state.categoriesList}
                                onChange={e => {
                                    setMyState(setQuery, {
                                        category: e.value.cate,
                                        subCategory: e.value.subCate
                                    })
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
                    <div className='rz_creatReels'>
                        <div className='rz_custom_form'>
                            <input type='text' className='rz_customInput' placeholder='Enter Tags' value={state.tags}
                                onChange={e => {
                                    setMyState(setQuery, {
                                        tags: e.target.value
                                    })
                                }} />
                        </div>
                    </div>
                    <button className='rz_btn' onClick={(e) => createNewTemplate(e)}>Continue</button>
                </div>

            </MyModal>
          
        </>

    )
}
export default Header