module.exports = (app) => {
  const inscriptions = require("../controllers/inscription.controller.js");
  const router = require("express").Router();

  // Create a new Inscription
  router.post("/", inscriptions.create);

  // Retrieve all Inscriptions
  router.get("/", inscriptions.findAll);

  // Retrieve all Inscriptions and group by owner
  router.get("/owners/group", inscriptions.findAllAndGroupByOwner);

  // Retrieve a single Inscription with id
  router.get("/:id", inscriptions.findOne);

  // Retrieve a single Inscription with inscriptionId
  router.get("/single/:id", inscriptions.findByInscriptionId);

  // Retrieve inscriptions by property
  router.get("/property/:id", inscriptions.findByProperty);

  // Retrieve inscriptions by property and group by owner
  router.get("/property/group/:id", inscriptions.findByPropertyAndGroupByOwner);

  // Retrieve inscriptions by address
  router.get("/owner/:address", inscriptions.findByOwner);

  // Update an Inscription with id
  router.put("/:id", inscriptions.update);

  // Delete an Inscription with id
  router.delete("/:id", inscriptions.delete);

  // Delete all Inscriptions
  router.delete("/", inscriptions.deleteAll);

  app.use("/api/inscriptions", router);
};
