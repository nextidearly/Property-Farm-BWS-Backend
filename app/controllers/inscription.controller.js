const mongoose = require("mongoose");
const db = require("../models");
const Inscription = db.inscriptions;
const Order = db.orders;

const propertyController = require("./property.controller.js");


// Function to process pending mint requests
const processMintQueue = async (mintQueue) => {
  try {
    // If queue is empty or already processing, return
    if (mintQueue.length === 0 || processMintQueue.isProcessing) {
      console.log(
        mintQueue.length === 0
          ? "--------------Finished--------------"
          : "--------------processing--------------"
      );
      return;
    }

    // Mark processing flag as true
    processMintQueue.isProcessing = true;

    // Dequeue next mint request
    const { orderId, property } = mintQueue.shift();

    // Function to periodically check mint order status
    const checkStatus = async () => {
      console.log(
        "==============================================================================="
      );
      console.log("mintQueue length: ", mintQueue.length);
      try {
        // Check mint order status using transaction ID
        const response = await fetch(
          `https://open-api.unisat.io/v2/inscribe/order/${orderId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.UNISAT_OPENAPK_KEY}`,
              accept: "application/json",
            },
          }
        );

        const orderData = await response.json();

        console.log("orderId: ", orderId);

        if (orderData.code === 0 && !orderData.data) {
          console.log("invalid orderId");
          processNext();
          return;
        }

        if (orderData.code === -1) {
          console.log(orderData.msg);
          processNext();
          return;
        }

        console.log("status: ", orderData.data?.status);

        if (orderData.data.status === "pending") {
          processNext();
          return;
        }

        if (orderData.data.status === "closed") {
          await updateOrderStatus(orderId, orderData.data);
          processNext();
          return;
        }

        if (orderData.data.status === "minted") {
          console.log("minted: ", orderData.data.files.length);
          await handleMintedStatus(orderData.data, property);
          processNext();
          return;
        }

        processNext();
        return;
      } catch (error) {
        console.log("Api is crashed, Checking again in 10 seconds.", error);
        setTimeout(checkStatus, 10000);
      }
    };

    const processNext = () => {
      processMintQueue.isProcessing = false; // Mark processing as false
      processMintQueue(mintQueue); // Process next request in queue
    };

    const updateOrderStatus = async (orderId, data) => {
      const updatedOrder = await Order.findOneAndUpdate(
        { orderId: orderId },
        { $set: data },
        { new: true }
      );

      if (updatedOrder) {
        console.log("updated successfully");
      } else {
        console.log("not updated");
      }
    };

    const handleMintedStatus = async (data, property) => {
      for (const file of data.files) {
        const holder = new Inscription({
          inscriptionId: file?.inscriptionId,
          owner: data.receiveAddress,
          property: property,
        });
        const newHolder = await holder.save();
        console.log("saved: ", newHolder._id);
      }
      await propertyController.updateForSold(property, data.files.length)
      await updateOrderStatus(data.orderId, data);
    };

    // Start checking mint order status
    checkStatus();
  } catch (error) {
    console.error("Error minting NFT:", error);
    processMintQueue.isProcessing = false; // Mark processing as false
  }
};

exports.fetchAndAddNewInscriptions = async () => {
  const mintQueue = await Order.find({ status: "pending" });

  if (mintQueue.length) {
    processMintQueue(mintQueue);
  }
};

