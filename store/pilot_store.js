// const csv = require('csv-parser');
// const fs = require('fs');
const mathLib = require('./mathHelpers');
const systemsData = require('./systems_store.js');
const astroObjects = require('./astro_objects.js');
const uuid = require('uuid');
const sounds = require('./sounds_store');

let pilotData={
    ship:{
        sysX:0, //coords angle and speed according to Solar System 
        sysY:0,
        sysAngle:0,
        sysSpeed:0,
        shiftX:0,
        shiftY:0,
        message:"",
        taskMistake:0,
        taskFuelCost:50
    },
    astro:{
        current:"Персефона",
        course:"",
        engine:false,
        ready:false,
        voyage:false,
        timeLeft:0,
        objects: astroObjects
    },
    program:{
        selected:undefined,
        target:undefined,
        timeStamp:Date.now(),
        type:"",
        goes:false,
        steps:6,
        curveParams:{},
    },
    radar:[
        {
            id: 10,
            name:"Персефона",
            type: "planet",
            timeStamp:0,
            eX: 450,
            eY: 0,
            eA: 180,
            speed: 5,
            size: 150,
            initialPause:0,
            transponder:true, 
        },
        {
            id: 1,
            name:"astro2",
            type: "ship",
            timeStamp:0,
            eX: -450,
            eY: 0,
            eA: 135,
            speed: 1,
            size: 25,
            initialPause:0
        }
    ],
    transponder: [
        {
            name:"astro1",
            type: "planet",
            astroX: 10,
            astroY: 20,
            trX:0,
            trY:0
        },
        {
            name:"transp1",
            type: "ship",
            trX: 10,
            trY: 20,
            speed:10,
        }
    ],
    systems: global.systems.data
}

let pilotCacheInit=()=>{
    global.pilot={
        timeStamp: Date.now(), 
        data: pilotData
    }
}

let pilotRadarMoveAction=()=>{
    let radar=global.pilot.data.radar;
    radar.forEach(el=>{
        if(el.speed) {
            if(el.initialPause>0) el.initialPause--;
            else {
                [el.eX, el.eY] = mathLib.vectorEndCoords(el.eX,el.eY,el.eA,el.speed);
                el.timeStamp=Date.now();
            }
        }
    })
}

let pilotRadarAttackAction=(data)=>{
    let ship = global.pilot.data.radar.find(el=>el.id===data);
    if(!ship) return false;
    
    let tmpAngle=mathLib.myRangeRandom(mathLib.degToRange(mathLib.vectorAngle(0,0,ship.eX,ship.eY)+180),15);
    console.log("Attack angle: ",tmpAngle);

    pilotProgramStopAction();

    ship.eA=tmpAngle;
    ship.speed=100;

    global.pilot.data.ship.message = "Вас атакуют!";
    sounds.soundsPlayListAdd("blaster",false);
    
    return true;
}

let pilotRadarEvadeAction=(data)=>{
    let ship = global.pilot.data.radar.find(el=>el.id===data);
    if(!ship) return false;
    
    let tmpAngle=mathLib.myRangeRandom(mathLib.degToRange(mathLib.vectorAngle(0,0,ship.eX,ship.eY)),15);
    console.log("Evade angle: ",tmpAngle);

    pilotProgramStopAction();

    ship.eA=tmpAngle;
    ship.speed=50;

    global.pilot.data.ship.message = "Цель убегает!";
    
    return true;
}




let pilotProgramStartAction=(data)=>{
    global.pilot.data.program=Object.assign({},data);
    global.pilot.data.ship.message="";
    console.log("Program Start: ", global.pilot.data.program);
    return true;
}

let pilotProgramStopAction=()=>{

    let radar=global.pilot.data.radar;
    let ship=global.pilot.data.ship;
    let program=global.pilot.data.program;

    if(!program.goes) return false;

    pilotProgramResetAction();

    radar.forEach(el=>{
        el.eX=el.eX-ship.shiftX;
        el.eY=el.eY-ship.shiftY;
        el.timeStamp=Date.now();    
    });
    ship.shiftX=0;
    ship.shiftY=0;

    return true;
}

let pilotProgramResetAction=()=>{
    let program=global.pilot.data.program;

    program.selected=undefined;
    program.target=undefined;
    program.timeStamp=Date.now();
    program.type="";
    program.goes=false;
    program.steps=6;
    program.curveParams={};
    
    return true;
}

let pilotRadarImpactCheck=()=>{

    let radar=global.pilot.data.radar;
    let ship=global.pilot.data.ship;
    // let systems=global.pilot.data.systems;

    for(let i = 0;i<radar.length;i++){
        let el=radar[i];    
        if(mathLib.vectorLength(0,0,el.eX,el.eY)<el.size){
            let kickA=Math.round(360*Math.random());
            let kickR=Math.round(50+Number(el.size)+100*Math.random());
            let kickV=Math.round(50*Math.random());
            console.log(kickA,kickR,kickV);
            [el.eX,el.eY] = mathLib.vectorEndCoords(0,0,kickA,kickR);
            el.eA=kickA;
            el.speed = kickV;
            ship.sysAngle=kickA+180;
            ship.message="Столкновение!";
            pilotProgramResetAction();
            systemsData.actionBreakMultiple(2,3);
        }
    }    
}

