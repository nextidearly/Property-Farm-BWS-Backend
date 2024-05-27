const mongoose = require("mongoose");
const db = require("../models");
const PropertyIncome = db.propertyIncomes;

// Create and Save a new PropertyIncome
exports.create = async (req, res) => {
  if (!req.body.amount || !req.body.property) {
    return res
      .status(400)
      .send({ message: "Amount and property are required" });
  }

  const propertyIncome = new PropertyIncome({
    amount: req.body.amount,
    status: req.body.status || 1,
    property: req.body.property,
  });

  try {
    const data = await propertyIncome.save();
    res.send(data);
  } catch (error) {
    res.status(500).send({
      message:
        error.message ||
        "Some error occurred while creating the PropertyIncome.",
    });
  }
};

// Retrieve all PropertyIncomes
exports.findAll = async (req, res) => {
  try {
    const data = await PropertyIncome.find().populate("property");
    res.send(data);
  } catch (error) {
    res.status(500).send({
      message:
        error.message ||
        "Some error occurred while retrieving property incomes.",
    });
  }
};

// Retrieve all PropertyIncomes
exports.findAllByProperty = async (req, res) => {
  console.log("asfa", req.params.id);
  try {
    const id = req.params.id;
    const data = await PropertyIncome.find();
    res.send(data);
  } catch (error) {
    res.status(500).send({
      message:
        error.message ||
        "Some error occurred while retrieving property incomes.",
    });
  }
};

// Find a single PropertyIncome by ID
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await PropertyIncome.findById(id).populate("property");
    if (!data)
      res
        .status(404)
        .send({ message: "Not found PropertyIncome with id " + id });
    else res.send(data);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error retrieving PropertyIncome with id=" + id });
  }
};

// Update a PropertyIncome by the ID
exports.update = async (req, res) => {
  if (!req.body) {
    return res
      .status(400)
      .send({ message: "Data to update can not be empty!" });
  }

  const id = req.params.id;

  try {
    const data = await PropertyIncome.findByIdAndUpdate(id, req.body, {
      useFindAndModify: false,
      new: true,
    });
    if (!data)
      res.status(404).send({
        message: `Cannot update PropertyIncome with id=${id}. Maybe PropertyIncome was not found!`,
      });
    else
      res.send({ message: "PropertyIncome was updated successfully.", data });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error updating PropertyIncome with id=" + id });
  }
};

// Delete a PropertyIncome by the ID
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await PropertyIncome.findByIdAndRemove(id, {
      useFindAndModify: false,
    });
    if (!data)
      res.status(404).send({
        message: `Cannot delete PropertyIncome with id=${id}. Maybe PropertyIncome was not found!`,
      });
    else res.send({ message: "PropertyIncome was deleted successfully!" });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Could not delete PropertyIncome with id=" + id });
  }
};

// Analyze by monthly income
exports.analyzeMonthly = async (req, res) => {
  try {
    const data = await PropertyIncome.aggregate([
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
    const data = await PropertyIncome.aggregate([
      {
        $group: {
          _id: "$property",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } }, // Sort by total amount
    ]).lookup({
      from: "propertyincomes",
      localField: "property",
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
    const data = await PropertyIncome.aggregate([
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
