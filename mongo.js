const mongoose= require("mongoose");

const DB_NAME = "firefly";
const DB_USER = "dbworker";
const DB_PASS = process.argv[2];

const DB_URL = `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.bxdne.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`

function connectDB() {
  mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true });

  const dbCardSchema = new mongoose.Schema({
    name: String,
    type: String,
    working: Boolean,
    broken: Boolean,
    descr: String
  });

  return mongoose.model("system", dbCardSchema);
}

function getCardsFromDB() {
  connectDB().find({}).then(
    res => {
      if (res.length === 0) console.log("systems are empty!");
      else {
        console.log("systems:");
        res.forEach(card => console.log(card));
      }
      mongoose.connection.close();
    }
  )
}

function saveCardToDB(newData) {
  let dbCards = connectDB();

  new dbCards({
    name: newData[3],
    type: newData[4],
    working: false,
    broken: false,
    descr: newData[5]
  }).save().then(() => {
    mongoose.connection.close();
    console.log("Ok!");
  });
}

switch (process.argv.length) {
case 3:
  getCardsFromDB();
  break;
case 6:
  saveCardToDB(process.argv);
  break;
default:
  console.log(
    `Usage: 
          Save card: node mongo.js your_db_pass name type description 
          List cards: node mongo.js your_db_pass`);
  process.exit();
}
