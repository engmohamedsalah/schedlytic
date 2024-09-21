import React, { useState, useEffect } from "react";
import svg from "../svg";
import { appStore } from "@/zu_store/appStore";
import {
  initManageElement,
  updateElementData,
  addNewElement,
} from "@/components/editor/manageElement";


import { common, setMyState } from "../Common";
import WebFont from 'webfontloader';


let Text_setting = () => {
  let activeElement = appStore((state) => state.activeElement);
  let editorData = appStore((state) => state.editorData);
  let textData = editorData.find((d1) => (d1.id == activeElement?.id) && d1.type == "textbox");
  let store = appStore((state) => state);
  initManageElement(editorData, store.updateStoreData);


  let updateText = (key, value) => {

    let mainIndex = textData.id;

    updateElementData({
      index: mainIndex,
      key,
      value,
    });
  };


  const textarr = [
    {
      text: "text",
      fontSize: "42px"
    },
    {
      text: "text2",
      fontSize: "34px"
    },
    {
      text: "text3",
      fontSize: "28px"
    },
    {
      text: "text4",
      fontSize: "22px"
    },
    {
      text: "text5",
      fontSize: "16px"
    },
  ];

  const [page, setpage] = useState(1)
  const [loader, setLoader] = useState(false)

  const options =
    [
      { id: 1, value: "User 1", label: "Montserrat", fontFamily: 'Montserrat', },
      { id: 2, value: "User 2", label: "Inter", fontFamily: 'Inter', },
      { id: 3, value: "User 3", label: "Actor", fontFamily: 'Actor', },
      { id: 4, value: "User 4", label: "Adamina", fontFamily: 'Adamina', },
      { id: 5, value: "User 5", label: "Aladin", fontFamily: 'Aladin', },
      { id: 6, value: "User 6", label: "Alatsi", fontFamily: 'Alatsi', },
      { id: 7, value: "User 7", label: "Aldrich", fontFamily: 'Aldrich', },
      { id: 8, value: "User 8", label: "Antonio", fontFamily: 'Antonio', },
      { id: 9, value: "User 9", label: "Bayon", fontFamily: 'Bayon', },
      { id: 10, value: "User 10", label: "Basic", fontFamily: 'Basic', },
    ];
  const [state, setQuery] = useState({
    fontFamily: [],
    fontName: '',

  })

  let fetchData = () => {
    let elem = document.getElementById("scroller")
    let targetScrollHeight = elem.scrollHeight - elem.clientHeight;
    if (targetScrollHeight == elem.scrollTop) {
      let p = page + 1;
      setpage(p)
      fetchFonts(true, p)
    }
  }
  useEffect(() => {
    fetchFonts();
  }, []);

  const getFontList = () => {
    common.getAPI({
      method: 'GET',
      url: "fonts",
      data: {
        page: 1,
        limit: 30,
      },
    }, (resp) => {
      setSelectedFontFamily(resp.data[0])
      setMyState(setQuery, {
        ...state,
        fontFamily: resp.data
      })
    }
    )
  }

  const fetchFonts = async (load = false, page, search = false) => {
    try {
      setLoader(true)
      common.getAPI({
        method: 'GET',
        url: "fonts",
        data: {
          page: page,
          limit: 30,
          keyword: state.fontName
        },
      }, (resp) => {
        if (resp.data.length > 0) {
          let d1 = search == true ? [] : state.fontFamily, load = []
          resp.data.map((d2) => {
            load.push(d2.family)
            d1.push({ value: d2.family, label: d2.family })
          })

          WebFont.load({
            google: {
              families: load,
            },
            active: (data) => {
              setLoader(false)
              setMyState(setQuery, {
                ...state,
                fontFamily: d1
              })
            },
          });
        }
        else {
          setLoader(false)
        }


      }, (d) => {
        setMyState(setQuery, { reelsLoading: false })
      });
    }
    catch (error) {

    }
  };
  return (
    <>
      <div className="p-25 ">
        {!textData ? (
          <div className="ps_textHeadings">
            <div className="ps_img_editor_side_layers">
              <h6>Heading</h6>
            </div>
            
            {textarr.map((data, i) => {
              return (
                <div key={i} className="ps_image_editor_heading_div">
                  <p
                    style={{ fontSize: `${data.fontSize}` }}
                    onClick={() =>
                      addNewElement({
                        type: "textbox",
                        data: {
                          text: data.text,
                          fontSize: (parseInt(data.fontSize) * 3)
                        },
                      })
                    }
                  >
                    {data.text}
                  </p>
                </div>
              );
            })}
          </div>

        ) : (
          <>
            <div className="ps_img_editor_side_layers">
              <h6>Text Settings</h6>
            </div>

            <div className=" pb-3">
              <label className="ps_image_editor_label pb-2">Font Family</label>
              <div className='rz_col_12'>
                <div className="rz_custom_form rz_customLoader mt-0">
                  <input type='text' readOnly value={textData?.fontFamily} style={{ fontFamily: `${textData?.fontFamily}` }} className='rz_customInput' />
                  <div className="rz_fontList_dv" id="scroller" onScroll={(e) => fetchData(e)}>

                    <div className='rz_searchBox w-100'>
                      <div className='rz_custom_form'>
                        <input type='search' placeholder='Search' className='rz_customInput'
                          value={state.fontName}
                          onChange={(e) => setMyState(setQuery, { fontName: e.target.value })}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.keyCode === 13 || e.which === 13) {
                              let p1 = 1
                              setpage(1)
                              fetchFonts(false, 1, true)
                            }
                          }}
                        />

                        <span className='rz_inputIcon'>{svg.app.searchIcon}</span>
                      </div>
                    </div>
                    {state.fontFamily.length > 0 && state.fontFamily.map((fontFamily, i) => {
                      return (
                        <div key={i + 1} className="rz_fontList_items">
                          <a
                            onClick={() => {
                              WebFont.load({
                                google: {
                                  families: [fontFamily.value],
                                },
                                active: () => {
                                  updateText('fontFamily', fontFamily.value)
                                },
                              });

                            }
                            }
                            style={{
                              fontFamily: `'${fontFamily?.value}'`,
                            }}
                          >
                            {fontFamily.value}
                          </a>
                        </div>
                      );
                    })}
                  </div>
                  {loader == true ?
                    <div className="spinner-border-box">
                      Loading <span className="sr-only spinner-border"></span>
                    </div>
                    : ""}

                </div>
              </div>
            </div>

            <div className=" ps_image_editor_text_tool py-2">
              <div className="ps_input_wrapper">
                <label className="ps_image_editor_label">Size </label>
                <div className="ewp_input ewp_input_size">
                  <input type="text" value={textData.fontSize} placeholder={textData.fontSize} onChange={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, '')
                    updateText("fontSize", e.target.value)
                  }}></input>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center">

                <div className='editor_checkbox'>
                  <input className="custem_checkbox" id="btn-underline" type="checkbox" name="same" />
                  <label htmlFor="btn-underline" onClick={() => {
                    updateText(
                      "underline",
                      !textData.linethrough
                    )
                  }}>
                    <span className='text-decoration-underline'>U</span>
                  </label>
                </div>

                <div className='editor_checkbox'>
                  <input className="custem_checkbox" id="btn-bold" type="checkbox" name="same" />
                  <label htmlFor="btn-bold" onClick={() => {
                    updateText(
                      "fontWeight",
                      textData.fontWeight == "" ? "bold" : ""
                    );
                  }}>
                    <span className='fw-bold'>B</span>
                  </label>
                </div>

                <div className='editor_checkbox'>
                  <input className="custem_checkbox" id="btn-italic" type="checkbox" name="same" />
                  <label htmlFor="btn-italic" onClick={() => {
                    updateText(
                      "fontStyle",
                      textData.fontStyle == "" ? "italic" : ""
                    );
                  }} >
                    <span className='fst-italic'>I</span>
                  </label>
                </div>

              </div>
            </div>

            <div className="d-flex justify-content-between px_image_editor_main_box py-2">
              <div className="d-flex justify-content-between align-items-center">
                <label className="ps_image_editor_label">Text Alignment </label>

                <div className='editor_checkbox'>
                  <input className="custem_checkbox" id="text-align-left" type="radio" name="Text_align" />
                  <label htmlFor="text-align-left" onClick={() => {
                    updateText("textAlign", "left");
                  }}>
                    <span className='text-decoration-underline'>{svg.app.text_align_left}</span>
                  </label>
                </div>
                <div className='editor_checkbox'>
                  <input className="custem_checkbox" id="text-align-center" type="radio" name="Text_align" />
                  <label htmlFor="text-align-center" onClick={() => {
                    updateText("textAlign", "center");
                  }}>
                    <span className='fw-bold'>{svg.app.text_align_center}</span>
                  </label>
                </div>
                <div className='editor_checkbox'>
                  <input className="custem_checkbox" id="text-align-right" type="radio" name="Text_align" />
                  <label htmlFor="text-align-right" onClick={() => {
                    updateText("textAlign", "right");
                  }}>
                    <span className='fst-italic'>{svg.app.text_align_right}</span>
                  </label>
                </div>

              </div>
            </div>

            <div className="ps_input_wrapper py-2">
              <label className="ps_image_editor_label">Text Color </label>
              <div className="ps_color_picker_wrapper">
                <div className="ps_color_picker_toggle">
                  <toolcool-color-picker color="#e76ff1" id="color-picker-1"></toolcool-color-picker>

                  <input type="color" value={textData?.fill} onChange={(e) => {
                    updateText("fill", e.target.value);
                  }} />
                  <span>{textData?.fill}</span>
                </div>

              </div>
            </div>
            <div className="ps_input_wrapper py-2">
              <label className="ps_image_editor_label">Text BG Color </label>
              <div className="ps_color_picker_wrapper">
                <div className="ps_color_picker_toggle">
                  <input type="color" value={textData?.backgroundColor} onChange={(e) => {
                    updateText("backgroundColor", e.target.value);
                  }} />
                  <span>{textData?.backgroundColor}</span>
                </div>
              </div>

            </div>

          </>
        )}
      </div>
    </>
  );
};
export default Text_setting;
