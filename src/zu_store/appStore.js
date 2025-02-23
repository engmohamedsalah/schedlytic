import { create } from 'zustand';
import {persist, createJSONStorage, devtools} from 'zustand/middleware';

let editorStore = (set, get) => ({
  drawData: { type: "pencil", size: 15, flow: 5, color: "#fffff",opacity : 100,status : "",bgColor:"linear-gradient(0deg,#FFFFFF ,#FFFFFF)"},
  editorData: [],
  filterCanvas :{},
  activetab: "pencil",
  duration: 0,
  categoriesData: [],
  userData: {},
  postData: {
    step: false,
    singlePost : {},
    multiPost : []
  },
  multiPostData: [],
  calendarDate : "",
  selectCursor : false,
  updateStoreData: async (key, data) => {
    try{
    set({ [key]: data });
    }
    catch(e){
    }
  },
  updateEditorData: async (key, data) => {
    set({
      "undoData" : {
        status : false,
        currentPostion : 0,
        data :[]
      },
     "activetab": "pencil",
    "editorData": data,
    "activeElement": {
      id : "",
      element : ""
    }
  });
    
  },
  myVideo: [],
  activeElement :{
    id : "",
    element : ""
  },
  undoData : {
    status : false,
    currentPostion : 0,
    data :[]
  },

  layerManagement  :{
    status : false ,
    start : "",
    end : "",
  },

  updateElement  : {
    status : false ,
    action : ""
  },
  save : false,

  logout :async (key, data) => {
    set({
      "undoData" : {
        status : false,
        currentPostion : 0,
        data :[]
      },
     "activetab": "pencil",
    "activeElement": {
      id : "",
      element : ""
    },
    'userData': {},
    'categoriesData': {},
    'editorData': [],
    'postData':{},
    'multiPostData': []
  });
    
  }

});

editorStore = persist(editorStore, { 
    name: 'editor-storage', 
    storage: createJSONStorage(() => localStorage) 
});

export const appStore = create(editorStore);