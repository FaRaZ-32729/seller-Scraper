const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const scrapeRoute = require("./src/routes/scrapeRoute");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use("/api", scrapeRoute);

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});