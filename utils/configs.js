require("dotenv").config();

console.log("The enviroment: ",  process.env.NODE_ENV);

let MONGO_DB_URL=process.env.MONGO_DB_URL;
const SERVER_PORT=process.env.PORT;

if(process.env.NODE_ENV==="test") 
{
    MONGO_DB_URL = process.env.MONGO_DB_TEST_URL;
}
module.exports={
  MONGO_DB_URL,
  SERVER_PORT
}