//update holders
exports.updateHolders = async () => {
  try {
    const inscriptions = await Inscription.find().populate("property");

    // Function to fetch data with retries
    const fetchDataWithRetries = async (
      _id,
      inscriptionId,
      originalOwner,
      property,
      retryCount
    ) => {
      try {
        const res = await fetch(
          `${process.env.ORD_SERVER || "http://0.0.0.0:80"
          }/inscription/${inscriptionId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );
        const inscriptionData = await res.json();

        inscriptionData.address !== originalOwner
        if (inscriptionData.address !== originalOwner) {
          const updated = await Inscription.findByIdAndUpdate(_id, { owner: inscriptionData.address }, {
            useFindAndModify: false,
            new: true,
          });
          if (updated) {
            console.log(inscriptionData.address !== originalOwner);
          }
        } else {

        }
      } catch (error) {
        if (retryCount < 3) {
          console.log(error);
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay between retries (1 seconds)
          await fetchDataWithRetries(
            inscriptionId,
            originalOwner,
            property,
            retryCount + 1
          );
        } else {

        }
      }
    };

    // Loop through inscription IDs and fetch data
    for (const data of inscriptions) {
      await fetchDataWithRetries(
        data._id,
        data.inscriptionId,
        data.owner,
        data.property._id,
        0
      );
    }
    updating = false;
  } catch (error) {
    console.error(error);
  }
};

// Create and Save a new Inscription
exports.create = async (req, res) => {
  try {
    if (!req.body.inscriptionId || !req.body.owner || !req.body.property) {
      return res.status(400).send({ message: "Content can not be empty!" });
    }

    const inscription = new Inscription({
      inscriptionId: req.body.inscriptionId,
      owner: req.body.owner,
      property: req.body.property,
    });

    const data = await inscription.save();
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while creating the Inscription.",
    });
  }
};

// Retrieve all Inscriptions from the database.
exports.findAll = async (req, res) => {
  try {
    const data = await Inscription.find().populate("property");
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving inscriptions.",
    });
  }
};

// Find a single Inscription with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Inscription.findById(id).populate("property");

    if (!data) {
      return res
        .status(404)
        .send({ message: "Not found Inscription with id " + id });
    }
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error retrieving Inscription with id=" + id,
    });
  }
};

// Find a inscriptions by inscriptonId
exports.findByInscriptionId = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Inscription.find({ inscriptionId: id }).populate(
      "property"
    );

    if (!data) {
      return res
        .status(404)
        .send({ message: "Not found Inscription with id " + id });
    }
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error retrieving Inscription with id=" + id,
    });
  }
};

// Find a inscriptions by property
exports.findByProperty = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Inscription.find({ property: id }).populate("property");

    if (!data) {
      return res
        .status(404)
        .send({ message: "Not found Inscription with id " + id });
    }
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error retrieving Inscription with id=" + id,
    });
  }
};

// Find a inscriptions by property
// Find inscriptions by property and group by owner, sorted by amount
exports.findByPropertyAndGroupByOwner = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Inscription.aggregate([
      {
        $match: { property: mongoose.Types.ObjectId(id) },
      },
      {
        $group: {
          _id: "$owner",
          amount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          owner: "$_id",
          amount: 1,
        },
      },
      {
        $sort: { amount: -1 }, // Sort by amount in descending order
      },
    ]);

    if (!data.length) {
      return res
        .status(404)
        .send({ message: "Not found Inscription with id " + id });
    }
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error retrieving Inscription with id=" + id,
    });
  }
};


// Find all inscriptions and group by owner
exports.findAllAndGroupByOwner = async (req, res) => {
  try {
    const data = await Inscription.aggregate([
      {
        $group: {
          _id: "$owner",
          amount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          owner: "$_id",
          amount: 1,
        },
      },
    ]);

    if (data.length === 0) {
      return res.status(404).send({ message: "No inscriptions found" });
    }

    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error retrieving inscriptions",
    });
  }
};

// Find a Inscriptions by address
exports.findByOwner = async (req, res) => {
  try {
    const address = req.params.address;
    const data = await Inscription.find({ owner: address }).populate(
      "property"
    );

    if (!data) {
      return res
        .status(404)
        .send({ message: "Not found Inscription with id " + id });
    }
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error retrieving Inscription with id=" + id,
    });
  }
};

// Update an Inscription by the id in the request
exports.update = async (req, res) => {
  try {
    const id = req.params.id;

    const data = await Inscription.findByIdAndUpdate(id, req.body, {
      useFindAndModify: false,
      new: true,
    });

    if (!data) {
      return res.status(404).send({
        message: `Cannot update Inscription with id=${id}. Maybe Inscription was not found!`,
      });
    }

    res.send({ message: "Inscription was updated successfully.", data });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error updating Inscription with id=" + id,
    });
  }
};

// Delete an Inscription with the specified id in the request
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    const data = await Inscription.findByIdAndRemove(id, {
      useFindAndModify: false,
    });

    if (!data) {
      return res.status(404).send({
        message: `Cannot delete Inscription with id=${id}. Maybe Inscription was not found!`,
      });
    }

    res.send({
      message: "Inscription was deleted successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Could not delete Inscription with id=" + id,
    });
  }
};

// Delete all Inscriptions from the database.
exports.deleteAll = async (req, res) => {
  try {
    const data = await Inscription.deleteMany({});
    res.send({
      message: `${data.deletedCount} Inscriptions were deleted successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while removing all inscriptions.",
    });
  }
};
