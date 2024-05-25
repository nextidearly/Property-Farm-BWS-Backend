const db = require("../models");
const UserIncome = db.userIncomes;
const mongoose = require("mongoose");

// Create and Save a new UserIncome
exports.create = async (req, res) => {
  if (!req.body.amount || !req.body.address || !req.body.property) {
    return res
      .status(400)
      .send({ message: "Amount, address, and property are required" });
  }

  const userIncome = new UserIncome({
    amount: req.body.amount,
    address: req.body.address,
    property: req.body.property,
  });

  try {
    const data = await userIncome.save();
    res.send(data);
  } catch (error) {
    res.status(500).send({
      message:
        error.message || "Some error occurred while creating the UserIncome.",
    });
  }
};

// Retrieve all UserIncomes
exports.findAll = async (req, res) => {
  try {
    const data = await UserIncome.find().populate("property");
    res.send(data);
  } catch (error) {
    res.status(500).send({
      message:
        error.message || "Some error occurred while retrieving user incomes.",
    });
  }
};

// Analyze by address
exports.findByAddressAndAnalyzeByAddress = async (req, res) => {
  const address = req.params.address;
  try {
    const data = await UserIncome.aggregate([
      {
        $match: { address: address },
      },
      {
        $group: {
          _id: "$address",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);
    res.send(data);
  } catch (error) {
    res.status(500).send({ message: "Error analyzing income by address" });
  }
};

// Analyze by address
exports.findByPropertyAndAnalyzeByAddress = async (req, res) => {
  const id = req.params.id;
  try {
    const data = await UserIncome.aggregate([
      {
        $match: { property: mongoose.Types.ObjectId(id) },
      },
      {
        $group: {
          _id: "$address",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);
    res.send(data);
  } catch (error) {
    res.status(500).send({ message: "Error analyzing income by address" });
  }
};

// Analyze by amount
exports.findByAddressAndAnalyzeByAmount = async (req, res) => {
  const address = req.params.address;

  try {
    const data = await UserIncome.aggregate([
      {
        $match: { property: address },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          avgAmount: { $avg: "$amount" },
          maxAmount: { $max: "$amount" },
          minAmount: { $min: "$amount" },
        },
      },
    ]);
    res.send(data);
  } catch (error) {
    res.status(500).send({ message: "Error analyzing income by amount" });
  }
};

// Analyze by amount
exports.findByPropertyAndAnalyzeByAmount = async (req, res) => {
  const id = req.params.id;
  try {
    const data = await UserIncome.aggregate([
      {
        $match: { property: mongoose.Types.ObjectId(id) },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          avgAmount: { $avg: "$amount" },
          maxAmount: { $max: "$amount" },
          minAmount: { $min: "$amount" },
        },
      },
    ]);
    res.send(data);
  } catch (error) {
    res.status(500).send({ message: "Error analyzing income by amount" });
  }
};

// Find a single UserIncome by ID
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await UserIncome.findById(id).populate("property");
    if (!data)
      res.status(404).send({ message: "Not found UserIncome with id " + id });
    else res.send(data);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error retrieving UserIncome with id=" + id });
  }
};

// Update a UserIncome by the ID
exports.update = async (req, res) => {
  if (!req.body) {
    return res
      .status(400)
      .send({ message: "Data to update can not be empty!" });
  }

  const id = req.params.id;

  try {
    const data = await UserIncome.findByIdAndUpdate(id, req.body, {
      useFindAndModify: false,
      new: true,
    });
    if (!data)
      res.status(404).send({
        message: `Cannot update UserIncome with id=${id}. Maybe UserIncome was not found!`,
      });
    else res.send({ message: "UserIncome was updated successfully.", data });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error updating UserIncome with id=" + id });
  }
};

// Delete a UserIncome by the ID
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await UserIncome.findByIdAndRemove(id, {
      useFindAndModify: false,
    });
    if (!data)
      res.status(404).send({
        message: `Cannot delete UserIncome with id=${id}. Maybe UserIncome was not found!`,
      });
    else res.send({ message: "UserIncome was deleted successfully!" });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Could not delete UserIncome with id=" + id });
  }
};

// Analyze by address
exports.analyzeByAddress = async (req, res) => {
  try {
    const data = await UserIncome.aggregate([
      {
        $group: {
          _id: "$address",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);
    res.send(data);
  } catch (error) {
    res.status(500).send({ message: "Error analyzing income by address" });
  }
};

// Analyze by monthly income
exports.analyzeMonthly = async (req, res) => {
  try {
    const data = await UserIncome.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // Sort by month
    ]);
    res.send(data);
  } catch (error) {
    res.status(500).send({ message: "Error analyzing monthly income" });
  }
};

// Analyze by property
exports.analyzeByProperty = async (req, res) => {
  try {
    const data = await UserIncome.aggregate([
      {
        $group: {
          _id: "$property",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } }, // Sort by total amount
    ]).lookup({
      from: "properties",
      localField: "_id",
      foreignField: "_id",
      as: "propertyDetails",
    });
    res.send(data);
  } catch (error) {
    res.status(500).send({ message: "Error analyzing income by property" });
  }
};

// Analyze by amount
exports.analyzeByAmount = async (req, res) => {
  try {
    const data = await UserIncome.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          avgAmount: { $avg: "$amount" },
          maxAmount: { $max: "$amount" },
          minAmount: { $min: "$amount" },
        },
      },
    ]);
    res.send(data);
  } catch (error) {
    res.status(500).send({ message: "Error analyzing income by amount" });
  }
};
