//Express for users webclient
const usersRouter = require("express").Router();
const { request } = require("express");
// const Systems = require("../models/systems_db.js");
let {menuCacheClientAdd, menuCacheAction} = require("../store/menu_store.js");
let systems = require("../store/systems_store.js");
let menuObj=global.menus;

usersRouter.get("/", (request, response) => response.status(404).send('no ID received'));
usersRouter.post("/", (request, response) => response.status(404).send('no ID received'));

usersRouter.get("/:id", (request, response) => {
    let menuClientId=request.params.id;

    if(!(menuClientId in menuObj.clientsCache)){
        menuCacheClientAdd(menuClientId);
    }
    response.
        status(200).
        json(getReply(menuClientId));   
});

usersRouter.post("/:id", (request, response) => {
    console.log("POST ID: " + request.params.id + " BODY: " + JSON.stringify(request.body));
    if(!(request.params.id in menuObj.clientsCache)) 
        response.status(404).send('Wrong ID');
    else
    if(!(request.body.menu) || !(request.body.action) || !(request.body.menu)) 
        response.status(400).send('Wrong Post format.')
    else {
        let reply = postActionAndReply(request.params.id,request.body) ? "ok" : "error";
        console.log("POST ID: " + request.params.id + " REPLY: " + reply);
        response.status(200).send(reply);
    }

});

function getReply(id){
    let returnData={
        id: id,
        user:{
            timeStamp:menuObj.clientsCache[id].userTimeStamp,
            name: menuObj.clientsCache[id].name
        },
        menus:{
            timeStamp: menuObj.clientsCache[id].menuTimeStamp,
            names: menuObj.menuNames.filter((el) => !(el.admin)),
            selected:menuObj.clientsCache[id].menuList    
        }, 
        data:{ 
        }
    };

    menuObj.clientsCache[id].menuList.forEach((el)=>{
        if(global[el]) if(global[el].timeStamp && !(global[el].admin)) returnData.data[el]=global[el];
    })

    return returnData; 
}

function postActionAndReply(id, body, admin = false){
    switch( body.menu){
    case "menu":
        return menuCacheAction(id, body, admin);
    case "systems":
        return systems.systemsAction(id, body, admin);
    default:
        return false;
    }  
}

module.exports = usersRouter;