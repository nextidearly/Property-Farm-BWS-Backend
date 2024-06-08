module.exports = (app) => {
  const properties = require("../controllers/property.controller.js");
  const router = require("express").Router();

  // Create a new Inscription
  router.post("/", properties.create);

  // Retrieve all properties
  router.get("/", properties.findAll);

  // Retrieve all live properties
  router.get("/live", properties.findAllLives);

  // Retrieve all past properties
  router.get("/past", properties.findAllPasts);

  // Retrieve a single propertie with id
  router.get("/:id", properties.findOne);

  // Update an propertie with id
  router.put("/:id", properties.update);

  // Delete an propertieF with id
  router.delete("/:id", properties.delete);

  app.use("/api/properties", router);
};
