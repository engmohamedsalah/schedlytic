import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import React, { useEffect, useRef, useState } from "react";
import {  common } from "@/components/Common";
import moment from "moment";
import svg from '@/components/svg';
import _ from "underscore";
import  { useRouter } from 'next/router';
import { encode as base64_encode } from 'base-64';
import ConfirmationPopup from "@/components/common/ConfirmationPopup";
import MyModal from "@/components/common/MyModal";
import Head from "next/head";
import useScreenSize from "@/components/useScreenSize ";
import { appStore } from "@/zu_store/appStore";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import { toast } from "react-toastify";
import { getNameInitials } from "@/components/utils/utility";

export default function Calender() {
    const [events, setEvents] = useState([]);
    const [scheduledPosts, setScheduledPosts] = useState([])
    const [isRemoveAction, setIsRemoveAction] = useState(false);
    const [priviewImage, setPriviewImage] = useState();
    const [isModel, setIsModel] = useState(false);
    const [isEventModal, setIsEventModal] = useState(false)
    const [scheduleDate, setScheduleDate] = useState()
    const [isLoading, setIsLoading] = useState(false)
    const [startDate, setStartDate] = useState()
    const [endDate, setEndDate] = useState()
  
    const windowSize = useScreenSize();
    const calendarRef = useRef(null);

    let myStore = appStore(state => state);
    let storeCalendarDate = myStore.calendarDate;
    let userData = myStore.userData;

    useEffect(() => {
        if (startDate) {
            getAllPost()
        }
    }, [startDate])

    useEffect(() => {
        someMethod()
    }, [])

    const router = useRouter();

    const getAllPost = () => {
        if (!startDate) return
        setIsLoading(true)
        common.getAPI({
            method: 'GET',
            url: `post?action=Month&start=${startDate}&end=${endDate}`,
            data: {}
        }, (resp) => {
            if (resp.status) {
                setIsLoading(false)
                let eventList = []
                resp.data.map((value, index) => {
                    eventList.push(...value.data)
                })
                let eventDataList = showEvents(eventList);
                setScheduledPosts(eventDataList)
            }
        })
    }

    const showEvents = (eventsData) => {
        if (eventsData.length === 0) return;
        let eventList = []
        let sl=[]
        eventsData.map((val, i) => {
            let event = {
                id: val._id,
                title: val?.title,
                posttype : val.posttype,
                thumb : val?.thumb,
                image:  val?.url,
                start: val.scheduleDate,
                socialMediaAccounts: val.socialMediaAccounts,
                text: val?.text,
                timezone: val?.timeZone,
                status: val.status,
                message : val?.message ? JSON.parse(val?.message) : ""
            }
            eventList.push(event);
            let n1={...event}
            n1.start=moment(val.scheduleDate).format() 
            sl.push(n1)
        })
        setEvents(sl)
        var groups = _.groupBy(eventList, function (value) {
            return moment(value.start).format("YYYY-MM-DD");
        });
        let dataList = []
        var index = 0;
        for (const key in groups) {
            let data = {
                id: index + 1,
                start: key,
                obj: groups[key]
            }
            dataList.push(data)
            index++
        }
        return dataList
    }
    const showDayDataList = (val, index) => {
        if (index > 3) {
            return null
        }
        return <div className="ps_calender_list">
            <div className="ps_calender_list_ul">
                <div className="ps_calender_list_ul">
                    <p>{moment(val.start).format('LT')}</p>
                    <h6>{val.title}</h6>
                </div>
                {val.status === "Failed" &&
                    <p className="text-danger">Failed</p>   }
                <div className="ps_calender_options">{svg.app.menu_icon}
                    <div className="ps_calender_options_div">
                        <ul>
                            {val.status === "pending" ? <li onClick={() => handleEditPost(val.id)}>Update</li> : ""}
                            <li onClick={() => { handleDeletePost(val.id) }}> Delete </li>
                            { <li onClick={() => handlePreviewEvent(val)}> Preview</li>}</ul>
                    </div>
                </div>
            </div>
        </div>
    }

    const showDayDatawithviewMore = (val, index) => {
        return <div className="ps_calender_list">
            <div className="ps_calender_list_ul">
                <div className="ps_calender_list_ul_address">
                    <p>{moment(val.start).format('LT')}</p>
                    <h6>{val.title}</h6>
                </div>
                {val.status === "Failed" &&
                    <p className="text-danger">Failed</p>   }
                <div className="ps_calender_options">{svg.app.menu_icon}
                
                    <div className="ps_calender_options_div">
                        
                    <ul>
                            {val.status === "pending" ? <li onClick={() => handleEditPost(val.id)}>Update</li> : ""}
                            <li onClick={() => { handleDeletePost(val.id) }}> Delete </li>
                            { <li onClick={() => handlePreviewEvent(val)}> Preview</li>}</ul>
                    
                        
                    </div>
                </div>

            </div>
        </div>
    }

    const renderEventContent = (eventInfo) => {
        let dataLength = eventInfo?.event?._def?.extendedProps?.obj?.length
        if (!!dataLength && dataLength == 1) {
            return eventInfo?.event?._def?.extendedProps?.obj.map((val, i) => {
                return <div key={i} className="ps_calender_box">
                    <div className="d-flex justify-content-between">
                        <div> <h6><span>{moment(val.start).format('LT')}</span> {val?.title}</h6> </div>
                        {val.status === "Failed" &&
                    <p className="text-danger">Failed</p>   }
                        <div className="ps_calender_options">{svg.app.menu_icon}
                            <div className="ps_calender_options_div">

                                <ul>
                                    {val.status === "pending" ? <li onClick={() => handleEditPost(val.id)}>Update</li> : <></>}
                                    <li onClick={() => { handleDeletePost(val.id) }}> Delete </li>
                                    { <li onClick={() => handlePreviewEvent(val)}> Preview</li>}
                                </ul>
                            </div>
                        </div>

                    </div>
                   
                    <div className="ps_calender_box_img_box">
                        {val.image ? <img className="eventimage" src={val.posttype=="video" ? val.thumb : val.image} /> : <div className="ps_calendar_text_img"><p>{val.text}</p> </div>}
                    </div>
                </div>
            })
        } else if (!!dataLength && dataLength > 1 && dataLength <= 4) {
            return eventInfo?.event?._def?.extendedProps?.obj.map((val, i) => {
                return <div key={i}>{showDayDataList(val, i)}</div>
            })
        } else if (!!dataLength && dataLength > 4) {
            return eventInfo?.event?._def?.extendedProps?.obj.map((val, i) => {
                return <div key={i}>{showDayDatawithviewMore(val, i)}</div>
            })

        }
    }

    const renderEventContentMobile = (eventInfo) => {
        return <div className="ps_calender_box">
            <div className="d-flex justify-content-between">
                <div> <h6> {eventInfo.event.title}</h6> </div>
                <div className="ps_calender_options">{svg.app.menu_icon}
                    <div className="ps_calender_options_div">
                        <ul>
                            {eventInfo?.event?._def?.extendedProps?.status === "pending" ? <li onClick={() => handleEditPost(eventInfo.event.id)}>Update</li> : ""}
                            <li onClick={() => handlePreviewEvent(eventInfo.event._def.extendedProps)}> Preview</li>
                            <li onClick={() => { handleDeletePost(eventInfo.event.id) }}> Delete </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="ps_calender_box_img_box">
                {eventInfo.event._def.extendedProps.image ? <img className="eventimage" src={eventInfo.event._def.extendedProps?.posttype=="video" ? eventInfo.event._def.extendedProps?.thumb : eventInfo.event._def.extendedProps.image} /> : <div className="ps_calendar_text_img"><p>{eventInfo.event._def.extendedProps.text}</p> </div>}
            </div>
        </div>
    }

    const handleEditPost = (val) => {
       
        myStore.updateStoreData("postData", {})
  
        router.push({ pathname: "/create_post", query: { id: base64_encode(val) } });
    }

    const handleDeletePost = (val) => {
        setIsRemoveAction(val)
    }

    const handlePreviewEvent = (val) => {
        console.log({val})
        setPriviewImage(val)
        setIsModel(true)
    }

    let toggleModal = () => {
        setIsModel(false)
    }

    const handleSize = (event) => {
        let contentAPi = event.view.calendar;
        if (window.innerWidth < 991) {
            contentAPi.changeView('listMonth');
        } else {
            contentAPi.changeView('dayGridMonth');
        }
    }

    const someMethod = (event) => {
        let calendarApi = calendarRef?.current?.getApi()
        if (storeCalendarDate) {
            setTimeout(() => {
                calendarApi.gotoDate(storeCalendarDate)
            }, [1000])
            myStore.updateStoreData("calendarDate", "")
        }
    }

    function daysIntoYear(date) {
        let day = (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
        let year = moment(date).format("yyyy");
        let uniqueId = `${year}-${day}`
        return uniqueId
    }

    const showDay = (info, create) => {
        const element = create('span', { id: "fc-day-span-" + daysIntoYear(info.date) }, info.dayNumberText);
        return element;
    }

    const modifyDayCell = (info) => {
        let today = daysIntoYear(new Date)
        let day = daysIntoYear(info.date)
        if (today <= day) {
            let divId = "fc-day-span-" + day
            let div = document.getElementById(divId)
            let dyDiv = document.createElement('div')
            let button = document.createElement('button')
            button.setAttribute('type', 'button')
            button.setAttribute('style', 'background-color: #ff776b;color:#fff;width: 16px;height: 16px;display: flex;justify-content: center;align-items: center;font-size: 12px;padding-top:0px')
            button.innerHTML = '+'
            var createPostEvent = document.querySelector(`#${divId}`);
            createPostEvent.addEventListener('click', () => createPost(info.date));
            let span = `<span class="rz_tooltipEle">add post</span>`
            dyDiv.innerHTML = span
            dyDiv.setAttribute('class', "ps_calendar_event_btn")
            dyDiv.append(button)
            div.append(dyDiv)
        }
    }

    const createPost = (date) => {
        const newDate = new Date(date);
        let data = {
            step: false,
            singlePost: { scheduleDate: newDate },
            multiPost: []
        }
        myStore.updateStoreData("postData", data)
        router.push('/create_post')

    }

    const onHandleScheduleDate = (date) => {
        const newDate = new Date(date);
        setScheduleDate(newDate)
    }

    const createEvent = () => {
        if (!scheduleDate) {
            toast.error("select Schedule Date")
            return
        }
        let data = {
            step: false,
            singlePost: { scheduleDate: scheduleDate },
            multiPost: []
        }
        myStore.updateStoreData("postData", data)
        router.push('/create_post')
    }

    const handleChangeMonth = (data) => {
        let startD = moment(data.startStr).format("YYYY-MM-DD")
        let endD = moment(data.endStr).format("YYYY-MM-DD")
        setStartDate(startD);
        setEndDate(endD);
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

    return (
        <>
            <Head>
                <title>{process.env.SITE_TITLE}- Calendar</title>
            </Head>
           
            <div className='rz_dashboardWrapper' >
                <div className="conatiner-fluid">
                    <div className="mx-3 mt-3">
                        <div className="row mb-2">
                            <div className="ps_calender_heading">
                                <h3 className="textColor my-1" >Posts Calendar</h3>
                            </div>
                        </div>
                        
                        <div className={isLoading ? "invisible" : ""}>
                            <FullCalendar
                                customButtons={{
                                    myCustomButton: {
                                        text: "Add event",
                                        click: () => {
                                            setIsEventModal(true)
                                        }
                                    }
                                }}
                                headerToolbar={{
                                    left: "prev,next",
                                    center: windowSize.width > 991 ? "" : "myCustomButton",
                                    right: "title"
                                }}
                                ref={calendarRef}
                                themeSystem="Simplex"
                                allDayText={"All Day"}
                                allDaySlot={true}
                                defaultAllDay={false}
                                displayEventTime={true}
                                displayEventEnd={false}
                           
                                events={windowSize.width > 991 ? scheduledPosts : events}
                                eventContent={windowSize.width > 991 ? renderEventContent : renderEventContentMobile}
                               
                                initialView={windowSize.width > 991 ? "dayGridMonth" : "listMonth"}
                                plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin, listPlugin]}
                                windowResize={handleSize}
                                selectable={true}
                                selectMirror={true}
                                timeZone={"GMT"}
                                dayCellContent={showDay}
                                dayCellDidMount={modifyDayCell}
                                datesSet={handleChangeMonth}
                            />
                        </div>

                        {isLoading ? <div className="spinner-border" style={{ color: "#e74c3c", transition: "" }} role="status">
                            <span className="sr-only"></span>
                        </div> : ""
                        }
                    </div>
                </div>
            </div>

            <MyModal
                shown={isEventModal}
                close={() => {
                    setIsEventModal(false)
                    setScheduleDate()
                }}
            >
                <div className="modal-body">
                    <div className="modal-header">
                        <h3>Create Post Event</h3>
                    </div>
                    <div className="active_social_box_inner">
                        <div className='col-10 m-auto text-center'>
                            <Flatpickr
                                options={{ minDate: new Date() }}
                                data-enable-time
                                placeholder="Date and Time"
                                mindate={new Date()}
                                onChange={(date) => onHandleScheduleDate(date)}
                            />
                        </div>
                    </div>
                    <div className="d-flex justify-content-center align-items-center mt-4">
                        <button className="rz_addAccBtn" onClick={() => createEvent()}>Continue</button>
                    </div>

                </div>
            </MyModal>
            <MyModal
                shown={isModel}
                close={() => {
                    toggleModal();
                }}
            >
                <div className="modal-body_prev">
                    <h3 className="text-center">Preview</h3>
                    <div className="ps_preview_profile_box">
                        <div className="ps_Preview_profile_img">
                            {userData?.profile ? <img src={userData?.profile} /> :
                                <div className=''   > {getNameInitials(userData?.name)}</div>
                            }
                        </div>
                        <div className="ps_Preview_profile_text">
                            <h6> {userData.name}</h6>
                            <p><span> {svg.app.myReels} {moment(priviewImage?.start).format("YYYY-MM-DD")}</span><span> {svg.app.time_clock}{moment(priviewImage?.start).format("hh:mm A")} </span></p>
                        </div>
                    </div>
                    <div className="pt-2"><p>{priviewImage?.text}</p></div>
                    {priviewImage?.image ? <div>
                        {priviewImage?.posttype =="video" ? 
                         <div className='ps_assets_icon_videobox'><video src={priviewImage?.image} controls></video></div>
                        :
                        <div className='preview_Image_prev'><img src={priviewImage?.image} /></div>
                        }
                      
                    </div> : ""}
                   
                    <div className="ps_preview_socail_icon">
                    {priviewImage && priviewImage?.socialMediaAccounts.map((d1)=>{
                        let status=true
                        let obj=Object.keys(priviewImage?.message)
                        obj = obj.map(key => key.toLowerCase());
                        let l1= checklogo(d1.type)
                        if(obj)
                        {
                            status =obj.includes(d1.type) ? false : true;
                        }
                        return(<>
                        <div className={`ps_preview_socail_icon_div`.concat(status  ? "" :" ps_preview_socail_icon_disable")} style={{background:l1.color}}>
                            {l1.svg}
                            <span className="rz_tooltipSpan">Internal server error from {d1.type}</span>
                        </div>
                        </>)
                    })}
                       
                    </div>
                   
                </div>
            </MyModal>

            <ConfirmationPopup
                shownPopup={isRemoveAction}
                closePopup={() => setIsRemoveAction(false)}
                type={"Post"}
                removeAction={() => {
                    common.getAPI({
                        method: 'DELETE',
                        url: 'post',
                        data: {
                            target: isRemoveAction
                        },
                    }, (resp) => {
                        if (resp.status) {
                            setIsRemoveAction(false);
                            getAllPost()
                        }
                    });
                }}
            />
        </>

    )
}