let pilotProgramEnding=()=>{
    let {ship,radar,program,astro} = global.pilot.data;
    let tmpAim=radar.find(el=>el.id === program.selected);

    let generalTaskMistake=ship.taskMistake/5;
    ship.taskMistake=0;
    console.log("final quality",generalTaskMistake);

    let fuelConsumed= ship.taskFuelCost*generalTaskMistake;
    systemsData.actionChangeFuel(-fuelConsumed);
    let tmpAboutFuelMessage = `Топливо -${Math.round(fuelConsumed)}.`;
    
    if(generalTaskMistake > 2) systemsData.actionBreakMultiple(1,1);

    switch(program.type){
    case "attack":
        ship.message=tmpAboutFuelMessage+" Вектор Атаки!"     
        break;
    case "evade":
        ship.message=tmpAboutFuelMessage+" Успешное уклонение."
        break;
    case "dock":
        ship.message=tmpAboutFuelMessage+" Стыковка! Можно открыть люк."     
        tmpAim.speed = 0;
        break;
    case "orbit":
        ship.message=tmpAboutFuelMessage+" Орбиты синхронизованы."
        tmpAim.speed = 0;
        break;
    case "course":
        tmpAim.speed=100;
        tmpAim.eA=mathLib.degToRange(mathLib.vectorAngle(0,0,tmpAim.eX,tmpAim.eY)+180)
        ship.message=tmpAboutFuelMessage+" Курс взят!"     
        break;
    case "astro":
        astro.course=program.selected;
        ship.message=tmpAboutFuelMessage+" Включите маршевый двигатель!";
        astro.ready = true;
        break;
    }
}

let pilotProgramAction=()=>{
    let ship=global.pilot.data.ship;
    let program=global.pilot.data.program;
    let shiftCoords=program.curveParams.coords;

    program.steps--;

    ship.shiftX=shiftCoords[5-program.steps].x;
    ship.shiftY=shiftCoords[5-program.steps].y;
    
    console.log("ProgramAction: ",program.steps);

    ship.sysAngle=shiftCoords[5-program.steps].a; 

    program.timeStamp = Date.now();
    if(program.steps===0) {        
        pilotProgramEnding();
        pilotProgramStopAction();
    }
    return;
}

let pilotRadarRemoveAction=(name)=>{
    let radar=global.pilot.data.radar;
    let idx=radar.findIndex(el=>el.name === name);
    if(idx<0) return false;
    radar.splice(idx,1);
    return true;
}

let pilotRadarAddAction=(data)=>{
    let radar=global.pilot.data.radar;
    radar.push(data);
    sounds.soundsPlayListAdd("radarNewObject",false);
    return true;
}

let pilotRadarGenerateObjectAction=(distance=450,astro={},transponder=false)=>{
    distance = Number(distance) ? Number(distance) : 450;
    let [x,y]=mathLib.vectorEndCoords(0,0,Math.round(360*Math.random()),distance);

    const objectSizes = {
        "planet":150,
        "asteroid": 75,
        "astercloud": 100,
        "gasstation": 50,
        "ship": 25,
        "unknown" : 20
    }
    return {
        id: uuid.v4(),
        name:astro.name ? astro.name: "unknown",
        type: astro.type? astro.type: "unknown",
        timeStamp:Date.now(),
        eX: x,
        eY: y,
        eA: Math.round(360*Math.random()),
        speed: Math.round(30*Math.random()),
        size: mathLib.myRangeRandom(objectSizes[astro.type] ? objectSizes[astro.type] : 25 , objectSizes[astro.type] ? objectSizes[astro.type]/3 : 25/2),
        initialPause:0,
        transponder:transponder, 
    }
}


let pilotEraseMessageAction=()=>{
    global.pilot.data.ship.message="";
    return true;
}

let pilotEngineStartAction=()=>{
    let astro=global.pilot.data.astro;
    if(!astro.ready) return false;
    astro.engine=true;
    return true;
}

let pilotAstroTimeAddAction=(data)=>{
    let astro=global.pilot.data.astro;
    if(!Number(data)) return false;
    let left=Math.round(Number(data)/10);
    if(left>0) astro.timeLeft=left;
    return true;
}

let pilotAstroSetSystem=(data)=>{
    let astro=global.pilot.data.astro;
    
    let current=astro.objects.find(el=>el.name===data);
    if(!current) return false;

    astro.current=current.name;
    astro.course="";
    astro.engine=false;
    astro.ready=false;
    astro.voyage=false;
    astro.timeLeft=0;

    global.pilot.data.radar=[];
    pilotRadarAddAction( 
        pilotRadarGenerateObjectAction(
            450,
            astro.objects.find(el=>el.name===astro.current),true)
    )    
    return true;
}



