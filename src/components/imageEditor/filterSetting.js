import React, { useState } from "react";

import { appStore } from "@/zu_store/appStore";

let Filter_setting = () => {
  let store = appStore((state) => state);
  const [accordianToggle, setAccordianToggle] = useState({
    isFeatures: false,
    isBWTones: false,
    isWarmerTones: false,
    isAnalogTones: false,
    isColorPinhole: false,
    isCinematic: false,
    isMotionColor: false,
  });
  const [filter, setfilter] = useState();
  const filtersImage = {
    Grayscale: {
      filter: "grayscale(50)",
      value: false,
    },
    Sepia: {
      filter: "sepia(50)",
      value: false,
    },
    Invert: {
      filter: "invert(.5)",
    },
    Brightness: {
      filter: "brightness(.5)",
    },
    Saturate: {
      filter: "saturate(50)",
    },
    Blur: {
      filter: "blur(50)",
    },
    Opacity: {
      filter: " opacity(.5)",
    },
    Hue_Rotate: {
      filter: "hue-rotate(50) ",
    },
  };

  let setvalueData = (key, value) => {
    const filtersImage = {
      Grayscale: {
        filter: `grayscale(${value})`,
      },
      Invert: {
        filter: `invert(${value / 100})`,
      },
      Blur: {
        filter: `blur(${value}px)`,
      },
      Brightness: {
        filter: `brightness(${value / 100})`,
      },
      Saturate: {
        filter: `saturate(${value})`,
      },
      Sepia: {
        filter: `sepia(${value})`,
      },
      Opacity: {
        filter: ` opacity(${value / 100})`,
      },
      Hue_Rotate: {
        filter: `hue-rotate(${value * 3}deg)`,
      },
    };
    return filtersImage[key];
  };



  let updateImage = (key, value) => {
    store.updateStoreData(key, value);
  };

  let selected = store.filterCanvas?.name;
  return (
    <>
      <div className="p-25 ">
        <div className="">
          <div className="ps_img_editor_side_layers">
            <h6 className="">Image Filter </h6>
          </div>
          <div className="ps_editor_filter_box">
            <button
              onClick={() => {
                setfilter("");
                updateImage("filterCanvas", {});
              }}
            >
              {"Orignal"}
            </button>

            {Object.keys(filtersImage).map((data, i) => {
              return (
                <div
                  key={i + 1}
                  className={"ps_editor_accordion".concat(
                    selected == data ? " ps_editor_accordion_active" : ""
                  )}
                >
                  <label
                    onClick={() => {
                      setfilter(data);
                      updateImage("filterCanvas", {
                        name: data,
                        value: setvalueData(data, 50),
                      });
                    }}
                  >
                    {data}
                  </label>
                  {filter == data && filtersImage[data]?.value != false ? (
                    <>
                      <div className="px-2 mt-3">
                        <input
                          onChange={(e) => {
                            updateImage("filterCanvas", {
                              name: data,
                              value: setvalueData(data, e.target.value),
                            });
                          }}
                          type="range"
                          min={1}
                          max={100}
                          style={{ backgroundSize: "20% 100%" }}
                        ></input>
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
export default Filter_setting;
