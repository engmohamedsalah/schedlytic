import React, { useState, useEffect } from "react";
import Router, { useRouter } from "next/router";
import { appStore } from "@/zu_store/appStore";
import svg from "../svg";
import { toast } from "react-toastify";
import {  common, setMyState } from '@/components/Common';
import { NoDataWrapper } from "@/components/Common";

const Default_color = [
  "#EF5350",
  "#EC407A",
  "#AB47BC",
  "#7E57C2",
  "#D4E157",
  "#FFEE58",
  "#FFA726",
  "#FF7043",
  "#8D6E63",
  "#78909C",
];

let Edit_setting = (props) => {
  const router = useRouter();
  const [edit, setedit] = useState(false)
  const [name, setname] = useState(props.name)
  const [grad, setgrad] = useState({
    primary: "",
    secondary: "",
    angle: 0
  });



  const allLayout = {
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

  const [size, setsize] = useState({
    layout: "",
    height: "",
    width: ""
  })
  useEffect(() => {
    if (props.layout == "Custom") {
      setsize({
        layout: props.layout,
        height: props.size.height,
        width: props.size.width,
      })
    } else {
      setsize({
        layout: props.layout,
      })
    }
  }, [])

  let [state, setQuery] = useState({
    imagesList: [],
    isLoading: false,
    keyword: '',
    page: 1,
    totalRecords: 0,
  });

  const [ToggleState, setToggleState] = useState(1);
  let store = appStore((state) => state);
  let drawData = appStore((state) => state.drawData);
  const toggleTab = (index) => {
    setToggleState(index);
  };
  const changeValue = async (key, value) => {
    let data = {
      ...drawData,
      [key]: value,
    };
    await store.updateStoreData("drawData", data);
  };

  const getActiveClass = (index, className) =>
    ToggleState === index ? className : "";

  useEffect(() => {
    if (ToggleState == 3) {
      let color = drawData.bgColor.split(",");
      if (color.length) {
        const regex = /linear-gradient\((\d+deg)/;
        const match = drawData.bgColor.match(regex);
        setgrad({
          primary: color[1],
          secondary: color[2].replace(")",""),
          angle: 0
        });
      }
    }
  }, [ToggleState]);


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

  const renameTemplate = (e) => {
    if (name.trim() == "") {
      toast.error("Title is require.")
      return
    }
    common.getAPI(
      {
        method: "PUT",
        url: "templates",
        data: {
          target: router.query.id,
          data : {title: name},
          isLoader: true,
        },
      },
      async (resp) => {

        if (resp) {
          props.setname(name)
          setedit(false)
        }
      }
    );

  }

  const changeLayout = () => {
    if (size.height == "") {
      toast.error("Height is required.")
      return
    }
    if (size.width == "") {
      toast.error("Width is required.")
      return
    }
    if (size.height < 100) {
      toast.error("Height must be greater than 100px.")
      return
    }

    if (size.height > 2000) {
      toast.error("Height must be less than 2000px.")
      return
    }


    if (size.width == "") {
      toast.error("Width is required.")
      return
    }

    if (size.width < 100) {
      toast.error("Width must be greater than 100px .")
      return
    }

    if (size.width > 1120) {
      toast.error("Width must be less than 1120px .")
      return
    }
    props.setsize({
      layout: "Custom",
      height: size.height,
      width: size.width
    })

  }

  return (
    <>
      <div className="p-25">
        <div className="ps_img_editor_side_layers">
          <h6> Settings</h6>
        </div>

        <div className=" pb-3">
          <label className="ps_image_editor_label pb-1"> Title </label>
          <div className="">
            <div className="ewp_input d-flex gap-2  w-100">
              <div className="ps_editor_setting_input">
                {edit ? <input value={name} type="text" placeholder="Enter title" onChange={(e) => {
                  setname(e.target.value)

                }}></input> : <>{name}</>}
              </div>

              {edit ?
                <button onClick={(e) => {
                  renameTemplate(e)

                }} className="ps_image_creator_linear_btn "> Update</button>
                : <button onClick={() => {
                  setedit(true)
                }} className="ps_image_creator_linear_btn ">edit </button>}
            </div>
          </div>
        </div>
        <div>
          <div className=" pb-3">
            <label className="ps_image_editor_label pb-1"> Resize </label>
            <div className="">
              <div className="ps_editor_chose_size_box">
                <div className={"ps_editor_square".concat(size.layout == "Square" ? " ps_editor_square_active " : "")} onClick={() => {
                  let fs = allLayout["Square"]
                  props.setsize({
                    ...fs,
                    layout: "Square"
                  })
                  setsize({
                    ...size,
                    layout: "Square"
                  })
                }}>
                  {svg.app.Square} <span>Square</span>
                </div>
                <div className={"ps_editor_square".concat(size.layout == "Portrait" ? " ps_editor_square_active " : "")} onClick={() => {
                  let fs = allLayout["Portrait"]
                  props.setsize({
                    ...fs,
                    layout: "Portrait"
                  })
                  setsize({
                    ...size,
                    layout: "Portrait"
                  })
                }}>
                  {svg.app.Portrate} <span>Portrait</span>
                </div>
                <div className={"ps_editor_square".concat(size.layout == "Landscape" ? " ps_editor_square_active " : "")} onClick={() => {
                  let fs = allLayout["Landscape"]
                  props.setsize({
                    ...fs,
                    layout: "Landscape"
                  })
                  setsize({
                    ...size,
                    layout: "Landscape"
                  })
                }}>
                  {svg.app.LandScape} <span>Landscape</span>
                </div>
                <div className={"ps_editor_square".concat(size.layout == "Custom" ? " ps_editor_square_active " : "")} onClick={() => {
                  setsize({
                    ...size,
                    layout: "Custom"
                  })
                }}>
                  {svg.app.Custom} <span>Custom</span>
                </div>
              </div>
            </div>
          </div>
          {size.layout == "Custom" ? <>
            <div className="ps_input_wrapper_div_custom_size py-2">
              <label className="ps_image_editor_label pb-1">
                Enter Custom Size{" "}
              </label>
              <div className="ps_input_wrapper">
                <div className="ewp_input ewp_input_size">
                  <input
                    type="number"
                    value={size.width}
                    placeholder="Enter width"
                    onChange={(e) => {
                      setsize({
                        ...size,
                        width: e.target.value
                      })
                    }}
                  ></input>
                </div>
                <div className="ewp_input ewp_input_size">
                  <input
                    type="number"
                    value={size.height}
                    placeholder="Enter height"
                    onChange={(e) => {
                      setsize({
                        ...size,
                        height: e.target.value
                      })
                    }}
                  ></input>
                </div>
              </div>
            </div>
            <button className="ps_image_creator_linear_btn mt-1" onClick={() => {
              changeLayout()
            }}> Apply </button>
          </> : <></>}

        </div>
        <div className="ms-0">

          <button className="ps_image_creator_linear_btn mt-2 " onClick={() => {
            changeValue(
              "bgColor",
              `linear-gradient(0deg,#FFFFFF ,#FFFFFF)`
            );
          }}> Remove Background</button>
        </div>



        <div className="pt-3">
          <label className="ps_image_editor_label pb-1">
            Select Background{" "}
          </label>
          <ul className="tab-list">
            <li
              className={`tabs ${getActiveClass(1, "active-tabs")}`}
              onClick={() => toggleTab(1)}
            >
              BG Color
            </li>
            <li
              className={`tabs ${getActiveClass(2, "active-tabs")}`}
              onClick={() => toggleTab(2)}
            >
              BG Image
            </li>
            <li
              className={`tabs ${getActiveClass(3, "active-tabs")}`}
              onClick={() => {
                if(drawData.bgColor.includes("url")){
                  changeValue(
                    "bgColor",
                    `linear-gradient(0deg,#FFFFFF ,#FFFFFF)`
                  );
                }
             
                toggleTab(3)
              }}
            >
              BG Gredient
            </li>
          </ul>
          <div className="content-container pt-2">
            <div className={`content ${getActiveClass(1, "active-content")}`}>
              <div>
                <div className="ps_input_wrapper_div">
                  <label className="ps_image_editor_label">
                    {" "}
                    Background color{" "}
                  </label>
                  <div className="ps_color_picker_wrapper">
                    <div className="ps_color_picker_toggle">
                      <input
                        type="color"
                        value={drawData?.bgColor?.split(",")[1]?.trim()}
                        onChange={(e) => {
                          changeValue(
                            "bgColor",
                            `linear-gradient(0deg, ${e.target.value}, ${e.target.value})`
                          );
                        }}
                      />
                      <span>{drawData?.bgColor.split(",")[1]}</span>
                    
                    </div>
                  </div>
                </div>
                <div className="ps_image_editor py-2">
                  <label className="ps_image_editor_label pb-2">
                    Default Color{" "}
                  </label>
                  <div className="ps_image_editor_def_color">
                    {Default_color.map((val, i) => (
                      <div
                        key={i + 1}
                        className="ps_image_editor_def_color_box"
                        onClick={() => {
                          changeValue(
                            "bgColor",
                            `linear-gradient(0deg, ${val}, ${val})`
                          );
                        }}
                        style={{ background: `${val}` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className={`content ${getActiveClass(2, "active-content")}`}>
              <div className='m-auto'>
                <div className="ps_editor_setting_tabs ">
                  {state.imagesList.map((image, i) => {
                    let url = process.env.S3_PATH + image.path
                    return (<div key={i} className="ps_editor_setting_tabs_img">
                      <img onClick={() => {
                        changeValue(
                          "bgColor",
                          `url(${url})`
                        );
                      }} src={url} loading="lazy" />
                    </div>)
                  })}

                  <div className='m-auto'>
                    <div className='rz_gridInnerBox ps_img_not_found' >
                      {state.isLoading &&
                        <NoDataWrapper
                          isLoading={state.isLoading}
                          blockCount="6"
                          height={"220"}
                          width="220"
                          className="rz_gridCol p-2"
                          section="media"
                          dataCount={state.imagesList.length}
                          title={'Images not found.'}
                        />}
                    </div>
                    {!state.isLoading &&
                      <NoDataWrapper
                        isLoading={state.isLoading}
                        blockCount="6"
                        height={"220"}
                        width="220"
                        className="rz_gridCol p-2"
                        section="media"
                        dataCount={state.imagesList.length}
                        title={'Images not found.'}
                      />
                    }
                  </div>

                </div>
                {
                  state.imagesList.length < state.totalRecords && !state.isLoading ?
                    <button onClick={() => {
                      fileterImages("loadMore");
                    }} className="ps_image_creator_blk_btn  mt-4 mx-auto">
                      {" "}
                      Load More {svg.app.loadmore}
                    </button>
                    : <></>}

              
                               
              </div>
            </div>
            <div className={`content ${getActiveClass(3, "active-content")}`}>
              <div className="w-100">
                <div className="ps_input_wrapper_div py-2">
                  <label className="ps_image_editor_label">Degree </label>

                  <div className="image_editor_range" item>

                    <div className="range">
                      <input
                        type="range"

                        min="0"
                        max="360"
                        onChange={(e) => {
                          setgrad({
                            angle: e.target.value,
                            ...grad
                          });
                          if (drawData.bgColor.includes("url")) {
                            return
                          }
                          changeValue(
                            "bgColor",
                            `linear-gradient(${e.target.value}deg, ${grad?.primary ? grad?.primary : ""},  ${grad?.secondary ? grad?.secondary : ""})`
                          );
                        }}
                  
                      />
                    </div>
                
                  </div>
                </div>
                <div className="ps_input_wrapper_div pb-3">
                  <label className="ps_image_editor_label">
                    {" "}
                    Gredient Color 1
                  </label>
                  <div className="ps_color_picker_wrapper">
                    <div className="ps_color_picker_toggle">
                      <input
                        type="color"
                        value={grad?.primary?.trim()}
                        onChange={(e) => {
                          setgrad({
                            primary: e.target.value,
                            secondary: grad?.secondary,
                            angle: grad?.angle
                          });
                          changeValue("bgColor", `linear-gradient(${grad?.angle}, ${e.target.value}, ${grad?.secondary ? grad?.secondary : "white"}`);

                        }}
                      />
                      <span>{grad.primary}</span>
                    </div>
                  </div>
                </div>
                <div className="ps_input_wrapper_div pb-3">
                  <label className="ps_image_editor_label">
                    {" "}
                    Gredient Color 2
                  </label>
                  <div className="ps_color_picker_wrapper">
                    <div className="ps_color_picker_toggle">
                      <input
                        type="color"
                        value={grad.secondary?.trim()}
                        onChange={(e) => {
                          setgrad({
                            primary: grad?.primary,
                            secondary: e.target.value,
                            angle: grad?.angle
                          });
                          changeValue("bgColor", `linear-gradient(${grad?.angle}, ${grad?.primary ? grad?.primary : "white"}, ${e.target.value})`);

                        }}
                      />
                      <span>{grad.secondary}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Edit_setting;
