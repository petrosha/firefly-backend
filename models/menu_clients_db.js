const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const dbClientSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    menuList: [String]
});

dbClientSchema.plugin(uniqueValidator);

module.exports = mongoose.model("menuClient", dbClientSchema);
