module.exports = (app) => {
  const propertyIncomes = require("../controllers/propertyIncome.controller.js");

  var router = require("express").Router();

  // Create a new PropertyIncome
  router.post("/", propertyIncomes.create);

  // Retrieve all PropertyIncomes
  router.get("/", propertyIncomes.findAll);

  // Retrieve a single PropertyIncome with id
  router.get("/:id", propertyIncomes.findOne);

  // Update a PropertyIncome with id
  router.put("/:id", propertyIncomes.update);

  // Delete a PropertyIncome with id
  router.delete("/:id", propertyIncomes.delete);

  // Analyze monthly income
  router.get("/analyze/monthly", propertyIncomes.analyzeMonthly);

  // Analyze income by property
  router.get("/analyze/property", propertyIncomes.analyzeByProperty);

  // Analyze income by amount
  router.get("/analyze/amount", propertyIncomes.analyzeByAmount);

  app.use("/api/propertyIncomes", router);
};
