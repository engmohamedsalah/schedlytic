import React, { useState, useEffect } from "react";

const Canvas = dynamic(
  () => import("../editor/index"),
  {
    ssr: false, 
  }
);

import dynamic from "next/dynamic";
import { appStore } from "@/zu_store/appStore";
import { useRouter } from "next/router";
import { common } from "@/components/Common";
let ImgCreator = () => {
  const router = useRouter();
  let store = appStore((state) => state);
  let filterdata = appStore(state => state.filterCanvas);
  let editorData = appStore((state) => state.editorData);
  editorData = editorData.filter(
    (d1) => d1.type == "text" || d1.type == "image"
  );


  const [load, setload] = useState(false);
  const [check, setcheck] = useState(false);
  const [fixSize, setSize] = useState({});
  const [imageSize1, setImageSize1] = useState("");
  const [bgColor , setbgColor] =useState("")

  const size = {
    Square: {
      width: " 650px",
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

  useEffect(() => {
    if (router.query.id) {
      getTemplatedata();
    }
    return () => {

    };
  }, [router.query.id]);

  const getTemplatedata = async () => {
    common.getAPI(
      {
        method: "GET",
        url: "templates",
        data: {
          target: router.query.id,
          isLoader: true,
          action : "noauth"
        },
      },
      async (resp) => {
        setbgColor(resp.data.bgColor)
        if (resp.data) {
          let siz = resp.data.layout;
          setImageSize1(resp.data.layout)
          let d1 = size[siz];
          if (!d1) {
            setSize(resp.data.dimenstions);
          } else {
            setSize(d1);
          }
       
          await store.updateStoreData("filterCanvas", resp.data.filter);
          await store.updateStoreData(
            "editorData",
            resp.data.data == undefined
              ? []
              : resp.data.data.objects == undefined
                ? []
                : resp.data.data.objects
          );

          setload(true);
        } else {
          setcheck(true);
        }

       
      }
    );
  };
  

  let CSS={
    width: parseInt(fixSize.width),
    height: parseInt(fixSize.height),
    overflow: "hidden",
    background:bgColor,
  }
  if( filterdata && Object.keys(filterdata).length !=0)
  {
    CSS={...CSS,
      ...filterdata.value
    }
  }

  return (
    <>
      {check == true ? (
        <>
          <h1>Page Not found</h1>
        </>
      ) : (
        <div className="ps_img_editor_main_box" style={{overflow: "hidden"}}>
          <div className="conatiner-fluid " style={CSS}>     
                  {load == true ? (
                      <Canvas layout={handleEditorSize(imageSize1)} dimension={fixSize} />
                  ) : (
                    ""
                  )}
            </div>
          </div>
      )}
    </>
  );
};

export default ImgCreator;
