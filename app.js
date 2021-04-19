const configs = require("./utils/configs"); 

// const mongoose = require("mongoose");
// const mongoUrl = configs.MONGO_DB_URL;
//mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

//initiate global cache objects for Clients and Menu Items that are assignes to them
const { menuCacheInit } = require("./store/menu_store");
menuCacheInit();
//cache object for systems game
const { systemsCacheInit } = require("./store/systems_store");
systemsCacheInit();

const express = require("express")
const usersRouter=require("./controllers/users.js")
const adminsRouter=require("./controllers/admins.js")

const app = express();
const cors = require("cors");

app.use(cors())
app.use(express.json())

app.use("/api/users",usersRouter);
app.use("/api/adminko",adminsRouter);

module.exports = app;