import React, { useState, useEffect } from 'react'
import Router, { useRouter } from 'next/router';
import svg from '../svg';
import { appStore } from "@/zu_store/appStore";

const Default_color = ['#EF5350', '#EC407A', '#AB47BC', '#7E57C2', '#D4E157', '#FFEE58', '#FFA726', '#FF7043', '#8D6E63', '#78909C'];

let Pencil_setting = () => {

  let store = appStore(state => state);
  let drawData = appStore(state => state.drawData);
  let activetab = appStore(state => state.activetab);
  const changeValue = (key, value) => {
    let data = {
      ...drawData,
      [key]: value,
    }
    store.updateStoreData("drawData", data)
  }

  const showLine = (size) => {
     if(size == 2){
      return "line1"
     } else if(size == 5){
      return "line2"
    } else if(size == 7){
      return "line3"
    } else if(size == 10){
      return "line4"
     }
  }

  return (
    <>
      <div className="p-25">
        <div className="ps_img_editor_side_layers">
          <h6>{activetab == "pencil" ? "Pencil" : "Line"} Settings</h6>
        </div>

        <div className="ps_input_wrapper_div pb-3">
          <label className="ps_image_editor_label"> Color </label>
          <div className="ps_color_picker_wrapper">
            <div className="ps_color_picker_toggle">
              <input type="color" value={drawData?.color} onChange={(e) => {
                changeValue("color", e.target.value);
              }} />
              <span>{drawData.color}</span>
            </div>
          </div>
        </div>



        <div className="d-flex justify-content-between px_image_editor_main_box py-2">
          <div className="ps_input_wrapper">
            <label className="ps_image_editor_label">Size </label>
            
            <div className="ewp_input ewp_input_size">
              <select onChange={(e) => { changeValue("size", e.target.value) }} value={drawData.size} className="subcribe_site" style={{backgroundImage:"url(/assets/images/dropdown.png) "}}>
                <option value={2} disabled="">
                  1
                </option>
                <option value={5}>2</option>
                <option value={7}>3</option>
                <option value={10}>4</option>
              </select>
            </div>
            <div className='ps_editor_lines ms-3'>
            <div className={ showLine(drawData?.size)}></div>
         
            </div>


          </div>
        </div>
        <div className="ps_image_editor py-2">
          <label className="ps_image_editor_label pb-2">Default Color </label>
          <div className="ps_image_editor_def_color">
            {Default_color.map((val, i) => {
              return (
                <div key={i}
                  className="ps_image_editor_def_color_box"
                  onClick={() => {
                    changeValue("color", val);
                  }}
                  style={{ background: `${val}` }}
                ></div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  );
}
export default Pencil_setting