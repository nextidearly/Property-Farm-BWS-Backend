const db = require("../models");
const Holder = db.holders;

// Retrieve holders and inscriptions with pagination
exports.getHoldersAndInscriptions = async (req, res) => {
  try {
    // Validate request parameters
    const { start, limit, address, inscriptionId } = req.body;
    if (
      start === undefined ||
      start === null ||
      limit === undefined ||
      limit === null
    ) {
      return res
        .status(400)
        .send({ message: "Start and limit cannot be empty" });
    }

    // Construct query object
    const query = {};
    if (address) {
      query.address = address;
    }
    if (inscriptionId) {
      query.inscriptionId = inscriptionId;
    }

    // Get total number of holders
    const totalCount = await Holder.countDocuments(query);

    // Retrieve holders with pagination
    const data = await Holder.find(query)
      .skip(parseInt(start))
      .limit(parseInt(limit))
      .exec();

    // Send response
    res.json({
      code: 0,
      msg: "OK",
      data: {
        total: totalCount,
        list: data,
      },
    });
  } catch (error) {
    console.error("Error retrieving holders and inscriptions:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Create and Save a new Holder
exports.create = async (req, res) => {
  try {
    const { address, amount, property } = req.body;

    // Validate request
    if (!address || !amount || !property) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    // Create a new Holder
    const holder = new Holder({
      address,
      amount,
      property,
    });

    // Save Holder in the database
    await holder.save();
    res.json({ code: 0, msg: "OK", data: holder });
  } catch (error) {
    console.error("Error creating holder:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Retrieve all Holders
exports.findAll = async (req, res) => {
  try {
    const holders = await Holder.find().populate("property");
    res.json({ code: 0, msg: "OK", data: holders });
  } catch (error) {
    console.error("Error retrieving holders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Retrieve a single Holder with id
exports.findOne = async (req, res) => {
  try {
    const holder = await Holder.findById(req.params.id).populate("property");
    if (!holder) {
      return res.status(404).json({ message: "Holder not found" });
    }
    res.json({ code: 0, msg: "OK", data: holder });
  } catch (error) {
    console.error("Error retrieving holder:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update a Holder by the id in the request
exports.update = async (req, res) => {
  try {
    const { address, amount, property } = req.body;

    const holder = await Holder.findByIdAndUpdate(
      req.params.id,
      {
        address,
        amount,
        property,
      },
      { new: true, runValidators: true }
    ).populate("property");

    if (!holder) {
      return res.status(404).json({ message: "Holder not found" });
    }

    res.json({ code: 0, msg: "OK", data: holder });
  } catch (error) {
    console.error("Error updating holder:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete a Holder with the specified id in the request
exports.delete = async (req, res) => {
  try {
    const holder = await Holder.findByIdAndDelete(req.params.id);
    if (!holder) {
      return res.status(404).json({ message: "Holder not found" });
    }
    res.json({ code: 0, msg: "OK", data: holder });
  } catch (error) {
    console.error("Error deleting holder:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
