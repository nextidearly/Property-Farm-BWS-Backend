module.exports = (app) => {
  const userIncomes = require("../controllers/userIncome.controller.js");

  var router = require("express").Router();

  // Create a new UserIncome
  router.post("/", userIncomes.create);

  // Retrieve all UserIncomes
  router.get("/", userIncomes.findAll);

  // Retrieve a single UserIncome with id
  router.get("/:id", userIncomes.findOne);

  // Update a UserIncome with id
  router.put("/:id", userIncomes.update);

  // Delete a UserIncome with id
  router.delete("/:id", userIncomes.delete);

  // Analyze income by address
  router.get("/analyze/address", userIncomes.analyzeByAddress);

  // Analyze monthly income
  router.get("/analyze/monthly", userIncomes.analyzeMonthly);

  // Analyze income by property
  router.get("/analyze/property", userIncomes.analyzeByProperty);

  // Analyze income by amount
  router.get("/analyze/amount", userIncomes.analyzeByAmount);

  // find by property and Analyze income by address
  router.get("/analyze/address/:address", userIncomes.findByAddressAndAnalyzeByAddress);

  // find by property and Analyze income by address
  router.get("/analyze/property/:id", userIncomes.findByPropertyAndAnalyzeByAddress);

  // find by address and  Analyze income by amount
  router.get("/analyze/amount/address/:address", userIncomes.findByAddressAndAnalyzeByAmount);

  // find by property an Analyze income by amount
  router.get("/analyze/amount/property/:id", userIncomes.findByPropertyAndAnalyzeByAmount);

  app.use("/api/userIncomes", router);
};