let pilotSetTaskMistakeAction=(data)=>{
    global.pilot.data.ship.taskMistake+=Number(data);
    console.log("Mistake: ",global.pilot.data.ship.taskMistake);
    return true;
}

let pilotRadarCleanFarObjectsAction=()=>{
    let radar=global.pilot.data.radar;
    radar.forEach((el,idx)=>{
        // console.log("Coords: ", el.eX, " ", el.eY);
        if(!el.transponder){
            if(mathLib.vectorLength(0,0,el.eX, el.eY)>=555){
                radar.splice(idx,1);  
            }
        }    
    })
    return true;
}

let pilotAction = (id, body, admin) => {
    let returnValue = false;
    switch(body.action){
    case "programStart":
        returnValue = pilotProgramStartAction(body.data);
        break;
    case "programStop":
        returnValue = pilotProgramStopAction(body.data);
        break;
    case "eraseMessage":
        returnValue = pilotEraseMessageAction(body.data);
        break;
    case "engineStart":
        returnValue = pilotEngineStartAction(body.data);
        break;
    case "setTaskMistake":
        returnValue = pilotSetTaskMistakeAction(body.data);
        break;
    }

    if(admin){
        switch(body.action){
        case "radarRemoveEl":
            returnValue = pilotRadarRemoveAction(body.data);
            break; 
        case "radarAddEl":
            returnValue = pilotRadarAddAction(body.data);
            break;
        case "radarAttack":
            returnValue = pilotRadarAttackAction(body.data);
            break;  
        case "radarEvade":
            returnValue = pilotRadarEvadeAction(body.data);
            break;       
        case "astroTimeAdd":
            returnValue = pilotAstroTimeAddAction(body.data);
            break;          
        case "astroSetSytem":
            returnValue = pilotAstroSetSystem(body.data);
            break; 
        }
    }
    
    if(returnValue) global.pilot.timeStamp=Date.now();
    return returnValue;
} 

let pilotAstroCycleCheck = () =>{
    let {ship,astro,systems} = global.pilot.data;
    
    if(!astro.course) return;
    if(!systems.find(el=>el.name==="mainJet1").switchedOn) astro.engine=false;

    if(astro.ready){ //есть готовность, то-есть отработан начальный маневр
        let current = astro.objects.find(el=>el.name===astro.current);

        if(astro.voyage){ //сейчас в гипере
            if(astro.engine){ //двигатель работает
                astro.timeLeft--;
                let stringTimeLeft=astro.timeLeft<60 ? "Прибытие через: "+astro.timeLeft*10+" cек." : "Расчет времени прибытия..." 
                ship.message="Курс "+astro.course+". " + stringTimeLeft;
                if(astro.timeLeft === 0){ //если долетели
                    astro.current=astro.course;
                    astro.course="";
                    astro.engine=false;
                    astro.ready=false;
                    astro.voyage=false;
                    astro.timeLeft=0;
                    ship.message="Прибыли";

                    pilotRadarAddAction( 
                        pilotRadarGenerateObjectAction(
                            450,
                            astro.objects.find(el=>el.name===astro.current),true)
                    )    
                }
            }
            else { //если двигатель выключился посреди нигде
                astro.current="Неизвестно";
                astro.course="";
                astro.engine=false;
                astro.ready=false;
                astro.voyage=false;
                astro.timeLeft=0;
                ship.message="Внеплановая остановка";
            }
        }
        else {
            if(astro.engine){//уходим в гипер
                let astroCourseDir=current.directions.find(el=>el.name===astro.course);
                let astroCourseObj=astro.objects.find(el=>el.name===astro.course);
                let astroBackCourseDir=astroCourseObj.directions.find(el=>el.name===current.name);
                
                if(Number(astroCourseDir.fuel) > Number(systems.find(el=>el.name==="fuel1").fuelStorage)){
                    astro.course="";
                    astro.engine=false;
                    astro.ready=false;
                    astro.voyage=false;
                    astro.timeLeft=0;
                    ship.message="Разгон прерван. Недостаточно топлива.";
                    return;
                }

                astro.voyage=true;
                astro.timeLeft=1800;
                ship.message="Курс "+astro.course+". Время прибытия: Рассчитывается...";
                
                let unknownSys=astro.objects.find(el=>el.name==="Неизвестно");
                unknownSys.directions=[astroCourseDir];
                if(astroBackCourseDir) unknownSys.directions.push(astroBackCourseDir);
                console.log("UnknownSys: ",unknownSys );

                systemsData.actionChangeFuel(-astroCourseDir.fuel); 
                global.pilot.data.radar=[];

            }
            else {
                ship.message="Разгон прерван";
                astro.ready=false;
                astro.course="";
            }
        }
    }
}

let pilotCycleAction=()=>{
    if(global.pilot.data.program.goes){
        pilotProgramAction();
    } else {
        pilotAstroCycleCheck();
        pilotRadarMoveAction();
        pilotRadarImpactCheck();
        pilotRadarCleanFarObjectsAction();}
    global.pilot.timeStamp=Date.now();
}

module.exports= { 
    pilotCacheInit,
    pilotCycleAction,
    pilotAction
};