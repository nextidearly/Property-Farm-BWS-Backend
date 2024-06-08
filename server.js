require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");
const mempoolJS = require("@mempool/mempool.js");
const app = express();
const path = require("path");

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const inscriptons = require("./app/controllers/inscription.controller.js");

// Create a set to store connected clients
const clients = new Set();

wss.on("connection", (ws) => {

  // Add the connected client to the set
  clients.add(ws);

  ws.on("message", (message) => {
    console.log("Received:", message);

    // Broadcast the message to all clients
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`Server received: ${message}`);
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    // Remove the disconnected client from the set
    clients.delete(ws);
  });

  const message = {
    eventName: "connected",
    data: {
      msg: "Welcome to the WebSocket server!",
    },
  };
  ws.send(JSON.stringify(message));
});

global.wss = wss;

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Serve images from a directory
app.use("/property", express.static(path.join(__dirname, "property")));

const db = require("./app/models");
db.mongoose.set("strictQuery", false);
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Tokeized Real Estate Shares on Bitcoin Blockchains.",
  });
});

require("./app/routes/property.routes")(app);
require("./app/routes/inscription.routes")(app);
require("./app/routes/order.routes")(app);
require("./app/routes/propertyIncome.routes")(app);
require("./app/routes/userIncome.routes")(app);

async function listenNewBlock() {
  const {
    bitcoin: { websocket },
  } = mempoolJS({
    hostname: "mempool.space",
  });

  const ws = websocket.initServer({
    options: ["blocks"],
  });

  ws.on("message", function incoming(data) {
    const res = JSON.parse(data.toString());
    if (res.block) {
      console.log("---new block--");
      inscriptons.updateHolders();
      inscriptons.fetchAndAddNewInscriptions();
    }
  });
}

// set port, listen for requests
const PORT = process.env.PORT || 3006;

server.listen(PORT, () => {
  listenNewBlock()
  console.log(`Server is running on port ${PORT}.`);
});
