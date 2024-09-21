import React, { useEffect, useState } from 'react'
import Select from 'react-select';
import svg from '@/components/svg';
import Head from 'next/head'
import MyModal from '@/components/common/MyModal';
import { NoDataWrapper, common, setMyState } from '@/components/Common';
import { toast } from "react-toastify";
import  { useRouter } from 'next/router';
import ConfirmationPopup from '@/components/common/ConfirmationPopup';
import { appStore } from "@/zu_store/appStore";
const options = [

    { value: 'Square', label: 'Square' },
    { value: 'Portrait', label: 'Portrait' },
    { value: 'Landscape', label: 'Landscape' },
    { value: 'Custom', label: 'Custom' },
];

export default function Image_edit_Page() {
    let createUsr = {
        name: '',
        layout: "",
        height: "",
        width: "",
        email: '',
        password: '',
        status: '',
        subscriptions: [],
        usertype: '',
        page: 1,
        templateId: "",
        templateurl: "",


    };

    let [state, setQuery] = useState({
        name: "",
        userLoading: false,
        modalShown: false,
        ...createUsr,
        isRemoveAction: false,
        templates: [],
        templatesCount: 0,
        templatesLoading: false,
        page: 1,
        keyword: [],
        loaderh: false,
        templateId: "",
    });


    const [isRemoveAction, setIsRemoveAction] = useState(false);
    const router = useRouter();
    const [isTemplateModel, setIsTemplateModel] = useState(false);
    const [ispreviewModel, setIsPreviewModel] = useState(false);
    const [isUseModel, setIsUseModel] = useState(false);
    const [useImage, setUseImage] = useState();
    const [priviewImage, setPriviewImage] = useState();
    const [currentTab, setCurrentTab] = useState("userTemplate");
    const [load, setload] = useState(false)
    let storeData = appStore(state => state);
    let userData = storeData.userData;

    useEffect(() => {
        if(userData?.plan?.editor_access==false){
            router.push("/")
        }
        setload(true)
        getTemplateList('search');
    }, [state.keyword, currentTab]);

 
    const handleUseTempEvent = (val) => {
        if (val.layout == "Custom") {
            setQuery({
                ...state,
                layout: val.layout,
                height: val.height,
                width: val.width,
                templateId: val._id,
                templateurl: process.env.S3_PATH + val.url
            })
        }
        else {
            setQuery({
                ...state,
                layout: val.layout,
                templateId: val._id,
                templateurl: process.env.S3_PATH + val.url
            })
        }
        setUseImage(val)
        setIsUseModel(true)
    }
    const handlePreviewEvent = (val) => {
        setPriviewImage(val)
        setIsPreviewModel(true)
    }

    const handleSelectChange = (e) => {
        setQuery({
            ...state,
            layout: e.value
        })
    }


    let toggleModalUseTemp = () => {
          setQuery({ ...state, templateId: "" , name: '',
          layout: "",
          height: "",
          width: ""});
        setIsUseModel(false)
    }

    let createTemplate = () => {
        let data = {
            title: state.name,
            layout: state.layout,
        }
        if (state.templateId) {
            data.templateId = state.templateId
        }
        if (state.name == "") {
            toast.error("Title is required. ")
            return
        }
        if (state.layout == "") {
            toast.error("Layout is required.")
            return
        } else {
            if (state.layout == "Custom") {
                if (state.height == "") {
                    toast.error("Height is required.")
                    return
                }
                if (state.height < 100) {
                    toast.error("Height must be greater than 100px.")
                    return
                }

                if (state.height > 2000) {
                    toast.error("Height must be less than 2000px.")
                    return
                }


                if (state.width == "") {
                    toast.error("Width is required.")
                    return
                }

                if (state.width < 100) {
                    toast.error("Width must be greater than 100px .")
                    return
                }

                if (state.width > 2000) {
                    toast.error("Width must be less than 1120px .")
                    return
                }
                data.meta = {}
                data.meta.height = state.height
                data.meta.width = state.width,
                    data.data = {}
            }
        }
        common.getAPI(
            {
                method: "POST",
                url: "templates",
                data: data,
            },
            (resp) => {
                router.push("/editor/" + resp.data.id);
            },
        );
    }

    let getTemplateList = (type = null) => {
        if (state.templatesLoading) {
            return;
        }

        setQuery({ ...state, templatesLoading: true });
        let currentPage = type == 'loadMore' ? state.page + 1 : (type == 'search' ? 1 : state.page);

        let data = {
            page: currentPage,
            limit: 10,
            keyword: state.keyword
        }
        if (currentTab == "adminTemplate") {
            data["type"] = "templates"
        }
        common.getAPI(
            {
                method: "GET",
                url: "templates",
                data: data,
            },
            (resp) => {
                setload(false)
                setQuery({
                    ...state,
                    templates: type == 'loadMore' ? [...state.templates, ...resp.data] : resp.data,
                    templatesLoading: false,
                    templatesCount: resp.totalRecords,
                    page: currentPage
                })
            },
        );
    }

    return (
        <>
            <Head>
            <title>{process.env.SITE_TITLE}- Create Image</title>   
            </Head>
            <div className='rz_dashboardWrapper' >
                <div className='ps_conatiner'>
                    <div className=' welcomeWrapper'>
                        <div className="dash_header  ">
                            <h2>{currentTab === "adminTemplate" ? " Templates":  "My Images" }</h2>
                           
                        </div>
                        <div className='rz_strackDv '>
                            <div className="width100 py-3 pt-md-3 pt-1">
                                <div className='rz_searchBox'>
                                    <div className='rz_custom_form'>
                                        <input type='search' placeholder='Search' className='rz_customInput'
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' || e.keyCode === 13 || e.which === 13) {
                                                    setQuery({ ...state, page: 1, keyword: e.target.value });
                                                }
                                            }}
                                        />
                                        <span className='rz_inputIcon'>{svg.app.searchIcon}</span>
                                    </div>
                                </div>
                            </div>

                            <div className=" ms-md-auto">
                                <div className='ps_image_editor_btn_box'>
                                {currentTab != "adminTemplate"  && 
                                    <a className='rz_btn' onClick={() => setIsTemplateModel(true)}> Create Image   </a> }
                                    {currentTab === "adminTemplate" ? <a className='rz_addAccBtn_blk' onClick={() => setCurrentTab("userTemplate")} > My Images</a>
                                        : <a className='rz_addAccBtn_blk' onClick={() => setCurrentTab("adminTemplate")} >Templates</a>}
                                </div>
                            </div>
                        </div>

                        <div className='row'>
                            <div className='ps_images_edit_scroll_box'>
                                <div className='template_box'>
                                    {load == false && state.templates.map((template, i) => {
                                        return <div key={i} className='template_inner' >
                                            <div className='template_inner_img'>
                                                {template.url ? <>
                                                    <img src={process.env.S3_PATH + template.url} />
                                                </> :
                                                    <img src={"../nothumb.png"} />

                                                }

                                                <div className="spv-stockImage">
                                                    {template.url &&
                                                        <a className="spv-btn spv-viewBtn" onClick={() => handlePreviewEvent(template.url)}>
                                                            {svg.app.eyeIcon}
                                                        </a>
                                                    }
                                                    {
                                                        currentTab == "userTemplate" &&
                                                        <a className="spv-btn spv-viewBtn" onClick={() => {
                                                            setQuery({ ...state, templateId: template._id });
                                                            setIsRemoveAction(true)
                                                        }} >
                                                            {svg.app.deleteIcon}
                                                        </a>
                                                    }

                                                </div>
                                            </div>

                                            <div className='rz_editIcon' onClick={() => {
                                                if (currentTab === "userTemplate") {
                                                    router.push("/editor/" + template._id);
                                                }
                                                else {
                                                    handleUseTempEvent(template)
                                                }

                                            }}> {svg.app.image_editor}</div>
                                            <div className='ps_template_text'>
                                                <h6>{template.title}</h6>
                                              
                                            </div>
                                        </div>
                                    })}
                                </div>
                            </div>
                        </div>


                        {
                            <NoDataWrapper
                                isLoading={state.templatesLoading}
                                blockCount="5"
                                height="200"
                                width="150"
                                className="ps_skelton_div px-1 py-2"
                                section="blocks"
                                dataCount={state.templates.length}
                                title={currentTab === "adminTemplate" ? " Templates not found.":  "Images not found."}
                            />
                        }
                        {
                            state.templates.length < state.templatesCount ?
                                <div className='rz_col_12'>
                                    <a className='ps_image_creator_blk_btn' style={{ margin: "20px auto" }} onClick={() => {
                                        getTemplateList("loadMore");
                                    }}>{state.templatesLoading ? 'Loading...' : 'Load More'}{svg.app.loadmore}
                                    </a>
                                </div>
                                : <></>
                        }
                    </div>
                </div>
            </div>

            <MyModal
                shown={isTemplateModel}
                close={() => {
                    setIsTemplateModel(false)
                }}
            >
                <form onSubmit={e => {
                    e.preventDefault()
                    createTemplate(e)
                }}>
                    <div className="modal-body">
                        <div className="modal-header">
                            <h3>{state.isEdit ? 'Update template' : 'Create Image'}</h3>
                        </div>
                        <div className='rz_creatReels'>
                            <div className='rz_custom_form'>
                            <label className="form-label ">Title <span className="text-danger">*</span></label>
                                <input type='text' onChange={(e) => {
                                    setQuery({
                                        ...state,
                                        name: e.target.value
                                    })
                                }} className='rz_customInput' placeholder='Enter title' value={state.name} />
                            </div>
                        </div>
                        <label className="form-label ">Layout <span className="text-danger">*</span></label>
                        <div className='rz_creatReels'>
                       
                            <div className='rz_custom_form rz_customSelect'>

                                <Select
                                    placeholder={'Select layout size'}
                                    options={options}
                                    onChange={handleSelectChange}
                                />
                            </div>
                        </div>

                        {state.layout === "Custom" ? <div className='rz_creatReels row'>
                           
                            <div className='col-md-6'>
                            <label className="form-label ">Custom Height <span className="text-danger">*</span></label>
                                <div className='rz_custom_form'>
                                    <input type='Number' className='rz_customInput' onChange={(e) => {
                                        setQuery({
                                            ...state,
                                            height: e.target.value
                                        })
                                    }} placeholder='Enter height' value={state.height} />
                                </div>
                            </div>
                            <div className='col-md-6'>
                            <label className="form-label ">Custom Width <span className="text-danger">*</span></label>
                                <div className='rz_custom_form'>
                                    <input type='Number' className='rz_customInput' onChange={(e) => {
                                        setQuery({
                                            ...state,
                                            width: e.target.value
                                        })
                                    }} placeholder='Enter width' value={state.width} />
                                </div>
                            </div>
                        </div> : ""}

                        <div className='d-flex justify-content-center'><button className='rz_btn'>{state.processAction ? 'processing...' : 'Continue'}</button></div>
                    </div>
                </form>
            </MyModal >

            <MyModal
                shown={ispreviewModel}
                close={() => {
                    setIsPreviewModel();
                }}
            >
                <div className="modal-body">
                    <div className="modal-header">
                        <h3>Preview Image</h3>
                    </div>
                    {priviewImage ? <div className='preview_Image'>
                        <img src={process.env.S3_PATH + priviewImage} />
                    </div> : <div className='preview_Image'>
                        <img src="../assets/images/test2.jpg" />
                    </div>}
                </div>
            </MyModal>

            <MyModal
                shown={isUseModel}
                close={() => {
                    toggleModalUseTemp();
                }}
            >
                <div className="modal-body">
                    <div className="modal-header">
                        <h3>Use Template</h3>
                    </div>

                    <div className='rz_creatReels'>
                   
                        <div className='rz_custom_form'>
                        <label className="form-label ">Title <span className="text-danger">*</span></label>
                            <input type='text' className='rz_customInput' placeholder='Enter title' value={state.name} onChange={(e) => {
                                setQuery({
                                    ...state,
                                    name: e.target.value
                                })
                            }} />
                        </div>
                    </div>

                    {useImage?.img ? <div className='preview_Image pb-3'>
                        <img src={useImage?.img} />
                    </div> : <div className='preview_Image'>
                        <img src={state.templateurl} />
                    </div>}
                    <div className='d-flex justify-content-center mt-3'><button className='rz_btn' onClick={(e) => {
                        e.preventDefault()
                        createTemplate(e)
                    }}>Continue</button></div>
                </div>
            </MyModal>


            <ConfirmationPopup
                shownPopup={isRemoveAction}
                closePopup={() => {
                    setQuery({ ...state, templateId: "" });
                    setIsRemoveAction(false)
                }
                }
                type={"Image"}
                removeAction={() => {
                    common.getAPI({
                        method: 'DELETE',
                        url: 'templates',
                        data: {
                            target: state.templateId
                        },
                    }, (resp) => {

                       if(resp.status){
                        setIsRemoveAction(false);
                         let data = state.templates.filter ((d)=>d._id != state.templateId )
                         setQuery({ ...state, templates: data,templatesCount : state.templatesCount-1});
                        
                       }
                    });
                }}
            />
        </>
    )
}