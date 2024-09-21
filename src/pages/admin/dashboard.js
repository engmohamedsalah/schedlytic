"use client"
import { LineChart } from "@/components/chart/LineChart";
import { useEffect, useState } from "react";
import Head from 'next/head';
import svg from "@/components/svg";
import moment from "moment";
import { DateRangePicker } from 'rsuite';
import { common } from "@/components/Common";
import { useRouter } from 'next/router';

export default function Dashboard() {
    const [graph, setgraph] = useState("publish")
    const [isLoading, setIsLoading] = useState(false);

    const [dashBoardData, setDashBoardData] = useState();
    const [selectedDateRange, setSelectedDateRange] = useState({
        startDate: moment().startOf('month').format('YYYY-MM-DD'),
        endDate: moment().endOf('month').format('YYYY-MM-DD')
    });

    const [selectPostRange, setSelectPostRange] = useState({
        startDate: moment().startOf('month').format('YYYY-MM-DD'),
        endDate: moment().endOf('month').format('YYYY-MM-DD')
    });

    const router = useRouter();

    useEffect(() => {
        getDashboardData()
    }, [])

    const getDashboardData = () => {
        setIsLoading(true)
        common.getAPI({
            method: 'GET',
            url: 'dashboard',
            data: {}
        }, (resp) => {
            if (resp.status) {
                setIsLoading(false)
                setDashBoardData(resp.data)
            }
        });
    }

    const handleDateRangeFilter = (dates) => {
        if (!dates) {
            const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
            const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');
            selectedDateRange.startDate = startOfMonth
            selectedDateRange.endDate = endOfMonth
            setSelectedDateRange({ ...selectedDateRange })
        }
        if (dates?.length > 0) {
            selectedDateRange.startDate = moment(dates[0]).format("YYYY-MM-DD")
            selectedDateRange.endDate = moment(dates[1]).format("YYYY-MM-DD")
            setSelectedDateRange({ ...selectedDateRange })
        }
        setIsLoading(true)
    }

    const handleDateRangePostFilter = (dates) => {
        if (!dates) {
            const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
            const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');
            selectedDateRange.startDate = startOfMonth
            selectedDateRange.endDate = endOfMonth
            setSelectPostRange({ ...selectedDateRange })
        }
        if (dates?.length > 0) {
            selectedDateRange.startDate = moment(dates[0]).format("YYYY-MM-DD")
            selectedDateRange.endDate = moment(dates[1]).format("YYYY-MM-DD")
            setSelectPostRange({ ...selectedDateRange })
        }
        setIsLoading(true)
    }

    return (
        <>
            <Head>
                <title>{process.env.SITE_TITLE}- Dashboard</title>
            </Head>
            {dashBoardData ? <div className='rz_dashboardWrapper' >
                <div className="ps_conatiner-fluid">
                    <div className='row '>

                        <div className='Dash_box_user Dash_pad2'>
                            <div className='rz_member' style={{ "background": "#d6e3fc" }}>
                                <div className='dash_inner' >
                                    <div className="dash_icon_box" style={{ "background": "#1DA1F2" }}>
                                        {svg.app.dash_img}
                                    </div>
                                    <div>
                                        <h6 >{dashBoardData?.pending + dashBoardData?.published || 0}</h6>
                                        <h5 style={{ "color": "#1DA1F2" }}>Total Posts</h5>
                                    </div>
                                </div>
                            </div>
                            <div className='rz_member' style={{ "background": "#e6d8ea" }}>
                                <div className='dash_inner' >
                                    <div className="dash_icon_box" style={{ "background": "#BD081C" }}>
                                        {svg.app.dash_calc}
                                    </div>
                                    <div>
                                        <h6 >{dashBoardData?.pending || 0}</h6>
                                        <h5 style={{ "color": "#BD081C" }}>Total  Scheduled</h5>
                                    </div>
                                </div>
                            </div>
                            <div className='rz_member' style={{ "background": "#d4ddf7" }}>
                                <div className='dash_inner' >
                                    <div className="dash_icon_box" style={{ "background": "#0A66C2" }}>
                                        {svg.app.dash_published}
                                    </div>
                                    <div>
                                        <h6 >{dashBoardData?.published || 0}</h6>
                                        <h5 style={{ "color": "#0A66C2" }}>Total Published</h5>
                                    </div>
                                </div>
                            </div>
                            <div className='rz_member' style={{ "background": "var(--primarybg_color)" }}>
                                <div className='dash_inner' >
                                    <div className="dash_icon_box" style={{ "background": "var(--gradientColor)" }}>
                                        {svg.app.dash_published}
                                    </div>
                                    <div>
                                        <h6 >{dashBoardData?.published || 0}</h6>
                                        <h5 style={{ "color": "var(--primaryColor)" }}>Total Templates</h5>
                                    </div>
                                </div>
                            </div>
                            <div className='rz_member' style={{ "background": "#ead9ed" }}>
                                <div className='dash_inner' >
                                    <div className="dash_icon_box" style={{ "background": "#E4405F" }}>
                                        {svg.app.userIcon}
                                    </div>
                                    <div>
                                        <h6 >{dashBoardData?.users || 0}</h6>
                                        <h5 style={{ "color": "#E4405F" }}>Total Users</h5>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-lg-6">
                            <div className='Dash_chart'>
                                <div className='card-body' style={{ marginTop: "10px" }}>
                                    <div className='rz_row'>
                                        <h6 className="text-center">Social Media Posts Analytics</h6>
                                        <div className='rz_dash_div'>
                                            <div className="pb-md-0 pb-3">

                                                <div className='rz_searchBox'>
                                                    <div className=''>
                            
                                                        <DateRangePicker
                                                            onChange={(e) => handleDateRangeFilter(e)}
                                                            placeholder="Select date range"
                                                            ranges={[]}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className=""><LineChart post={false} dateRange={selectedDateRange} /></div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 ">
                            <div className='Dash_chart'>
                                <div className='card-body' style={{ marginTop: "10px" }}>
                                    <div className='rz_row'>
                                        <h6 className="text-center"> Posts Analytics</h6>
                                        <div className='rz_dash_div justify-content-between'>
                                            <div className="pb-md-0 pb-3">

                                                <div className='rz_searchBox'>
                                                    <div className=''>
                                                        <DateRangePicker
                                                            onChange={(e) => handleDateRangePostFilter(e)}
                                                            placeholder="Select date range"
                                                            ranges={[]}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='d-flex align-items-center '>
                                                <div>
                                                    <div className='d-flex justify-content-between px_image_editor_main_box ps_dashboad_btn'>
                                                        <div className='d-flex justify-content-between align-items-center'>

                                                            <div className='editor_checkbox' onClick={() => setgraph("scdule")}>
                                                                <input className="custem_checkbox" checked={graph == "scdule" ? true : false} id="text-align-left" type="radio" name="same" />
                                                                <label htmlFor="text-align-left">
                                                                    <span className='text-decoration-underline'>Scheduled Posts</span>
                                                                </label>
                                                            </div>
                                                            <div className='editor_checkbox' onClick={() => setgraph("publish")}>
                                                                <input className="custem_checkbox" checked={graph == "publish" ? true : false} id="text-align-center" type="radio" name="same" />
                                                                <label htmlFor="text-align-center">
                                                                    <span className='fw-bold'>Published Posts</span>
                                                                </label>
                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                    <div className=""><LineChart graph={graph} post={true} dateRange={selectPostRange} /></div>


                                </div>
                            </div>

                            
                        </div>
                    </div>

                </div>
            </div> : <div className="spinner-border" style={{ color: "#e74c3c" }} role="status">
                <span className="sr-only"></span>
            </div>}
        </>
    )
}