import React, {  useState } from 'react'
import svg from '../svg';
import { common } from '@/components/Common';
import { NoDataWrapper, setMyState } from '@/components/Common';
import { appStore } from "@/zu_store/appStore";
import {
    initManageElement,
    addNewElement,
} from "@/components/editor/manageElement";

export default function Icon(props) {
    let store = appStore(state => state),
    editorData = store.editorData || []
    initManageElement(editorData, store.updateStoreData);
    let [run, setrun] = useState("false");
    let [state, setstate] = useState({
        list: [],
        totalRecords: 0,
        page: 1
    })

    const [indexMap, setIndexMap] = useState({})

    if (!indexMap[props.index]) {
        let data = {
            index: props.index,
            isOpen: false
        }
        indexMap[props.index] = data
        setIndexMap(indexMap)
    }

    let getList = (id, data = null) => {

        setstate({
            ...state,
            isLoading: true,
        })
        let page =  data != null ? state.page+1 :   state.page
        common.getAPI({
            method: 'GET',
            url: 'category',
            data: {
                action: "getMedia",
                target: id,
                limit: 9,
                page: page
            },
        }, (resp) => {
            setrun("true")

            setstate({
                ...state,
                list: data == null ? resp.data : [...state.list, ...resp.data],
                totalRecords: resp.totalRecords,
                isLoading: false,
                page : page
            })
        });
    }


    let addNewMedia = (id, meta) => {
        common.getAPI({
            method: 'GET',
            url: 'media',
            data: {
                action : 'useImage',
                target : id
            },
        }, (resp) => {
            addNewElement({
                type: "image",
                src: process.env.S3_PATH+resp.data.url,
                meta
            });
        });
       
    }

    const handleIconClick = () => {
        indexMap[props.index] = { index: props.index, isOpen: !indexMap[props.index].isOpen }
        setIndexMap({ ...indexMap })
        if (run == "true" && state.list.length == 0) {
            setrun(false)
            return
        }

        if (state.list.length == 0) {
            getList(props?.data?._id)
        } else {
            setstate({
                ...state,
                list: [],
                totalRecords: 0,
            })
            setrun(false)
        }
    }

    return (
        <>
        <div className=''>
            <div className="px_editor_accordian_box ">
                <div className="ps_editor_accordion">
                    <div className="ps_editor_accordian_div " onClick={() => handleIconClick()} >
                        <div className="px_editor_accordian_acconts_active" >
                            <div className="px_editor_accordian_acconts_active_inner"><h6 className="">{props?.data?.name}</h6></div>
                        </div>
                        <div className="ps_editor_accordian_aarrow"  >{!indexMap[props.index].isOpen ? svg.app.rightArrow : svg.app.downArrow}</div>
                    </div>

                    <div className="ps_editor_accordian_dropbox">
                        <div className='ps_image_editor_accordian_box '>
                            {state.list && state.list.map((data) => {
                                return (<div key={data._id} className='ps_image_editor_accordian_imgbox'>
                                    <img src={process.env.S3_PATH + data.path} alt='vector' />
                                    <div className="ps_stockImage">
                                        <a onClick={() => {
                                            addNewMedia(data._id, data.meta)
                                        }} className="ps_anime_btn spv-viewBtn">{svg.app.plusIcon}</a>
                                    </div>
                                </div>)
                            })}
                            {
                                state.isLoading || state.list.length > 0 ?
                                    <div className='rz_gridBox'>
                                        <div className='rz_gridInnerBox'>
                                            <NoDataWrapper
                                                isLoading={state.isLoading}
                                                blockCount="3"
                                                height={"220"}
                                                width="220"
                                                className="rz_gridCol p-2"
                                                section="media"
                                                dataCount={state.list.length}
                                                title={'Image not found.'}
                                            />
                                        </div>
                                    </div>
                                    : <></>
                            }

                            {
                                (run == "true" && state.page == 1 && state.list.length == 0) && <div className='ps_editor_empty'>{svg.app.empty_box}<span>Data not found</span></div>
                            }

                            {
                                state.list.length < state.totalRecords && !state.isLoading ?
                                    <button className='ps_image_creator_blk_btn  mt-4 mx-auto' onClick={() => {
                                        getList(props?.data?._id, "loadmore")
                                    }} >  Load More {svg.app.loadmore}</button>

                                    : <></>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div> 
    </>

    )
}
