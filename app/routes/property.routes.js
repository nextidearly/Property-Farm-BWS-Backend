module.exports = (app) => {
  const properties = require("../controllers/property.controller.js");
  var router = require("express").Router();

  // Create a new Property
  router.post("/", properties.create);

  // Retrieve all Properties
  router.get("/", properties.findAll);

  // Retrieve a single Property with id
  router.get("/:id", properties.findOne);

  // Update a Property with id
  router.put("/:id", properties.update);

  // Delete a Property with id
  router.delete("/:id", properties.delete);

  app.use("/api/properties", router);
};
