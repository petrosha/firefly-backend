const csv = require('csv-parser');
const fs = require('fs');
const { trimEnd } = require('lodash');
const { emitKeypressEvents } = require('readline');

//const menuDbModel=require("../models/menu_clients_db");

let systemsFileRead=(localSystems)=>{
    fs.createReadStream('./initData/systems.csv')
        .pipe(csv({
            mapValues: ({ header, index, value }) => {
                if(value==="FALSE") return false;
                if(value==="TRUE") return true;
                if(value==="0") return 0;

                if(Number(value)) return Number(value);
                return value;
            }}))
        .on('data', (row) => {
            localSystems.data.push(row);
        })
        .on('end', () => {
            localSystems.timeStamp=Date.now();
            setInterval(systemsCycleAction,1000);
            // console.log(localSystems);
        });
}

let systemsCacheInit=()=>{
    global.systems={timeStamp: undefined, data:[]}
    systemsFileRead(global.systems);
}

let systemsUsedPower=()=>{
    return global.systems.data.reduce((prev,el)=>prev+el.power*Number(el.switchedOn)*el.effectiveness,0);
}

let actionSwitchOn=(data)=>{
    let system = global.systems.data.find((el)=>el.name===data);
    if(system) {
        if(!(system.broken) && !(system.hidden)) {
            console.log("SWITCHING ON!");
            console.log("USED POWER! ",systemsUsedPower());
            if(systemsUsedPower()+system.power*system.effectiveness>0){
                system.switchedOn = true;
                return true;
            }
        };
    }
    return false;
}

let actionChangeFuel=(data)=>{
    let system = global.systems.data.find((el)=>el.name==="fuel1");
    if(system) {
        let chgData=Number(data);
        if(chgData){
            console.log("CHANGING FUEL: ",chgData);
            if(system.fuelStorage+chgData>=0 &&system.fuelStorage+chgData<=1000){
                system.fuelStorage += chgData;
                return true;           
            }
        }
    }
    return false;
}

let actionSwitchOff=(data)=>{
    let system = global.systems.data.find((el)=>el.name===data);
    if(system) {
        system.switchedOn = false;
        let tmpList=[],tmp=0;
        if(systemsUsedPower()<0){
            tmpList=global.systems.data.filter(el=>(el.switchedOn && el.power<0)).map(el=>el.name);
            tmp=Math.floor(Math.random()*tmpList.length);
            console.log("PowerOff Recursion: ",tmp," ",tmpList);
            actionSwitchOff(tmpList[tmp]);
        }
        
        return true;
    }
    return false;
}

let actionBrokenOn=(data)=>{
    let system = global.systems.data.find((el)=>el.name===data);
    if(system) {
        if(!(system.hidden)) {
            console.log("BREAKING ON!");
            actionSwitchOff(system.name);
            system.broken = true;              
            return true;
        };
    }
    return false;
}

let actionBrokenOff=(data)=>{
    let system = global.systems.data.find((el)=>el.name===data);
    if(system) {
        actionSwitchOff(system.name);
        system.broken = false;
        return true;
    }
    return false;
}

let actionHiddenOn=(data)=>{
    let system = global.systems.data.find((el)=>el.name===data);
    if(system) {
        actionSwitchOff(system.name);
        system.broken = false;
        system.hidden = true;                      
        return true;
    }
    return false;
}

let actionHiddenOff=(data)=>{
    let system = global.systems.data.find((el)=>el.name===data);
    if(system) {
        system.switchedOn = false;
        system.broken = false;
        system.hidden = false;   
        return true;
    }
    return false;
}

let systemsAction = (id, body, admin) => {
    let returnValue = false;
    switch(body.action){
    case "switchOn":
        returnValue = actionSwitchOn(body.data);
        break;
    case "switchOff":
        returnValue = actionSwitchOff(body.data);
        break;
    }

    if(admin){
        switch(body.action){
        case "brokenOn":
            returnValue = actionBrokenOn(body.data);
            break;
        case "brokenOff":
            returnValue = actionBrokenOff(body.data);
            break;
        case "hiddenOn":
            returnValue = actionHiddenOn(body.data);
            break;
        case "hiddenOff":
            returnValue = actionHiddenOff(body.data);
            break;            
        case "changeFuel":
            returnValue = actionChangeFuel(body.data);
            break;   
        }
    }

    if(returnValue) global.systems.timeStamp=Date.now();
    return returnValue;
}  

let systemsCycleAction=()=>{
    let amount = global.systems.data.filter(el=>el.fuelConsumption>0).reduce((prev,el)=>prev+el.fuelConsumption*Number(el.switchedOn),0);
    let fuel = global.systems.data.find((el)=>el.name==="fuel1").fuelStorage;
    while(fuel-amount<0){
        actionSwitchOff(global.systems.data.find((el)=>el.power*Number(el.switchedOn)>0).name);
        amount = global.systems.data.filter(el=>el.fuelConsumption>0).reduce((prev,el)=>prev+el.fuelConsumption*Number(el.switchedOn),0);
    }
    actionChangeFuel(-1*amount);
    global.systems.timeStamp=Date.now();
}


module.exports= { 
    systemsFileRead,
    systemsCacheInit,
    systemsAction
};