//const menuDbModel=require("../models/menu_clients_db");

let menuNames=[
    {
        name: "users",
        admin:true,
        hidden:false
    },
    {
        name: "systems",
        admin:false,
        hidden:false
    },
    {
        name: "news",
        admin:false,
        hidden:false
    }

]

// different with user
let menuCacheAdminClientAdd=(id) => {
    let localObj = global;
    
    let arr=Object.values(localObj.menus.clientsCache);
    console.log(arr);
    let nameIndex=0;
    
    while(arr.find((el)=>el.name === nameIndex) !== undefined) nameIndex++;

    console.log("Name: "+nameIndex)

    localObj.menus.clientsCache[id]={
        userTimeStamp: Date.now(),
        menuTimeStamp:Date.now(),
        name:nameIndex,
        admin:true,
        menuList: [...menuNames.map(el=>el.name)]
    }

    localObj.users.timeStamp=localObj.menus.clientsCache[id].userTimeStamp;

    return true; 
}

let menuCacheClientAdd=(id) => {
    let localObj = global;
    
    let arr=Object.values(localObj.menus.clientsCache);
    console.log(arr);
    let nameIndex=0;
    
    while(arr.find((el)=>el.name === nameIndex) !== undefined) nameIndex++;

    console.log("Name: "+nameIndex)

    localObj.menus.clientsCache[id]={
        userTimeStamp: Date.now(),
        menuTimeStamp:Date.now(),
        admin:false,
        name:nameIndex,
        menuList: []
    }

    localObj.users.timeStamp=localObj.menus.clientsCache[id].userTimeStamp;

    return true; 
}


let menuCacheClientDel=(id) => {
    let localObj = global;
    delete localObj.menus.clientsCache[id]
}

let menuCacheAction = (id, body, admin) => {
    if(body.action === "set_menus") { 
        return menuCacheClientSetMenus(id,body.data);
    }

    if(!admin){

    }

    return false;
}  

let menuCacheClientSetMenus=(id, menuList) => {
    let localObj = global;

    if(! Array.isArray(menuList)) return false;
    let tmp;
    for(let i=0; i<menuList.length;i++){
        tmp=localObj.menus.menuNames.find((el) => menuList[i] === el.name);
        if(!tmp) return false;
        if(tmp.admin) return false;
    }

    localObj.menus.clientsCache[id].menuList=[...menuList];
    localObj.menus.clientsCache[id].menuTimeStamp = Date.now();
    return true; 
}

let menuCacheInit = () => { 
    let localObj=global;

    localObj.menus={
        menuNames:[...menuNames],
        clientsCache:{}
    };

    localObj.users={
        timeStamp:0,
        list: localObj.menus.clientsCache
    }
    // console.log("MENUS: ",JSON.stringify(localObj.menus));
}

module.exports= { 
    menuCacheInit,
    menuCacheClientAdd,
    menuCacheAdminClientAdd,  
    menuCacheAction
};