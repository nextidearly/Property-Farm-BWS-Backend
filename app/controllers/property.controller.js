const WebSocket = require("ws");
const db = require("../models");
const Property = db.properties;

// Create and Save a new Property
exports.create = async (req, res) => {
  try {
    const {
      title,
      description,
      supply,
      price,
      inscriptionId,
      sold,
      imageURL,
      status,
      startsIn,
    } = req.body;

    // Validate request
    if (!title || !description || !supply || !price || !inscriptionId) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    // Create a new Property
    const property = new Property({
      title,
      description,
      supply,
      price,
      inscriptionId,
      sold: sold || 0,
      imageURL,
      status: status || "active",
      startsIn: startsIn || "",
    });

    // Save Property in the database
    await property.save();
    res.json({ code: 0, msg: "OK", data: property });
  } catch (error) {
    console.error("Error creating property:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Retrieve all Properties
exports.findAll = async (req, res) => {
  try {
    const properties = await Property.find();
    res.json({ code: 0, msg: "OK", data: properties });
  } catch (error) {
    console.error("Error retrieving properties:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Retrieve a single Property with id
exports.findOne = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.json({ code: 0, msg: "OK", data: property });
  } catch (error) {
    console.error("Error retrieving property:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update a Property by the id in the request
exports.update = async (req, res) => {
  try {
    const {
      title,
      description,
      supply,
      price,
      inscriptionId,
      sold,
      imageURL,
      status,
      startsIn,
      soldShareAmount,
    } = req.body;

    // Find the property by id
    const property = await Property.findById(req.params.id);

    // If the property doesn't exist, return a 404 error
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Update the property fields
    property.title = title !== undefined ? title : property.title;
    property.description =
      description !== undefined ? description : property.description;
    property.supply = supply !== undefined ? supply : property.supply;
    property.price = price !== undefined ? price : property.price;
    property.inscriptionId =
      inscriptionId !== undefined ? inscriptionId : property.inscriptionId;
    property.sold = sold !== undefined ? sold : property.sold;
    property.imageURL = imageURL !== undefined ? imageURL : property.imageURL;
    property.status = status !== undefined ? status : property.status;
    property.startsIn = startsIn !== undefined ? startsIn : property.startsIn;

    // If soldShareAmount exists, update the sold field
    if (soldShareAmount !== undefined) {
      property.sold = (property.sold || 0) + soldShareAmount;
    }

    // Save the updated property
    await property.save();

    // Send the update through WebSocket if available and soldShareAmount exists
    if (global.wss) {
      global.wss.clients.forEach((client) => {
        if (
          client.readyState === WebSocket.OPEN &&
          soldShareAmount !== undefined
        ) {
          const message = {
            eventName: "sold",
            data: {
              amount: soldShareAmount,
            },
          };
          client.send(JSON.stringify(message));
        }
      });

      console.log(`sold ${soldShareAmount} share(s)`);
    } else {
      console.log("WebSocket server is not available");
    }

    // Respond with the updated property
    res.json({ code: 0, msg: "OK", data: property });
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete a Property with the specified id in the request
exports.delete = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.json({ code: 0, msg: "OK", data: property });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
