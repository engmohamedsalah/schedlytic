import React from 'react'

import svg from '../svg';
import { appStore } from "@/zu_store/appStore";
import {
    initManageElement,
    removeElement,
    updateElementData,
    addNewElement,
} from "@/components/editor/manageElement";

let Icon_tool_setting = () => {
    let store = appStore((state) => state);
    let editorData = appStore((state) => state.editorData);
    let activeElement = appStore((state) => state.activeElement);
    let ImageData = editorData.find((d1) => d1.id == activeElement?.id);
    initManageElement(editorData, store.updateStoreData);




    let updateImage = (key, value) => {
        let mainIndex = ImageData.id;
        if(key=="opacity"){
            value =value/100
        }
        updateElementData({
            index: mainIndex,
            key,
            value,
        });
    };

    return (
        <>
            <div className='ps_editor_tool_box_flex'>
                
                   
                    <div className='image_editor_range' item>
                        <label className='ps_image_editor_tool_label'>Opacity </label>
                        <div className="range">
                            <input type="range"  value={ImageData?.opacity *100} min="0" max="100"  onChange={(e) => {
                               
                                 updateImage("opacity", e.target.value)
                            }} style={{ backgroundSize: `${ImageData?.opacity * 100 }% 100%` }} />

                        </div>
                        <div className='ps_color_picker_toggle'>
                            <h6>{parseInt(ImageData?.opacity * 100)}</h6>
                        </div>
                    </div>
                
                <div className='d-flex justify-content-between px_image_editor_main_box '>
                    <div className='d-flex justify-content-between align-items-center'>
                        {activeElement.element &&
                        <>
                            <label className='ps_image_editor_tool_label'>Alignment </label>
                            <div className="ewp_input ewp_input_size">
                                <select value={ImageData?.opacity}  style={{backgroundImage:"url(/assets/images/dropdown.png) "}} className="subcribe_site" name="" onChange={(e) => {
                                    if (e.target.value == "right") {
                                        updateImage("right", true)
                                    } else if (e.target.value == "buttom") {
                                        updateImage("top", 0)

                                    } else if (e.target.value == "top") {
                                        updateImage("buttom", true)
                                    } else if(e.target.value == "center"){
                                        updateImage("center", true)
                                    }
                                }}>
                                    <option value="0.2" disabled=""> Select </option>
                                    <option value="right"> Right</option>
                                    <option value="buttom"> Top</option>
                                    <option value="top"> Bottom</option>
                                    <option value="center"> Center</option>
                                </select>
                            </div>
                        </>}

                      
                    </div>
                </div>
                {activeElement.element != "draw" &&
                    <div className='d-flex justify-content-md-between justify-content-center  '>
                        <div className='d-flex justify-content-between align-items-center'>
                            <label className='ps_image_editor_tool_label'>Flip </label>

                            <button
                                className="ps_image_creator_text_btn "
                                id="FlipX"
                                onClick={() => {
                                    updateImage("flipX", !ImageData?.flipX)
                                }}>
                                {svg.app.text_editor_flipX}
                                <span className="rz_tooltipEle">Flip X</span>
                            </button>
                            <button
                                className="ps_image_creator_text_btn "
                                id="FlipY"
                                onClick={() => {
                                    updateImage("flipY", !ImageData?.flipY)
                                }}>
                                {svg.app.text_editor_flipY}
                                <span className="rz_tooltipEle">Flip Y</span>
                            </button>

                        </div>
                    </div>
                }
                <div className='d-flex justify-content-md-between justify-content-center  '>
                    <div className='d-flex justify-content-between align-items-center'>

                        <button
                            className="ps_image_creator_text_btn "
                            id="sendToFront"
                            onClick={() => {
                                store.updateStoreData("updateElement", {
                                    status: true,
                                    action: "front",
                                });
                            }}
                        >
                            {svg.app.sendToFront}
                            <span className="rz_tooltipEle">Send To Front</span>
                        </button>

                        <button
                            className="ps_image_creator_text_btn "
                            id="sendToBack"
                            onClick={() => {
                                store.updateStoreData("updateElement", {
                                    status: true,
                                    action: "back",
                                });
                            }}
                        >
                            {svg.app.sendToBack}
                            <span className="rz_tooltipEle">Send To Back</span>
                        </button>

                        <button
                            className="ps_image_creator_text_btn "
                            id="Delete"
                            onClick={() => {
                                store.updateStoreData("updateElement", {
                                    status: true,
                                    action: "delete",
                                });
                            }}
                        >
                            {svg.app.deleteIcon_fill}
                            <span className="rz_tooltipEle">Delete</span>
                        </button>
                        <button
                            className="ps_image_creator_text_btn "
                            id="duplicateIcon"
                            onClick={() => {
                                store.updateStoreData("updateElement", {
                                    status: true,
                                    action: "clone",
                                });
                            }}
                        >
                            {svg.app.duplicateIcon}
                            <span className="rz_tooltipEle">Duplicate</span>
                        </button>
                        {activeElement.mask && 
                        <button
                            className="ps_image_creator_text_btn "
                            id="detachIcon"
                            onClick={() => {
                               let b1= document.getElementById("deattach")
                               if(b1){
                                b1.click()
                               }
                                
                            }}
                        >
                            {svg.app.Detach_icon}
                            <span className="rz_tooltipEle">Detach</span>
                        </button>
                            }

                    </div>
                </div>

            </div>
        </>
    )
}
export default Icon_tool_setting