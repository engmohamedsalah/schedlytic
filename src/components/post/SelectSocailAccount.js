import { useEffect, useRef, useState } from "react"
import svg from "@/components/svg";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import { appStore } from '@/zu_store/appStore';
import { common } from '@/components/Common';
import { timeZone } from "../utils/utility"
import Select from 'react-select'
import { toast } from "react-toastify";
import { useRouter } from 'next/router';
import { getNameInitials } from "@/components/utils/utility"
import { decode as base64_decode } from 'base-64';
import moment from "moment";
import MyModal from "../common/MyModal";
import ConfirmationPopup from "../common/ConfirmationPopup";

export default function SelectSocailAccount() {

    const [facebookPageOptions, setFacebookPageOptions] = useState([]);
    const [socialAccounts, setSocialAccounts] = useState({});
    const [selectedAccounts, setselectedAccounts] = useState({});
    const [selectedPinterestAccDetails, setSelectedPinterestAccDetails] = useState();
    const [selectedPinterestBoard, setSelectedPinterestBoard] = useState();
    const [selectedFbAccDetails, setSelectedFbAccDetails] = useState();
    const [selectedFbAccPages, setSelectedFbAccPages] = useState([]);
    const [selectedFbAcc, setSelectedFbAcc] = useState();
    const [selectedInstaAcc, setSelectedInstaAcc] = useState();
    const [selectedTwitterAcc, setSelectedTwitterAcc] = useState();
    const [selectedLinkedInAcc, setSelectedLinkedInAcc] = useState();
    const [selectedPinterestAcc, setSelectedPinterestAcc] = useState();
    const [facebookDetails, setFacebookDetails] = useState([]);
    const [instaDetails, setInstaDetails] = useState([]);
    const [linkedInDetails, setLinkedInDetails] = useState([]);
    const [twitterDetails, setTwitterDetails] = useState([]);
    const [pinterestDetails, setPinterestDetails] = useState([]);
    const [selectedSocialAcc, setSelectedSocialAcc] = useState({});
    const [scheduleDate, setScheduleDate] = useState();
    const [selectedAccMap, setSelectedAccMap] = useState({});
    const [selectedTimeZone, setSelectedTimeZone] = useState();
    const [isSchedulePost, setIsSchedulePost] = useState(false);
    const [postList, setPostList] = useState([]);
    const [imagePostDataStep2, setImagePostDataStep2] = useState({
        text: "",
        url: "",
        scheduleDate: "",
        socialMediaAccounts: {},
        timeZone: "",
        type: "",
        thumb :""
    })
    const [isMultiPostModal, setIsMultiPostModal] = useState(false);
    const [isRemove, setIsRemove] = useState(false);
    const [removePost, setRemovePost] = useState();
    const [selectedPost, setSelectedPost] = useState({});
    const [selectedPostIndex, setSelectedPostIndex] = useState();
    const [postIndex, setPostIndex] = useState();
    const [isPreviewModalData, setIsPreviewModalData] = useState();

    const [isOpen, setIsOpen] = useState(false);

    const isSocialAcc = useRef(false);
    const [refresh, setrefresh] = useState(false)
    const [accordianToggle, setAccordianToggle] = useState({
        isFb: false,
        isInsta: false,
        isLinkedIn: false,
        isTwitter: false,
        isPinterest: false
    });

    const router = useRouter();

    let myStore = appStore(state => state);
    let storePostData = myStore.postData.singlePost;
    let storeMultiPostData = myStore.postData.multiPost;
    let userData = myStore.userData;

    useEffect(() => {
        storeMultiPostData?.map(post => {
            delete post.socialMediaAccounts
        })
        setPostList(storeMultiPostData)
    }, [])

    useEffect(() => {
        if (!isSocialAcc.current) {
            common.getAPI({
                method: 'GET',
                url: 'auth',
                data: {
                    action: "getSocial"
                },

            }, (resp) => {
                if (resp.status) {
                    setSocialAccounts(resp.data)
                }
            })
        }
    }, [])


    useEffect(() => {
        imagePostDataStep2.title = storePostData?.title;
        imagePostDataStep2.text = storePostData?.text;
        imagePostDataStep2.url = storePostData?.url;
        imagePostDataStep2.scheduleDate = storePostData?.scheduleDate;
        imagePostDataStep2.socialMediaAccounts = storePostData?.socialMediaAccounts;
        imagePostDataStep2.timeZone = storePostData?.timeZone;
        imagePostDataStep2.step = storePostData?.step;
        imagePostDataStep2.type = storePostData?.type;
        imagePostDataStep2.thumb = storePostData?.thumb;
        imagePostDataStep2.platefrom = storePostData?.platefrom;
        setImagePostDataStep2({ ...imagePostDataStep2 })
        if (storePostData?.socialMediaAccounts) {
            handleSelectedAccData(storePostData?.socialMediaAccounts)
            setTimeout(() => {
                setselectedAccounts(storePostData?.socialMediaAccounts)
            }, [200])

        }

    }, [storePostData, refresh])

    useEffect(() => {
        getSocialAccounts()
    }, [selectedAccounts])

    const handleEditPostCheckbox = (acc) => {
        let selectedData = {
            data: acc,
            checked: true
        }

        if (!selectedAccMap[acc.type]) {
            selectedAccMap[acc.type] = selectedData
            setSelectedAccMap({ ...selectedAccMap })
        } else {
            selectedAccMap[acc.type] = selectedData
            setSelectedAccMap({ ...selectedAccMap })
        }
        setSelectedSocialAcc(selectedAccMap)
    }

    const handleSelectedAccData = (accounts) => {
        if (accounts.length > 0) {
            accounts.map((acc, index) => {
                if (acc.type === "facebook") {
                    let data = {
                        obj: acc,
                        index: index
                    }
                    setSelectedFbAcc(data)
                    setSelectedFbAccPages(acc.data.facebookPages)
                    setSelectedFbAccDetails(acc)
                    handleEditPostCheckbox(acc)
                } else if (acc.type === "instagram") {
                    let data = {
                        obj: acc,
                        index: index
                    }
                    setSelectedInstaAcc(data)
                    handleEditPostCheckbox(acc)
                } else if (acc.type === "linkedin") {
                    let data = {
                        obj: acc,
                        index: index
                    }
                    setSelectedLinkedInAcc(data)
                    handleEditPostCheckbox(acc)
                } else if (acc.type === "twitter") {
                    let data = {
                        obj: acc,
                        index: index
                    }
                    setSelectedTwitterAcc(data)
                    handleEditPostCheckbox(acc)
                } else if (acc.type === "pinterest") {

                    let data = {
                        obj: acc,
                        index: index
                    }
                    setSelectedPinterestAcc(data)
                    setSelectedPinterestBoard(acc.data.boardList)
                    setSelectedPinterestAccDetails(acc)
                    handleEditPostCheckbox(acc)
                }
            })
        }
    }

    const getSocialAccounts = () => {

        common.getAPI({
            isLoader: true,
            method: 'GET',
            url: 'auth',
            data: {
                action: "getSocial"
            },

        }, (resp) => {
            if (resp.status) {

                Object.keys(resp.data).map(val => {
                    if (val === "facebook") {
                        setFacebookPageOptions(resp.data[val])
                        let index;
                        if (selectedAccounts.length > 0) {
                            selectedAccounts.map((selectedAcc) => {
                                if (selectedAcc.type === "facebook") {
                                    index = resp.data[val]?.findIndex(acc => acc._id === selectedAcc._id)
                                }
                            })

                            if (typeof index === "number") {
                                resp.data[val].splice(index, 1)
                            }
                        }
                        setFacebookDetails(resp.data[val])


                    } else if (val === "linkedin") {
                        let index;
                        if (selectedAccounts.length > 0) {
                            selectedAccounts.map((selectedAcc) => {
                                if (selectedAcc.type === "linkedin") {
                                    index = resp.data[val]?.findIndex(acc => acc._id === selectedAcc._id)

                                }
                            })
                            if (typeof index === "number") {
                                resp.data[val].splice(index, 1)

                            }

                        }
                        setLinkedInDetails(resp.data[val])
                    } else if (val === "pinterest") {
                        let index;
                        if (selectedAccounts.length > 0) {
                            selectedAccounts.map((selectedAcc) => {
                                if (selectedAcc.type === "pinterest") {
                                    index = resp.data[val]?.findIndex(acc => acc._id === selectedAcc._id)
                                }
                            })
                            if (typeof index === "number") {
                                resp.data[val].splice(index, 1)
                            }

                        }
                        setPinterestDetails(resp.data[val])
                    } else if (val === "twitter") {
                        let index;

                        if (selectedAccounts.length > 0) {
                            selectedAccounts.map((selectedAcc) => {
                                if (selectedAcc.type === "twitter") {
                                    resp.data[val]?.map((acc, i) => {
                                        if (acc._id === selectedAcc._id) {
                                            index = i
                                        }
                                    })
                                }
                            })

                            if (typeof index === "number") {
                                resp.data[val].splice(index, 1)
                            }
                        }
                        setTwitterDetails(resp.data[val])
                    } else if (val === "instagram") {
                        let index;
                        if (selectedAccounts.length > 0) {
                            selectedAccounts.map((selectedAcc) => {
                                if (selectedAcc.type === "instagram") {
                                    index = resp.data[val]?.findIndex(acc => acc._id === selectedAcc._id)
                                }
                            })
                            if (typeof index === "number") {
                                resp.data[val].splice(index, 1)
                            }

                        }
                        setInstaDetails(resp.data[val])
                    }
                })
                handleSelectedAccData(resp.data)

            }
        })
    }

    const onHandleScheduleDate = (date, isMulti) => {
        const newDate = new Date(date);
        if (isMulti) {
            setSelectedPost({ ...selectedPost, scheduleDate: newDate })
        } else {
            setScheduleDate(date)
            imagePostDataStep2['scheduleDate'] = newDate
            setImagePostDataStep2({ ...imagePostDataStep2 })
        }
    }

    const handleTimezone = (event, isMulti) => {
        let timezone = timeZone.find(val => val.value === event.target.value)
        if (isMulti) {
            setSelectedPost({ ...selectedPost, timeZone: timezone })
        } else {
            imagePostDataStep2['timeZone'] = timezone
            setSelectedTimeZone(timezone)
            setImagePostDataStep2({ ...imagePostDataStep2 })
        }
    }

    const handleMultiSelectSchduleTime = () => {
        if (!selectedPost?.scheduleDate) {
            toast.error('Please select scheduleDate');
            return;
        } else if (selectedPost?.scheduleDate && !selectedPost?.timeZone) {
            toast.error('Please select timeZone');
            return;
        }
        let newPostList = postList.map((post, i) => {
            if (i === selectedPostIndex) {
                post.scheduleDate = selectedPost?.scheduleDate
                post.timeZone = selectedPost?.timeZone
            }
            return post
        })
        setPostIndex()
        setPostList([...newPostList])
        setIsMultiPostModal(false)
    }

    const handleBackButtonEvent = () => {

        imagePostDataStep2.title = storePostData?.title
        imagePostDataStep2.text = storePostData?.text
        imagePostDataStep2.url = storePostData?.url
        imagePostDataStep2.type = storePostData?.type
        imagePostDataStep2.platefrom = storePostData?.platefrom
        imagePostDataStep2.meta = storePostData?.meta
        imagePostDataStep2.scheduleDate = ""
        imagePostDataStep2.socialMediaAccounts = []
        setImagePostDataStep2({ ...imagePostDataStep2 })
        let data = {
            step: false,
            singlePost: imagePostDataStep2,
            multiPost: postList
        }
        myStore.updateStoreData("postData", data)
    }

    const handleSocialAccSelection = (val, index, name) => {
        if (name === "Facebook") {
            setSelectedFbAccDetails(val)
            facebookDetails.splice(index, 1)
            setFacebookDetails([...facebookDetails])
            if (selectedFbAcc) {
                socialAccounts['facebook']?.map((fbDetail, i) => {
                    if (fbDetail._id === selectedFbAcc.obj._id) {
                        facebookDetails.splice(i, 0, selectedFbAcc.obj)
                        setFacebookDetails([...facebookDetails])
                    }
                })
            }
            let data = {
                obj: val,
                index: index
            }
            setSelectedFbAcc(data)
            accordianToggle.isFb = !accordianToggle?.isFb
            setAccordianToggle({ ...accordianToggle })
            setSelectedFbAccPages([])
        } else if (name === "Instagram") {
            instaDetails.splice(index, 1)
            setInstaDetails([...instaDetails])
            if (selectedInstaAcc) {
                socialAccounts['instagram']?.map((instaDetail, i) => {
                    if (instaDetail._id === selectedInstaAcc.obj._id) {
                        instaDetails.splice(i, 0, selectedInstaAcc.obj)
                        setInstaDetails([...instaDetails])
                    }
                })
            }
            let data = {
                obj: val,
                index: index
            }
            accordianToggle.isInsta = !accordianToggle?.isInsta
            setAccordianToggle({ ...accordianToggle })
            setSelectedInstaAcc(data)
        } else if (name === "Twitter") {
            twitterDetails.splice(index, 1)
            setTwitterDetails([...twitterDetails])

            if (selectedTwitterAcc) {
                socialAccounts['twitter']?.map((twitterDetail, i) => {
                    if (twitterDetail._id === selectedTwitterAcc.obj._id) {
                        twitterDetails.splice(i, 0, selectedTwitterAcc.obj)
                        setTwitterDetails([...twitterDetails])
                    }
                })
            }

            let data = {
                obj: val,
                index: index
            }
            setSelectedTwitterAcc(data)
            accordianToggle.isTwitter = !accordianToggle?.isTwitter
            setAccordianToggle({ ...accordianToggle })
        }
        else if (name === "LinkedIn") {
            linkedInDetails.splice(index, 1)
            setLinkedInDetails([...linkedInDetails])
            if (selectedLinkedInAcc) {
                socialAccounts['linkedin']?.map((linkedInDetail, i) => {
                    if (linkedInDetail._id === selectedLinkedInAcc.obj._id) {
                        linkedInDetails.splice(i, 0, selectedLinkedInAcc.obj)
                        setLinkedInDetails([...linkedInDetails])
                    }
                })
            }
            let data = {
                obj: val,
                index: index
            }
            setSelectedLinkedInAcc(data)
            accordianToggle.isLinkedIn = !accordianToggle?.isLinkedIn
            setAccordianToggle({ ...accordianToggle })
        } else if (name === "Pinterest") {
            setSelectedPinterestAccDetails(val)
            pinterestDetails.splice(index, 1)
            setPinterestDetails([...pinterestDetails])
            if (selectedPinterestAcc) {
                socialAccounts['pinterest']?.map((pinterestDetail, i) => {
                    if (pinterestDetail._id === selectedPinterestAcc.obj._id) {
                        pinterestDetails.splice(i, 0, selectedPinterestAcc.obj)
                        setPinterestDetails([...pinterestDetails])
                    }
                })
            }

            let data = {
                obj: val,
                index: index
            }

            setSelectedPinterestAcc(data)
            accordianToggle.isPinterest = !accordianToggle?.isPinterest
            setAccordianToggle({ ...accordianToggle })
        }
    }


    const removeSelectedAcc = (acc) => {
        if (acc.obj.type === "facebook") {
            facebookDetails.splice(acc.index, 0, acc.obj)
            setFacebookDetails([...facebookDetails])
            setSelectedFbAcc("")
            for (const key in selectedAccMap) {
                if (key === acc.obj.type) {
                    delete selectedAccMap[key]
                }
            }
            setSelectedSocialAcc(selectedAccMap)
        } else if (acc.obj.type === "instagram") {
            instaDetails.splice(acc.index, 0, acc.obj)
            setInstaDetails([...instaDetails])
            setSelectedInstaAcc("")
            for (const key in selectedAccMap) {
                if (key === acc.obj.type) {
                    delete selectedAccMap[key]
                }
            }
            setSelectedSocialAcc(selectedAccMap)
        } else if (acc.obj.type === "twitter") {
            twitterDetails.splice(acc.index, 0, acc.obj)
            setTwitterDetails([...twitterDetails])
            setSelectedTwitterAcc("")
            for (const key in selectedAccMap) {
                if (key === acc.obj.type) {
                    delete selectedAccMap[key]
                }
            }
            setSelectedSocialAcc(selectedAccMap)
        }
        else if (acc.obj.type === "linkedin") {
            linkedInDetails.splice(acc.index, 0, acc.obj)
            setLinkedInDetails([...linkedInDetails])
            setSelectedLinkedInAcc("")
            for (const key in selectedAccMap) {
                if (key === acc.obj.type) {
                    delete selectedAccMap[key]
                }
            }
            setSelectedSocialAcc(selectedAccMap)
        } else if (acc.obj.type === "pinterest") {
            pinterestDetails.splice(acc.index, 0, acc.obj)
            setPinterestDetails([...pinterestDetails])
            setSelectedPinterestAcc("")
            for (const key in selectedAccMap) {
                if (key === acc.obj.type) {
                    delete selectedAccMap[key]
                }
            }
            setSelectedSocialAcc(selectedAccMap)
        }
    }

    const handleCheckbox = (data, checked) => {
        let selectedData = {
            data: data.obj,
            checked: checked
        }

        if (!selectedAccMap[data.obj.type]) {
            selectedAccMap[data.obj.type] = selectedData
            setSelectedAccMap({ ...selectedAccMap })
        } else {
            selectedAccMap[data.obj.type] = selectedData
            setSelectedAccMap({ ...selectedAccMap })
        }

        for (const key in selectedAccMap) {
            if (!selectedAccMap[key].checked) {
                delete selectedAccMap[key]
            }
        }

        setSelectedSocialAcc(selectedAccMap)
    }

    const handleToggle = (acc) => {
        if (acc === "facebook") {
            accordianToggle.isFb = !accordianToggle?.isFb
            setAccordianToggle({ ...accordianToggle })
        } else if (acc === "instagram") {
            accordianToggle.isInsta = !accordianToggle?.isInsta
            setAccordianToggle({ ...accordianToggle })
        } else if (acc === "twitter") {
            accordianToggle.isTwitter = !accordianToggle?.isTwitter
            setAccordianToggle({ ...accordianToggle })
        } else if (acc === "linkedin") {
            accordianToggle.isLinkedIn = !accordianToggle?.isLinkedIn
            setAccordianToggle({ ...accordianToggle })
        } else if (acc === "pinterest") {
            accordianToggle.isPinterest = !accordianToggle?.isPinterest
            setAccordianToggle({ ...accordianToggle })
        }
    }

    const handlePagesOption = (options) => {
        let newOption = [];
        if (socialAccounts["facebook"]?.length > 0) {
            let acc = socialAccounts["facebook"]
            acc.map(fbAcc => {
                fbAcc.data.facebookPages.map(fbPage => {
                    if (fbAcc._id === selectedFbAcc.obj._id) {
                        let data = {
                            id: fbPage.id,
                            value: fbPage.name,
                            label: fbPage.name,
                            access_token: fbPage.access_token
                        }
                        newOption.push(data)
                    }
                })
            })
        }
        return newOption
    }

    const handleBoardListOption = (options) => {
        let newOption = [];
        if (socialAccounts["pinterest"]?.length > 0) {
            let acc = socialAccounts["pinterest"]
            acc.map(pAcc => {
                pAcc.data.boardList.map(pinterestBoard => {
                    if (pAcc._id === selectedPinterestAcc.obj._id) {
                        let data = {
                            id: pinterestBoard.id,
                            value: pinterestBoard.name,
                            label: pinterestBoard.name,
                        }
                        newOption.push(data)
                    }
                })
            })
            return newOption
        }
    }

    const handleMultiSelectBox = (e) => {
        let arr = [];
        e.map((val) => {
            let data = {
                id: val.id,
                name: val.value,
                access_token: val.access_token
            }
            arr.push(data)
        })
        setSelectedFbAccPages(arr)
    }

    const handlePinterestMultiSelectBox = (e) => {
        if (socialAccounts["pinterest"]?.length > 0) {
            let acc = socialAccounts["pinterest"]
            acc.map(pAcc => {
                pAcc.data.boardList.map(pinterestBoard => {
                    if (pinterestBoard.id === e.id) {
                        setSelectedPinterestBoard(pinterestBoard)
                    }
                })
            })
        }
    }

    const saveCreatPost = (data) => {
        for (let i = 0; i < data.posts.length; i++) {
            let d1 = new Date(data.posts[i].scheduleDate)
            let offset = d1.getTimezoneOffset()
            if (data.posts[i].timeZone.offset > 0) {
                d1.setMinutes(d1.getMinutes() + offset);
                d1.setMinutes(d1.getMinutes() + (data.posts[i].timeZone.offset * 60))
            }
            else {
                d1.setMinutes(d1.getMinutes() - (data.posts[i].timeZone.offset * 60))
                d1.setMinutes(d1.getMinutes() - offset)
            }
            data.posts[i]["postDate"] = d1
        }
        common.getAPI({
            method: 'POST',
            url: 'post',
            data: {
                posts: data.posts,
                socialMediaAccounts: data.socialMediaAccounts
            }
        }, (resp) => {
            if (resp.status) {
                myStore.updateStoreData("calendarDate", moment(data.posts[0].scheduleDate).format("YYYY-MM-DD"))
                router.push("/calendar")

            }
        });
    }

    const updateCreatPost = () => {
        let d1 = new Date(imagePostDataStep2.scheduleDate)
        let offset = d1.getTimezoneOffset()
        if (imagePostDataStep2.timeZone.offset > 0) {
            d1.setMinutes(d1.getMinutes() + offset);
            d1.setMinutes(d1.getMinutes() + (imagePostDataStep2.timeZone.offset * 60))
        }
        else {
            d1.setMinutes(d1.getMinutes() - (imagePostDataStep2.timeZone.offset * 60))
            d1.setMinutes(d1.getMinutes() - offset)
        }
        imagePostDataStep2["postDate"] = d1
        common.getAPI({
            method: 'PUT',
            url: 'post',
            data: {
                data: imagePostDataStep2,
                target: base64_decode(router.query.id)
            }

        }, (resp) => {
            if (resp.status) {
                myStore.updateStoreData("calendarDate", moment(imagePostDataStep2.scheduleDate).format("YYYY-MM-DD"))
                router.push("/calendar")
            }
        });
    }

    const postNow = (postData) => {
        common.getAPI({
            method: 'POST',
            url: 'post',
            data: {
                ...postData,
                stype: "post"
            }
        }, (resp) => {
            if (resp.status) {
                router.push("/calendar")
            }
        });
    }

    const multipostNow = (postData) => {
        common.getAPI({
            method: 'POST',
            url: 'post',
            data: {
                ...postData,
                stype: "post"
            }
        }, (resp) => {
            if (resp.status) {
                router.push("/calendar")

            }
        });
    }

    const handleSchedulePost = () => {
        if (Object.keys(selectedSocialAcc).length == 0) {
            toast.error('Please select social media account');
            return;
        }
        if (selectedFbAcc && selectedFbAccPages.length == 0) {
            toast.error('Please select facebook page.');
            return;
        }
        if (selectedPinterestAcc && !selectedPinterestBoard) {
            toast.error('Please select Pinterest board.');
            return;
        }
        setIsSchedulePost(!isSchedulePost)
    }

    const submitSinglePost = () => {
        if (Object.keys(selectedSocialAcc).length == 0) {
            toast.error('Please select social account');
            return;
        }

        if (selectedFbAcc && selectedFbAccPages.length == 0) {
            toast.error('Please select facebook page.');
            return;
        }

        if (selectedPinterestAcc && !selectedPinterestBoard) {
            toast.error('Please select Pinterest board.');
            return;
        }

        if (!imagePostDataStep2.scheduleDate) {
            toast.error('Please select scheduled date');
            return;
        }

        if (!imagePostDataStep2.timeZone) {
            toast.error('Please select timeZone');
            return;
        }

        let selectedSocialAcc1 = findSelectedSocialAcc(selectedSocialAcc)
        setSelectedSocialAcc(selectedSocialAcc1)

        let selectedAccArr = [];
        for (const key in selectedSocialAcc) {
            selectedAccArr.push(selectedSocialAcc[key])
        }
        imagePostDataStep2.socialMediaAccounts = selectedAccArr

        let newPost = {
            title: imagePostDataStep2?.title,
            text: imagePostDataStep2?.text,
            url: imagePostDataStep2?.url,
            scheduleDate: imagePostDataStep2?.scheduleDate,
            timeZone: imagePostDataStep2?.timeZone,
            type: imagePostDataStep2?.type,
            thumb: imagePostDataStep2?.thumb,
            platefrom : imagePostDataStep2?.platefrom
        }

        let arr = []
        arr.push(newPost)

        let apiData = {
            posts: arr,
            socialMediaAccounts: selectedAccArr
        }

        if (router.query.id) {
            updateCreatPost()
        } else {
            saveCreatPost(apiData)
        }

    }

    const submitMultiPost = () => {
        if (Object.keys(selectedSocialAcc).length == 0) {
            toast.error('Please select social account');
            return;
        }

        if (selectedFbAcc && selectedFbAccPages.length == 0) {
            toast.error('Please select facebook page.');
            return;
        }

        if (selectedPinterestAcc && !selectedPinterestBoard) {
            toast.error('Please select Pinterest board.');
            return;
        }

        let emptyDate = postList.findIndex(post => post.scheduleDate === "" || !post.timeZone)
        if (emptyDate !== -1) {
            setPostIndex(emptyDate)
            if (postList[emptyDate].scheduleDate === "") {
                toast.error('Please select scheduled date');
                return;
            } else if (!postList[emptyDate].timeZone) {
                toast.error('Please select timezone');
                return;
            }
        }

        let selectedSocialAcc1 = findSelectedSocialAcc(selectedSocialAcc)
        setSelectedSocialAcc(selectedSocialAcc1)

        let selectedAccArr = [];
        for (const key in selectedSocialAcc) {
            selectedAccArr.push(selectedSocialAcc[key])
        }

        let MultiPostData = {
            posts: postList,
            socialMediaAccounts: selectedAccArr
        }
        saveCreatPost(MultiPostData)
    }

    const submitSchedulePost = () => {
        if (storeMultiPostData.length > 0) {
            submitMultiPost()
        } else {
            submitSinglePost()
        }
    }

    const showSelectedFbPages = (accDetail) => {
        let arr = []
        accDetail.map(acc => {
            let data = {
                id: acc.id,
                value: acc.name,
                label: acc.name,
                access_token: acc.access_token
            }
            arr.push(data)
        })
        return arr
    }

    const findSelectedSocialAcc = () => {
        let data = [];
        for (const key in selectedSocialAcc) {
            if (selectedSocialAcc.hasOwnProperty(key)) {
                if (key === "facebook" && selectedSocialAcc[key].checked) {
                    selectedSocialAcc["facebook"].data.data.facebookPages = selectedFbAccPages
                    selectedSocialAcc["facebook"] = selectedSocialAcc["facebook"].data
                    data.push(selectedSocialAcc["facebook"].data)
                }
                if (key === "pinterest" && selectedSocialAcc["pinterest"].checked) {
                    selectedSocialAcc[key].data.data.boardList = selectedPinterestBoard
                    selectedSocialAcc["pinterest"] = selectedSocialAcc["pinterest"].data
                    data.push(selectedSocialAcc["pinterest"].data)
                }

                if (key === "instagram" && selectedSocialAcc["instagram"].checked) {
                    selectedSocialAcc["instagram"] = selectedSocialAcc["instagram"].data
                    data.push(selectedSocialAcc["instagram"].data)
                }

                if (key === "linkedin" && selectedSocialAcc["linkedin"].checked) {
                    selectedSocialAcc["linkedin"] = selectedSocialAcc["linkedin"].data
                    data.push(selectedSocialAcc["linkedin"].data)
                }

                if (key === "twitter" && selectedSocialAcc["twitter"].checked) {
                    selectedSocialAcc["twitter"] = selectedSocialAcc["twitter"].data
                    data.push(selectedSocialAcc["twitter"].data)
                }
            }
        }
        return selectedSocialAcc
    }

    const submitPublishedPost = () => {
        if (Object.keys(selectedSocialAcc).length == 0) {
            toast.error('Please select social account');
            return;
        }
        if (selectedFbAcc && selectedFbAccPages.length == 0) {
            toast.error('Please select facebook page.');
            return;
        }

        if (selectedPinterestAcc && !selectedPinterestBoard) {
            toast.error('Please select Pinterest board.');
            return;
        }

        let selectedSocialAcc1 = findSelectedSocialAcc(selectedSocialAcc)
        setSelectedSocialAcc(selectedSocialAcc1)

        let selectedAccArr = [];
        for (const key in selectedSocialAcc) {
            selectedAccArr.push(selectedSocialAcc[key])
        }
        imagePostDataStep2.socialMediaAccounts = selectedAccArr

        delete imagePostDataStep2?.step;
        delete imagePostDataStep2?.timeZone;

        imagePostDataStep2.scheduleDate = new Date()
        let newPost = {
            title: imagePostDataStep2?.title,
            text: imagePostDataStep2?.text,
            url: imagePostDataStep2?.url,
            scheduleDate: imagePostDataStep2?.scheduleDate,
            timeZone: imagePostDataStep2?.timeZone,
            type: imagePostDataStep2?.type,
            thumb: imagePostDataStep2?.thumb,
            platefrom : imagePostDataStep2?.platefrom
            
        }

        let arr = []
        arr.push(newPost)

        let apiData = {
            posts: arr,
            socialMediaAccounts: selectedAccArr
        }

        postNow(apiData)

    }

    const submitPublishedMultiPost = () => {
        if (Object.keys(selectedSocialAcc).length == 0) {
            toast.error('Please select social account');
            return;
        }
        if (selectedFbAcc && selectedFbAccPages.length == 0) {
            toast.error('Please select facebook page.');
            return;
        }

        if (selectedPinterestAcc && !selectedPinterestBoard) {
            toast.error('Please select Pinterest board.');
            return;
        }

        let selectedSocialAcc1 = findSelectedSocialAcc(selectedSocialAcc)
        setSelectedSocialAcc(selectedSocialAcc1)

        let selectedAccArr = [];
        for (const key in selectedSocialAcc) {
            selectedAccArr.push(selectedSocialAcc[key])
        }

        postList.map(post => {
            post.scheduleDate = new Date()
            delete imagePostDataStep2?.timeZone;
        })

        let postData = {
            posts: postList,
            socialMediaAccounts: selectedAccArr
        }
        multipostNow(postData)
    }

    const closeShowSchedulePost = () => {
        setIsSchedulePost(false)
    }

    const showPinterestSelectedLocation = (location) => {
        if (location) {
            let data = {
                id: location.id,
                value: location.name,
                label: location.name
            }
            return data
        }
    }




    const showSchedulePost = () => {
        return <div className="ps_schedule_box mt-lg-0 mt-4">
            <div className="">
                <div className="dash_header">
                    {!router.query.id ? <div className="ps_create_post_cross_btn">
                        <div className="ps_img_editor_close_btn" onClick={() => closeShowSchedulePost()}>{svg.app.removeIcon}</div>
                    </div> : ""}

                    <h3 className="mb-0">Select Time</h3>
                    <p>All scheduled posts will posted on this time</p>
                </div>
                <div>
                    <div className="active_social_box_inner">
                        <div className='col-md-12 text-center'>
                            <Flatpickr
                                options={{ minDate: new Date() }}
                                data-enable-time
                                placeholder="Date and Time"
                                mindate={new Date()}
                                value={imagePostDataStep2.scheduleDate}
                                onChange={(date) => onHandleScheduleDate(date, false)}
                            />
                            <select className="form-control form-control-md mt-2"
                                value={imagePostDataStep2?.timeZone?.value}
                                style={{ margin: "auto", }}
                                onChange={(e) => handleTimezone(e, false)}>
                                <option style={{ fontWeight: "700px" }}>Select TimeZone</option>
                                {timeZone.map((zone, i) => {
                                    return <option key={i}>{zone.value}</option>
                                })}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }

    const addSchduleTime = (post, i) => {
        setSelectedPost(post)
        setSelectedPostIndex(i)
        setIsMultiPostModal(true)
    }

    const handleDelete = (i) => {
        setIsRemove(true)
        setRemovePost(i)
    }

    const handlePreview = (postObject) => {
        setIsPreviewModalData(postObject)
        setIsOpen(true)
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
    const showMultipost = () => {
        return <div className="ps_schedule_box  " >

            <div className="dash_header  mb-0">
                <h3 className="mb-0"> Posts</h3>
            </div>
            <div className="ps_upcoming_post_box_div ">
            <div className="upcomg_post_box_heading ">
                    <div className="upcomg_post_details upcping_post_title_width">
                        <p>Title</p>
                    </div>
                    <div className="upcomg_post_social_available_80">
                        <p>Platforms </p>
                    </div>
                    <div className="ps_upcomg_post_details_icons">
                        <p>Action</p>
                    </div>
                </div>
                {postList.map((postData, i) => {
                    return <div className={postIndex == i ? "upcomg_post_box ps_border" : `upcomg_post_box`} key={i}>
                        <div className="upcomg_post_details upcping_post_title_width">
                            
                            <div className="dash_icon_box dash_icon_box_40" >
                                {postData?.url ? <div className='ps_dash_comming_box '>
                                    <img src={postData?.thumb ? postData?.thumb : postData?.url} /></div> :
                                    <div className="ps_dash_comming_box"><p>{postData?.text}</p> </div>}
                            </div>

                            <div className="upcomg_post_text">
                                <p>{postData?.title}</p>

                                {postData?.scheduleDate ? <div className="ps_social_timedate_div">
                                    <span className="upcomg_post_date">{moment(postData?.scheduleDate).format("hh:mm A")}</span>
                                    <span className="upcomg_post_date">{moment(postData?.scheduleDate).format("YYYY-MMM-DD")}</span>
                                    <span className="upcomg_post_date">({postData?.timeZone.abbr})</span>

                                </div> : ""}
                            </div>
                        </div>
                        <div className="upcomg_post_social_available">

                            {postData.platefrom && <>
                                {postData.platefrom.map((d1,i) => {
                                    let sv = d1.toLowerCase()
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
                        <div className="ps_upcoming_date_box">

                            <div className="ps_upcoming_btn ps_upcoming_btn_width" onClick={() => addSchduleTime(postData, i)}>
                                <span >{svg.app.addtime}</span>
                                {postData?.scheduleDate ? <span className="rz_tooltipEle">update Time</span> : <span className="rz_tooltipEle"> Add Time</span>}
                            </div>
                            <div className="ps_upcoming_btn ps_upcoming_btn_width" onClick={() => handlePreview(postData)}>
                                <span >{svg.app.eyeIcon}</span>
                                <span className="rz_tooltipEle">Preview</span>
                            </div>
                            <div className="ps_upcoming_btn ps_upcoming_btn_width" onClick={() => handleDelete(i)}>
                                <span >{svg.app.deleteIcon}</span>
                                <span className="rz_tooltipEle">Delete</span>
                            </div>

                        </div>
                    </div>
                })}

            </div>
        </div>
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
                                <div className="ps_header_back" onClick={handleBackButtonEvent}><a>{svg.app.backIcon}<span> Back</span></a> </div>
                                <div><h3>Select Social Media Accounts</h3> </div>
                                <div className="ps_header_steps"><span>STEPS</span> <div className="ps_header_spin" style={{ backgroundImage: "url(/assets/images/spinner.png)" }}> 2</div> </div>
                            </div>
                        </div>
                        <div className="ps_create_post_box" >
                            <div className="ps_create_post_box_bg_step2">
                                <div className="ps_create_box_flex">
                                    <div className="ps_schedule_box ps_wdth_500">
                                        <div className="ps_create_post_refresh_btn" onClick={() => window.location.reload()}><div className="ps_create_post_toolbox">{svg.app.reload} <span className="rz_tooltipEle">Refresh Social Media Accounts</span></div></div>
                                        <div className="dash_header  pb-1">
                                            <h3 className="mb-0">Social Media Platforms</h3>
                                            <p>All scheduled posts will be posted on selected social media platforms </p>
                                        </div>
                                        <div className="ps_create_post_accordian_space">
                                            <div>
                                                <div className="px_social_accordian_box ">
                                                    <div className="px_social_accordian_icon_boxabso">
                                                        <div className='rz_acc_card_pro_box ppy' style={{ "background": "#1877F2" }}> {svg.app.facebook}</div>
                                                    </div>
                                                    <div className="ps_accordion">
                                                        <div className="ps_accordian_div" onClick={() => handleToggle("facebook")} >
                                                            {selectedFbAcc ? <div className="px_social_accordian_acconts_active">
                                                                <div className="px_social_accordian_acconts_active_inner">
                                                                    {selectedFbAcc?.obj?.data?.profile_image ? <div className='ps_acc_card_pro_box '> <img src={selectedFbAcc?.obj?.data?.profile_image} /></div> :
                                                                        <div className='ps_acc_card_pro_box' style={{ "background": "#1877F2" }}> {getNameInitials(selectedFbAcc?.obj?.data?.name)}</div>}
                                                                    <h6 className="">{selectedFbAcc?.obj?.data?.name}</h6>
                                                                </div>
                                                                <div className="px_social_accordian_accont_del" onClick={() => removeSelectedAcc(selectedFbAcc)}>{svg.app.closeIcon}</div>

                                                            </div> : <span>FaceBook Accounts</span>}
                                                            <div className="ps_accordian_aarrow"  >{accordianToggle.isFb ? svg.app.downArrow : svg.app.rightArrow}</div>
                                                        </div>
                                                        {accordianToggle.isFb &&
                                                            <>

                                                                {facebookDetails && facebookDetails.map((val, i) => {
                                                                    return <div key={i} className="" onClick={() => handleSocialAccSelection(val, i, "Facebook")}>
                                                                        <div className="px_social_accordian_acconts">
                                                                            <div className="rz_acc_card_div">
                                                                                {val.data?.profile_image ? <div className='ps_acc_card_pro_box '> <img src={val.data?.profile_image} /></div> :
                                                                                    <div className='ps_acc_card_pro_box' style={{ "background": "#1877F2" }}> {getNameInitials(val?.data?.name)}</div>}
                                                                                <h6 className="">{val.data?.name}</h6>
                                                                            </div>

                                                                        </div>
                                                                    </div>
                                                                })}
                                                                {!selectedFbAcc && facebookDetails.length == 0 ? <div className="ps_selected_social_acc_add_account">
                                                                    <h6> {svg.app.empty_box} Please Add Account</h6>
                                                                    <button onClick={() => {
                                                                        const newPageUrl = '/Integrations';
                                                                        window.open(newPageUrl, '_blank');
                                                                    }}>{svg.app.plusIcon} <span className="rz_tooltipEle">Add Social Account</span></button>
                                                                </div> : ""}
                                                            </>
                                                        }
                                                    </div>
                                                    <div className="px_social_accordian_icon_boxabso ppy" style={{ marginLeft: "10px" }}>
                                                        <input
                                                            className="form-check-input ps_create_post_checkbox"
                                                            style={{ cursor: "pointer" }}
                                                            type="checkbox"
                                                            disabled={!selectedFbAcc}
                                                            checked={selectedFbAcc && selectedSocialAcc && selectedSocialAcc['facebook']?.checked || false}
                                                            onChange={(e) => handleCheckbox(selectedFbAcc, e.target.checked)}
                                                        />
                                                    </div>
                                                </div>

                                                {selectedFbAcc && selectedFbAccDetails?.data?.facebookPages.length > 0 ? <div className=''>
                                                    <div className="ps_social_drop_input " >
                                                        <Select
                                                            isMulti
                                                            options={handlePagesOption(selectedFbAccDetails?.data?.facebookPages)}
                                                            className="basic-multi-select"
                                                            classNamePrefix="select"
                                                            value={showSelectedFbPages(selectedFbAccPages)}
                                                            onChange={(e) => handleMultiSelectBox(e)}
                                                            placeholder="Select Pages"
                                                            theme={(theme) => ({
                                                                ...theme,
                                                                colors: {
                                                                    ...theme.colors,
                                                                    primary: 'var(--primaryColor)',
                                                                },
                                                            })}
                                                        />
                                                    </div>
                                                </div> : ""}
                                            </div>


                                            <div className="px_social_accordian_box">
                                                <div className="px_social_accordian_icon_boxabso"><div className='rz_acc_card_pro_box ppy' style={{ "background": "#E4405F" }}> {svg.app.instagram}</div></div>
                                                <div className="ps_accordion">
                                                    <div className="ps_accordian_div" onClick={() => handleToggle("instagram")} >
                                                        {selectedInstaAcc ? <div className="px_social_accordian_acconts_active">
                                                            <div className="px_social_accordian_acconts_active_inner">
                                                                <div className='ps_acc_card_pro_box' style={{ "background": "#1877F2" }}> {getNameInitials(selectedInstaAcc?.obj?.data?.name)}</div>
                                                                <h6 className="">{selectedInstaAcc?.obj?.data.name}</h6>
                                                            </div>
                                                            <div className="px_social_accordian_accont_del" onClick={() => removeSelectedAcc(selectedInstaAcc)} >{svg.app.closeIcon}</div>
                                                        </div> : <span>Instagram Accounts</span>}
                                                        <div className="ps_accordian_aarrow"  >{accordianToggle.isInsta ? svg.app.profile_dropdown : svg.app.rightArrow}</div>

                                                    </div>
                                                    {accordianToggle.isInsta &&
                                                        <>
                                                            {instaDetails && instaDetails.map((val, i) => {
                                                                return <div key={i} className="" onClick={() => handleSocialAccSelection(val, i, "Instagram")}>
                                                                    <div className="px_social_accordian_acconts">
                                                                        <div className="rz_acc_card_div">
                                                                            <div className='ps_acc_card_pro_box' style={{ "background": "#1877F2" }}> {getNameInitials(val.data?.name)}</div>
                                                                            <h6 className="">{val.data?.name}</h6>
                                                                        </div>

                                                                    </div>
                                                                </div>
                                                            })}
                                                            {!selectedInstaAcc && instaDetails.length == 0 ? <div className="ps_selected_social_acc_add_account">
                                                                <h6> {svg.app.empty_box} Please Add Account</h6>
                                                                <button onClick={() => {
                                                                    const newPageUrl = '/Integrations';
                                                                    window.open(newPageUrl, '_blank');
                                                                }}>{svg.app.plusIcon} <span className="rz_tooltipEle">Add Social Account</span></button>
                                                            </div> : ""}
                                                        </>
                                                    }
                                                </div>
                                                <div className="px_social_accordian_icon_boxabso ppy" style={{ marginLeft: "10px" }}>
                                                    <input

                                                        className="form-check-input ps_create_post_checkbox"
                                                        style={{ cursor: "pointer" }}
                                                        type="checkbox"
                                                        disabled={!selectedInstaAcc}
                                                        checked={selectedInstaAcc && selectedSocialAcc && selectedSocialAcc['instagram']?.checked || false}
                                                        onChange={(e) => handleCheckbox(selectedInstaAcc, e.target.checked)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="px_social_accordian_box">
                                                <div className="px_social_accordian_icon_boxabso"><div className='rz_acc_card_pro_box ppy' style={{ "background": "#0A66C2" }}> {svg.app.linkedin}</div></div>
                                                <div className="ps_accordion">

                                                    <div className="ps_accordian_div" onClick={() => handleToggle("linkedin")} >
                                                        {selectedLinkedInAcc ? <div className="px_social_accordian_acconts_active">
                                                            <div className="px_social_accordian_acconts_active_inner">
                                                                <div className='ps_acc_card_pro_box' style={{ "background": "#1877F2" }}> {getNameInitials(selectedLinkedInAcc?.obj?.data?.name)}</div>
                                                                <h6 className="">{selectedLinkedInAcc?.obj?.data?.name}</h6>
                                                            </div>
                                                            <div className="px_social_accordian_accont_del" onClick={() => removeSelectedAcc(selectedLinkedInAcc)} >{svg.app.closeIcon}</div>
                                                        </div> : <span>LinkedIn Accounts</span>}
                                                        <div className="ps_accordian_aarrow"  >{accordianToggle.isLinkedIn ? svg.app.downArrow : svg.app.rightArrow}</div>
                                                    </div>
                                                    {accordianToggle.isLinkedIn &&
                                                        <>
                                                            {linkedInDetails && linkedInDetails.map((val, i) => {
                                                                return <div key={i} className="" onClick={() => handleSocialAccSelection(val, i, "LinkedIn")}>
                                                                    <div className="px_social_accordian_acconts">
                                                                        <div className="rz_acc_card_div">
                                                                            <div className='ps_acc_card_pro_box' style={{ "background": "" }}> {getNameInitials(val.data?.name)}</div>
                                                                            <h6 className="">{val.data?.name}</h6>
                                                                        </div>

                                                                    </div>
                                                                </div>
                                                            })}

                                                            {!selectedLinkedInAcc && linkedInDetails.length == 0 ? <div className="ps_selected_social_acc_add_account">
                                                                <h6> {svg.app.empty_box} Please Add Account</h6>
                                                                <button onClick={() => {
                                                                    const newPageUrl = '/Integrations';
                                                                    window.open(newPageUrl, '_blank');
                                                                }}>{svg.app.plusIcon} <span className="rz_tooltipEle">Add Social Account</span></button>
                                                            </div> : ""}
                                                        </>
                                                    }
                                                </div>
                                                <div className="px_social_accordian_icon_boxabso ppy" style={{ marginLeft: "10px" }}>
                                                    <input
                                                        className="form-check-input ps_create_post_checkbox"
                                                        style={{ cursor: "pointer" }}
                                                        type="checkbox"
                                                        disabled={!selectedLinkedInAcc}
                                                        checked={selectedSocialAcc && selectedSocialAcc['linkedin']?.checked || false}
                                                        onChange={(e) => handleCheckbox(selectedLinkedInAcc, e.target.checked)}
                                                    />
                                                </div>
                                            </div>

                                            <div className=" d-none px_social_accordian_box ">
                                                <div className="px_social_accordian_icon_boxabso"><div className='rz_acc_card_pro_box ppy' style={{ "background": "#1DA1F2" }}> {svg.app.twitter}</div></div>
                                                <div className="ps_accordion">

                                                    <div className="ps_accordian_div" onClick={() => handleToggle("twiteer")} >
                                                        {selectedTwitterAcc ? <div className="px_social_accordian_acconts_active">
                                                            <div className="px_social_accordian_acconts_active_inner">
                                                                <div className='ps_acc_card_pro_box' style={{ "background": "#1877F2" }}> {getNameInitials(selectedTwitterAcc?.obj?.data?.name)}</div>
                                                                <h6 className="">{selectedTwitterAcc?.obj?.data?.name}</h6>
                                                            </div>
                                                            <div className="px_social_accordian_accont_del" onClick={() => removeSelectedAcc(selectedTwitterAcc)} >{svg.app.closeIcon}</div>
                                                        </div> : <span>Twitter Accounts</span>}
                                                        <div className="ps_accordian_aarrow"  >{accordianToggle.isTwitter ? svg.app.profile_dropdown : svg.app.rightArrow}</div>
                                                    </div>
                                                    {accordianToggle.isTwitter &&
                                                        <>
                                                            {twitterDetails && twitterDetails.map((val, i) => {
                                                                return <div key={i} className="" onClick={() => handleSocialAccSelection(val, i, "Twitter")}>
                                                                    <div className="px_social_accordian_acconts">
                                                                        <div className="rz_acc_card_div">
                                                                            <div className='ps_acc_card_pro_box' style={{ "background": "#1877F2" }}> {getNameInitials(val.data?.name)}</div>
                                                                            <h6 className="">{val.data?.name}</h6>
                                                                        </div>

                                                                    </div>
                                                                </div>
                                                            })}

                                                            {!selectedTwitterAcc && twitterDetails.length == 0 ? <div className="ps_selected_social_acc_add_account">
                                                                <h6> {svg.app.empty_box} Please Add Account</h6>
                                                                <button onClick={() => {
                                                                    const newPageUrl = '/Integrations';
                                                                    window.open(newPageUrl, '_blank');
                                                                }}>{svg.app.plusIcon} <span className="rz_tooltipEle">Add Social Account</span></button>
                                                            </div> : ""}
                                                        </>
                                                    }
                                                </div>
                                                <div className="px_social_accordian_icon_boxabso ppy" style={{ marginLeft: "10px" }}>
                                                    <input
                                                        className="form-check-input ps_create_post_checkbox"
                                                        style={{ cursor: "pointer" }}
                                                        type="checkbox"
                                                        disabled={!selectedTwitterAcc}
                                                        checked={selectedTwitterAcc && selectedSocialAcc && selectedSocialAcc['twitter']?.checked || false}
                                                        onChange={(e) => handleCheckbox(selectedTwitterAcc, e.target.checked)}
                                                    />
                                                </div>
                                            </div>


                                            <div>
                                                <div className="px_social_accordian_box">
                                                    <div className="px_social_accordian_icon_boxabso"><div className='rz_acc_card_pro_box ppy' style={{ "background": "#BD081C" }}> {svg.app.pinterst}</div></div>
                                                    <div className="ps_accordion">

                                                        <div className="ps_accordian_div" onClick={() => handleToggle("pinterest")} >
                                                            {selectedPinterestAcc ? <div className="px_social_accordian_acconts_active">
                                                                {selectedPinterestAcc ? <div className="px_social_accordian_acconts_active_inner">
                                                                    <div className='ps_acc_card_pro_box '> <img src={selectedPinterestAcc?.obj?.data?.profile_image} /></div>
                                                                    <h6 className="">{selectedPinterestAcc?.obj?.data?.name}</h6>
                                                                </div> :
                                                                    <div className="px_social_accordian_acconts_active_inner">
                                                                        <div className='ps_acc_card_pro_box' style={{ "background": "#1877F2" }}> {getNameInitials(selectedPinterestAcc?.obj?.data?.name)}</div>
                                                                        <h6 className="">{selectedPinterestAcc?.obj?.data?.name}</h6>
                                                                    </div>}
                                                                <div className="px_social_accordian_accont_del" onClick={() => removeSelectedAcc(selectedPinterestAcc)}  >{svg.app.closeIcon}</div>
                                                            </div> : <span>Pinterest Accounts</span>}
                                                            <div className="ps_accordian_aarrow"  >{accordianToggle.isPinterest ? svg.app.downArrow : svg.app.rightArrow}</div>
                                                        </div>
                                                        {accordianToggle.isPinterest &&
                                                            <>

                                                                {pinterestDetails && pinterestDetails.map((val, i) => {
                                                                    return <div key={i} className="" onClick={() => handleSocialAccSelection(val, i, "Pinterest")}>
                                                                        <div className="px_social_accordian_acconts">
                                                                            <div className="rz_acc_card_div">
                                                                                <div className='ps_acc_card_pro_box '> <img src={val.data.profile_image} /></div>
                                                                                <h6 className="">{val.data?.name}</h6>
                                                                            </div>

                                                                        </div>
                                                                    </div>
                                                                })}
                                                                {!selectedPinterestAcc && pinterestDetails.length == 0 ? <div className="ps_selected_social_acc_add_account">
                                                                    <h6> {svg.app.empty_box} Please Add Account</h6>
                                                                    <button onClick={() => {
                                                                        const newPageUrl = '/Integrations';
                                                                        window.open(newPageUrl, '_blank');
                                                                    }}>{svg.app.plusIcon} <span className="rz_tooltipEle">Add Social Account</span></button>
                                                                </div> : ""}
                                                            </>
                                                        }
                                                    </div>
                                                    <div className="px_social_accordian_icon_boxabso ppy" style={{ marginLeft: "10px" }}>
                                                        <input
                                                            className="form-check-input ps_create_post_checkbox"
                                                            style={{ cursor: "pointer" }}
                                                            type="checkbox"
                                                            disabled={!selectedPinterestAcc}
                                                            checked={selectedSocialAcc && selectedSocialAcc['pinterest']?.checked || false}
                                                            onChange={(e) => handleCheckbox(selectedPinterestAcc, e.target.checked)}
                                                        />
                                                    </div>
                                                </div>
                                                {selectedPinterestAcc && selectedPinterestAccDetails.data?.boardList ? <div className=''>
                                                    <div className="ps_social_drop_input " >
                                                        <Select
                                                            className="basic-single"
                                                            classNamePrefix="select"
                                                            name="color"
                                                            value={showPinterestSelectedLocation(selectedPinterestBoard) || ""}
                                                            options={selectedPinterestAccDetails && handleBoardListOption(selectedPinterestAccDetails?.data?.boardList)}
                                                            onChange={(e) => handlePinterestMultiSelectBox(e)}
                                                            placeholder="Select Board"
                                                            theme={(theme) => ({
                                                                ...theme,
                                                                colors: {
                                                                    ...theme.colors,
                                                                    primary: 'var(--primaryColor)',
                                                                },
                                                            })}
                                                        />
                                                    </div>
                                                </div> : ""}
                                            </div>

                                        </div>
                                    </div>
                                    {!router?.query?.id && !isSchedulePost && postList.length == 0 &&
                                        <div className="ps_wdth_500 ">
                                            <div className="ps_schedule_box  ">
                                                <div className="dash_header mb-0">
                                                    <h3 className="mb-0">Preview</h3></div>
                                                <div className="modal-body_prev p-0">

                                                    <div className="ps_preview_profile_box">
                                                        <div className="ps_Preview_profile_img">
                                                            {userData?.profile ? <img src={userData?.profile} /> :
                                                                <div className=''   > {getNameInitials(userData?.name)}</div>
                                                            }
                                                        </div>
                                                        <div className="ps_Preview_profile_text">
                                                            <h6> {userData.name}</h6>
                                                            <p><span> {svg.app.myReels} {moment().format("YYYY-MM-DD")}</span><span> {svg.app.time_clock}{moment().format("hh:mm A")} </span></p>
                                                        </div>
                                                    </div>
                                                    <div className="pt-2"><p>{imagePostDataStep2?.text}</p></div>
                                                   
                                                    {(imagePostDataStep2 && imagePostDataStep2.url) ?
                                                        <>
                                                            {imagePostDataStep2.type == "image" ?
                                                                <div className='preview_Image_prev'>
                                                                    <img src={imagePostDataStep2?.url} />
                                                                </div>
                                                                :
                                                                <div className='ps_assets_icon_videobox'>
                                                                    <video src={imagePostDataStep2?.url} />
                                                                </div>
                                                            }
                                                        </>
                                                        : ""}
                                                         <div className="ps_preview_socail_icon">
                                                    {imagePostDataStep2.platefrom && <>
                                                        {imagePostDataStep2.platefrom.map((d1,i) => {
                                                            let sv = d1.toLowerCase()
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

                                                </div>
                                            </div>
                                        </div>
                                    }

                                    {isSchedulePost || router?.query?.id ? <div className="ps_wdth_400 ms-lg-3">
                                        {showSchedulePost()}
                                    </div> : ""}
                                    {postList?.length > 0 ? <div className="ps_wdth_500 ">
                                        {showMultipost()}
                                    </div> : ""}
                                </div>
                            </div>
                        </div>
                        {isSchedulePost || router?.query?.id ? <div className="d-flex justify-content-center">
                            <button className='rz_addAccBtn' onClick={submitSchedulePost}>Schedule{svg.app.nextIcon}</button>
                        </div> :
                            <div className="d-flex justify-content-center">
                                {storeMultiPostData?.length > 0 ? <button className='rz_addAccBtn_blk mx-2' disabled={process.env.TYPE == "demo" ? true : false} onClick={submitSchedulePost}>Schedule</button> :
                                    <button className='rz_addAccBtn_blk mx-2' disabled={process.env.TYPE == "demo" ? true : false} onClick={handleSchedulePost}>Schedule</button>
                                }
                                {storeMultiPostData?.length > 0 ?
                                    <button className='rz_addAccBtn ' disabled={process.env.TYPE == "demo" ? true : false} style={{ width: "120px" }} onClick={submitPublishedMultiPost}>Post Now {svg.app.nextIcon}</button> :
                                    <button className='rz_addAccBtn ' disabled={process.env.TYPE == "demo" ? true : false} style={{ width: "120px" }} onClick={submitPublishedPost}>Post Now {svg.app.nextIcon}</button>
                                }
                            </div>
                        }
                    </div>
                </div>
            </div>
            <MyModal
                shown={isMultiPostModal}
                close={() => {
                    setIsMultiPostModal(false);
                }}
            >
                <div className="p-4 mt-lg-0 mt-4">
                    <div className="">
                        <div className="dash_header">
                            <h3 className="mb-0">Select Time</h3>
                            <p>Selected scheduled post will be posted at selected time</p>
                        </div>
                        <div>
                            <div className="active_social_box_inner">
                                <div className='col-md-6 text-center m-auto'>
                                    <Flatpickr
                                        options={{ minDate: new Date() }}
                                        data-enable-time
                                        placeholder="Date and Time"
                                        mindate={new Date()}
                                        value={selectedPost?.scheduleDate}
                                        onChange={(date) => onHandleScheduleDate(date, true)}
                                    />
                                    <select className="form-control form-control-md mt-2"
                                        value={selectedPost?.timeZone?.value}
                                        style={{ margin: "auto", }}
                                        onChange={(e) => handleTimezone(e, true)}>
                                        <option style={{ fontWeight: "700px" }}>Select TimeZone</option>
                                        {timeZone.map((zone, i) => {
                                            return <option key={i}>{zone.value}</option>
                                        })}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-center d-flex justify-content-center mb-5">
                    <button className='rz_addAccBtn' onClick={() => handleMultiSelectSchduleTime()}> Continue {svg.app.nextIcon}</button>
                </div>

            </MyModal >

            <MyModal
                shown={isOpen}
                close={() => {
                    setIsPreviewModalData()
                    setIsOpen(false)
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
                            <p><span> {svg.app.myReels} {moment(isPreviewModalData?.start).format("YYYY-MM-DD")}</span><span> {svg.app.time_clock}{moment(isPreviewModalData?.start).format("hh:mm A")} </span></p>
                        </div>
                    </div>
                    <div className="pt-2"><p>{isPreviewModalData?.text}</p></div>

                    {isPreviewModalData?.url ? <div >
                        {isPreviewModalData.type == "image" ?
                            <div className='preview_Image_prev'><img src={isPreviewModalData?.url} /></div>
                            :
                            <div className='ps_assets_icon_videobox'><video src={isPreviewModalData?.url} controls /></div>
                        }
                    </div> : ""}
                </div>
            </MyModal>

            <ConfirmationPopup
                shownPopup={isRemove}
                closePopup={() => {
                    setIsRemove(false)
                }}
                type={"Post"}
                removeAction={() => {
                    postList.splice(removePost, 1)
                    setIsRemove(false)
                }}
            />



        </>
    )
}