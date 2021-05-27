//const configs = require("./utils/configs"); 
// const mongoose = require("mongoose");
// const mongoUrl = configs.MONGO_DB_URL;
//mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

//initiate global cache objects for Clients and Menu Items that are assignes to them
const { menuCacheInit } = require("./store/menu_store");
menuCacheInit();
//cache object for systems game
const { systemsCacheInit, systemsCycleAction } = require("./store/systems_store");
systemsCacheInit();
//cache object for pilot game
const { pilotCacheInit,pilotCycleAction } = require("./store/pilot_store");
pilotCacheInit();
const { soundsCacheInit } = require("./store/sounds_store");
soundsCacheInit();

setInterval(()=>{
    systemsCycleAction();
    pilotCycleAction();
},10000);



const express = require("express");
const usersRouter=require("./controllers/users.js");
const adminsRouter=require("./controllers/admins.js");

const app = express();
const cors = require("cors");

app.use("/",express.static('buildUser'));
app.use("/adminko",express.static(__dirname + '/buildAdminko'));


console.log("DIRNAME: "+__dirname );

app.use(cors());
app.use(express.json());

app.use("/api/users",usersRouter);
app.use("/api/adminko",adminsRouter);

module.exports = app;