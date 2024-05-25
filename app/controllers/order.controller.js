const db = require("../models");
const Order = db.orders;

// Create and Save a new Order
exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.orderId || !req.body.property) {
      return res
        .status(400)
        .send({ message: "OrderId and Property can not be empty!" });
    }

    // Create a new Order
    const order = new Order({
      property: req.body.property,
      orderId: req.body.orderId,
      status: req.body.status,
      payAddress: req.body.payAddress,
      receiveAddress: req.body.receiveAddress,
      amount: req.body.amount,
      paidAmount: req.body.paidAmount,
      outputValue: req.body.outputValue,
      feeRate: req.body.feeRate,
      minerFee: req.body.minerFee,
      serviceFee: req.body.serviceFee,
      files: req.body.files,
      count: req.body.count,
      pendingCount: req.body.pendingCount,
      unconfirmedCount: req.body.unconfirmedCount,
      confirmedCount: req.body.confirmedCount,
      createTime: req.body.createTime,
      devFee: req.body.devFee,
    });

    // Save Order in the database
    const data = await order.save();
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the Order.",
    });
  }
};

// Retrieve all Orders from the database
exports.findAll = async (req, res) => {
  try {
    const orders = await Order.find().populate("property");
    res.send(orders);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving orders.",
    });
  }
};

// Find a single Order with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const order = await Order.findById(id).populate("property");

    if (!order) {
      return res.status(404).send({ message: "Order not found with id " + id });
    }

    res.send(order);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error retrieving Order with id=" + id,
    });
  }
};

// Update an Order by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    const order = await Order.findByIdAndUpdate(id, req.body, {
      useFindAndModify: false,
      new: true,
    }).populate("property");

    if (!order) {
      return res
        .status(404)
        .send({
          message: `Cannot update Order with id=${id}. Maybe Order was not found!`,
        });
    }

    res.send(order);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error updating Order with id=" + id,
    });
  }
};

// Delete an Order with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const order = await Order.findByIdAndRemove(id, {
      useFindAndModify: false,
    });

    if (!order) {
      return res
        .status(404)
        .send({
          message: `Cannot delete Order with id=${id}. Maybe Order was not found!`,
        });
    }

    res.send({ message: "Order was deleted successfully!" });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Could not delete Order with id=" + id,
    });
  }
};

// Delete all Orders from the database
exports.deleteAll = async (req, res) => {
  try {
    const data = await Order.deleteMany({});
    res.send({
      message: `${data.deletedCount} Orders were deleted successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while removing all orders.",
    });
  }
};
