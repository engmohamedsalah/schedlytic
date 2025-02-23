
import {NoDataWrapper, common , setMyState} from '@/components/Common'; 
import { toast } from "react-toastify";


let UploadMedia = ({id , mediaType ,elementType, onUpload} = props) => {
    let acceptObj = {
        image : process.env.ALLOW_IMAGE,
        video : process.env.ALLOW_VIDEO,
        audio : process.env.ALLOW_AUDIO,
    };

    let dataURItoBlob = (dataURI) => {
        let byteString = atob(dataURI.split(",")[1]);
        let mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
        let ab = new ArrayBuffer(byteString.length);
        let ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        let blob = new Blob([ab], { type: mimeString });
        return blob;
    };

    let getFileName = (filename) => {
        return filename.replace(/\.[^/.]+$/, "");
    }

    let processVideo = (url, progress = 15) => {
        return new Promise((resolve, reject) => {
            let v = document.createElement("video");
            v.src = url;
            v.muted = true;
            let flag = false;
            let duration = 0;
            v.onloadedmetadata = () => {
                duration = v.duration;
                let fifteenPercentOfDuration = (duration * progress) / 100;
                v.currentTime = parseInt(fifteenPercentOfDuration.toFixed(3));
            };
            v.oncanplay = async () => {
                if (flag === false) {
                    flag = true;
                    return;
                }
                let thumbCanvas = document.createElement("canvas");
                thumbCanvas.width = v.videoWidth;
                thumbCanvas.height = v.videoHeight;
                let thumbCtx = thumbCanvas.getContext("2d");
                thumbCtx.drawImage(
                    v,
                    0,
                    0,
                    thumbCanvas.width,
                    thumbCanvas.height
                );
                let thumbBlob = dataURItoBlob(thumbCanvas.toDataURL());
                let thumbUrl = URL.createObjectURL(thumbBlob);
                resolve({ thumbBlob, thumbUrl });
            };
        });
    };

    let checkMedia = (elements , index = 0) => { 
        manageMedia({
            elements , index
        }, (frmData) => { 

            common.getAPI({
                method : 'POST',
                url : 'media?mediaType='+mediaType+ (elementType=="effect" ? "&type=effect" : ""),
                data : frmData,
                isFormData : true, 
            } , (resp) => {
                onUpload();
            });
        });
    }

    let manageMedia = ({elements , index} = params , cb) => { 

        if (!elements.target || !elements.target.files) {
            toast.error(`Please choose a file to continue.`);
            return;
        }

        let selectedFile = elements.target.files[index ? index : 0];
        let selFileType = selectedFile.type;
        let selFileDetails = selFileType.split("/");
        let selFileExt = "." + selectedFile.name.split(".").reverse()[0].toLowerCase();

        let acceptAry = elements.target.accept.replace(new RegExp(" ", "g"), "").split(",");	

        let acceptFileTypeAry = [];
        let acceptFileAry = [];
        acceptAry.map((d, i) => {
            let fd = d.split("/");
            acceptFileTypeAry.push(fd[0]);
            acceptFileAry.push(fd[1]);
        });

        if (!acceptAry.includes(selFileExt)) {
            toast.error( `Only ${ acceptAry.join(", ") + (acceptFileTypeAry.length == 1 ? " file is " : " files are ") } allowed.`);
        } else if (selectedFile) {
            let data = new FormData();
            let fr = new FileReader();

            if (selFileType.split("audio").length > 1) {
                data.append("file", selectedFile, selectedFile.name);
                var createElem = document.createElement(`audio`);
                createElem.preload = "metadata";

                createElem.onloadedmetadata = function () {
                    window.URL.revokeObjectURL(createElem.src);
                    var mediaMeta = {
                        duration: createElem.duration,
                    };
                    data.append("meta", JSON.stringify(mediaMeta));
                    cb(data);
                };
                createElem.src = URL.createObjectURL(selectedFile);
                
            } else if ( selFileType.split("video").length > 1 || selFileType.split("image").length > 1 ) {
                fr.onloadend = async (e) => {
                    e.currentTarget.value = "";

                    let name = selectedFile.name;
                    name = name.replace(/\s/g, "-");
                    let thumbName = getFileName(name) + `-thumb.png`;
                    data.append("file", selectedFile, name);

                    if (selFileType.split("video").length > 1) {
                        let videoUrl = URL.createObjectURL(
                            dataURItoBlob(e.target.result)
                        );

                        if (selFileDetails[1] != "quicktime") {
                            let { thumbBlob, thumbUrl } = await processVideo(
                                videoUrl
                            );
                            data.append("thumb", thumbBlob, thumbName);

                            var createElem = document.createElement(`video`);
                            createElem.preload = "metadata";

                            createElem.onloadedmetadata = function () {
                                window.URL.revokeObjectURL(createElem.src);
                                var mediaMeta = {
                                    duration: createElem.duration,
                                    width: createElem.videoWidth,
                                    height: createElem.videoHeight,
                                };

                                data.append("meta", JSON.stringify(mediaMeta));

                                cb(data);
                            };
                            createElem.src = URL.createObjectURL(selectedFile);
                        } else {
                            cb(data);
                        }
                    } else {
                        var createElem = document.createElement(`img`);
                        createElem.src = URL.createObjectURL(selectedFile);
                        createElem.onload = (e) => {
                            var mediaMeta = {
                                duration: createElem.duration,
                                width: createElem.width,
                                height: createElem.height,
                            };
                            data.append("meta", JSON.stringify(mediaMeta));

                            cb(data);
                        };
                    }
                };
                fr.readAsDataURL(selectedFile);
            } else if (selFileType == "application/pdf") {
                data.append("file", selectedFile, selectedFile.name);
                cb(data);
            } else {
                toast.error(`Selected file not allowed.`);
            }
        } else {
            toast.error(`Please choose a file.`);
        }
    } 

    return (
        <> 
            <input type='file'  className='rz_customFile' id={id} accept={acceptObj[mediaType]} onChange={(e) => checkMedia(e)}/>
        </>
    )
}

export default UploadMedia;