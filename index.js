"use strict"

var mongoose = require("mongoose");
var app = require("./app");
var port = 3200;

mongoose.Promise = global.Promise;
mongoose.set("useFindAndModify",false);
mongoose.connect("mongodb://localhost:27017/DBControlAlumnos", {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=>{
    console.log("Conectado a la BD");
    app.listen(port,()=>{
        console.log("El servidor se esta ejecutando");
    })
})
.catch((err)=>{
    console.log("Error al conectarse a la BD",err);
})