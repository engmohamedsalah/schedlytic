import svg from "@/components/svg";
import { useEffect, useState } from "react";
import { appStore } from '@/zu_store/appStore';
import MyModal from "@/components/common/MyModal";
import { NoDataWrapper, common, setMyState } from '@/components/Common';
import Router, { useRouter } from 'next/router';
import { decode as base64_decode } from 'base-64';
import { toast } from "react-toastify";
import { capitalizeFirstLowercaseRest } from "../utils/utility";
import ConfirmationPopup from "../common/ConfirmationPopup";
import { resolve } from "styled-jsx/css";
import { object } from "underscore";
import { NavItem } from "react-bootstrap";

export default function CreatePost(props) {
    const [priviewImage, setPriviewImage] = useState();
    const [customTabIndex, setcustomTabIndex] = useState(0);
    const [tabIndex, setTabIndex] = useState(0);
    const [ToggleState, setToggleState] = useState(1);
    const [isLocalImg, setIsLocalImg] = useState(false);
    const [isDisabled, setIsDisabled] = useState(true);
    const [isNextDisabled, setIsNextDisabled] = useState(true);
    const [isTextRegenBtn, setIsTextRegenBtn] = useState(true);
    const [isUseTextBtn, setIsUseTextBtn] = useState(true);
    const [isTextAreaDisabled, setIsTextAreaDisabled] = useState(true);
    const [isImageGenAI, setIsImageGenAI] = useState(true)
    const [modal, setModal] = useState(false);
    const [imgModal, setImgModal] = useState(false);
    const [showTextArea, setShowTextArea] = useState(false);
    const [isPreviewImage, setIsPreviewImage] = useState(false);
    const [multiPost, setMutliPost] = useState([]);
    const [previousPost, setPreviousPost] = useState();
    const [previewData, setPreviewData] = useState();
    const [update, setupdate] = useState("false")
    const [isRemove, setIsRemove] = useState(false);
    const [isRemoveAction, setIsRemoveAction] = useState(false);
    const [postDataObj, setPostDataObj] = useState({
        title: "",
        text: "",
        searchText: "",
        searchImageText: "",
        aiText: "",
        aiImage: "",
        localImg: "",
        url: "",
        files: [],
        scheduleDate: "",
        socialMediaAccounts: {},
        timeZone: "",
        isMultiPost: false,
        thumb :"",
        meta : ""
    });

    let [state, setQuery] = useState({
        postLoading: false,
        isLoading: false,
        libraryData: [],
        totalRecords: 0,
        page: 1,
        limit: 12,
        isRemoveAction: false
    });

    const router = useRouter();
    
    


    let myStore = appStore(state => state);
    let userData = appStore(state => state.userData);
    let storePostData = myStore.postData.singlePost;
    let storeMultiPostData = myStore.postData.multiPost;

    useEffect(() => {
        if (storeMultiPostData?.length > 0) {
            setMutliPost(storeMultiPostData)
        }
    }, [storeMultiPostData])


    useEffect(() => {

    }, [ToggleState])

    useEffect(() => {
        if (!router.query.id) {
            if (postDataObj?.text?.length > 0 || postDataObj?.url?.length > 0) {
                postDataObj.title = ""
                postDataObj.text = ""
                postDataObj.aiText = ""
                postDataObj.aiImage = ""
                postDataObj.localImg = ""
                postDataObj.url = ""
                postDataObj.files = []
                postDataObj.scheduleDate = ""
                postDataObj.socialMediaAccounts = {}
                postDataObj.timeZone = ""
                postDataObj.type = ""
                setPostDataObj({ ...postDataObj })
            }
            if ((storePostData?.text || storePostData?.url) || storePostData?.scheduleDate) {
                postDataObj.title = storePostData?.title
                postDataObj.text = storePostData?.text
                postDataObj.url = storePostData?.url
                postDataObj.scheduleDate = storePostData?.scheduleDate
                postDataObj.type = storePostData?.type
                postDataObj.thumb = storePostData?.thumb
                postDataObj.meta = storePostData?.meta
                setPostDataObj({ ...postDataObj })
                setIsNextDisabled(false)
            }
        } else {
            getPostById()
        }
    }, [router.query.id])

    useEffect(() => {
        if (customTabIndex == 2) {
            getLibraryImages()
        }
    }, [customTabIndex == 2, state.page, ToggleState])

    let cntStart = ((state.page - 1) * state.limit) + 1, cnt = cntStart;

    let processVideo = (url, progress = 15) => {
        return new Promise((resolve, reject) => {
            let v = document.createElement("video");
            v.src = url;
            v.muted = true;
            let flag = false;
            let duration = 0;
            let height,width;
            v.onloadedmetadata = () => {
                duration = v.duration;
                let fifteenPercentOfDuration = (duration * progress) / 100;
                v.currentTime = parseInt(fifteenPercentOfDuration.toFixed(3));
                width= v.videoWidth;
                height= v.videoHeight;
            };
            v.oncanplay = async () => {
                if (flag === false) {
                    flag = true;
                    return;
                }
                let thumbCanvas = document.createElement("canvas");
                thumbCanvas.width = v.videoWidth;
                thumbCanvas.height = v.videoHeight;
                let thumbCtx = thumbCanvas.getContext("2d");
                thumbCtx.drawImage(
                    v,
                    0,
                    0,
                    thumbCanvas.width,
                    thumbCanvas.height
                );
                let thumbBlob = dataURItoBlob(thumbCanvas.toDataURL());
                let thumbUrl = URL.createObjectURL(thumbBlob);
                resolve({ thumbBlob, thumbUrl,height,width ,duration});
            };
        });
    };

    const toggleModal = () => {
        postDataObj.searchText = ""
        postDataObj.aiText = ""
        setPostDataObj({ ...postDataObj })
        setIsDisabled(true)
        setModal(false)
        setShowTextArea(false)
    }

    let dataURItoBlob = (dataURI) => {
        let byteString = atob(dataURI.split(",")[1]);
        let mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
        let ab = new ArrayBuffer(byteString.length);
        let ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        let blob = new Blob([ab], { type: mimeString });
        return blob;
    };

    const toggleTab = (index) => {
        setMyState(setQuery, {
            page: 1,
            limit: 12
        });
        handleCustomTab(0)
        setToggleState(index);
    };


    const getActiveClass = (index, className) =>
        ToggleState === index ? className : "";

    const getLibraryImages = () => {
        setMyState(setQuery, {
            isLoading: true
        });


        common.getAPI({
            method: 'GET',
            url: 'media',
            data: {
                mediaType: ToggleState == 1 ? "image" : "video",
                page: state.page,
                limit: state.limit,
                type: "svg"
            },
        }, (resp) => {
            if (resp.status) {
                setMyState(setQuery, {
                    libraryData: state.page == 1 ? resp.data : [...state.libraryData, ...resp.data],
                    totalRecords: resp.totalRecords,
                    isLoading: false
                });
            }
        });
    }

    const handleCustomTab = (tabIndex) => {
        if (customTabIndex == tabIndex) return
        setMyState(setQuery, {
            isLoading: true,
            page: 1,
            limit: 12,
            libraryData: []
        });
        setcustomTabIndex(tabIndex)
    }

    const handleDelete = (i) => {
        setIsRemove(true)
        setRemovePost(i)
    }

    const inputHandler = (event) => {
        postDataObj[event.target.id] = capitalizeFirstLowercaseRest(event.target.value.trimStart())

        setPostDataObj({ ...postDataObj })
        if (event.target.id === "text") {
            setIsNextDisabled(false)
        }

        if (event.target.id === "searchText" || event.target.id === "searchImageText" && Object.values(event.target.value.trimStart()).length > 0) {
            if (postDataObj.searchText || postDataObj.searchImageText) {
                setIsDisabled(false)
                setIsTextRegenBtn(false)
            } else {
                setIsDisabled(true)
                setIsTextRegenBtn(true)
            }
        } else {
            setIsDisabled(true)

        }
    }

    const handleTextModal = () => {

        setModal(true)
    }

    const getAiText = () => {
        common.getAPI({
            method: 'POST',
            url: 'openai',
            data: {
                content: `I need ${postDataObj.searchText} information in 5 lines`
            },
        }, (resp) => {
            if (resp.status) {
                postDataObj.aiText = resp.data
                setPostDataObj({ ...postDataObj })
                setIsTextAreaDisabled(false)
                setIsUseTextBtn(false)
                setIsTextRegenBtn(false)
                setShowTextArea(true)
            }
        });
    }

    const AiText = (aiText) => {
        postDataObj.text = aiText
        postDataObj.aiText = ""
        setPostDataObj({ ...postDataObj })
        setIsTextAreaDisabled(true)
        setIsDisabled(true)
        setIsUseTextBtn(true)
        setIsTextRegenBtn(true)
        toggleModal()
        if (postDataObj?.text || postDataObj?.url) {
            setIsNextDisabled(false)
        } else {
            setIsNextDisabled(false)
        }

    }

    const handleOnTabChange = (event, newValue) => {
        setTabIndex(newValue)
    }

    const handleVideoPreivew = (data) => {
         setPreviewData(data) 
         setIsPreviewImage(true)
    }

    const tab1 = () => {
        return <div className="ps_tabs_padd"><div className='ps_create_post_up_box ps_assets_upload_user p-0'>
            {(isLocalImg == false || (postDataObj?.type != "image")) ? <div className='ps_assets_upload_inner'>
                <label htmlFor="rz_uploadAudio" className='rz_uploadBtn_user'>
                    <span className='ps_assets_icon m-auto mb-3'>
                        {svg.app.uploadIcon}
                    </span>
                    <div className='ps_assets_text ms-0'>
                        <h6 className="pb-3"> Upload Post Image</h6>
                        <p>Supports: jpeg, png</p>
                    </div>
                    <input disabled={process.env.TYPE == "demo" ? true : false} type='file' className='rz_customFile' accept={"image/*"} onChange={(e) => uploadLocalImage(e, "image")} />
                </label>
            </div> : <div className='rz_custom_form'>
                <div className="ps_assets_icon_imgbox m-auto">
                    {postDataObj?.localImg && postDataObj?.type == "image" ? <img
                        alt="not found"
                        width={"250px"}
                        src={postDataObj?.localImg}
                    /> : ""}
                </div>
                <div className="d-flex justify-content-between mt-4">
                    <button className='rz_addAccBtn ' disabled={isUseTextBtn} onClick={() => { storeLocalImage("image") }}>Use Image </button>
                    <button className='rz_addAccBtn_blk' onClick={() => setIsLocalImg(false)}>Cancel</button>
                </div>
            </div>
            }
        </div>
        </div>
    }

    const tab2 = () => {
        return <>
            <div className="ps_tabs_padd">
                {!postDataObj?.aiImage ? <div className="" style={{ marginTop: "80px" }}>
                    <label className="form-label pt-2"> Prompt For AI Image<span className="text-danger">*</span></label>
                    <div className="d-flex justify-content-between align-items-center gap-1">
                        <div className="col-md-10 col-9">
                            <input type="text" id="searchImageText" placeholder="Enter prompt for AI image" className="form-control form-control-md" value={postDataObj?.searchImageText || ""} onChange={(e) => inputHandler(e)} />
                        </div>
                        <button className='rz_addAccBtn' disabled={isDisabled} onClick={() => generateAiImage()}>Generate</button>
                    </div>
                </div> : ""}
                {postDataObj?.aiImage ? <>
                    <div className=" ">
                        <label className="form-label pt-2"> Prompt for AI image<span className="text-danger">*</span></label>
                        <div className="d-flex justify-content-between align-items-center gap-1">
                            <div className="col-md-10 col-9 ">
                                <input type="text" id="searchImageText" placeholder="Enter prompt for AI image" className="form-control form-control-md" value={postDataObj?.searchImageText || ""} onChange={(e) => inputHandler(e)} />
                            </div>
                            <button className='rz_addAccBtn' disabled={isDisabled} onClick={() => generateAiImage()}>Generate</button>
                        </div>
                    </div>

                    <div className='rz_custom_form'>
                        <div className="ps_assets_icon_imgbox m-auto">
                            <img src={postDataObj?.aiImage} />
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <button className='rz_addAccBtn ' disabled={isUseTextBtn} onClick={useAiImage}>Use Image +</button>
                            <button className='rz_addAccBtn_blk' disabled={isTextRegenBtn} onClick={regenrateImage}>Re-Generate</button>
                        </div>
                    </div>   </> : ""}
            </div>
        </>
    }
    const tab3 = () => {
        return <div className="ps_tabs_padd"><div className="PS_create_url_gallery ">
            {state.libraryData.length > 0 &&
                <>   {state.libraryData && state.libraryData.map((item, i) => {
                    return (<div key={i} className='PS_create_url_gallery_imgbox'>
                        <img src={`${process.env.S3_PATH}${item.path}`} alt={item.title} loading="lazy" onClick={() => uploadLibraryImage(item, "image")} />
                    </div>)
                })}
                </>}
        </div>

            <div className=''>
                <div className='rz_gridInnerBox ps_img_not_found' >
                    {state.isLoading &&
                        <NoDataWrapper
                            isLoading={state.isLoading}
                            blockCount="6"
                            height={"220"}
                            width="220"
                            className="rz_gridCol p-2"
                            section="media"
                            dataCount={state.libraryData.length}
                            title={'Images not found.'}
                        />}
                </div>
                {!state.isLoading &&
                    <NoDataWrapper
                        isLoading={state.isLoading}
                        blockCount="6"
                        height={"220"}
                        width="220"
                        className="rz_gridCol p-2"
                        section="media"
                        dataCount={state.libraryData.length}
                        title={'Images not found.'}
                    />
                }
            </div>

            {
                state.libraryData.length < state.totalRecords && !state.isLoading ?
                    <button className='ps_image_creator_blk_btn  mt-4 mx-auto' onClick={() => {
                        setMyState(setQuery, {
                            isLoading: true,
                            page: state.page + 1,
                            limit: 12
                        });
                    }} >  Load More {svg.app.loadmore}</button>

                    : <></>
            }
        </div>
    }
    const tab4 = () => {
        return <div className="ps_tabs_padd"><div className='ps_create_post_up_box  ps_assets_upload_user p-0'>
            {(isLocalImg == false || postDataObj?.type != "video") ? <div className='ps_assets_upload_inner'>
                <label htmlFor="rz_uploadAudio" className='rz_uploadBtn_user'>
                    <span className='ps_assets_icon m-auto mb-3'>
                        {svg.app.uploadIcon}
                    </span>
                    <div className='ps_assets_text ms-0'>
                        <h6 className="pb-3"> Upload Post Video</h6>
                        {/* <p>Supports: mp4 </p> */}
                    </div>
                    <input disabled={process.env.TYPE == "demo" ? true : false} type='file' className='rz_customFile' accept={"video/*"} onChange={(e) => uploadLocalImage(e,"video")} />
                </label>
            </div> : <div className='rz_custom_form'>
                <div className="ps_assets_icon_videobox m-auto">
                    {(postDataObj?.localImg && postDataObj?.type == "video") ? <video
                        alt="not found"
                        // width={"250px"}
                        src={postDataObj?.localImg} controls
                    /> : ""}
                </div>
                <div className="d-flex justify-content-between mt-4">
                    <button className='rz_addAccBtn ' disabled={isUseTextBtn} onClick={() => { storeLocalImage("video") }}>Use Video </button>
                    <button className='rz_addAccBtn_blk' onClick={() => setIsLocalImg(false)}>Cancel</button>
                </div>
            </div>
            }
        </div>
        </div>
    }


    const tab6 = () => {
        return <div className="ps_tabs_padd"><div className="PS_create_url_gallery ">
            {state.libraryData.length > 0 &&
                <>   {state.libraryData && state.libraryData.map((item, i) => {
                    return (<div key={i} className='PS_create_url_gallery_imgbox'>
                        <img src={`${process.env.S3_PATH}${item.thumb}`} alt={item.title} loading="lazy" />
                        <div className="spv-stockImage">
                            <a className="spv-btn spv-viewBtn" onClick={() => handleVideoPreivew(item)}>{svg.app.playVideo}</a>
                            <a className="spv-btn spv-viewBtn" onClick={() => uploadLibraryImage(item, "video")}>{svg.app.plusIcon}</a>
                        </div>
                    </div>)
                })}
                </>}
        </div>

            <div className=''>
                <div className='rz_gridInnerBox ps_img_not_found' >
                    {state.isLoading &&
                        <NoDataWrapper
                            isLoading={state.isLoading}
                            blockCount="6"
                            height={"220"}
                            width="220"
                            className="rz_gridCol p-2"
                            section="media"
                            dataCount={state.libraryData.length}
                            title={'Images not found.'}
                        />}
                </div>
                {!state.isLoading &&
                    <NoDataWrapper
                        isLoading={state.isLoading}
                        blockCount="6"
                        height={"220"}
                        width="220"
                        className="rz_gridCol p-2"
                        section="media"
                        dataCount={state.libraryData.length}
                        title={'Images not found.'}
                    />
                }
            </div>

            {
                state.libraryData.length < state.totalRecords && !state.isLoading ?
                    <button className='ps_image_creator_blk_btn  mt-4 mx-auto' onClick={() => {
                        setMyState(setQuery, {
                            isLoading: true,
                            page: state.page + 1,
                            limit: 12
                        });
                    }} >  Load More {svg.app.loadmore}</button>

                    : <></>
            }
        </div>
    }

    const generateAiImage = () => {
        common.getAPI({
            method: 'POST',
            url: 'openai',
            data: {
                content: `I need image of ${postDataObj?.searchImageText} `,
                action: "ImageGenrate"
            },
        }, (resp) => {
            if (resp.status) {
                postDataObj.aiImage = resp.data.data[0].url;
                postDataObj.type = "image";
                setPostDataObj({ ...postDataObj });
                setIsUseTextBtn(false)
                setIsTextRegenBtn(false)
            }
        });
    }

    const regenrateImage = () => {
        generateAiImage()
    }
    
    function aspect_ratio(val) {
        let lim=50;
        var lower = [0, 1];
        var upper = [1, 0];
    
        while (true) {
            var mediant = [lower[0] + upper[0], lower[1] + upper[1]];
    
            if (val * mediant[1] > mediant[0]) {
                if (lim < mediant[1]) {
                    return upper;
                }
                lower = mediant;
            } else if (val * mediant[1] == mediant[0]) {
                if (lim >= mediant[1]) {
                    return mediant;
                }
                if (lower[1] < upper[1]) {
                    return lower;
                }
                return upper;
            } else {
                if (lim < mediant[1]) {
                    return lower;
                }
                upper = mediant;
            }
        }
    }
    const processImage =(url)=>{
        return new Promise((resolve,reject)=>{
            let height,width;
            let image= document.createElement("img")
            image.src=url
            image.onload = (e) => {
                height= image.height
                width = image.width
                resolve({height,width})
            }
        })
    }


    const useAiImage = () => {
        common.getAPI({
            method: 'POST',
            url: 'post',
            data: {
                url: postDataObj?.aiImage,
                action: "useImage"
            },
        }, (resp) => {
            if (resp.status) {
                postDataObj.aiImage = ""
                postDataObj.searchImageText = ""
                postDataObj.url = resp.data
                setPostDataObj({ ...postDataObj })
                setImgModal(false)
                setIsUseTextBtn(false)
                setIsTextRegenBtn(false)
                setIsImageGenAI(true)
                if (postDataObj?.url) {
                    setIsNextDisabled(false)
                }
            }
        });

    }
    let getFileName = (filename) => {
        return filename.replace(/\.[^/.]+$/, "");
    }
    const storeLocalImage = async (type) => {
        let selectedFile = postDataObj?.files[0];
        let data = new FormData();
        data.append("file", selectedFile, selectedFile?.name);
        if(type=="video")
        { 
            const url = await URL.createObjectURL(selectedFile)
            let { thumbBlob, thumbUrl ,height,width,duration} = await processVideo(url);
            let ratio=aspect_ratio(height/width)
            let meta={thumbBlob, thumbUrl ,height,width,duration,size:selectedFile.size, type : selectedFile.type ,ratio : ratio.join(":")}
            meta=JSON.stringify(meta)
            data.append("meta", meta);
            let thumbName = getFileName(selectedFile?.name) + `-thumb.png`;
            data.append("thumb", thumbBlob, thumbName);
        }else{
            let meta
           const url = await URL.createObjectURL(selectedFile)
           let da= await processImage(
                url
            );
            let ratio=aspect_ratio(da.height/da.width)
           meta ={
            da,
            size:selectedFile.size,
            type : selectedFile.type,
            ratio: ratio.join(":"),
           }
            data.append("meta", JSON.stringify(meta));
        }
        common.getAPI({
            method: 'POST',
            url: 'media?mediaType=' + type,
            data: data,
            isFormData: true,
        }, (resp) => {
            if (resp.status) {
                postDataObj.localImg = ""
                postDataObj.url = process.env.S3_PATH + resp.data
                if (type == "video") {
                    postDataObj.thumb = process.env.S3_PATH + resp?.thumb
                }
                postDataObj.meta = resp?.meta
                setPostDataObj({ ...postDataObj })
                setImgModal(false)
                setIsLocalImg(false)
                getLibraryImages()
                setIsNextDisabled(false)
            }
        });
    }

    const uploadLibraryImage = (obj, type) => {
        postDataObj.url = `${process.env.S3_PATH}${obj.path}`
        postDataObj.type = type
        postDataObj.meta=obj.meta
        if(type=="video")
        {
            postDataObj.thumb = `${process.env.S3_PATH}${obj.thumb}`
        }
        setPostDataObj({ ...postDataObj })
        setImgModal(false)
        setIsUseTextBtn(false)
        setIsTextRegenBtn(false)
        setIsImageGenAI(true)
        setIsNextDisabled(false)
    }

    const uploadLocalImage = async (event, filetype) => {
        // event.preventdefault()
        if (filetype == "image") {
            if (event.target.files[0].type == "image/jpeg" || event.target.files[0].type == "image/png") {
                postDataObj.files = event.target.files
                postDataObj.type = filetype
                const url = await URL.createObjectURL(event.target.files[0])
                postDataObj.localImg = url
                setPostDataObj({ ...postDataObj })
                setIsLocalImg(true)
                setIsUseTextBtn(false)
            } else {
                toast.error('Please upload png/jpeg file type ');
            }
        }
        else {
            if (event.target.files[0].type.includes("video")) {
                postDataObj.files = event.target.files
                postDataObj.type = filetype

                const url = await URL.createObjectURL(event.target.files[0])

                postDataObj.localImg = url
                setPostDataObj({ ...postDataObj })
                setIsLocalImg(true)
                setIsUseTextBtn(false)
            } else {
                toast.error('Please upload video file type ');
            }

        }

    }


    const getPostById = () => {
        common.getAPI({
            method: 'GET',
            url: 'post',
            data: {
                target: base64_decode(router.query.id)
            }
        }, (resp) => {
            if (resp.status) {
                (postDataObj.title = resp.data[0]?.title),
                    (postDataObj.text = resp.data[0]?.text),
                    (postDataObj.url = resp.data[0]?.url),
                    (postDataObj.scheduleDate = resp.data[0].scheduleDate),
                    (postDataObj.socialMediaAccounts =
                        resp.data[0].socialMediaAccounts),
                    (postDataObj.timeZone = resp.data[0].timeZone);
                    (postDataObj.thumb = resp.data[0]?.thumb);
                    (postDataObj.type = resp.data[0]?.posttype);
                setPostDataObj({ ...postDataObj });
                setIsNextDisabled(false);
            }

        })
    }

    const removeSelectedImage = () => {
        postDataObj.url = ""
        setPostDataObj({ ...postDataObj })
    }

    const checkSocialValidation =(obj)=>{
        let valid=  {
          "FACEBOOK" : {
            "caption" : 2200,
            "VIDEO" : {
              FILE_TYPE :["mp4", "quicktime"],
              duration : 600
            },
           
         
          },
          "INSTAGRAM" : {
            "caption" : 2200,
            "VIDEO" : {
              FILE_TYPE :["mp4"],
              duration : 90
            },
            "IMAGE" : {
                ratio : [0.7,1.5]
            }
            
          },
          "LINKEDIN" : {
            "caption" : 3000,
            "VIDEO" : {
              FILE_TYPE : ["flv","mp4","mkv","webm","avc"],
              duration : 600
            },
          },
          'PINTEREST':{
            "caption" :  500 ,
            "VIDEO" : {
              FILE_TYPE : ["mp4", "quicktime"],
              duration : 600
            },
          }
        }
        let social=[]
        let url=false
        if(!obj.url)
        {
             delete valid["INSTAGRAM"]
             delete valid["PINTEREST"]
        }else{
            url=true
        }
       Object.keys(valid).map((data)=>{
        let d1=valid[data]
        let f1=false
        if(obj.text.length<d1.caption)
        {
            if(url ==false)
            {
             social.push(data)
            }
        }
        if(url && obj.type=="video"){
            let fileList = d1["VIDEO"]["FILE_TYPE"]
            if(obj?.meta)
            {
                let meta=JSON.parse(obj.meta)
                let ext=meta.type.replace("video/","")
                if(fileList.includes(ext))
                {  
                   if(meta?.duration<=d1["VIDEO"]["duration"])
                   social.push(data)
                }
            }
             
        }
        
        if(url && obj.type=="image"){
            if(data=="INSTAGRAM")
            {
                let meta=JSON.parse(obj.meta)
                 let radio=meta.da.width/meta.da.height
                 console.log({radio},meta)
                 let arr=d1["IMAGE"]["ratio"]
                 console.log(arr,radio,radio>=arr[0],radio<=arr[1])
                 if(radio>=arr[0] && radio<=arr[1])
                 {
                    social.push(data)
                 }

            }else{
                social.push(data)
            }
            
        }
       })
       return social
    }

    const submitData = () => {
        if (multiPost.length > 1) {
            let storeData = {
                singlePost: {},
                multiPost: multiPost,
                step: 1
            }
            myStore.updateStoreData("postData", storeData)
        } else if (multiPost.length == 1) {
            let singlePost = {
                title: multiPost[0]?.title,
                text: multiPost[0]?.text,
                url: multiPost[0]?.url,
                type: multiPost[0]?.type,
                thumb: multiPost[0]?.thumb,
                meta: multiPost[0]?.meta,
                scheduleDate: "",
                socialMediaAccounts: [],
                timeZone: {},
            }
            let acc=checkSocialValidation(singlePost)
            singlePost["platefrom"]=acc
            let data = {
                singlePost: singlePost,
                multiPost: [],
                step: 1
            }
            myStore.updateStoreData("postData", data)

        } else {
            if (postDataObj?.title?.length == 0) {
                toast.error('Please add post title');
                return;
            }
            if (postDataObj?.url?.length == 0 && postDataObj?.text?.length == 0) {
                toast.error('Please add text or image');
                return;
            }
            if (postDataObj?.text?.length == 0 && postDataObj?.url?.length == 0) {
                toast.error('Please add image');
                return;
            }

            let singlePost = {
                title: postDataObj?.title,
                text: postDataObj?.text,
                url: postDataObj?.url,
                scheduleDate: postDataObj?.scheduleDate,
                socialMediaAccounts: postDataObj?.socialMediaAccounts,
                timeZone: postDataObj?.timeZone,
                type: postDataObj?.type,
                thumb: postDataObj?.thumb,
                meta : postDataObj?.meta
            }
            let acc=checkSocialValidation(singlePost)
            singlePost["platefrom"]=acc
            let data = {
                singlePost: singlePost,
                multiPost: [],
                step: 1
            }
            myStore.updateStoreData("postData", data)
        }
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

    const viewPostTab = () => {
        return <div className='' >
            <div className="dash_header  mb-1">
                <h6 className="mb-0"> Posts</h6>
            </div>
            <div className={postDataObj?.url ? "ps_upcoming_list_div pt-2 ps_scroll_upcoming_box_700" : " ps_upcoming_list_div pt-2 ps_scroll_upcoming_box_400"}>
                <div className="upcomg_post_box_heading ">
                    <div className="upcomg_post_details upcomg_post_details_width">
                        <p>Tittle</p>
                    </div>
                    <div className="upcomg_post_social_available_80">
                        <p>Platforms </p>
                    </div>
                    <div className="ps_upcomg_post_details_icons">
                        <p>Action</p>
                    </div>
                </div>

                {multiPost.length > 0 && multiPost.map((post, i) => {
                    return <div className={"upcomg_post_box ".concat(update == i ? " editbox" : "")} key={i}>

                        <div className="upcomg_post_details upcomg_post_details_width">
                            <div className="dash_icon_box" >
                                {post.url ? <div className='ps_dash_comming_box '> <img src={post.type == "image" ? post?.url : post.thumb} /></div> :
                                    <div className="ps_dash_comming_box"><p>{post.text}</p> </div>}
                            </div>
                            <div className="upcomg_post_text">
                                <p>{post.title}</p>
                            </div>
                        </div>
                        <div className="upcomg_post_social_available">
                        
                            {   post.platefrom && <>
                               { post.platefrom.map((d1,i)=>{
                                let sv=d1.toLowerCase()
                                let color = checklogo(sv)
                                return (
                                    <div key={i} className="ps_create_available_icon">
                                    <div className="ps_create_available_icon_div" style={{ background: color?.color }}>{svg.app[sv]}</div>
                                    </div>
                                )
                               })}
                            
                            </>
                             }
                        </div>
                        <div className="ps_upcomg_post_details_icons">
                            <span className="social_box_edit" onClick={() => addSelectedPost(post, i)}>
                                {svg.app.editIcon}
                                <span className='rz_tooltipSpan'>Edit</span>
                            </span>

                            <span className="social_box_delete" onClick={() => setIsRemoveAction(String(i))}>
                                {svg.app.deleteIcon}
                                <span className='rz_tooltipSpan'>Delete</span>
                            </span>

                        </div>
                    </div>

                })}
            </div>
        </div>
    }

    const addCreatePost = () => {
        if (postDataObj?.title?.length == 0) {
            toast.error('Please add post title');
            return;
        }
        if (postDataObj?.url?.length == 0 && postDataObj?.text?.length == 0) {
            toast.error('Please add text or image');
            return;
        }
        if (postDataObj?.text?.length == 0 && postDataObj?.url?.length == 0) {
            toast.error('Please add image');
            return;
        }
        let data = {
            title: postDataObj?.title,
            text: postDataObj?.text,
            type: postDataObj?.type,
            url: postDataObj?.url,
            thumb: postDataObj?.thumb,
            meta : postDataObj?.meta,
            scheduleDate: postDataObj?.scheduleDate,
            socialMediaAccounts: postDataObj?.socialMediaAccounts,
            timeZone: postDataObj?.timeZone,
            step: 1
        }
        let acc=checkSocialValidation(data)
        data["platefrom"]=acc
        multiPost.push(data)
        setMutliPost([...multiPost])
        postDataObj.thumb = ""
        postDataObj.title = ""
        postDataObj.text = ""
        postDataObj.aiText = ""
        postDataObj.aiImage = ""
        postDataObj.localImg = ""
        postDataObj.url = ""
        postDataObj.files = []
        postDataObj.scheduleDate = ""
        postDataObj.socialMediaAccounts = {}
        postDataObj.timeZone = ""
        postDataObj.meta = ""
        setPostDataObj({ ...postDataObj })
    }

    const handleMultiPostDelete = (index) => {
        multiPost.splice(index, 1)
        setMutliPost([...multiPost])
        if (multiPost.length == 0) {
            setPreviousPost()
        }
        setupdate("false")
        postDataObj.title = ""
        postDataObj.text = ""
        postDataObj.aiText = ""
        postDataObj.aiImage = ""
        postDataObj.localImg = ""
        postDataObj.url = ""
        postDataObj.files = []
        postDataObj.scheduleDate = ""
        postDataObj.socialMediaAccounts = {}
        postDataObj.timeZone = ""
        setPostDataObj({ ...postDataObj })
        setIsRemoveAction(false)
    }

    const addSelectedPost = (selectedPost, index) => {
        setupdate(index)
        if (previousPost) {
            let data = {
                title: postDataObj.title,
                text: postDataObj.text,
                url: postDataObj.url,
                scheduleDate: "",
                socialMediaAccounts: "",
                timeZone: "",
                step: 1
            }
        }
        setPreviousPost(selectedPost)
        handleEditPost(selectedPost, index)
    }

    const handleEditPost = (postData, index) => {
        postDataObj.title = postData?.title
        postDataObj.url = postData?.url
        postDataObj.text = postData?.text
        postDataObj.type = postData?.type
        postDataObj.thumb = postData?.thumb
        postDataObj.meta = postData?.meta
        setPostDataObj({ ...postDataObj })
    }



    const updatePost = () => {
        if (postDataObj?.title.trim() == "") {
            toast.error("Please add post title")
            return
        }
        if (postDataObj?.url.trim() == "" && postDataObj?.text.trim() == "") {
            toast.error("Please add text or image")
            return
        }
        let mul = [...multiPost]

        if (mul[update]) {
            mul[update].title = postDataObj?.title
            mul[update].url = postDataObj?.url
            mul[update].text = postDataObj?.text
            mul[update].type = postDataObj?.type
            mul[update].thumb = postDataObj?.thumb
            mul[update].meta = postDataObj?.meta
            let acc=checkSocialValidation(mul[update])
            console.log(acc,"ghvf")
            mul[update]["platefrom"]=acc
            console.log({mul})
            setMutliPost(mul)
            postDataObj.type = ""
            postDataObj.title = ""
            postDataObj.text = ""
            postDataObj.aiText = ""
            postDataObj.aiImage = ""
            postDataObj.localImg = ""
            postDataObj.url = ""
            postDataObj.files = []
            postDataObj.scheduleDate = ""
            postDataObj.socialMediaAccounts = {}
            postDataObj.timeZone = ""
            postDataObj.meta = ""
            setPostDataObj({ ...postDataObj })
            setupdate("false")
        }
    }

    return (
        <>

            <div className='rz_dashboardWrapper' >
                <div className="ps_integ_conatiner">
                    <div className="welcomeWrapper">
                        <div>
                            <div className="dash_header">
                                <h2>{router.query.id ? "Update Post" : "Create Post"}</h2>
                            </div>
                            <div className="ps_header_tabs">
                                <div className="ps_header_back invisible" ><a>{svg.app.backIcon}<span> Back</span></a> </div>
                                <div><h3>Add Text / Image</h3> </div>
                                <div className="ps_header_steps"><span>STEPS</span> <div className="ps_header_spin" style={{ backgroundImage: "url(/assets/images/spinner.png)" }}>1</div> </div>
                            </div>
                        </div>
                        <div className="ps_create_post_box">
                            <div className=" ps_create_post_box_bg_step2">
                                <div className="col-md-12">
                                    <div className="ps_create_box_flex">

                                        <div className="ps_schedule_box m-auto ps_wdth_500">
                                            <label className="form-label pt-2">Title <span className="text-danger">*</span></label>
                                            <div className=" ps_create_post_input_box">
                                                <div className="col-12 ">
                                                    <input type="text" id="title" placeholder="Enter post title" className="form-control form-control-md" value={postDataObj?.title || ""} onChange={(e) => inputHandler(e)} />
                                                </div>
                                            </div>

                                            <div className='rz_custom_form mt-0'>
                                                <div className="ps_create_post_text_btn">
                                                    <label className="form-label pt-2"> Caption <span className="text-danger">*</span></label>
                                                    {userData?.plan?.ai_text_generate &&
                                                        <div><button className="rz_addAccBtn " onClick={handleTextModal}> Generate Caption +</button></div>
                                                    }
                                                </div>
                                                <textarea
                                                    type='text'
                                                    id="text"
                                                    className='rz_customInput rz_customTextArea'
                                                    placeholder='Enter caption'
                                                    value={postDataObj?.text || ""}
                                                    onChange={(e) => inputHandler(e)}
                                                ></textarea>
                                            </div>
                                            <div className="ps_create_post_img">
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div className="col-md-7 me-2">
                                                        <label className="form-label"> <div className="d-flex align-items-center gap-2">  Image/Video</div></label>
                                                    </div>
                                                    <button className='rz_addAccBtn' onClick={() => setImgModal(true)}>{postDataObj?.url ? "Update Media +" : "Choose Media +"}</button>
                                                </div>

                                                {postDataObj?.url &&
                                                    <>
                                                    
                                                        {postDataObj?.type == "image" ?
                                                            <div className="pt-2">
                                                                <div className="ps_assets_icon_imgbox m-auto">
                                                                    <img src={postDataObj?.url} />
                                                                    <div className="ps_assets_icon_close_btn" onClick={() => removeSelectedImage()} >{svg.app.closeIcon}</div>
                                                                </div>
                                                            </div>
                                                            :
                                                            <div className="pt-2">
                                                                <div className="ps_assets_icon_videobox ps_assets_width_video m-auto">
                                                                    <video src={postDataObj?.url} controls />
                                                                    <div className="ps_assets_icon_close_btn" onClick={() => removeSelectedImage()} >{svg.app.closeIcon}</div>
                                                                </div>
                                                            </div>
                                                        }
                                                    </>
                                                }
                                            </div>
                                        </div>
                                        {multiPost.length > 0 ? <div className="ps_wdth_500 ">
                                            <div className="ps_schedule_box  ">
                                                <div >
                                                    {viewPostTab()}
                                                </div>
                                            </div>
                                        </div> : ""}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-center d-flex justify-content-center gap-2">
                            {userData?.plan?.post_type != "single" &&
                                <>
                                    {update === "false" ? <button className='rz_addAccBtn_blk' onClick={() => addCreatePost()}> Add  Post {svg.app.plusIcon}</button>
                                        :
                                        <button className='rz_addAccBtn_blk' onClick={() => updatePost()}> Update</button>
                                    }
                                </>
                            }
                            <button className='rz_addAccBtn' onClick={submitData}> Next {svg.app.nextIcon}</button>
                        </div>
                    </div>
                </div>
            </div>

            <MyModal
                shown={modal}
                close={() => {
                    toggleModal();
                }}
            >
                <div className="modal-body" style={{ width: "100%" }}>
                    <div className="modal-header">
                        <h3>Generate Caption</h3>
                    </div>
                    {!showTextArea ? <div className="">
                        <label className="form-label pt-2"> Prompt For Caption <span className="text-danger">*</span></label>
                        <div className="d-flex justify-content-between">

                            <div className="col-10 col-9  me-2">
                                <input type="text" id="searchText" placeholder="Enter prompt for caption" className="form-control form-control-md" value={postDataObj?.searchText || ""} onChange={(e) => inputHandler(e)} />
                            </div>
                            <button className='rz_addAccBtn' disabled={isDisabled} onClick={getAiText}>Generate </button>
                        </div>
                    </div> : <> <div className="">
                        <label className="form-label pt-2"> Prompt For Caption <span className="text-danger">*</span></label>
                        <div className="d-flex justify-content-between">

                            <div className=" col-10  me-2">
                                <input type="text" id="searchText" placeholder="Enter prompt for caption" className="form-control form-control-md" value={postDataObj?.searchText || ""} onChange={(e) => inputHandler(e)} />
                            </div>
                            <button className='rz_addAccBtn' disabled={isDisabled} onClick={getAiText}>Generate </button>
                        </div>
                    </div>
                        <div className='rz_custom_form'>
                            <textarea
                                type='text'
                                id="aiText"
                                className='rz_customInput rz_customTextArea'
                                placeholder='Text'
                                disabled={isTextAreaDisabled}
                                value={postDataObj?.aiText || ""}
                                onChange={(e) => inputHandler(e)}
                            ></textarea>
                            <div className="d-flex justify-content-center gap-2">
                                <button className='rz_addAccBtn' disabled={isUseTextBtn} onClick={() => { AiText(postDataObj?.aiText) }}>Use Text +</button>
                                <button className='rz_addAccBtn_blk' disabled={isTextRegenBtn} onClick={getAiText}>Re-Generate</button>
                            </div>
                        </div> </>}
                </div>
            </MyModal >

            <MyModal
                shown={imgModal}
                close={() => {
                    setImgModal(false);
                    setTabIndex(0)
                    setcustomTabIndex(0)
                    setMyState(setQuery, {
                        page: 1,
                        limit: 12
                    });

                }}
            >
                <div className="modal-body" style={{ width: "100%" }}>
                    <div className="modal-header ">
                        <h4 className="mb-3" >Add Media</h4>
                    </div>


                    <div className='ps_create_post_video_img'>
                        <div className="ps_min_conatiner">

                            <ul className="tab-list">
                                <li
                                    className={`tabs ${getActiveClass(1, "active-tabs")}`}
                                    onClick={() => toggleTab(1)}
                                >
                                    Images
                                </li>
                                <li
                                    className={`tabs ${getActiveClass(2, "active-tabs")}`}
                                    onClick={() => toggleTab(2)}
                                >
                                    Videos
                                </li>
                            </ul>
                        </div>

                        <div className="content-container">
                            <div className={`content ${getActiveClass(1, "active-content")}`}>
                                <div className="w-100">
                                    <div className=" ps_create_post_tabs" >
                                        <div className={`ps_create_post ${customTabIndex == 0 ? "ps_create_post_active" : ""}`}>
                                            <h6 onClick={() => handleCustomTab(0)}> Upload Image</h6>
                                        </div>
                                        {userData?.plan?.ai_image_generate &&
                                            <div className={`ps_create_post ${customTabIndex == 1 ? "ps_create_post_active" : ""}`}>
                                                <h6 onClick={() => handleCustomTab(1)}>Generate Image</h6>
                                            </div>
                                        }
                                        <div className={`ps_create_post ${customTabIndex == 2 ? "ps_create_post_active" : ""}`}>
                                            <h6 onClick={() => handleCustomTab(2)}> Image Library</h6>
                                        </div>
                                    </div>
                                    <div className="ps_create_post_box_bg_tabs">
                                        <div className="">
                                            <div className="">
                                                {customTabIndex === 0 && tab1()}
                                                {customTabIndex === 1 && tab2()
                                                }
                                                {customTabIndex === 2 && tab3()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`content ${getActiveClass(2, "active-content")}`}>
                            <div className="w-100">
                                <div className=" ps_create_post_tabs" >
                                    <div className={`ps_create_post ${customTabIndex == 0 ? "ps_create_post_active" : ""}`}>
                                        <h6 onClick={() => handleCustomTab(0)}> Upload Video</h6>
                                    </div>

                                    <div className={`ps_create_post ${customTabIndex == 2 ? "ps_create_post_active" : ""}`}>
                                        <h6 onClick={() => handleCustomTab(2)}> Video Library</h6>
                                    </div>
                                </div>
                                <div className="ps_create_post_box_bg_tabs">
                                    <div className="">
                                        <div className="">
                                            {customTabIndex === 0 && tab4()}
                                            {/* {customTabIndex === 1 && tab5()} */}
                                            {customTabIndex === 2 && tab6()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </MyModal >

            <MyModal
                shown={isPreviewImage}
                close={() => {
                    setIsPreviewImage(false);
                    setTabIndex(0)
                    setcustomTabIndex(0)
                }}
            >
                <div className="modal-body" style={{ width: "100%" }}>
                    <div className="modal-header">
                        <h3>Preview</h3>
                    </div>
                    <div className='ps_assets_icon_videobox'>
                        <video src={process.env.S3_PATH + previewData?.path} controls />
                    </div>
                </div>
            </MyModal >

            <ConfirmationPopup
                shownPopup={isRemoveAction}
                closePopup={() => {
                    setIsRemoveAction(false)
                }}
                type={"Post"}
                removeAction={() => {
                    handleMultiPostDelete(isRemoveAction)
                }}
            />
        </>
    )

}

