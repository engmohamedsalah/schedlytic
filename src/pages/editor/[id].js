import React, { useState, useEffect, useRef } from "react";
import svg from "@/components/svg";
import Pencil_setting from "@/components/imageEditor/pencilSett";
const Text_setting = dynamic(
  () => import("@/components/imageEditor/textSetting"),
  {
    ssr: false,
  }
);
const Canvas = dynamic(
  () => import("./index"),
  {
    ssr: false, 
  }
);


import Image_setting from "@/components/imageEditor/imageSetting";
import Icon_shape_setting from "@/components/imageEditor/iconShape";
import Filter_setting from "@/components/imageEditor/filterSetting";
import Image_edit_box from "@/components/imageEditor/imageEditbox";
import Icon_tool_setting from "@/components/imageEditor/tools_icon";
import dynamic from "next/dynamic";
import { appStore } from "@/zu_store/appStore";
import Link from "next/link";
import { useRouter } from "next/router";
import { common } from "@/components/Common";
import Head from "next/head";
import Edit_setting from "@/components/imageEditor/setting_editor";
import DrawingSetting from "@/components/imageEditor/drawing_color";

const size = {
  Square: {
    width: "650px",
    height: "650px",
  },
  Landscape: {
    width: "1156px",
    height: "650px",
  },
  Portrait: {
    width: "366px",
    height: "650px",
  },
};

