module.exports = (app) => {
  const inscriptions = require("../controllers/inscription.controller.js");
  const router = require("express").Router();

  // Create a new Inscription
  router.post("/", inscriptions.create);

  // Retrieve all Inscriptions
  router.get("/", inscriptions.findAll);

  // Retrieve a single Inscription with id
  router.get("/:id", inscriptions.findOne);

  // Update an Inscription with id
  router.put("/:id", inscriptions.update);

  // Delete an Inscription with id
  router.delete("/:id", inscriptions.delete);

  // Delete all Inscriptions
  router.delete("/", inscriptions.deleteAll);

  app.use("/api/inscriptions", router);
};
