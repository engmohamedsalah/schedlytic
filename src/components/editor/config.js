let defaultText = {
    type : 'textbox',
    text : 'Your Text',
    start : 0,
    end : 3,
    textAlign : 'center',
    fontWeight : "",
    fontStyle  : "",
    underline : false,
    linethrough : false,
    fill : '#000000',
    backgroundColor : '',
    fontFamily : 'Outfit',
    fontSize : 52,
    opacity : 1,
    height : 150,
    width : 350,
    borderStyle : '',
    originX: 'center',
    originY: 'center',
    angle : 0,
    rx: 0,
    ry : 0,
    top : 0,
    left : 0,
    visible: true,
    animeEffect: {
        intro : "none",
        outro : "none",
        duration : 1,
    },
    _id: '',
};
 
let defaultImage = {
    type : 'image',
    start : 0,
    end : 30,
    opacity : 1,
    height : 550,
    width : 550,
    top : 0,
    left : 0
};
 
let defaultAudio = {
    type : 'audio',
    start : 0,
    end : 30,
    volume : 100
};


let defaultBg = {
    type : 'bg',
    opacity : 1
};

let solidBg = {
    ...defaultBg,
    bgType : 'solid',
    color : '#f7f7f7',
}

let gradientBg = {
    ...defaultBg,
    bgType : 'gradient',
    color : '#f7f7f7',
    color2 : '#000000',
    angle : 0,
    
    x1: 0,
    y1: 0,
    x2: 1080,
    y2: 1920,
    gradientType : 'horijontal',
    colorStops:[ 
        {offset : 0, color: '#f7f7f7'},
        {offset : 1, color2: '#000000'}
    ]
    
}



let canvasSize = {
    width: 1080,
    height: 1920,
};

export {
    defaultText,
    defaultImage,
    defaultBg,
    solidBg,
    gradientBg,
    defaultAudio,
    canvasSize
} 
 