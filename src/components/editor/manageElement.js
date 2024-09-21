let editorData, updateState;
import {defaultText, defaultImage , defaultBg, solidBg, gradientBg, defaultAudio} from "@/components/editor/config";

let initManageElement = (eData, updState) => {
    editorData = eData;
    updateState = updState;
}

let addNewElement = ({type = null , src , bgType , color , meta,data,elementtype1} = p) => {
    let newElementData = false;
    if(type){
        
        if(type == 'textbox'){
            newElementData = {
                ...defaultText,
               ...data
            };
        }else if(type == 'image'){
            let currentLogo = []
            if(currentLogo.length){
                if(currentLogo[0].src == src){
                    return;
                }
                editorData[currentLogo[0].index].src = src;
                editorData[currentLogo[0].index].status = 'src';
            }else{
                let ext =  src.split(".").slice(-1)[0];
                newElementData = { 
                    ...defaultImage,
                    src,
                    meta
                };
                if(elementtype1)
                {
                    newElementData.elementtype1=elementtype1
                }
              if (ext.toLowerCase() == "svg") {
                newElementData.stype="image"
              }
              
            }

            
        }else if(type == 'background'){
            let currentBg = editorData.filter((d , i) => {
                if(d && (d.type || '') == 'bg'){
                    d.index = i;
                    return d;
                }
            }) || [], 
            isNewBg = false; 
            if(currentBg.length){
                if(currentBg[0].bgType == bgType){
                    if(['image', 'video'].includes(bgType)){
                        editorData[currentBg[0].index].src = src;
                        editorData[currentBg[0].index].status = 'src';
                        if(bgType=="video"){
                            editorData[currentBg[0].index].meta = meta;
                        }
                    }else{
                        editorData[currentBg[0].index][color[0]] = color[1];
                        editorData[currentBg[0].index].status = color[0];
                    }

                    
                }else{
                    editorData.splice(currentBg[0].index, 1);
                    isNewBg = true;
                }
            }
            
            if(!currentBg.length || isNewBg){
                let defaultData = {
                    image : {
                        ...defaultBg,
                        src,
                        bgType : 'image'
                    },
                    video : {
                        ...defaultBg,
                        src,
                        bgType : 'video'
                    },
                    solid : solidBg,
                    gradient : gradientBg
                }
                newElementData = { 
                    ...(defaultData[bgType]),
                    meta
                };
            }
        }
    }
    
    if(newElementData){
        newElementData.id = "id" + Math.random().toString(16).slice(2);
        newElementData.status = 'add';
        editorData.push(newElementData);
    }
    
    updateState('editorData' , editorData);
}

let removeElement = (index) => {
    editorData.splice(index, 1);
    updateState('editorData' ,editorData);
}

let updateElementData = ({index , key, value} = p) => {
   let dat=editorData.findIndex((d)=>d.id==index);
    editorData[dat][key] = value;
    editorData[dat].status = key;
    updateState('editorData' ,editorData);
}

export {
    initManageElement,
    addNewElement,
    removeElement,
    updateElementData
} 
 