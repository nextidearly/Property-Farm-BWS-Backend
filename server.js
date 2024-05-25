require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");
const multer = require("multer");
const path = require("path");

const app = express();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Create a set to store connected clients
const clients = new Set();

wss.on("connection", (ws) => {
  console.log("Client connected");

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

var corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Serve images from a directory
app.use("/property", express.static(path.join(__dirname, "property")));

// Setup multer to handle file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append extension to the file
  },
});

const upload = multer({ storage });

// File upload endpoint
app.post("/upload", upload.single("image"), (req, res) => {
  res
    .status(200)
    .json({ message: "Image uploaded successfully", filePath: req.file.path });
});

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
require("./app/routes/ordinal.routes")(app);
require("./app/routes/holder.routes")(app);
require("./app/routes/user.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 3006;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
