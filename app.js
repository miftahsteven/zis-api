require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const path = require("path");
const cors = require("cors");

const morgan = require("morgan");

app.use(morgan("dev"));

app.use(bodyParser.urlencoded({ extended: true, limit: "100mb", parameterLimit: 50000 }));
app.use(bodyParser.json({ limit: "50mb", extended: true }));


const appRoute = require("./app/routes/route-auth");
const homeRoute = require("./app/routes/route-home");
const userRoute = require("./app/routes/route-account");
const mustahiqRoute = require("./app/routes/route-mustahiq");
const transactionRoute = require("./app/routes/transaction");

console.log(path.join(__dirname, "uploads"));

app.use("/public/uploads", express.static(path.join(__dirname, "uploads/")));

app.use(
  cors({
    origin: ["https://portal.zisindosat.id", "http://localhost:3000"],
  })
);
app.use("/auth", appRoute);
app.use("/home", homeRoute);
app.use("/user", userRoute);
app.use("/mustahiq", mustahiqRoute);
app.use("/transaction", transactionRoute);

app.get("/", (req, res) => {
  res.send("Selamat Datang Di Portal ZISWAF Indosat");
});

app.listen(3034, () => {
  console.log("Server Berjalan di Port : 4800");
});