let ImgCreator = () => {
  const router = useRouter();
  let undoData = appStore((state) => state.undoData);
  let store = appStore((state) => state);
  let userData = appStore((state) => state.userData);
  let activeElement = appStore((state) => state.activeElement);
  let editorData = appStore((state) => state.editorData);
  editorData = editorData.filter(
    (d1) => d1.type == "text" || d1.type == "image"
  );
  let filterdata = appStore(state => state.filterCanvas);

  const [editorToolType, setEditorToolType] = useState("");
 
  const [isToolSlide, setIsToolSlide] = useState(false);
  const [loading, setloading] = useState(false);
  const [load, setload] = useState(false);
  const [check, setcheck] = useState(false);
  const [finalSpaceCharactersList, setfinalSpaceCharactersList] = useState([]);
  const [fixSize, setSize] = useState({});
  const [imageSize1, setImageSize1] = useState("");
  const [templatename, settemplatename] = useState("");
  
  const [cursur,setcursur] =useState("false");

  useEffect(() => {
    if (router.query.id) {
      getTemplatedata();
    }
    return () => {
    };
  }, [router.query.id]);


  useEffect(()=>{
    if(fixSize.layout)
    {
      setImageSize1(fixSize.layout)
    }
  },[fixSize])


  useEffect(()=>{
    if(editorToolType!="")
    {
     store.updateStoreData("selectCursor", false);
    }
  },[editorToolType])

  const getTemplatedata = async () => {
    setloading(true);
    common.getAPI(
      {
        method: "GET",
        url: "templates",
        data: {
          target: router.query.id,
          isLoader: true,
        },
      },
      async (resp) => {
        if (resp.data) {
          let siz = resp.data.layout;
          setImageSize1(resp.data.layout)
          let d1 = size[siz];
          if (!d1) {
            setSize(resp.data.dimenstions);
          } else {
            setSize(d1);
          }
          await store.updateStoreData("undoData", {
            status: false,
            currentPostion: 0,
            data: [],
          });
          let d2 = { ...store.drawData }
          d2.bgColor = resp.data?.bgColor ? resp.data?.bgColor : "linear-gradient(0deg,#FFFFFF ,#FFFFFF)"
          await store.updateStoreData("filterCanvas", resp.data.filter);
          await store.updateStoreData("drawData", d2);
          await store.updateStoreData("activetab", "");
          await store.updateStoreData(
            "editorData",
            resp.data.data == undefined
              ? []
              : resp.data.data.objects == undefined
                ? []
                : resp.data.data.objects
          );
          await store.updateStoreData("activeElement", {
            id: "",
            element: "",
          });
          settemplatename(resp.data.title)
          setload(true);
        } else {
          setcheck(true);
        }
      }
    );
  };


  let mangeLayersSlideRight = () => {
    setIsToolSlide(!isToolSlide);
  };

  const selectAccount = (name) => {
    setEditorToolType(name);
  };

  useEffect(() => {
    store.updateStoreData("activeElement", {
      id: "",
      element: ""
    })
    store.updateStoreData("activetab", editorToolType);
  }, [editorToolType]);

  useEffect(() => {
    let d1 = store.editorData.filter(
      (d1) => d1.type == "text" || d1.type == "image"
    );
    if (d1.length != finalSpaceCharactersList.length) {
      setfinalSpaceCharactersList(d1);
    }
  }, [store]);

  const showEditorToolComponent = () => {
    let data = [];
    if (editorToolType === "Setting") {
      return <Edit_setting name={templatename} setname={settemplatename} setsize={setSize} layout={imageSize1} size={fixSize}/>;
    } else if (editorToolType === "Text") {
      return <Text_setting />;
    } else if (editorToolType === "Image") {
      if (activeElement.element == "image" && !activeElement.maskS) {
        return <Image_edit_box />;
      } else {
        return <Image_setting />;
      }
    } else if (editorToolType === "Shape") {
      return <Icon_shape_setting />;
    } else if (editorToolType === "Filter") {
      return <Filter_setting />;
    }  else if (editorToolType === "Design" || editorToolType === "pencil") {
      if(activeElement.id){
        return <drawingSetting/>
      }else{
        return <Pencil_setting />;
      }
 
    }
  };

  const handleEditorSize = (sizeType) => {
    if (sizeType === "Portrait") {
      return "Portrait"
    } else if (sizeType === "Landscape") {
      return "Landscape"
    } else if (sizeType === "Square") {

      return "Square"
    } else if (sizeType === "Custom") {

      return "customratio"
    }
  }


let CSS={
  width: parseInt(fixSize.width),
  height: parseInt(fixSize.height),
  overflow: "hidden",
  background: store.drawData.bgColor,
}
if( filterdata && Object.keys(filterdata).length !=0)
{
  CSS={...CSS,
    ...filterdata.value
  }
}

  return (
  
    <>
      <Head>
        <title>{process.env.SITE_TITLE}- {templatename}</title>
      </Head>
      {check == true ? (
        <>
          <h1>Page Not found</h1>
        </>
      ) : (
        <div className="ps_img_editor_bg" style={{backgroundImage: "linear-gradient(to bottom, rgb(204 204 255 / 50%), rgb(204 204 255 / 50%)), url('/assets/images/imgeditor_bg.jpg')"}}>
          <div className="conatiner-fluid ">
            <div className="row  py-3">
              <div className="col-xl-3 col-lg-3 col-4 order-lg-1 order-1">
                <div className="ps_image_editor_heading_text">
                  <span>

                    <Link href={userData.role == "User" ? "/image_editor/image_edit" : "/admin/templates"} className="rz_addAccBtn_blk">{svg.app.backIcon} <span className="back_phon_hide">Back</span></Link>
                  </span>
                  <p className="ps_editor_tittle_name_md">{templatename}</p>
                </div>
              </div>
              <div className="col-xl-6 col-lg-5 col-12 order-lg-2 order-3">
                <p className="ps_editor_tittle_name_lg">{templatename}</p>
                <div className="ps_editor_tool_box_header">
                  <div className="ps_img_editor_main_box_tool_div">
                    <div className="ps_img_editor_tool_box ">
                      <div
                        className="ps_img_editor_div"
                      >
                        <div
                          className={`ps_img_editor_tool_item_box ${editorToolType === "Setting"
                            ? "ps_img_editor_active"
                            : ""
                            }`}
                          onClick={() => selectAccount("Setting")}
                        >

                          {svg.app.Equalizer_icon}
                          <h6 className="mr-auto">Settings</h6>
                        </div>
                        <span className="rz_tooltipEle">Settings</span>
                      </div>

                      <div className="ps_img_editor_div">
                        <div id="SelectArrow"
                          className={`ps_img_editor_tool_item_box  ${cursur=="true"
                            ? "ps_img_editor_active"
                            : ""
                            }`}
                            onClick={() =>{selectAccount("") 
                            store.updateStoreData("selectCursor", true);}}
                        >
                          <div  className="ps_img_editor_tool_svg_text">
                          {svg.app.select_icon}

                          </div>
                          
                        </div>
                        <span className="rz_tooltipEle">Select</span>
                      </div>

                      <div
                        className="ps_img_editor_div"
                     
                      >
                        <div
                          className={`ps_img_editor_tool_item_box  ${editorToolType === "Text"
                            ? "ps_img_editor_active"
                            : ""
                            }`}
                          id="TextTab"
                          onClick={() => selectAccount("Text")}
                        >
                          <div className="ps_img_editor_tool_svg_text">
                            {svg.app.editor_textT}
                            <h6 className="mr-auto ">text</h6>
                          </div>
                          
                        </div>
                        <span className="rz_tooltipEle">Text</span>
                      </div>
                      <div
                        className="ps_img_editor_div"
                      >
                        <div
                          className={`ps_img_editor_tool_item_box  ${editorToolType === "Image"
                            ? "ps_img_editor_active"
                            : ""
                            }`}
                          id="ImageTab"
                          onClick={() => selectAccount("Image")}
                        >
                          <div className="ps_img_editor_tool_svg_text">
                            {svg.app.editor_img}
                            <h6 className="mr-auto">Image</h6>
                          </div>
                         
                        </div>
                        <span className="rz_tooltipEle">Images</span>
                      </div>
                      <div
                        className="ps_img_editor_div"

                      >
                        <div
                          className={`ps_img_editor_tool_item_box  ${editorToolType === "Shape"
                            ? "ps_img_editor_active"
                            : ""
                            }`}
                          onClick={() => selectAccount("Shape")}
                        >
                          <div className="ps_img_editor_tool_svg_text">
                            {svg.app.editor_shape}
                            <h6 className="mr-auto">Shape</h6>
                          </div>
                          
                        </div>
                        <span className="rz_tooltipEle">Shapes</span>
                      </div>
                      <div className="ps_img_editor_div">
                        <div
                          className={`ps_img_editor_tool_item_box  ${editorToolType === "Filter"
                            ? "ps_img_editor_active"
                            : ""
                            }`}
                          onClick={() => selectAccount("Filter")}
                        >
                          <div className="ps_img_editor_tool_svg_text">
                            {svg.app.editor_filter}

                          </div>
                          
                        </div>
                        <span className="rz_tooltipEle">Filter</span>
                      </div>

                      <div className="ps_img_editor_div ps_editor_dropbox_option" >
                        <div
                          className={`ps_img_editor_tool_item_box  ${(editorToolType === "Drawing" || editorToolType === "pencil" || editorToolType === "Design")
                            ? "ps_img_editor_active"
                            : ""
                            }`}
                          onClick={() => selectAccount("Drawing")}
                        >
                          <div className="ps_img_editor_tool_svg_text">
                            {svg.app.editor_drawing}
                          </div>

                        </div>
                        {editorToolType === "Drawing"? <div className="ps_editor_hover_dropdown_box">
                            <div className="ps_editor_hover_dropdown"  onClick={() => {
                             store.updateStoreData("selectCursor", false);
                              selectAccount("pencil")
                              }}>{svg.app.editor_pencil}  <span className="rz_tooltipEle">Pencil</span></div>
                            <div className="ps_editor_hover_dropdown"  onClick={() =>{ 
                             store.updateStoreData("selectCursor", false);
                              selectAccount("Design")
                              }}>{svg.app.Edit_line_icon} <span className="rz_tooltipEle">Line</span></div>
                           
                          </div>:""}
                          <span className="rz_tooltipEle">Drawing</span>
                      </div>

                      <div
                        className="ps_img_editor_div"
                      >
                        {undoData.data.length > 0 ? (
                          <>
                            {(undoData.currentPostion > 1 && undoData.data[undoData.currentPostion - 1] != undefined) && (
                              <button
                                className="ps_img_editor_tool_item_box"
                                id="Delete"
                                onClick={() => {

                                  let data = { ...undoData };
                                  data.status = true;
                                  data.currentPostion = data.currentPostion - 1;
                                 
                                    store.updateStoreData("activeElement", {
                                      id: "",
                                      element: ""
                                    })
                                    store.updateStoreData("undoData", data);
                                  
                              
                                }}
                              >
                                <div className="ps_img_editor_tool_svg_text">
                                  {svg.app.Undu_btn}
                                  <span className="rz_tooltipEle">Undo</span>
                                </div>


                              </button>
                            )}
                            {(undoData.currentPostion < 10 && undoData.data[undoData.currentPostion] != undefined) && (
                              <button
                                className="ps_img_editor_tool_item_box "
                                id="duplicateIcon"
                                onClick={() => {
                                  let data = { ...undoData };
                                  data.status = true;
                                  data.currentPostion = data.currentPostion + 1;
                                  store.updateStoreData("activeElement", {
                                    id: "",
                                    element: ""
                                  })
                                  store.updateStoreData("undoData", data);

                                }}
                              >
                                <div className="ps_img_editor_tool_svg_text">
                                  {svg.app.Redu_btn}
                                  <span className="rz_tooltipEle">Redo</span>
                                </div>


                              </button>
                            )}
                          </>
                        ) : (
                          <></>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
       
              </div>
              <div className="col-xl-3 col-lg-4 col-8 order-lg-3 order-2 ">
                <div className="ps_image_editor_btn_box">
                  
                    <button id ="CreateGroup1"
                    className="rz_btn space_nowrap rz_hidebtn"
                    onClick={()=>{
                     let t1= document.getElementById("CreateGroup")
                     if(t1)
                     {
                      t1.click()
                     }
                    }}
                  >
                   Create Group
                  </button>

                  <button
                   id ="UnGroup1"
                   onClick={()=>{
                    let t1= document.getElementById("UnGroup")
                    if(t1)
                    {
                     t1.click()
                    }
                   }}
                    className="rz_btn space_nowrap rz_hidebtn"
                  >
                   UnGroup
                  </button>
                  <button
                    className="rz_btn"
                    onClick={() => {
                      store.updateStoreData("save", 1);
                    }}
                  >
                    {" "}
                    {svg.app.saveIcon} Save{" "}
                  </button>
                    {userData.role == "User" ?   <button  disabled={process.env.TYPE=="demo" ? true :false}
                    onClick={() => {
                      store.updateStoreData("save", 2);
                    }}
                    className="rz_addAccBtn_blk"
                  >
                    {" "}
                    {svg.app.downloadIcon} Download
                  </button>
                  : 
                  <button
                  onClick={() => {
                    store.updateStoreData("save", 2);
                  }}
                  className="rz_addAccBtn_blk"
                >
                  {" "}
                  {svg.app.publish_icon} Publish
                </button>}
                 
                </div>
              </div>
            </div>

            <div className="ps_image_editor_main_box">
              <div className="">
                {editorToolType && editorToolType!="Drawing" ? (
                  <div
                    className={`ps_editor_platform_bg  ${isToolSlide
                      ? "isOpenSidebarRight"
                      : " isCloseSidebarRight"
                      }`}
                  >
                    <a
                      className="ps_sidebarBtnRight"
                      onClick={(e) => mangeLayersSlideRight()}
                    >
                      {" "}
                      {isToolSlide ? <div className="ps_editor_tool_sidebar1" >{svg.app.leftArrow}</div> : <div className="ps_editor_tool_sidebar2"> Toolbar {svg.app.rightArrow}</div>}
                    </a>
                    <div className="ps_editor_platform_box">
                      <div className="ps_overflow_scroll">
                        { showEditorToolComponent()}
                  
                      </div>
                    </div>
                  </div>
                ) : (
                  ""
                )}

                {activeElement.element=="draw" ? <>
                <div
                    className={`ps_editor_platform_bg  ${isToolSlide
                      ? "isOpenSidebarRight"
                      : " isCloseSidebarRight"
                      }`}
                  >
                    <a
                      className="ps_sidebarBtnRight"
                      onClick={(e) => mangeLayersSlideRight()}
                    >
                      {" "}
                      {isToolSlide ? <div className="ps_editor_tool_sidebar1" >{svg.app.leftArrow}</div> : <div className="ps_editor_tool_sidebar2"> Toolbar {svg.app.rightArrow}</div>}
                    </a>
                    <div className="ps_editor_platform_box">
                      <div className="ps_overflow_scroll">
                       < DrawingSetting/>
                 </div>
                    </div>
                  </div>
                </> :""}
              </div>
             
              <div className=" margin-auto">
                <div className="ps_edit_toolbox_height">
                  {(activeElement.element == "image" || activeElement.element == "textbox" || activeElement.element == "draw") ? (
                    <div className="ps_img_editor_main_box_tool">
                      <Icon_tool_setting />
                    </div>
                  ) : (
                    <></>
                  )}

                </div>
                <div className="ps_canvasHolder" style={{overflow: "hidden"}}>
                {load == true ? (
                  <div
                  className={` ps_img_editor_main_box ${handleEditorSize(imageSize1)}`.concat(store.drawData.bgColor.includes("url")  ? " bgfullImage" : "")}
                    style={CSS}
                  >
                      <Canvas layout={handleEditorSize(imageSize1)} editorToolType={editorToolType}  dimension={fixSize} />
                    
                  </div>
                ) : (
                  ""
                  )}
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImgCreator;
