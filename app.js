"use strict"

var express = require("express");
var bodyParser = require("body-parser");
var userRoutes = require("./routes/user.route");

var app = express();

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use("/v1",userRoutes);



module.exports = app;