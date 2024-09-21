import React from 'react'

import { appStore } from "@/zu_store/appStore";

const Default_color = ['#EF5350', '#EC407A', '#AB47BC', '#7E57C2', '#5C6BC0', '#42A5F5', '#29B6F6', '#26C6DA', '#26A69A', '#66BB6A', '#9CCC65', '#D4E157', '#FFEE58', '#FFCA28', '#FFA726', '#FF7043', '#8D6E63', '#78909C'];

let Drawing_color = () => {
  let store = appStore(state => state);
  let drawData = appStore(state => state.drawData);
  let activeElement = appStore(state => state.activeElement);
  let editorData=appStore(state => state.editorData);
  let selectElement = editorData.find((d1)=>d1.id==activeElement.id)


  const changeValue = (key, value) => {
   let data =[...store.editorData]
   let index=data.findIndex((d1)=>d1.id==activeElement.id)
   data[index].status=key
   data[index][key]=value
   store.updateStoreData("editorData", data)
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
          <h6>Drawing Color</h6>
        </div>

        <div className="ps_input_wrapper_div pb-3">
          <label className="ps_image_editor_label"> Color </label>
          <div className="ps_color_picker_wrapper">
            <div className="ps_color_picker_toggle">
              <input type="color" value={selectElement?.stroke} onChange={(e)=>{
                changeValue("stroke", e.target.value);
              }} />
              <span>{selectElement?.stroke}</span>
            </div>
          </div>
        </div>
        <div className="d-flex justify-content-between px_image_editor_main_box py-2">
          <div className="ps_input_wrapper">
            <label className="ps_image_editor_label">Size </label>
            
            <div className="ewp_input ewp_input_size" >
              <select onChange={(e) => { changeValue("strokeWidth", parseInt(e.target.value)) }} value={selectElement?.strokeWidth} className="subcribe_site" style={{backgroundImage:"url(/assets/images/dropdown.png) "}}>
                <option value={2} disabled="">
                  1
                </option>
                <option value={5}>2</option>
                <option value={7}>3</option>
                <option value={10}>4</option>
              </select>
            </div>
            <div className='ps_editor_lines ms-3'>
            <div className={ showLine(selectElement?.strokeWidth)}></div>
         
            </div>


          </div>
        </div>
  
        <div className="ps_image_editor py-2">
          <label className="ps_image_editor_label pb-2">Default Color </label>
          <div className="ps_image_editor_def_color">
            {Default_color.map((val, i) => {
            return(
              <div key={i}
                className="ps_image_editor_def_color_box"
                onClick={() => {
                  changeValue("stroke", val);
                }}
                style={{ background: `${val}` }}
              ></div>
            )})}
          </div>
        </div>
      </div>
    </>
  );
}
export default Drawing_color