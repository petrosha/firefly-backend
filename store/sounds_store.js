const soundsList={
    "systemFailure":{name:"./sounds/alarm.mp3",time:45},
    "radarNewObject":{name:"./sounds/radar.mp3",time:35},
    "systemFailure2":{name:"./sounds/alarm_long.mp3",time:240},
    "blaster":{name:"./sounds/blaster.mp3",time:5},
}

let soundsCacheInit=()=>{
    global.sounds={timeStamp: 1, soundsList:soundsList, status:true, soundsPlayList:[]}
}

let soundsPlayListAdd=(name="",loop=false)=>{
    if(global.sounds.soundsPlayList.find(el=>el.name===name)) return false;
    if(!global.sounds.soundsList[name]) return false;
    global.sounds.soundsPlayList.push({name:name,loop:loop});
    global.sounds.timeStamp=Date.now();
    return true;
}

let soundsPlayListDel=(name="")=>{
    let idx=global.sounds.soundsPlayList.findIndex(el=>el.name===name)   
    if(idx<0) return false;
    global.sounds.soundsPlayList.splice(idx,1);
    global.sounds.timeStamp=Date.now();
    return true;
}

let soundsAction = (id, body, admin) => {
    let returnValue = false;
    switch(body.action){
    case "soundsPlayListDel":
        returnValue = soundsPlayListDel(body.data);
        break;
    }

    if(admin){
        switch(body.action){
        }
    }

    if(returnValue) global.sounds.timeStamp=Date.now();
    return returnValue;
}  

module.exports= { 
    soundsCacheInit,
    soundsAction,
    soundsPlayListAdd,
    soundsPlayListDel,
};