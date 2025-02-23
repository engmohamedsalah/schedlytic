import { useEffect, useRef, useState } from "react";
import Head from 'next/head';
import svg from "@/components/svg";
import { common } from "@/components/Common";
import { appStore } from '@/zu_store/appStore';

export default function Dashboard() {
    const [dashboardData, setDashboardData] = useState()
    const [isLoading, setIsLoading] = useState(false)
    const [isPlayingVideo, setIsPlayingVideo] = useState(false)
 
    const elementRef = useRef(null);
    let myStore = appStore(state => state);
    let userData = myStore.userData;
	console.log("userData",userData)
    useEffect(() => {
        getUserDashboardData()
        // userData['plan'] ={
		// 	Facebook:"Facebook",
		// 	Instagram:"Instagram",
		// 	Linkedin:"Linkedin",
		// 	Pinterest:"Pinterest",
		// 	Youtube:"Youtube"
		// }
            myStore.updateStoreData("userData", userData);
    }, [])

    const handleButtom = () => {
        if (isPlayingVideo) {
            elementRef.current.pause()
            setIsPlayingVideo(false)
        } else {
            elementRef.current.play()
            setIsPlayingVideo(true)
        }
    }

    const getUserDashboardData = () => {
        setIsLoading(true)
        common.getAPI({
            method: 'GET',
            url: 'dashboard',
            data: {}
        }, (resp) => {
            if (resp.status) {
                setIsLoading(false)
                setDashboardData(resp.data)
            }
        });
    }
    useEffect(() => {
        // getWebSettingsData();
        
    }, []);

    
    const getWebSettingsData = async (e) => {
            await common.getAPI({
                method: 'GET',
                url: 'web-setting?action=getweb',
                data: {},
            }, (resp) => {
                console.log("resp",resp)
                const customizationData = {
                    siteTitle: resp.data.siteTitle,
                    primaryColor: resp?.data?.primaryColor,
                    secondaryColor: resp?.data?.primaryColor,
                    bodyColor: resp?.data?.bodyColor,
                    primaryLightColor:resp?.data?. primaryLightColor,
                    paragraphColor: resp?.data?.paragraphColor,
                    headingColor: resp?.data?.headingColor,
                    googleScript: resp?.data?.googleScript
                }
    
            userData['adminprofileUrl'] =  resp?.data?.logo
            userData['adminfaviconUrl'] =  resp?.data?.favIcon
            userData['Color'] =customizationData
            // myStore.updateStoreData("userData", userData)
            });
        
    }

    const check=(social)=>{
        return userData?.plan?.socialIntregation?.includes(social)
    }

    return (
        <>
            <Head>
            <title>{(userData?.Color?.siteTitle)?userData?.Color?.siteTitle:process.env.SITE_TITLE}- Dashboard</title>
            </Head>
            {!isLoading ? <div className='rz_dashboardWrapper' >
                <div className="ps_conatiner-fluid ">
                    <div className="row py-5">
                        <div className="dash_header_box">
                            <div className="dash_header">
                                <h2>Welcome To {(userData?.Color?.siteTitle)?userData?.Color?.siteTitle:process.env.SITE_TITLE}</h2>
                                
                            </div>
                    
                        </div>
                    </div>
                    <><div className='row '>
                        <div className='Dash_box_user_div Dash_pad dash_bg_color'>
                            <div className='rz_member' style={{ "background": "#ebe1e9" }}>
                                <div className='dash_inner' >
                                    <div className="dash_icon_box" style={{ "background": "#ff776b" }}>
                                        {svg.app.dash_img}
                                    </div>
                                    <div>
                                        <h6 >{dashboardData?.published + dashboardData?.pending || 0}</h6>
                                        <h5 style={{ "color": "#ff776b" }}>Total Posts</h5>
                                    </div>
                                </div>
                            </div>
                            <div className='rz_member' style={{ "background": "#ead9ed" }}>
                                <div className='dash_inner' >
                                    <div className="dash_icon_box" style={{ "background": "#E4405F" }}>
                                        {svg.app.dash_calc}
                                    </div>
                                    <div>
                                        <h6 >{dashboardData?.pending || 0}</h6>
                                        <h5 style={{ "color": "#E4405F" }}>Total  Scheduled</h5>
                                    </div>
                                </div>
                            </div>
                            <div className='rz_member' style={{ "background": "#d4ddf7" }}>
                                <div className='dash_inner' >
                                    <div className="dash_icon_box" style={{ "background": "#0A66C2" }}>
                                        {svg.app.dash_published}
                                    </div>
                                    <div>
                                        <h6 >{dashboardData?.published}</h6>
                                        <h5 style={{ "color": "#0A66C2" }}>Total Published</h5>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                        <div className='row mt-3'>
                            {userData?.plan?.socialIntregation?.length>0 && 
                            <div className='Dash_box_user_div Dash_pad  dash_bg_color'>
                                {(check("facebook")) && <div className='rz_member' style={{ "background": "#d5dffc" }}>
                                    <div className='dash_inner' >
                                        <div className="dash_icon_box" style={{ "background": "#1877F2" }}>
                                            {svg.app.facebook}
                                        </div>
                                        <div>
                                            <h6 >{dashboardData?.facebook || 0}</h6>
                                            <h5 style={{ "color": "#1877F2" }}>Facebook Posts</h5>
                                        </div>
                                    </div>
                                </div>}
                                {(check("instagram")) && <div className='rz_member' style={{ "background": "#ead9ed" }}>
                                    <div className='dash_inner' >
                                        <div className="dash_icon_box" style={{ "background": "#E4405F" }}>
                                            {svg.app.instagram}
                                        </div>
                                        <div>
                                            <h6 >{dashboardData?.instagram || 0}</h6>
                                            <h5 style={{ "color": "#E4405F" }}>Instagram Posts</h5>
                                        </div>
                                    </div>
                                </div>}
                                {(check("linkedin")) &&<div className='rz_member' style={{ "background": "#d4ddf7" }}>
                                    <div className='dash_inner' >
                                        <div className="dash_icon_box" style={{ "background": "#0A66C2" }}>
                                            {svg.app.linkedin}
                                        </div>
                                        <div>
                                            <h6 >{dashboardData?.linkedin || 0}</h6>
                                            <h5 style={{ "color": "#0A66C2" }}>Linkedin Posts</h5>
                                        </div>
                                    </div>
                                </div>}
                                {check("pinterest") &&<div className='rz_member' style={{ "background": "#e6d8ea" }}>
                                    <div className='dash_inner' >
                                        <div className="dash_icon_box" style={{ "background": "#BD081C" }}>
                                            {svg.app.pinterst}
                                        </div>
                                        <div>
                                            <h6 >{dashboardData?.pinterest || 0}</h6>
                                            <h5 style={{ "color": "#BD081C" }}>Pinterest Posts</h5>
                                        </div>
                                    </div>
                                </div>}
                                {(check("youtube")) && <div className='rz_member' style={{ "background": "rgb(255, 226, 228)" }}>
                                    <div className='dash_inner' >
                                        <div className="dash_icon_box" style={{ "background": "red" }}>
                                            {svg.app.youtube}
                                        </div>
                                        <div>
                                            <h6 >{dashboardData?.youtube || 0}</h6>
                                            <h5 style={{ "color": "#BD081C" }}>Youtube Posts</h5>
                                        </div>
                                    </div>
                                </div>}
                            </div>
                            }
                        </div> </>
                </div>
            </div> :   <div className="spinner-border" style={{color:"#e74c3c"}} role="status">
                <span className="sr-only"></span>
            </div>}
        </>
    )
}