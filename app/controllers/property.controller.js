const WebSocket = require("ws");
const db = require("../models");
const Property = db.properties;
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, "./../../property");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Directory where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, req.body.inscriptionId + ".jpg"); // Append extension to the file
  },
});

// File type validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Error: Images Only!"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
  fileFilter: fileFilter,
});

// Create and Save a new Property
exports.create = async (req, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const {
        title,
        description,
        supply,
        price,
        inscriptionId,
        sold,
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
        imageURL: req.file ? `/property/${req.file.originalname}` : "",
        status: status,
        startsIn: startsIn || Date.now(),
      });

      // Save Property in the database
      await property.save();
      res.json({ code: 0, msg: "OK", data: property });
    } catch (error) {
      console.error("Error creating property:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
};

// Retrieve all Properties
exports.findAll = async (req, res) => {
  try {
    const properties = await Property.find().sort({ updatedAt: -1 });
    res.json({ code: 0, msg: "OK", data: properties });
  } catch (error) {
    console.error("Error retrieving properties:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Retrieve all live Properties
exports.findAllLives = async (req, res) => {
  try {
    const properties = await Property.find({ status: 0 }).sort({ updatedAt: -1 });
    res.json({ code: 0, msg: "OK", data: properties });
  } catch (error) {
    console.error("Error retrieving properties:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Retrieve all past Properties
exports.findAllPasts = async (req, res) => {
  try {
    const properties = await Property.find({ status: 1 }).sort({ updatedAt: -1 });
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

    // Respond with the updated property
    res.json({ code: 0, msg: "OK", data: property });
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//updates for sold
exports.updateForSold = async (id, amount) => {
  try {
    // Use findByIdAndUpdate with the $inc operator to increment the sold amount
    const updatedProperty = await Property.findByIdAndUpdate(
      mongoose.Types.ObjectId(id),
      { $inc: { sold: amount } },
      { new: true } // Return the updated document
    );

    if (!updatedProperty) {
      return { message: "Not found Property with id " + id };
    }

    // Send the update through WebSocket if available and soldShareAmount exists
    if (global.wss) {
      global.wss.clients.forEach((client) => {
        if (
          client.readyState === WebSocket.OPEN
        ) {

          const message = {
            eventName: "sold",
            data: {
              id, amount,
            },
          };

          client.send(JSON.stringify(message));
        }
      });

      console.log(`sold ${soldShareAmount} share(s)`);
    } else {
      console.log("WebSocket server is not available");
    }

  } catch (err) {
    return { message: err.message || "Error updating Property with id=" + id };
  }
}

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
