import { useEffect, useRef, useState } from "react";
import Head from 'next/head';
import svg from "@/components/svg";
import { common } from "@/components/Common";

export default function Dashboard() {
    const [dashboardData, setDashboardData] = useState()
    const [isLoading, setIsLoading] = useState(false)
    const [isPlayingVideo, setIsPlayingVideo] = useState(false)
 
    const elementRef = useRef(null);

    useEffect(() => {
        getUserDashboardData()
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

    return (
        <>
            <Head>
            <title>{process.env.SITE_TITLE}- Dashboard</title>
            </Head>
            {!isLoading ? <div className='rz_dashboardWrapper' >
                <div className="ps_conatiner-fluid ">
                    <div className="row py-5">
                        <div className="dash_header_box">
                            <div className="dash_header">
                                <h2>Welcome To {process.env.SITE_TITLE}</h2>
                                
                            </div>
                    
                        </div>
                    </div>
                    <><div className='row '>
                        <div className='Dash_box_user_div Dash_pad dash_bg_color'>
                            <div className='rz_member' style={{ "background": "var(--primarybg_color)" }}>
                                <div className='dash_inner' >
                                    <div className="dash_icon_box" style={{ "background": "var(--gradientColor)" }}>
                                        {svg.app.dash_img}
                                    </div>
                                    <div>
                                        <h6 >{dashboardData?.published + dashboardData?.pending || 0}</h6>
                                        <h5 style={{ "color": "var(--primaryColor)" }}>Total Posts</h5>
                                    </div>
                                </div>
                            </div>
                            <div className='rz_member' style={{ "background": "var(--primarybg_color)" }}>
                                <div className='dash_inner' >
                                    <div className="dash_icon_box" style={{ "background": "var(--gradientColor)" }}>
                                        {svg.app.dash_calc}
                                    </div>
                                    <div>
                                        <h6 >{dashboardData?.pending || 0}</h6>
                                        <h5 style={{ "color": "var(--primaryColor)" }}>Total  Scheduled</h5>
                                    </div>
                                </div>
                            </div>
                            <div className='rz_member' style={{ "background": "var(--primarybg_color)" }}>
                                <div className='dash_inner' >
                                    <div className="dash_icon_box" style={{ "background": "var(--gradientColor)" }}>
                                        {svg.app.dash_published}
                                    </div>
                                    <div>
                                        <h6 >{dashboardData?.published}</h6>
                                        <h5 style={{ "color": "var(--primaryColor)" }}>Total Published</h5>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                        <div className='row mt-3'>
                            <div className='Dash_box_user_div Dash_pad  dash_bg_color'>
                                <div className='rz_member' style={{ "background": "#d5dffc" }}>
                                    <div className='dash_inner' >
                                        <div className="dash_icon_box" style={{ "background": "#1877F2" }}>
                                            {svg.app.facebook}
                                        </div>
                                        <div>
                                            <h6 >{dashboardData?.facebook || 0}</h6>
                                            <h5 style={{ "color": "#1877F2" }}>Facebook Posts</h5>
                                        </div>
                                    </div>
                                </div>
                                <div className='rz_member' style={{ "background": "#ead9ed" }}>
                                    <div className='dash_inner' >
                                        <div className="dash_icon_box" style={{ "background": "#E4405F" }}>
                                            {svg.app.instagram}
                                        </div>
                                        <div>
                                            <h6 >{dashboardData?.instagram || 0}</h6>
                                            <h5 style={{ "color": "#E4405F" }}>Instagram Posts</h5>
                                        </div>
                                    </div>
                                </div>
                                <div className='rz_member' style={{ "background": "#d4ddf7" }}>
                                    <div className='dash_inner' >
                                        <div className="dash_icon_box" style={{ "background": "#0A66C2" }}>
                                            {svg.app.linkedin}
                                        </div>
                                        <div>
                                            <h6 >{dashboardData?.linkedin || 0}</h6>
                                            <h5 style={{ "color": "#0A66C2" }}>Linkedin Posts</h5>
                                        </div>
                                    </div>
                                </div>
                                <div className='rz_member' style={{ "background": "#e6d8ea" }}>
                                    <div className='dash_inner' >
                                        <div className="dash_icon_box" style={{ "background": "#BD081C" }}>
                                            {svg.app.pinterst}
                                        </div>
                                        <div>
                                            <h6 >{dashboardData?.pinterest || 0}</h6>
                                            <h5 style={{ "color": "#BD081C" }}>Pinterest Posts</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div> </>
                </div>
            </div> :   <div className="spinner-border" style={{color:"#e74c3c"}} role="status">
                <span className="sr-only"></span>
            </div>}
        </>
    )
}