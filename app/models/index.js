const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.orders = require("./order.model.js")(mongoose);
db.properties = require("./property.model.js")(mongoose);
db.inscriptions = require("./inscription.model.js")(mongoose);
db.propertyIncomes = require("./propertyIncome.model.js")(mongoose);
db.userIncomes = require("./userIncome.model.js")(mongoose);

module.exports = db;
