import svg from '@/components/svg';
import React, { useState, useEffect } from 'react';
import Head from 'next/head'
import Select from 'react-select';
import { NoDataWrapper, common, setMyState } from '@/components/Common';
import MyModal from '@/components/common/MyModal';
import { toast } from "react-toastify";
import { useRouter } from 'next/router';
import ConfirmationPopup from '@/components/common/ConfirmationPopup';
import { appStore } from '@/zu_store/appStore';


export default function AdminSetting() {
    const [ inputdata,setInputData] = useState({
        title: '',
        googleScript: '',
        cp1: '#FF776B',
        cp2: '#ffad5d',
        cp3: '#EAEAFD',
        cp4: '#EF8080',
        cp5: '#6278AC',
        cp6: '#29325F'
    })

    const getInputValue = (e) => {
        const { id, value } = e.target;
        setInputData((prevValue) => ({
            ...prevValue,
            [id]: value
        }));
    };
    
    let [isObj, setIsObj] = useState();
    let [isObjdfav, setIsObjfav] = useState();
    
    const [logoURLprofile, setLogoURLprofile] = useState('');
    const [logoURL, setLogoURL] = useState('');
    const [logoFile, setLogoFile] = useState('');
    const [faviconURL, setFaviconURL] = useState('');
    const [faviconURLprofile, setFaviconURLprofile] = useState('');
    const [faviconFile, setFaviconFile] = useState('');
    let myStore = appStore(state => state);
    let userData = myStore.userData;
    useEffect(() => {
        getWebSettingsData();
    }, []);

    const getWebSettingsData = async (e) => {
       
            await common.getAPI({
                method: 'GET',
                url: 'web-setting?action=getweb',
                isFormData: true,
            }, (resp) => {
                console.log("resp.data",resp.data)
                if(resp.data)
                {
                    const customizationData = {
                        siteTitle: resp.data.siteTitle,
                        primaryColor: resp?.data?.primaryColor,
                        secondaryColor: resp?.data?.secondaryColor,
                        bodyColor: resp?.data?.bodyColor,
                        primaryLightColor:resp?.data?. primaryLightColor,
                        paragraphColor: resp?.data?.paragraphColor,
                        headingColor: resp?.data?.headingColor,
                        googleScript: resp?.data?.googleScript
                    }        
                    userData['adminprofileUrl'] = resp.data.logo;
                    userData['adminfaviconUrl'] = resp.data.favIcon;
                    userData['Color'] =customizationData;
                    myStore.updateStoreData("userData", userData);
                    console.log("resp",resp)
                    setInputData({
                        title: resp?.data?.siteTitle,
                        googleScript:resp?.data?.googleScript ,
                        cp1:resp?.data?.primaryColor,
                        cp2:resp?.data?.secondaryColor,
                        cp3:resp?.data?.bodyColor,
                        cp4:resp?.data?. primaryLightColor,
                        cp5:resp?.data?.paragraphColor,
                        cp6:resp?.data?.headingColor
                    })
                    setLogoURL (resp?.data?.logo);
                    setFaviconURL (resp?.data?.favIcon);  
                }
                       
            });
        
    }
    const uploadLogoImage = (event ,code ) => {
        setIsObj(event.target.type)
        const file = event.target.files[0];
        if (file) {
            if (file.type.includes('image/')) {
                const url = URL.createObjectURL(file);
                setLogoURL(url);
                setLogoFile(file);
            } else {
                AlertMsg('error', 'Upload valid image!', 'Only PNG and JPG are allowed!');
            }
        }
                   
                
    }

    const uploadFaviconImage = (event) => {
        setIsObjfav(event.target.type)
        const file = event.target.files[0];
        if (file) {
            if (file.type.includes('image/')) {
                const url = URL.createObjectURL(file);
                setFaviconURL(url);
                setFaviconFile(file);
            } else {
                AlertMsg('error', 'Upload valid image!', 'Only PNG and JPG are allowed!');
            }
        }

    }


    const uploadLogo = async (e) => {
        console.log('logoFile', logoFile)
         if (inputdata?.title == "") {
            toast.error("Title is required.")
            return;
        }

        if (!inputdata?.cp1) {
            toast.error("primaryColor is required.")
            return;
        }
        if (!inputdata?.cp2) {
            toast.error("secondaryColor is required.")
            return
        }
        if (!inputdata?.cp3) {
            toast.error("bodyColor is required.")
            return
        }
        if (!inputdata?.cp4) {
            toast.error("primaryLightColor should be valid.")
            return
        }
        if (!inputdata?.cp5) {
            toast.error("paragraphColor is required.")
            return
        }
        if (!inputdata?.cp6) {
            toast.error("headingColor is required.")
            return
        }
        if (!logoURL) {
            toast.error("logo is required.")
            return
        }
        if (!faviconURL) {
            toast.error("Favicon is required.")
            return
        }

        if(isObj=='file')
            {
                if (logoFile?.type == "image/jpeg" || logoFile?.type == "image/png") {
                    let selectedFile = logoFile;
                    let data = new FormData();
                    data.append("file", selectedFile, selectedFile.name);
                    await common.getAPI({
                method: 'POST',
                url: 'web-setting-media?action=UPLOAD',
                data: data,
                isFormData: true,
            }, async(resp) => {
                console.log("adminprofileUrl" ,resp.data.url)
                userData['adminprofileUrl'] = process.env.S3_PATH + resp.data.url
                myStore.updateStoreData("userData", userData)
                await uploadFavicon(resp.data.url)
            });
        } else {
            toast.error('Please upload png/jpeg file type ');
        }
    }else{
        await uploadFavicon(logoURL);
    }
    }
    const uploadFavicon = async (url1) => {
        if(isObjdfav=='file'){
            console.log('faviconFile', faviconFile)
            if (faviconFile?.type == "image/jpeg" || faviconFile?.type == "image/png") {
                let selectedFile = faviconFile;
                
                let data = new FormData();
                data.append("file", selectedFile, selectedFile.name);
                await common.getAPI({
                method: 'POST',
                url: 'web-setting-media?action=UPLOAD',
                data: data,
                isFormData: true,
            }, async(resp) => {
                console.log("adminfaviconUrl",resp.data.url)
                userData['adminfaviconUrl'] = process.env.S3_PATH + resp.data.url
                await saveData(url1,resp.data.url);
            });
        } else {
            toast.error('Please upload png/jpeg  df file type ');
        }
    }else
    {
        await saveData(url1,faviconURL);
    }
    }

    const saveData = (u1 ,u2) => {
        console.log("inputdata",inputdata);
        const rData = {
            siteTitle: inputdata.title,
            primaryColor: inputdata.cp1,
            secondaryColor: inputdata.cp2,
            bodyColor:inputdata.cp3,
            primaryLightColor:inputdata.cp4,
            paragraphColor:inputdata.cp5,
            headingColor:inputdata.cp6,
            googleScript:inputdata.googleScript,
            logoPath:u1.includes(process.env.S3_PATH)?u1:process.env.S3_PATH+u1,
            faviconPath: u2.includes(process.env.S3_PATH)?u2:process.env.S3_PATH+u2
        }
       

        common.getAPI({
            method: 'POST',
            url: 'web-setting',
            data: rData,
            isLoader: false
        }, (resp) => {
            console.log('resp', resp?.customizationData);
            userData['Color'] =resp?.customizationData;
            myStore.updateStoreData("userData", userData);

        }
        );


    }
  
    return (
        <>
            <Head>
                <title>{process.env.SITE_TITLE}- Assets</title>
            </Head>
            <div className='w-100' >
                <div className='ps_conatiner '>
                    <div className="dash_header mt-4">
                        <h2>Web Settings</h2>
                    </div>
                    <div className='rz_socail_platform_bg  '>
                        <div className='ps_profile_box_bg pt-0'>


                            <div className='row'>

                                <div className='col-md-12'>
                                    <div className="rz_custom_form mb-4">
                                        <label className="form-label"> Title </label>
                                        <input
                                            value={inputdata.title}
                                            id="title"
                                            onChange={getInputValue} 
                                             name="title" type="text" className={`rz_customInput`}
                                            placeholder="Enter your title" />
                                    </div>
                                </div>
                                {/* <div className='col-md-6'>
                                    <div className="rz_custom_form mb-4">
                                        <label className="form-label"> Google Script </label>
                                        <input
                                            value={inputdata.googleScript}
                                            id="googleScript"
                                            onChange={getInputValue}
                                            name="googleScript" type="text" className={`rz_customInput`}
                                            placeholder="Enter your google script" />
                                    </div>
                                </div> */}


                                <div className='col-md-6'>
                                    <div className="xs_input_wrapper_list mb-4" style={{ maxWidth: 600 }}>
                                        <div className="xs_input_wrapper">
                                            <label className='mb-2'>Logo <span>(max 250x80)</span></label>
                                            <div className="xs_upload_file_box">
                                                <label>
                                                    <input type="file" onChange={(e) => uploadLogoImage(e)} accept=".png,.jpg" />
                                                    {logoURL ?
                                                        <div className="xs_file_preview">
                                                            <img src={logoURL} alt="" />
                                                        </div> :
                                                        <div className="xs_upload_file_label">
                                                            <span>{svg.icon_upload}</span>
                                                            <p>Upload</p>
                                                        </div>
                                                    }
                                                </label>
                                                {logoURL ?
                                                    <span className="xs_remove_icon" onClick={() => setLogoURL('')}></span>
                                                    : null
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-6'>
                                    <div className="xs_input_wrapper_list mb-4" style={{ maxWidth: 600 }}>
                                        <div className="xs_input_wrapper">
                                            <label className='mb-2'>Favicon  <span>(max 32x32)</span></label>
                                            <div className="xs_upload_file_box">
                                                <label>
                                                    <input type="file" onChange={(e) => uploadFaviconImage(e)} accept=".png,.jpg" />
                                                    {faviconURL ?
                                                        <div className="xs_file_preview">
                                                            <img src={faviconURL} alt="" />
                                                        </div> :
                                                        <div className="xs_upload_file_label">
                                                            <span>{svg.icon_upload}</span>
                                                            <p>Upload</p>
                                                        </div>
                                                    }
                                                </label>
                                                {faviconURL ?
                                                    <span className="xs_remove_icon" onClick={() => setFaviconURL('')}></span>
                                                    : null
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col-md-4 mb-4'>
                                        <div className="ps_color_picker_wrapper">
                                            <label className="form-label"> Primary Color </label>
                                            <div className="ps_color_picker_toggle w-100">
                                                <input
                                                    type="color"
                                                    id='cp1'
                                                    value={inputdata.cp1}
                                                    onChange={getInputValue}
                                                />
                                                <span>{inputdata.cp1}</span>

                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-md-4'>
                                        <div className="ps_color_picker_wrapper">
                                            <label className="form-label"> Secondary Color </label>
                                            <div className="ps_color_picker_toggle w-100">
                                                <input
                                                    type="color"
                                                    id="cp2"
                                                    value={inputdata.cp2}
                                                    onChange={getInputValue}
                                                />
                                                <span>{inputdata.cp2}</span>

                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-md-4'>
                                        <div className="ps_color_picker_wrapper">
                                            <label className="form-label"> Body Color  </label>
                                            <div className="ps_color_picker_toggle w-100">
                                                <input
                                                    type="color"
                                                    value={inputdata.cp3}
                                                    id="cp3"
                                                    onChange={getInputValue}
                                                />
                                                <span>{inputdata.cp3}</span>

                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-md-4'>
                                        <div className="ps_color_picker_wrapper">
                                            <label className="form-label"> Primary Light Color  </label>
                                            <div className="ps_color_picker_toggle w-100">
                                                <input
                                                    type="color"
                                                    id="cp4"
                                                    value={inputdata.cp4}
                                                    onChange={getInputValue}
                                                />
                                                <span>{inputdata.cp4}</span>

                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-md-4'>
                                        <div className="ps_color_picker_wrapper">
                                            <label className="form-label"> Paragraph Color  </label>
                                            <div className="ps_color_picker_toggle w-100">
                                                <input
                                                    type="color"
                                                    value={inputdata.cp5}
                                                    id="cp5"
                                                    onChange={getInputValue}
                                                />
                                                <span>{inputdata.cp5}</span>

                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-md-4'>
                                        <div className="ps_color_picker_wrapper">
                                            <label className="form-label"> Heading Color  </label>
                                            <div className="ps_color_picker_toggle w-100">
                                                <input
                                                    type="color"
                                                    value={inputdata.cp6}
                                                    id="cp6"
                                                    onChange={getInputValue}
                                                />
                                                <span>{inputdata.cp6}</span>

                                            </div>
                                        </div>
                                    </div>

                                    <div className='d-flex justify-content-start mt-5 '>
                                        <div className=''><button disabled={process.env.TYPE=='demo'} onClick={(e) => { uploadLogo(e) }} className="rz_btn px-4"><span>Update Setting  </span></button></div>

                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}
