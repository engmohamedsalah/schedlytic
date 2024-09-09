import React, { useState, useEffect, useRef } from 'react'
import MyModal from '../common/MyModal';
import svg from '../svg';
import { appStore } from "@/zu_store/appStore";
import {
    updateElementData,
} from "@/components/editor/manageElement";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { common } from '@/components/Common';
import rgbHex from 'rgb-hex';

let canvas = null;
let Image_edit_box = () => {
    let mainCanvas = useRef();
    let [currentcolor,setcolor]=useState("")
    const cropperRef = useRef(null);
    const [currentfilter, setfilter] = useState("")
    let [svgFills, setSvgFills] = useState([]);
    let [scal, setscal] = useState({})
    const [svgs, setsvg] = useState("")
    let store = appStore((state) => state);
    let editorData = appStore((state) => state.editorData);
    let activeElement = appStore((state) => state.activeElement);
    let ImageData = editorData.find((d1) => (d1.id == activeElement?.id && (d1.type == "image" || d1.stype == "image")));
    let imagetype;
    if (ImageData) {
        imagetype = ImageData.src?.split(".").at(-1)
    }
    useEffect(()=>{
        setfilter("")
    },[activeElement.id])

    let updateImage = (key, value) => {
        let mainIndex = ImageData.id;
        updateElementData({
            index: mainIndex,
            key,
            value,
        });
    };
    const [accordianToggle, setAccordianToggle] = useState({
        isFeatures: false,
        isBWTones: false,
        isWarmerTones: false,
        isAnalogTones: false,
        isColorPinhole: false,
        isCinematic: false,
        isMotionColor: false,
        crop: false,
        cropurl: "",
    });
    let filtersImage = {
        "Grayscale": false,
        "Sepia": false,
        "Brightness": true,
        "Contrast": true,
        "HueRotation": true,
        "Invert": false,
        "Saturation": true,
        "Noise": true,
        "Blur": true,
        "Pixelate": true,
    }

    const handleToggle = (acc) => {
        if (acc === "Features") {
            accordianToggle.isFeatures = !accordianToggle?.isFeatures
            setAccordianToggle({ ...accordianToggle })
        } else if (acc === "BWTones") {
            accordianToggle.isBWTones = !accordianToggle?.isBWTones
            setAccordianToggle({ ...accordianToggle })
        } else if (acc === "WarmerTones") {
            accordianToggle.isWarmerTones = !accordianToggle?.isWarmerTones
            setAccordianToggle({ ...accordianToggle })
        } else if (acc === "AnalogTones") {
            accordianToggle.isAnalogTones = !accordianToggle?.isAnalogTones
            setAccordianToggle({ ...accordianToggle })
        } else if (acc === "ColorPinhole") {
            accordianToggle.isColorPinhole = !accordianToggle?.isColorPinhole
            setAccordianToggle({ ...accordianToggle })
        } else if (acc === "Cinematic") {
            accordianToggle.isCinematic = !accordianToggle?.isCinematic
            setAccordianToggle({ ...accordianToggle })
        } else if (acc === "MotionColor") {
            accordianToggle.isMotionColor = !accordianToggle?.isMotionColor
            setAccordianToggle({ ...accordianToggle })
        }
    }


    const openCropModel = () => {
        setAccordianToggle({ ...accordianToggle, crop: true });
    };

    const cropImage = (url) => {
        var createElem = document.createElement(`img`);
        createElem.src = url;
        createElem.id = "456";
        createElem.onload = (e) => {
            let data = new FormData();
            var mediaMeta = {
                width: createElem.width,
                height: createElem.height,
            };
            data.append("meta", JSON.stringify(mediaMeta));
            let blob = dataURItoBlob(url)
            let ext = url.split(".").slice
            let name = "Image" + Math.random().toString(16).slice(2)
            data.append('file', blob, name + ".png")

            common.getAPI({
                method: 'POST',
                url: 'media?mediaType=image',
                data: data,
                isFormData: true,
            }, (resp) => {
                let url = process.env.S3_PATH + resp.data
                updateImage("src", url)
            });
        }

    }


    function dataURItoBlob(dataURI) {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    }

    function removeBg() {
        if (ImageData) {
            common.getAPI({
                method: 'POST',
                url: 'image-process',
                data: {
                    "src": ImageData.src
                },
            }, async (resp) => {
                let index = editorData.findIndex((d1) => d1.id == ImageData.id)
                editorData[index].status = "src"
                editorData[index].src = process.env.S3_PATH + resp.data.path
                await store.updateStoreData("editorData", editorData);
            });
        }
    }


    const changecolor = () => {
        setsvg(ImageData.id)
        setTimeout(() => {
            canvas = new fabric.Canvas(mainCanvas.current);
            canvas.selection = false;
            canvas.stateful = true;
            loadSvgInEditor();
        }, 1000);

    }
    function rgbToHex(r, g, b) {
        return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
    }
    const hexToRgb=(hex)=> {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      }
      
    const loadSvgInEditor = async () => {

        let svgUrl = ImageData?.src ? ImageData.src  : ImageData.nsrc;
        setSvgFills({});
        let svgText = await fetch(svgUrl)
            .then(r => r.text())
            .then(text => { return text })
            .catch();

        let _this = this;
        fabric.loadSVGFromString(svgText, function (objects, options) {
            if (!objects) {
                return;
            }
            let ay = {}
            for (let i = 0; i < objects.length; i++) {

                if (typeof objects[i].fill == "string") {
                    if (ay[objects[i].fill]) {
                        ay[objects[i].fill].push(objects[i]);
                    } else {
                        ay[objects[i].fill] = [objects[i]];
                    }
                }
                else {
                    objects[i].fill.colorStops.map((data) => {
                        let a = data.color.split("(")[1].split(")")[0];
                        a = a.split(",");
                        let hex = rgbToHex(a[0], a[1], a[2])
                        if (ay[hex]) {
                            ay[hex].push(objects[i]);
                        } else {
                            ay[hex] = [objects[i]];
                        }
                    })
                }
            }
            setSvgFills(ay);
            let obj = fabric.util.groupSVGElements(objects, options);
            obj.set({
                lockMovementX: true,
                lockMovementY: true,
            });

            setscal({
                x: obj.scaleX,
                y: obj.scaleY,
            })

            if (obj.width > obj.height) {
                obj.scaleToWidth(canvas.width);
            }
            else {
                obj.scaleToHeight(canvas.height);
            }
            canvas.add(obj)
            canvas.item(0).hasControls = canvas.item(0).hasBorders = false;
            canvas.setActiveObject(obj);
            canvas.requestRenderAll();

        }, function () { }, { crossOrigin: 'anonymous' });

    }

    const svgColorBoxes = () => {
        let colorsBoxes = []
        if (svgs == "") {
            return (<p>Please select the object.</p>);
        }
   
        Object.keys(svgFills).map(async (obj, index) => {
            let fillColor = obj;
            let hexColor = "";
            if (/^#(?:[0-9a-fA-F]{3}){1,2}$/.test(fillColor)) {
                hexColor = fillColor
            } else {
                fillColor = fillColor.replace('rgb', '').replace('(', '').replace(')', '').split(',');
                hexColor = "#" + rgbHex(parseInt(fillColor[0]), parseInt(fillColor[1]), parseInt(fillColor[2]));
            }

            colorsBoxes.push(
                <input
                    key={index}
                    className='svgColorPicker'
                    type='color'
                    data-index={index}
                    defaultValue={hexColor}
                    onChange={e =>
                        colorPickerChange(e, index, obj)
                    }
                />
            );
        })
        return colorsBoxes;
    }

    const colorPickerChange = (e, index, obj) => {
        e.preventDefault();
        let color = e.target.value;
        if (index != null && canvas.getActiveObject() && canvas.getActiveObject()._objects && canvas.getActiveObject()._objects.length) {
            let activeObj = canvas.getActiveObject()._objects;
            let dana = Object.keys(svgFills)[index]
            let d1 = svgFills[dana]
            for (let i = 0; i < d1.length; i++) {
                let obj = d1[i];
                if (typeof obj.fill == "string") {

                    obj.set({
                        fill: color
                    });
                }
                else {

                    let d1 = hexToRgb(dana)
                    let changeColor = obj.fill.colorStops.findIndex((data => data.color == `rgb(${d1.r},${d1.g},${d1.b})`))
                    let d12 = { ...obj.fill }
                    let c1 = hexToRgb(color)
                    d12.colorStops.map((data, index) => {
                        if (changeColor != -1 ? index == changeColor : currentcolor == d12.colorStops[index].color) {
                            data = { ...data, color: `rgb(${c1.r},${c1.g},${c1.b})` }
                            d12.colorStops[index].color = `rgb(${c1.r},${c1.g},${c1.b})`
                            setcolor(`rgb(${c1.r},${c1.g},${c1.b})`)
                        }
                        return data
                    })
                    obj.set('fill', new fabric.Gradient(d12));
                    canvas.renderAll();

                }
            }


        } else {
            let obj = canvas.getActiveObject();
            if (obj) {
                obj.set({
                    fill: color
                });
            }
        }
        canvas.renderAll();

    }


    const updateSvgColor = e => {
        e.preventDefault();

        let object = canvas.getObjects();
        let obj = canvas.getObjects()[0];
        obj.scaleX = scal.x;
        obj.scaleY = scal.y;
        canvas.renderAll();
        let svg = object[0].toSVG();
        let path = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
        <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="${obj.width}" height="${obj.height}" viewBox="0 0 ${obj.width} ${obj.height}" xml:space="preserve">
                <desc>Created with Fabric.js 4.6.0</desc>
                <defs>
                </defs>
                ${svg}
            </svg>`
        let svgblob = new Blob([path], { type: 'image/svg+xml' })
        var createElem = document.createElement(`img`);
        createElem.src = URL.createObjectURL(svgblob);
        createElem.id = "456";
        createElem.onload = (e) => {
            let data = new FormData();
            var mediaMeta = {
                width: createElem.width,
                height: createElem.height,
            };
            canvas.clear();

            data.append('file', svgblob, 'svg-edit.svg');
            data.append('meta', JSON.stringify(mediaMeta));

            common.getAPI({
                method: 'POST',
                url: 'media?mediaType=image',
                data: data,
                isFormData: true,
            }, async (resp) => {
                if (resp.data) {
                    let url = process.env.S3_PATH + resp.data
                    updateImage("src", url)
                    setsvg("")
                }
            });
        }


    }
    return (
        <>
            <div className='p-25 pt-0'>
                <div className='ps_img_editor_side_layers'>
                    <h6 className=''>Edit Image </h6>
                </div>

                <div className='ps_image_creator_blk_box '>
                  
                {
                (ImageData?.stype !="image") &&  
                    <div><button className='ps_image_creator_blk_btn ' id="text-align-left" onClick={() => {
                        openCropModel()
                    }}> {svg.app.cropIcon} Crop</button></div>}
                   
                    {ImageData?.stype =="image" ?
                        <div className=''><button className='ps_image_creator_blk_btn ' onClick={() => {
                            changecolor()
                        }}>{svg.app.removeBg} Change Color</button></div> :
                      ""
                        }
                </div>
            </div>
            {
                ( ImageData?.stype !="image") &&    <div className=' p-25 pt-0'>

                 <div className='ps_img_editor_side_layers'>
                     <h6 className=''>Image Filter </h6>
                 </div>
                 <div className='ps_editor_filter_box '>
                     <button onClick={() => {
                          setfilter("")
                         updateImage("filter", "")
                     }}>{"Orignal"}</button>
 
                     {Object.keys(filtersImage).map((data, i) => {
                         return <div key={i + 1} className={'ps_editor_accordion'.concat(currentfilter==data ? " ps_editor_accordion_active" :"")}>
                             <label onClick={() => {
                                 setfilter(data)
                                 updateImage("filter", {
                                     name: data,
                                     value: 50
                                 })
                             }}>{data}</label>
                             {filtersImage[data] == true && currentfilter == data ?
                                 <>
                                     <div className='px-2 mt-3'>
                                         <div className='d-flex justify-content-between'>
                                         </div>
                                         <input onChange={(e) => {
                                             updateImage("filter", {
                                                 name: data,
                                                 value: e.target.value
                                             })
                                         }} type="range" min={1} max={100} ></input>
                                     </div>
 
                                 </>
                                 :
                                 <></>}
                         </div>
 
                     })}
 
                 </div>
 
             </div>
            }
         
            <MyModal
                shown={accordianToggle.crop}
                close={() => {
                    setAccordianToggle({
                        ...accordianToggle,
                        crop: false,
                    })
                }}
            >
                <div className='p-5'>
                    <Cropper
                        src={ImageData?.src}
                        className='ps_crop_box'
                        initialAspectRatio={16 / 9}
                        guides={false}
                        ref={cropperRef}
                    />
                    <div className='d-flex justify-content-center pt-3'><button className="rz_btn" onClick={() => {
                        const cropper = cropperRef.current?.cropper;
                        cropImage(cropper.getCroppedCanvas().toDataURL())
                    }}>Crop</button>
                    </div>
                </div>

            </MyModal>


            <MyModal
                shown={svgs == "" ? false : true}
                close={() => {
                    setsvg("")
                }}
            >
                <div className='ps_edit_svg_modal'>
                    <canvas id="maincanvas" ref={mainCanvas}  ></canvas>
                    <div className='ps_editor_svg_color_change'>
                        {Object.keys(svgFills).length ? svgColorBoxes() : ""}
                    </div>
                    <div className='d-flex justify-content-center '><button className="rz_btn" onClick={(e) => { updateSvgColor(e)  }}>Update</button></div>
                </div>

            </MyModal>
        </>

    )
}
export default Image_edit_box