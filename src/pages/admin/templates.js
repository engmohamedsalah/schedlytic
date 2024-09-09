import React, { useState,useEffect } from 'react'
import Select from 'react-select';
import svg from '@/components/svg';
import Head from 'next/head';
import MyModal from '@/components/common/MyModal';
import { NoDataWrapper, common, Pagination, setMyState } from '@/components/Common';
import ConfirmationPopup from '@/components/common/ConfirmationPopup';
import { toast } from "react-toastify";
import  { useRouter } from 'next/router';
import { capitalizeFirstLowercaseRest } from '@/components/utils/utility';

const options = [
    { value: 'Portrait', label: 'Portrait' },
    { value: 'Square', label: 'Square' },
    { value: 'Landscape', label: 'Landscape' },
    { value: 'Custom', label: 'Custom' },
];

let createUsr = {
    name: '',
    layout : "",
    height : "",
    width : "",
    email: '',
    password: '',
    status: '',
    subscriptions: [],
    usertype: '',
    templates:[],
    page : 1,
    keyword : ""
};

let MyReels = () => {
    const [isTemplateModel, setIsTemplateModal] = useState(false);
    const [isPreviewModel, setIsPreviewModel] = useState(false);
    const [isRemoveAction, setIsRemoveAction] = useState(false);
    const [previewTempalate, setPreviewTempalate] = useState();

    const router = useRouter();

    let [state, setQuery] = useState({
        userLoading: false,
        modalShown: false,
        ...createUsr,
        isRemoveAction: false,
        templateId : ""
    });

    useEffect(() => {
        getTemplateList('search');
    }, [state.keyword]);

    let createTemplate =()=>{
        let data = {
             title : state.name,
             layout : state.layout,
          }
         if(state.name =="")
         {
             toast.error("Title is required.")
             return 
         }
         if(state.layout == "")
         {
             toast.error("Layout is required.")
             return 
         }else
         {
             if(state.layout=="Custom")
             {
                 if(state.height=="")
                 {
                    toast.error("Height is required.")
                     return 
                 }
                 if(state.width=="")
                 {
                    toast.error("Width is required.")
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

                if (state.width > 1120) {
                    toast.error("Width must be less than 1120px .")
                    return
                }
                 data.meta={}
                 data.meta.height=state.height
                 data.meta.width=state.width,
                 data.data={}
             }
         }
         common.getAPI(
             {
               method: "POST",
               url: "templates",
               data: data,
             },
             (resp) => {
                     router.push("/editor/"+resp.data.id);
             },
           );
     }

    
    const handleSelectChange = (e) => {
        setQuery({
            ...state,
            layout : e.value
        })
    }

    const handlePreviewEvent = (val) => {
        setPreviewTempalate(process.env.S3_PATH+val)
        setIsPreviewModel(true)
    }

    let getTemplateList =(type=null)=>{
        if(state.templatesLoading){
            return;
        }
 
        setQuery({...state,  templatesLoading : true});
        let currentPage = type == 'loadMore' ? state.page+1 : (type == 'search' ? 1 : state.page);

        let data = {
             page : currentPage,
             limit :10,
             keyword : state.keyword
          }
         common.getAPI(
             {
               method: "GET",
               url: "templates",
               data: data,
             },
             (resp) => {
                    setQuery({...state,
                       templates : type == 'loadMore' ? [ ...state.templates, ...resp.data]  : resp.data,
                       templatesLoading : false,
                       templatesCount : resp.totalRecords,
                       page : currentPage
                    })
             },
           );
     }

     let updateTemplateList =(target,status)=>{
        if(state.templatesLoading){
            return;
        }
        let data = {
            target : target,
            data : {
                status : status
            }
          }
         common.getAPI(
             {
               method: "PUT",
               url: "templates",
               data: data,
             },
             (resp) => {
                setQuery({...state,  templatesLoading : false});
             },
           );
     }

    return (
        <>
            <>
                <Head>
                    <title>{process.env.SITE_TITLE}- Templates</title>
                </Head>
            </>

            <div className='rz_dashboardWrapper' >
                <div className='ps_conatiner'>
                    <div className=' welcomeWrapper'>
                        <div className='rz_strackDv mb-md-0 mb-3 pe-2'>
                            <div className="py-md-3 py-1 ps_search_responsive" >
                                <div className='rz_searchBox'>
                                    <div className='rz_custom_form'>
                                    <input type='search' placeholder='Search'  className='rz_customInput'
                                            onKeyDown={e => {
                                                if((e.key === 'Enter' || e.keyCode === 13 || e.which === 13)){
                                                    setQuery({...state, page: 1 , keyword: e.target.value}); 
                                                }
                                            }}
                                        />
                                        <span className='rz_inputIcon'>{svg.app.searchIcon}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="py-md-3 py-1 ms-auto">
                                <a className='rz_addAccBtn' onClick={() => setIsTemplateModal(true)}> Create Template  </a>
                            </div>

                        </div>

                        <div className='row'>
                            <div className='template_box'>
                                {state.templates.map((template, i) => {
                                    return <div key={i} className='template_inner' >
                                        <div className='template_inner_img'>
                                            {template.url ? <>
                                                <img src={process.env.S3_PATH + template.url} />
                                            </> :
                                                <img src={"../nothumb.png"} />
                                            }
                                            <div className='spv-template-staus'>
                                                {template.publish == 1 &&
                                                    <label htmlFor={i} className="switch ">
                                                        <input type="checkbox" title="Status" className="tooltiped" id={i}
                                                            checked={template.status==1 ? true : false} onChange={e => {
                                                                let data = [...state.templates]
                                                                data[i].status = (template.status == 0 ? 1 : 0)
                                                                setQuery({
                                                                    ...state,
                                                                    templates: data,
                                                                   
                                                                })

                                                                updateTemplateList(template._id, template.status)

                                                            }} />
                                                        <span className="switch-status"></span>
                                                    </label>
                                                }
                                            </div>
                                            <div className="spv-stockImage">
                                                {template.url &&
                                                    <a className="spv-btn spv-viewBtn" onClick={() => handlePreviewEvent(template.url)}>
                                                        {svg.app.eyeIcon}
                                                    </a>
                                                }
                                                <a className="spv-btn spv-viewBtn" onClick={() => {
                                                    setQuery({ ...state, templateId: template._id });
                                                    setIsRemoveAction(true)
                                                }} >
                                                    {svg.app.deleteIcon}
                                                </a>
                                            </div>

                                        </div>
                                        <div className='rz_editIcon' onClick={() => { router.push("/editor/" + template._id) }}> {svg.app.image_editor}</div>
                                        <div className='ps_template_text'>
                                            <h6>{template.title}</h6>
                                        </div>
                                    </div>
                                })}
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
                                title={'Templates not found.'} 
                            />
                        }
                        {
                             state.templates.length < state.templatesCount ?
                                <div className='rz_col_12'>
                                    <a className='ps_image_creator_blk_btn' style={{margin:"20px auto"}} onClick={()=> {
                                        getTemplateList("loadMore");
                                    }}>{state.templatesLoading ? 'Loading...' : 'Load More'} 
                                   {svg.app.loadmore}
                                    </a>
                                </div>
                            :<></>
                        }
                    </div>
                </div>
            </div>
            <MyModal
                shown={isTemplateModel}
                close={() => {
                    setIsTemplateModal(false)
                }}
            >
                <form onSubmit={e => {
                    e.preventDefault()
                    createTemplate(e)
                }}>
                    <div className="modal-body">
                        <div className="modal-header">
                            <h3>{state.isEdit ? 'Update template' : 'Create Template'}</h3>
                        </div>
                        <div className='rz_creatReels'>
                        
                            <div className='rz_custom_form'>
                            <label className="form-label ">Title <span className="text-danger">*</span></label>
                                <input type='text' onChange={(e)=>{
                                        setQuery({
                                            ...state,
                                            name : capitalizeFirstLowercaseRest(e.target.value)
                                        })
                                }} className='rz_customInput' placeholder='Enter title'  value={state.name} />
                            </div>
                        </div>
                        <div className='rz_creatReels'>
                     
                            <div className='rz_custom_form rz_customSelect'>
                            <label className="form-label ">Layout <span className="text-danger">*</span></label>
                                <Select
                                    placeholder={'Choose layout size'}
                                    options={options}
                                    onChange={handleSelectChange}      
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

                        {state.layout === "Custom" ? <div className='rz_creatReels row'>
                           
                            <div className='col-md-6'>
                            <label className="form-label ">Custom Height <span className="text-danger">*</span></label>
                                <div className='rz_custom_form'>
                                    <input type='Number' className='rz_customInput' onChange={(e)=>{
                                        setQuery({
                                            ...state,
                                            height : e.target.value
                                        }) }} placeholder='Enter height.' value={state.height} />
                                </div>
                            </div>
                            <div className='col-md-6'>
                            <label className="form-label ">Custom Width <span className="text-danger">*</span></label>
                                <div className='rz_custom_form'>
                                    <input type='Number' className='rz_customInput' onChange={(e)=>{
                                        setQuery({
                                            ...state,
                                            width : e.target.value
                                        }) }} placeholder='Enter width.' value={state.width} />
                                </div>
                            </div>
                        </div> : "" }

                        <div className='d-flex justify-content-center'><button className='rz_btn'>{state.processAction ? 'processing...' : 'Create'}</button></div>
                    </div>
                </form>
            </MyModal >

            <MyModal
                shown={isPreviewModel}
                close={() => {
                    setIsPreviewModel(false);
                }}
            >
                <div className="modal-body">
                    <div className="modal-header">
                        <h3>Preview Template</h3>
                    </div>
                    {previewTempalate ? <div className='preview_Image'>
                        <img src={previewTempalate} />
                    </div> : <div className='preview_Image'>
                        <img src="../assets/images/test2.jpg" />
                    </div>}
                </div>
            </MyModal>

            <ConfirmationPopup
                shownPopup={isRemoveAction}
                closePopup={() => {
                    setQuery({ ...state, templateId: ""});
                    setIsRemoveAction(false)}}
                type={"Template"}
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

export default MyReels;

