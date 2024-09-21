import React, { useState, useEffect } from 'react'
import { NoDataWrapper, common, setMyState } from '@/components/Common';
import { toast } from "react-toastify";

import svg from '../svg';
import { appStore } from "@/zu_store/appStore";
import {
    initManageElement,
    addNewElement,
} from "@/components/editor/manageElement";

const Default_color = ['#EF5350', '#EC407A', '#AB47BC', '#7E57C2', '#D4E157', '#FFEE58', '#FFA726', '#FF7043', '#8D6E63', '#78909C'];

let FramesBG = () => {
    let store = appStore(state => state),

        editorData = store.editorData || []


    initManageElement(editorData, store.updateStoreData);


    let [state, setQuery] = useState({
        platform: 'pexels',
        imagesList: [],
        isLoading: false,
        keyword: '',
        page: 1,
        totalRecords: 0,
    });




    const [age, setAge] = React.useState('');

    const handleChange = (event) => {
        setAge(event.target.value);
    };

    // range

    const [value, setValue] = React.useState(30);

    const handleSliderChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleInputChange = (event) => {
        setValue(event.target.value === '' ? 0 : Number(event.target.value));
    };

    const handleBlur = () => {
        if (value < 0) {
            setValue(0);
        } else if (value > 100) {
            setValue(100);
        }
    };


    let checkMedia = (elements, index = 0) => {
        manageMedia({
            elements, index
        }, (frmData) => {
            common.getAPI({
                method: 'POST',
                url: 'media?mediaType=image&elementType=frame',
                data: frmData,
                isFormData: true,
            }, (resp) => {
                setMyState(setQuery, {
                    page: 1
                })
                fileterImages("search")
            });
        });
    }

    let manageMedia = ({ elements, index } = params, cb) => {

        if (!elements.target || !elements.target.files) {
            toast.error(`Please choose a file to continue.`);
            return;
        }

        let selectedFile = elements.target.files[index ? index : 0];
        let selFileType = selectedFile.type;
        let selFileExt = "." + selectedFile.name.split(".").reverse()[0].toLowerCase();

        let acceptAry = elements.target.accept.replace(new RegExp(" ", "g"), "").split(",");

        let acceptFileTypeAry = [];
        let acceptFileAry = [];
        acceptAry.map((d, i) => {
            let fd = d.split("/");
            acceptFileTypeAry.push(fd[0]);
            acceptFileAry.push(fd[1]);
        });

        if (!acceptAry.includes(selFileExt)) {
            toast.error(`Only ${acceptAry.join(", ") + (acceptFileTypeAry.length == 1 ? " file is " : " files are ")} allowed.`);
        } else if (selectedFile) {
            let data = new FormData();
            let fr = new FileReader();

            if (selFileType.split("video").length > 1 || selFileType.split("image").length > 1) {
                fr.onloadend = async (e) => {
                    e.currentTarget.value = "";
                    let name = selectedFile.name;
                    name = name.replace(/\s/g, "-");
                    let thumbName = getFileName(name) + `-thumb.png`;
                    data.append("file", selectedFile, name);
                    var createElem = document.createElement(`img`);
                    createElem.src = URL.createObjectURL(selectedFile);
                    createElem.onload = (e) => {
                        var mediaMeta = {
                            duration: createElem.duration,
                            width: createElem.width,
                            height: createElem.height,
                        };
                        data.append("meta", JSON.stringify(mediaMeta));

                        cb(data);
                    };
                }

                fr.readAsDataURL(selectedFile);
            } else {
                toast.error(`Selected file not allowed.`);
            }
        } else {
            toast.error(`Please choose a file.`);
        }
    }

    let getFileName = (filename) => {
        return filename.replace(/\.[^/.]+$/, "");
    }


    useEffect(() => {
        fileterImages();
    }, []);

    let fileterImages = (type = null) => {


        if (state.isLoading) {
            return;
        }

        let currentPage = type == 'loadMore' ? state.page + 1 : (type == 'search' ? 1 : state.page);
        setMyState(setQuery, {
            isLoading: true
        })
        common.getAPI({
            method: 'GET',
            url: 'media',
            data: {
                elementType : "frame",
                mediaType: "image",
                page: currentPage,
                limit: 9
            },
        }, (resp) => {
            setMyState(setQuery, {
                imagesList: type == 'loadMore' ? [...state.imagesList, ...resp.data] : resp.data,
                isLoading: false,
                totalRecords: resp.totalRecords,
                page: currentPage
            }, () => {
            })
        }, () => {
            setMyState(setQuery, {
                isLoading: false
            })
        });
    }


    let addNewMedia = (mediaUrl, meta) => {
        addNewElement({
            type: "image",
            src: mediaUrl,
            meta,
            elementtype1 : "mask",
        });
    }


    return (
        <>
            <div className=''>
                <div className=' px-25'>
                    <h6 className='pb-2'>Frames</h6>
                    <div className='ps_image_editor_frmaes_BG_Frames'>
                        {state.imagesList.map((image, i) => {
                            let url = process.env.S3_PATH + image.path
                            return (
                                <div key={image._id} className='ps_image_editor_BG_Frames'>
                                    <img key={image._id} src={url} alt='R' onClick={() => {
                                        addNewMedia(url, image.meta)
                                    }} />
                                </div>
                            )
                        })}

                        {
                            state.imagesList.length < state.totalRecords && !state.isLoading ?
                                <button className='ps_image_creator_blk_btn  mt-4 mx-auto' onClick={() => {
                                    fileterImages("loadMore");
                                }} > Load More  {svg.app.loadmore}</button>

                                : <></>
                        }

                        {state.isLoading &&
                            <div className='rz_gridBox'>
                                <div className='rz_gridInnerBox'>
                                    <NoDataWrapper
                                        isLoading={state.isLoading}
                                        blockCount="9"
                                        height={"220"}
                                        width="220"
                                        className="rz_gridCol p-1"
                                        section="media"
                                        dataCount={state.imagesList.length}
                                        title={'Frames not found.'}
                                    />
                                </div>
                            </div>
                        }

                        <div className='w-100'><div className='m-auto'>
                            <div className='rz_gridInnerBox ps_img_not_found' >
                            </div>
                            {!state.isLoading &&
                                <NoDataWrapper
                                    isLoading={state.isLoading}
                                    blockCount="3"
                                    height={"220"}
                                    width="220"
                                    className="rz_gridCol p-1"
                                    section="media"
                                    dataCount={state.imagesList.length}
                                    title={'Frames not found.'}
                                />
                            }
                        </div></div>



                    </div>
                </div>
            </div>
        </>

    )
}
export default FramesBG